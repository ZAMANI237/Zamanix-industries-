# Revenue Recovery AI Agent

🤖 **An AI agent that automatically wins back cancellations, no-shows, and lapsed customers for local service businesses.**

---

## What This Does

Local service businesses (salons, auto shops, fitness studios) lose **15–20% of potential revenue** monthly to:
- No-shows (customer forgets appointment)
- Last-minute cancellations (slot stays empty)
- Lapsed customers (stopped coming back)
- Unpaid invoices (no one follows up)

This AI agent **automatically handles all of this** by:
1. Detecting when a cancellation/no-show happens
2. Drafting a friendly text message using Claude AI
3. Sending via Twilio SMS
4. Receiving customer replies
5. Intelligently responding (book new slot, collect payment, or escalate to human)
6. Logging every outcome
7. Generating weekly reports showing revenue recovered

**Result:** Businesses recover **$2-5k/month** in lost revenue, automatically.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Lovable (React/Next.js) | Visual builder, deploys to cloud |
| **Backend** | Node.js + Express | Fast, scalable, great for webhooks |
| **Database** | PostgreSQL | Reliable, performant, open-source |
| **Job Queue** | Bull + Redis | Schedule messages, handle retries |
| **AI** | Claude API | Best-in-class language model |
| **Messaging** | Twilio SMS | Industry standard, reliable |
| **Payments** | Stripe | Payment link generation |
| **Calendar** | Calendly API | Most businesses use it |
| **Deployment** | Railway or Render | Simple, free tier available |

---

## Getting Started (5 minutes)

### 1. Clone Repo
```bash
git clone https://github.com/ZAMANI237/Zamanix-industries-.git
cd Zamanix-industries-/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Copy `.env.example` → `.env`
```bash
cp .env.example .env
```

### 4. Add Your API Keys
Get free trial accounts from:
- Claude API (https://console.anthropic.com/) — you have this ✅
- Twilio (https://www.twilio.com/try-twilio) — $20 free credit
- Stripe (https://dashboard.stripe.com) — free test mode
- Calendly (https://calendly.com) — free tier
- PostgreSQL (https://render.com) — free tier
- Redis (https://upstash.com) — free tier

Add them to `.env`:
```env
CLAUDE_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
CALENDLY_TOKEN=...
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
```

### 5. Initialize Database
```bash
npm run db:init
```

### 6. Start Backend
```bash
npm run dev
```

✅ **Backend running on `http://localhost:3000`**

### 7. Deploy to Production
See `docs/DEPLOYMENT.md` for Railway/Render setup (1-click deployment).

---

## Project Structure

```
backend/
├── server.js                 # Express app entrypoint
├── config/
│   └── env.js               # Environment variables
├── database/
│   ├── schema.sql           # PostgreSQL schema
│   └── init.js              # Database initialization
├── routes/
│   ├── auth.js              # Login/register
│   ├── campaigns.js         # Create AI campaigns
│   ├── conversations.js     # Message threads
│   ├── webhooks.js          # Receive SMS/Calendly/Stripe
│   └── reports.js           # Analytics & CSV export
├── services/
│   ├── claudeService.js     # Claude API integration
│   ├── twilioService.js     # Twilio SMS integration
│   ├── calendlyService.js   # Calendly calendar integration
│   ├── stripeService.js     # Stripe payment links
│   └── jobQueueService.js   # Bull job queue (scheduling)
├── middleware/
│   ├── auth.js              # JWT authentication
���   ├── errorHandler.js      # Global error handling
│   └── webhookValidator.js  # Verify webhook signatures
├── utils/
│   ├── logger.js            # Logging (Pino)
│   └── validators.js        # Input validation
├── package.json             # Dependencies
├── Dockerfile               # Docker containerization
├── docker-compose.yml       # Local dev environment
└── .env.example             # Environment template
```

---

## How It Works (End-to-End)

### Scenario: No-Show Recovery

1. **Trigger:** Customer marks appointment as "no-show" in Calendly
2. **Webhook:** Calendly sends webhook to backend
3. **Detection:** Backend detects trigger, creates `trigger` record
4. **AI Drafting:** Claude drafts friendly message: "Hey Sarah! Saw you had to miss your Thursday appointment — want me to grab you a new slot this week?"
5. **Send:** Backend sends via Twilio SMS
6. **Customer Replies:** Sarah texts back: "Tuesday works!"
7. **Webhook:** Twilio sends reply to backend
8. **AI Decision:** Claude decides: "This is a booking request"
9. **Auto-Action:** Backend books Tuesday slot in Calendly, sends confirmation
10. **Outcome:** Backend logs: "Rebooked, $85 revenue recovered"
11. **Report:** Weekly email to Sarah: "This week we recovered $340 from 3 rebooked appointments + 1 paid invoice!"

---

## API Endpoints

See `docs/API.md` for complete reference.

**Quick Examples:**

### Register a Business
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Glow Salon",
    "email": "owner@glowsalon.com",
    "password": "password123",
    "phone": "+1234567890",
    "industry": "salon"
  }'
```

### Create a Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "noshow",
    "message_channel": "sms",
    "customers": [{
      "id": "cust_1",
      "name": "Sarah",
      "phone": "+15551234567",
      "appointment_date": "2026-07-16",
      "appointment_value": 85
    }]
  }'
```

### Get Weekly Report
```bash
curl -X GET http://localhost:3000/api/reports/weekly/BUSINESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Configuration

### Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Purpose | Example |
|---|---|---|
| `CLAUDE_API_KEY` | AI message drafting | `sk-ant-...` |
| `TWILIO_ACCOUNT_SID` | SMS sending | `AC...` |
| `TWILIO_PHONE_NUMBER` | Your Twilio number | `+1234567890` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Job queue | `redis://...` |
| `JWT_SECRET` | Auth token signing | `your-secret-key` |

### Database

Schema automatically created on `npm run db:init`.

Tables:
- `businesses` — SaaS customers
- `customers` — Customer contacts
- `triggers` — No-show/cancellation events
- `conversations` — Message threads
- `messages` — Individual messages
- `outcomes` — Results (rebooked, paid, escalated, etc.)
- `webhooks` — Audit log
- `api_keys` — API authentication

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check database is running
psql $DATABASE_URL

# Or check connection string
echo $DATABASE_URL
```

### "SMS not sending"
- Check Twilio credits (go to Account → Billing)
- Verify phone number format (+1234567890)
- Check `TWILIO_PHONE_NUMBER` in .env

### "Claude API error"
- Verify API key is correct
- Check remaining credits
- See logs: `npm run dev` shows all errors

### "CORS error from Lovable"
- Update `LOVABLE_URL` in .env
- Restart backend: `npm run dev`

See `docs/TROUBLESHOOTING.md` for more.

---

## Deployment

### Local Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Docker
```bash
docker-compose up
# Starts PostgreSQL, Redis, Node app
```

### Production (Railway)
1. Push to GitHub
2. Railway auto-deploys
3. Get URL like `https://your-app.railway.app`

See `docs/DEPLOYMENT.md` for detailed guide.

---

## Phases & Roadmap

### Phase 1: MVP (Current)
- ✅ SMS outreach (no-shows, cancellations)
- ✅ AI message drafting (Claude)
- ✅ Auto-booking (Calendly)
- ✅ Payment links (Stripe)
- ✅ Weekly reporting

### Phase 2: Expansion
- 🔄 WhatsApp messaging
- 🔄 Email channel
- 🔄 Multiple calendar integrations (Square, Acuity)
- 🔄 Lapsed customer reactivation

### Phase 3: Intelligence
- ⏳ Voice calls (Retell AI)
- ⏳ Predictive no-show scoring
- ⏳ A/B testing message variants
- ⏳ Industry benchmarking

### Phase 4: Scale
- ⏳ Inbound call handling
- ⏳ Review request automation
- ⏳ Waitlist auto-fill
- ⏳ Financial products (payday advances)

---

## Pricing Model

When you launch:
- **Base subscription:** $99-299/month
- **Plus:** 10-20% of recovered revenue

**Example:** Recover $5,000 → Customer pays $200 + $750 = $950/month

---

## Costs to Operate

| Service | Monthly Cost | Notes |
|---|---|---|
| Claude API | $0-50 | Pay per token, cheap at low volume |
| Twilio SMS | $10-100 | $0.008/msg + $1 phone |
| Stripe | 2.9% + $0.30 | Only charged on transactions |
| Calendly | Free | Free tier, $12+ when scaling |
| PostgreSQL | $15-50 | Railway/Render hosted |
| Redis | $5-15 | Upstash hosted |
| Hosting | $5-20 | Railway or Render |
| **Total** | **$35-250** | **Scales with revenue** |

---

## Contributing

This is a solo project. To contribute:
1. Fork repo
2. Create feature branch
3. Submit pull request

---

## License

MIT License — free to use and modify

---

## Support

- 📖 Docs: See `docs/` folder
- 🐛 Issues: GitHub Issues
- 💬 Questions: See docs first, then open issue

---

## Next Steps

1. ✅ Clone repo (`git clone ...`)
2. ✅ Get trial accounts (30 min)
3. ✅ Setup backend locally (`npm run dev`)
4. ✅ Deploy to Railway (10 min)
5. ✅ Connect Lovable frontend
6. ✅ Run pilot with first business (1 week)
7. ✅ Show revenue data to next prospects
8. ✅ Scale! 🚀

---

**Built by Zamani Industries**

*Automating revenue recovery for local service businesses.*
