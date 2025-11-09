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
- **Referral Program**: http://localhost:3000/referral.html
- **Partner Dashboard**: http://localhost:3000/partner-dashboard.html
- **Admin Dashboard**: http://localhost:3000/admin/waitlist.html
- **API Base**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api-docs
- **Business APIs**: http://localhost:3000/api/v1/business
- **Personal APIs**: http://localhost:3000/api/v1/personal
- **Shared APIs**: http://localhost:3000/api/v1/shared
- **Partner APIs**: http://localhost:3000/api/v1/partners
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

### Partner APIs (Affiliate Program)
```
POST /api/partners/register           - Register as partner
GET  /api/partners/profile            - Get partner profile
PUT  /api/partners/profile            - Update partner profile
POST /api/partners/api-key            - Generate API key
```

## 🔧 Development Status

### ✅ Completed (52%)
- [x] Service architecture foundation
- [x] Route structure for all modules
- [x] Security hardening (CSRF, XSS, SSRF, rate limiting)
- [x] Input validation and sanitization
- [x] Authentication and authorization middleware
- [x] Comprehensive test suite
- [x] Security audit (8.5/10 rating)
- [x] Error handling with asyncHandler pattern
- [x] Logging and monitoring
- [x] Partner/Affiliate program (Phase 1)
- [x] Referral landing page
- [x] Partner dashboard UI

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
- **Partners**: Affiliate commissions (10-50% revenue share)
- **Cross-selling**: Business employees → personal accounts

### Partner/Affiliate Program
Multi-tier referral system enabling partners to earn recurring commissions by promoting the platform.

**Tier 1 - Individual Affiliates** (10% commission)
- Target: Influencers, bloggers, content creators
- Features: Unique referral links, real-time dashboard, $50 signup bonus
- Payout: Monthly ($50 minimum)

**Tier 2 - Business Resellers** (25% commission)
- Target: Agencies, consultants, accounting firms
- Features: Co-branded materials, lead management, volume bonuses (+5-10%)
- Payout: Monthly ($100 minimum)

**Tier 3 - White-Label Partners** (50% revenue share)
- Target: Banks, fintechs, crypto exchanges
- Features: Full branding, custom cards, dedicated API, custom domain
- Pricing: $5K-15K/month OR $50K-100K setup + 50% ongoing

**Tier 4 - Technology Partners** (15% commission)
- Target: Software integrations (QuickBooks, Xero, etc.)
- Features: API access, webhooks, co-marketing budget
- Model: Strategic partnerships with revenue share

**Year 1 Projection**: $1.89M partner-driven revenue (123+ partners)

### Target Markets
- **Business**: Companies needing expense management
- **Personal**: Crypto users, digital nomads, privacy-focused individuals
- **Partners**: Affiliates, resellers, white-label partners, technology integrators

## 🎁 Referral Program

### How It Works
1. **Sign Up**: Create free account, get unique referral link instantly
2. **Share**: Promote via social media, blog, email, or website
3. **Earn**: Get paid recurring commissions for every signup
4. **Track**: Monitor performance in real-time dashboard

### Features
- 30-day cookie tracking
- Lifetime recurring commissions
- Real-time analytics dashboard
- Social sharing tools (Twitter, LinkedIn, Facebook)
- Marketing materials provided
- Monthly automated payouts

### Access
- **Landing Page**: http://localhost:3000/referral.html
- **Partner Dashboard**: http://localhost:3000/partner-dashboard.html
- **API**: POST /api/v1/partners/register

---

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