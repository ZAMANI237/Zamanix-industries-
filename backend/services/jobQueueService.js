const Queue = require('bull');
const config = require('../config/env');
const logger = require('../utils/logger');
const claudeService = require('./claudeService');
const twilioService = require('./twilioService');

// Create job queues
const messageQueue = new Queue('messages', config.redis.url);
const scheduledQueue = new Queue('scheduled', config.redis.url);
const webhookQueue = new Queue('webhooks', config.redis.url);

class JobQueueService {
  constructor() {
    this.messageQueue = messageQueue;
    this.scheduledQueue = scheduledQueue;
    this.webhookQueue = webhookQueue;
    this.setupProcessors();
  }

  setupProcessors() {
    // Process message sending jobs
    this.messageQueue.process(async (job) => {
      try {
        const { phoneNumber, message, conversationId } = job.data;
        await twilioService.sendSMS(phoneNumber, message);
        logger.info(`Message job completed: ${job.id}`);
        return { success: true };
      } catch (error) {
        logger.error(`Message job failed: ${job.id}`, error);
        throw error;
      }
    });

    // Process scheduled jobs (future sends)
    this.scheduledQueue.process(async (job) => {
      try {
        const { phoneNumber, message, conversationId } = job.data;
        await twilioService.sendSMS(phoneNumber, message);
        logger.info(`Scheduled job completed: ${job.id}`);
        return { success: true };
      } catch (error) {
        logger.error(`Scheduled job failed: ${job.id}`, error);
        throw error;
      }
    });

    // Process webhook events
    this.webhookQueue.process(async (job) => {
      try {
        logger.info(`Webhook job completed: ${job.id}`);
        return { success: true };
      } catch (error) {
        logger.error(`Webhook job failed: ${job.id}`, error);
        throw error;
      }
    });
  }

  async addMessage(phoneNumber, message, conversationId) {
    try {
      const job = await this.messageQueue.add(
        { phoneNumber, message, conversationId },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );
      logger.info(`Message queued: ${job.id}`);
      return job.id;
    } catch (error) {
      logger.error('Failed to queue message:', error);
      throw error;
    }
  }

  async scheduleMessage(phoneNumber, message, conversationId, delayMs) {
    try {
      const job = await this.scheduledQueue.add(
        { phoneNumber, message, conversationId },
        { delay: delayMs }
      );
      logger.info(`Message scheduled: ${job.id}`);
      return job.id;
    } catch (error) {
      logger.error('Failed to schedule message:', error);
      throw error;
    }
  }

  async addWebhookEvent(source, eventType, payload) {
    try {
      const job = await this.webhookQueue.add(
        { source, eventType, payload },
        { attempts: 5, backoff: { type: 'exponential', delay: 2000 } }
      );
      logger.info(`Webhook queued: ${job.id}`);
      return job.id;
    } catch (error) {
      logger.error('Failed to queue webhook:', error);
      throw error;
    }
  }

  async getQueueStats() {
    const messageStats = await this.messageQueue.getJobCounts();
    const scheduledStats = await this.scheduledQueue.getJobCounts();
    const webhookStats = await this.webhookQueue.getJobCounts();

    return {
      messages: messageStats,
      scheduled: scheduledStats,
      webhooks: webhookStats
    };
  }
}

module.exports = new JobQueueService();
