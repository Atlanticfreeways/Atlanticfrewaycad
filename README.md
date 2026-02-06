# Atlantic Freeway Card Platform

Modern Card Issuance Platform for B2C & B2B

[![CI/CD](https://github.com/Atlanticfreeways/Atlanticfrewaycad/workflows/Production%20CI/CD/badge.svg)](https://github.com/Atlanticfreeways/Atlanticfrewaycad/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Go](https://img.shields.io/badge/go-1.21-blue)](https://golang.org)

---

## What We Offer

### For Personal Users

**Virtual & Physical Cards**
- Instant virtual Mastercard (ready in seconds)
- Physical cards delivered worldwide (5-7 days)
- Create multiple cards for different purposes
- Freeze/unfreeze cards instantly from dashboard

**Multi-Currency Wallet**
- Hold 150+ currencies (USD, EUR, GBP, NGN, KES, ZAR, etc.)
- Crypto support (Bitcoin, Ethereum)
- Real-time currency conversion at competitive rates
- Spend in any currency, we auto-convert

**Smart Spending Controls**
- Set daily, weekly, or monthly limits
- Block specific merchant categories (gambling, adult content)
- Restrict card usage by country/region
- Real-time transaction alerts (push, email, SMS)

**Privacy & Security**
- Disposable virtual cards for one-time purchases
- Two-factor authentication (2FA)
- Biometric login (fingerprint, Face ID)
- Zero balance on card (JIT funding = stolen card can't be drained)

### For Business Users

**Team Card Management**
- Bulk card issuance via CSV upload (create 100+ cards at once)
- Per-employee spending limits and budgets
- Role-based access control (5 user roles)
- Real-time visibility into all company spending

**Expense Management**
- Automatic transaction categorization
- Receipt capture and attachment
- Approval workflows for large purchases
- Merchant whitelisting/blacklisting

**Financial Operations**
- Virtual account numbers for payroll deposits
- Automated reconciliation with accounting systems
- Monthly statements (PDF/CSV export)
- Multi-currency contractor payments

**Enterprise Features**
- API access for programmatic card issuance
- Custom integrations (QuickBooks, Xero, NetSuite)
- Dedicated account manager
- SSO integration (Google Workspace, Okta)

## Service Tiers & Pricing

### Personal Plans

| Feature | Basic (Free) | Standard (Free) | Turbo ($9.99/mo) |
|---------|--------------|-----------------|------------------|
| **Monthly Limit** | $100 | $1,000 | $10,000 |
| **Virtual Cards** | 3 | 10 | Unlimited |
| **Physical Cards** | No | 1 | 5 |
| **Crypto Funding** | No | No | Yes |
| **ATM Withdrawals** | No | $2.50/tx | $1.50/tx |
| **Priority Support** | No | No | Yes (2hr response) |
| **KYC Required** | None | ID Upload | Full Verification |

### Business Plans

| Feature | Starter ($29/mo) | Growth ($99/mo) | Enterprise (Custom) |
|---------|------------------|-----------------|---------------------|
| **Employee Cards** | 10 | 50 | Unlimited |
| **Monthly Volume** | $10,000 | $100,000 | Unlimited |
| **Bulk Issuance** | No | Yes | Yes |
| **API Access** | No | Yes | Yes |
| **Reconciliation** | Manual | Automated | Automated + Custom |
| **Support** | Email (24hr) | Priority (4hr) | Dedicated Manager |
| **Custom Integrations** | No | No | Yes |

### Transaction Fees (All Plans)
- Physical Card Issuance: $5 one-time
- Currency Conversion: 0.5% (fiat), 2% (crypto)
- ATM Withdrawals: $2.50 + operator fees
- International Transfers: $3 flat fee
- No Hidden Fees: No monthly maintenance, no inactivity fees

## How It Works

### Just-in-Time (JIT) Funding
Your card has **$0 balance**. When you make a purchase:

```
1. Merchant swipes card → 2. Authorization request (<50ms) → 
3. Check wallet balance → 4. Apply spending rules → 
5. Approve/Decline → 6. Fund transaction if approved
```

Benefits:
- Security: Stolen card = $0 risk (no balance to steal)
- Flexibility: Use any currency in your wallet
- Control: Real-time limit enforcement

### Multi-Currency Flow
```
You have: €500 in wallet
You spend: $100 USD at Amazon
We convert: €500 → $100 (at live rate + 0.5% spread)
Result: €91.50 deducted, transaction approved
```

## Platform Architecture

```
                    ┌─────────────────────┐
                    │   User Dashboard    │
                    │   (Next.js + React) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway       │
                    │   (Node.js/Express) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼────────┐  ┌───▼────┐  ┌───────▼────────┐
    │  JIT Funding     │  │ Redis  │  │   PostgreSQL   │
    │  Service (Go)    │  │ Cache  │  │   Database     │
    │  <100ms latency  │  │        │  │   (Multi-AZ)   │
    └─────────┬────────┘  └────────┘  └────────────────┘
              │
    ┌─────────▼────────┐
    │  Marqeta API     │
    │  (Card Issuer)   │
    └──────────────────┘
```

Data Flow:
- User Action → Dashboard sends request
- API Gateway → Validates, authenticates, routes
- JIT Service → Checks balance, applies rules (<100ms)
- Database → Stores transactions, user data
- Cache → Fast lookups for auth, rates
- Marqeta → Physical card network integration

## Security & Compliance

### Bank-Level Security
- Encryption: AES-256 at rest, TLS 1.2+ in transit
- Authentication: JWT tokens + Redis session caching
- Authorization: Role-based access control (RBAC)
- 2FA: SMS, authenticator app, biometric
- Fraud Detection: AI-powered anomaly detection

### Compliance
- PCI-DSS Level 1: Highest payment security standard
- GDPR Compliant: Data export, deletion, privacy rights
- SOC 2 Type II: (In progress) Security audit
- FDIC Insured: Funds held at partner bank (up to $250K)

### Platform Capabilities
- 99.9% Uptime SLA: Multi-AZ deployment
- Sub-100ms Authorization: High-performance Go service
- Auto-Scaling: Kubernetes handles traffic spikes
- Real-Time Updates: WebSocket for live balance changes
- API-First: RESTful APIs for all operations

## Use Cases

### Personal
- Online Shopping: Amazon, Netflix, Spotify subscriptions
- Travel: Hold multiple currencies, no foreign fees
- Crypto Spending: Convert Bitcoin to USD, spend anywhere
- Privacy: Disposable cards for untrusted websites
- Budgeting: Strict limits prevent overspending

### Business
- Remote Teams: Issue cards to employees worldwide
- Marketing Spend: Track ad spend across platforms (Google, Meta)
- Travel & Expenses: Employees book flights/hotels on company cards
- Vendor Payments: Pay SaaS subscriptions (AWS, Salesforce)
- Contractor Payouts: Pay freelancers in their local currency

## Tech Stack

Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Socket.io  
Backend: Node.js (Express), Go (JIT Service)  
Database: PostgreSQL 15 (Multi-AZ), Redis 7  
Queue: RabbitMQ (Amazon MQ)  
Infrastructure: Kubernetes (EKS), Terraform, AWS  
Integrations: Marqeta (cards), Stripe (payments), Paystack (Africa), OpenExchangeRates

## Project Status

Core Platform: Complete (13,306 lines of code, 96 test files)  
Infrastructure: Code Complete (Terraform + Kubernetes ready)  
Production: Pre-Production (awaiting AWS provisioning)  
Launch Target: 12 weeks from infrastructure deployment

See [COMPREHENSIVE_ROADMAP.md](COMPREHENSIVE_ROADMAP.md) for detailed timeline.

## Roadmap & Planned Features

### ✅ Currently Available
- **Admins/Businesses**:
    - Card issuance (virtual & physical), JIT funding, multi-currency wallet
    - Budget tracking, approval workflows, dispute handling
    - **Business Analytics** (Spending by category/employee/trends)
    - **Accounting Integrations** (QuickBooks/Xero/NetSuite - Mocked)
- **Mobile App (Alpha)**:
    - Real-time Dashboard & Spending Insights
    - Card Management (Freeze/Unfreeze)
    - Receipt Capture (Camera + OCR)
    - Push Notifications
- **Onboarding**:
    - **Automated KYC** (Onfido Integration - Mocked Backend)
    - Real-time policy enforcement and spending controls

### 🚀 Near-Term (Months 3-6)
- Accounting integrations (QuickBooks, Xero, NetSuite)
- Mobile app (iOS/Android) with OCR receipt capture
- Advanced analytics and scheduled reports
- Automated KYC and instant funding (Plaid)

### 🎯 Mid-Term (Months 6-12)
- AI-powered spend optimization and fraud detection
- Real-time collaboration tools and shared workspaces
- Developer platform (GraphQL API, SDKs, webhooks)
- No-code integrations (Zapier, Make.com, n8n)

### 🌟 Long-Term (Year 2+)
- Crypto features (1% BTC cashback, staking, DeFi integration)
- Global payment methods (UPI, PIX, M-Pesa, Alipay)
- Banking services (checking, savings, credit lines, loans)
- Enterprise features (SSO, white-label, advanced RBAC)
- Treasury management and spend optimization tools
- AI assistant, voice commands, and marketplace ecosystem

Detailed roadmaps: [TIER 1](roadmaps/TIER1_IMMEDIATE_ROADMAP.md) | [TIER 2](roadmaps/TIER2_NEARTERM_ROADMAP.md) | [TIER 3](roadmaps/TIER3_MIDTERM_ROADMAP.md) | [TIER 4](roadmaps/TIER4_LONGTERM_ROADMAP.md) | [TIER 5](roadmaps/TIER5_FUTURE_ROADMAP.md)

## Documentation

### For Users
- [Product Brief](PRODUCT_BRIEF.md) - Complete feature overview and pricing
- [Comprehensive Roadmap](COMPREHENSIVE_ROADMAP.md) - 12-week production roadmap

### For Developers
- [Infrastructure Guide](infrastructure/README.md) - Deployment instructions
- [Enterprise Readiness Gap Analysis](docs/ENTERPRISE_READINESS_GAP_ANALYSIS.md) - Production checklist
- [Marqeta API Assessment](docs/MARQETA_ASSESSMENT.md) - Integration details
- [Task List](TASK_LIST.md) - Development progress
- [API Documentation](docs/API.md) - REST API reference

## Business Model

### Revenue Streams
1. **Subscription Fees**: $9.99/mo (Personal Turbo), $29-99/mo (Business)
2. **Transaction Fees**: 0.5% currency conversion, 2% crypto conversion
3. **Card Fees**: $5 per physical card issuance
4. **ATM Fees**: $2.50 per withdrawal
5. **Enterprise Licensing**: Custom pricing for white-label partners

### Target Market
- Personal: 18-45 year olds, crypto enthusiasts, digital nomads, privacy-conscious users
- Business: Remote-first companies, marketing agencies, e-commerce businesses, startups
- Geographic: US, UK, EU, Nigeria, Kenya, South Africa (expanding to 50+ countries)

### Competitive Advantage
- JIT Funding: More secure than Revolut/Wise pre-funded cards
- Crypto-Native: Unlike traditional banks, we embrace Bitcoin/Ethereum
- Bulk Issuance: Faster than Brex for large teams (1000+ cards in minutes)
- Transparent Pricing: No hidden fees unlike legacy banks

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Code Standards: ESLint + Prettier, Conventional Commits, 75%+ test coverage

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Partners & Integrations

- Marqeta (Nasdaq: MQ) - Card issuing platform (trusted by Square, DoorDash, Uber)
- Stripe - Payment processing infrastructure
- Paystack - African payment gateway (Nigeria, Kenya, South Africa)
- OpenExchangeRates - Real-time currency conversion (150+ currencies)
- AWS - Cloud infrastructure (EKS, RDS, ElastiCache)

## Contact & Support

### For Users
- Website: https://atlanticfrewaycard.com
- Email: support@atlanticfrewaycard.com
- Live Chat: Available 24/7 in dashboard
- Help Center: https://help.atlanticfrewaycard.com

### For Developers
- GitHub Issues: [Report bugs](https://github.com/Atlanticfreeways/Atlanticfrewaycad/issues)
- API Docs: [docs/API.md](docs/API.md)
- Developer Portal: (Coming soon)

---

Built with ❤️ by the Atlantic Freeway Team

Last Updated: February 3, 2026T Funding**: More secure than Revolut/Wise pre-funded cards
- **Crypto-Native**: Unlike traditional banks, we embrace Bitcoin/Ethereum
- **Bulk Issuance**: Faster than Brex for large teams (1000+ cards in minutes)
- **Transparent Pricing**: No hidden fees unlike legacy banks

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Code Standards**: ESLint + Prettier, Conventional Commits, 75%+ test coverage

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Partners & Integrations

- **Marqeta** (Nasdaq: MQ) - Card issuing platform (trusted by Square, DoorDash, Uber)
- **Stripe** - Payment processing infrastructure
- **Paystack** - African payment gateway (Nigeria, Kenya, South Africa)
- **OpenExchangeRates** - Real-time currency conversion (150+ currencies)
- **AWS** - Cloud infrastructure (EKS, RDS, ElastiCache)

---

## 📞 Contact & Support

### For Users
- **Website**: https://atlanticfrewaycard.com
- **Email**: support@atlanticfrewaycard.com
- **Live Chat**: Available 24/7 in dashboard
- **Help Center**: https://help.atlanticfrewaycard.com

### For Developers
- **GitHub Issues**: [Report bugs](https://github.com/Atlanticfreeways/Atlanticfrewaycad/issues)
- **API Docs**: [docs/API.md](docs/API.md)
- **Developer Portal**: (Coming soon)

---

**Built with ❤️ by the Atlantic Freeway Team**

*Last Updated: February 3, 2026*
