# API Documentation

Complete reference for all backend endpoints.

---

## Authentication

All endpoints (except health check) require a JWT token.

### Include in Request Header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-07-18T10:00:00Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

### Register Business
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "Glow Salon",
  "email": "owner@glowsalon.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "industry": "salon"
}
```

**Response:**
```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful"
}
```

---

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "owner@glowsalon.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

---

### Get Current Business
```
GET /api/auth/me
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Glow Salon",
  "email": "owner@glowsalon.com",
  "phone": "+1234567890",
  "industry": "salon"
}
```

---

### Create Campaign
```
POST /api/campaigns/create
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "trigger_type": "noshow",
  "message_channel": "sms",
  "customers": [
    {
      "id": "cust_1",
      "name": "Sarah Johnson",
      "phone": "+15551234567",
      "email": "sarah@email.com",
      "appointment_date": "2026-07-16",
      "appointment_value": 85.00
    }
  ]
}
```

**Response:**
```json
{
  "campaignId": "campaign_abc123",
  "messageCount": 1,
  "status": "queued"
}
```

**Trigger Types:**
- `noshow` — Customer missed appointment
- `cancellation` — Customer cancelled appointment
- `lapsed_customer` — Customer hasn't visited in X days
- `unpaid_invoice` — Customer has unpaid invoice

**Message Channels:**
- `sms` — SMS via Twilio
- `whatsapp` — WhatsApp via Twilio
- `email` — Email
- `voice` — Phone call (Retell AI)

---

### Get Campaign Status
```
GET /api/campaigns/:id
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "total": 12,
  "completed": 3
}
```

---

### Get Conversation
```
GET /api/conversations/:id
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "conversation": {
    "id": "conv_789",
    "business_id": "biz_123",
    "customer_id": "cust_456",
    "channel": "sms",
    "status": "active",
    "created_at": "2026-07-16T14:00:00Z"
  },
  "messages": [
    {
      "id": "msg_1",
      "message_type": "ai_outreach",
      "content": "Hey Sarah! Saw you had to miss your appointment...",
      "sender": "ai",
      "created_at": "2026-07-16T14:00:00Z"
    },
    {
      "id": "msg_2",
      "message_type": "customer_reply",
      "content": "Tuesday works!",
      "sender": "customer",
      "created_at": "2026-07-16T14:15:00Z"
    }
  ]
}
```

---

### Add Message to Conversation
```
POST /api/conversations/:id/messages
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "content": "Perfect! I'll book you for Tuesday at 10:30 AM."
}
```

**Response:**
```json
{
  "messageId": "msg_123"
}
```

---

### Escalate Conversation
```
POST /api/conversations/:id/escalate
Headers: Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "reason": "customer_upset"
}
```

**Response:**
```json
{
  "status": "escalated"
}
```

**Escalation Reasons:**
- `customer_upset` — Customer expressed frustration
- `outside_scope` — Question outside AI's scope
- `technical_issue` — Technical problem
- `manual_review` — Requires manual review

---

### Get Weekly Report
```
GET /api/reports/weekly/:businessId
Headers: Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "week_ending": "2026-07-18",
  "total_conversations": 12,
  "rebooked": 3,
  "revenue_from_rebooked": 255.00,
  "paid": 1,
  "revenue_from_paid": 85.00,
  "escalated": 2,
  "pending": 6,
  "total_revenue_recovered": 340.00
}
```

---

### Export CSV Report
```
GET /api/reports/csv/:businessId?start_date=2026-07-01&end_date=2026-07-31
Headers: Authorization: Bearer TOKEN
```

**Response:** CSV file download

**Columns:**
```
Customer Name,Trigger Type,Status,Outcome,Revenue Recovered,Date
Sarah Johnson,noshow,active,rebooked,85.00,2026-07-16T14:00:00Z
John Smith,cancellation,closed,paid,150.00,2026-07-17T10:00:00Z
```

---

### Receive SMS Reply Webhook
```
POST /api/webhooks/sms
```

**Twilio Sends:**
```json
{
  "From": "+15551234567",
  "Body": "Tuesday works!",
  "MessageSid": "SMxxx...",
  "AccountSid": "ACxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "decision": "confirm_booking"
}
```

---

### Receive Calendly Webhook
```
POST /api/webhooks/calendly
```

**Calendly Sends:**
```json
{
  "event_type": "booking.created",
  "data": {
    "resource": {...}
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Receive Stripe Webhook
```
POST /api/webhooks/stripe
```

**Stripe Sends:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {...}
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "param": "email",
      "msg": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have access to this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "path": "/api/campaigns/invalid_id",
  "method": "GET"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "timestamp": "2026-07-18T10:00:00Z"
}
```

---

## Rate Limits

- **Auth endpoints:** 5 requests per minute
- **Campaign creation:** 10 per hour
- **Other endpoints:** 100 requests per minute

---

## Webhooks

All webhooks include a signature for verification. Always validate webhook signatures before processing.

**Twilio Webhook Verification:**
- Header: `X-Twilio-Signature`
- Uses `TWILIO_AUTH_TOKEN`

**Stripe Webhook Verification:**
- Header: `Stripe-Signature`
- Uses `STRIPE_WEBHOOK_SECRET`

---

**Questions?** Check the backend code in `/routes/` for implementation details.
