const { ScraperError, ErrorTypes, ErrorCodes } = require('../config/ErrorCodes');

class SelectyNavigator {
  constructor(config) {
    this.config = config;
    const configData = config.getConfig();
    this.vacancyUrl = configData.selecty.vacancyUrl;
    this.timeout = configData.scraper.timeout;
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Navega para a página de listagem de vagas
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<void>}
   */
  async navigateToVacancyList(page) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Navegando para lista de vagas (tentativa ${attempt}/${this.maxRetries})...`);
        
        await page.goto(this.vacancyUrl, {
          waitUntil: 'networkidle2',
          timeout: this.timeout
        });

        console.log('✓ Navegação para lista de vagas bem-sucedida');
        return;

      } catch (error) {
        lastError = error;
        console.log(`✗ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`Aguardando ${this.retryDelay}ms antes de tentar novamente...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    throw new ScraperError(
      'Falha ao navegar para lista de vagas após múltiplas tentativas',
      ErrorTypes.NAVIGATION_ERROR,
      ErrorCodes.NAVIGATION_ERROR,
      `Último erro: ${lastError.message}`
    );
  }

  /**
   * Aguarda a tabela de vagas estar visível
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<void>}
   */
  async waitForVacancyTable(page) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Aguardando tabela de vagas (tentativa ${attempt}/${this.maxRetries})...`);

        // Tentar múltiplos seletores para a tabela
        const tableSelectors = [
          'table',
          '.table',
          '[role="table"]',
          'tbody tr',
          '.vacancy-list',
          '.vacancies-table'
        ];

        let tableFound = false;
        for (const selector of tableSelectors) {
          try {
            await page.waitForSelector(selector, {
              visible: true,
              timeout: this.timeout
            });
            console.log(`✓ Tabela encontrada usando seletor: ${selector}`);
            tableFound = true;
            break;
          } catch (e) {
            continue;
          }
        }

        if (!tableFound) {
          throw new Error('Nenhum seletor de tabela encontrado');
        }

        // Aguardar um pouco para garantir que a tabela está completamente carregada
        await this.sleep(1000);
        
        console.log('✓ Tabela de vagas carregada');
        return;

      } catch (error) {
        lastError = error;
        console.log(`✗ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`Aguardando ${this.retryDelay}ms antes de tentar novamente...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    throw new ScraperError(
      'Falha ao carregar tabela de vagas após múltiplas tentativas',
      ErrorTypes.NAVIGATION_ERROR,
      ErrorCodes.NAVIGATION_ERROR,
      `Último erro: ${lastError.message}`
    );
  }

  /**
   * Obtém o número total de vagas na página
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<number>} Número de vagas encontradas
   */
  async getVacancyCount(page) {
    try {
      console.log('Contando vagas disponíveis...');

      const count = await page.evaluate(() => {
        // Tentar diferentes formas de contar as vagas
        const rows = document.querySelectorAll('tbody tr, .vacancy-row, [data-vacancy]');
        return rows.length;
      });

      console.log(`✓ Total de vagas encontradas: ${count}`);
      
      if (count === 0) {
        console.warn('⚠ Nenhuma vaga encontrada na página');
      }

      return count;

    } catch (error) {
      console.warn(`⚠ Erro ao contar vagas: ${error.message}. Continuando...`);
      return 0;
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

module.exports = SelectyNavigator;
