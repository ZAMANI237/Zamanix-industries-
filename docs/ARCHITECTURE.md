# Revenue Recovery AI Agent — Full System Architecture

## System Overview

End-to-end flow:
```
Business connects calendar/CRM 
        ↓
Trigger detected (no-show, cancellation, lapsed customer)
        ↓
AI agent drafts outreach message (SMS/WhatsApp/Call)
        ↓
Customer replies
        ↓
AI handles conversation (books slot, collects payment, or escalates)
        ↓
Outcome logged & revenue tracked
        ↓
Monthly report = sales proof for next customer
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS SYSTEMS (Input)                    │
├──────────────┬──────────────────┬──────────────────┬────────────┤
│  Calendly    │  Google Sheets   │  Square / Toast  │   Acuity   │
│  (API read)  │  (CSV import)    │  (Webhook)       │  (API)     │
└──────────────┴──────────────────┴──────────────────┴────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  WEBHOOK RECEIVER & TRIGGER ENGINE              │
├─────────────────────────────────────────────────────────────────┤
│  • Listens for calendar events (cancellation, no-show)          │
│  • Polls lapsed customers (scheduled job, 1x/day)               │
│  • Detects unpaid invoices (webhook from Stripe / manual)       │
│  • Creates trigger record in DB (customer, type, timestamp)     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              MESSAGE DRAFTING ENGINE (AI Layer)                 │
├─────────────────────────────────────────────────────────────────┤
│  • LLM (Claude/Gemini) reads: customer name, trigger, context   │
│  • System prompt + business tone → generates message            │
│  • Templates stored per business (customizable)                 │
│  • Message logged before sending (audit trail)                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            MESSAGE DELIVERY & CONVERSATION HANDLER               │
├─────────────────────────────────────────────────────────────────┤
│  TEXT/SMS (Twilio)                                              │
│  ├─ Send initial message                                         │
│  ├─ Receive customer reply (webhook)                            │
│  └─ AI responds in thread                                       │
│                                                                  │
│  WHATSAPP (Twilio or Meta API)                                 │
│  ├─ Richer UX (buttons for booking)                            │
│  └─ Same reply flow                                             │
│                                                                  │
│  VOICE CALLS (Retell AI / Vapi)                                │
│  ├─ For high-value recoveries (e.g., $500+ unpaid invoices)   │
│  ├─ Conversational, handles objections                          │
│  └─ Transcript logged                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│         CONVERSATION STATE MACHINE (AI Agent Logic)             │
├─────────────────────────────────────────────────────────────────┤
│  Customer replies with:                                         │
│                                                                  │
│  [1] YES / interested → Proceed to booking or payment           │
│  [2] "What about Tuesday?" → Extract date, confirm with Calendly│
│  [3] "I'm upset" / escalation trigger → Hand off to human      │
│  [4] NO / "stop contacting me" → Log & stop sequence           │
│  [5] No reply after 24h → Send 1x follow-up, then stop         │
│                                                                  │
│  AI decides: Auto-handle OR escalate to business owner         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│            BOOKING / PAYMENT COMPLETION                         │
├─────────────────────────────────────────────────────────────────┤
│  BOOKING FLOW                    │  PAYMENT FLOW                │
│  ├─ Query Calendly for slots     │  ├─ Generate Stripe link    │
│  ├─ Confirm with customer        │  ├─ Send link in message    │
│  ├─ Create calendar event        │  ├─ Stripe webhook confirms │
│  ├─ Send confirmation + reminder │  │   payment                │
│  └─ Log outcome: "Rebooked"      │  └─ Log outcome: "Paid"     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              ANALYTICS & REPORTING DATABASE                     │
├─────────────────────────────────────────────────────────────────┤
│  Every conversation stored:                                     │
│  • customer_id, business_id, trigger_type, timestamp            │
│  • message_sent, customer_reply, ai_response                    │
│  • outcome (rebooked / paid / escalated / no_response)          │
│  • revenue_recovered (calculated from calendar/Stripe events)   │
│                                                                  │
│  Weekly aggregation:                                            │
│  • "3 rebooked ($XXX), 1 paid ($XXX), 2 escalated, 4 no-reply" │
│  • Sent to business owner as weekly summary email               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Database Schema

```sql
-- Businesses (customers of your platform)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  industry VARCHAR(50), -- salon, auto_shop, dental, fitness
  calendly_email VARCHAR(255),
  calendly_token VARCHAR(500), -- encrypted
  timezone VARCHAR(50) DEFAULT 'UTC',
  avg_appointment_value DECIMAL(10,2),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business configuration (messaging tone, triggers, etc)
CREATE TABLE business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  noshow_enabled BOOLEAN DEFAULT true,
  cancellation_enabled BOOLEAN DEFAULT true,
  lapsed_customer_enabled BOOLEAN DEFAULT true,
  lapsed_threshold_days INT DEFAULT 90,
  unpaid_invoice_enabled BOOLEAN DEFAULT false,
  preferred_channel VARCHAR(50) DEFAULT 'sms', -- sms, whatsapp, email, voice
  brand_tone VARCHAR(500), -- "casual with emojis", "formal", etc
  system_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers of the business
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  whatsapp_number VARCHAR(20),
  external_id VARCHAR(255), -- ID in Calendly/Square/POS
  last_appointment_date DATE,
  last_appointment_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Triggers (events that kick off campaigns)
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL, -- noshow, cancellation, lapsed_customer, unpaid_invoice
  triggered_at TIMESTAMP DEFAULT NOW(),
  appointment_date DATE,
  appointment_value DECIMAL(10,2),
  external_event_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations (message thread for each trigger)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE CASCADE,
  channel VARCHAR(50) DEFAULT 'sms',
  status VARCHAR(50) DEFAULT 'active', -- active, closed, escalated, no_response
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages (individual messages in a conversation)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL, -- ai_outreach, customer_reply, ai_response, escalation
  content TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL, -- ai, customer, business_owner
  ai_model_used VARCHAR(50), -- claude, gemini, gpt4, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- Outcomes (final result of each conversation)
CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE CASCADE,
  outcome_type VARCHAR(50) NOT NULL, -- rebooked, paid, escalated_to_human, no_response, declined
  revenue_recovered DECIMAL(10,2) DEFAULT 0,
  new_appointment_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks (audit log of integrations)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL, -- calendly, stripe, twilio, etc
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys for businesses
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL, -- hashed API key
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);
```

---

## API Endpoints (Backend)

### Authentication
```
POST /api/auth/register
  Request: { name, email, password, phone, industry }
  Response: { business_id, api_token }

POST /api/auth/login
  Request: { email, password }
  Response: { api_token, business_id }

POST /api/auth/refresh
  Request: { refresh_token }
  Response: { api_token }
```

### Integrations
```
GET /api/integrations/calendly/connect
  Response: { oauth_url } → redirects to Calendly OAuth

POST /api/integrations/webhooks/calendly
  Headers: { X-Calendly-Signature }
  Body: { event.type, event.payload... }
  Response: { status: "received" }

POST /api/integrations/webhooks/stripe
  Headers: { Stripe-Signature }
  Body: { type: "invoice.payment_succeeded", ... }
  Response: { received: true }

POST /api/integrations/import-csv
  Headers: { Authorization: Bearer TOKEN }
  Body: FormData { file: <CSV>, business_id }
  Response: { imported_count: 42, rows: [...] }
```

### Campaigns
```
POST /api/campaigns/create
  Request: {
    business_id,
    trigger_type: "noshow" | "cancellation" | "lapsed" | "unpaid",
    customers: [{
      id,
      name,
      phone,
      email,
      last_appointment_date,
      amount_owed (if unpaid)
    }],
    message_channel: "sms" | "whatsapp" | "email" | "voice"
  }
  Response: { campaign_id, status: "queued", message_count }

GET /api/campaigns/:id
  Response: {
    campaign_id,
    business_id,
    status: "running" | "completed",
    total_messages: 12,
    responses: 5,
    outcomes: { rebooked: 2, paid: 1, escalated: 1, no_response: 1 }
  }
```

### Conversations
```
GET /api/conversations/:id
  Response: {
    conversation_id,
    customer_name,
    customer_phone,
    messages: [
      { timestamp, sender: "ai", content: "..." },
      { timestamp, sender: "customer", content: "..." },
      { timestamp, sender: "ai", content: "..." }
    ],
    status: "active" | "closed" | "escalated"
  }

POST /api/conversations/:id/messages
  Request: { content, sender: "business_owner" }
  Response: { message_id, sent_at }

POST /api/conversations/:id/escalate
  Request: { reason: "customer_upset" | "outside_scope" }
  Response: { escalated_at, business_owner_notified: true }
```

### Webhooks (Incoming - from Twilio, Retell, etc)
```
POST /api/webhooks/customer-reply
  Request: {
    conversation_id,
    message_content,
    timestamp,
    channel: "sms" | "whatsapp" | "email",
    from_phone: "+15550123456"
  }
  Response: { received: true, ai_response_queued: true }

POST /api/webhooks/call-transcript
  Request: {
    conversation_id,
    transcript,
    duration_seconds,
    outcome: "booked" | "paid" | "declined",
    call_id: "retell_xxx"
  }
  Response: { received: true }

POST /api/webhooks/payment-confirmed
  Request: {
    business_id,
    customer_id,
    amount,
    stripe_payment_id,
    conversation_id
  }
  Response: { outcome_recorded: true }
```

### Reporting
```
GET /api/reports/weekly/:business_id
  Response: {
    week_ending: "2026-07-18",
    total_conversations: 12,
    rebooked: 3,
    revenue_from_rebooked: 450.00,
    paid_invoices: 1,
    revenue_from_paid: 350.00,
    escalated: 2,
    no_response: 6,
    total_revenue_recovered: 800.00,
    breakdown_by_trigger: { noshow: {...}, cancellation: {...} }
  }

GET /api/reports/csv/:business_id?start_date=2026-07-01&end_date=2026-07-31
  Response: CSV file download
  Columns: customer_name, trigger_type, message_sent, outcome, revenue_recovered
```

---

## Message Flow Example: No-Show Recovery (Step by Step)

### 1. Trigger Detection
```
Timeline: 2026-07-16 2:00 PM
Event: Business marks appointment as "no-show" in Calendly
├─ Calendly detects event
├─ Calendly sends webhook: POST https://yourdomain.com/api/integrations/webhooks/calendly
│  Body: {
│    event: "booking.cancelled",
│    payload: {
│      resource: {
│        status: "no_show",
│        name: "Sarah Johnson",
│        email: "sarah@email.com",
│        scheduled_event: {
│          start_time: "2026-07-16T14:00:00Z",
│          duration_minutes: 30,
│          name: "Auto Repair - Oil Change"
│        }
│      }
│    }
│  }
└─ Your backend receives webhook
```

### 2. Backend Processing
```
POST /api/integrations/webhooks/calendly receives the data
├─ Verify webhook signature
├─ Check if business_id exists (from webhook token)
├─ Query businesses table: find by calendly_email
├─ Query customers table: find "Sarah Johnson"
├─ Create trigger record:
│  {
│    business_id: "biz_123",
│    customer_id: "cust_456",
│    trigger_type: "noshow",
│    triggered_at: "2026-07-16T14:00:00Z",
│    appointment_date: "2026-07-16",
│    appointment_value: 85.00,
│    external_event_id: "calendly_evt_xxx",
│    processed: false
│  }
└─ Response: { status: "received" }
```

### 3. Job Runner (Every minute)
```
Bull Job Queue runs:
├─ Query: SELECT * FROM triggers WHERE processed = false LIMIT 100
├─ For each unprocessed trigger:
│  └─ Call internal function: process_trigger(trigger_id)
```

### 4. Message Drafting (Claude API)
```
function process_trigger(trigger_id):
  1. Load trigger data
     → { customer_id: "cust_456", trigger_type: "noshow", appointment_date: "2026-07-16" }
  
  2. Load customer data
     → { name: "Sarah", phone: "+15550123456", email: "sarah@email.com" }
  
  3. Load business data
     → { name: "Quick Auto Repair", industry: "auto_shop", timezone: "America/Chicago" }
  
  4. Load business_config
     → { brand_tone: "casual friendly", preferred_channel: "sms", lapsed_threshold_days: 90 }
  
  5. Load system prompt from earlier conversation_logic doc:
     ```
     You are a friendly front-desk assistant texting on behalf of Quick Auto Repair.
     Your only job is to win back lost revenue: reschedule no-shows/cancellations,
     re-engage lapsed customers, and collect overdue payments — in a warm, low-pressure way.
     
     Rules:
     - Keep every message under 3 sentences.
     - Always offer a specific, easy next action (a time, a link, a yes/no).
     - Never sound like a bot.
     - If the customer sounds upset, annoyed, or asks for a human, stop and flag for handoff.
     ```
  
  6. Build Claude prompt:
     ```
     System: [system_prompt above]
     User: "Draft a friendly text to Sarah, who no-showed her oil change appointment on July 16. 
             Keep it under 3 sentences. Offer to reschedule."
     ```
  
  7. Call Claude API:
     ```python
     import anthropic
     
     client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
     message = client.messages.create(
         model="claude-3-5-sonnet",
         max_tokens=100,
         messages=[
             {
                 "role": "user",
                 "content": "Draft a friendly text to Sarah, who no-showed her oil change appointment on July 16..."
             }
         ]
     )
     draft_message = message.content[0].text
     # Output: "Hey Sarah! Saw you had to miss your oil change on Thursday — no worries at all. 
     #          Want me to grab you a new spot this week? Just reply with a day that works."
     ```
  
  8. Store in messages table:
     INSERT INTO messages (...) VALUES (
       conversation_id: "conv_789",
       message_type: "ai_outreach",
       content: "Hey Sarah! Saw you had to miss your oil change...",
       sender: "ai",
       ai_model_used: "claude-3-5-sonnet"
     )
  
  9. Send via Twilio:
     ```python
     from twilio.rest import Client
     
     twilio_client = Client(account_sid, auth_token)
     message = twilio_client.messages.create(
         body="Hey Sarah! Saw you had to miss your oil change...",
         from_="+1234567890", # Your Twilio number
         to="+15550123456"    # Sarah's phone
     )
     # Returns: { sid: "SMxxx", status: "sent", date_sent: ... }
     ```
  
  10. Update trigger: processed = true
  11. Update conversation: status = "active", created_at = now()
```

### 5. Customer Replies
```
Timeline: 2026-07-16 3:15 PM
Event: Sarah replies "Tuesday works!"

Twilio receives SMS reply → sends webhook:
POST https://yourdomain.com/api/webhooks/customer-reply
Headers: { 
  X-Twilio-Signature: "signature_hash"
}
Body: {
  MessageSid: "SMxxx",
  From: "+15550123456",
  To: "+1234567890",
  Body: "Tuesday works!"
}

Your backend:
├─ Verify Twilio signature
├─ Find conversation by phone number + business
├─ Store message in messages table:
│  { conversation_id, message_type: "customer_reply", content: "Tuesday works!", sender: "customer" }
├─ Mark conversation: status = "active"
├─ Call function: handle_customer_reply(conversation_id, "Tuesday works!")
```

### 6. AI Decision Logic (Claude)
```python
def handle_customer_reply(conversation_id, customer_message):
    # Load conversation history
    messages_history = query_all_messages(conversation_id)
    # [
    #   { sender: "ai", content: "Hey Sarah! Saw you had to miss..." },
    #   { sender: "customer", content: "Tuesday works!" }
    # ]
    
    # Build prompt with context
    system_prompt = """
    You are a booking assistant. Customer replied to a no-show recovery message.
    Customer's original missed appointment: Oil change, July 16, $85
    
    Respond with JSON:
    {
      "action": "confirm_booking" | "ask_for_time" | "escalate",
      "response_message": "your message here",
      "booking_date": "YYYY-MM-DD" (if action is confirm_booking),
      "confidence": 0.95
    }
    """
    
    user_prompt = f"""
    Customer replied: "{customer_message}"
    Original message: "Hey Sarah! Saw you had to miss your oil change on Thursday..."
    
    Is the customer confirming a reschedule or asking a question?
    """
    
    response = claude.messages.create(
        model="claude-3-5-sonnet",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        system=system_prompt
    )
    
    result = json.loads(response.content[0].text)
    # Output: {
    #   "action": "confirm_booking",
    #   "response_message": "Perfect! I'm locking in Tuesday at 10:30 AM for your oil change. See you then! 🙂",
    #   "booking_date": "2026-07-22",
    #   "confidence": 0.95
    # }
    
    if result["action"] == "confirm_booking":
        # Query Calendly API for available slots on Tuesday
        slots = query_calendly_slots(business_id, "2026-07-22")
        # [{ start: "10:00", end: "10:30" }, { start: "10:30", end: "11:00" }, ...]
        
        # Book the first available slot (or a reasonable one)
        booking = create_calendly_event(
            business_id=business_id,
            customer_name="Sarah Johnson",
            customer_email="sarah@email.com",
            event_date="2026-07-22",
            event_time="10:30"
        )
        # Returns: { event_id: "evt_xxx", confirmation_link: "https://calendly.com/..." }
        
        # Send confirmation
        send_sms(
            to="+15550123456",
            body=result["response_message"]
        )
        
        # Log outcome
        insert_outcome(
            conversation_id=conversation_id,
            outcome_type="rebooked",
            revenue_recovered=85.00,
            new_appointment_id="evt_xxx"
        )
        
        # Update conversation status
        update_conversation(
            conversation_id=conversation_id,
            status="closed"
        )
    
    elif result["action"] == "ask_for_time":
        # Send follow-up asking for specific time
        send_sms(
            to="+15550123456",
            body=result["response_message"]
        )
        # Conversation stays "active", wait for next reply
    
    elif result["action"] == "escalate":
        # Send to business owner
        update_conversation(conversation_id=conversation_id, status="escalated")
        send_email(
            to=business_owner_email,
            subject=f"Customer escalation: {customer_name}",
            body=f"Customer replied: {customer_message}\n\nPlease handle manually."
        )
```

### 7. Outcome Logging & Reporting
```
After Sarah's appointment is booked on July 22:
├─ Insert outcome record:
│  {
│    conversation_id: "conv_789",
│    business_id: "biz_123",
│    customer_id: "cust_456",
│    trigger_id: "trig_xxx",
│    outcome_type: "rebooked",
│    revenue_recovered: 85.00,
│    new_appointment_id: "evt_xxx",
│    notes: "Customer confirmed via SMS, booked for Tuesday 10:30 AM"
│  }
│
├─ Update customer record:
│  last_appointment_date = 2026-07-22
│  last_appointment_value = 85.00
│
└─ Weekly reporting (Friday 5 PM):
   SELECT COUNT(*) as rebooked, SUM(revenue_recovered) as revenue
   FROM outcomes
   WHERE business_id = "biz_123"
     AND outcome_type = "rebooked"
     AND created_at >= NOW() - INTERVAL 7 days
   
   Result:
   ├─ This week: 3 rebooked, $255 recovered
   ├─ Plus: 1 paid invoice, $85 recovered
   ├─ Total: 4 conversations, $340 recovered
   ├─ No response: 6
   ├─ Escalated: 2
   │
   └─ Send email to business owner:
      Subject: "Revenue Recovery Report — Quick Auto Repair — Week of July 18"
      
      This week we recovered $340 in lost revenue:
      • 3 appointments rebooked ($255)
      • 1 unpaid invoice ($85)
      
      Total conversations: 12
      Response rate: 33%
      Escalations: 2 (flagged for your review)
      
      See full details: [dashboard link]
```

---

## State Management (Conversation Lifecycle)

```
trigger_created
    ↓
message_drafted_by_claude
    ↓
message_sent_via_twilio
    ↓
waiting_for_reply (timeout: 24h)
    ├─→ customer_replies_yes
    │   ├─ AI confirms booking
    │   ├─ Create calendar event
    │   ├─ Send confirmation
    │   └─ outcome: "rebooked" or "paid"
    │
    ├─→ customer_replies_with_question
    │   ├─ AI responds
    │   └─ loop back to waiting_for_reply
    │
    ├─→ customer_replies_upset_or_escalation
    │   ├─ Stop automated responses
    │   ├─ Flag for business owner
    │   └─ outcome: "escalated_to_human"
    │
    ├─→ customer_replies_no_or_stop
    │   ├─ Send polite goodbye
    │   ├─ Stop sequence
    │   └─ outcome: "declined"
    │
    └─→ no_reply_after_24h
        ├─ Send 1 follow-up
        ├─ Wait another 24h
        └─ outcome: "no_response" (after 2nd timeout)
```

**Implementation detail:** Use Redis or PostgreSQL job queue (Bull, Celery, APScheduler) to track timeout states. Store conversation ID with "next_action_at" timestamp.

---

## Error Handling & Reliability

### Idempotency
- Every message has a unique `message_id` (UUID)
- Twilio webhooks can fire multiple times; deduplicate by checking if message_id already exists

### Retries
- Calendly API call fails → Retry after 30s (up to 3 times, exponential backoff)
- Claude API times out → Use cheaper fallback (Gemini), or use pre-drafted template
- Twilio SMS fails → Add to retry queue, escalate after 5 failed attempts

### Monitoring & Alerts
- Log every API call (input, output, latency, error)
- Alert if:
  - >5% of messages fail to send
  - Claude API response time >10s
  - Webhook latency >5s
  - Database connection drops

### Audit Trail
- Every message, trigger, outcome immutable once created (no DELETEs, only soft deletes)
- Conversation cannot be deleted, only marked "archived"
- All user actions logged with timestamp and actor

---

## Scalability Path

### Phase 1 MVP (1–5 customers)
- Single PostgreSQL instance (Render/Railway free tier ~$15/month)
- Node.js server (Vercel serverless OR Railway container ~$10/month)
- Bull job queue (in-process, no Redis needed yet)
- Twilio SMS: ~$0.008/msg; 1,000 messages/month = ~$8
- **Total: ~$33/month**

### Phase 2 (5–50 customers)
- Add Redis for job queue (Railway ~$15/month)
- PostgreSQL upgraded (Render ~$50/month)
- Webhook handlers async (Bull + Redis)
- Load balance API servers (Vercel or 2–3 Railway containers)
- Twilio: 50,000 messages/month = ~$400
- **Total: ~$475/month**

### Phase 3+ (50+ customers)
- Dedicated Postgres cluster with read replicas
- Kubernetes for API servers (or multiple Railway containers)
- Message queue decoupled (RabbitMQ or AWS SQS)
- AI model caching (store common responses, reuse)
- Rate-limit per business (max 500 messages/day)
- **Total: $2,000+/month** (but generating $50k+/month in subscriptions)

---

## Integration Priority (MVP → Later Stages)

| Integration | Phase | Effort | Why | API Docs |
|---|---|---|---|---|
| Google Sheets (CSV import) | 1 | 2 hrs | Manual upload, validates concept | Google Sheets API |
| Calendly API | 1 | 4 hrs | Most businesses use it | Calendly API |
| Twilio SMS | 1 | 3 hrs | Cheapest, most reliable | Twilio SMS |
| Stripe Webhooks | 2 | 2 hrs | Payment confirmation loop | Stripe API |
| WhatsApp (Twilio) | 2 | 3 hrs | Better UX than SMS | Twilio WhatsApp |
| Square / Toast POS | 3 | 8 hrs | For restaurants/retail | Square API |
| Acuity Scheduling | 3 | 6 hrs | For salons/health | Acuity API |
| Retell AI / Vapi (voice) | 3 | 4 hrs | Lower volume, higher value | Retell / Vapi API |

---

## Next Steps

1. ✅ **Create database** (run the SQL schema above on PostgreSQL)
2. ✅ **Build backend** (Node.js/Express or Python FastAPI)
3. ✅ **Wire up Twilio** (SMS sending & webhook receiving)
4. ✅ **Claude integration** (draft messages, handle replies)
5. ✅ **Calendly integration** (read slots, create bookings)
6. ✅ **Frontend dashboard** (see campaigns & outcomes)
7. ✅ **Weekly reporting** (email business owner)
8. ✅ **First customer setup** (validate with real data)

Ready for the backend implementation guide?
