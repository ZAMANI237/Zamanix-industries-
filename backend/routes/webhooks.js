const express = require('express');
const { v4: uuidv4 } = require('uuid');
const twilioService = require('../services/twilioService');
const claudeService = require('../services/claudeService');
const logger = require('../utils/logger');
const { validateTwilioWebhook } = require('../middleware/webhookValidator');

const router = express.Router();

// Receive SMS reply from Twilio
router.post('/sms', validateTwilioWebhook, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const message = twilioService.parseIncomingMessage(req.body);

    logger.info(`SMS received from ${message.from}: ${message.body}`);

    // Find conversation by phone number
    const conversation = await db.oneOrNone(
      `SELECT c.*, cust.name as customer_name
       FROM conversations c
       JOIN customers cust ON c.customer_id = cust.id
       WHERE cust.phone = $1
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [message.from]
    );

    if (!conversation) {
      logger.warn(`No conversation found for ${message.from}`);
      return res.status(404).json({ error: 'No active conversation' });
    }

    // Store customer reply
    const messageId = uuidv4();
    await db.none(
      `INSERT INTO messages (id, conversation_id, message_type, content, sender, external_id)
       VALUES ($1, $2, 'customer_reply', $3, 'customer', $4)`,
      [messageId, conversation.id, message.body, message.messageSid]
    );

    // Get conversation history
    const messages = await db.manyOrNone(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversation.id]
    );

    // Get business for tone/context
    const business = await db.one(
      'SELECT * FROM businesses WHERE id = $1',
      [conversation.business_id]
    );

    // Claude decides action
    const decision = await claudeService.handleCustomerReply({
      customerMessage: message.body,
      businessName: business.name,
      businessType: business.industry,
      conversationHistory: messages,
      triggerType: 'noshow' // TODO: get from conversation
    });

    // Store AI response
    if (decision.response_message) {
      await db.none(
        `INSERT INTO messages (id, conversation_id, message_type, content, sender, ai_model_used)
         VALUES ($1, $2, 'ai_response', $3, 'ai', 'claude')`,
        [uuidv4(), conversation.id, decision.response_message]
      );

      // Send AI response
      await twilioService.sendSMS(message.from, decision.response_message);
    }

    // Log outcome if conversation should close
    if (decision.action === 'confirm_booking' || decision.action === 'confirm_payment') {
      await db.none(
        `INSERT INTO outcomes (id, conversation_id, business_id, customer_id, outcome_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), conversation.id, conversation.business_id, conversation.customer_id, decision.action]
      );

      await db.none(
        'UPDATE conversations SET status = $1 WHERE id = $2',
        ['closed', conversation.id]
      );
    }

    res.json({ success: true, decision: decision.action });
  } catch (error) {
    logger.error('SMS webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Calendly webhook (appointment events)
router.post('/calendly', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { event_type, data } = req.body;

    logger.info(`Calendly webhook: ${event_type}`);

    // Store webhook for processing
    await db.none(
      `INSERT INTO webhooks (id, source, event_type, payload, created_at)
       VALUES ($1, 'calendly', $2, $3, NOW())`,
      [uuidv4(), event_type, JSON.stringify(req.body)]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Calendly webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook (payment events)
router.post('/stripe', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { type, data } = req.body;

    logger.info(`Stripe webhook: ${type}`);

    // Store webhook for processing
    await db.none(
      `INSERT INTO webhooks (id, source, event_type, payload, created_at)
       VALUES ($1, 'stripe', $2, $3, NOW())`,
      [uuidv4(), type, JSON.stringify(req.body)]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
