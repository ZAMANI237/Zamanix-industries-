const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const twilioService = require('../services/twilioService');
const logger = require('../utils/logger');
const jobQueue = require('../services/jobQueueService');

const router = express.Router();

// Create campaign
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { trigger_type, customers, message_channel } = req.body;
    const db = req.app.locals.db;
    const businessId = req.businessId;

    // Validate input
    if (!trigger_type || !customers || customers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get business info
    const business = await db.one(
      'SELECT * FROM businesses WHERE id = $1',
      [businessId]
    );

    // Get business config
    const config = await db.one(
      'SELECT * FROM business_config WHERE business_id = $1',
      [businessId]
    );

    const campaignId = uuidv4();
    let messageCount = 0;

    // Process each customer
    for (const customer of customers) {
      try {
        // Draft message using Claude
        const { message: draftedMessage } = await claudeService.draftMessage({
          businessName: business.name,
          businessType: business.industry,
          customerName: customer.name,
          triggerType: trigger_type,
          appointmentDate: customer.appointment_date,
          appointmentValue: customer.appointment_value,
          brandTone: config.brand_tone,
          lastVisitDate: customer.last_visit_date,
          amountOwed: customer.amount_owed
        });

        // Create trigger
        const triggerId = uuidv4();
        await db.none(
          `INSERT INTO triggers (id, business_id, customer_id, trigger_type, appointment_date, appointment_value, processed)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [triggerId, businessId, customer.id, trigger_type, customer.appointment_date, customer.appointment_value]
        );

        // Create conversation
        const conversationId = uuidv4();
        await db.none(
          `INSERT INTO conversations (id, business_id, customer_id, trigger_id, channel, status)
           VALUES ($1, $2, $3, $4, $5, 'active')`,
          [conversationId, businessId, customer.id, triggerId, message_channel]
        );

        // Store drafted message
        await db.none(
          `INSERT INTO messages (id, conversation_id, message_type, content, sender, ai_model_used)
           VALUES ($1, $2, 'ai_outreach', $3, 'ai', 'claude')`,
          [uuidv4(), conversationId, draftedMessage]
        );

        // Send via Twilio (or queue it)
        if (customer.phone) {
          await jobQueue.addMessage(customer.phone, draftedMessage, conversationId);
          messageCount++;
        }
      } catch (error) {
        logger.error(`Failed to process customer ${customer.id}:`, error);
      }
    }

    logger.info(`Campaign created: ${campaignId}, ${messageCount} messages queued`);
    res.status(201).json({
      campaignId,
      messageCount,
      status: 'queued'
    });
  } catch (error) {
    logger.error('Campaign creation error:', error);
    res.status(500).json({ error: 'Campaign creation failed' });
  }
});

// Get campaign status
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const businessId = req.businessId;

    // Get campaign summary (using triggers as proxy)
    const stats = await db.one(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as completed
       FROM conversations
       WHERE business_id = $1`,
      [businessId]
    );

    res.json(stats);
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

module.exports = router;
