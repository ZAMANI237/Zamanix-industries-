require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pgPromise = require('pg-promise');

const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const campaignsRoutes = require('./routes/campaigns');
const conversationsRoutes = require('./routes/conversations');
const webhooksRoutes = require('./routes/webhooks');
const reportsRoutes = require('./routes/reports');

const app = express();

// Initialize database connection
const pgp = pgPromise();
const db = pgp(config.database.url);
app.locals.db = db;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontend.url, config.lovable.url],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
