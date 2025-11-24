# Week 1 Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Requests                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Nginx Load Balancer   │
                    │  (Reverse Proxy)        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Node.js Express App   │
                    │   (Port 3000)           │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL      │  │  MongoDB         │  │  Redis           │
│  (Business Data) │  │  (Personal Data) │  │  (Cache)         │
│  Port: 5432      │  │  Port: 27017     │  │  Port: 6379      │
│                  │  │                  │  │                  │
│ • Users          │  │ • Personal Users │  │ • User Sessions  │
│ • Companies      │  │ • Personal Cards │  │ • Card Data      │
│ • Cards          │  │ • Transactions   │  │ • Spending Limits│
│ • Transactions   │  │ • Wallets        │  │ • Counters       │
│ • Spending Ctrl  │  │ • KYC Data       │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   RabbitMQ Message      │
                    │   Queue (Port 5672)     │
                    │   Management: 15672     │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ JIT Funding      │  │ Transaction      │  │ Webhook          │
│ Queue            │  │ Processing Queue │  │ Queue            │
│                  │  │                  │  │                  │
│ • Authorizations │  │ • Processing     │  │ • Marqeta Events │
│ • Decisions      │  │ • Logging        │  │ • Async Handling │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Dead Letter Queue     │
                    │   (Failed Messages)     │
                    └────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request Processing Flow                       │
└─────────────────────────────────────────────────────────────────┘

1. CLIENT REQUEST
   │
   ├─► Nginx Load Balancer
   │   └─► Route to Node.js App
   │
2. REQUEST HANDLING
   │
   ├─► Check Redis Cache
   │   ├─► Cache Hit ──► Return Response
   │   └─► Cache Miss ──► Continue
   │
3. DATABASE QUERY
   │
   ├─► PostgreSQL Connection Pool
   │   └─► Execute Query
   │
4. RESPONSE PROCESSING
   │
   ├─► Cache Result in Redis
   ├─► Publish Event to Message Queue
   └─► Return Response to Client

┌─────────────────────────────────────────────────────────────────┐
│                    JIT Funding Flow                              │
└─────────────────────────────────────────────────────────────────┘

1. TRANSACTION REQUEST
   │
   ├─► Publish to jit-funding-queue
   │
2. MESSAGE QUEUE PROCESSING
   │
   ├─► Consumer receives message
   │
3. PROFILING & DECISION
   │
   ├─► Stage 1: User Lookup (Redis Cache)
   ├─► Stage 2: Card Lookup (Redis Cache)
   ├─► Stage 3: Spending Limits (Redis Cache)
   ├─► Stage 4: Decision Logic
   │
4. RESPONSE
   │
   ├─► Publish decision to response queue
   ├─► Log metrics to profiler
   └─► Alert if >100ms
```

## Connection Pooling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Connection Pool                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Min Connections: 5    Max Connections: 20                      │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Conn 1   │  │ Conn 2   │  │ Conn 3   │  │ Conn 4   │        │
│  │ Active   │  │ Idle     │  │ Idle     │  │ Idle     │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  Idle Timeout: 30 seconds                                       │
│  Connection Timeout: 5 seconds                                  │
│  Query Timeout: 30 seconds                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Connection Pool                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Min Connections: 2    Max Connections: 10                      │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Conn 1   │  │ Conn 2   │  │ Conn 3   │                       │
│  │ Active   │  │ Idle     │  │ Idle     │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                   │
│  Idle Timeout: 30 seconds                                       │
│  Server Selection Timeout: 5 seconds                            │
│  Socket Timeout: 45 seconds                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Redis Connection                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Single Connection with Automatic Reconnection                  │
│                                                                   │
│  Reconnect Strategy: Exponential Backoff                        │
│  Max Retry Delay: 500ms                                         │
│  Connection Timeout: 5 seconds                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Level Caching                           │
└─────────────────────────────────────────────────────────────────┘

Level 1: Application Memory (Optional)
├─► Fast access (<1ms)
├─► Limited size
└─► Used for frequently accessed data

Level 2: Redis Cache
├─► Medium access (<5ms)
├─► Distributed across instances
├─► TTL-based expiration
└─► Strategies:
    ├─► User Data: 1 hour
    ├─► Card Data: 15 minutes
    ├─► Spending Limits: 5 minutes
    ├─► Transactions: 5 minutes
    └─► Sessions: 24 hours

Level 3: Database
├─► Slow access (50-100ms)
├─► Source of truth
└─► Persistent storage

Cache Invalidation:
├─► TTL expiration (automatic)
├─► Manual invalidation on update
└─► Cascade invalidation for related data
```

## Message Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RabbitMQ Message Flow                         │
└─────────────────────────────────────────────────────────────────┘

Exchanges (Topic-based):
├─► transactions (topic exchange)
│   └─► Routing Keys:
│       ├─► jit-funding.created
│       ├─► transaction.created
│       ├─► transaction.webhook
│       └─► *.failed (for DLQ)
│
└─► events (topic exchange)
    └─► Routing Keys:
        ├─► card.issued
        ├─► user.created
        └─► *.error

Queues:
├─► jit-funding-queue
│   ├─► Durable: Yes
│   ├─► Dead Letter Exchange: transactions
│   ├─► Dead Letter Routing Key: jit-funding.failed
│   └─► Consumers: 1+ (scalable)
│
├─► transaction-processing-queue
│   ├─► Durable: Yes
│   ├─► Dead Letter Exchange: transactions
│   ├─► Dead Letter Routing Key: transaction.failed
│   └─► Consumers: 1+ (scalable)
│
├─► webhook-queue
│   ├─► Durable: Yes
│   ├─► Dead Letter Exchange: transactions
│   ├─► Dead Letter Routing Key: webhook.failed
│   └─► Consumers: 1+ (scalable)
│
└─► jit-funding-dlq (Dead Letter Queue)
    ├─► Durable: Yes
    ├─► Manual processing required
    └─► Monitoring & alerting

Message Flow:
1. Publisher sends message to exchange
2. Exchange routes to queue based on routing key
3. Consumer receives message
4. Consumer processes message
5. Consumer acknowledges (ACK) or rejects (NACK)
6. On NACK: Retry up to 3 times
7. After 3 retries: Send to DLQ
```

## JIT Funding Profiling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JIT Funding Profiler                          │
└─────────────────────────────────────────────────────────────────┘

Input: Transaction Request
│
├─► Stage 1: User Lookup
│   ├─► Check Redis Cache
│   ├─► If miss: Query PostgreSQL
│   ├─► Cache result
│   └─► Duration: <10ms target
│
├─► Stage 2: Card Lookup
│   ├─► Check Redis Cache
│   ├─► If miss: Query PostgreSQL
│   ├─► Cache result
│   └─► Duration: <10ms target
│
├─► Stage 3: Spending Limits Check
│   ├─► Check Redis Cache
│   ├─► If miss: Query PostgreSQL
│   ├─► Cache result
│   └─► Duration: <10ms target
│
├─► Stage 4: Decision Logic
│   ├─► Validate card status
│   ├─► Validate user status
│   ├─► Check daily limit
│   ├─► Check transaction limit
│   ├─► Check available balance
│   └─► Duration: <5ms target
│
Output: Authorization Decision
│
├─► Metrics Collected:
│   ├─► Total Duration
│   ├─► Stage Durations
│   ├─► Approval Status
│   ├─► Rejection Reason
│   └─► Timestamp
│
├─► Metrics Aggregation:
│   ├─► Count
│   ├─► Average
│   ├─► Min/Max
│   ├─► Percentiles (p50, p95, p99)
│   └─► Approval Rate
│
└─► Alerting:
    ├─► Warning: >50ms
    ├─► Critical: >100ms
    └─► Logging & Monitoring
```

## Health Check Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Health Check System                           │
└─────────────────────────────────────────────────────────────────┘

Endpoints:
├─► GET /health
│   ├─► Check PostgreSQL pool
│   ├─► Check MongoDB connection
│   ├─► Check Redis connection
│   ├─► Check RabbitMQ connection
│   └─► Return overall status
│
└─► GET /ready
    ├─► Same checks as /health
    └─► Used by Kubernetes for readiness probes

Service Health Checks:
├─► PostgreSQL
│   └─► Pool statistics (total, idle, waiting)
│
├─► MongoDB
│   └─► Connection statistics
│
├─► Redis
│   └─► Info stats command
│
└─► RabbitMQ
    └─► Queue statistics

Response Format:
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "postgres": "healthy",
    "mongodb": "healthy",
    "redis": "healthy",
    "messageQueue": "healthy"
  }
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                          │
└─────────────────────────────────────────────────────────────────┘

Services:
├─► app (Node.js)
│   ├─► Port: 3000
│   ├─► Health Check: /health
│   └─► Depends on: postgres, mongodb, redis, rabbitmq
│
├─► postgres
│   ├─► Port: 5432
│   ├─► Image: postgres:15-alpine
│   └─► Volume: postgres_data
│
├─► mongodb
│   ├─► Port: 27017
│   ├─► Image: mongo:6-alpine
│   └─► Volume: mongodb_data
│
├─► redis
│   ├─► Port: 6379
│   ├─► Image: redis:7-alpine
│   └─► Volume: redis_data
│
├─► rabbitmq
│   ├─► Port: 5672 (AMQP)
│   ├─► Port: 15672 (Management UI)
│   ├─► Image: rabbitmq:3.12-management-alpine
│   └─► Volume: rabbitmq_data
│
└─► nginx
    ├─► Port: 80 (HTTP)
    ├─► Port: 443 (HTTPS)
    ├─► Image: nginx:alpine
    └─► Config: nginx.conf

Volumes:
├─► postgres_data
├─► mongodb_data
├─► redis_data
└─► rabbitmq_data
```

## Performance Targets

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Targets                           │
└─────────────────────────────────────────────────────────────────┘

Database Performance:
├─► PostgreSQL Query: <50ms average
├─► MongoDB Query: <50ms average
└─► Connection Pool Utilization: 60-80%

Caching Performance:
├─► Cache Hit Rate: >80%
├─► Cache Lookup: <5ms
└─► Redis Memory: <500MB

Message Queue Performance:
├─► Publish Latency: <10ms
├─► Consume Latency: <50ms
└─► Queue Depth: <1000 messages

JIT Funding Performance:
├─► Total Authorization: <100ms
├─► User Lookup: <10ms
├─► Card Lookup: <10ms
├─► Limits Check: <10ms
└─► Decision Logic: <5ms

API Performance:
├─► Response Time (p95): <200ms
├─► Response Time (p99): <500ms
└─► Throughput: 1000+ req/sec
```

This architecture provides a solid foundation for scalable, performant, and reliable transaction processing with proper caching, message queuing, and monitoring.
