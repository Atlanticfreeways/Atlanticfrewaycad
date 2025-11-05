require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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
const authRoutes = require('./src/routes/auth');
const businessRoutes = require('./src/routes/business');
const personalRoutes = require('./src/routes/personal');
const sharedRoutes = require('./src/routes/shared');
const webhookRoutes = require('./src/routes/webhooks');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/webhooks', webhookRoutes);

// Serve static files
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Atlanticfrewaycard Platform API',
    version: '1.0.0',
    services: {
      business: '/api/business',
      personal: '/api/personal',
      shared: '/api/shared'
    },
    status: 'active'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Atlanticfrewaycard Platform`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✓ Phase 1 Implementation Active`);
  console.log(`  - Database Layer: PostgreSQL + Redis`);
  console.log(`  - Authentication: JWT with refresh tokens`);
  console.log(`  - Error Handling: Structured errors`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`  - POST /api/auth/register`);
  console.log(`  - POST /api/auth/login`);
  console.log(`  - POST /api/auth/refresh`);
});

module.exports = app;