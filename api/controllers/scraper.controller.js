const scraperService = require('../services/scraper.service');

class ScraperController {
  /**
   * POST /api/scrape - Executa o scraper
   */
  async executeScraper(req, res) {
    try {
      // Verificar se já está executando
      const status = scraperService.getStatus();
      if (status.isRunning) {
        return res.status(409).json({
          success: false,
          error: 'Scraper already running',
          message: 'Please wait for current execution to complete',
          status: status
        });
      }

      // Executar scraper
      const result = await scraperService.executeScraper();
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Controller error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Scraper execution failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/scrape/status - Retorna status do scraper
   */
  async getStatus(req, res) {
    try {
      const status = scraperService.getStatus();
      
      res.status(200).json({
        success: true,
        ...status
      });
      
    } catch (error) {
      console.error('Status error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get status',
        message: error.message
      });
    }
  }

  /**
   * GET /api/scrape/last - Retorna último resultado em cache
   */
  async getLastResult(req, res) {
    try {
      const lastResult = scraperService.getLastResult();
      
      if (!lastResult) {
        return res.status(404).json({
          success: false,
          error: 'No cached results',
          message: 'No previous execution results available'
        });
      }

      res.status(200).json(lastResult);
      
    } catch (error) {
      console.error('Last result error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get last result',
        message: error.message
      });
    }
  }
}

module.exports = new ScraperController();