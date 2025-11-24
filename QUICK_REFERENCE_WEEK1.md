# Week 1 Quick Reference Card

## Start Services
```bash
docker-compose up -d
npm install
npm run dev
```

## Check Health
```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Database Adapters

### PostgreSQL
```javascript
const postgres = new PostgreSQLAdapter({ DATABASE_URL });
const result = await postgres.executeQuery('SELECT * FROM users WHERE id = $1', [userId]);
const stats = await postgres.getPoolStats();
```

### MongoDB
```javascript
const mongodb = new MongoDBAdapter({ MONGODB_URI });
await mongodb.connect();
const user = await mongodb.executeQuery('users', 'findOne', { filter: { _id: userId } });
```

### Redis
```javascript
const redis = new RedisAdapter({ REDIS_URL });
await redis.connect();
await redis.cacheUser(userId, userData, 3600);
const cached = await redis.getFromCache(`user:${userId}`);
```

## Message Queue

### Publish
```javascript
await mq.publishMessage('transactions', 'jit-funding.created', {
  transactionId: '123',
  userId: 'user-456',
  amount: 100
});
```

### Consume
```javascript
await mq.consumeMessage('jit-funding-queue', async (message) => {
  console.log('Processing:', message);
});
```

## JIT Profiler

```javascript
const profiler = new JITFundingProfiler(redis, postgres);
const { decision, metrics } = await profiler.profileAuthorization(transaction);
const stats = profiler.getMetricsStats();
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | postgres/password |
| MongoDB | localhost:27017 | - |
| Redis | localhost:6379 | - |
| RabbitMQ | http://localhost:15672 | guest/guest |
| Nginx | http://localhost:80 | - |

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlanticfrewaycard
MONGODB_URI=mongodb://localhost:27017/atlanticfrewaycard
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Common Commands

```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Check service status
docker-compose ps

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard

# Access MongoDB
docker-compose exec mongodb mongosh

# Access Redis
docker-compose exec redis redis-cli

# Access RabbitMQ Management
# http://localhost:15672 (guest/guest)
```

## Performance Targets

| Metric | Target |
|--------|--------|
| PostgreSQL Query | <50ms |
| MongoDB Query | <50ms |
| Redis Lookup | <5ms |
| JIT Authorization | <100ms |
| Message Publish | <10ms |
| Message Consume | <50ms |

## Troubleshooting

### Connection Issues
```bash
# Check if services are running
docker-compose ps

# View service logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs redis
docker-compose logs rabbitmq

# Restart a service
docker-compose restart postgres
```

### Performance Issues
```bash
# Check database connections
curl http://localhost:3000/health

# Check queue depth
# Access RabbitMQ UI: http://localhost:15672

# Check Redis memory
docker-compose exec redis redis-cli info memory
```

## Files Reference

| File | Purpose |
|------|---------|
| `src/adapters/PostgreSQLAdapter.js` | PostgreSQL connection pooling |
| `src/adapters/MongoDBAdapter.js` | MongoDB connection pooling |
| `src/adapters/RedisAdapter.js` | Redis caching |
| `src/queue/MessageQueueManager.js` | RabbitMQ management |
| `src/monitoring/JITFundingProfiler.js` | JIT latency profiling |
| `src/database/DatabaseManager.js` | Centralized DB initialization |
| `src/routes/health.js` | Health check endpoints |
| `docker-compose.yml` | Service orchestration |
| `nginx.conf` | Load balancing & reverse proxy |

## Next Week (Week 2)

- [ ] Implement real Marqeta API service
- [ ] Set up async webhook handlers
- [ ] Build Go JIT funding microservice
- [ ] Implement transaction event publishing
