# Atlanticfrewaycard Technical Architecture

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Web     │    │  Employee Web   │    │   Mobile App    │
│   Dashboard     │    │    Portal       │    │   (iOS/Android) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │  (Rate Limiting,│
                    │   Auth, Logging)│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Application    │
                    │    Server       │
                    │ (Node.js/Python)│
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   File Storage  │
│   Database      │    │   (Sessions,    │    │   (Receipts,    │
│                 │    │    Temp Data)   │    │   Documents)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Marqeta API   │
                    │   Integration   │
                    └─────────────────┘
```

## Core Components

### 1. API Gateway Layer
- **Purpose**: Single entry point for all client requests
- **Features**: Authentication, rate limiting, request/response logging
- **Technology**: AWS API Gateway or Kong
- **Security**: JWT token validation, IP whitelisting

### 2. Application Server
- **Purpose**: Business logic and API orchestration
- **Architecture**: Microservices or modular monolith
- **Key Services**:
  - User Management Service
  - Card Management Service
  - Transaction Processing Service
  - Notification Service
  - Reporting Service

### 3. Database Layer
- **Primary DB**: PostgreSQL for transactional data
- **Cache**: Redis for session management and temporary data
- **File Storage**: AWS S3 for receipts and documents
- **Backup**: Automated daily backups with point-in-time recovery

### 4. External Integrations
- **Marqeta Core API**: Card issuance and transaction processing
- **Webhook Endpoints**: Real-time transaction notifications
- **Email/SMS**: Notification services (SendGrid, Twilio)
- **Accounting Systems**: QuickBooks, Xero integration APIs

## Data Models

### User Management
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    marqeta_user_token VARCHAR(255) UNIQUE,
    company_id UUID REFERENCES companies(id),
    role VARCHAR(50) DEFAULT 'employee',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    marqeta_business_token VARCHAR(255),
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Card Management
```sql
-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    marqeta_card_token VARCHAR(255) UNIQUE,
    card_product_token VARCHAR(255),
    card_type VARCHAR(20), -- 'virtual' or 'physical'
    status VARCHAR(20) DEFAULT 'active',
    spending_limits JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Card products table
CREATE TABLE card_products (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    marqeta_product_token VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Transaction Management
```sql
-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    marqeta_transaction_token VARCHAR(255) UNIQUE,
    card_id UUID REFERENCES cards(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    status VARCHAR(20),
    authorization_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spending controls table
CREATE TABLE spending_controls (
    id UUID PRIMARY KEY,
    card_id UUID REFERENCES cards(id),
    control_type VARCHAR(50), -- 'daily_limit', 'merchant_restriction', etc.
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Design

### Authentication & User Management
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/register
```

### Card Management
```
GET    /api/cards                    # List user's cards
POST   /api/cards                    # Issue new card
GET    /api/cards/{id}               # Get card details
PUT    /api/cards/{id}/controls      # Update spending controls
POST   /api/cards/{id}/activate      # Activate card
POST   /api/cards/{id}/freeze        # Freeze/unfreeze card
```

### Transaction Management
```
GET    /api/transactions             # List transactions
GET    /api/transactions/{id}        # Get transaction details
POST   /api/transactions/{id}/dispute # Dispute transaction
GET    /api/reports/spending         # Spending reports
```

### Webhook Endpoints
```
POST   /webhooks/marqeta/auth        # JIT funding authorization
POST   /webhooks/marqeta/transaction # Transaction notifications
POST   /webhooks/marqeta/card        # Card status updates
```

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with refresh tokens
- **Role-Based Access**: Admin, Manager, Employee roles
- **API Key Management**: Secure storage of Marqeta API credentials
- **Session Management**: Redis-based session storage

### Data Protection
- **Encryption at Rest**: AES-256 encryption for sensitive data
- **Encryption in Transit**: TLS 1.3 for all API communications
- **PII Handling**: Tokenization of sensitive user data
- **Audit Logging**: Comprehensive audit trail for all operations

### Compliance Requirements
- **PCI DSS**: Card data handling compliance
- **SOC 2**: Security and availability controls
- **GDPR**: Data privacy and user rights
- **Financial Regulations**: AML/KYC compliance

## Deployment Architecture

### Development Environment
- **Local Development**: Docker Compose setup
- **Staging**: Kubernetes cluster with reduced resources
- **Testing**: Automated CI/CD pipeline with test suites

### Production Environment
```
┌─────────────────┐
│   Load Balancer │
│   (AWS ALB)     │
└─────────────────┘
         │
┌─────────────────┐
│  Auto Scaling   │
│  Group (3+ AZs) │
└─────────────────┘
         │
┌─────────────────┐
│   ECS/EKS       │
│   Containers    │
└─────────────────┘
         │
┌─────────────────┐
│   RDS Multi-AZ  │
│   PostgreSQL    │
└─────────────────┘
```

### Monitoring & Observability
- **Application Monitoring**: DataDog or New Relic
- **Infrastructure Monitoring**: CloudWatch
- **Log Aggregation**: ELK Stack or CloudWatch Logs
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom or StatusCake

## Performance Considerations

### Scalability Targets
- **Response Time**: < 200ms for API calls
- **Throughput**: 1000+ requests/second
- **Availability**: 99.9% uptime SLA
- **Concurrent Users**: 10,000+ active sessions

### Optimization Strategies
- **Database Indexing**: Optimized queries for transaction lookups
- **Caching**: Redis for frequently accessed data
- **CDN**: CloudFront for static assets
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Queue-based processing for non-critical operations

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **File Storage**: Cross-region replication for S3
- **Configuration**: Infrastructure as Code (Terraform)
- **Secrets**: AWS Secrets Manager with rotation

### Recovery Procedures
- **RTO**: 4 hours maximum recovery time
- **RPO**: 1 hour maximum data loss
- **Failover**: Automated failover to secondary region
- **Testing**: Quarterly disaster recovery drills