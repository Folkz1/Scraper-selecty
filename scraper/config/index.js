const ScraperConfig = require('./ScraperConfig');
const { ErrorCodes, ErrorTypes, ScraperError } = require('./ErrorCodes');

/**
 * Inicializa e valida a configuração do scraper
 * @returns {ScraperConfig} Instância configurada
 * @throws {ScraperError} Se variáveis obrigatórias estiverem ausentes
 */
function initializeConfig() {
  const config = new ScraperConfig();
  
  try {
    config.loadEnvironmentVariables();
    config.validateCredentials();
    return config;
  } catch (error) {
    // Lança erro específico de ambiente com exit code 3
    throw new ScraperError(
      error.message,
      ErrorTypes.ENVIRONMENT_ERROR,
      ErrorCodes.ENVIRONMENT_ERROR,
      'Verifique se o arquivo .env existe e contém todas as variáveis necessárias'
    );
  }
}

module.exports = {
  ScraperConfig,
  ErrorCodes,
  ErrorTypes,
  ScraperError,
  initializeConfig
};
