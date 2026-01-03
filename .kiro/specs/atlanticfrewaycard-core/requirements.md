# Requirements Document: Atlanticfrewaycard Core Infrastructure

## Introduction

Atlanticfrewaycard is a unified card platform combining business expense management (SpendCtrl) with personal crypto-funded cards (Freeway Cards). This specification covers the core infrastructure layer that enables real-time transaction processing, JIT (Just-In-Time) funding decisions, and multi-database support. The system must handle sub-100ms authorization decisions while maintaining data consistency across PostgreSQL (business), MongoDB (personal), and Redis (cache) layers.

## Glossary

- **JIT Funding**: Just-In-Time funding mechanism that authorizes transactions in real-time (<100ms) based on user limits and account status
- **Adapter Pattern**: Database abstraction layer that provides unified interface for PostgreSQL, MongoDB, and Redis operations
- **Connection Pooling**: Reusable database connection management to optimize performance and resource usage
- **Message Queue**: Asynchronous event processing system (RabbitMQ) for decoupling transaction processing from authorization
- **Marqeta API**: Third-party card issuance and transaction processing platform
- **Spending Control**: Rules engine that enforces merchant restrictions, daily limits, and transaction categories
- **KYC**: Know Your Customer verification process for personal card users
- **Webhook**: HTTP callback from Marqeta for transaction events and card status updates
- **Dead Letter Queue (DLQ)**: Queue for messages that fail processing after retries
- **Cache Invalidation**: Process of removing stale data from Redis cache to ensure consistency

## Requirements

### Requirement 1: Database Adapter Layer

**User Story:** As a backend developer, I want a unified database adapter interface, so that I can switch between PostgreSQL, MongoDB, and Redis without changing application code.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL establish connection pools for PostgreSQL (min: 5, max: 20 connections), MongoDB (min: 2, max: 10), and Redis with automatic retry logic
2. WHEN a database query exceeds 100ms THEN the system SHALL log a slow query warning with query details and execution time
3. WHEN a database connection fails THEN the system SHALL automatically retry with exponential backoff (max 3 retries) and gracefully degrade if all retries fail
4. WHEN the application shuts down THEN the system SHALL close all database connections gracefully and flush pending operations
5. IF a connection pool reaches maximum capacity THEN the system SHALL queue requests and process them as connections become available

#### Testing Strategy

- **Unit Tests**: Test individual adapter methods (query, insert, update, delete) with mock data
- **Integration Tests**: Test connection pooling behavior, retry logic, and error handling with real database services
- **Property Tests**: Verify that connection pool size remains within configured bounds under concurrent load

---

### Requirement 2: PostgreSQL Adapter with Connection Pooling

**User Story:** As a business module developer, I want a PostgreSQL adapter with optimized connection pooling, so that I can efficiently manage business data (companies, employees, cards, transactions) with sub-50ms query times.

#### Acceptance Criteria

1. WHEN executing a query THEN the system SHALL return results in <50ms average (95th percentile <100ms)
2. WHEN a query times out after 30 seconds THEN the system SHALL cancel the query and return a timeout error
3. WHEN idle connections exist for >30 seconds THEN the system SHALL close them to free resources
4. WHEN a transaction is initiated THEN the system SHALL support rollback on error and maintain ACID compliance
5. WHEN multiple queries execute concurrently THEN the system SHALL maintain connection pool efficiency at 60-80% utilization

#### Testing Strategy

- **Unit Tests**: Test query execution, parameter binding, and result mapping
- **Integration Tests**: Test connection pooling under concurrent load, transaction rollback, and timeout handling
- **Property Tests**: Verify query results are consistent regardless of execution order; verify connection pool maintains bounds

---

### Requirement 3: MongoDB Adapter with Connection Pooling

**User Story:** As a personal module developer, I want a MongoDB adapter with connection pooling, so that I can efficiently manage personal user data (cards, wallets, transactions) with flexible schema support.

#### Acceptance Criteria

1. WHEN executing a query THEN the system SHALL return results in <50ms average (95th percentile <100ms)
2. WHEN a connection fails THEN the system SHALL automatically reconnect with exponential backoff (max 3 retries)
3. WHEN creating indexes THEN the system SHALL support compound indexes and partial indexes for query optimization
4. WHEN aggregating data THEN the system SHALL support MongoDB aggregation pipeline operations
5. WHEN a document is updated THEN the system SHALL support atomic operations and return updated document state

#### Testing Strategy

- **Unit Tests**: Test CRUD operations, aggregation pipelines, and index creation
- **Integration Tests**: Test connection pooling, reconnection logic, and concurrent operations
- **Property Tests**: Verify CRUD operations maintain data consistency; verify aggregation results are correct

---

### Requirement 4: Redis Cache Layer with Multi-Level Caching

**User Story:** As a performance engineer, I want a Redis cache layer with intelligent TTL management, so that I can reduce database load and achieve <5ms cache lookups for frequently accessed data.

#### Acceptance Criteria

1. WHEN caching user data THEN the system SHALL set TTL to 3600 seconds and invalidate on user updates
2. WHEN caching card data THEN the system SHALL set TTL to 900 seconds and invalidate on card status changes
3. WHEN caching spending limits THEN the system SHALL set TTL to 300 seconds and refresh before expiration
4. WHEN a cache lookup occurs THEN the system SHALL return data in <5ms average
5. WHEN cache memory exceeds configured threshold THEN the system SHALL evict least-recently-used entries

#### Testing Strategy

- **Unit Tests**: Test cache set/get operations, TTL expiration, and eviction policies
- **Integration Tests**: Test cache invalidation on data updates, concurrent access, and memory management
- **Property Tests**: Verify cache hit rate >80% for repeated queries; verify cache consistency with database

---

### Requirement 5: Message Queue Infrastructure (RabbitMQ)

**User Story:** As a system architect, I want a message queue for asynchronous event processing, so that I can decouple transaction authorization from processing and handle high-volume events reliably.

#### Acceptance Criteria

1. WHEN a transaction event occurs THEN the system SHALL publish it to the message queue with <10ms latency
2. WHEN a message is consumed THEN the system SHALL process it and acknowledge only after successful completion
3. WHEN message processing fails THEN the system SHALL retry up to 3 times with exponential backoff before sending to dead letter queue
4. WHEN the message queue connection fails THEN the system SHALL automatically reconnect and resume processing
5. WHEN the application shuts down THEN the system SHALL gracefully close queue connections and preserve unprocessed messages

#### Testing Strategy

- **Unit Tests**: Test message publishing, consuming, and acknowledgment logic
- **Integration Tests**: Test retry logic, dead letter queue handling, and connection recovery
- **Property Tests**: Verify all published messages are eventually processed; verify no message loss on failures

---

### Requirement 6: JIT Funding Authorization Engine

**User Story:** As a transaction processor, I want a JIT funding engine that makes authorization decisions in <100ms, so that I can approve/deny transactions in real-time based on user limits and account status.

#### Acceptance Criteria

1. WHEN authorizing a transaction THEN the system SHALL make a decision in <100ms (target: <50ms)
2. WHEN a user has insufficient balance THEN the system SHALL deny the transaction with reason "insufficient_balance"
3. WHEN a transaction exceeds daily spending limit THEN the system SHALL deny the transaction with reason "limit_exceeded"
4. WHEN a merchant is restricted THEN the system SHALL deny the transaction with reason "merchant_restricted"
5. WHEN all checks pass THEN the system SHALL approve the transaction and update spending counters atomically

#### Testing Strategy

- **Unit Tests**: Test authorization logic for each rule (balance, limits, merchant restrictions)
- **Integration Tests**: Test end-to-end authorization with cache lookups and database updates
- **Property Tests**: Verify authorization decisions are consistent for identical inputs; verify spending counters never exceed limits

---

### Requirement 7: Marqeta API Integration

**User Story:** As a card operations engineer, I want to integrate with Marqeta API for card issuance and transaction processing, so that I can issue virtual cards and process real transactions through the Marqeta platform.

#### Acceptance Criteria

1. WHEN issuing a card THEN the system SHALL call Marqeta API and store the card token securely
2. WHEN a transaction webhook arrives from Marqeta THEN the system SHALL validate the signature and process the event asynchronously
3. WHEN Marqeta API returns an error THEN the system SHALL retry with exponential backoff (max 3 retries) and log the failure
4. WHEN a card is activated THEN the system SHALL update card status in database and notify the user
5. WHEN a transaction is declined by Marqeta THEN the system SHALL log the decline reason and update transaction status

#### Testing Strategy

- **Unit Tests**: Test API request formatting, response parsing, and error handling
- **Integration Tests**: Test webhook validation, async processing, and database updates
- **Property Tests**: Verify all API calls eventually succeed or fail gracefully; verify webhook signatures are validated

---

### Requirement 8: Health Check and Monitoring

**User Story:** As an operations engineer, I want comprehensive health checks for all system dependencies, so that I can monitor system status and detect failures early.

#### Acceptance Criteria

1. WHEN GET /health is called THEN the system SHALL return overall health status and individual service statuses within 2 seconds
2. WHEN a database is unavailable THEN the health check SHALL report it as unhealthy and include error details
3. WHEN Redis is unavailable THEN the health check SHALL report it as unhealthy but allow API to continue with degraded performance
4. WHEN RabbitMQ is unavailable THEN the health check SHALL report it as unhealthy and queue operations SHALL fail gracefully
5. WHEN GET /ready is called THEN the system SHALL return ready status only if all critical services are healthy

#### Testing Strategy

- **Unit Tests**: Test health check logic for each service
- **Integration Tests**: Test health checks with services up/down, and verify correct status reporting
- **Property Tests**: Verify health check response time <2 seconds; verify status accuracy matches actual service state

---

### Requirement 9: Error Handling and Resilience

**User Story:** As a reliability engineer, I want comprehensive error handling and resilience patterns, so that the system can recover from failures and provide meaningful error messages.

#### Acceptance Criteria

1. WHEN an unexpected error occurs THEN the system SHALL log it with full context (stack trace, request data, user ID) and return a generic error message to client
2. WHEN a database connection fails THEN the system SHALL retry with exponential backoff and fail gracefully if all retries exhausted
3. WHEN a timeout occurs THEN the system SHALL cancel the operation and return a timeout error with retry guidance
4. WHEN a validation error occurs THEN the system SHALL return a 400 Bad Request with specific field errors
5. WHEN a rate limit is exceeded THEN the system SHALL return 429 Too Many Requests with retry-after header

#### Testing Strategy

- **Unit Tests**: Test error handling for each error type (validation, timeout, connection, rate limit)
- **Integration Tests**: Test error propagation through layers and client response formatting
- **Property Tests**: Verify all errors are logged; verify error messages don't leak sensitive information

---

### Requirement 10: Database Indexes and Query Optimization

**User Story:** As a database administrator, I want optimized indexes on critical queries, so that I can maintain sub-50ms query times under production load.

#### Acceptance Criteria

1. WHEN querying transactions by user and date THEN the system SHALL use index on (user_id, created_at DESC) and complete in <50ms
2. WHEN querying active cards by user THEN the system SHALL use index on (user_id, status) and complete in <50ms
3. WHEN querying completed transactions THEN the system SHALL use partial index on (card_id, status) WHERE status='completed' and complete in <50ms
4. WHEN querying users by company and role THEN the system SHALL use index on (company_id, role) and complete in <50ms
5. WHEN indexes are created THEN the system SHALL use CONCURRENTLY option to avoid locking tables

#### Testing Strategy

- **Unit Tests**: Test query execution plans and index usage
- **Integration Tests**: Test query performance under load and verify indexes are used
- **Property Tests**: Verify query times remain <50ms as data volume increases

---

### Requirement 11: Graceful Shutdown and Resource Cleanup

**User Story:** As a DevOps engineer, I want graceful shutdown procedures, so that the system can cleanly close connections and complete in-flight operations before terminating.

#### Acceptance Criteria

1. WHEN SIGTERM signal is received THEN the system SHALL stop accepting new requests and complete existing ones within 30 seconds
2. WHEN shutting down THEN the system SHALL close database connections, flush message queues, and release resources
3. WHEN a shutdown timeout occurs THEN the system SHALL force close remaining connections and exit
4. WHEN restarting THEN the system SHALL verify database connectivity before accepting requests
5. WHEN in-flight transactions exist during shutdown THEN the system SHALL complete them or mark them for retry

#### Testing Strategy

- **Unit Tests**: Test shutdown signal handling and resource cleanup
- **Integration Tests**: Test graceful shutdown with active connections and in-flight operations
- **Property Tests**: Verify all resources are released on shutdown; verify no data loss

---

### Requirement 12: Concurrent Request Handling

**User Story:** As a performance engineer, I want the system to handle concurrent requests efficiently, so that I can support multiple simultaneous transactions without degradation.

#### Acceptance Criteria

1. WHEN 1000 concurrent requests arrive THEN the system SHALL process them with average latency <200ms and 95th percentile <500ms
2. WHEN connection pool is exhausted THEN the system SHALL queue requests and process them as connections become available
3. WHEN concurrent updates occur on same record THEN the system SHALL maintain data consistency using optimistic or pessimistic locking
4. WHEN cache contention occurs THEN the system SHALL use atomic operations to prevent race conditions
5. WHEN message queue is backlogged THEN the system SHALL continue accepting requests and queue them for processing

#### Testing Strategy

- **Unit Tests**: Test concurrent access patterns and locking mechanisms
- **Integration Tests**: Test system under concurrent load and verify performance targets
- **Property Tests**: Verify data consistency under concurrent updates; verify no deadlocks occur

