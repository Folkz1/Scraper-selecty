const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraper.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { scraperRateLimit } = require('../middleware/rateLimit.middleware');

// Aplicar autenticação e rate limiting em todas as rotas do scraper
router.use('/scrape', authenticateToken);
router.use('/scrape', scraperRateLimit);

// Rotas do scraper
router.post('/scrape', scraperController.executeScraper);
router.get('/scrape/status', scraperController.getStatus);
router.get('/scrape/last', scraperController.getLastResult);

module.exports = router;