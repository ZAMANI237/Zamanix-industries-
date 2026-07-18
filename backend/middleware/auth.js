const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.businessId = decoded.businessId;
      req.business = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please refresh your token'
        });
      }
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateToken = (businessId) => {
  return jwt.sign(
    { businessId },
    config.jwt.secret,
    { expiresIn: config.jwt.expire }
  );
};

module.exports = { authMiddleware, generateToken };
