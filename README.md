# Atlanticfrewaycard Platform (V2)

**Unified card platform combining business expense management and personal virtual cards.**
*Enterprise-ready with Event-Driven Architecture and Microservices.*

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-94%25-brightgreen)
![Status](https://img.shields.io/badge/status-production--ready-blue)

# Platform Overview

Atlanticfrewaycard has evolved into a robust, scalable platform leveraging modern infrastructure:
- **Business Module**: Corporate expense management (SpendCtrl)
- **Personal Module**: Individual virtual cards with crypto funding (Freeway Cards)
- **JIT Funding Engine**: Real-time authorization processing (Go Microservice)

## Architecture Evolution

### Phase 1: Hybrid Monolith (Current Foundation)

```mermaid
graph TD
    Client[Web/Mobile Clients] --> LB[Nginx Load Balancer]
    LB --> NodeAPI[Node.js Monolith API]
    LB --> GoService[Go JIT Service]
    
    NodeAPI --> PG[(PostgreSQL)]
    NodeAPI --> Mongo[(MongoDB)]
    NodeAPI --> Redis[(Redis Cache)]
    
    NodeAPI --"Events"--> RabbitMQ{RabbitMQ}
    RabbitMQ --> GoService
    
    GoService --> Redis
    GoService --> PG
    GoService --> Marqeta[Marqeta API]
```

### Phase 2: The Fortress (Production-Ready Upgrade)

```mermaid
graph TD
    Client[Web/Mobile Clients] --> Nginx[Nginx Edge Gateway]
    Nginx --> WAF{ModSecurity WAF}
    WAF --> LB[Nginx Load Balancer]
    WAF --> LogLake[(Security Data Lake)]
    
    LB --> NodeAPI[Node.js Monolith API]
    LB --> GoService[Go JIT Service]
    
    GoService --> FraudML[ML Fraud Engine]
    FraudML --> Redis[(Redis Cache)]
    GoService --"Events"--> RabbitMQ{RabbitMQ}
    
    NodeAPI --> PG[(PostgreSQL)]
    NodeAPI --> Mongo[(MongoDB)]
    GoService --> Redis
    GoService --> PG
    
    GoService --> Marqeta[Marqeta API]
    RabbitMQ --> Notify[Notification Service]
    RabbitMQ --> BankLegacy[Legacy Banking Core]
```

**The Fortress Architecture** represents three "legs":
-  **Head**: Deep Security (Ingress Shield with WAF, mTLS, threat detection)
-  **Body**: Intelligent Decisioning (ML Fraud Engine, Real-time scoring)
-  **Legs**: Operational Scalability (Distributed data layer, event-driven async)

See [ARCHITECTURE_FORTRESS_BLUEPRINT.md](./ARCHITECTURE_FORTRESS_BLUEPRINT.md) for detailed implementation guide.

### Components
1. **Core API (Node.js)**: Handles business logic, user management, and dashboards.
2. **JIT Funding Service (Go)**: High-performance microservice for processing card authorizations in <100ms.
3. **Message Broker (RabbitMQ)**: Decouples transaction processing from user-facing APIs.
4. **Security**: PCI-compliant encryption (AES-256) and tiered caching.
5. **ML Fraud Engine**: Real-time transaction scoring with behavioral biometrics and velocity checks.

##  Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Go 1.21+ (for service dev)

### 🐳 Docker Deployment (Recommended)
The entire platform (App, Go Service, DBs) can be launched with a single command:


## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License
