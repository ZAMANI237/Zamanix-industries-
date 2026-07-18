const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const logger = require('../utils/logger');

const router = express.Router();

// Get conversation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const businessId = req.businessId;

    // Get conversation
    const conversation = await db.one(
      'SELECT * FROM conversations WHERE id = $1 AND business_id = $2',
      [id, businessId]
    );

    // Get messages
    const messages = await db.manyOrNone(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({ conversation, messages });
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Add message to conversation
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { content } = req.body;
    const businessId = req.businessId;

    // Verify conversation belongs to business
    const conversation = await db.one(
      'SELECT * FROM conversations WHERE id = $1 AND business_id = $2',
      [id, businessId]
    );

    // Store message
    const messageId = uuidv4();
    await db.none(
      `INSERT INTO messages (id, conversation_id, message_type, content, sender)
       VALUES ($1, $2, 'business_owner', $3, 'business_owner')`,
      [messageId, id, content]
    );

    logger.info(`Message added to conversation ${id}`);
    res.status(201).json({ messageId });
  } catch (error) {
    logger.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Escalate conversation
router.post('/:id/escalate', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { reason } = req.body;
    const businessId = req.businessId;

    // Update conversation
    await db.none(
      'UPDATE conversations SET status = $1 WHERE id = $2 AND business_id = $3',
      ['escalated', id, businessId]
    );

    logger.info(`Conversation ${id} escalated: ${reason}`);
    res.json({ status: 'escalated' });
  } catch (error) {
    logger.error('Escalate conversation error:', error);
    res.status(500).json({ error: 'Failed to escalate' });
  }
});

module.exports = router;
