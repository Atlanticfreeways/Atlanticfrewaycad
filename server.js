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
const LedgerRepository = require('./src/database/repositories/LedgerRepository');
const CompanyRepository = require('./src/database/repositories/CompanyRepository');
const CardRepository = require('./src/database/repositories/CardRepository');
const TransactionRepository = require('./src/database/repositories/TransactionRepository');
const WalletRepository = require('./src/database/repositories/WalletRepository');
const SpendingControlRepository = require('./src/database/repositories/SpendingControlRepository');
const PartnerRepository = require('./src/database/repositories/PartnerRepository');
const ReferralRepository = require('./src/database/repositories/ReferralRepository');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Import routes
const v1Routes = require('./src/routes/v1');
const webhookRoutes = require('./src/routes/webhooks');
const waitlistRoutes = require('./src/routes/waitlist');
const referralRoutes = require('./src/routes/referral');
const partnersMockRoutes = require('./src/routes/partners-mock');
const commissionsRoutes = require('./src/routes/commissions');
const payoutsRoutes = require('./src/routes/payouts');
const analyticsRoutes = require('./src/routes/analytics');
const { specs, swaggerUi } = require('./src/docs/swagger');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const JWTService = require('./src/services/auth/JWTService');
const NotificationService = require('./src/services/NotificationService');

// Initialize Notification Service (Socket.io)
const notificationService = new NotificationService(io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = JWTService.verifyAccessToken(token);
    socket.user = decoded; // Attach user to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(apiLimiter);

const httpContext = require('express-http-context');
const requestId = require('./src/middleware/requestId');

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Tracing Middleware (Must be before inputs)
app.use(httpContext.middleware);
app.use(requestId);

// Input sanitization middleware (excluding passwords)
app.use((req, res, next) => {
  const sanitize = (data) => {
    if (typeof data === 'string') return data.trim();
    if (Array.isArray(data)) return data.map(sanitize);
    if (data && typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        // DO NOT sanitize passwords or they will fail hash checks
        if (key.toLowerCase().includes('password')) {
          sanitized[key] = value;
        } else {
          sanitized[key] = sanitizeInput(value);
        }
      }
      return sanitized;
    }
    return data;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
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
    spendingControl: new SpendingControlRepository(pgPool),
    partner: new PartnerRepository(pgPool),
    referral: new ReferralRepository(pgPool),
    ledger: new LedgerRepository(pgPool)
  };
};

// Repository injection middleware (lazy init)
app.use(async (req, res, next) => {
  try {
    if (!app.locals.repositories) {
      app.locals.repositories = await initializeDatabase();

      // Initialize services
      const PartnerService = require('./src/services/PartnerService');
      const ExchangeRateService = require('./src/services/ExchangeRateService');

      const exchangeRateService = new ExchangeRateService(dbConnection.getRedis(), {}, io);
      // Initialize (loads cache and starts background updates)
      exchangeRateService.initialize().catch(err => logger.error('ExchangeRateService init failed', err));

      const CurrencyConversionLogger = require('./src/services/CurrencyConversionLogger');
      const conversionLogger = new CurrencyConversionLogger(dbConnection.getPostgres());

      const commissionService = require('./src/services/CommissionCalculationService');
      commissionService.init({
        exchangeRate: exchangeRateService,
        conversionLogger: conversionLogger
      });

      const OnfidoAdapter = require('./src/services/kyc/OnfidoAdapter');
      const kycAdapter = new OnfidoAdapter();
      const KYCService = require('./src/services/KYCService');
      const LedgerService = require('./src/services/LedgerService');
      const StatementService = require('./src/services/StatementService');
      const ReconciliationService = require('./src/services/ReconciliationService');
      const FraudDetectionService = require('./src/services/FraudDetectionService');
      const FraudRuleRepository = require('./src/database/repositories/FraudRuleRepository');

      const EventAuditService = require('./src/services/EventAuditService');

      const auditService = new EventAuditService(app.locals.repositories);

      const ComplianceService = require('./src/services/ComplianceService');

      const fraudRuleRepo = new FraudRuleRepository(dbConnection.getPostgres());
      const fraudService = new FraudDetectionService(app.locals.repositories, fraudRuleRepo);
      const statementService = new StatementService(app.locals.repositories);
      const reconciliationService = new ReconciliationService(
        { reconciliation: app.locals.repositories.reconciliation, ledger: app.locals.repositories.ledger },
        { notification: notificationService }
      );

      app.locals.services = {
        kyc: new KYCService(app.locals.repositories, kycAdapter, auditService, notificationService),
        exchangeRate: exchangeRateService,
        commissions: commissionService,
        ledger: new LedgerService(app.locals.repositories, notificationService),
        audit: auditService,
        compliance: new ComplianceService(dbConnection.getPostgres()),
        notification: notificationService,
        statement: new StatementService(app.locals.repositories)
      };

      // Initialize Cron Service (Scheduling)
      const CronService = require('./src/services/CronService');
      const cronService = new CronService(app.locals.services, app.locals.repositories);

      // Initialize JIT Funding Service with services
      if (!app.locals.jitFundingService) {
        const JITFundingService = require('./src/services/JITFundingService');
        app.locals.jitFundingService = new JITFundingService(app.locals.repositories, app.locals.services);
      }

      req.repositories = app.locals.repositories;
      req.services = app.locals.services;
      req.jitFundingService = app.locals.jitFundingService;
    }
  } catch (err) {
    logger.error('Database initialization failed', { error: err.message });
    req.repositories = null;
    req.services = null;
  }
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// CSRF token endpoint
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Health check endpoint (always responds 200 for Railway)
app.get('/health', async (req, res) => {
  try {
    const health = await dbConnection.healthCheck();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: health,
      version: '1.0.0'
    });
  } catch (err) {
    // Still return 200 so Railway doesn't fail deployment
    res.status(200).json({
      status: 'starting',
      timestamp: new Date().toISOString(),
      services: { postgres: 'initializing', redis: 'initializing' },
      version: '1.0.0'
    });
  }
});

// Routes (webhooks before CSRF to use signature verification)
app.use('/webhooks', webhookRoutes);
app.use('/ref', referralRoutes);
app.use('/api/partners-mock', partnersMockRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/analytics', analyticsRoutes);
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

server.listen(PORT, '127.0.0.1', async () => {
  logger.info('Atlanticfrewaycard Platform started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log(`\n🚀 Atlanticfrewaycard Platform`);
  console.log(`📡 Server: http://127.0.0.1:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✓ Security Enhancements Active`);
  console.log(`  - CSRF Protection: Enabled`);
  console.log(`  - CORS: Restricted`);
  console.log(`  - Logging: Winston`);
  console.log(`\n📚 Endpoints:`);
  console.log(`  - GET  /health`);
  console.log(`  - GET  /api/v1/csrf-token`);
  console.log(`  - POST /api/v1/auth/register`);
  console.log(`  - POST /api/v1/partners/register`);
  console.log(`  - GET  /api/v1/partners/profile`);
});

module.exports = app;