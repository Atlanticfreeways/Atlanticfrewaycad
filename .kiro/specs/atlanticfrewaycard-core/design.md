# Design Document: Atlanticfrewaycard Core Infrastructure

## Overview

The Atlanticfrewaycard core infrastructure provides a scalable, resilient foundation for real-time transaction processing and JIT funding decisions. The system uses a multi-database approach (PostgreSQL for business data, MongoDB for personal data, Redis for caching) with asynchronous event processing via RabbitMQ. The architecture prioritizes sub-100ms authorization decisions while maintaining data consistency and reliability.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (Express.js)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes: /api/transactions, /api/cards, /api/health       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ JIT Funding      │  │ Transaction      │  │ Card         │  │
│  │ Service          │  │ Service          │  │ Service      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Adapter Layer                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ PostgreSQL       │  │ MongoDB          │  │ Redis        │  │
│  │ Adapter          │  │ Adapter          │  │ Adapter      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ PostgreSQL       │  │ MongoDB          │  │ Redis        │  │
│  │ (Business Data)  │  │ (Personal Data)  │  │ (Cache)      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Message Queue Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ RabbitMQ: Transaction Events, Webhooks, Async Tasks     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow for Transaction Authorization

```
Client Request
    ↓
API Route Handler
    ↓
JIT Funding Service
    ├─→ Cache Lookup (User, Card, Limits) [<5ms]
    ├─→ Database Lookup (if cache miss) [<50ms]
    ├─→ Authorization Decision Logic [<5ms]
    └─→ Publish to Message Queue [<10ms]
    ↓
Response to Client (<100ms total)
    ↓
Message Queue Consumer (Async)
    ├─→ Update Spending Counters
    ├─→ Call Marqeta API
    └─→ Publish Webhook Event
```

## Components and Interfaces

### 1. Database Adapter Layer

#### PostgreSQL Adapter
```javascript
class PostgreSQLAdapter {
  constructor(config)
  async executeQuery(query, params, options)
  async beginTransaction()
  async commit()
  async rollback()
  async close()
  getPoolStats()
}
```

**Responsibilities:**
- Manage connection pool (min: 5, max: 20)
- Execute queries with timeout (30s)
- Support transactions with rollback
- Log slow queries (>100ms)
- Track pool statistics

#### MongoDB Adapter
```javascript
class MongoDBAdapter {
  constructor(config)
  async find(collection, query, options)
  async insertOne(collection, document)
  async updateOne(collection, query, update)
  async deleteOne(collection, query)
  async aggregate(collection, pipeline)
  async createIndex(collection, index)
  async close()
  getPoolStats()
}
```

**Responsibilities:**
- Manage connection pool (min: 2, max: 10)
- Support CRUD operations
- Support aggregation pipelines
- Create and manage indexes
- Handle reconnection logic

#### Redis Adapter
```javascript
class RedisAdapter {
  constructor(config)
  async get(key)
  async set(key, value, ttl)
  async del(key)
  async invalidatePattern(pattern)
  async incr(key)
  async expire(key, ttl)
  async close()
}
```

**Responsibilities:**
- Manage Redis connection
- Support multi-level caching strategies
- Handle TTL-based expiration
- Support atomic operations
- Implement cache invalidation

### 2. Message Queue Manager

```javascript
class MessageQueueManager {
  constructor(config)
  async connect()
  async publishMessage(exchange, routingKey, message)
  async consumeMessage(queue, callback)
  async setupQueues()
  async close()
}
```

**Responsibilities:**
- Manage RabbitMQ connection
- Publish messages with persistence
- Consume messages with acknowledgment
- Implement retry logic (3 retries)
- Handle dead letter queues

### 3. JIT Funding Service

```javascript
class JITFundingService {
  async authorizeTransaction(transaction)
  async checkBalance(userId, amount)
  async checkSpendingLimits(cardId, amount)
  async checkMerchantRestrictions(cardId, merchant)
  async updateSpendingCounters(cardId, amount)
  async publishAuthorizationEvent(transaction, decision)
}
```

**Responsibilities:**
- Make authorization decisions in <100ms
- Check user balance, spending limits, merchant restrictions
- Update spending counters atomically
- Publish events to message queue
- Handle cache lookups and database queries

### 4. Health Check Service

```javascript
class HealthCheckService {
  async checkDatabase()
  async checkRedis()
  async checkRabbitMQ()
  async checkMarqetaAPI()
  async getSystemHealth()
  async getReadinessStatus()
}
```

**Responsibilities:**
- Check all service dependencies
- Return health status with details
- Implement timeout handling
- Provide readiness checks

### 5. Marqeta Integration Service

```javascript
class MarqetaService {
  constructor(config)
  async issueCard(userData)
  async processTransaction(transaction)
  async validateWebhook(payload, signature)
  async handleWebhookEvent(event)
  async retryFailedOperation(operation)
}
```

**Responsibilities:**
- Call Marqeta API for card issuance
- Process transactions through Marqeta
- Validate webhook signatures
- Handle API errors with retry logic
- Publish webhook events to message queue

## Data Models

### PostgreSQL Schema (Business Data)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards Table
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  card_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  daily_limit DECIMAL(10, 2),
  monthly_limit DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  merchant VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spending Controls Table
CREATE TABLE spending_controls (
  id UUID PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id),
  daily_spent DECIMAL(10, 2) DEFAULT 0,
  monthly_spent DECIMAL(10, 2) DEFAULT 0,
  last_reset_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Schema (Personal Data)

```javascript
// Personal Users Collection
db.personal_users.insertOne({
  _id: ObjectId(),
  email: "user@example.com",
  kyc_status: "verified",
  crypto_wallet: "0x...",
  created_at: ISODate(),
  updated_at: ISODate()
});

// Personal Cards Collection
db.personal_cards.insertOne({
  _id: ObjectId(),
  user_id: ObjectId(),
  card_token: "token_...",
  status: "active",
  balance: 1000.00,
  created_at: ISODate(),
  updated_at: ISODate()
});

// Personal Transactions Collection
db.personal_transactions.insertOne({
  _id: ObjectId(),
  card_id: ObjectId(),
  user_id: ObjectId(),
  amount: 50.00,
  merchant: "merchant_name",
  status: "completed",
  created_at: ISODate(),
  updated_at: ISODate()
});
```

### Redis Cache Keys

```
user:{userId} → User data (TTL: 3600s)
card:{cardId} → Card data (TTL: 900s)
limits:{cardId} → Spending limits (TTL: 300s)
balance:{userId} → User balance (TTL: 600s)
session:{sessionId} → Session data (TTL: 86400s)
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Connection Pool Bounds
*For any* database adapter under concurrent load, the number of active connections SHALL remain within configured bounds (PostgreSQL: 5-20, MongoDB: 2-10, Redis: 1).

**Validates: Requirements 1.1, 2.1, 3.1**

### Property 2: Query Performance Consistency
*For any* database query, execution time SHALL remain <50ms average (95th percentile <100ms) regardless of data volume or concurrent load.

**Validates: Requirements 2.2, 3.2**

### Property 3: Automatic Retry Success
*For any* failed database operation, the system SHALL retry with exponential backoff and eventually succeed or fail gracefully after max retries.

**Validates: Requirements 1.3, 2.3, 3.3**

### Property 4: Cache Invalidation Consistency
*For any* data update in the database, the corresponding cache entry SHALL be invalidated within 100ms to prevent stale reads.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Message Queue Delivery Guarantee
*For any* published message, the system SHALL guarantee delivery to at least one consumer or move to dead letter queue after max retries.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 6: Authorization Decision Latency
*For any* transaction authorization request, the system SHALL make a decision and return response in <100ms (target: <50ms).

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 7: Spending Limit Enforcement
*For any* transaction, if the transaction amount plus current spending exceeds the daily/monthly limit, the system SHALL deny the transaction.

**Validates: Requirements 6.3, 12.3**

### Property 8: Marqeta API Resilience
*For any* Marqeta API call that fails, the system SHALL retry with exponential backoff and eventually succeed or fail gracefully.

**Validates: Requirements 7.3**

### Property 9: Health Check Accuracy
*For any* service dependency, the health check SHALL accurately report its status (healthy/unhealthy) within 2 seconds.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 10: Graceful Shutdown Completion
*For any* in-flight operation during shutdown, the system SHALL complete it or mark it for retry within 30 seconds.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 11: Concurrent Request Consistency
*For any* concurrent updates to the same record, the system SHALL maintain data consistency and prevent race conditions.

**Validates: Requirements 12.3, 12.4**

### Property 12: Error Logging Completeness
*For any* error that occurs, the system SHALL log it with full context (stack trace, request data, user ID) without leaking sensitive information.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

## Error Handling

### Database Errors
- **Connection Failed**: Retry with exponential backoff (100ms, 200ms, 400ms), then fail gracefully
- **Query Timeout**: Cancel query, log warning, return timeout error to client
- **Transaction Rollback**: Log error, release locks, return error to client
- **Pool Exhausted**: Queue request, process when connection available

### Message Queue Errors
- **Publish Failed**: Retry with exponential backoff, log error, fail gracefully
- **Consume Failed**: Retry up to 3 times, send to dead letter queue if all fail
- **Connection Lost**: Reconnect automatically, resume processing

### Authorization Errors
- **Cache Miss**: Fall back to database query
- **Database Unavailable**: Deny transaction with "system_error" reason
- **Timeout**: Deny transaction with "timeout" reason

### API Errors
- **Validation Error**: Return 400 Bad Request with field errors
- **Rate Limit**: Return 429 Too Many Requests with retry-after header
- **Server Error**: Return 500 Internal Server Error, log full context

## Testing Strategy

### Unit Testing
- Test each adapter method with mock data
- Test authorization logic for each rule
- Test error handling for each error type
- Test cache operations and TTL expiration
- Test message queue operations

### Integration Testing
- Test connection pooling under concurrent load
- Test end-to-end authorization flow
- Test cache invalidation on data updates
- Test message queue retry logic
- Test health checks with services up/down
- Test graceful shutdown

### Property-Based Testing
- Verify connection pool bounds under random load
- Verify query performance remains consistent
- Verify cache consistency with database
- Verify message delivery guarantees
- Verify authorization decisions are consistent
- Verify spending limits are enforced
- Verify concurrent updates maintain consistency

### Performance Testing
- Load test with 1000 concurrent requests
- Measure authorization latency (target: <100ms)
- Measure cache hit rate (target: >80%)
- Measure query performance (target: <50ms)
- Measure message queue latency (target: <10ms)

### Security Testing
- Test error messages don't leak sensitive information
- Test webhook signature validation
- Test rate limiting effectiveness
- Test input validation for all endpoints

## Deployment Considerations

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/atlanticfrewaycard
MONGODB_URI=mongodb://localhost:27017/atlanticfrewaycard
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
MARQETA_BASE_URL=https://sandbox.marqeta.com/v3
MARQETA_APP_TOKEN=token_...
MARQETA_ADMIN_TOKEN=token_...
NODE_ENV=production
LOG_LEVEL=info
```

### Docker Compose Services
- PostgreSQL 15 with persistent volume
- MongoDB 6 with persistent volume
- Redis 7 with persistent volume
- RabbitMQ 3.12 with management UI
- Node.js application with health checks

### Kubernetes Deployment
- 3 replicas of Node.js application
- Horizontal Pod Autoscaler (3-10 replicas)
- Service with load balancing
- ConfigMaps for environment variables
- Secrets for API tokens

