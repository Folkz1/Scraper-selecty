const curriculumService = require('../services/curriculum.service');

/**
 * Controller para gerenciamento de currículos
 */
const curriculumController = {
  /**
   * POST /api/curriculum
   * Cria um novo currículo no Selecty
   */
  async create(req, res) {
    try {
      const curriculumData = req.body;

      console.log('📥 Received curriculum creation request');
      console.log('   Data:', JSON.stringify({
        nome: curriculumData.nome,
        cpf: curriculumData.cpf ? '***' + curriculumData.cpf.slice(-4) : null,
        email: curriculumData.email
      }));

      const result = await curriculumService.createCurriculum(curriculumData);

      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating curriculum:', error.message);
      
      // Determinar status code baseado no tipo de erro
      let statusCode = 500;
      if (error.message.includes('Missing required fields')) {
        statusCode = 400;
      } else if (error.message.includes('Invalid')) {
        statusCode = 400;
      } else if (error.message.includes('already in progress')) {
        statusCode = 429;
      }

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * GET /api/curriculum/status
   * Retorna o status atual do serviço de criação de currículos
   */
  async getStatus(req, res) {
    try {
      const status = curriculumService.getStatus();
      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/curriculum/last
   * Retorna o último resultado de criação
   */
  async getLastResult(req, res) {
    try {
      const lastResult = curriculumService.getLastResult();
      
      if (!lastResult) {
        return res.status(404).json({
          success: false,
          message: 'No curriculum creation has been executed yet'
        });
      }

      res.json(lastResult);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = curriculumController;
