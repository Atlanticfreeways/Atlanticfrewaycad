require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');
const corsOptions = require('./config/corsConfig');
const { csrfProtection, csrfErrorHandler } = require('./src/middleware/csrfProtection');
const { sanitizeInput } = require('./src/utils/sanitize');

// Import database
const dbConnection = require('./src/database/connection');
const UserRepository = require('./src/database/repositories/UserRepository');
const CompanyRepository = require('./src/database/repositories/CompanyRepository');
const CardRepository = require('./src/database/repositories/CardRepository');
const TransactionRepository = require('./src/database/repositories/TransactionRepository');
const WalletRepository = require('./src/database/repositories/WalletRepository');
const SpendingControlRepository = require('./src/database/repositories/SpendingControlRepository');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Import routes
const v1Routes = require('./src/routes/v1');
const webhookRoutes = require('./src/routes/webhooks');
const waitlistRoutes = require('./src/routes/waitlist');
const { specs, swaggerUi } = require('./src/docs/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Input sanitization middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  next();
});

// Initialize database and repositories
const initializeDatabase = async () => {
  await dbConnection.init();
  
  const pgPool = dbConnection.getPostgres();
  
  return {
    user: new UserRepository(pgPool),
    company: new CompanyRepository(pgPool),
    card: new CardRepository(pgPool),
    transaction: new TransactionRepository(pgPool),
    wallet: new WalletRepository(pgPool),
    spendingControl: new SpendingControlRepository(pgPool)
  };
};

// Repository injection middleware
app.use(async (req, res, next) => {
  if (!app.locals.repositories) {
    app.locals.repositories = await initializeDatabase();
  }
  req.repositories = app.locals.repositories;
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// CSRF token endpoint
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await dbConnection.healthCheck();
  const status = health.postgres === 'healthy' && health.redis === 'healthy' ? 200 : 503;
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: health,
    version: '1.0.0'
  });
});

// Routes (webhooks before CSRF to use signature verification)
app.use('/webhooks', webhookRoutes);
app.use('/api/v1', v1Routes);
app.use('/api/waitlist', waitlistRoutes);

// Legacy routes redirect to v1 (with path validation)
app.use('/api/*', (req, res, next) => {
  if (!req.path.startsWith('/v1')) {
    const safePath = `/api/v1${req.path}`.replace(/\.\./g, '');
    if (safePath.startsWith('/api/v1')) {
      return res.redirect(308, safePath);
    }
    return res.status(400).json({ error: 'Invalid path' });
  }
  next();
});

// Serve static files
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Atlanticfrewaycard Platform API',
    version: '1.0.0',
    services: {
      business: '/api/v1/business',
      personal: '/api/v1/personal',
      shared: '/api/v1/shared'
    },
    apiVersion: 'v1',
    status: 'active'
  });
});

// CSRF error handler
app.use(csrfErrorHandler);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, async () => {
  logger.info('Atlanticfrewaycard Platform started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log(`\n🚀 Atlanticfrewaycard Platform`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✓ Security Enhancements Active`);
  console.log(`  - CSRF Protection: Enabled`);
  console.log(`  - CORS: Restricted`);
  console.log(`  - Logging: Winston`);
  console.log(`\n📚 Endpoints:`);
  console.log(`  - GET  /health`);
  console.log(`  - GET  /api/v1/csrf-token`);
  console.log(`  - POST /api/v1/auth/register`);
});

module.exports = app;