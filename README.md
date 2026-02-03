# Atlantic Freeway Card Platform 🏛️

**Enterprise-Grade Virtual Card Issuance Platform**

[![CI/CD](https://github.com/Atlanticfreeways/Atlanticfrewaycad/workflows/Production%20CI/CD/badge.svg)](https://github.com/Atlanticfreeways/Atlanticfrewaycad/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Go](https://img.shields.io/badge/go-1.21-blue)](https://golang.org)

---

## 🚀 Overview

Atlantic Freeway Card is a production-ready fintech platform that enables virtual and physical card issuance with real-time Just-in-Time (JIT) funding, multi-currency support, and enterprise-grade security.

### Key Features

- **🎴 Card Issuance**: Virtual & physical cards via Marqeta API
- **⚡ JIT Funding**: Sub-100ms authorization decisions with Go microservice
- **🌍 Multi-Currency**: 150+ currencies with real-time conversion
- **🔐 KYC Tiers**: 4-tier system (Basic → Turbo → Business)
- **📊 Admin Tools**: Reconciliation, Banking Simulator, JIT Visualizer
- **🏢 Enterprise**: Bulk issuance, RBAC, GPR accounts

---

## 📋 Project Status

**Development**: ✅ Complete  
**Infrastructure**: ✅ Code Complete (awaiting AWS provisioning)  
**Production**: 🟡 Pre-Production

See [TASK_LIST.md](TASK_LIST.md) for detailed progress.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js UI    │
│  (Dashboard)    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Node.js  │◄──────┐
    │   API    │       │
    └────┬─────┘       │
         │             │
    ┌────▼─────┐  ┌───▼────┐
    │   Go     │  │ Redis  │
    │ JIT Svc  │  │ Cache  │
    └────┬─────┘  └────────┘
         │
    ┌────▼─────────────────┐
    │   PostgreSQL DB      │
    │   (Multi-AZ)         │
    └──────────────────────┘
```

**Tech Stack**:
- **Frontend**: Next.js 14, React, Tailwind CSS, Socket.io
- **Backend**: Node.js (Express), Go (JIT Service)
- **Database**: PostgreSQL 15 (RDS Multi-AZ)
- **Cache**: Redis 7 (ElastiCache)
- **Queue**: RabbitMQ (Amazon MQ)
- **Infrastructure**: Kubernetes (EKS), Terraform

---

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/Atlanticfreeways/Atlanticfrewaycad.git
cd Atlanticfrewaycad

# Install dependencies
npm install

# Start services with Docker Compose
docker-compose up -d

# Run migrations
npm run migrate:all

# Start development server
npm run dev
```

**Access**:
- API: http://localhost:3000
- Frontend: http://localhost:5173
- RabbitMQ Management: http://localhost:15672

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `MARQETA_APP_TOKEN` - Marqeta API credentials
- `JWT_SECRET` - JWT signing secret

---

## 📦 Production Deployment

See [infrastructure/README.md](infrastructure/README.md) for complete deployment guide.

**Quick Deploy**:

```bash
# 1. Provision AWS infrastructure
cd infrastructure/terraform
terraform init
terraform apply

# 2. Configure kubectl
aws eks update-kubeconfig --name atlanticfrewaycard-cluster

# 3. Deploy application
kubectl apply -f ../kubernetes/
```

**Estimated Cost**: ~$1,400/month (AWS)

---

## 📚 Documentation

- [Enterprise Readiness Gap Analysis](docs/ENTERPRISE_READINESS_GAP_ANALYSIS.md) - Production checklist
- [Marqeta API Assessment](docs/MARQETA_ASSESSMENT.md) - Integration details
- [Infrastructure Guide](infrastructure/README.md) - Deployment instructions
- [Task List](TASK_LIST.md) - Development progress

---

## 🔐 Security

- **Authentication**: JWT with Redis session caching
- **Authorization**: RBAC with 5 roles
- **Encryption**: TLS everywhere, KMS for data at rest
- **Secrets**: AWS Secrets Manager (no `.env` in production)
- **Compliance**: PCI-DSS ready, GDPR-compliant architecture

**Security Audits**: See [.github/workflows/production-cicd.yml](.github/workflows/production-cicd.yml)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm run test:jit
```

**Test Coverage**: 75%+ (target: 90%)

---

## 📊 Monitoring

**Metrics**:
- JIT Authorization Latency (p99 < 100ms)
- API Response Time (p95 < 200ms)
- Database Connection Pool Saturation
- Redis Cache Hit Rate (>70%)

**Observability Stack**:
- Prometheus + Grafana
- CloudWatch Logs
- VPC Flow Logs
- RDS Performance Insights

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Standards**:
- ESLint + Prettier
- Conventional Commits
- 100% test coverage for critical paths

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Marqeta** - Card issuing platform
- **Stripe** - Payment processing
- **Paystack** - African payment gateway
- **OpenExchangeRates** - Currency conversion

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Atlanticfreeways/Atlanticfrewaycad/issues)
- **Email**: support@atlanticfrewaycard.com
- **Docs**: [docs/](docs/)

---

**Built with ❤️ by the Atlantic Freeway Team**

*Last Updated: February 3, 2026*
