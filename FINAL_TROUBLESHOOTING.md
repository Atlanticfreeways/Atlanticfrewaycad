# Final Troubleshooting Guide - Week 1 Implementation

## Current Issue: Docker API Version Mismatch

**Error**: `request returned Internal Server Error for API route and version`

**Status**: This is a known Docker Desktop issue on macOS

---

## Solution Priority

### Priority 1: Update Docker Desktop (Fastest)
```bash
# Open Docker Desktop
# Click menu → Check for Updates
# Install latest version
# Restart Docker
```

### Priority 2: Use Docker Compose V2
```bash
# Try with docker compose (no hyphen)
docker compose up -d
docker compose ps
```

### Priority 3: Reinstall Docker Compose
```bash
# Update via Homebrew
brew install docker-compose
brew upgrade docker-compose

# Verify
docker-compose --version
```

---

## Complete Troubleshooting Sequence

### Step 1: Check Current Status

```bash
# Check Docker
docker --version
docker ps

# Check Docker Compose
docker-compose --version
docker compose version
```

### Step 2: Update Docker Desktop

1. Open Docker Desktop
2. Click menu (top-right) → Check for Updates
3. Install if available
4. Restart Docker

### Step 3: Try Docker Compose V2

```bash
# Use docker compose (no hyphen)
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: If V2 Fails, Use V1

```bash
# Update docker-compose
brew install docker-compose

# Try again
docker-compose up -d

# Check status
docker-compose ps
```

### Step 5: If Still Failing, Reset Docker

```bash
# Kill Docker
killall Docker 2>/dev/null
killall com.docker.hyperkit 2>/dev/null
killall vpnkit 2>/dev/null

# Wait
sleep 10

# Start Docker
open /Applications/Docker.app

# Wait for full startup
sleep 90

# Try again
docker compose up -d
```

### Step 6: Verify Services

```bash
# Check services
docker compose ps

# Check app
curl http://localhost:3000/health

# Check individual services
docker compose exec postgres psql -U postgres -c "SELECT 1"
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
docker compose exec redis redis-cli ping
```

---

## Quick Fix Commands

### For Docker Compose V2 Users
```bash
docker compose down 2>/dev/null
docker compose up -d
sleep 30
docker compose ps
curl http://localhost:3000/health
```

### For Docker Compose V1 Users
```bash
docker-compose down 2>/dev/null
docker-compose up -d
sleep 30
docker-compose ps
curl http://localhost:3000/health
```

### For Complete Reset
```bash
# Kill Docker
killall Docker 2>/dev/null
sleep 10

# Start Docker
open /Applications/Docker.app
sleep 90

# Start services
docker compose up -d
sleep 30

# Verify
docker compose ps
curl http://localhost:3000/health
```

---

## Verification Checklist

After running the fix, verify:

- [ ] `docker --version` shows version
- [ ] `docker ps` shows containers
- [ ] `docker compose ps` shows all services as "healthy"
- [ ] `curl http://localhost:3000/health` returns JSON
- [ ] PostgreSQL: `docker compose exec postgres psql -U postgres -c "SELECT 1"`
- [ ] MongoDB: `docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"`
- [ ] Redis: `docker compose exec redis redis-cli ping`
- [ ] RabbitMQ: `curl -u guest:guest http://localhost:15672/api/overview`

---

## Common Issues & Solutions

### Issue 1: API Version Mismatch
**Error**: `request returned Internal Server Error for API route and version`
**Solution**: Update Docker Desktop or use `docker compose` (V2)

### Issue 2: docker compose command not found
**Error**: `command not found: docker compose`
**Solution**: Install: `brew install docker-compose`

### Issue 3: Services won't start
**Error**: Services show "Exited" status
**Solution**: Check logs: `docker compose logs <service-name>`

### Issue 4: Port already in use
**Error**: `bind: address already in use`
**Solution**: Kill process: `lsof -ti:3000 | xargs kill -9`

### Issue 5: Connection refused
**Error**: `curl: (7) Failed to connect to localhost port 3000`
**Solution**: Wait for services to start: `sleep 30`

---

## Diagnostic Commands

```bash
# Check Docker daemon
docker ps

# Check Docker Compose version
docker-compose --version
docker compose version

# Check services
docker compose ps

# Check logs
docker compose logs -f

# Check specific service
docker compose logs postgres
docker compose logs mongodb
docker compose logs redis
docker compose logs rabbitmq
docker compose logs app

# Check network
docker network ls
docker network inspect atlanticfrewaycard_default

# Check volumes
docker volume ls

# Check images
docker images
```

---

## If All Else Fails

### Complete System Reset

```bash
# 1. Stop everything
docker compose down -v 2>/dev/null
docker system prune -a --volumes 2>/dev/null

# 2. Kill Docker
killall Docker 2>/dev/null
killall com.docker.hyperkit 2>/dev/null
killall vpnkit 2>/dev/null

# 3. Wait
sleep 10

# 4. Start Docker
open /Applications/Docker.app

# 5. Wait for full startup
sleep 90

# 6. Verify Docker
docker ps

# 7. Start services
docker compose up -d

# 8. Wait
sleep 30

# 9. Check status
docker compose ps

# 10. Test
curl http://localhost:3000/health
```

---

## Documentation References

### For Docker Issues
- **DOCKER_API_FIX.md** - Docker API version fix
- **DOCKER_STARTUP.md** - Docker startup guide
- **TROUBLESHOOTING_DOCKER.md** - Docker troubleshooting

### For Setup Issues
- **MANUAL_STARTUP.md** - Manual startup procedures
- **QUICK_FIX_GUIDE.md** - Quick fixes

### For Understanding
- **WEEK1_ARCHITECTURE.md** - System architecture
- **WEEK1_IMPLEMENTATION_GUIDE.md** - Implementation details

### For Navigation
- **DOCUMENTATION_INDEX.md** - Documentation guide
- **START_HERE.md** - Quick start

---

## What to Do Now

1. **Update Docker Desktop** (if available)
2. **Try**: `docker compose up -d`
3. **Check**: `docker compose ps`
4. **Test**: `curl http://localhost:3000/health`

If that doesn't work:
1. **Try**: `docker-compose up -d` (with hyphen)
2. **If fails**: Run complete reset sequence above

---

## Support Resources

### Quick Help
- DOCKER_API_FIX.md
- QUICK_FIX_GUIDE.md
- TROUBLESHOOTING_DOCKER.md

### Detailed Help
- MANUAL_STARTUP.md
- WEEK1_STARTUP_GUIDE.md
- DOCUMENTATION_INDEX.md

### Understanding
- WEEK1_ARCHITECTURE.md
- WEEK1_IMPLEMENTATION_GUIDE.md

---

**Status**: Ready for troubleshooting
**Next**: Follow the solution priority above
**Expected**: All services running and healthy within 5-10 minutes
