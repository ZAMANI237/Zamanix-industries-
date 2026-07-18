# Twilio Setup Guide — Step by Step

This guide walks you through getting Twilio working with the Revenue Recovery AI Agent.

---

## Step 1: Create Twilio Account

1. Go to: **https://www.twilio.com/try-twilio**
2. Click **"Sign up"**
3. Enter your email, password
4. Enter your phone number (they'll text a verification code)
5. Verify the code they send
6. Answer the onboarding questions:
   - "What do you plan to build?" → Select **"SMS"`
   - "How will you use Twilio?" → Select **"Send SMS messages"`
7. Click **"Get Started"`

**You now have:**
- A Twilio account with **$20 free credit**
- A **phone number** assigned to you (e.g., `+1234567890`)
- **30 days** to use the credit before it expires

---

## Step 2: Get Your API Credentials

1. From the Twilio dashboard, click **"Console"** (top left)
2. You should see your account overview
3. Find and copy these three values:

| Value | Where to Find | Example |
|---|---|---|
| **Account SID** | Dashboard, under "Account" | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| **Auth Token** | Dashboard, under "Account" | `your_auth_token_here` |
| **Phone Number** | Dashboard, top section | `+1234567890` |

**Important:** Save these in a safe place. You'll use them in `.env`

---

## Step 3: Add to Backend `.env`

In `backend/.env`, add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Step 4: Configure Webhooks (For Receiving SMS Replies)

When a customer replies to your SMS, you need to tell Twilio where to send the message.

### Step 4a: Get Your Backend URL

**Local development:**
```
http://localhost:3000/api/webhooks/sms
```

**After deployment (Railway/Render):**
```
https://your-app.railway.app/api/webhooks/sms
```

### Step 4b: Configure in Twilio Console

1. Go to **Twilio Console** → **Phone Numbers** → **Manage** → **Active Numbers**
2. Click your phone number
3. Scroll down to **"Messaging"** section
4. Find **"A Message Comes In"**
5. Set it to **"Webhook"**
6. Paste your backend webhook URL
7. Make sure it's set to **"HTTP POST"**
8. Click **"Save"**

**Now:** When someone texts your Twilio number, the message goes to your backend.

---

## Step 5: Test SMS Sending

Test that SMS sending works:

```bash
# From your backend directory
node -e "
const twilio = require('twilio');
const client = twilio('ACxxx', 'your_token');
client.messages.create({
  body: 'Hello from Revenue Recovery AI!',
  from: '+1234567890',
  to: '+1YOUR_PHONE_NUMBER'
}).then(m => console.log('Message sent:', m.sid));
"
```

Replace:
- `ACxxx` with your Account SID
- `your_token` with your Auth Token
- `+1234567890` with your Twilio phone number
- `+1YOUR_PHONE_NUMBER` with a real phone number (yours, for testing)

**You should get a text message!**

---

## Step 6: Test SMS Receiving

1. Text your Twilio phone number from your phone
2. Check your backend logs (should see the incoming message)
3. Your backend should store it in the database

---

## Monitoring Twilio

### Check Message Logs

1. Go to **Twilio Console** → **Monitor** → **Logs**
2. You'll see all SMS sent and received
3. Each message shows:
   - Phone number
   - Message content
   - Timestamp
   - Status (sent, failed, etc.)

### Check Account Balance

1. Go to **Twilio Console** → **Account**
2. Look for **"Account Balance"**
3. You started with **$20 credit**
4. Each SMS costs ~$0.008
5. Phone number costs $1/month

**Example costs:**
- 100 SMS messages = $0.80
- 1,000 SMS messages = $8.00
- 10,000 SMS messages = $80.00 (still under $20 credit for MVP testing)

---

## Upgrading to Production (When Ready)

### Add Payment Method

1. Go to **Twilio Console** → **Account** → **Billing**
2. Click **"Add Payment Method"**
3. Add a credit card
4. Your free $20 credit will be used first
5. After that, you pay for usage

### Expected Monthly Costs

| Volume | Cost |
|---|---|
| 1,000 SMS/month | ~$8 + $1 phone |
| 5,000 SMS/month | ~$40 + $1 phone |
| 10,000 SMS/month | ~$80 + $1 phone |
| 50,000 SMS/month | ~$400 + $1 phone |

---

## Troubleshooting

### "Invalid Account SID"
- Go back to Twilio Console
- Copy Account SID again (it's a long alphanumeric string)
- Make sure there are no extra spaces

### "SMS not sending"
- Check you have credits left (go to Account → Billing)
- Check phone number format (must start with `+`)
- Check TWILIO_PHONE_NUMBER is correct

### "Not receiving SMS replies"
- Check webhook URL is correct
- Make sure backend is running and accessible
- Check Twilio logs to see if messages are being received

### "WhatsApp not working"
- WhatsApp requires additional setup
- For MVP, stick to SMS
- Add WhatsApp later in Phase 3

---

## WhatsApp (Optional, Later)

Once SMS is working, you can add WhatsApp:

1. Go to **Twilio Console** → **Explore** → **WhatsApp**
2. Request access
3. Complete verification
4. Get a WhatsApp number
5. Use the same code, but with `whatsapp:` prefix

**For now, focus on SMS. It's the MVP channel.**

---

## API Reference

Sending an SMS via backend:

```javascript
const twilioService = require('../services/twilioService');

// Send SMS
await twilioService.sendSMS(
  '+15551234567',  // customer phone
  'Hey Sarah! Saw you missed your appointment...'  // message
);
```

Receiving SMS reply (automatic, handled by webhook):

```javascript
// Your webhook receives:
{
  From: '+15551234567',
  Body: 'Tuesday works!',
  MessageSid: 'SMxxx...'
}
```

---

**You're ready to send and receive SMS! 🎉**
