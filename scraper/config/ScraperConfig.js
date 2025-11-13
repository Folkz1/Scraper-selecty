const dotenv = require('dotenv');

class ScraperConfig {
  constructor() {
    this.config = null;
  }

  /**
   * Carrega variáveis de ambiente do arquivo .env
   */
  loadEnvironmentVariables() {
    dotenv.config();
    
    this.config = {
      selecty: {
        email: process.env.SELECTY_EMAIL,
        password: process.env.SELECTY_PASSWORD,
        loginUrl: process.env.SELECTY_LOGIN_URL || 'https://selecty.app/login',
        vacancyUrl: process.env.SELECTY_VACANCY_URL || 'https://selecty.app/vacancy/lists/index'
      },
      scraper: {
        timeout: parseInt(process.env.SCRAPER_TIMEOUT) || 10000,
        headless: process.env.SCRAPER_HEADLESS !== 'false'
      },
      api: {
        port: parseInt(process.env.API_PORT) || 3000,
        apiKey: process.env.API_KEY
      }
    };

    return this.config;
  }

  /**
   * Valida se as credenciais obrigatórias estão presentes
   * @throws {Error} Se variáveis obrigatórias estiverem ausentes
   */
  validateCredentials() {
    const requiredVars = [
      { key: 'SELECTY_EMAIL', value: this.config.selecty.email },
      { key: 'SELECTY_PASSWORD', value: this.config.selecty.password }
    ];

    const missingVars = requiredVars.filter(v => !v.value);

    if (missingVars.length > 0) {
      const missingKeys = missingVars.map(v => v.key).join(', ');
      throw new Error(
        `Variáveis de ambiente obrigatórias ausentes: ${missingKeys}. ` +
        `Por favor, configure essas variáveis no arquivo .env`
      );
    }
  }

  /**
   * Retorna o timeout configurado para operações do scraper
   * @returns {number} Timeout em milissegundos
   */
  getTimeout() {
    return this.config.scraper.timeout;
  }

  /**
   * Retorna as opções de configuração do navegador Puppeteer
   * @returns {Object} Opções do Puppeteer
   */
  getBrowserOptions() {
    const options = {
      headless: this.config.scraper.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    };

    // Se estiver rodando em Docker, usar o Chromium instalado
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    return options;
  }

  /**
   * Retorna a configuração completa
   * @returns {Object} Objeto de configuração
   */
  getConfig() {
    return this.config;
  }
}

module.exports = ScraperConfig;
