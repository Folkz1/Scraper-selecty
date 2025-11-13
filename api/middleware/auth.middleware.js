/**
 * Middleware de autenticação por Bearer token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid Bearer token'
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY not configured in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
  }

  if (token !== apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided token is not valid'
    });
  }

  next();
}

module.exports = { authenticateToken };