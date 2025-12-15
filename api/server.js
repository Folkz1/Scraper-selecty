const express = require('express');
const cors = require('cors');
const scraperRoutes = require('./routes/scraper.routes');
const curriculumRoutes = require('./routes/curriculum.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Selecty Scraper API',
    endpoints: {
      scrape: '/api/scrape',
      curriculum: '/api/curriculum'
    }
  });
});

// API Routes
app.use('/api', scraperRoutes);
app.use('/api/curriculum', curriculumRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Selecty Scraper API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Scraper endpoint: http://localhost:${PORT}/api/scrape`);
  console.log(`📝 Curriculum endpoint: http://localhost:${PORT}/api/curriculum`);
});

module.exports = app;