const twilio = require('twilio');
const config = require('../config/env');
const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.client = twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    this.phoneNumber = config.twilio.phoneNumber;
  }

  async sendSMS(phoneNumber, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: phoneNumber
      });

      logger.info(`SMS sent to ${phoneNumber}: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date()
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      throw error;
    }
  }

  async sendWhatsApp(phoneNumber, message) {
    try {
      // WhatsApp via Twilio requires setup
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.phoneNumber}`,
        to: `whatsapp:${phoneNumber}`
      });

      logger.info(`WhatsApp sent to ${phoneNumber}: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date()
      };
    } catch (error) {
      logger.error(`Failed to send WhatsApp to ${phoneNumber}:`, error);
      throw error;
    }
  }

  verifyWebhookSignature(twilioSignature, url, params) {
    try {
      return twilio.validateRequest(
        config.twilio.authToken,
        twilioSignature,
        url,
        params
      );
    } catch (error) {
      logger.error('Twilio webhook verification failed:', error);
      return false;
    }
  }

  parseIncomingMessage(params) {
    return {
      from: params.From,
      to: params.To,
      body: params.Body,
      messageSid: params.MessageSid,
      accountSid: params.AccountSid,
      timestamp: new Date()
    };
  }
}

module.exports = new TwilioService();
