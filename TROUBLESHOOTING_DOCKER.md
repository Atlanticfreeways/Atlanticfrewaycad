# Docker Troubleshooting Guide

## Issue 1: MongoDB Image Not Found

**Error**: `Error response from daemon: manifest for mongo:6-alpine not found`

**Cause**: The `mongo:6-alpine` image doesn't exist or isn't available for your architecture.

**Solution**:

Update `docker-compose.yml`:

```yaml
mongodb:
  image: mongo:7  # Changed from mongo:6-alpine
  # ... rest of config
```

**Why**: 
- `mongo:7` is more stable and widely available
- Alpine images sometimes have compatibility issues
- Full images are more reliable for development

## Issue 2: RabbitMQ Image Issues

**Error**: Similar manifest not found errors

**Solution**:

Update `docker-compose.yml`:

```yaml
rabbitmq:
  image: rabbitmq:3.13-management  # Changed from rabbitmq:3.12-management-alpine
  # ... rest of config
```

**Why**:
- Full images are more stable than alpine variants
- Management UI is included in the full image
- Better compatibility across different systems

## Issue 3: Health Endpoint Redirecting to Login

**Error**: `curl http://localhost:3000/health` returns redirect to `/login`

**Cause**: The app is running but the health endpoint might be protected or the app hasn't fully initialized.

**Solution**:

1. **Check if app is running**:
   ```bash
   docker-compose ps app
   ```

2. **Check app logs**:
   ```bash
   docker-compose logs app
   ```

3. **Wait for initialization** (30-60 seconds):
   ```bash
   sleep 30
   curl http://localhost:3000/health
   ```

4. **If still failing, restart app**:
   ```bash
   docker-compose restart app
   ```

5. **Check if databases are ready**:
   ```bash
   docker-compose ps
   # All services should show "healthy"
   ```

## Issue 4: npm install Vulnerabilities

**Error**: `3 vulnerabilities (2 low, 1 moderate)`

**Solution**:

This is normal and can be addressed:

```bash
# Fix non-breaking vulnerabilities
npm audit fix

# Or ignore for now (safe for development)
# Vulnerabilities are typically in dev dependencies
```

**Why**: 
- Development dependencies sometimes have minor vulnerabilities
- These don't affect the application functionality
- Can be fixed in production deployment

## Complete Startup Sequence

If you encounter multiple issues, follow this sequence:

### 1. Clean Start
```bash
# Stop all services
docker-compose down -v

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Copy environment
cp .env.example .env
```

### 2. Start Services
```bash
# Start services in background
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Check status
docker-compose ps
```

### 3. Verify Each Service

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT 1"
echo "PostgreSQL: OK"

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
echo "MongoDB: OK"

# Redis
docker-compose exec redis redis-cli ping
echo "Redis: OK"

# RabbitMQ
curl -s -u guest:guest http://localhost:15672/api/overview > /dev/null
echo "RabbitMQ: OK"
```

### 4. Start Application
```bash
npm run dev
```

### 5. Test Health Endpoint
```bash
# In another terminal
sleep 5
curl http://localhost:3000/health
```

## Docker Compose Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
docker-compose logs -f rabbitmq

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart postgres

# Execute command in service
docker-compose exec postgres psql -U postgres

# Build images
docker-compose build

# Pull latest images
docker-compose pull
```

## Service Health Checks

### PostgreSQL Health
```bash
docker-compose exec postgres pg_isready -U postgres
```

Expected: `accepting connections`

### MongoDB Health
```bash
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

Expected: `{ ok: 1 }`

### Redis Health
```bash
docker-compose exec redis redis-cli ping
```

Expected: `PONG`

### RabbitMQ Health
```bash
curl -u guest:guest http://localhost:15672/api/overview
```

Expected: JSON response with queue information

## Port Conflicts

If services fail to start due to port conflicts:

```bash
# Find what's using a port
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis
lsof -i :5672  # RabbitMQ
lsof -i :15672 # RabbitMQ UI
lsof -i :3000  # App
lsof -i :80    # Nginx

# Kill process using port (if needed)
kill -9 <PID>
```

## Memory Issues

If Docker services are slow or crashing:

```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit
# On Mac: Docker Desktop → Preferences → Resources → Memory
# On Linux: Edit /etc/docker/daemon.json
```

## Network Issues

If services can't communicate:

```bash
# Check Docker network
docker network ls

# Inspect network
docker network inspect atlanticfrewaycard_default

# Restart Docker daemon
# Mac: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

## Complete Reset

If everything is broken, do a complete reset:

```bash
# Stop all containers
docker-compose down -v

# Remove all Docker images (optional)
docker rmi mongo:7 postgres:15-alpine redis:7-alpine rabbitmq:3.13-management nginx:alpine

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Copy env
cp .env.example .env

# Start fresh
docker-compose up -d
sleep 30
npm run dev
```

## Verification Checklist

After startup, verify:

- [ ] `docker-compose ps` shows all services as "healthy"
- [ ] `curl http://localhost:3000/health` returns 200 with healthy status
- [ ] `curl http://localhost:3000/ready` returns 200 with ready status
- [ ] PostgreSQL accessible: `docker-compose exec postgres psql -U postgres -c "SELECT 1"`
- [ ] MongoDB accessible: `docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"`
- [ ] Redis accessible: `docker-compose exec redis redis-cli ping`
- [ ] RabbitMQ UI accessible: http://localhost:15672 (guest/guest)
- [ ] App logs show no errors: `docker-compose logs app`

## Getting Help

If issues persist:

1. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Check specific service**:
   ```bash
   docker-compose logs -f <service-name>
   ```

3. **Review documentation**:
   - WEEK1_STARTUP_GUIDE.md
   - WEEK1_IMPLEMENTATION_GUIDE.md
   - WEEK1_ARCHITECTURE.md

4. **Verify environment**:
   ```bash
   cat .env
   ```

5. **Check Docker version**:
   ```bash
   docker --version
   docker-compose --version
   ```

---

**Last Updated**: 2024
**Status**: Ready for troubleshooting
