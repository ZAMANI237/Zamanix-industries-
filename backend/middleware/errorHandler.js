const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Validation errors
  if (err.array) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.array()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(409).json({
      error: 'Database constraint violation',
      message: err.message
    });
  }

  // API errors
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error: err.response.statusText || 'External API error',
      message: err.response.data?.message || err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
