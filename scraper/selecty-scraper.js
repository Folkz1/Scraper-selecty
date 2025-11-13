const puppeteer = require('puppeteer');
const { initializeConfig, ErrorCodes } = require('./config');
const SelectyAuthenticator = require('./auth/SelectyAuthenticator');
const SelectyNavigator = require('./navigation/SelectyNavigator');
const VacancyExtractor = require('./extraction/VacancyExtractor');
const VacancyFormatter = require('./formatting/VacancyFormatter');

class SelectyScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.config = null;
  }

  /**
   * Inicializa o scraper e o navegador
   */
  async initialize() {
    try {
      console.log('Inicializando configuração...');
      this.config = initializeConfig();
      
      console.log('Iniciando navegador...');
      const browserOptions = this.config.getBrowserOptions();
      this.browser = await puppeteer.launch(browserOptions);
      
      this.page = await this.browser.newPage();
      
      // Configura viewport
      await this.page.setViewport({
        width: 1920,
        height: 1080
      });

      // Configura user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      console.log('Navegador iniciado com sucesso');
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Executa o scraper completo
   * @returns {Promise<Object>} Resultado da execução
   */
  async run() {
    const startTime = Date.now();
    
    try {
      // Inicializa
      await this.initialize();

      const configData = this.config.getConfig();
      
      // Autenticação
      console.log('\n=== FASE 1: AUTENTICAÇÃO ===');
      const authenticator = new SelectyAuthenticator(this.config);
      await authenticator.login(this.page, configData.selecty);
      await authenticator.validateLogin(this.page);
      console.log('✓ Autenticação bem-sucedida');

      // Navegação
      console.log('\n=== FASE 2: NAVEGAÇÃO ===');
      const navigator = new SelectyNavigator(this.config);
      await navigator.navigateToVacancyList(this.page, configData.selecty.vacancyUrl);
      await navigator.waitForVacancyTable(this.page);
      const totalVacancies = await navigator.getVacancyCount(this.page);
      console.log(`✓ Navegação concluída - ${totalVacancies} vagas encontradas`);

      // Extração
      console.log('\n=== FASE 3: EXTRAÇÃO DE DADOS ===');
      const extractor = new VacancyExtractor(this.config);
      const vacancies = await extractor.extractAllVacancies(this.page, totalVacancies);
      console.log(`✓ Extração concluída - ${vacancies.length} vagas extraídas`);

      // Formatação
      console.log('\n=== FASE 4: FORMATAÇÃO ===');
      const formatter = new VacancyFormatter();
      const formattedVacancies = formatter.addFormattedTextToVacancies(vacancies);
      console.log('✓ Formatação concluída');

      // Cleanup
      await this.cleanup();

      // Resultado
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        totalVacancies: formattedVacancies.length,
        vacancies: formattedVacancies,
        executionTime: `${duration}s`
      };

      console.log(`\n✓ Scraper concluído com sucesso em ${duration}s`);
      
      return result;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Limpa recursos (fecha navegador)
   */
  async cleanup() {
    try {
      if (this.browser) {
        console.log('Fechando navegador...');
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('Navegador fechado');
      }
    } catch (error) {
      console.error('Erro ao fechar navegador:', error.message);
    }
  }

  /**
   * Trata erros e retorna JSON formatado
   * @param {Error} error - Erro capturado
   * @returns {Object} Objeto de erro formatado
   */
  handleError(error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.toJSON) {
      return error.toJSON();
    }

    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      errorType: 'UNKNOWN_ERROR',
      details: error.stack,
      vacancies: []
    };
  }
}

/**
 * Função principal para executar o scraper
 */
async function main() {
  const scraper = new SelectyScraper();
  
  try {
    const result = await scraper.run();
    
    // Output JSON para stdout (para consumo do N8N)
    console.log('\n=== RESULTADO JSON ===');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(ErrorCodes.SUCCESS);
  } catch (error) {
    const errorResult = scraper.handleError(error);
    
    // Output JSON de erro
    console.log('\n=== ERRO JSON ===');
    console.log(JSON.stringify(errorResult, null, 2));
    
    // Exit com código apropriado
    const exitCode = error.exitCode || ErrorCodes.UNKNOWN_ERROR;
    process.exit(exitCode);
  }
}

// Executa se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = SelectyScraper;
