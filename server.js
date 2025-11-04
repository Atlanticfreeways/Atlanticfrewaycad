require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import services
const BusinessService = require('./src/services/BusinessService');
const PersonalService = require('./src/services/PersonalService');
const SharedService = require('./src/services/SharedService');

// Import routes
const businessRoutes = require('./src/routes/business');
const personalRoutes = require('./src/routes/personal');
const sharedRoutes = require('./src/routes/shared');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services (placeholder - will be implemented with actual adapters)
const initializeServices = async () => {
  // TODO: Initialize actual database and Marqeta adapters
  const mockDatabase = {
    users: { create: () => {}, findById: () => {}, findByEmail: () => {} },
    companies: { create: () => {}, findById: () => {} },
    cards: { create: () => {}, findById: () => {}, findByMarqetaToken: () => {} },
    transactions: { create: () => {}, getDailySpending: () => {} },
    wallets: { addFunds: () => {}, findByUserId: () => {} },
    kyc: { create: () => {} },
    analytics: { getTransactionMetrics: () => {} }
  };

  const mockMarqetaAdapter = {
    createUser: () => ({ token: 'mock_user_token' }),
    issueCard: () => ({ token: 'mock_card_token', pan: '4111111111111111' }),
    updateCardStatus: () => ({ success: true })
  };

  const mockCryptoService = {
    processDeposit: () => ({ id: 'mock_crypto_tx' })
  };

  const mockStripeService = {
    createTransfer: () => ({ id: 'mock_stripe_tx' })
  };

  const mockNotificationService = {
    sendTransactionAlert: () => ({ sent: true })
  };

  return {
    businessService: new BusinessService(mockMarqetaAdapter, mockDatabase),
    personalService: new PersonalService(mockMarqetaAdapter, mockDatabase, mockCryptoService, mockStripeService),
    sharedService: new SharedService(mockMarqetaAdapter, mockDatabase, mockNotificationService)
  };
};

// Service injection middleware
app.use(async (req, res, next) => {
  if (!app.locals.services) {
    app.locals.services = await initializeServices();
  }
  
  req.businessService = app.locals.services.businessService;
  req.personalService = app.locals.services.personalService;
  req.sharedService = app.locals.services.sharedService;
  
  next();
});

// Routes
app.use('/api/business', businessRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/shared', sharedRoutes);

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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Atlanticfrewaycard Platform running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Services: Business, Personal, Shared');
});

module.exports = app;