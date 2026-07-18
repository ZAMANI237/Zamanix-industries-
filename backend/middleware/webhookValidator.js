const twilioService = require('../services/twilioService');
const stripeService = require('../services/stripeService');
const logger = require('../utils/logger');
const config = require('../config/env');

const validateTwilioWebhook = (req, res, next) => {
  if (!config.webhook.enableValidation) {
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${config.frontend.url}${req.originalUrl}`;
  
  if (!twilioService.verifyWebhookSignature(twilioSignature, url, req.body)) {
    logger.warn('Invalid Twilio webhook signature');
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }
  
  next();
};

const validateStripeWebhook = (req, res, next) => {
  if (!config.webhook.enableValidation) {
    return next();
  }

  const signature = req.headers['stripe-signature'];
  const event = stripeService.verifyWebhookSignature(req.rawBody || req.body, signature);
  
  if (!event) {
    logger.warn('Invalid Stripe webhook signature');
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }
  
  req.stripeEvent = event;
  next();
};

module.exports = { validateTwilioWebhook, validateStripeWebhook };
