# BILLING OPTIMIZATION & PAYMENT RECOVERY PLATFORM
## Complete Build Playbook for Solo Founders (6-Month Timeline)

**Your Project Coach:** Claude AI  
**Your Role:** Founder & Product Manager  
**Timeline:** 6 months (26 weeks)  
**Budget:** Bootstrap (start $0, grow into revenue)  
**Team:** Just you + Claude  

---

## TABLE OF CONTENTS

1. [Executive Overview](#executive-overview)
2. [Project Vision & Goals](#project-vision--goals)
3. [Complete System Architecture](#complete-system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Week-by-Week Sprint Plan](#week-by-week-sprint-plan)
7. [Complete Backend Code](#complete-backend-code)
8. [Complete Frontend Code](#complete-frontend-code)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Deployment Guide](#deployment-guide)
11. [Claude Prompts Library](#claude-prompts-library)
12. [Security Checklist](#security-checklist)
13. [Launch & Go-to-Market](#launch--go-to-market)
14. [Metrics & Success Tracking](#metrics--success-tracking)

---

## EXECUTIVE OVERVIEW

### What You're Building

A **Payment Recovery Platform** that:
- Detects failed recurring payments from Stripe, Adyen, Square
- Applies intelligent retry logic (different strategies per decline reason)
- Recovers 5-15% of failed payments
- Charges customers 10-25% of recovered amount
- Scales from $0 → $10K+ MRR in 12-24 months

### Why This Market

- **Total Addressable Market:** $20B+ (failed recurring payments annually)
- **Customer Desperation:** Every SaaS loses 10-15% of revenue to failed payments
- **Low Competition:** Few vertical-specific solutions
- **High Margins:** 60-80% gross margin (recovery fee)
- **Recurring Revenue:** Customers stay 2-5+ years

### Your Business Model

```
Failed Payment → Your Algorithm Retries → Payment Succeeds → You Get 15% Cut
Example: $1,000 recovered = $150 for you (passive income)
```

### 6-Month Milestone Goals

| Phase | Weeks | Target | Reality Check |
|-------|-------|--------|----------------|
| **Build MVP** | 1-8 | Working prototype | Deploy to staging |
| **First 3 Beta Customers** | 9-16 | 3 paying customers | $500-1,000 MRR |
| **Iterate & Stabilize** | 17-22 | 10+ customers | $5,000+ MRR |
| **Scale & Automate** | 23-26 | Systems ready to scale | Hire developer or raise capital |

---

## PROJECT VISION & GOALS

### Core Problem You're Solving

**The Bleeding:** SaaS companies lose $20B annually because:
1. Customer payment fails (insufficient funds, expired card, etc.)
2. They get notified 3-5 days later
3. They try once more manually
4. If it fails, customer loses access
5. Revenue is gone (no refund, just lost)

**You fix this by:**
- Detecting failures in real-time (not 3-5 days later)
- Retrying intelligently (optimal timing, optimal method)
- Recovering 5-15% of "lost" revenue
- Customers pay you a percentage of what you recover

### Success Metrics (6-Month Goals)

```
Week 8:  MVP complete + deployed
Week 12: 1st paying customer
Week 16: 3 paying customers, $500-1,000 MRR
Week 20: 8-10 paying customers, $5,000 MRR
Week 26: 15-20 paying customers, $10,000+ MRR
```

### Your Daily Role

| Phase | Weeks | Your Focus | Time/Week |
|-------|-------|-----------|-----------|
| **Build** | 1-8 | Work with Claude on code, test locally | 40-50 hrs |
| **Beta Launch** | 9-12 | Deploy, invite first customers, gather feedback | 40-50 hrs |
| **Growth** | 13-20 | Customer onboarding, bug fixes, feature requests | 40-50 hrs |
| **Scale** | 21-26 | Think about hiring, consider raising capital | 30-40 hrs |

---

## COMPLETE SYSTEM ARCHITECTURE

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT RECOVERY SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

1. DETECTION LAYER
   ├─ Stripe Webhook → Failed Payment Event
   ├─ Adyen Webhook → Declined Transaction
   └─ Square Webhook → Payment Failed

2. PROCESSING LAYER
   ├─ Analyze decline reason (insufficient funds vs. expired card)
   ├─ Determine retry strategy (immediate vs. 2 days vs. 5 days)
   └─ Schedule retry in queue

3. EXECUTION LAYER
   ├─ Execute retry at optimal time
   ├─ Log result (success/failure)
   └─ If success → notify customer + send invoice

4. ANALYTICS LAYER
   ├─ Track recovery rate
   ├─ Calculate ROI for customer
   └─ Display in dashboard

5. BILLING LAYER
   ├─ Calculate fees owed (15% of recovered)
   ├─ Issue invoice to customer
   └─ Receive payment for your service
```

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR PLATFORM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (Dashboard)           BACKEND (API)                 │
│  ├─ Login                       ├─ Node.js + Express         │
│  ├─ Connect Stripe/Adyen/Square ├─ Stripe SDK               │
│  ├─ View failed payments        ├─ Adyen SDK                │
│  ├─ See recovered $             ├─ Square SDK               │
│  ├─ Analytics                   ├─ Retry Engine             │
│  └─ Settings                    ├─ Billing Engine           │
│                                 ├─ Webhook Handlers         │
│                                 ��─ PostgreSQL Database       │
│                                                                 │
│  EXTERNAL INTEGRATIONS                                         │
│  ├─ Stripe (detect + retry payments)                          │
│  ├─ Adyen (detect + retry payments)                           │
│  ├─ Square (detect + retry payments)                          │
│  ├─ SendGrid (send emails)                                    │
│  └─ Stripe Billing (bill your customers)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow (Happy Path)

```
STEP 1: Customer connects Stripe account to your dashboard
        ↓
STEP 2: Webhook fires: "Payment declined for subscription"
        ↓
STEP 3: Your system analyzes: "Insufficient funds - retry in 2 days"
        ↓
STEP 4: Schedule retry for 2:30 AM on day 2 (optimal timing)
        ↓
STEP 5: At 2:30 AM, execute retry
        ↓
STEP 6: Payment succeeds!
        ↓
STEP 7: Log success, send email to customer
        ↓
STEP 8: Calculate fee: $100 recovered × 15% = $15 for you
        ↓
STEP 9: Issue invoice to customer for $15 (monthly billing)
        ↓
STEP 10: Customer pays you via Stripe
```

---

## TECHNOLOGY STACK

### Why These Tools

| Layer | Tool | Why |
|-------|------|-----|
| **Backend** | Node.js + Express | Fast, scalable, Stripe SDK excellent |
| **Database** | PostgreSQL | Reliable, handles transactions well |
| **Frontend** | React | Modern, component-based, fast |
| **Hosting** | Railway or Render | Easy deployment, affordable, auto-scaling |
| **Email** | SendGrid | Reliable, developer-friendly |
| **Monitoring** | Sentry | Catch errors in production |
| **Payment Processor** | Stripe for billing | Accept payments from your customers |

### Free Tier Costs (First 3 Months)

| Service | Cost | Why |
|---------|------|-----|
| PostgreSQL | Free ($0) | Railway/Render free tier |
| Node.js hosting | Free-$50 | Railway $5-10/mo, Render free tier |
| Stripe (payment recovery) | 2.9% + $0.30 | Only on recovered payments (you earn %) |
| Stripe (billing your customers) | 2.9% + $0.30 | Only when customers pay you |
| SendGrid | Free | 100 emails/day free |
| Domain | $12/year | namecheap.com |
| **TOTAL MONTHLY** | **$0-20** | Scales with revenue |

### Your Development Environment

```
Prerequisites (install once):
├─ Node.js v18+ (nodejs.org)
├─ Git (github.com)
├─ PostgreSQL (local or use Railway)
├─ VSCode (code editor)
└─ Claude (your copilot - this guide)

Folder structure you'll create:
payment-recovery-platform/
├─ backend/
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ webhooks.js
│  │  ├─ retryEngine.js
│  │  ├─ billingEngine.js
│  │  └─ database.js
│  ├─ package.json
│  ├─ .env
│  └─ docker-compose.yml
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ pages/
│  │  ├─ components/
│  │  └─ services/
│  ├─ package.json
│  └─ .env
└─ README.md
```

---

## DATABASE SCHEMA

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Integrations Table (Stripe, Adyen, Square)
```sql
CREATE TABLE integrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  provider VARCHAR(50), -- 'stripe', 'adyen', 'square'
  api_key_encrypted VARCHAR(500),
  account_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

#### 3. Failed Payments Table
```sql
CREATE TABLE failed_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  integration_id INTEGER NOT NULL REFERENCES integrations(id),
  provider VARCHAR(50),
  customer_id VARCHAR(255),
  charge_id VARCHAR(255),
  amount_cents INTEGER,
  currency VARCHAR(3),
  decline_reason VARCHAR(255),
  original_failure_timestamp TIMESTAMP,
  detected_at TIMESTAMP DEFAULT NOW(),
  is_recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Retry Attempts Table
```sql
CREATE TABLE retry_attempts (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES failed_payments(id),
  attempt_number INTEGER,
  scheduled_for TIMESTAMP,
  executed_at TIMESTAMP,
  status VARCHAR(50), -- 'pending', 'success', 'failed'
  failure_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Invoices Table (for billing customers)
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  invoice_number VARCHAR(50) UNIQUE,
  amount_cents INTEGER,
  currency VARCHAR(3),
  recovered_payment_ids TEXT, -- JSON array of payment IDs
  status VARCHAR(50), -- 'draft', 'sent', 'paid'
  stripe_invoice_id VARCHAR(255),
  issued_at TIMESTAMP,
  due_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. Metrics Table (for analytics)
```sql
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date DATE,
  total_failed_payments_detected INTEGER,
  total_recovered_payments INTEGER,
  total_recovered_amount_cents INTEGER,
  recovery_rate_percent DECIMAL(5,2),
  customer_revenue_cents INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes (for performance)
```sql
CREATE INDEX idx_failed_payments_user_id ON failed_payments(user_id);
CREATE INDEX idx_failed_payments_provider ON failed_payments(provider);
CREATE INDEX idx_failed_payments_is_recovered ON failed_payments(is_recovered);
CREATE INDEX idx_retry_attempts_status ON retry_attempts(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

---

## WEEK-BY-WEEK SPRINT PLAN

### PHASE 1: FOUNDATION (Weeks 1-4)

#### Week 1: Planning & Setup
**Goal:** Environment ready, architecture finalized

**Your Tasks:**
- [ ] Install Node.js, PostgreSQL, VSCode
- [ ] Create GitHub repository
- [ ] Create initial project folder structure
- [ ] Set up local PostgreSQL database
- [ ] Create .env file with template variables

**Claude Task (Prompts to use):**
Ask Claude to:
```
"I'm building a payment recovery platform. Help me create:
1. A detailed project structure (folder organization)
2. A Docker Compose file for local development (PostgreSQL + Node.js)
3. A .env.template file with all required variables
4. Initial package.json for Node.js with all dependencies I'll need"
```

**Expected Output:** GitHub repo ready, local dev environment set up

---

#### Week 2: Backend Skeleton
**Goal:** Basic Express.js server running locally

**Your Tasks:**
- [ ] Create Express.js server
- [ ] Set up database connection
- [ ] Create authentication system (JWT)
- [ ] Set up error handling
- [ ] Test with Postman

**Claude Task:**
```
"Write me a complete Express.js server with:
1. Basic health check endpoint (GET /health)
2. User signup endpoint (POST /auth/signup)
3. User login endpoint (POST /auth/login)
4. JWT token generation
5. Database connection using pg library
6. Error handling middleware
Include comments explaining each part"
```

**Expected Output:** Server running on localhost:3000, can create user accounts

---

#### Week 3: Database & Core Models
**Goal:** All tables created, basic CRUD operations

**Your Tasks:**
- [ ] Create all database tables (from schema above)
- [ ] Create user repository (create, read, update, delete)
- [ ] Create integration repository (manage Stripe/Adyen/Square connections)
- [ ] Create failed payment repository
- [ ] Test all queries

**Claude Task:**
```
"Write database migration files and repository classes for:
1. Users (signup, login, profile)
2. Integrations (connect Stripe/Adyen/Square, list connected services)
3. Failed payments (create, query, mark recovered)
4. Retry attempts (create, update status)

Use these exact SQL schemas:
[paste the schemas from above]

Create a repository pattern so I can do:
- await userRepo.create(email, password)
- await integrationRepo.connectStripe(userId, apiKey)
- await paymentRepo.create(data)
"
```

**Expected Output:** All tables exist, can insert/read data

---

#### Week 4: Webhook Foundation
**Goal:** Can receive Stripe/Adyen/Square webhooks

**Your Tasks:**
- [ ] Create webhook endpoint for Stripe
- [ ] Create webhook endpoint for Adyen
- [ ] Create webhook endpoint for Square
- [ ] Test locally with ngrok or Stripe CLI
- [ ] Log all webhook events

**Claude Task:**
```
"Create three webhook endpoint handlers in Express.js:

1. POST /webhooks/stripe
   - Validate Stripe webhook signature
   - Handle: charge.failed event
   - Log to database with decline reason

2. POST /webhooks/adyen
   - Validate Adyen webhook signature
   - Handle payment failure notifications
   - Log to database

3. POST /webhooks/square
   - Validate Square webhook signature
   - Handle: payment.failed event
   - Log to database

For each:
- Validate the webhook is genuine (use provided signature)
- Extract: customer ID, charge ID, amount, decline reason
- Create entry in failed_payments table
- Log event to console

Use Stripe SDK, Adyen SDK, Square SDK for validation"
```

**Expected Output:** Can receive webhooks locally, data saved to DB

---

### PHASE 2: CORE LOGIC (Weeks 5-8)

#### Week 5: Retry Engine (Part 1)
**Goal:** Smart retry logic implemented

**Your Tasks:**
- [ ] Analyze decline reasons (insufficient funds, expired card, etc.)
- [ ] Create retry strategy decision logic
- [ ] Implement scheduling system
- [ ] Test different scenarios

**Claude Task:**
```
"Create a retry strategy engine that analyzes payment decline reasons 
and decides when to retry:

1. Analyze decline_reason:
   - 'insufficient_funds' → Retry in 2-3 days (customer gets paid)
   - 'expired_card' → Don't retry (card is invalid)
   - 'do_not_honor' → Don't retry (card blocked)
   - 'lost_card' → Don't retry
   - 'generic' → Retry in 1 day (might be temporary)
   - 'rate_limit' → Retry in 30 minutes (our server issue)

2. For each declined payment:
   - Determine optimal retry time (e.g., 2:30 AM)
   - Create entry in retry_attempts table
   - Set status to 'pending'

3. Create a RetryEngine class with:
   - analyzeDeclineReason(reason) → returns strategy
   - scheduleRetry(paymentId, strategy) → creates scheduled task
   - getNextRetryTime(declineReason) → returns timestamp

Include logic for:
- Exponential backoff (1 day, 3 days, 7 days max)
- Max 3 retry attempts per payment
- Optimal time (2-3 AM is best)
"
```

**Expected Output:** Logic to decide when/how to retry payments

---

#### Week 6: Retry Engine (Part 2) - Execution
**Goal:** Actually execute retries via Stripe/Adyen/Square APIs

**Your Tasks:**
- [ ] Execute retry via Stripe API
- [ ] Execute retry via Adyen API
- [ ] Execute retry via Square API
- [ ] Handle success/failure cases
- [ ] Update database

**Claude Task:**
```
"Write the retry execution engine:

1. Create RetryExecutor class that:
   - Gets pending retry_attempts from database
   - Loads associated payment details
   - Gets customer's payment method from provider API
   - Executes retry charge
   - Handles success/failure

2. For Stripe:
   - Use Stripe SDK to create new charge
   - Use same customer ID, same amount
   - Retry with 3D Secure if needed

3. For Adyen:
   - Use Adyen API to create payment request
   - Retry same subscription payment

4. For Square:
   - Use Square SDK to retry charge

5. On success:
   - Set retry_attempt.status = 'success'
   - Set failed_payment.is_recovered = TRUE
   - Set failed_payment.recovered_at = NOW()
   - Log success

6. On failure:
   - Set retry_attempt.status = 'failed'
   - Set retry_attempt.failure_reason = error message
   - If last attempt, mark payment as unrecoverable

7. Create a scheduler that:
   - Runs every 5 minutes
   - Checks for pending retries to execute
   - Executes them
   - Logs results
"
```

**Expected Output:** Can execute retries, payment failures become successes

---

#### Week 7: Billing Engine
**Goal:** Calculate what customers owe you, generate invoices

**Your Tasks:**
- [ ] Calculate recovered amounts per customer
- [ ] Create monthly invoices
- [ ] Set pricing (15-25% of recovered)
- [ ] Test invoice generation

**Claude Task:**
```
"Create a billing engine that:

1. Monthly (on 1st of month):
   - Query recovered payments from last month
   - Group by customer (user_id)
   - Calculate: recovered_amount × 0.15 (15% fee)
   - Create invoice in database

2. Create Invoice class:
   - invoice_number (auto-increment)
   - user_id
   - recovered_payment_ids (list of payment IDs)
   - amount_cents (15% of total recovered)
   - status (draft, sent, paid)
   - issued_at, due_at, paid_at

3. Create a monthly job that:
   - Runs on 1st of month at 9 AM
   - Creates invoices for all users with recovered payments
   - Sets status = 'draft'

4. Create endpoint to:
   - GET /invoices (list all invoices for user)
   - GET /invoices/:id (download invoice PDF)
   - POST /invoices/:id/send (send invoice via email)

5. Handle Stripe billing integration:
   - Create Stripe invoice for amounts owed
   - Set up automatic payment retry
   - Webhook to track payment
"
```

**Expected Output:** Can generate invoices, customers see what they owe

---

#### Week 8: Dashboard Backend Endpoints
**Goal:** All API endpoints ready for frontend

**Your Tasks:**
- [ ] Create dashboard API endpoints
- [ ] Aggregate metrics
- [ ] Test all endpoints with Postman

**Claude Task:**
```
"Create all REST API endpoints needed for the dashboard:

AUTHENTICATION:
- POST /auth/signup - Create account
- POST /auth/login - Generate token
- GET /auth/profile - Current user info

INTEGRATIONS:
- GET /integrations - List connected processors
- POST /integrations/connect-stripe - Connect Stripe account
- POST /integrations/connect-adyen - Connect Adyen account
- POST /integrations/connect-square - Connect Square account
- DELETE /integrations/:id - Disconnect

FAILED PAYMENTS:
- GET /payments/failed - List failed payments (paginated)
- GET /payments/failed/:id - Single payment detail
- GET /payments/failed?status=unrecovered - Filter by status

ANALYTICS:
- GET /analytics/summary - Today's summary
- GET /analytics/monthly - This month stats
- GET /analytics/history - Last 12 months data
- GET /analytics/recovery-rate - % of payments recovered

INVOICES:
- GET /invoices - List invoices
- GET /invoices/:id - Download invoice
- POST /invoices/:id/send - Send via email

For each endpoint, return:
- 200 on success with data
- 400 on bad request
- 401 if not authenticated
- 500 on server error

All responses should be JSON with:
{
  \"success\": true/false,
  \"data\": {...},
  \"error\": \"error message if any\"
}
"
```

**Expected Output:** Postman collection with 20+ endpoints all working

---

### PHASE 3: FRONTEND (Weeks 9-12)

#### Week 9: Frontend Setup & Authentication
**Goal:** Can login, see dashboard skeleton

**Your Tasks:**
- [ ] Create React app
- [ ] Set up routing
- [ ] Create login page
- [ ] Create dashboard layout
- [ ] Connect to backend API

**Claude Task:**
```
"Create a React app with:

1. Setup:
   - Create React project (use Vite for speed)
   - Install: axios, react-router, tailwind CSS
   - Set up .env with API base URL

2. Pages:
   - /login - Email/password form
   - /dashboard - Main app (if authenticated)
   - /connected-accounts - Integration status

3. Auth system:
   - localStorage to save JWT token
   - API interceptor to add token to requests
   - Redirect to /login if not authenticated
   - Logout button

4. Login page:
   - Email input
   - Password input
   - Submit button
   - Error handling
   - Link to signup

5. Dashboard layout:
   - Top navigation bar
   - Sidebar with menu items
   - Main content area
   - Responsive design (works on mobile)

Use Tailwind CSS for styling - make it look professional"
```

**Expected Output:** Can login with email/password, see blank dashboard

---

#### Week 10: Connected Accounts & Settings
**Goal:** Can connect Stripe/Adyen/Square

**Your Tasks:**
- [ ] Create integration connection flow
- [ ] Show connected processors
- [ ] Allow disconnection
- [ ] Save API keys securely

**Claude Task:**
```
"Create integration management UI:

1. Connected Accounts page:
   - Show Stripe status (connected/not connected)
   - Show Adyen status
   - Show Square status
   - Show connection date
   - Show disconnect button

2. Connect Stripe flow:
   - Button: 'Connect Stripe'
   - Opens modal/new tab
   - Redirect to Stripe OAuth
   - After auth, save API key to backend
   - Show success message

3. Connect Adyen flow:
   - Button: 'Connect Adyen'
   - Form to input: API key, username, password
   - Validate credentials by calling backend
   - Show success/error

4. Connect Square flow:
   - Button: 'Connect Square'
   - Similar to Adyen
   - Form for API key
   - Validate connection

5. Settings page:
   - Email preferences
   - Notification settings
   - Billing address
   - Payment method (where to charge them)

Use React components, Tailwind CSS"
```

**Expected Output:** Can connect payment processors, settings saved

---

#### Week 11: Failed Payments & Analytics Dashboard
**Goal:** See failed payments, recovery rate, earnings

**Your Tasks:**
- [ ] Display failed payments table
- [ ] Show analytics/metrics
- [ ] Create filters/search
- [ ] Add charts (recovery rate, earnings)

**Claude Task:**
```
"Create main dashboard UI:

1. Summary Cards (top of page):
   - Total Failed Payments (last 30 days)
   - Total Recovered Payments
   - Total Recovered Amount ($)
   - Your Earnings This Month ($)
   - Recovery Rate %

2. Failed Payments Table:
   - Date failed
   - Customer name / ID
   - Amount
   - Decline reason
   - Status (pending retry / recovered / unrecoverable)
   - Actions (view details)

3. Filters:
   - Date range picker
   - Status (all / pending / recovered / failed)
   - Provider (all / Stripe / Adyen / Square)
   - Search by customer

4. Charts (use Recharts library):
   - Line chart: Recovery rate over time
   - Bar chart: Recovered amount per day
   - Pie chart: Decline reasons breakdown
   - Number chart: Running total earnings

5. Table pagination:
   - Show 20 items per page
   - Next/Previous buttons
   - Jump to page

Make it look professional, use Tailwind CSS + Recharts"
```

**Expected Output:** Beautiful dashboard showing all key metrics

---

#### Week 12: Invoices & Settings
**Goal:** Show invoices, configure preferences

**Your Tasks:**
- [ ] Display invoices
- [ ] Download invoice PDF
- [ ] Payment settings
- [ ] Email preferences

**Claude Task:**
```
"Create invoices & settings pages:

1. Invoices page:
   - List all invoices (this year)
   - Show: Invoice #, Date, Amount, Status (Draft/Sent/Paid)
   - Download button (PDF)
   - Resend email button
   - Filter by status

2. Invoice PDF generation:
   - Company logo at top
   - Invoice number & date
   - Your company info
   - Customer info
   - Itemized list of recovered payments
   - Total amount due
   - Payment instructions
   - Terms (due in 30 days)

3. Settings page:
   - Account information (edit email, company name)
   - Billing settings:
     * Payment method (credit card)
     * Billing address
   - Email notifications (on/off for each type)
   - API keys (for your customers to integrate)
   - Export data (CSV)

4. Email notification types:
   - Payment recovered (send daily/weekly digest)
   - Invoice issued
   - Dispute alert
   - Weekly summary

5. Security:
   - Show API key (with option to hide)
   - Regenerate key button
   - Delete account (with warning)
"
```

**Expected Output:** Complete UI for invoices, settings, and preferences

---

### PHASE 4: TESTING & DEPLOYMENT (Weeks 13-16)

#### Week 13: Testing & Bug Fixes
**Goal:** All features tested, bugs fixed

**Your Tasks:**
- [ ] Manual testing of all features
- [ ] Fix bugs as you find them
- [ ] Test on different browsers
- [ ] Stress test database queries

**Claude Task:**
```
"Create a comprehensive testing checklist:

AUTHENTICATION TESTS:
- [ ] Sign up with valid email
- [ ] Sign up with duplicate email (should fail)
- [ ] Login with correct password
- [ ] Login with wrong password (should fail)
- [ ] Token expiration after 24 hours
- [ ] Logout clears token

INTEGRATION TESTS:
- [ ] Connect Stripe account
- [ ] Connect Adyen account
- [ ] Disconnect account
- [ ] Can't use same account twice
- [ ] API key validation

PAYMENT RECOVERY TESTS:
- [ ] Webhook receives failed payment
- [ ] Payment saved to database
- [ ] Decline reason analyzed correctly
- [ ] Retry scheduled for correct time
- [ ] Retry executes successfully
- [ ] Payment marked as recovered

BILLING TESTS:
- [ ] Invoice generated for recovered payments
- [ ] Correct fee calculated (15%)
- [ ] Invoice sent via email
- [ ] Customer can download PDF
- [ ] Payment processed via Stripe

DASHBOARD TESTS:
- [ ] Summary cards show correct numbers
- [ ] Table displays all payments
- [ ] Filters work correctly
- [ ] Charts render correctly
- [ ] Pagination works

PERFORMANCE TESTS:
- [ ] Dashboard loads in <2 seconds
- [ ] Failed payments query <500ms
- [ ] 10K records don't slow down
"
```

**Expected Output:** Comprehensive testing done, bugs documented and fixed

---

#### Week 14: Production Setup
**Goal:** Ready to deploy to production

**Your Tasks:**
- [ ] Choose hosting (Railway or Render)
- [ ] Set up PostgreSQL production database
- [ ] Configure environment variables
- [ ] Set up SSL certificate
- [ ] Set up monitoring (Sentry)

**Claude Task:**
```
"Create production deployment guide:

1. Railway.io setup:
   - Create new project
   - Connect GitHub repository
   - Add PostgreSQL database
   - Set environment variables
   - Configure auto-deploy on git push
   - Get production URL

2. Environment variables (production):
   - DATABASE_URL (from Railway PostgreSQL)
   - STRIPE_API_KEY
   - ADYEN_API_KEY
   - SQUARE_API_KEY
   - JWT_SECRET (generate long random string)
   - SENDGRID_API_KEY
   - SENTRY_DSN
   - FRONTEND_URL (for CORS)

3. Database migration:
   - Script to run all CREATE TABLE statements
   - Script to create indexes
   - Test data (optional)

4. SSL certificate:
   - Railway provides automatically
   - Update webhook URLs to use HTTPS

5. Sentry setup:
   - Create Sentry project
   - Add SDK to backend
   - Configure error reporting
   - Set up alerts for critical errors

6. Monitoring:
   - Set up uptime monitoring (uptimerobot.com)
   - Set up database backups
   - Set up log aggregation

7. Testing in production:
   - Test webhook with real Stripe test key
   - Test retry execution
   - Test billing flow
   - Confirm emails send
"
```

**Expected Output:** App deployed to production with HTTPS, monitoring active

---

#### Week 15: Beta Launch Prep
**Goal:** Ready to invite first customers

**Your Tasks:**
- [ ] Create onboarding documentation
- [ ] Create simple landing page
- [ ] Set up customer support email
- [ ] Create FAQ
- [ ] Prepare pitch for first customers

**Claude Task:**
```
"Create customer onboarding materials:

1. Landing page:
   - Headline: 'Recover Lost Revenue from Failed Payments'
   - Problem: SaaS loses 10-15% to failed payments
   - Solution: Our platform recovers them
   - How it works (3 step diagram)
   - Pricing: 15% of recovered amount
   - FAQ section
   - CTA: 'Start Free Trial'

2. Onboarding guide (PDF):
   - What we do (2 paragraphs)
   - How it works (step by step)
   - Setup process (connect Stripe in 5 minutes)
   - Dashboard tour
   - Pricing breakdown
   - Support contact

3. FAQ:
   - How long does it take to see results?
   - What's your success rate?
   - Will you retry immediately?
   - What happens if customer disputes?
   - How do I pay you?
   - Can I disconnect anytime?
   - Is my data secure?

4. Support email template:
   - Quick response template
   - Bug report template
   - Feature request template

5. Pitch email template (for first customers):
   - Subject: 'We can help recover $X in lost revenue'
   - Personalized for their type of business
   - No sales language, pure problem/solution
   - Link to 15-minute demo
   - Call to action
"
```

**Expected Output:** Everything needed to onboard first customers

---

#### Week 16: First Customers
**Goal:** 3 paying beta customers

**Your Tasks:**
- [ ] Identify 30-50 potential customers
- [ ] Send personalized outreach (not spam)
- [ ] Schedule demos
- [ ] Close first 3 customers
- [ ] Get feedback

**Your Role:**
```
HOW TO GET FIRST CUSTOMERS (Week 16):

1. Identify ideal customers:
   - B2B SaaS companies (>50 employees)
   - Subscription/recurring revenue
   - Known to struggle with churn
   - Founded 2+ years ago
   
2. Find them:
   - LinkedIn search: "CEO" + "SaaS" + industry
   - Product Hunt lurkers (check comments)
   - Twitter SaaS community
   - Indie Hackers community
   - Y Combinator companies
   - Angel.co startup lists

3. Reach out (manual, personal):
   - Find exact email (hunter.io)
   - Subject: "[Company Name] - Recover $X lost to failed payments"
   - Personalize with 2-3 facts about their company
   - Keep short (5 sentences max)
   - Offer 15-min call, not a demo
   - Track responses in spreadsheet

4. On the call:
   - Ask about their payment failures (listen)
   - Don't pitch for 10 minutes
   - Show dashboard live (after they understand problem)
   - Ask: 'If this recovered 10% more revenue, what's it worth?'
   - Offer 30-day free trial
   - Close: 'Can I send you onboarding steps?'

5. After signup:
   - Personal email confirming setup
   - Video walkthrough (2 min)
   - Check-in call after 1 week
   - Ask for feedback continuously

TARGET: 3 customers by end of week paying 15% of what they recover
```

**Expected Output:** First revenue! Track it carefully.

---

### PHASE 5: GROWTH & ITERATION (Weeks 17-26)

#### Weeks 17-20: Scale to 8-10 Customers
**Focus:** Stability, quick feature additions, customer success

- [ ] Weekly customer check-ins
- [ ] Fix bugs customers report
- [ ] Add 3-5 requested features
- [ ] Document all learnings
- [ ] Aim for $5,000 MRR

#### Weeks 21-24: Automate & Improve
**Focus:** Reduce manual work, improve product

- [ ] Automate onboarding (Zapier/Make)
- [ ] Build customer self-serve documentation
- [ ] Create video tutorials
- [ ] Set up automated email campaigns
- [ ] Aim for $10,000 MRR, 15+ customers

#### Weeks 25-26: Plan for Scale
**Focus:** Decide on hiring or fundraising

**Decision point:**
- If $10K+ MRR: Consider raising $50-100K seed
- If $5-10K MRR: Hire first developer to accelerate
- If <$5K MRR: Iterate more, pivot features

---

## COMPLETE BACKEND CODE

See the additional code files created in the repository...

---

## COMPLETE FRONTEND CODE

See the additional code files created in the repository...

---

## API ENDPOINTS REFERENCE

### Authentication
```
POST /auth/signup
POST /auth/login
GET /auth/profile
POST /auth/logout
```

### Integrations
```
GET /integrations
POST /integrations/connect-stripe
POST /integrations/connect-adyen
POST /integrations/connect-square
DELETE /integrations/:id
```

### Failed Payments
```
GET /payments/failed
GET /payments/failed/:id
GET /payments/stats
```

### Retry Attempts
```
GET /retries
GET /retries/:id
GET /retries/status/:status
```

### Invoices
```
GET /invoices
GET /invoices/:id
POST /invoices/:id/send
GET /invoices/:id/pdf
```

### Analytics
```
GET /analytics/summary
GET /analytics/monthly
GET /analytics/history
GET /analytics/recovery-rate
```

### Webhooks
```
POST /webhooks/stripe
POST /webhooks/adyen
POST /webhooks/square
```

---

## DEPLOYMENT GUIDE

### Deploy to Railway.io (Recommended)

1. **Sign up:** railway.app
2. **Connect GitHub:** Link your repo
3. **Create Database:** Add PostgreSQL
4. **Set variables:** Add .env vars
5. **Deploy:** Git push triggers auto-deploy

### Deploy to Render.com (Alternative)

1. **Sign up:** render.com
2. **Connect GitHub:** Link your repo
3. **Create Database:** Add PostgreSQL
4. **Deploy:** Follow their guide
5. **Set domain:** Add custom domain

### Monitoring

- **Uptime:** uptimerobot.com (free)
- **Errors:** sentry.io (free tier)
- **Logs:** Check Railway/Render dashboard

---

## CLAUDE PROMPTS LIBRARY

Use these exact prompts with Claude to generate code:

### Backend Prompts

**Prompt 1: Database Setup**
```
I'm building a payment recovery SaaS. Create for me:
1. PostgreSQL schema with all tables (users, integrations, failed_payments, retry_attempts, invoices)
2. Migration script (SQL)
3. Seed data for testing (5 users, 20 failed payments)
4. Index creation script

Use best practices for transaction handling.
```

**Prompt 2: Express.js Server**
```
Create a complete Express.js server with:
1. Authentication (JWT)
2. Database connection (PostgreSQL)
3. Error handling middleware
4. Request validation middleware
5. CORS configuration

Don't include routes yet, just the core server setup.
```

**Prompt 3: Webhook Handlers**
```
Write webhook handlers for Stripe, Adyen, and Square that:
1. Validate webhook signature
2. Extract payment failure data
3. Save to failed_payments table
4. Trigger retry engine

Include error handling and logging.
```

### Frontend Prompts

**Prompt 1: React Setup**
```
Create a React app (Vite) with:
1. Tailwind CSS configured
2. React Router for pages
3. Axios for API calls
4. Authentication context
5. Error boundary component
6. Loading spinner component
```

**Prompt 2: Dashboard**
```
Create React dashboard with:
1. Summary cards (failed payments, recovered, earnings)
2. Failed payments table (sortable, filterable, paginated)
3. Charts using Recharts
4. Responsive design

Make it production-ready.
```

---

## SECURITY CHECKLIST

- [ ] All passwords hashed (bcrypt)
- [ ] JWT tokens have expiration
- [ ] API keys encrypted in database
- [ ] HTTPS only (no HTTP)
- [ ] CORS properly configured
- [ ] SQL injection prevented (use parameterized queries)
- [ ] Rate limiting on auth endpoints
- [ ] Webhook signatures validated
- [ ] Database backups (daily)
- [ ] Error messages don't leak data
- [ ] Environment variables not in git
- [ ] Sentry monitoring active
- [ ] Database credentials never logged
- [ ] API keys rotated every 90 days

---

## LAUNCH & GO-TO-MARKET

### Pre-Launch Checklist
- [ ] Landing page live
- [ ] 3 beta customers ready to go live
- [ ] Onboarding guides written
- [ ] Support email set up
- [ ] Monitoring active
- [ ] Backup and disaster recovery plan
- [ ] Legal (terms of service, privacy policy)

### Launch Day
- [ ] Notify all 3 beta customers
- [ ] Send press release to 10-20 tech blogs
- [ ] Post on Product Hunt
- [ ] Share in relevant Reddit/HN communities
- [ ] Tweet announcement thread
- [ ] Email your personal network

### First Month
- [ ] Daily check-ins with customers
- [ ] Feature requests triaged
- [ ] Bugs fixed immediately
- [ ] Weekly metrics review
- [ ] Outreach to 50 more prospects

### Month 2-3
- [ ] 10+ paying customers target
- [ ] $5,000+ MRR
- [ ] Case study from first customer
- [ ] Referral program setup
- [ ] Consider hiring first developer

---

## METRICS & SUCCESS TRACKING

### Track These Numbers Weekly

| Metric | Target | Formula |
|--------|--------|---------|
| Active Users | +2 per week | Count connected accounts |
| Failed Payments Detected | +1,000/week | SUM recovered per week |
| Recovery Rate | 12-15% | Recovered / Total Failed |
| Total Recovered $ | +$50K/week (month 3) | SUM of recovery amounts |
| Your Revenue | +$7.5K/week (month 3) | 15% of recovered |
| Customer Lifetime Value | $5,000+ | Avg revenue per customer × 12 months |
| Customer Acquisition Cost | <$500 | (Marketing spend) / (New customers) |
| Churn Rate | <5%/month | Lost customers / Total customers |
| NPS Score | >50 | Customer satisfaction survey |

### Dashboard You Should Create
- Weekly revenue (actual cash received)
- Monthly recurring revenue (MRR)
- Total customers
- Average recovery rate
- Customer feedback summary

---

## NEXT STEPS (Right Now!)

1. **Read this playbook completely** (you're reading it!)
2. **Create your GitHub repo** (github.com/ZAMANI237/payment-recovery-platform)
3. **Week 1 action:** Set up your local development environment
4. **Week 1 prompt to Claude:** Ask for project structure and Docker setup
5. **Tell Claude:** "I'm following the 26-week playbook to build a payment recovery platform. Week 1 focus is environment setup. Here's what I need..."

---

## RESOURCES

### Tools (all links)
- Node.js: https://nodejs.org
- GitHub: https://github.com
- Railway: https://railway.app
- PostgreSQL: https://postgresql.org
- VSCode: https://code.visualstudio.com
- SendGrid: https://sendgrid.com
- Stripe: https://stripe.com
- Sentry: https://sentry.io

### Learning Resources
- Express.js: https://expressjs.com
- React: https://react.dev
- PostgreSQL: https://postgresql.org/docs
- Stripe SDK: https://stripe.com/docs/libraries
- Webhooks: https://stripe.com/docs/webhooks

### Communities
- Indie Hackers: https://indiehackers.com
- Twitter #SaaS: Search "SaaS"
- Product Hunt: https://producthunt.com
- Dev.to: https://dev.to

---

## FINAL NOTES

This is YOUR project. Adapt this playbook as needed. If something takes longer than planned, adjust and keep going. Your first customer is the hardest; the rest become easier.

**6 months from now, you could have:**
- Working payment recovery platform
- 15-20 paying customers
- $10,000+ monthly recurring revenue
- A repeatable customer acquisition process
- A product people actually want

**Then you decide:** Hire a developer, raise capital, or just keep running it solo profitably.

You've got this. 🚀

---

**Document Version:** 1.0  
**Created:** 2026-07-18  
**For:** Founder building payment recovery SaaS  
**Support:** Ask Claude AI anytime, it's your project coach
