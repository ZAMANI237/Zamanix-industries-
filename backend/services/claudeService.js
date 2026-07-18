const { Anthropic } = require('@anthropic-ai/sdk');
const config = require('../config/env');
const logger = require('../utils/logger');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey
    });
    this.model = config.claude.model;
  }

  async draftMessage({
    businessName,
    businessType,
    customerName,
    triggerType,
    appointmentDate,
    appointmentValue,
    brandTone,
    lastVisitDate,
    amountOwed
  }) {
    try {
      let context = '';
      let task = '';

      // Build context based on trigger type
      if (triggerType === 'noshow' || triggerType === 'cancellation') {
        context = `Customer "${customerName}" missed/cancelled appointment on ${appointmentDate} (${businessType}, value: $${appointmentValue})`;
        task = 'Draft ONE friendly, casual message to reschedule the appointment. Keep under 3 sentences. Offer specific action (day/time or link).';
      } else if (triggerType === 'lapsed_customer') {
        context = `Customer "${customerName}" hasn't visited since ${lastVisitDate} (${businessType})`;
        task = 'Draft ONE friendly message to re-engage. Keep under 3 sentences. Offer to schedule an appointment.';
      } else if (triggerType === 'unpaid_invoice') {
        context = `Customer "${customerName}" has unpaid invoice for $${amountOwed} (${businessType})`;
        task = 'Draft ONE friendly payment reminder. Keep under 3 sentences. Include call-to-action for payment.';
      }

      const systemPrompt = `You are a friendly front-desk assistant texting on behalf of ${businessName}, a ${businessType}.

Your tone: ${brandTone || 'casual and warm'}

Rules:
- Keep every message under 3 sentences
- Always offer a specific, easy next action
- Never sound like a bot
- Use contractions (that's, we'll, can't)
- If mentioning a link, just say "here's a link" or "tap here"
- No corporate phrases`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `${context}\n\nTask: ${task}`
          }
        ],
        system: systemPrompt
      });

      const draftedMessage = response.content[0].text.trim();
      logger.info(`Claude drafted message for ${customerName}: ${draftedMessage.substring(0, 50)}...`);
      
      return {
        message: draftedMessage,
        model: this.model,
        tokens: response.usage.output_tokens
      };
    } catch (error) {
      logger.error('Claude draft message error:', error);
      throw error;
    }
  }

  async handleCustomerReply({
    customerMessage,
    businessName,
    businessType,
    conversationHistory,
    triggerType
  }) {
    try {
      const historyContext = conversationHistory
        .map(msg => `${msg.sender === 'ai' ? 'You' : 'Customer'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are a booking assistant for ${businessName}, a ${businessType}.

Respond with a JSON object (no markdown, just raw JSON):
{
  "action": "confirm_booking" | "ask_for_time" | "confirm_payment" | "decline" | "escalate",
  "response_message": "your message here",
  "booking_date": "YYYY-MM-DD" (if confirm_booking),
  "booking_time": "HH:MM" (if confirm_booking),
  "confidence": 0.0-1.0
}

Rules:
- If customer confirmed a time/date, action = "confirm_booking"
- If customer is asking for options, action = "ask_for_time"
- If upset or confused, action = "escalate"
- If explicitly declined, action = "decline"
- Always respond with valid JSON`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Conversation history:\n${historyContext}\n\nCustomer just replied: "${customerMessage}"\n\nWhat should you do?`
          }
        ],
        system: systemPrompt
      });

      const responseText = response.content[0].text.trim();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!decision) {
        throw new Error('Failed to parse Claude decision');
      }

      logger.info(`Claude decision: ${decision.action}`);
      return decision;
    } catch (error) {
      logger.error('Claude reply handling error:', error);
      throw error;
    }
  }

  async generateWeeklyReport({
    businessName,
    conversationsSummary,
    totalRecovered
  }) {
    try {
      const prompt = `Generate a friendly, encouraging 2-3 sentence summary for a business owner about their recovery metrics this week.

Business: ${businessName}
Conversations: ${conversationsSummary}
Total Revenue Recovered: $${totalRecovered}

Keep it warm and motivational.`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text.trim();
    } catch (error) {
      logger.error('Claude report generation error:', error);
      throw error;
    }
  }
}

module.exports = new ClaudeService();
