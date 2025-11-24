# 🚀 START HERE - Week 1 Quick Start

## Current Issues & Solutions

Based on your terminal output, here are the exact commands to fix everything:

---

## ⚠️ Issue 1: Port 3000 Already in Use

**Your Error**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix** (run this first):
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Verify it's killed
lsof -i :3000
# Should return nothing
```

---

## ⚠️ Issue 2: Docker Services Not Starting

**Your Error**:
```
Error response from daemon: manifest for mongo:7: net/http: TLS handshake timeout
```

**Fix**:
```bash
# Stop all Docker services
docker-compose down

# Wait a moment
sleep 10

# Start services again (usually works on retry)
docker-compose up -d

# Wait for services to be ready
sleep 30

# Check status
docker-compose ps
```

**All services should show "healthy" status**

---

## ✅ Complete Startup Sequence

Run these commands in order:

### 1. Kill Port 3000
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 is free"
```

### 2. Stop Docker
```bash
docker-compose down
```

### 3. Start Docker
```bash
docker-compose up -d
```

### 4. Wait for Services
```bash
sleep 30
```

### 5. Verify Services
```bash
docker-compose ps
```

**Expected output**: All services showing "healthy"

### 6. Start App
```bash
npm run dev
```

### 7. Test Health (in another terminal)
```bash
sleep 5
curl http://localhost:3000/health
```

**Expected response**: JSON with status "healthy"

---

## 🔧 One-Line Fix (Copy & Paste)

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; docker-compose down; docker-compose up -d; sleep 30; docker-compose ps
```

Then in another terminal:
```bash
npm run dev
```

---

## 📋 Verification Checklist

After running the commands above, verify:

```bash
# 1. Check Docker services
docker-compose ps
# All should show "healthy"

# 2. Check PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT 1"
# Should return: 1

# 3. Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }

# 4. Check Redis
docker-compose exec redis redis-cli ping
# Should return: PONG

# 5. Check RabbitMQ
curl -s -u guest:guest http://localhost:15672/api/overview | head -c 50
# Should return JSON

# 6. Check App Health
curl http://localhost:3000/health
# Should return JSON with "status": "healthy"
```

---

## 🎯 Service URLs

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| App | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | postgres/password |
| MongoDB | localhost:27017 | - |
| Redis | localhost:6379 | - |
| RabbitMQ AMQP | localhost:5672 | guest/guest |
| RabbitMQ UI | http://localhost:15672 | guest/guest |

---

## 🆘 If Something Still Doesn't Work

### Option 1: Run the Fix Script
```bash
chmod +x fix-startup.sh
./fix-startup.sh
```

### Option 2: Complete Reset
```bash
# Stop everything
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

### Option 3: Check Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

---

## 📚 Documentation

For more detailed information:

- **Setup Guide**: WEEK1_STARTUP_GUIDE.md
- **Troubleshooting**: TROUBLESHOOTING_DOCKER.md
- **Quick Reference**: QUICK_REFERENCE_WEEK1.md
- **Architecture**: WEEK1_ARCHITECTURE.md
- **Quick Fixes**: QUICK_FIX_GUIDE.md

---

## ✨ What You'll Have After This

✅ PostgreSQL running (port 5432)
✅ MongoDB running (port 27017)
✅ Redis running (port 6379)
✅ RabbitMQ running (port 5672, UI: 15672)
✅ Nginx running (port 80)
✅ Node.js app running (port 3000)
✅ All services healthy and connected

---

## 🎓 Next Steps

1. **Verify everything is working**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Review the implementation**:
   - Read WEEK1_ARCHITECTURE.md
   - Check QUICK_REFERENCE_WEEK1.md

3. **Start Week 2 tasks**:
   - Implement Marqeta API integration
   - Set up async webhook handlers
   - Build Go microservice

---

## 💡 Pro Tips

- Keep `docker-compose logs -f` running in a terminal to see what's happening
- Use `docker-compose ps` to check service status anytime
- Use `curl http://localhost:3000/health` to verify app is ready
- Use `npm run dev` for development (auto-reload on file changes)
- Use `npm start` for production mode

---

## 🚀 Ready?

Run this now:

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; docker-compose down; docker-compose up -d; sleep 30; npm run dev
```

Then in another terminal:
```bash
curl http://localhost:3000/health
```

**You're all set! 🎉**

---

**Status**: Ready to go
**Next**: Week 2 Implementation
**Questions**: Check the documentation files
