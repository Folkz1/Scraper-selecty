/**
 * Códigos de erro padronizados para o scraper
 */
const ErrorCodes = {
  SUCCESS: 0,
  AUTH_ERROR: 1,
  NAVIGATION_ERROR: 2,
  ENVIRONMENT_ERROR: 3,
  EXTRACTION_ERROR: 4,
  UNKNOWN_ERROR: 5
};

/**
 * Tipos de erro para logging e tratamento
 */
const ErrorTypes = {
  AUTH_ERROR: 'AUTH_ERROR',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  ENVIRONMENT_ERROR: 'ENVIRONMENT_ERROR',
  EXTRACTION_ERROR: 'EXTRACTION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Classe de erro customizada para o scraper
 */
class ScraperError extends Error {
  constructor(message, type, exitCode, details = null) {
    super(message);
    this.name = 'ScraperError';
    this.type = type;
    this.exitCode = exitCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Converte o erro para formato JSON
   */
  toJSON() {
    return {
      success: false,
      timestamp: this.timestamp,
      error: this.message,
      errorType: this.type,
      details: this.details,
      vacancies: []
    };
  }
}

module.exports = {
  ErrorCodes,
  ErrorTypes,
  ScraperError
};
