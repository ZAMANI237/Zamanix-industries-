# Complete Setup Guide — Revenue Recovery AI Agent

Follow this step-by-step to get the project running locally and deployed to production.

---

## Phase 1: Get Trial Accounts (30 minutes)

### 1. Claude API (You Already Have This ✅)
- You have a Claude account
- Go to: https://console.anthropic.com/
- Create an API key
- Copy it (you'll need it in `.env`)

### 2. Twilio (Free $20 credit)
**Go to:** https://www.twilio.com/try-twilio

**Steps:**
1. Click "Sign up"
2. Enter email, password, phone number
3. Verify phone (they text you a code)
4. Choose "SMS" as use case
5. You get $20 free credit
6. They assign you a phone number (e.g., `+1234567890`)
7. Go to **Console** → **Account** → **API Keys & Tokens**
8. Copy:
   - `Account SID` (starts with `AC`)
   - `Auth Token`
9. Save both

**Cost when scaling:** $0.008 per SMS + $1/month for phone number

### 3. Stripe (Test Mode - Free)
**Go to:** https://dashboard.stripe.com/register

**Steps:**
1. Click "Sign up"
2. Enter email, password
3. Verify email
4. You're in! No payment needed for test mode
5. Toggle to **"Test Mode"** (top left)
6. Go to **Developers** → **API Keys**
7. Copy your **"Secret Key"** (starts with `sk_test_`)
8. Copy **"Publishable Key"** (starts with `pk_test_`)
9. Save both

**Cost when scaling:** 2.9% + $0.30 per transaction

### 4. Calendly (Free Tier)
**Go to:** https://calendly.com

**Steps:**
1. Click "Sign up"
2. Enter email, password
3. Verify email
4. Set up your calendar (connect Google Calendar or Outlook)
5. Create a test event type (e.g., "Oil Change - 30 min")
6. Go to **Account Settings** → **Integrations** → **API Webhooks**
7. Click **"Generate new token"**
8. Copy the token (long string)
9. Save it

**Cost:** Free tier fine for MVP; $12+/month when scaling

### 5. PostgreSQL Database (Pick One)

**Option A: Local (Best for Development)**
- **Mac:** `brew install postgresql`
- **Windows:** https://www.postgresql.org/download/windows/
- **Linux:** `sudo apt-get install postgresql`

Then:
```bash
psql postgres
CREATE DATABASE revenue_recovery;
\q
```

**Option B: Cloud PostgreSQL (Easiest - Free Tier)**

Use **Render** (free tier, no credit card needed):
1. Go to https://render.com
2. Sign up
3. Create new PostgreSQL database (free tier)
4. Copy connection string
5. Use it in `.env` as `DATABASE_URL`

**I recommend Option B** (Render) because:
- No local installation
- Free tier is generous
- Easy to scale later

### 6. Redis (Pick One)

**Option A: Local (Best for Development)**
```bash
# Mac
brew install redis
redis-server

# Linux
sudo apt-get install redis-server
redis-server
```

**Option B: Cloud Redis (Easier - Free Tier)**

Use **Upstash** (free tier):
1. Go to https://upstash.com
2. Sign up
3. Create Redis database (free tier)
4. Copy connection string
5. Use it in `.env` as `REDIS_URL`

**I recommend Option B** (Upstash) for local dev

---

## Phase 2: Clone & Setup Backend Locally (30 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/ZAMANI237/Zamanix-industries-.git
cd Zamanix-industries-/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File
```bash
cp .env.example .env
```

### 4. Fill in `.env` with Your Keys

Open `backend/.env` and add your API keys:

```env
# Claude API
CLAUDE_API_KEY=sk-ant-your-key-from-anthropic

# Twilio
TWILIO_ACCOUNT_SID=ACxxx-from-twilio
TWILIO_AUTH_TOKEN=xxx-from-twilio
TWILIO_PHONE_NUMBER=+1234567890-from-twilio

# Calendly
CALENDLY_TOKEN=xxx-from-calendly

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx-from-stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx-from-stripe

# Database (use your PostgreSQL URL)
DATABASE_URL=postgresql://user:password@localhost:5432/revenue_recovery

# Redis (use your Redis URL)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this

# App
NODE_ENV=development
PORT=3000
```

### 5. Initialize Database
```bash
npm run db:init
```

**Expected output:**
```
✓ Database schema created successfully
✓ Created 8 tables:
  - businesses
  - business_config
  - customers
  - triggers
  - conversations
  - messages
  - outcomes
  - webhooks
```

### 6. Start Backend
```bash
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3000
Environment: development
Database: localhost:5432/revenue_recovery
```

### 7. Test Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2026-07-18T10:00:00Z",
  "environment": "development",
  "version": "1.0.0"
}
```

✅ **Backend is running!**

---

## Phase 3: Setup Lovable Frontend

### 1. Configure API URL in Lovable

In your Lovable project, set the backend API URL:

```javascript
// For local testing:
const API_URL = 'http://localhost:3000/api';

// For production (after deployment):
const API_URL = 'https://your-backend.railway.app/api';
```

### 2. Test Connection

From Lovable, try calling:
```javascript
fetch(`${API_URL}/health`)
  .then(r => r.json())
  .then(data => console.log(data))
```

Should get back the health check response.

---

## Phase 4: Deploy Backend to Production (1 hour)

### Option A: Deploy to Railway (Recommended)

**Why Railway:**
- 1-click deployment from GitHub
- Free tier available
- Costs $5-20/month when scaling
- PostgreSQL included

**Steps:**

1. **Go to Railway:** https://railway.app
2. **Sign up** (free)
3. **Create new project**
4. **Connect GitHub**
   - Authorize Railway to access GitHub
   - Select `Zamanix-industries-` repo
   - Select `main` branch
5. **Add environment variables**
   - In Railway dashboard, go to **Variables**
   - Add all keys from your `.env` file
6. **Deploy**
   - Railway auto-deploys from Git
   - Every push to `main` deploys automatically
7. **Get your URL**
   - Railway gives you a URL like: `https://your-app.railway.app`
   - This is your production backend URL

### Option B: Deploy to Render

**Why Render:**
- Free tier available
- Simple deployment
- Costs $7+/month when scaling

**Steps:**

1. **Go to Render:** https://render.com
2. **Sign up** (free)
3. **Create new Web Service**
4. **Connect GitHub**
5. **Configure:**
   - Build command: `npm ci && npm run db:init`
   - Start command: `npm start`
6. **Add environment variables**
7. **Deploy**

---

## Phase 5: Update Lovable with Production URL

Once deployed, update your Lovable frontend to use the production URL:

```javascript
const API_URL = 'https://your-backend.railway.app/api';
```

Now your frontend (on Lovable) calls your backend (on Railway).

---

## Testing the Full Flow

### 1. Register a Business (via API)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Salon",
    "email": "salon@test.com",
    "password": "password123",
    "phone": "+1234567890",
    "industry": "salon"
  }'
```

**Response:**
```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGc...",
  "message": "Registration successful"
}
```

### 2. Create a Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "noshow",
    "message_channel": "sms",
    "customers": [
      {
        "id": "cust_1",
        "name": "Sarah",
        "phone": "+15551234567",
        "appointment_date": "2026-07-16",
        "appointment_value": 85.00
      }
    ]
  }'
```

**Response:**
```json
{
  "campaignId": "campaign_xxx",
  "messageCount": 1,
  "status": "queued"
}
```

✅ **Campaign created and message queued to send!**

---

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Try: `psql $DATABASE_URL`

### "Cannot connect to Redis"
- Check `REDIS_URL` in `.env`
- Verify Redis is running
- Try: `redis-cli ping`

### "Claude API error"
- Check `CLAUDE_API_KEY` is correct
- Go to https://console.anthropic.com/ and verify

### "Twilio SMS not sending"
- Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Verify you have Twilio credits left
- Check phone number format (must be E.164: +1234567890)

### "CORS error from Lovable"
- Update `FRONTEND_URL` and `LOVABLE_URL` in `.env`
- Restart backend: `npm run dev`

---

## Next Steps

1. ✅ Get trial accounts
2. ✅ Clone and setup backend
3. ✅ Test locally
4. ✅ Deploy to Railway/Render
5. ✅ Connect Lovable frontend
6. ✅ Run first pilot with real business
7. ✅ Iterate based on feedback

**You're ready to launch! 🚀**
