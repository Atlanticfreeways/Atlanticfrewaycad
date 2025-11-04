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
```

### Access Points
- **API Base**: http://localhost:3000
- **Business APIs**: http://localhost:3000/api/business
- **Personal APIs**: http://localhost:3000/api/personal
- **Shared APIs**: http://localhost:3000/api/shared

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

## 🔧 Development Status

### ✅ Completed
- [x] Service architecture foundation
- [x] Route structure for all modules
- [x] Mock service implementations
- [x] Basic server setup
- [x] Environment configuration

### 🔄 In Progress
- [ ] Database adapters (PostgreSQL + MongoDB)
- [ ] Real Marqeta integration
- [ ] Authentication middleware
- [ ] Crypto service integration
- [ ] Frontend interfaces

### 📋 Next Steps
1. Implement database adapters
2. Add real Marqeta integration
3. Build authentication system
4. Create frontend interfaces
5. Add comprehensive testing

## 🎯 Business Model

### Revenue Streams
- **Business**: SaaS subscriptions ($50-500/month) + transaction fees (0.5%)
- **Personal**: Interchange fees (1-2%) + crypto conversion fees (1-3%)
- **Cross-selling**: Business employees → personal accounts

### Target Markets
- **Business**: Companies needing expense management
- **Personal**: Crypto users, digital nomads, privacy-focused individuals

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- PCI DSS compliance ready
- Real-time fraud detection
- Encrypted data storage
- Audit logging

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