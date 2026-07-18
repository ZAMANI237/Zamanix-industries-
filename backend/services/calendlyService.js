const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

class CalendlyService {
  constructor() {
    this.apiUrl = config.calendly.apiUrl;
    this.token = config.calendly.token;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAvailableSlots(eventTypeUri, startDate, endDate) {
    try {
      // Get available slots for the event type
      const response = await this.client.get('/event_type_available_times', {
        params: {
          event_type: eventTypeUri,
          date_range: {
            start_date: startDate,
            end_date: endDate
          }
        }
      });

      logger.info(`Retrieved ${response.data.available_times.length} slots for ${eventTypeUri}`);
      return response.data.available_times;
    } catch (error) {
      logger.error('Calendly get slots error:', error.response?.data || error);
      throw error;
    }
  }

  async createBooking({
    eventTypeUri,
    customerName,
    customerEmail,
    customerPhone,
    startTime
  }) {
    try {
      const response = await this.client.post('/scheduled_events', {
        event_type: eventTypeUri,
        invitees: [
          {
            name: customerName,
            email: customerEmail,
            phone_number: customerPhone
          }
        ],
        start_time: startTime
      });

      logger.info(`Booking created: ${response.data.resource.uri}`);
      return {
        bookingId: response.data.resource.uri,
        status: response.data.resource.status,
        startTime: response.data.resource.start_time,
        endTime: response.data.resource.end_time
      };
    } catch (error) {
      logger.error('Calendly booking creation error:', error.response?.data || error);
      throw error;
    }
  }

  async getEventTypes() {
    try {
      const response = await this.client.get('/event_types');
      return response.data.collection;
    } catch (error) {
      logger.error('Calendly get event types error:', error.response?.data || error);
      throw error;
    }
  }

  async cancelBooking(bookingUri) {
    try {
      const response = await this.client.delete(bookingUri);
      logger.info(`Booking cancelled: ${bookingUri}`);
      return { success: true };
    } catch (error) {
      logger.error('Calendly cancel booking error:', error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new CalendlyService();
