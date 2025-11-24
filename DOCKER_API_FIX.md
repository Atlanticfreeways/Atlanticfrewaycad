# Docker API Version Mismatch - Fix

## Issue

**Error**: `request returned Internal Server Error for API route and version http://%2FUsers%2Fmachine%2F.docker%2Frun%2Fdocker.sock/v1.24/containers/json`

**Cause**: Docker Compose API version mismatch with Docker daemon

---

## Solution

### Option 1: Update Docker Compose (Recommended)

```bash
# Check current Docker Compose version
docker-compose --version

# Update Docker Compose to latest
brew install docker-compose

# Or if using Docker Desktop, update the app itself
# Docker Desktop → Check for Updates
```

### Option 2: Downgrade Docker Compose API

Create a `.env` file in project root:

```bash
# Create .env file
cat > .env << 'EOF'
COMPOSE_API_VERSION=1.40
EOF
```

### Option 3: Use Docker Compose V2 (Recommended)

```bash
# Check if docker compose v2 is available
docker compose version

# If available, use it instead of docker-compose
docker compose up -d
docker compose ps
docker compose logs -f
```

---

## Complete Fix Sequence

### Step 1: Check Versions

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Check Docker Compose V2
docker compose version
```

### Step 2: Update Docker Desktop

1. Open Docker Desktop
2. Click menu → Check for Updates
3. Install latest version
4. Restart Docker

### Step 3: Try Again

```bash
# Try with docker-compose
docker-compose up -d

# If that fails, try with docker compose v2
docker compose up -d
```

### Step 4: If Still Failing

```bash
# Reset Docker
killall Docker
sleep 10
open /Applications/Docker.app
sleep 60

# Try again
docker compose up -d
```

---

## Quick Fix (Copy & Paste)

```bash
# 1. Kill Docker
killall Docker 2>/dev/null

# 2. Wait
sleep 10

# 3. Start Docker
open /Applications/Docker.app

# 4. Wait for Docker to fully start
sleep 90

# 5. Try with docker compose v2
docker compose up -d

# 6. Check status
docker compose ps

# 7. Test health
curl http://localhost:3000/health
```

---

## If Docker Compose V2 Not Available

```bash
# Install via Homebrew
brew install docker-compose

# Or update existing
brew upgrade docker-compose

# Verify
docker-compose --version
```

---

## Alternative: Use Docker CLI Directly

If docker-compose still fails, use Docker CLI:

```bash
# Start individual services
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine
docker run -d --name mongodb -p 27017:27017 mongo:7
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management
```

---

## Verify Fix

```bash
# Check if services are running
docker ps

# Expected: List of running containers

# Test health
curl http://localhost:3000/health

# Expected: JSON response
```

---

## Expected Output After Fix

```bash
$ docker compose ps
NAME                COMMAND                  SERVICE      STATUS
postgres            "docker-entrypoint.s…"   postgres     Up (healthy)
mongodb             "docker-entrypoint.s…"   mongodb      Up (healthy)
redis               "redis-server"           redis        Up (healthy)
rabbitmq            "docker-entrypoint.s…"   rabbitmq     Up (healthy)
nginx               "nginx -g daemon off…"   nginx        Up
app                 "node server.js"         app          Up
```

---

## Troubleshooting

### Still Getting API Error
→ Update Docker Desktop to latest version

### docker compose v2 not found
→ Install: `brew install docker-compose`

### Services won't start
→ Check Docker logs: `docker logs <container-name>`

### Port conflicts
→ Kill process: `lsof -ti:3000 | xargs kill -9`

---

## What to Do Now

1. **Update Docker Desktop** (if available)
2. **Run**: `docker compose up -d` (note: no hyphen)
3. **Check**: `docker compose ps`
4. **Test**: `curl http://localhost:3000/health`

---

**Status**: Ready for Docker API fix
**Next**: Run the quick fix sequence above
