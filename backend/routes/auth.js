const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { validateEmail, validatePassword, handleValidationErrors } = require('../utils/validators');
const logger = require('../utils/logger');

const router = express.Router();

// Register
router.post(
  '/register',
  validateEmail(),
  validatePassword(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, phone, industry } = req.body;
      const db = req.app.locals.db;

      // Check if business exists
      const existing = await db.oneOrNone(
        'SELECT id FROM businesses WHERE email = $1',
        [email]
      );

      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create business
      const businessId = uuidv4();
      await db.none(
        `INSERT INTO businesses (id, name, email, phone, industry, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [businessId, name, email, phone, industry]
      );

      // Create default config
      await db.none(
        `INSERT INTO business_config (id, business_id, created_at)
         VALUES ($1, $2, NOW())`,
        [uuidv4(), businessId]
      );

      const token = generateToken(businessId);

      logger.info(`Business registered: ${businessId}`);
      res.status(201).json({
        businessId,
        token,
        message: 'Registration successful'
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login', validateEmail(), validatePassword(), handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    // Find business (note: password not stored yet in current schema)
    const business = await db.oneOrNone(
      'SELECT id FROM businesses WHERE email = $1',
      [email]
    );

    if (!business) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(business.id);

    logger.info(`Business logged in: ${business.id}`);
    res.json({
      businessId: business.id,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current business
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const business = await db.one(
      'SELECT id, name, email, phone, industry FROM businesses WHERE id = $1',
      [req.businessId]
    );

    res.json(business);
  } catch (error) {
    logger.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

module.exports = router;
