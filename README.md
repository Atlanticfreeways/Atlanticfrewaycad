# 🏦 Atlanticfrewaycard Platform

**Unified card platform combining business expense management and personal virtual cards**

## 🎯 Platform Overview

Atlanticfrewaycard merges two powerful card platforms:
- **Business Module**: Corporate expense management (SpendCtrl)
- **Personal Module**: Individual virtual cards with crypto funding (Freeway Cards)
- **Shared Core**: Common services, authentication, and Marqeta integration

## 🏗️ Architecture

### Service-Based Architecture
```
/api/business/*  - Corporate expense management
/api/personal/*  - Personal virtual cards
/api/shared/*    - Common functionality
```

### Core Services
- **BusinessService**: Company management, employee cards, expense controls
- **PersonalService**: Personal accounts, crypto funding, KYC verification
- **SharedService**: Authentication, transactions, JIT funding, analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+ (for business data)
- MongoDB 4+ (for personal data)
- Redis (for caching)
- Marqeta Sandbox Account

### Installation
```bash
# Clone and install
git clone <repository-url>
cd Atlanticfrewaycard
npm install

# Environment setup
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Run tests
npm test

# Security audit
npm audit
```

### Environment Variables
```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/atlanticfrewaycard
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
MARQETA_WEBHOOK_SECRET=your-webhook-secret

# Marqeta
MARQETA_API_KEY=your-api-key
MARQETA_API_SECRET=your-api-secret
MARQETA_BASE_URL=https://sandbox-api.marqeta.com

# Logging
LOG_LEVEL=info
```

### Access Points
- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/waitlist.html
- **API Base**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api-docs
- **Business APIs**: http://localhost:3000/api/v1/business
- **Personal APIs**: http://localhost:3000/api/v1/personal
- **Shared APIs**: http://localhost:3000/api/v1/shared
- **Waitlist API**: http://localhost:3000/api/waitlist

## 📊 API Endpoints

### Business APIs (Corporate)
```
POST /api/business/companies          - Create company
POST /api/business/employees          - Add employee
POST /api/business/cards/corporate    - Issue corporate card
GET  /api/business/expenses           - Expense reports
POST /api/business/approvals/:id      - Spending approvals
```

### Personal APIs (Individual)
```
POST /api/personal/cards/virtual      - Issue personal card
POST /api/personal/wallet/crypto      - Crypto funding
POST /api/personal/wallet/bank        - Bank transfers
POST /api/personal/kyc                - KYC verification
POST /api/personal/cards/:id/freeze   - Card controls
```

### Shared APIs (Common)
```
POST /api/shared/auth/login           - Authentication
GET  /api/shared/transactions         - Transaction history
GET  /api/shared/analytics            - Analytics
POST /api/shared/webhooks/marqeta     - Marqeta webhooks
GET  /api/shared/health               - Health check
```

### Waitlist APIs (Newsletter)
```
POST /api/waitlist                    - Add email to waitlist
GET  /api/waitlist                    - Get all waitlist entries (admin)
GET  /api/waitlist/stats              - Get waitlist statistics
```

## 🔧 Development Status

### ✅ Completed (46.25%)
- [x] Service architecture foundation
- [x] Route structure for all modules
- [x] Security hardening (CSRF, XSS, SSRF, rate limiting)
- [x] Input validation and sanitization
- [x] Authentication and authorization middleware
- [x] Comprehensive test suite
- [x] Security audit (8.5/10 rating)
- [x] Error handling with asyncHandler pattern
- [x] Logging and monitoring

### 🔄 In Progress
- [ ] Database adapters (PostgreSQL + MongoDB)
- [ ] Real Marqeta integration
- [ ] Crypto service integration
- [ ] Frontend interfaces
- [ ] Production deployment

### 📋 Next Steps
1. Complete database implementation
2. Integrate Marqeta API
3. Build frontend interfaces
4. Production deployment
5. Performance optimization

## 🎯 Business Model

### Revenue Streams
- **Business**: SaaS subscriptions ($50-500/month) + transaction fees (0.5%)
- **Personal**: Interchange fees (1-2%) + crypto conversion fees (1-3%)
- **Cross-selling**: Business employees → personal accounts

### Target Markets
- **Business**: Companies needing expense management
- **Personal**: Crypto users, digital nomads, privacy-focused individuals

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token expiration and rotation

### Protection Mechanisms
- **CSRF Protection**: Cookie-based tokens on all state-changing operations
- **XSS Prevention**: Input sanitization with DOMPurify, HTML entity encoding
- **SSRF Protection**: URL whitelist validation, blocked internal IPs
- **Rate Limiting**: Tiered limits (auth: 5/15min, strict: 10/min, general: 100/15min)
- **Input Validation**: Joi schemas on all endpoints
- **SQL Injection**: Parameterized queries, ORM usage

### Security Headers
- Helmet.js for secure HTTP headers
- CORS with origin whitelist
- Content Security Policy
- X-Frame-Options, X-Content-Type-Options

### Monitoring & Logging
- Winston structured logging with file rotation
- Audit trail for sensitive operations
- Error tracking and alerting
- Health check endpoint

### Compliance
- PCI DSS compliance ready
- OWASP Top 10 (2021) addressed
- Security audit rating: 8.5/10
- See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for details

## 📈 Success Metrics

### Phase 1 Targets (6 months)
- 200+ business customers
- 1,000+ personal users
- $5M+ monthly transaction volume

### Phase 2 Targets (12 months)
- 50,000+ total users
- $2M+ annual recurring revenue
- 30% cross-selling rate

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Status**: Foundation complete, ready for core implementation