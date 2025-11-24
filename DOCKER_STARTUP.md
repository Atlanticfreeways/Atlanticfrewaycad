# Docker Startup Guide for macOS

## Issue: Docker Daemon Not Running

**Error**: `Cannot connect to the Docker daemon at unix:///Users/machine/.docker/run/docker.sock`

**Solution**: Start Docker Desktop

---

## How to Start Docker on macOS

### Option 1: Using Spotlight (Fastest)
```bash
# Press Command + Space to open Spotlight
# Type: Docker
# Press Enter to launch Docker Desktop
```

### Option 2: Using Terminal
```bash
# Start Docker Desktop from terminal
open /Applications/Docker.app
```

### Option 3: Manual Launch
1. Open Applications folder
2. Find Docker.app
3. Double-click to launch

---

## Verify Docker is Running

```bash
# Check if Docker daemon is running
docker ps

# Expected output: Shows running containers (or empty list if none running)
```

If you see the error again, Docker is not running. Try starting it again.

---

## Complete Startup Sequence (After Docker is Running)

### Step 1: Kill Port 3000 (if needed)
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 is free"
```

### Step 2: Start Docker Services
```bash
docker-compose down
docker-compose up -d
sleep 30
```

### Step 3: Verify Services
```bash
docker-compose ps
```

**Expected**: All services showing "healthy"

### Step 4: Start Node.js App
```bash
npm run dev
```

**Expected**: App starts on port 3000

### Step 5: Test Health (in another terminal)
```bash
curl http://localhost:3000/health
```

**Expected**: JSON response with status "healthy"

---

## Current Status

✅ **Node.js App**: Running on port 3000
✅ **App Logs**: Show successful startup
✅ **Security**: CSRF, CORS, Logging enabled

⏳ **Pending**: Docker services (need Docker daemon running)

---

## Next Steps

1. **Start Docker Desktop**
   - Use Spotlight: Cmd+Space → Docker → Enter
   - Or: `open /Applications/Docker.app`

2. **Wait for Docker to be ready** (30-60 seconds)
   - Check: `docker ps`

3. **Start Docker services**
   ```bash
   docker-compose up -d
   sleep 30
   ```

4. **Verify all services**
   ```bash
   docker-compose ps
   ```

5. **Test the system**
   ```bash
   curl http://localhost:3000/health
   ```

---

## Troubleshooting

### Docker Won't Start
```bash
# Check if Docker is installed
ls /Applications/Docker.app

# If not found, install from: https://www.docker.com/products/docker-desktop
```

### Docker Starts but Hangs
```bash
# Restart Docker
killall Docker
sleep 5
open /Applications/Docker.app
```

### Still Getting Daemon Error
```bash
# Check Docker socket
ls -la /Users/machine/.docker/run/docker.sock

# If missing, restart Docker Desktop
```

---

## Verify Everything is Working

Once Docker is running, run this verification:

```bash
# 1. Check Docker
docker ps
echo "✅ Docker running"

# 2. Check services
docker-compose ps
echo "✅ Services running"

# 3. Check app
curl http://localhost:3000/health
echo "✅ App healthy"
```

---

## Service Status

| Service | Status | Port |
|---------|--------|------|
| Node.js App | ✅ Running | 3000 |
| PostgreSQL | ⏳ Pending Docker | 5432 |
| MongoDB | ⏳ Pending Docker | 27017 |
| Redis | ⏳ Pending Docker | 6379 |
| RabbitMQ | ⏳ Pending Docker | 5672 |

---

## Quick Commands

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

# Stop services
docker-compose down

# Test app
curl http://localhost:3000/health
```

---

## What to Do Now

1. **Start Docker Desktop** (if not already running)
2. **Wait for Docker to be ready** (check with `docker ps`)
3. **Run**: `docker-compose up -d`
4. **Wait**: `sleep 30`
5. **Verify**: `docker-compose ps`
6. **Test**: `curl http://localhost:3000/health`

---

**Status**: App running, waiting for Docker services
**Next**: Start Docker Desktop and run docker-compose up -d
