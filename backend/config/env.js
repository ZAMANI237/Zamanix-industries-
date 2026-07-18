module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'revenue_recovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-5-sonnet-20241022'
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  
  calendly: {
    token: process.env.CALENDLY_TOKEN,
    apiUrl: process.env.CALENDLY_API_URL || 'https://api.calendly.com'
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  lovable: {
    url: process.env.LOVABLE_URL || 'https://your-app.lovable.app'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  webhook: {
    enableValidation: process.env.ENABLE_WEBHOOK_VALIDATION === 'true'
  }
};
