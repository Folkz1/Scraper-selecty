/**
 * CurriculumAutomation V3 - Com seletores corretos do Puppeteer Recording
 */

require('dotenv').config();
const puppeteer = require('puppeteer');

class CurriculumAutomation {
  constructor(options = {}) {
    this.headless = options.headless ?? false;
    this.browser = null;
    this.page = null;
    this.timeout = 10000;
    this.logs = [];
  }

  log(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    this.logs.push({ time: new Date().toISOString(), type, message });
  }

  generateValidCPF() {
    // Gerar CPF válido com dígitos variados (evitar repetidos)
    const random = (min = 0, max = 9) => Math.floor(Math.random() * (max - min + 1)) + min;
    let n = [];
    for (let i = 0; i < 9; i++) {
      n.push(random(0, 9));
    }
    // Evitar CPFs com todos dígitos iguais (são inválidos)
    if (n.every(d => d === n[0])) {
      n[8] = (n[8] + 1) % 10;
    }
    // Calcula primeiro dígito verificador
    let d1 = n.reduce((sum, num, i) => sum + num * (10 - i), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    n.push(d1);
    // Calcula segundo dígito verificador
    let d2 = n.reduce((sum, num, i) => sum + num * (11 - i), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;
    n.push(d2);
    return n.join('');
  }

  // Formata salário para o padrão brasileiro: 3500 -> "3.500,00"
  formatSalary(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async init() {
    this.log('Iniciando navegador...');
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1366, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(this.timeout);
  }

  async login() {
    this.log('Realizando login...');
    await this.page.goto(process.env.SELECTY_LOGIN_URL, { waitUntil: 'networkidle0' });
    await this.page.type('#login', process.env.SELECTY_EMAIL);
    await this.page.type('#password', process.env.SELECTY_PASSWORD);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    this.log('Login realizado');
  }

  async navigateToForm() {
    this.log('Navegando para formulário...');
    await this.page.goto('https://selecty.app/curriculum/create-cv/complete/0', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await this.delay(3000);
    await this.page.waitForSelector('#cv_name', { timeout: 30000 });
    this.log('Formulário carregado');
  }

  async expandPerfilProfissional() {
    this.log('Expandindo Perfil Profissional...');
    try {
      await this.page.locator('::-p-text(Perfil Profissional)').click();
      await this.delay(1000);
    } catch (e) {
      // Fallback
      await this.page.evaluate(() => {
        const h = document.querySelector('div[aria-controls="collapse_professional_experience"]');
        if (h) h.click();
      });
      await this.delay(1000);
    }
  }

  // ========== DADOS PESSOAIS ==========
  async fillDadosPessoais(data) {
    this.log('Preenchendo dados pessoais...');
    
    if (data.nome) {
      await this.page.click('#cv_name', { clickCount: 3 });
      await this.page.type('#cv_name', data.nome);
    }
    
    const cpf = data.cpf || this.generateValidCPF();
    await this.page.click('#cpf', { clickCount: 3 });
    await this.page.type('#cpf', cpf);
    
    // Data de nascimento - usa .fill() no input do date picker
    if (data.data_nascimento) {
      this.log('  -> Data de nascimento');
      await this.page.evaluate((date) => {
        const input = document.querySelector('#birth_date div input, input[placeholder*="data"]');
        if (input) {
          input.value = date;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, data.data_nascimento);
      await this.delay(500);
    }
    
    if (data.genero) {
      await this.page.click(`input[name="gender"][value="${data.genero}"]`).catch(() => {});
    }
  }

  // ========== CONTATO ==========
  async fillContato(data) {
    this.log('Preenchendo contato...');
    if (data.celular) {
      await this.page.click('#celular', { clickCount: 3 }).catch(() => {});
      await this.page.type('#celular', data.celular).catch(() => {});
    }
    if (data.email) {
      await this.page.click('#email', { clickCount: 3 }).catch(() => {});
      await this.page.type('#email', data.email).catch(() => {});
    }
  }

  // ========== ENDEREÇO ==========
  async fillEndereco(data) {
    this.log('Preenchendo endereço...');
    
    // CEP - preenche e espera busca automática
    if (data.cep) {
      this.log('  -> CEP');
      await this.page.evaluate(() => {
        const cep = document.querySelector('#cep');
        if (cep) { cep.value = ''; cep.focus(); }
      });
      await this.page.type('#cep', data.cep.replace(/\D/g, ''));
      await this.delay(4000); // Aguardar busca automática de endereço
    }
    
    // Logradouro - limpar e preencher com page.type
    if (data.logradouro) {
      this.log('  -> Logradouro');
      await this.page.click('#street', { clickCount: 3 }).catch(() => {});
      await this.page.type('#street', data.logradouro);
    }
    
    // Número - limpar e preencher com page.type
    if (data.numero) {
      this.log('  -> Número');
      await this.page.click('#number', { clickCount: 3 }).catch(() => {});
      await this.page.type('#number', String(data.numero));
    }
    
    // Complemento
    if (data.complemento) {
      this.log('  -> Complemento');
      await this.page.click('#complement', { clickCount: 3 }).catch(() => {});
      await this.page.type('#complement', data.complemento);
    }
    
    // Bairro - limpar e preencher com page.type
    if (data.bairro) {
      this.log('  -> Bairro');
      await this.page.click('#neighborhood', { clickCount: 3 }).catch(() => {});
      await this.page.type('#neighborhood', data.bairro);
    }
    
    // Estado - Select2 (USA SIGLAS: SP, RJ, MG, etc)
    if (data.estado) {
      this.log('  -> Estado');
      
      // Função para selecionar estado
      const selectEstado = async () => {
        try {
          await this.page.click('span[id*="select2-state"][id*="container"]');
        } catch (e) {
          await this.page.click('#state + .select2-container .select2-selection').catch(() => {});
        }
        await this.delay(700);
        await this.page.waitForSelector('.select2-results__options', { timeout: 3000 }).catch(() => {});
        await this.page.keyboard.type(data.estado);
        await this.delay(1000);
        await this.page.keyboard.press('Enter');
        await this.delay(1000);
      };
      
      await selectEstado();
      
      // Verificar se estado foi selecionado
      const estadoSelecionado = await this.page.evaluate(() => {
        const container = document.querySelector('span[id*="select2-state"][id*="container"]');
        const texto = container?.textContent?.trim() || '';
        return texto.length === 2 && texto !== '--'; // Sigla de 2 letras
      });
      
      if (!estadoSelecionado) {
        this.log('  -> Retry Estado...');
        await this.delay(500);
        await selectEstado();
      }
      
      await this.delay(3000); // Aguardar carregamento AJAX das cidades
    }
    
    // Cidade - Select2 AJAX (carrega após selecionar estado)
    if (data.cidade) {
      this.log('  -> Cidade');
      
      // Aguardar o spinner/loading desaparecer e cidades carregarem
      await this.page.waitForFunction(() => {
        const citySelect = document.querySelector('#city');
        // Verificar se não está disabled e se tem opções
        return citySelect && !citySelect.disabled;
      }, { timeout: 10000 }).catch(() => {});
      
      await this.delay(1000);
      
      // Função para selecionar cidade
      const selectCidade = async () => {
        try {
          await this.page.click('span[id*="select2-city"][id*="container"]');
        } catch (e) {
          await this.page.click('#city + .select2-container .select2-selection').catch(() => {});
        }
        await this.delay(700);
        
        // Aguardar dropdown abrir e ter resultados (não "carregando")
        await this.page.waitForFunction(() => {
          const results = document.querySelectorAll('.select2-results__option');
          if (results.length === 0) return false;
          // Verificar se não está mostrando "carregando" ou "Searching"
          const firstResult = results[0]?.textContent?.toLowerCase() || '';
          return !firstResult.includes('carregando') && !firstResult.includes('searching') && !firstResult.includes('loading');
        }, { timeout: 5000 }).catch(() => {});
        
        await this.page.keyboard.type(data.cidade);
        await this.delay(2500);
        
        // Aguardar resultados do AJAX
        await this.page.waitForFunction(() => {
          const results = document.querySelectorAll('.select2-results__option');
          if (results.length === 0) return false;
          const firstResult = results[0]?.textContent?.toLowerCase() || '';
          return !firstResult.includes('carregando') && !firstResult.includes('searching');
        }, { timeout: 5000 }).catch(() => {});
        
        await this.page.keyboard.press('ArrowDown');
        await this.delay(200);
        await this.page.keyboard.press('Enter');
      };
      
      await selectCidade();
      
      // Verificar se cidade foi selecionada
      const cidadeSelecionada = await this.page.evaluate(() => {
        const container = document.querySelector('span[id*="select2-city"][id*="container"]');
        const texto = container?.textContent?.trim() || '';
        return texto.length > 3 && !texto.includes('Selecione');
      });
      
      if (!cidadeSelecionada) {
        this.log('  -> Retry Cidade...');
        await this.delay(1000);
        await selectCidade();
      }
    }
  }

  // ========== PERFIL EDUCACIONAL ==========
  async fillPerfilEducacional(data) {
    if (!data || data.length === 0) return;
    
    this.log('Preenchendo perfil educacional...');
    
    // Expandir seção de Perfil Educacional
    await this.page.evaluate(() => {
      const header = document.querySelector('div[aria-controls="collapse_formation"]');
      if (header && header.classList.contains('collapsed')) {
        header.click();
      }
    });
    await this.delay(1000);
    
    for (const edu of data) {
      this.log(`  Adicionando escolaridade: ${edu.formacao}`);
      
      // Formação Acadêmica - Select2
      if (edu.formacao) {
        this.log('    -> Formação');
        // Clicar no container correto do Select2
        await this.page.click('#select2-education_level_id-container').catch(async () => {
          await this.page.evaluate(() => {
            const container = document.querySelector('#collapse_formation div.col-lg-5 span.selection > span');
            if (container) container.click();
          });
        });
        await this.delay(500);
        await this.page.keyboard.type(edu.formacao);
        await this.delay(1000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
        await this.delay(500);
      }
      
      // Instituição de Ensino
      if (edu.instituicao) {
        this.log('    -> Instituição');
        await this.page.click('#institute', { clickCount: 3 }).catch(() => {});
        await this.page.type('#institute', edu.instituicao);
        await this.delay(300);
      }
      
      // Data Início
      if (edu.data_inicio) {
        this.log('    -> Data Início');
        await this.page.evaluate((date) => {
          const input = document.querySelector('#start div input');
          if (input) {
            input.value = date;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, edu.data_inicio);
        await this.delay(300);
      }
      
      // Data Conclusão
      if (edu.data_conclusao) {
        this.log('    -> Data Conclusão');
        await this.page.evaluate((date) => {
          const input = document.querySelector('#conclude div input');
          if (input) {
            input.value = date;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, edu.data_conclusao);
        await this.delay(300);
      }
      
      // Turno - Select2 (Manhã, Tarde, Noite) - clicar no container correto
      if (edu.turno) {
        this.log('    -> Turno');
        // Clicar no container do Select2 de turno
        await this.page.click('#select2-form_education_time-container').catch(async () => {
          await this.page.evaluate(() => {
            const container = document.querySelector('#collapse_formation div.col-lg-3 span.selection > span');
            if (container) container.click();
          });
        });
        await this.delay(500);
        await this.page.keyboard.type(edu.turno);
        await this.delay(800);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
        await this.delay(300);
      }
      
      // Situação - Radio buttons (s=Cursando, c=Concluído, p=Suspenso)
      if (edu.situacao) {
        this.log('    -> Situação');
        await this.page.click(`input[name="radio_group_field_studying"][value="${edu.situacao}"]`).catch(() => {});
        await this.delay(300);
      }
      
      // Clicar em "Incluir Escolaridade"
      this.log('    -> Incluindo escolaridade...');
      await this.page.click('#schoolingIncludeBtn');
      await this.delay(1500);
    }
    
    this.log('Perfil educacional preenchido!');
  }

  // ========== PERFIL PROFISSIONAL ==========
  async fillPerfilProfissional(data) {
    this.log('Preenchendo perfil profissional...');
    
    await this.expandPerfilProfissional();
    
    // Cargo pretendido - Clicar no container correto
    if (data.cargo_pretendido) {
      this.log('  -> Cargo pretendido');
      await this.page.evaluate(() => {
        const container = document.querySelector('#collapse_professional_experience div.col ul');
        if (container) container.click();
      });
      await this.delay(500);
      await this.page.keyboard.type(data.cargo_pretendido);
      await this.delay(2000);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.delay(500);
    }
    
    // Salário pretendido - FORMATO BRASILEIRO
    if (data.salario_pretendido) {
      this.log('  -> Salário pretendido');
      const salarioFormatado = this.formatSalary(data.salario_pretendido);
      await this.page.click('#intended_salary', { clickCount: 3 });
      await this.page.type('#intended_salary', salarioFormatado);
      await this.delay(300);
    }
    
    // Áreas de interesse
    if (data.area_interesse) {
      this.log('  -> Área de interesse');
      await this.page.evaluate(() => {
        const container = document.querySelector('#collapse_professional_experience div:nth-of-type(3) ul');
        if (container) container.click();
      });
      await this.delay(500);
      await this.page.keyboard.type(data.area_interesse);
      await this.delay(1500);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.delay(500);
    }
    
    // Nível de interesse
    if (data.nivel) {
      this.log('  -> Nível de interesse');
      await this.page.evaluate(() => {
        const container = document.querySelector('#collapse_professional_experience div:nth-of-type(4) ul');
        if (container) container.click();
      });
      await this.delay(500);
      await this.page.keyboard.type(data.nivel);
      await this.delay(1500);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }
  }

  // ========== EXPERIÊNCIA PROFISSIONAL (POPUP) ==========
  async addExperiencia(exp) {
    this.log(`Adicionando experiência: ${exp.empresa}`);
    
    // Abrir popup - usando seletor correto
    await this.page.locator('::-p-text(Adicionar Experiência)').click();
    await this.delay(1500);
    
    // Verificar se popup abriu
    const modalVisible = await this.page.$('#professional_experience___BV_modal_outer_');
    if (!modalVisible) {
      this.log('Popup não abriu!', 'error');
      return false;
    }
    
    // EMPRESA - ID correto é #company
    if (exp.empresa) {
      this.log('  -> Empresa');
      await this.page.click('#company', { clickCount: 3 });
      await this.page.type('#company', exp.empresa);
      await this.delay(300);
    }
    
    // SEGMENTO - Select2 no popup
    if (exp.segmento) {
      this.log('  -> Segmento');
      await this.page.click('div.col-lg-4 span.selection > span').catch(async () => {
        // Fallback
        await this.page.evaluate(() => {
          const el = document.querySelector('#segment');
          if (el && el.nextElementSibling) {
            el.nextElementSibling.querySelector('.select2-selection').click();
          }
        });
      });
      await this.delay(500);
      await this.page.keyboard.type(exp.segmento);
      await this.delay(1500);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.delay(300);
    }
    
    // PORTE DA EMPRESA - Select2 (ID dinâmico, usar seletor robusto)
    if (exp.porte) {
      this.log('  -> Porte');
      // Clicar no container do company_size
      await this.page.evaluate(() => {
        const container = document.querySelector('#company_size + .select2-container .select2-selection');
        if (container) container.click();
      });
      await this.delay(700);
      await this.page.keyboard.type(exp.porte);
      await this.delay(1500);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.delay(500);
    }
    
    // CARGO - Select2 AJAX com fallback para "Novo Cargo"
    if (exp.cargo) {
      this.log('  -> Cargo');
      // Clicar no container correto
      await this.page.click('#select2-occupation_id-container').catch(async () => {
        await this.page.evaluate(() => {
          const container = document.querySelector('#occupation_id + .select2-container .select2-selection');
          if (container) container.click();
        });
      });
      await this.delay(700);
      await this.page.keyboard.type(exp.cargo);
      await this.delay(2500); // AJAX precisa de mais tempo
      
      // Verificar se encontrou resultados
      const hasResults = await this.page.evaluate(() => {
        const results = document.querySelectorAll('.select2-results__option');
        return results.length > 0 && !results[0].textContent.includes('Nenhum resultado');
      });
      
      if (hasResults) {
        await this.page.keyboard.press('ArrowDown');
        await this.delay(200);
        await this.page.keyboard.press('Enter');
      } else {
        // Cargo não encontrado - usar fluxo "Novo Cargo"
        this.log('    -> Cargo não encontrado, criando novo...');
        await this.page.keyboard.press('Escape'); // Fechar dropdown
        await this.delay(500);
        
        // 1. Clicar no botão "Novo Cargo" no modal
        await this.page.evaluate(() => {
          const btn = document.querySelector('#professional_experience___BV_modal_outer_ button span');
          if (btn && btn.textContent.includes('Novo Cargo')) {
            btn.closest('button').click();
          } else {
            // Fallback: procurar por texto
            const btns = Array.from(document.querySelectorAll('button'));
            const novoCargoBtn = btns.find(b => b.textContent.includes('Novo Cargo'));
            if (novoCargoBtn) novoCargoBtn.click();
          }
        });
        await this.delay(1000);
        
        // 2. Preencher nome do cargo no modal
        await this.page.click('#name', { clickCount: 3 }).catch(() => {});
        await this.page.type('#name', exp.cargo);
        await this.delay(300);
        
        // 3. Preencher descrição (obrigatório)
        await this.page.click('#description', { clickCount: 3 }).catch(() => {});
        await this.page.type('#description', exp.cargo);
        await this.delay(300);
        
        // 4. Clicar em Salvar no modal de novo cargo
        await this.page.evaluate(() => {
          const saveBtn = document.querySelector('#modal-create-cargo___BV_modal_footer_ button.ml-2');
          if (saveBtn) saveBtn.click();
        });
        await this.delay(2000);
        
        // 5. Agora buscar o cargo recém criado no dropdown
        this.log('    -> Buscando cargo criado...');
        await this.page.click('#select2-occupation_id-container').catch(async () => {
          await this.page.evaluate(() => {
            const container = document.querySelector('div.col-lg-8 span.selection > span');
            if (container) container.click();
          });
        });
        await this.delay(500);
        await this.page.keyboard.type(exp.cargo.substring(0, 6)); // Buscar parcial
        await this.delay(2000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
      }
      await this.delay(500);
    }
    
    // ÚLTIMO SALÁRIO - Formato brasileiro
    if (exp.ultimo_salario) {
      this.log('  -> Último salário');
      const salarioFormatado = this.formatSalary(exp.ultimo_salario);
      await this.page.click('#last_salary', { clickCount: 3 });
      await this.page.type('#last_salary', salarioFormatado);
      await this.delay(300);
    }
    
    // ATUAL? - Botão Sim
    if (exp.emprego_atual) {
      this.log('  -> Emprego atual: Sim');
      await this.page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('#professional_experience___BV_modal_outer_ button'));
        const sim = btns.find(b => b.textContent.trim() === 'Sim');
        if (sim) sim.click();
      });
      await this.delay(300);
    }
    
    // ATIVIDADES - Textarea
    if (exp.atividades) {
      this.log('  -> Atividades');
      await this.page.click('#activities');
      await this.page.type('#activities', exp.atividades);
      await this.delay(300);
    }
    
    // SALVAR - Botão no modal
    this.log('  -> Salvando experiência...');
    await this.page.click('#professional_experience___BV_modal_footer_ button.btn-primary').catch(async () => {
      // Fallback
      await this.page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.modal-footer button'));
        const save = btns.find(b => b.textContent.includes('Salvar'));
        if (save) save.click();
      });
    });
    
    await this.delay(2000);
    this.log('Experiência adicionada!');
    return true;
  }

  // ========== SALVAR CURRÍCULO ==========
async save() {
  this.log('Salvando currículo...');
  
  // Scroll até o botão salvar
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.delay(1000);
  
  // Capturar URL antes de salvar
  const urlBefore = this.page.url();
  
  await this.page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.textContent.includes('Salvar') && !b.closest('.modal'));
    if (saveBtn) saveBtn.click();
  });
  
  await this.delay(8000); // Aguardar mais tempo para processamento
  
  const urlAfter = this.page.url();
  
  // Verificar se URL mudou para edição
  if (urlAfter.includes('/edit/') || urlAfter.includes('/view/')) {
    return { success: true, url: urlAfter, message: 'Currículo criado - URL mudou para edição' };
  }
  
  // Verificar se há mensagem de sucesso na página
  const hasSuccess = await this.page.evaluate(() => {
    // Procurar mensagens de sucesso
    const successSelectors = ['.toast-success', '.alert-success', '.swal2-success', '.toastr-success'];
    for (const sel of successSelectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return true;
    }
    // Verificar se URL mudou para lista/index
    if (window.location.href.includes('/index')) return true;
    return false;
  });
  
  if (hasSuccess) {
    return { success: true, url: urlAfter, message: 'Currículo criado - mensagem de sucesso detectada' };
  }
  
  // Se ainda está na mesma URL, fazer screenshot e retornar status
  await this.page.screenshot({ path: 'curriculum-save-result.png', fullPage: true });
  
  return { 
    success: urlAfter !== urlBefore, 
    url: urlAfter,
    message: urlAfter === urlBefore ? 'URL não mudou - verificar manualmente' : 'URL modificada'
  };
}  

  // ========== MÉTODO PRINCIPAL ==========
  async createCurriculum(candidateData) {
    try {
      await this.init();
      await this.login();
      await this.navigateToForm();
      
      await this.fillDadosPessoais(candidateData.dados_pessoais || candidateData);
      await this.fillContato(candidateData.contato || candidateData);
      await this.fillEndereco(candidateData.endereco || candidateData);
      await this.fillPerfilEducacional(candidateData.perfil_educacional || []);
      await this.fillPerfilProfissional(candidateData.perfil_profissional || candidateData);
      
      if (candidateData.experiencias?.length > 0) {
        for (const exp of candidateData.experiencias) {
          await this.addExperiencia(exp);
        }
      }
      
      const result = await this.save();
      await this.page.screenshot({ path: 'curriculum-created.png', fullPage: true });
      
      return { success: result.success, url: result.url, logs: this.logs };
      
    } catch (error) {
      this.log(`Erro: ${error.message}`, 'error');
      await this.page.screenshot({ path: 'curriculum-error.png', fullPage: true });
      return { success: false, error: error.message, logs: this.logs };
    }
  }
}

module.exports = CurriculumAutomation;


