# Manual Startup Instructions

## Current Issue

Docker daemon is not responding even though Docker Desktop appears to be running.

**Error**: `Cannot connect to the Docker daemon at unix:///Users/machine/.docker/run/docker.sock`

---

## Solution: Restart Docker Daemon

### Step 1: Quit Docker Desktop Completely

```bash
# Kill all Docker processes
killall Docker
killall com.docker.hyperkit
killall vpnkit
killall com.docker.driver.amd64-linux

# Wait a moment
sleep 5
```

### Step 2: Restart Docker Desktop

```bash
# Start Docker Desktop again
open /Applications/Docker.app

# Wait for Docker to fully start (60-90 seconds)
sleep 60
```

### Step 3: Verify Docker is Ready

```bash
# Check if Docker daemon is responding
docker ps

# Should show: CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (empty list is fine if no containers running)
```

### Step 4: Start Docker Services

```bash
# Navigate to project directory
cd /Users/machine/Project/GitHub/Atlanticfrewaycard

# Start services
docker-compose up -d

# Wait for services to start
sleep 30

# Check status
docker-compose ps
```

### Step 5: Verify All Services

```bash
# Check each service
docker-compose ps

# Expected output: All services showing "healthy"
```

### Step 6: Test the System

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected: JSON response with status "healthy"
```

---

## Complete Command Sequence

Copy and paste this entire sequence:

```bash
# 1. Kill Docker processes
killall Docker 2>/dev/null
killall com.docker.hyperkit 2>/dev/null
killall vpnkit 2>/dev/null
sleep 5

# 2. Start Docker Desktop
open /Applications/Docker.app
sleep 60

# 3. Verify Docker
docker ps

# 4. Start services
cd /Users/machine/Project/GitHub/Atlanticfrewaycard
docker-compose up -d
sleep 30

# 5. Check status
docker-compose ps

# 6. Test health
curl http://localhost:3000/health
```

---

## If Docker Still Won't Connect

### Option A: Check Docker Socket

```bash
# Check if socket exists
ls -la /Users/machine/.docker/run/docker.sock

# If missing, restart Docker Desktop
open /Applications/Docker.app
sleep 60
```

### Option B: Reset Docker

```bash
# Quit Docker
killall Docker

# Remove Docker socket
rm -f /Users/machine/.docker/run/docker.sock

# Start Docker again
open /Applications/Docker.app
sleep 60

# Verify
docker ps
```

### Option C: Check Docker Logs

```bash
# View Docker logs
log stream --predicate 'process == "Docker"' --level debug

# Or check system logs
cat ~/Library/Logs/Docker.log
```

---

## Troubleshooting

### "Docker daemon not responding"
→ Restart Docker: `killall Docker && sleep 5 && open /Applications/Docker.app`

### "Cannot connect to socket"
→ Wait longer for Docker to start: `sleep 90`

### "Services won't start"
→ Check Docker logs: `docker-compose logs`

### "Port already in use"
→ Kill process: `lsof -ti:3000 | xargs kill -9`

---

## Expected Output

### After `docker-compose ps`:
```
NAME                COMMAND                  SERVICE      STATUS
postgres            "docker-entrypoint.s…"   postgres     Up (healthy)
mongodb             "docker-entrypoint.s…"   mongodb      Up (healthy)
redis               "redis-server"           redis        Up (healthy)
rabbitmq            "docker-entrypoint.s…"   rabbitmq     Up (healthy)
nginx               "nginx -g daemon off…"   nginx        Up
app                 "node server.js"         app          Up
```

### After `curl http://localhost:3000/health`:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T23:50:00Z",
  "services": {
    "postgres": "healthy",
    "mongodb": "healthy",
    "redis": "healthy",
    "messageQueue": "healthy"
  }
}
```

---

## Service URLs (After Startup)

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | postgres/password |
| MongoDB | localhost:27017 | - |
| Redis | localhost:6379 | - |
| RabbitMQ AMQP | localhost:5672 | guest/guest |
| RabbitMQ UI | http://localhost:15672 | guest/guest |
| Nginx | http://localhost:80 | - |

---

## Quick Reference

```bash
# Start Docker
open /Applications/Docker.app

# Check Docker status
docker ps

# Start services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f

# Test app
curl http://localhost:3000/health

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

---

## What to Do Now

1. **Run the complete command sequence above** in your terminal
2. **Wait for Docker to start** (60-90 seconds)
3. **Verify services**: `docker-compose ps`
4. **Test health**: `curl http://localhost:3000/health`

---

## Documentation

- **DOCKER_STARTUP.md** - Docker startup guide
- **CURRENT_STATUS.md** - Current system status
- **QUICK_FIX_GUIDE.md** - Common issues
- **TROUBLESHOOTING_DOCKER.md** - Docker troubleshooting

---

**Status**: Ready for manual startup
**Next**: Run the command sequence above
