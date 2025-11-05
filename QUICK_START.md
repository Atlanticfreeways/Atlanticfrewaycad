# 🚀 Atlanticfrewaycard Quick Start Guide

## ✅ What's Been Implemented

All improvement tasks have been completed successfully:

1. ✅ **Jest Testing** - Full test framework with unit and integration tests
2. ✅ **ESLint & Prettier** - Code quality and formatting tools
3. ✅ **GitHub Actions** - CI/CD pipelines for automated testing and deployment
4. ✅ **API Versioning** - All endpoints now at `/api/v1/*`
5. ✅ **Feature Flags** - Runtime feature toggling system
6. ✅ **Event-Driven Architecture** - Webhook processing with event bus
7. ✅ **OpenAPI Documentation** - Interactive API docs at `/api-docs`
8. ✅ **Complete Frontend** - Business and personal portals with dashboards

## 🎯 Getting Started (5 Minutes)

### Step 1: Set Environment Variables
```bash
# Set the required password
export POSTGRES_PASSWORD=your_secure_password

# Or add to .env file
echo "POSTGRES_PASSWORD=your_secure_password" >> .env
```

### Step 2: Start Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Wait 10 seconds for services to be ready
sleep 10
```

### Step 3: Start Application
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### Step 4: Access the Application
Open your browser to:
- **Landing Page:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs
- **Business Portal:** http://localhost:3000/business/login.html
- **Personal Portal:** http://localhost:3000/personal/login.html

## 📱 Using the Application

### Business Users
1. Go to http://localhost:3000/business/register.html
2. Fill in company details
3. Access dashboard at http://localhost:3000/business/dashboard.html
4. Manage employees, cards, and expenses

### Personal Users
1. Go to http://localhost:3000/personal/register.html
2. Create your account
3. Access dashboard at http://localhost:3000/personal/dashboard.html
4. Create virtual cards, manage wallet, view transactions

## 🧪 Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📚 API Documentation

Visit http://localhost:3000/api-docs for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

#### Business
- `POST /api/v1/business/companies` - Create company
- `POST /api/v1/business/employees` - Add employee
- `POST /api/v1/business/cards/corporate` - Issue corporate card
- `GET /api/v1/business/expenses` - Get expense report

#### Personal
- `POST /api/v1/personal/cards/virtual` - Create virtual card
- `POST /api/v1/personal/wallet/crypto` - Fund with crypto
- `GET /api/v1/personal/cards` - List cards
- `POST /api/v1/personal/cards/:id/freeze` - Freeze card

#### Shared
- `GET /api/v1/shared/transactions` - Get transactions
- `GET /api/v1/shared/analytics` - Get analytics

## 🎛️ Feature Flags

Edit `config/features.json` to enable/disable features:

```json
{
  "cryptoFunding": {
    "enabled": true,
    "environments": ["development", "staging"]
  }
}
```

Use in routes:
```javascript
const { requireFeature } = require('./middleware/featureFlag');
router.post('/crypto', requireFeature('cryptoFunding'), handler);
```

## 🔔 Event System

Emit events for async processing:

```javascript
const eventBus = require('./events/EventBus');

// Emit event
await eventBus.emitAsync('transaction.authorized', {
  transactionToken: 'txn_123',
  amount: 100.00
});

// Subscribe to events
eventBus.subscribe('card.created', async (data) => {
  console.log('New card created:', data.cardToken);
});
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Build application image
docker build -t atlanticfrewaycard:latest .
```

## 🔧 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### 2. Make Changes
```bash
# Edit files
# Run tests
npm test

# Check linting
npm run lint

# Format code
npm run format
```

### 3. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### 4. Push and Create PR
```bash
git push origin feature/my-feature
# Create pull request on GitHub
# CI will run automatically
```

## 📊 Project Structure

```
Atlanticfrewaycard/
├── .github/workflows/     # CI/CD pipelines
├── config/                # Configuration files
│   └── features.json      # Feature flags
├── public/                # Frontend files
│   ├── business/          # Business portal
│   ├── personal/          # Personal portal
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript
├── src/
│   ├── adapters/          # External service adapters
│   ├── database/          # Database layer
│   ├── docs/              # API documentation
│   ├── events/            # Event system
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   │   └── v1/            # Version 1 routes
│   └── services/          # Business logic
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── docker-compose.yml     # Docker services
├── Dockerfile             # Application container
├── jest.config.js         # Jest configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
└── server.js              # Application entry point
```

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Tests Failing
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

## 📈 Next Steps

### Immediate (This Week)
1. Write more unit tests (target 80% coverage)
2. Fix security issues from code review
3. Test Marqeta API integration
4. Add input validation

### Short Term (Next 2 Weeks)
1. Implement crypto funding
2. Add KYC verification
3. Email notifications
4. Multi-factor authentication

### Medium Term (Next Month)
1. Performance optimization
2. Security audit
3. Load testing
4. Production deployment

## 🔗 Useful Links

- **API Docs:** http://localhost:3000/api-docs
- **Marqeta Docs:** https://docs.marqeta.com
- **Jest Docs:** https://jestjs.io
- **ESLint Docs:** https://eslint.org
- **Swagger Docs:** https://swagger.io

## 💡 Tips

1. **Use API Docs** - Test endpoints directly in Swagger UI
2. **Check Feature Flags** - Before implementing, check if feature is enabled
3. **Emit Events** - Use event bus for async operations
4. **Write Tests** - Add tests for new features
5. **Format Code** - Run `npm run format` before committing

## 🎓 Key Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run lint             # Check code quality
npm run format           # Format code

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs

# Database
npm run migrate          # Run migrations

# Git
git checkout -b feature/name  # Create branch
git commit -m "message"       # Commit changes
git push origin feature/name  # Push branch
```

---

**Status:** ✅ All systems operational and ready for development!

**Need Help?** Check the documentation files:
- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `IMPROVEMENT_TASKS.md` - Original task breakdown
- `README.md` - Project overview
