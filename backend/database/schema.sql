-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses (SaaS customers)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  industry VARCHAR(50),
  calendly_email VARCHAR(255),
  calendly_token VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  avg_appointment_value DECIMAL(10,2),
  stripe_account_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Configuration
CREATE TABLE IF NOT EXISTS business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  noshow_enabled BOOLEAN DEFAULT true,
  cancellation_enabled BOOLEAN DEFAULT true,
  lapsed_customer_enabled BOOLEAN DEFAULT true,
  lapsed_threshold_days INT DEFAULT 90,
  unpaid_invoice_enabled BOOLEAN DEFAULT false,
  preferred_channel VARCHAR(50) DEFAULT 'sms',
  brand_tone VARCHAR(500),
  system_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  whatsapp_number VARCHAR(20),
  external_id VARCHAR(255),
  last_appointment_date DATE,
  last_appointment_value DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Triggers (No-show, Cancellation, Lapsed, Unpaid)
CREATE TABLE IF NOT EXISTS triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL,
  triggered_at TIMESTAMP DEFAULT NOW(),
  appointment_date DATE,
  appointment_value DECIMAL(10,2),
  external_event_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations (Message threads)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE CASCADE,
  channel VARCHAR(50) DEFAULT 'sms',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  ai_model_used VARCHAR(50),
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Outcomes (Results of conversations)
CREATE TABLE IF NOT EXISTS outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE CASCADE,
  outcome_type VARCHAR(50) NOT NULL,
  revenue_recovered DECIMAL(10,2) DEFAULT 0,
  new_appointment_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks (Audit log)
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_triggers_business_id ON triggers(business_id);
CREATE INDEX IF NOT EXISTS idx_triggers_customer_id ON triggers(customer_id);
CREATE INDEX IF NOT EXISTS idx_triggers_processed ON triggers(processed);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_business_id ON outcomes(business_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_business_id ON webhooks(business_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks(processed);
