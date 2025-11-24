# Week 1 Implementation Guide: Database, Caching & Message Queue

## Overview
This guide covers the implementation of Week 1 tasks from the updated roadmap:
- PostgreSQL adapter with connection pooling
- MongoDB adapter with connection pooling
- Redis caching with multi-level strategy
- RabbitMQ message queue setup
- JIT funding latency profiler

## Files Created

### 1. Database Adapters

#### PostgreSQLAdapter.js
- **Location**: `src/adapters/PostgreSQLAdapter.js`
- **Features**:
  - Connection pooling (min: 5, max: 20 connections)
  - Query timeout: 30 seconds
  - Slow query detection (>100ms)
  - Transaction support with rollback
  - Pool statistics tracking

#### MongoDBAdapter.js
- **Location**: `src/adapters/MongoDBAdapter.js`
- **Features**:
  - Connection pooling (min: 2, max: 10 connections)
  - Automatic retry on connection failure
  - Index creation support
  - Query operation support (find, insert, update, delete, aggregate)
  - Connection statistics

#### RedisAdapter.js
- **Location**: `src/adapters/RedisAdapter.js`
- **Features**:
  - Multi-level caching strategies
  - TTL-based cache expiration
  - Session management
  - Counter operations
  - Cache invalidation methods
  - Automatic reconnection

### 2. Message Queue

#### MessageQueueManager.js
- **Location**: `src/queue/MessageQueueManager.js`
- **Features**:
  - RabbitMQ connection management
  - Topic-based exchanges
  - Durable queues with dead letter queues
  - Message publishing with persistence
  - Consumer management
  - Automatic retry logic (up to 3 retries)
  - Queue statistics

### 3. Monitoring

#### JITFundingProfiler.js
- **Location**: `src/monitoring/JITFundingProfiler.js`
- **Features**:
  - Stage-by-stage latency profiling
  - Cache hit tracking
  - Decision logic timing
  - Metrics aggregation
  - Performance statistics (p50, p95, p99)
  - Threshold alerts (50ms warning, 100ms critical)

### 4. Database Manager

#### DatabaseManager.js
- **Location**: `src/database/DatabaseManager.js`
- **Features**:
  - Centralized database initialization
  - Automatic index creation
  - Health status checking
  - Graceful shutdown

### 5. Health Check Routes

#### health.js
- **Location**: `src/routes/health.js`
- **Endpoints**:
  - `GET /health` - Overall system health
  - `GET /ready` - Readiness probe for Kubernetes

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `amqplib` - RabbitMQ client
- `mongodb` - MongoDB driver
- `prom-client` - Prometheus metrics

### Step 2: Update Environment Variables
```bash
cp .env.example .env
```

Update the following in `.env`:
```bash
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlanticfrewaycard

# MongoDB
MONGODB_URI=mongodb://localhost:27017/atlanticfrewaycard

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Step 3: Start Services with Docker Compose
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- RabbitMQ (port 5672, management UI: 15672)

### Step 4: Initialize Database Manager in server.js

Add to your `server.js`:

```javascript
const DatabaseManager = require('./src/database/DatabaseManager');
const { router: healthRouter, initializeHealthRoutes } = require('./src/routes/health');

// Initialize database manager
const dbManager = new DatabaseManager({
  DATABASE_URL: process.env.DATABASE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB || 'atlanticfrewaycard',
  REDIS_URL: process.env.REDIS_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL
});

// Initialize on server start
app.listen(PORT, async () => {
  try {
    await dbManager.initialize();
    initializeHealthRoutes(dbManager);
    app.use('/', healthRouter);
    
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await dbManager.close();
  process.exit(0);
});
```

## Usage Examples

### Using PostgreSQL Adapter
```javascript
const PostgreSQLAdapter = require('./src/adapters/PostgreSQLAdapter');

const postgres = new PostgreSQLAdapter({
  DATABASE_URL: process.env.DATABASE_URL
});

// Execute query
const result = await postgres.executeQuery(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Execute transaction
await postgres.executeTransaction(async (client) => {
  await client.query('INSERT INTO users VALUES ($1, $2)', [name, email]);
  await client.query('INSERT INTO wallets VALUES ($1, $2)', [userId, balance]);
});
```

### Using Redis Adapter
```javascript
const RedisAdapter = require('./src/adapters/RedisAdapter');

const redis = new RedisAdapter({
  REDIS_URL: process.env.REDIS_URL
});

await redis.connect();

// Cache user data
await redis.cacheUser(userId, userData, 3600); // 1 hour TTL

// Get from cache
const cachedUser = await redis.getFromCache(`user:${userId}`);

// Invalidate cache
await redis.invalidateUserCache(userId);
```

### Using Message Queue
```javascript
const MessageQueueManager = require('./src/queue/MessageQueueManager');

const mq = new MessageQueueManager({
  RABBITMQ_URL: process.env.RABBITMQ_URL
});

await mq.connect();

// Publish message
await mq.publishMessage('transactions', 'jit-funding.created', {
  transactionId: '123',
  userId: 'user-456',
  amount: 100
});

// Consume messages
await mq.consumeMessage('jit-funding-queue', async (message) => {
  console.log('Processing JIT funding:', message);
  // Process the message
});
```

### Using JIT Funding Profiler
```javascript
const JITFundingProfiler = require('./src/monitoring/JITFundingProfiler');

const profiler = new JITFundingProfiler(redis, postgres);

// Profile authorization
const { decision, metrics } = await profiler.profileAuthorization({
  id: 'tx-123',
  userId: 'user-456',
  cardId: 'card-789',
  amount: 100
});

console.log('Decision:', decision);
console.log('Metrics:', metrics);

// Get statistics
const stats = profiler.getMetricsStats();
console.log('Performance Stats:', stats);
// Output:
// {
//   count: 100,
//   average: 45.2,
//   min: 12,
//   max: 98,
//   p50: 42,
//   p95: 78,
//   p99: 95,
//   approvalRate: 98.5
// }
```

## Testing

### Test Database Connections
```bash
npm test -- src/adapters/PostgreSQLAdapter.test.js
npm test -- src/adapters/MongoDBAdapter.test.js
npm test -- src/adapters/RedisAdapter.test.js
```

### Test Message Queue
```bash
npm test -- src/queue/MessageQueueManager.test.js
```

### Test JIT Profiler
```bash
npm test -- src/monitoring/JITFundingProfiler.test.js
```

### Health Check
```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Performance Targets

### Database Performance
- PostgreSQL query time: <50ms average
- MongoDB query time: <50ms average
- Connection pool utilization: 60-80%

### Caching Performance
- Cache hit rate: >80%
- Cache lookup time: <5ms
- Redis memory usage: <500MB

### Message Queue Performance
- Message publish latency: <10ms
- Message consume latency: <50ms
- Queue depth: <1000 messages

### JIT Funding Performance
- Total authorization time: <100ms (target)
- User lookup: <10ms
- Card lookup: <10ms
- Limits check: <10ms
- Decision logic: <5ms

## Monitoring & Debugging

### Check Database Pool Stats
```javascript
const stats = await postgres.getPoolStats();
console.log(stats);
// { totalConnections: 15, idleConnections: 8, waitingRequests: 0 }
```

### Check Queue Stats
```javascript
const queueStats = await mq.getQueueStats('jit-funding-queue');
console.log(queueStats);
// { messageCount: 42, consumerCount: 2 }
```

### Check System Health
```javascript
const health = await dbManager.getHealthStatus();
console.log(health);
// {
//   postgres: 'healthy',
//   mongodb: 'healthy',
//   redis: 'healthy',
//   messageQueue: 'healthy'
// }
```

## Troubleshooting

### PostgreSQL Connection Issues
- Check `DATABASE_URL` format
- Verify PostgreSQL is running: `docker-compose ps`
- Check connection pool limits: `SELECT count(*) FROM pg_stat_activity;`

### MongoDB Connection Issues
- Check `MONGODB_URI` format
- Verify MongoDB is running: `docker-compose ps`
- Check connection pool: `db.serverStatus().connections`

### Redis Connection Issues
- Check `REDIS_URL` format
- Verify Redis is running: `docker-compose ps`
- Test connection: `redis-cli ping`

### RabbitMQ Connection Issues
- Check `RABBITMQ_URL` format
- Verify RabbitMQ is running: `docker-compose ps`
- Access management UI: http://localhost:15672 (guest/guest)

## Next Steps

After Week 1 completion:
1. Implement real Marqeta API service (Week 2)
2. Set up async webhook handlers with message queue (Week 2)
3. Build Go JIT funding microservice (Week 2-3)
4. Implement performance testing (Week 3)

## References

- PostgreSQL Connection Pooling: https://node-postgres.com/features/pooling
- MongoDB Connection Pooling: https://docs.mongodb.com/drivers/node/current/fundamentals/connection/connection-pool/
- Redis Client: https://github.com/redis/node-redis
- RabbitMQ: https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html
