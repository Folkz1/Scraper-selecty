const SelectyScraper = require('../../scraper/selecty-scraper');

class ScraperService {
  constructor() {
    this.isRunning = false;
    this.lastExecution = null;
    this.lastResult = null;
  }

  /**
   * Executa o scraper e retorna os resultados
   * @returns {Promise<Object>} Resultado da execução
   */
  async executeScraper() {
    if (this.isRunning) {
      throw new Error('Scraper is already running. Please wait for current execution to complete.');
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log('🚀 Starting scraper execution...');
      
      const scraper = new SelectyScraper();
      await scraper.initialize();

      const configData = scraper.config.getConfig();

      // Autenticação
      console.log('🔐 Authenticating...');
      const SelectyAuthenticator = require('../../scraper/auth/SelectyAuthenticator');
      const authenticator = new SelectyAuthenticator(scraper.config);
      await authenticator.login(scraper.page, configData.selecty);
      await authenticator.validateLogin(scraper.page);

      // Navegação
      console.log('🧭 Navigating to vacancy list...');
      const SelectyNavigator = require('../../scraper/navigation/SelectyNavigator');
      const navigator = new SelectyNavigator(scraper.config);
      await navigator.navigateToVacancyList(scraper.page, configData.selecty.vacancyUrl);
      await navigator.waitForVacancyTable(scraper.page);
      const totalVacancies = await navigator.getVacancyCount(scraper.page);

      // Extração
      console.log(`📊 Extracting ${totalVacancies} vacancies...`);
      const VacancyExtractor = require('../../scraper/extraction/VacancyExtractor');
      const extractor = new VacancyExtractor(scraper.config);
      const vacancies = await extractor.extractAllVacancies(scraper.page, totalVacancies);

      // Formatação
      console.log('📝 Formatting data...');
      const VacancyFormatter = require('../../scraper/formatting/VacancyFormatter');
      const formatter = new VacancyFormatter();
      const formattedVacancies = formatter.addFormattedTextToVacancies(vacancies);

      // Cleanup
      await scraper.cleanup();

      const endTime = new Date();
      const executionTime = endTime - startTime;

      // Estatísticas
      const statusCount = {};
      vacancies.forEach(vaga => {
        const status = vaga.statusVaga || 'Não informado';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      const result = {
        success: true,
        timestamp: endTime.toISOString(),
        executionTime: `${Math.round(executionTime / 1000)}s`,
        totalVacancies: totalVacancies,
        extractedVacancies: vacancies.length,
        successRate: `${Math.round((vacancies.length / totalVacancies) * 100)}%`,
        statusDistribution: statusCount,
        vacancies: formattedVacancies
      };

      // Cache do resultado
      this.lastExecution = endTime;
      this.lastResult = result;

      console.log(`✅ Scraper completed successfully: ${vacancies.length}/${totalVacancies} vacancies extracted`);
      
      return result;

    } catch (error) {
      console.error('❌ Scraper execution failed:', error);
      
      const errorResult = {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        totalVacancies: 0,
        extractedVacancies: 0,
        vacancies: []
      };

      this.lastExecution = new Date();
      this.lastResult = errorResult;

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Retorna o status atual do scraper
   * @returns {Object} Status do scraper
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      hasCache: this.lastResult !== null,
      lastSuccess: this.lastResult ? this.lastResult.success : null
    };
  }

  /**
   * Retorna o último resultado em cache
   * @returns {Object|null} Último resultado ou null se não houver cache
   */
  getLastResult() {
    return this.lastResult;
  }
}

// Singleton instance
const scraperService = new ScraperService();

module.exports = scraperService;