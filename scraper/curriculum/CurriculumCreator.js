const { ScraperError, ErrorTypes, ErrorCodes } = require('../config/ErrorCodes');

/**
 * Classe responsável por criar novos currículos no Selecty
 */
class CurriculumCreator {
  constructor(config) {
    this.config = config;
    const configData = config.getConfig();
    this.timeout = configData.scraper.timeout;
  }

  /**
   * Cria um novo currículo no Selecty
   * @param {Page} page - Instância da página do Puppeteer
   * @param {Object} curriculumData - Dados do currículo a ser criado
   * @returns {Promise<Object>} Resultado da criação
   */
  async createCurriculum(page, curriculumData) {
    try {
      console.log('\n📝 Iniciando criação de currículo...');
      
      // Navegar para página de currículos
      await this.navigateToCurriculumPage(page);
      
      // Clicar no botão "Novo currículo"
      await this.clickNewCurriculum(page);
      
      // Selecionar tipo de currículo (Express para teste rápido ou Completo)
      await this.selectCurriculumType(page, curriculumData.tipo || 'express');
      
      // Preencher dados pessoais
      await this.fillPersonalData(page, curriculumData);
      await page.screenshot({ path: `./debug-1-personal-${Date.now()}.png`, fullPage: true });
      
      // Preencher dados de contato
      await this.fillContactData(page, curriculumData);
      await page.screenshot({ path: `./debug-2-contact-${Date.now()}.png`, fullPage: true });
      
      // Preencher endereço
      await this.fillAddressData(page, curriculumData);
      await page.screenshot({ path: `./debug-3-address-${Date.now()}.png`, fullPage: true });
      
      // Preencher perfil profissional (se fornecido)
      if (curriculumData.perfilProfissional) {
        await this.fillProfessionalProfile(page, curriculumData.perfilProfissional);
        await page.screenshot({ path: `./debug-4-professional-${Date.now()}.png`, fullPage: true });
      }
      
      // Preencher perfil educacional (se fornecido)
      if (curriculumData.perfilEducacional) {
        await this.fillEducationalProfile(page, curriculumData.perfilEducacional);
        await page.screenshot({ path: `./debug-5-education-${Date.now()}.png`, fullPage: true });
      }
      
      // Preencher referências (opcional)
      if (curriculumData.referencias) {
        await this.fillReferences(page, curriculumData.referencias);
      }
      
      // Screenshot antes de salvar (para ver todos os campos preenchidos e erros)
      await page.screenshot({ path: `./debug-6-before-save-${Date.now()}.png`, fullPage: true });
      console.log('  📸 Screenshots de debug salvos em ./debug-*.png');
      
      // Salvar currículo
      const saveResult = await this.saveCurriculum(page);
      
      // Verificar se foi realmente criado na listagem
      const verificationResult = await this.verifyCurriculumCreated(page, curriculumData.nome);
      
      const result = {
        ...saveResult,
        verified: verificationResult.found,
        verificationMessage: verificationResult.message
      };
      
      if (verificationResult.found) {
        console.log('✅ Currículo criado e verificado com sucesso!');
      } else {
        console.log('⚠️ Currículo foi processado mas não foi encontrado na listagem');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao criar currículo:', error.message);
      throw error;
    }
  }

  /**
   * Navega para a página de currículos
   */
  async navigateToCurriculumPage(page) {
    console.log('  Navegando para página de currículos...');
    await page.goto('https://selecty.app/curriculum/index', { 
      waitUntil: 'networkidle2',
      timeout: this.timeout 
    });
    await this.sleep(2000);
    console.log('  ✓ Página de currículos carregada');
  }

  /**
   * Clica no botão "Novo currículo"
   */
  async clickNewCurriculum(page) {
    console.log('  Clicando em "Novo currículo"...');
    
    const selectors = [
      'a:has-text("Novo currículo")',
      'main a > span',
      'a[href*="curriculum/create"]',
      '.btn-primary:has-text("Novo")',
      '::-p-text(Novo currículo)'
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { visible: true, timeout: 3000 });
        await page.click(selector);
        clicked = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      // Fallback: clicar por texto
      clicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const novoBtn = links.find(el => el.textContent.includes('Novo currículo'));
        if (novoBtn) {
          novoBtn.click();
          return true;
        }
        return false;
      });
    }
    
    if (!clicked) {
      throw new Error('Botão "Novo currículo" não encontrado');
    }
    
    // Aguardar formulário carregar (não esperar navegação pois pode ser AJAX/SPA)
    console.log('  Aguardando formulário carregar...');
    await this.sleep(3000);
    
    // Verificar se o formulário apareceu
    try {
      await page.waitForSelector('#cv_name, #cpf, [id*="collapse_personal"]', { visible: true, timeout: 10000 });
      console.log('  ✓ Formulário de novo currículo carregado');
    } catch (e) {
      // Se não encontrou, tentar navegar diretamente
      console.log('  Formulário não encontrado, navegando diretamente...');
      await page.goto('https://selecty.app/curriculum/create', { waitUntil: 'networkidle2', timeout: this.timeout });
      await this.sleep(2000);
    }
  }

  /**
   * Seleciona o tipo de currículo (express ou completo)
   * @param {string} tipo - 'express' (padrão) ou 'completo'
   */
  async selectCurriculumType(page, tipo = 'express') {
    console.log(`  Selecionando tipo de currículo: ${tipo}...`);
    
    if (tipo === 'express' || tipo === 'e') {
      // Selecionar Express - mais simples e rápido
      await page.evaluate(() => {
        // Tentar pelo input radio com value="e"
        const expressInput = document.querySelector('input[type="radio"][value="e"]');
        if (expressInput) {
          expressInput.click();
          return;
        }
        // Fallback: buscar por label
        const labels = Array.from(document.querySelectorAll('label'));
        const expressLabel = labels.find(l => l.textContent.toLowerCase().includes('express'));
        if (expressLabel) expressLabel.click();
      });
    } else {
      // Completo
      await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('label'));
        const completoLabel = labels.find(l => l.textContent.toLowerCase().includes('completo'));
        if (completoLabel) completoLabel.click();
      });
    }
    
    await this.sleep(1000);
    console.log(`  ✓ Tipo ${tipo} selecionado`);
  }

  /**
   * Preenche os dados pessoais
   */
  async fillPersonalData(page, data) {
    console.log('  Preenchendo dados pessoais...');
    
    // Nome (obrigatório)
    if (data.nome) {
      await this.fillInput(page, '#cv_name', data.nome);
      console.log(`    Nome: ${data.nome}`);
    }
    
    // CPF (obrigatório) - Precisa estar no formato XXX.XXX.XXX-XX
    if (data.cpf) {
      // Formatar CPF se vier apenas com números
      let cpfFormatado = data.cpf.replace(/\D/g, ''); // Remove não-dígitos
      if (cpfFormatado.length === 11) {
        cpfFormatado = `${cpfFormatado.slice(0,3)}.${cpfFormatado.slice(3,6)}.${cpfFormatado.slice(6,9)}-${cpfFormatado.slice(9,11)}`;
      }
      
      // Preencher usando digitação para ativar a máscara do campo
      await page.click('#cpf');
      await this.sleep(200);
      await page.keyboard.type(cpfFormatado, { delay: 50 });
      await this.sleep(300);
      
      console.log(`    CPF: ${cpfFormatado}`);
    }
    
    // Data de nascimento
    if (data.dataNascimento) {
      await this.fillDateInput(page, '#birth_date', data.dataNascimento);
      console.log(`    Data Nascimento: ${data.dataNascimento}`);
    }
    
    // Gênero
    if (data.genero) {
      await this.selectGender(page, data.genero);
      console.log(`    Gênero: ${data.genero}`);
    }
    
    console.log('  ✓ Dados pessoais preenchidos');
  }

  /**
   * Preenche os dados de contato
   */
  async fillContactData(page, data) {
    console.log('  Preenchendo dados de contato...');
    
    // Telefone fixo
    if (data.telefoneFixo) {
      await this.fillInput(page, '#tel_fixo', data.telefoneFixo);
      console.log(`    Telefone Fixo: ${data.telefoneFixo}`);
    }
    
    // Celular
    if (data.celular) {
      await this.fillInput(page, '#celular', data.celular);
      console.log(`    Celular: ${data.celular}`);
    }
    
    // E-mail (obrigatório)
    if (data.email) {
      await this.fillInput(page, '#email', data.email);
      console.log(`    E-mail: ${data.email}`);
    }
    
    // E-mail secundário
    if (data.emailSecundario) {
      await this.fillInput(page, '#email_sec', data.emailSecundario);
      console.log(`    E-mail Secundário: ${data.emailSecundario}`);
    }
    
    // Site
    if (data.site) {
      await this.fillInput(page, '#site', data.site);
      console.log(`    Site: ${data.site}`);
    }
    
    console.log('  ✓ Dados de contato preenchidos');
  }

  /**
   * Preenche os dados de endereço
   */
  async fillAddressData(page, data) {
    console.log('  Preenchendo endereço...');
    
    // CEP
    if (data.cep) {
      await this.fillInput(page, '#cep', data.cep);
      await this.sleep(1500); // Aguardar autocomplete do CEP
      console.log(`    CEP: ${data.cep}`);
    }
    
    // Rua
    if (data.rua) {
      await this.fillInput(page, '#street', data.rua);
      console.log(`    Rua: ${data.rua}`);
    }
    
    // Número
    if (data.numero) {
      await this.fillInput(page, '#number', data.numero);
      console.log(`    Número: ${data.numero}`);
    }
    
    // Bairro
    if (data.bairro) {
      await this.fillInput(page, '#neighborhood', data.bairro);
      console.log(`    Bairro: ${data.bairro}`);
    }
    
    // País (select2)
    if (data.pais) {
      await this.selectSelect2Option(page, 'country', data.pais);
      console.log(`    País: ${data.pais}`);
    }
    
    // Estado (select2)
    if (data.estado) {
      await this.selectSelect2Option(page, 'state', data.estado);
      console.log(`    Estado: ${data.estado}`);
    }
    
    // Cidade (select2)
    if (data.cidade) {
      await this.selectSelect2Option(page, 'city', data.cidade);
      console.log(`    Cidade: ${data.cidade}`);
    }
    
    console.log('  ✓ Endereço preenchido');
  }

  /**
   * Preenche o campo de referências
   */
  async fillReferences(page, referencias) {
    console.log('  Preenchendo referências...');
    await this.fillInput(page, '#references', referencias);
    console.log('  ✓ Referências preenchidas');
  }

  /**
   * Preenche o Perfil Profissional
   * @param {Object} data - Dados do perfil profissional
   *   - cargoPretendido: string (cargo desejado)
   *   - salarioPretendido: string (salário desejado)
   *   - areasInteresse: string[] (áreas de interesse)
   *   - niveisInteresse: string[] (níveis de interesse)
   */
  async fillProfessionalProfile(page, data) {
    console.log('  Preenchendo Perfil Profissional...');
    
    // Expandir a seção Perfil Profissional clicando no accordion
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const target = headings.find(h => h.textContent.includes('Perfil Profissional'));
      if (target) target.parentElement.click();
    });
    await this.sleep(1000);
    
    // Cargo pretendido (Select2 múltiplo)
    if (data.cargoPretendido) {
      console.log(`    Cargo pretendido: ${data.cargoPretendido}`);
      await this.selectSelect2Option(page, 'intended_occupation', data.cargoPretendido);
    }
    
    // Salário pretendido
    if (data.salarioPretendido) {
      console.log(`    Salário pretendido: ${data.salarioPretendido}`);
      await this.fillInput(page, '#intended_salary', data.salarioPretendido);
    }
    
    // Áreas de interesse (Select2 múltiplo)
    if (data.areasInteresse && data.areasInteresse.length > 0) {
      console.log(`    Áreas de interesse: ${data.areasInteresse.join(', ')}`);
      for (const area of data.areasInteresse) {
        await this.selectSelect2Option(page, 'interest_area', area);
        await this.sleep(500);
      }
    }
    
    // Níveis de interesse (Select2 múltiplo)
    if (data.niveisInteresse && data.niveisInteresse.length > 0) {
      console.log(`    Níveis de interesse: ${data.niveisInteresse.join(', ')}`);
      for (const nivel of data.niveisInteresse) {
        await this.selectSelect2Option(page, 'level_select', nivel);
        await this.sleep(500);
      }
    }
    
    console.log('  ✓ Perfil Profissional preenchido');
  }

  /**
   * Preenche o Perfil Educacional
   * @param {Object} data - Dados do perfil educacional
   *   - formacaoAcademica: string (nível de formação)
   *   - instituicao: string (nome da instituição)
   *   - curso: string (nome do curso)
   *   - dataInicio: string (data de início DD/MM/YYYY)
   *   - dataConclusao: string (data de conclusão DD/MM/YYYY)
   *   - turno: string (Manhã, Tarde, Noite, Integral)
   */
  async fillEducationalProfile(page, data) {
    console.log('  Preenchendo Perfil Educacional...');
    
    // Expandir a seção Perfil Educacional clicando no accordion
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const target = headings.find(h => h.textContent.includes('Perfil Educacional'));
      if (target) target.parentElement.click();
    });
    await this.sleep(1000);
    
    // Formação Acadêmica (Select2)
    if (data.formacaoAcademica) {
      console.log(`    Formação Acadêmica: ${data.formacaoAcademica}`);
      await this.selectSelect2Option(page, 'education_level_id', data.formacaoAcademica);
    }
    
    // Instituição de ensino
    if (data.instituicao) {
      console.log(`    Instituição: ${data.instituicao}`);
      await this.fillInput(page, '#institute', data.instituicao);
    }
    
    // Curso
    if (data.curso) {
      console.log(`    Curso: ${data.curso}`);
      await this.fillInput(page, '#course', data.curso);
    }
    
    // Data de início
    if (data.dataInicio) {
      console.log(`    Data de início: ${data.dataInicio}`);
      // Buscar campo de data de início
      await page.evaluate((dataInicio) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.includes('Data de início'));
        if (label) {
          const container = label.closest('.form-group') || label.parentElement;
          const input = container.querySelector('input');
          if (input) {
            input.value = dataInicio;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, data.dataInicio);
    }
    
    // Data de conclusão
    if (data.dataConclusao) {
      console.log(`    Data de conclusão: ${data.dataConclusao}`);
      // Buscar campo de data de conclusão
      await page.evaluate((dataConclusao) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.includes('Data de conclusão'));
        if (label) {
          const container = label.closest('.form-group') || label.parentElement;
          const input = container.querySelector('input');
          if (input) {
            input.value = dataConclusao;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, data.dataConclusao);
    }
    
    // Turno (select)
    if (data.turno) {
      console.log(`    Turno: ${data.turno}`);
      await page.evaluate((turno) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.includes('Turno'));
        if (label) {
          const container = label.closest('.form-group') || label.parentElement;
          const select = container.querySelector('select');
          if (select) {
            // Encontrar a opção que contém o turno
            const options = Array.from(select.options);
            const option = options.find(o => o.text.toLowerCase().includes(turno.toLowerCase()));
            if (option) {
              select.value = option.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      }, data.turno);
    }
    
    // Status da formação (Cursando/Concluído/Trancado) - OBRIGATÓRIO
    // Usando o grupo de radio buttons #btnradiosstudying
    const statusFormacao = data.statusFormacao || 'concluido'; // padrão: concluído
    console.log(`    Status: ${statusFormacao}`);
    await page.evaluate((status) => {
      // Mapeamento de status para label
      const statusMap = {
        'cursando': 1,    // label[1]
        'concluido': 2,   // label[2]
        'trancado': 3     // label[3]
      };
      
      const labelIndex = statusMap[status.toLowerCase()] || 2;
      
      // Tentar pelo ID do grupo de radio buttons
      const radioGroup = document.querySelector('#btnradiosstudying');
      if (radioGroup) {
        const label = radioGroup.querySelector(`label:nth-of-type(${labelIndex})`);
        if (label) {
          label.click();
          return;
        }
      }
      
      // Fallback: buscar labels dentro de collapse_formation
      const formation = document.querySelector('#collapse_formation');
      if (formation) {
        const labels = formation.querySelectorAll('label');
        const targetLabels = Array.from(labels).filter(l => 
          l.textContent.toLowerCase().includes('cursando') ||
          l.textContent.toLowerCase().includes('concluído') ||
          l.textContent.toLowerCase().includes('trancado')
        );
        if (targetLabels.length >= labelIndex) {
          targetLabels[labelIndex - 1].click();
        }
      }
    }, statusFormacao);
    await this.sleep(500);
    
    console.log('  ✓ Perfil Educacional preenchido');
  }

  /**
   * Salva o currículo
   */
  async saveCurriculum(page) {
    console.log('  Salvando currículo...');
    
    // Capturar URL antes do clique
    const urlBefore = await page.url();
    console.log(`    URL antes: ${urlBefore}`);
    
    // Scroll até o botão de salvar
    await page.evaluate(() => {
      // Buscar botão de salvar por classe ou texto
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(btn => 
        btn.classList.contains('btn-forward') || 
        btn.textContent.toLowerCase().includes('salvar')
      );
      if (saveBtn) saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await this.sleep(1000);
    
    // Verificar se há erros de validação ANTES de clicar
    const validationErrors = await page.evaluate(() => {
      const errors = [];
      // Buscar campos com classe de erro
      document.querySelectorAll('.is-invalid, .has-error, .error, [aria-invalid="true"]').forEach(el => {
        const formGroup = el.closest('.form-group, .col, .row');
        const label = formGroup?.querySelector('label')?.textContent?.trim() || '';
        const placeholder = el.placeholder || '';
        const value = el.value || '';
        errors.push({ 
          field: el.id || el.name || label, 
          label: label,
          placeholder: placeholder,
          hasValue: value.length > 0,
          message: 'Campo inválido' 
        });
      });
      // Buscar mensagens de feedback de erro
      document.querySelectorAll('.invalid-feedback:not(:empty), .text-danger:not(:empty)').forEach(el => {
        if (el.textContent.trim() && !el.textContent.includes('Click to sort')) {
          const formGroup = el.closest('.form-group, .col, .row');
          const label = formGroup?.querySelector('label')?.textContent?.trim() || '';
          errors.push({ label: label, message: el.textContent.trim() });
        }
      });
      return errors;
    });
    
    if (validationErrors.length > 0) {
      console.log('    ⚠️ Erros de validação encontrados:');
      validationErrors.forEach(err => {
        console.log(`       - Campo: ${err.field || err.label || 'desconhecido'}`);
        console.log(`         Mensagem: ${err.message}`);
        if (err.placeholder) console.log(`         Placeholder: ${err.placeholder}`);
      });
    }
    
    // Clicar no botão Salvar
    const saveSelectors = [
      'button.btn-primary.btn-forward',
      'button.btn-forward',
      '#form-footer-actions button',
      'button.btn-primary',
      'button[type="submit"]'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        const buttonExists = await page.$(selector);
        if (buttonExists) {
          console.log(`    Clicando no botão: ${selector}`);
          
          // Tentar clicar e aguardar possível navegação
          await Promise.race([
            page.click(selector),
            this.sleep(3000)
          ]);
          saved = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fallback: buscar por texto ou submit do form
    if (!saved) {
      console.log('    Tentando submeter formulário diretamente...');
      saved = await page.evaluate(() => {
        // Tentar encontrar o form e submeter
        const form = document.querySelector('form');
        if (form) {
          form.submit();
          return true;
        }
        // Fallback: buscar botão por texto
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(btn => btn.textContent.toLowerCase().includes('salvar'));
        if (saveBtn) {
          saveBtn.click();
          return true;
        }
        return false;
      });
    }
    
    if (!saved) {
      throw new Error('Botão Salvar não encontrado');
    }
    
    console.log('    ✓ Botão Salvar clicado');
    
    // Aguardar processamento (mais tempo para AJAX)
    console.log('    Aguardando processamento (10s)...');
    await this.sleep(10000);
    
    // Capturar URL depois do clique
    const urlAfter = await page.url();
    console.log(`    URL depois: ${urlAfter}`);
    
    // Verificar se URL mudou (indicativo de sucesso)
    if (urlAfter !== urlBefore) {
      if (urlAfter.includes('curriculum/edit') || urlAfter.includes('curriculum/view')) {
        console.log('    ✅ URL mudou para edição/visualização - currículo criado!');
        return { success: true, message: 'Currículo criado com sucesso' };
      }
    }
    
    // Verificar erros de validação após o clique
    const errorsAfter = await page.evaluate(() => {
      const errors = [];
      document.querySelectorAll('.is-invalid, .has-error, .invalid-feedback:not(:empty), .text-danger:not(:empty), .alert-danger').forEach(el => {
        if (el.textContent?.trim()) {
          errors.push(el.textContent.trim());
        }
      });
      // Verificar toast de erro
      const toastError = document.querySelector('.toast-error, .toastr-error');
      if (toastError) errors.push(toastError.textContent?.trim());
      
      return errors;
    });
    
    if (errorsAfter.length > 0) {
      console.log('    ❌ Erros encontrados após salvar:');
      errorsAfter.forEach(err => console.log(`       - ${err}`));
      return { success: false, message: `Erros: ${errorsAfter.join(', ')}` };
    }
    
    // Verificar se há mensagem de sucesso
    const result = await page.evaluate(() => {
      // Verificar mensagem de sucesso
      const successSelectors = ['.toast-success', '.alert-success', '.swal2-success', '.toastr-success', '.swal2-popup'];
      for (const sel of successSelectors) {
        const successMsg = document.querySelector(sel);
        if (successMsg && successMsg.offsetParent !== null) {
          return { success: true, message: successMsg.textContent.trim() };
        }
      }
      
      // Se a URL mudou para index, pode ser redirecionamento de sucesso
      if (window.location.href.includes('/curriculum/index')) {
        return { success: true, message: 'Redirecionado para listagem' };
      }
      
      // Se não há mensagem de erro visível, assumir processamento
      return { success: true, message: 'Processamento concluído - verificar no sistema' };
    });
    
    console.log(`  ✓ Resultado: ${result.message}`);
    return result;
  }

  /**
   * Verifica se o currículo foi realmente criado navegando para a listagem
   * @param {Page} page - Instância da página do Puppeteer
   * @param {string} nomeCurriculo - Nome do currículo para buscar
   * @returns {Promise<Object>} Resultado da verificação
   */
  async verifyCurriculumCreated(page, nomeCurriculo) {
    console.log('\n  🔍 Verificando se currículo foi criado...');
    
    try {
      // Navegar para a lista de currículos
      console.log('    Navegando para listagem de currículos...');
      await page.goto('https://selecty.app/curriculum/index', { 
        waitUntil: 'networkidle2',
        timeout: this.timeout 
      });
      await this.sleep(3000);
      
      // Capturar URL atual
      const currentUrl = await page.url();
      console.log(`    URL atual: ${currentUrl}`);
      
      // Buscar o currículo pelo nome na tabela
      const searchResult = await page.evaluate((nome) => {
        // Buscar em todas as linhas da tabela
        const rows = document.querySelectorAll('table tbody tr, .curriculum-item, .list-item');
        for (const row of rows) {
          const text = row.textContent || '';
          if (text.toLowerCase().includes(nome.toLowerCase())) {
            return { 
              found: true, 
              message: `Currículo "${nome}" encontrado na listagem!`,
              rowText: text.substring(0, 200) // Primeiros 200 caracteres
            };
          }
        }
        
        // Verificar também em cards ou divs
        const cards = document.querySelectorAll('.card, .curriculum-card, [class*="curriculum"]');
        for (const card of cards) {
          const text = card.textContent || '';
          if (text.toLowerCase().includes(nome.toLowerCase())) {
            return { 
              found: true, 
              message: `Currículo "${nome}" encontrado na listagem!`,
              rowText: text.substring(0, 200)
            };
          }
        }
        
        // Contar quantos currículos existem
        const totalRows = document.querySelectorAll('table tbody tr').length;
        
        return { 
          found: false, 
          message: `Currículo "${nome}" NÃO encontrado. Total de currículos na lista: ${totalRows}`,
          totalCurriculos: totalRows
        };
      }, nomeCurriculo);
      
      if (searchResult.found) {
        console.log(`    ✅ ${searchResult.message}`);
      } else {
        console.log(`    ⚠️ ${searchResult.message}`);
        
        // Tirar screenshot para debug
        const screenshotPath = `./debug-curriculum-list-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`    📸 Screenshot salva: ${screenshotPath}`);
      }
      
      return searchResult;
      
    } catch (error) {
      console.error(`    ❌ Erro na verificação: ${error.message}`);
      return { 
        found: false, 
        message: `Erro ao verificar: ${error.message}` 
      };
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Preenche um campo de input
   */
  async fillInput(page, selector, value) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      await page.click(selector);
      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, selector);
      await page.type(selector, value, { delay: 30 });
    } catch (error) {
      console.warn(`    ⚠ Campo ${selector} não encontrado ou não preenchível`);
    }
  }

  /**
   * Preenche um campo de data
   */
  async fillDateInput(page, selector, dateValue) {
    try {
      // Clicar no campo de data
      await page.click(`${selector} input, ${selector}`);
      await this.sleep(500);
      
      // Tentar preencher diretamente
      await page.evaluate((sel, date) => {
        const input = document.querySelector(`${sel} input`) || document.querySelector(sel);
        if (input) {
          input.value = date;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, selector, dateValue);
      
      // Fechar datepicker se estiver aberto
      await page.keyboard.press('Escape');
      await this.sleep(300);
    } catch (error) {
      console.warn(`    ⚠ Campo de data ${selector} não encontrado`);
    }
  }

  /**
   * Seleciona gênero
   */
  async selectGender(page, genero) {
    const generoMap = {
      'mulher': 1,
      'feminino': 1,
      'f': 1,
      'homem': 2,
      'masculino': 2,
      'm': 2,
      'nao_informar': 3,
      'outro': 3
    };
    
    const labelIndex = generoMap[genero.toLowerCase()] || 3;
    
    try {
      await page.click(`#gender > label:nth-of-type(${labelIndex})`);
    } catch (error) {
      // Fallback: clicar por texto
      await page.evaluate((gen) => {
        const labels = Array.from(document.querySelectorAll('#gender label'));
        const label = labels.find(l => l.textContent.toLowerCase().includes(gen.toLowerCase()));
        if (label) label.click();
      }, genero);
    }
  }

  /**
   * Seleciona opção em um Select2
   * Tenta múltiplas estratégias para encontrar o campo
   */
  async selectSelect2Option(page, fieldName, value) {
    try {
      // Estratégia 1: Clicar no container do Select2 pelo ID parcial
      const selectors = [
        `[id*="select2-${fieldName}"]`,
        `#select2-${fieldName}-container`,
        `span[id*="${fieldName}"]`,
        `#${fieldName} + .select2-container`,
        `.select2-container[id*="${fieldName}"]`
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            clicked = true;
            console.log(`      (Select2 encontrado: ${selector})`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Estratégia 2: Buscar por JavaScript se não encontrou
      if (!clicked) {
        clicked = await page.evaluate((fieldName) => {
          // Buscar pelo select original e clicar no container Select2 associado
          const select = document.querySelector(`#${fieldName}, select[name="${fieldName}"]`);
          if (select) {
            const container = select.nextElementSibling;
            if (container && container.classList.contains('select2-container')) {
              container.querySelector('.select2-selection').click();
              return true;
            }
          }
          // Buscar span com ID que contenha o fieldName
          const span = document.querySelector(`span[id*="select2-${fieldName}"]`);
          if (span) {
            span.click();
            return true;
          }
          return false;
        }, fieldName);
      }
      
      if (!clicked) {
        console.warn(`    ⚠ Select2 ${fieldName} não encontrado`);
        return;
      }
      
      await this.sleep(800);
      
      // Digitar valor na busca (o campo de busca deve estar ativo agora)
      await page.keyboard.type(value, { delay: 30 });
      await this.sleep(1000);
      
      // Selecionar primeira opção visível
      const optionSelected = await page.evaluate(() => {
        const option = document.querySelector('.select2-results__option--highlighted, .select2-results__option:first-child');
        if (option) {
          option.click();
          return true;
        }
        return false;
      });
      
      if (!optionSelected) {
        // Fallback: pressionar Enter
        await page.keyboard.press('Enter');
      }
      
      await this.sleep(500);
    } catch (error) {
      console.warn(`    ⚠ Select2 ${fieldName} erro: ${error.message}`);
    }
  }

  /**
   * Aguarda por um tempo especificado
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CurriculumCreator;
