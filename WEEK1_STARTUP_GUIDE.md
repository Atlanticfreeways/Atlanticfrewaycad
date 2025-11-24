# Week 1 Startup Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `amqplib` - RabbitMQ client
- `mongodb` - MongoDB driver
- `prom-client` - Prometheus metrics

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```bash
# Database URLs
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlanticfrewaycard
MONGODB_URI=mongodb://localhost:27017/atlanticfrewaycard
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Server
PORT=3000
NODE_ENV=development
```

## Step 3: Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- RabbitMQ (port 5672, UI: 15672)
- Nginx (port 80)

Wait for all services to be healthy (30-60 seconds):

```bash
docker-compose ps
```

All services should show "healthy" status.

## Step 4: Verify Services

### Check Docker Services
```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE      STATUS
postgres            "docker-entrypoint.s…"   postgres     Up (healthy)
mongodb             "docker-entrypoint.s…"   mongodb      Up (healthy)
redis               "redis-server"           redis        Up (healthy)
rabbitmq            "docker-entrypoint.s…"   rabbitmq     Up (healthy)
nginx               "nginx -g daemon off…"   nginx        Up
```

### Check Service Connectivity

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -c "SELECT 1"

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis
docker-compose exec redis redis-cli ping

# RabbitMQ
curl http://localhost:15672/api/overview -u guest:guest
```

## Step 5: Start Node.js Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Step 6: Verify Application

### Check Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "postgres": "healthy",
    "mongodb": "healthy",
    "redis": "healthy",
    "messageQueue": "healthy"
  }
}
```

### Check Readiness Endpoint
```bash
curl http://localhost:3000/ready
```

Expected response:
```json
{
  "ready": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "postgres": "healthy",
    "mongodb": "healthy",
    "redis": "healthy",
    "messageQueue": "healthy"
  }
}
```

## Troubleshooting

### Docker Services Won't Start

**Issue**: `Error response from daemon: manifest not found`

**Solution**: Update docker-compose.yml with compatible images:
```bash
# MongoDB
image: mongo:7  # Instead of mongo:6-alpine

# RabbitMQ
image: rabbitmq:3.13-management  # Instead of rabbitmq:3.12-management-alpine
```

### PostgreSQL Connection Failed

**Issue**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### MongoDB Connection Failed

**Issue**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Redis Connection Failed

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Check if Redis is running
docker-compose ps redis

# Check logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### RabbitMQ Connection Failed

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:5672`

**Solution**:
```bash
# Check if RabbitMQ is running
docker-compose ps rabbitmq

# Check logs
docker-compose logs rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Health Endpoint Returns Unhealthy

**Issue**: `curl http://localhost:3000/health` returns degraded status

**Solution**:
1. Check individual service logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs mongodb
   docker-compose logs redis
   docker-compose logs rabbitmq
   ```

2. Verify environment variables in `.env`

3. Check database URLs are correct

4. Restart all services:
   ```bash
   docker-compose restart
   ```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | postgres/password |
| MongoDB | localhost:27017 | - |
| Redis | localhost:6379 | - |
| RabbitMQ AMQP | localhost:5672 | guest/guest |
| RabbitMQ UI | http://localhost:15672 | guest/guest |
| Nginx | http://localhost:80 | - |

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### Access Service Shells
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres

# MongoDB
docker-compose exec mongodb mongosh

# Redis
docker-compose exec redis redis-cli

# RabbitMQ (via management UI)
# http://localhost:15672
```

## Testing Database Connections

### PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -c "SELECT version();"
```

### MongoDB
```bash
docker-compose exec mongodb mongosh --eval "db.version()"
```

### Redis
```bash
docker-compose exec redis redis-cli info server
```

### RabbitMQ
```bash
curl -u guest:guest http://localhost:15672/api/overview
```

## Next Steps

1. Review WEEK1_IMPLEMENTATION_GUIDE.md for detailed usage
2. Check WEEK1_ARCHITECTURE.md for system design
3. Read QUICK_REFERENCE_WEEK1.md for common commands
4. Start implementing Week 2 tasks

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Check health: `curl http://localhost:3000/health`
4. Review documentation files

---

**Status**: Ready for development
**Next Phase**: Week 2 - Marqeta Integration
