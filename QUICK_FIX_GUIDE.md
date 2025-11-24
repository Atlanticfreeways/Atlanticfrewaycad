# Quick Fix Guide - Common Startup Issues

## Issue 1: Port 3000 Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Quick Fix**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or find and kill manually
lsof -i :3000
kill -9 <PID>
```

**Then restart**:
```bash
npm run dev
```

---

## Issue 2: Docker Services Won't Start

**Error**: `Error response from daemon: manifest for mongo:7: net/http: TLS handshake timeout`

**Cause**: Docker registry connection timeout (network issue)

**Quick Fix**:

### Option A: Retry (usually works)
```bash
# Wait a moment and try again
sleep 30
docker-compose up -d
```

### Option B: Use Local Images
If you have images cached locally:
```bash
# Check available images
docker images

# If images exist, they'll be used
docker-compose up -d
```

### Option C: Pull Images Separately
```bash
# Pull images one by one
docker pull postgres:15-alpine
docker pull mongo:7
docker pull redis:7-alpine
docker pull rabbitmq:3.13-management
docker pull nginx:alpine

# Then start services
docker-compose up -d
```

---

## Issue 3: MongoDB/RabbitMQ Errors

**Error**: Various manifest not found errors

**Solution**: Already fixed in docker-compose.yml
- MongoDB: `mongo:7` (instead of `mongo:6-alpine`)
- RabbitMQ: `rabbitmq:3.13-management` (instead of alpine)

**Verify**:
```bash
cat docker-compose.yml | grep image
```

---

## Complete Startup Sequence

### Step 1: Clean Up
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Stop Docker services
docker-compose down
```

### Step 2: Start Services
```bash
# Start Docker services
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Check status
docker-compose ps
```

### Step 3: Verify Services
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT 1" && echo "✅ PostgreSQL OK"

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" && echo "✅ MongoDB OK"

# Redis
docker-compose exec redis redis-cli ping && echo "✅ Redis OK"

# RabbitMQ
curl -s -u guest:guest http://localhost:15672/api/overview > /dev/null && echo "✅ RabbitMQ OK"
```

### Step 4: Start App
```bash
npm run dev
```

### Step 5: Test Health
```bash
# In another terminal
sleep 5
curl http://localhost:3000/health
```

---

## Automated Fix Script

Run the provided fix script:

```bash
chmod +x fix-startup.sh
./fix-startup.sh
```

This script:
1. Kills process on port 3000
2. Stops Docker services
3. Starts Docker services
4. Waits for services to be ready
5. Checks service status
6. Verifies health endpoint

---

## Troubleshooting by Symptom

### Symptom: "Address already in use"
```bash
lsof -ti:3000 | xargs kill -9
```

### Symptom: "Docker services won't start"
```bash
# Check Docker daemon
docker ps

# Restart Docker (if needed)
# Mac: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

### Symptom: "Health endpoint returns redirect"
```bash
# Wait for app to initialize
sleep 30

# Check app logs
docker-compose logs app

# Restart app
docker-compose restart app
```

### Symptom: "Services show unhealthy"
```bash
# Check individual service logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs redis
docker-compose logs rabbitmq

# Restart unhealthy service
docker-compose restart <service-name>
```

---

## Network Issues

If Docker can't pull images:

### Check Internet Connection
```bash
ping 8.8.8.8
```

### Check Docker Network
```bash
docker network ls
docker network inspect bridge
```

### Restart Docker Daemon
```bash
# Mac
# Restart Docker Desktop from menu

# Linux
sudo systemctl restart docker
```

### Use Docker Buildkit
```bash
export DOCKER_BUILDKIT=1
docker-compose up -d
```

---

## Port Conflicts

Check what's using ports:

```bash
# PostgreSQL (5432)
lsof -i :5432

# MongoDB (27017)
lsof -i :27017

# Redis (6379)
lsof -i :6379

# RabbitMQ (5672, 15672)
lsof -i :5672
lsof -i :15672

# App (3000)
lsof -i :3000

# Nginx (80, 443)
lsof -i :80
lsof -i :443
```

Kill conflicting process:
```bash
kill -9 <PID>
```

---

## Memory Issues

If services are slow or crashing:

```bash
# Check Docker resource usage
docker stats

# Increase Docker memory (Mac)
# Docker Desktop → Preferences → Resources → Memory
# Set to at least 4GB

# Increase Docker memory (Linux)
# Edit /etc/docker/daemon.json
# Add: "memory": "4g"
```

---

## Complete Reset

If everything is broken:

```bash
# Stop and remove everything
docker-compose down -v

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

---

## Verification Checklist

After startup, verify:

- [ ] `docker-compose ps` shows all services as "healthy"
- [ ] `curl http://localhost:3000/health` returns 200
- [ ] PostgreSQL: `docker-compose exec postgres psql -U postgres -c "SELECT 1"`
- [ ] MongoDB: `docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"`
- [ ] Redis: `docker-compose exec redis redis-cli ping`
- [ ] RabbitMQ: `curl -u guest:guest http://localhost:15672/api/overview`
- [ ] App logs show no errors: `docker-compose logs app`

---

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Start app
npm run dev

# Test health
curl http://localhost:3000/health
```

---

## Getting Help

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
   - TROUBLESHOOTING_DOCKER.md
   - QUICK_REFERENCE_WEEK1.md

4. **Run fix script**:
   ```bash
   ./fix-startup.sh
   ```

---

**Last Updated**: 2024
**Status**: Ready for quick fixes
