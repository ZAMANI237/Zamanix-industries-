# Deployment Guide — Railway & Render

This guide walks you through deploying the backend to production.

---

## Option 1: Deploy to Railway (Recommended)

**Why Railway:**
- ✅ Simplest 1-click deployment
- ✅ Free tier available
- ✅ Costs $5-20/month when scaling
- ✅ PostgreSQL included
- ✅ Auto-deploys on every Git push

### Step 1: Create Railway Account

1. Go to: **https://railway.app**
2. Click **"Sign Up"**
3. Choose **"GitHub"** (sign up with your GitHub account)
4. Authorize Railway to access your GitHub

### Step 2: Create New Project

1. Click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your GitHub account
4. Find and select `Zamanix-industries-`
5. Select `main` branch
6. Click **"Deploy"**

Railway starts building... (takes 2-5 minutes)

### Step 3: Add Environment Variables

1. In Railway dashboard, go to your project
2. Click on the **"Service"** (your app)
3. Go to **"Variables"** tab
4. Add all these variables (from your `.env`):

```
CLAUDE_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
CALENDLY_TOKEN=...
STRIPE_SECRET_KEY=sk_test_...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

**Important: Do NOT include DATABASE_URL or REDIS_URL yet**

### Step 4: Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"PostgreSQL"**
3. Railway creates a PostgreSQL instance
4. It **automatically** adds `DATABASE_URL` variable
5. Done! Database is ready

### Step 5: Add Redis

1. In Railway dashboard, click **"+ New"**
2. Select **"Redis"**
3. Railway creates a Redis instance
4. It **automatically** adds `REDIS_URL` variable
5. Done!

### Step 6: Deploy

1. Railway auto-deploys from Git
2. Every push to `main` automatically deploys
3. Go to **"Deployments"** tab to see logs

### Step 7: Get Your URL

1. In Railway dashboard, click your **Service**
2. Go to **"Settings"**
3. Under **"Domains"**, you'll see: `https://your-app.railway.app`
4. This is your production backend URL

### Step 8: Initialize Database in Production

Run the database initialization:

```bash
railway run npm run db:init
```

Or go to **Railway console** and run:
```bash
npm run db:init
```

**Your backend is now live! 🚀**

---

## Option 2: Deploy to Render

**Why Render:**
- ✅ Free tier available
- ✅ Simple deployment
- ✅ Good alternative to Railway
- ✅ Costs $7+/month when scaling

### Step 1: Create Render Account

1. Go to: **https://render.com**
2. Click **"Sign Up"**
3. Choose **"GitHub"** 
4. Authorize Render to access GitHub

### Step 2: Create Web Service

1. Click **"+ New"** → **"Web Service"**
2. Select **"Connect a repository"**
3. Find and select `Zamanix-industries-`
4. Fill in:
   - **Name:** `revenue-recovery-api`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
5. Click **"Create Web Service"**

### Step 3: Add Environment Variables

1. In Render dashboard, go to your service
2. Click **"Environment"**
3. Add all variables from `.env`
4. Click **"Save"**

### Step 4: Add PostgreSQL Database

1. Click **"+ New"** → **"PostgreSQL"**
2. Fill in:
   - **Name:** `revenue-recovery-db`
   - **Region:** Choose closest to you
3. Click **"Create Database"**
4. Copy the connection string
5. Add to web service **Environment**:
   - **Key:** `DATABASE_URL`
   - **Value:** Connection string

### Step 5: Add Redis

1. Click **"+ New"** → **"Redis"**
2. Fill in details
3. Copy connection string
4. Add to web service **Environment**:
   - **Key:** `REDIS_URL`
   - **Value:** Connection string

### Step 6: Deploy

Render auto-deploys when you push to `main`

### Step 7: Get Your URL

1. In Render dashboard, click your service
2. Under **"Service Details"**, you'll see: `https://your-service.onrender.com`
3. This is your production backend URL

---

## Update Lovable with Production URL

Once deployed, update your Lovable frontend:

**In Lovable, change:**
```javascript
// From:
const API_URL = 'http://localhost:3000/api';

// To:
const API_URL = 'https://your-app.railway.app/api';
// Or:
const API_URL = 'https://your-service.onrender.com/api';
```

Now your Lovable frontend (on Lovable) calls your production backend.

---

## Monitor Your Deployment

### Railway Logs
```bash
railway logs
```

### Render Logs
1. Go to service dashboard
2. Click **"Logs"** tab
3. See real-time logs

### Health Check
```bash
curl https://your-app.railway.app/api/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-07-18T10:00:00Z",
  "environment": "production"
}
```

---

## Troubleshooting Deployment

### "Build failed"
- Check logs (Railway/Render shows them)
- Usually: missing dependencies
- Run locally: `npm install`
- Push again

### "Cannot connect to database"
- Check `DATABASE_URL` variable is set
- Verify database is created (Railway/Render auto-creates)
- Try: `npm run db:init` in production

### "502 Bad Gateway"
- Backend crashed
- Check logs for errors
- Verify all env variables are set
- Restart service (Railway/Render dashboard)

### "CORS error from Lovable"
- Update `LOVABLE_URL` in production env variables
- Restart backend

---

## Costs

### Railway
| Usage | Cost |
|---|---|
| Starter (free tier) | Free |
| Small app | $5-20/month |
| PostgreSQL | Included |
| Redis | Included |

### Render
| Usage | Cost |
|---|---|
| Web Service (free tier) | Free (limited) |
| Web Service (paid) | $7+/month |
| PostgreSQL | $15+/month |
| Redis | $5+/month |

**Railway is cheaper for this use case.**

---

## Next Steps

1. ✅ Deploy to Railway or Render
2. ✅ Get production URL
3. ✅ Initialize database
4. ✅ Update Lovable frontend URL
5. ✅ Test end-to-end
6. ✅ Set up custom domain (optional)

**Your backend is now live! 🚀**
