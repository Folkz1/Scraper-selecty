const rateLimit = require('express-rate-limit');

/**
 * Rate limiter: 10 requests per hour per IP
 */
const scraperRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 requests por hora por IP
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Maximum 10 requests per hour allowed.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { scraperRateLimit };