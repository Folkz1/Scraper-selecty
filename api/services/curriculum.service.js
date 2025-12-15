const SelectyScraper = require('../../scraper/selecty-scraper');
const CurriculumCreator = require('../../scraper/curriculum/CurriculumCreator');
const SelectyAuthenticator = require('../../scraper/auth/SelectyAuthenticator');

class CurriculumService {
  constructor() {
    this.isRunning = false;
    this.lastExecution = null;
    this.lastResult = null;
  }

  /**
   * Cria um novo currículo no Selecty
   * @param {Object} curriculumData - Dados do currículo
   * @returns {Promise<Object>} Resultado da criação
   */
  async createCurriculum(curriculumData) {
    if (this.isRunning) {
      throw new Error('Curriculum creation already in progress. Please wait.');
    }

    // Validar campos obrigatórios
    this.validateRequiredFields(curriculumData);

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log('🚀 Starting curriculum creation...');
      
      // Inicializar scraper
      const scraper = new SelectyScraper();
      await scraper.initialize();

      const configData = scraper.config.getConfig();

      // Autenticação
      console.log('🔐 Authenticating...');
      const authenticator = new SelectyAuthenticator(scraper.config);
      await authenticator.login(scraper.page, configData.selecty);
      await authenticator.validateLogin(scraper.page);
      console.log('✓ Authenticated successfully');

      // Criar currículo
      console.log('📝 Creating curriculum...');
      const creator = new CurriculumCreator(scraper.config);
      const creationResult = await creator.createCurriculum(scraper.page, curriculumData);

      // Cleanup
      await scraper.cleanup();

      const endTime = new Date();
      const executionTime = endTime - startTime;

      const result = {
        success: creationResult.success,
        timestamp: endTime.toISOString(),
        executionTime: `${Math.round(executionTime / 1000)}s`,
        message: creationResult.message,
        curriculum: {
          nome: curriculumData.nome,
          cpf: curriculumData.cpf,
          email: curriculumData.email
        }
      };

      // Cache do resultado
      this.lastExecution = endTime;
      this.lastResult = result;

      console.log(`✅ Curriculum creation completed: ${result.message}`);
      
      return result;

    } catch (error) {
      console.error('❌ Curriculum creation failed:', error);
      
      const errorResult = {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        curriculum: null
      };

      this.lastExecution = new Date();
      this.lastResult = errorResult;

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Valida campos obrigatórios
   */
  validateRequiredFields(data) {
    const requiredFields = ['nome', 'cpf', 'email'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar formato do CPF (11 dígitos)
    const cpfClean = data.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      throw new Error('Invalid CPF format. Must have 11 digits.');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format.');
    }
  }

  /**
   * Retorna o status atual do serviço
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
   * Retorna o último resultado
   */
  getLastResult() {
    return this.lastResult;
  }
}

// Singleton instance
const curriculumService = new CurriculumService();

module.exports = curriculumService;
