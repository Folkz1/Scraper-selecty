const { ScraperError, ErrorTypes, ErrorCodes } = require('../config/ErrorCodes');

class VacancyExtractor {
  constructor(config) {
    this.config = config;
    const configData = config.getConfig();
    this.timeout = configData.scraper.timeout;
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Extrai todas as vagas da página
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} totalVacancies - Número total de vagas esperadas
   * @returns {Promise<Array>} Array com dados de todas as vagas
   */
  async extractAllVacancies(page, totalVacancies) {
    const vacancies = [];
    let successCount = 0;
    let errorCount = 0;

    console.log(`\nIniciando extração de ${totalVacancies} vagas...`);

    for (let index = 0; index < totalVacancies; index++) {
      try {
        console.log(`\n[${index + 1}/${totalVacancies}] Processando vaga...`);
        
        // Primeiro extrair o status da vaga antes de abrir o modal
        const statusVaga = await this.extractVacancyStatus(page, index);
        console.log(`  Status da vaga: ${statusVaga}`);
        
        // Abrir modal e obter título esperado
        const modalResult = await this.openVacancyModal(page, index);
        if (!modalResult.success) {
          console.warn(`⚠ Não foi possível abrir modal da vaga ${index + 1}, pulando...`);
          errorCount++;
          continue;
        }

        // CRÍTICO: Aguardar o conteúdo do modal mudar para a vaga correta
        const contentChanged = await this.waitForModalContentChange(page, modalResult.expectedTitle);
        if (!contentChanged) {
          console.warn(`⚠ Conteúdo do modal não atualizou para vaga ${index + 1}, pulando...`);
          await this.closeModal(page);
          errorCount++;
          continue;
        }

        const vacancyData = await this.extractVacancyDetails(page);
        
        // Adicionar o status aos dados da vaga
        vacancyData.statusVaga = statusVaga;
        
        await this.closeModal(page);
        
        vacancies.push(vacancyData);
        successCount++;
        console.log(`✓ Vaga ${index + 1} extraída: ${vacancyData.cargo} (${statusVaga})`);

        // Pequeno delay entre extrações para evitar sobrecarga
        await this.sleep(500);

      } catch (error) {
        console.error(`✗ Erro ao extrair vaga ${index + 1}: ${error.message}`);
        errorCount++;
        
        // Tentar fechar modal se estiver aberto
        try {
          await this.closeModal(page);
        } catch (e) {
          // Ignorar erro ao fechar
        }
        
        // Continuar com a próxima vaga
        continue;
      }
    }

    console.log(`\n✓ Extração concluída: ${successCount} vagas extraídas, ${errorCount} erros`);
    
    if (vacancies.length === 0) {
      throw new ScraperError(
        'Nenhuma vaga foi extraída com sucesso',
        ErrorTypes.EXTRACTION_ERROR,
        ErrorCodes.EXTRACTION_ERROR,
        'Verifique se a estrutura da página mudou'
      );
    }

    return vacancies;
  }

  /**
   * Extrai o status da vaga da linha da tabela
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} rowIndex - Índice da linha da vaga (0-based)
   * @returns {Promise<string>} Status da vaga
   */
  async extractVacancyStatus(page, rowIndex) {
    try {
      const rowNumber = rowIndex + 1; // Converter para 1-based
      
      // Extrair o status da vaga usando o seletor da linha no tbody
      const status = await page.evaluate((rowNum) => {
        // Buscar especificamente no tbody para evitar pegar o thead
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) {
          return 'Status não encontrado';
        }
        
        // Procurar pelo span com a classe específica do status
        const statusSpan = row.querySelector('span.totalVacanciesList_title-status-new');
        if (statusSpan) {
          return statusSpan.textContent.trim();
        }
        
        // Se não encontrar o span específico, procurar por outros spans de status
        const statusSpans = row.querySelectorAll('span[class*="status"], span.badge');
        if (statusSpans.length > 0) {
          return statusSpans[0].textContent.trim();
        }
        
        // Se não encontrar nenhum status, retornar padrão
        return 'Status não informado';
      }, rowNumber);
      
      return status;
      
    } catch (error) {
      console.warn(`⚠ Erro ao extrair status da vaga ${rowIndex + 1}: ${error.message}`);
      return 'Erro ao extrair status';
    }
  }

  /**
   * Abre o modal de detalhes de uma vaga
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} rowIndex - Índice da linha da vaga (0-based)
   * @returns {Promise<Object>} Objeto com success e expectedTitle
   */
  async openVacancyModal(page, rowIndex) {
    try {
      const rowNumber = rowIndex + 1; // Converter para 1-based
      console.log(`Abrindo modal da vaga ${rowNumber}...`);
      
      // Passo 1: Capturar o título esperado da vaga ANTES de abrir o modal
      const expectedTitle = await page.evaluate((rowNum) => {
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) return null;
        
        // Procurar especificamente pelo cargo (geralmente está em um elemento com classe específica)
        // Tentar múltiplos seletores para encontrar o cargo
        let cargo = null;
        
        // Tentar pegar de um span ou div com classe específica
        const cargoElement = row.querySelector('[class*="cargo"], [class*="title"], [class*="job"]');
        if (cargoElement) {
          cargo = cargoElement.textContent.trim();
        }
        
        // Se não encontrou, pegar o primeiro texto significativo da linha
        if (!cargo) {
          const allText = row.textContent.trim();
          // Procurar por padrão: "# 370 Marceneiro, 1 Posição..."
          // Extrair apenas o cargo (palavra após o número)
          const match = allText.match(/#\s*\d+\s+([^,]+)/);
          if (match) {
            cargo = match[1].trim();
          }
        }
        
        return cargo;
      }, rowNumber);
      
      if (!expectedTitle) {
        throw new Error('Não foi possível identificar o título da vaga na tabela');
      }
      
      console.log(`  Título esperado: "${expectedTitle}"`);
      
      // Clicar no ícone de menu (três pontos) da linha no tbody
      const menuIconSelector = `tbody tr:nth-child(${rowNumber}) i.fas`;
      console.log(`  Aguardando ícone de menu: ${menuIconSelector}`);
      await page.waitForSelector(menuIconSelector, { visible: true, timeout: 5000 });
      console.log(`  Clicando no ícone de menu...`);
      await page.click(menuIconSelector);
      
      // Passo 2: Aguardar dropdown abrir
      console.log(`  Aguardando dropdown abrir...`);
      await this.sleep(1000);
      
      // Passo 3: Clicar em "Informações da vaga" usando seletor específico
      // Baseado no exemplo: tr:nth-of-type(1) ul > div:nth-of-type(2) button
      console.log(`  Procurando botão "Informações da vaga"...`);
      const infoButtonSelector = `tbody tr:nth-child(${rowNumber}) ul > div:nth-of-type(2) button`;
      
      try {
        await page.waitForSelector(infoButtonSelector, { visible: true, timeout: 3000 });
        console.log(`  Clicando em "Informações da vaga" com seletor: ${infoButtonSelector}`);
        await page.click(infoButtonSelector);
        console.log(`  Botão clicado, aguardando modal...`);
      } catch (error) {
        // Fallback: tentar com aria-label
        console.log(`  Seletor específico falhou, tentando com aria-label...`);
        const buttonInfo = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a, li, [role="menuitem"]'));
          
          const infoButton = buttons.find(btn => {
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const text = btn.textContent.trim();
            return ariaLabel.includes('Informações da vaga') || 
                   text === 'Informações da vaga' ||
                   text.includes('Informações da vaga');
          });
          
          if (infoButton) {
            infoButton.click();
            return { success: true };
          }
          return { success: false };
        });
        
        if (!buttonInfo.success) {
          throw new Error('Botão "Informações da vaga" não encontrado');
        }
      }
      
      // Passo 4: Aguardar modal aparecer
      const modalSelectors = [
        '.modal-dialog',
        '.modal-content',
        '[role="dialog"]',
        '.modal',
        '[class*="modal"]'
      ];
      
      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          await page.waitForSelector(selector, { visible: true, timeout: 2000 });
          console.log(`  Modal encontrado com seletor: ${selector}`);
          modalFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!modalFound) {
        throw new Error('Modal não apareceu após clicar no botão');
      }
      
      console.log(`✓ Modal da vaga ${rowNumber} aberto`);
      return { success: true, expectedTitle };
      
    } catch (error) {
      console.error(`✗ Erro ao abrir modal: ${error.message}`);
      return { success: false, expectedTitle: null };
    }
  }

  /**
   * Aguarda o conteúdo do modal mudar para a vaga correta
   * @param {Page} page - Instância da página do Puppeteer
   * @param {string} expectedTitle - Título esperado da vaga
   * @param {number} maxAttempts - Número máximo de tentativas
   * @returns {Promise<boolean>} True se o conteúdo mudou
   */
  async waitForModalContentChange(page, expectedTitle, maxAttempts = 20) {
    console.log(`  Aguardando modal atualizar para: "${expectedTitle}"...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Extrair o título atual do modal
        const currentTitle = await page.evaluate(() => {
          // Procurar pelo campo "Título da Vaga" no modal
          const modalElement = document.querySelector('[class*="modal"]');
          if (!modalElement) return null;
          
          const fullText = modalElement.innerText || '';
          
          // Tentar extrair o título da vaga do texto
          const match = fullText.match(/Título da Vaga:\s*(.+?)\s+(?:Tipo de Requisição|$)/);
          if (match) {
            return match[1].trim();
          }
          
          // Fallback: pegar o primeiro h4 ou h3
          const header = modalElement.querySelector('h4, h3');
          if (header) {
            return header.textContent.trim();
          }
          
          return null;
        });
        
        if (currentTitle) {
          console.log(`  [Tentativa ${attempt}/${maxAttempts}] Título atual: "${currentTitle}"`);
          
          // Verificar se o título contém parte do título esperado ou vice-versa
          // (às vezes o título na tabela é abreviado)
          const titleMatch = 
            currentTitle.toLowerCase().includes(expectedTitle.toLowerCase()) ||
            expectedTitle.toLowerCase().includes(currentTitle.toLowerCase());
          
          if (titleMatch) {
            console.log(`  ✓ Conteúdo do modal atualizado corretamente!`);
            return true;
          }
        }
        
        // Aguardar antes da próxima tentativa
        await this.sleep(300);
        
      } catch (error) {
        console.warn(`  ⚠ Erro na tentativa ${attempt}: ${error.message}`);
      }
    }
    
    console.warn(`  ⚠ Timeout: Modal não atualizou após ${maxAttempts} tentativas`);
    return false;
  }

  /**
   * Extrai detalhes da vaga do modal
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<Object>} Dados da vaga
   */
  async extractVacancyDetails(page) {
    try {
      // Aguardar modal estar completamente carregado - tentar múltiplos seletores
      const modalSelectors = [
        '[class*="modal"]',
        '.modal-dialog', 
        '.modal-content', 
        '.modal', 
        '[role="dialog"]',
        'div:has(h4:contains("Detalhes da vaga"))'
      ];
      let modal = null;
      
      for (const selector of modalSelectors) {
        try {
          if (selector.includes('contains')) {
            // Para seletores com :contains, verificar se existe
            const exists = await page.evaluate(() => {
              const headers = Array.from(document.querySelectorAll('h4'));
              const detailsHeader = headers.find(h => h.textContent.includes('Detalhes da vaga'));
              return detailsHeader ? detailsHeader.closest('div') : null;
            });
            if (exists) {
              modal = 'div'; // Usar div genérico e buscar pelo evaluate
              console.log(`  Modal encontrado via texto "Detalhes da vaga"`);
              break;
            }
          } else {
            await page.waitForSelector(selector, { visible: true, timeout: 2000 });
            modal = selector;
            console.log(`  Modal encontrado com seletor: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!modal) {
        // Debug: listar todos os elementos visíveis
        const debugInfo = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          
          return {
            modalClasses: Array.from(document.querySelectorAll('[class*="modal"]')).map(el => el.className),
            dialogElements: Array.from(document.querySelectorAll('[role="dialog"]')).length,
            h4Elements: Array.from(document.querySelectorAll('h4')).map(h => h.textContent),
            totalVisible: allElements.length
          };
        });
        
        console.log('  Debug - elementos encontrados:', JSON.stringify(debugInfo, null, 2));
        throw new Error('Modal não encontrado com nenhum seletor');
      }

      // Extrair todo o conteúdo do modal
      const modalData = await page.evaluate((modalSelector) => {
        let modalElement;
        
        if (modalSelector === 'div') {
          // Buscar div que contém "Detalhes da vaga"
          const headers = Array.from(document.querySelectorAll('h4'));
          const detailsHeader = headers.find(h => h.textContent.includes('Detalhes da vaga'));
          modalElement = detailsHeader ? detailsHeader.closest('div') : null;
          
          // Se não encontrar, tentar buscar por modal classes
          if (!modalElement) {
            modalElement = document.querySelector('[class*="modal"]');
          }
        } else {
          modalElement = document.querySelector(modalSelector);
        }
        
        if (!modalElement) {
          throw new Error(`Modal não encontrado com seletor: ${modalSelector}`);
        }
        
        // Extrair título da vaga para debug
        const titleElement = modalElement.querySelector('h4, h3, h2, h1');
        const title = titleElement ? titleElement.textContent.trim() : 'Título não encontrado';
        
        return {
          fullText: modalElement.innerText || '',
          html: modalElement.innerHTML || '',
          className: modalElement.className || '',
          debugTitle: title
        };
      }, modal);

      console.log(`  DEBUG: Título do modal: ${modalData.debugTitle}`);
      console.log(`  Conteúdo extraído (${modalData.fullText.length} chars), parseando campos...`);
      
      // Parsear campos do texto extraído
      const vacancyData = this.parseVacancyFields(modalData.fullText);
      
      return vacancyData;

    } catch (error) {
      throw new Error(`Erro ao extrair detalhes da vaga: ${error.message}`);
    }
  }

  /**
   * Parseia os campos da vaga a partir do texto do modal
   * @param {string} text - Texto completo do modal
   * @returns {Object} Objeto com campos da vaga
   */
  parseVacancyFields(text) {
    console.log('Parseando campos da vaga...');
    
    const extractField = (pattern, defaultValue = '—') => {
      try {
        const match = text.match(pattern);
        return match ? match[1].trim() : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    // Extrair cargo (do título)
    const cargo = extractField(/Título da Vaga:\s*(.+?)\s+Tipo de Requisição/);

    // Extrair empresa
    const empresa = extractField(/Empresa\s+E-mail\s+Telefone\n[\d\s]+\t[\d\s]+\t(.+?)\t/);

    // Extrair salário
    const salario = extractField(/Salário\n\n(.+?)\n/);

    // Extrair jornada
    const jornada = extractField(/Jornada\n\n(.+?)\n/);

    // Extrair tipo de contrato
    const tipoContrato = extractField(/Tipo de contrato\n\n(.+?)\n/);

    // Extrair benefícios (texto completo até próxima seção)
    const beneficios = extractField(/Benefícios da Vaga\n(.+?)(?=\nJustificativa)/s);

    // Extrair descrição das atividades
    const descricaoAtividades = extractField(/Descrição das atividades que o profissional irá realizar\n(.+?)(?=\nRequisitos)/s);

    // Extrair requisitos (equivalente a experiências e qualificações)
    const experienciasQualificacoes = extractField(/Requisitos\n(.+?)(?=\nObservações)/s);

    // Extrair observações
    const observacoes = extractField(/Observações\n(.+?)(?=\nCEP)/s);

    // Extrair endereço completo
    const cep = extractField(/CEP\s+Endereço\s+Complemento\n(.+?)\t/);
    const endereco = extractField(/CEP\s+Endereço\s+Complemento\n[^\t]+\t(.+?)\t/);
    const bairro = extractField(/Bairro\s+Cidade\s+UF\n(.+?)\t/);
    const cidade = extractField(/Bairro\s+Cidade\s+UF\n[^\t]+\t(.+?)\t/);
    const uf = extractField(/Bairro\s+Cidade\s+UF\n[^\t]+\t[^\t]+\t(.+?)\n/);
    
    const local = `${endereco}, ${bairro}, ${cidade} - ${uf}`;

    // Extrair escolaridade (pode estar vazio)
    const escolaridade = extractField(/Escolaridade\nNível\s+Curso\s+Situação\s+Tempo de formado\s+Importância\n(.+?)(?=\nConhecimentos)/s);

    // Extrair nível de atuação
    const nivelAtuacao = extractField(/Níveis de atuação\n(.+?)\n/);

    // Extrair área de atuação
    const areaAtuacao = extractField(/Áreas de atuação\n(.+?)\n/);

    return {
      cargo: cargo || '—',
      empresa: empresa || '—',
      salario: salario || '—',
      jornada: jornada || '—',
      tipoContrato: tipoContrato || '—',
      beneficios: beneficios || '—',
      descricaoAtividades: descricaoAtividades || '—',
      experienciasQualificacoes: experienciasQualificacoes || '—',
      escolaridade: escolaridade || '—',
      nivelAtuacao: nivelAtuacao || '—',
      areaAtuacao: areaAtuacao || '—',
      local: local || '—',
      observacoes: observacoes || '—',
      statusVaga: '—' // Será preenchido no método principal
    };
  }

  /**
   * Fecha o modal de detalhes
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<void>}
   */
  async closeModal(page) {
    try {
      // Tentar múltiplos seletores para o botão de fechar
      const closeSelectors = [
        'button.close',
        'button.close > i',
        '.modal-header button',
        '[aria-label*="Close"]',
        '[aria-label*="Fechar"]',
        'button[data-dismiss="modal"]',
        '.close'
      ];
      
      let closed = false;
      for (const selector of closeSelectors) {
        try {
          console.log(`  Tentando fechar com seletor: ${selector}`);
          await page.waitForSelector(selector, { visible: true, timeout: 2000 });
          await page.click(selector);
          console.log(`  Clicou no botão de fechar`);
          closed = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!closed) {
        console.log(`  Tentando fechar com ESC...`);
        await page.keyboard.press('Escape');
      }
      
      // Aguardar modal desaparecer - tentar múltiplos seletores
      const modalSelectors = ['.modal-dialog', '.modal-content', '.modal', '[role="dialog"]'];
      for (const selector of modalSelectors) {
        try {
          await page.waitForSelector(selector, { hidden: true, timeout: 2000 });
          break;
        } catch (e) {
          continue;
        }
      }
      
      await this.sleep(500);
      console.log('✓ Modal fechado');
      
    } catch (error) {
      console.warn('⚠ Erro ao fechar modal, tentando ESC como último recurso...');
      try {
        await page.keyboard.press('Escape');
        await this.sleep(500);
      } catch (e) {
        console.warn('⚠ Não foi possível fechar modal, continuando...');
      }
    }
  }

  /**
   * Função auxiliar para aguardar
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = VacancyExtractor;
