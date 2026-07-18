const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config/env');
const logger = require('../utils/logger');

class StripeService {
  async createPaymentLink({
    customerEmail,
    customerName,
    amount,
    description,
    conversationId
  }) {
    try {
      const link = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: description || 'Payment for services'
              },
              unit_amount: Math.round(amount * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${config.frontend.url}/payment-success?conversation=${conversationId}`
          }
        },
        customer_creation: 'always',
        metadata: {
          conversationId,
          customerName,
          customerEmail
        }
      });

      logger.info(`Payment link created: ${link.url}`);
      return {
        paymentLinkId: link.id,
        url: link.url,
        amount,
        status: link.status
      };
    } catch (error) {
      logger.error('Stripe payment link creation error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripe.webhookSecret
      );
      return event;
    } catch (error) {
      logger.error('Stripe webhook verification failed:', error);
      return null;
    }
  }

  async handlePaymentSuccess(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      logger.info(`Payment confirmed: ${paymentIntentId}`);
      return {
        success: true,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      logger.error('Stripe payment retrieval error:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
