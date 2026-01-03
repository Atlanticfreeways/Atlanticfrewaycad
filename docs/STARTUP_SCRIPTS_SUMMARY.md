# 🚀 Atlanticfrewaycard - Startup Scripts Summary

## Files Created

### 1. `start.sh` - Main Startup Script
**Purpose**: Start both backend and frontend with automatic port detection

**Features**:
- ✅ Automatic port detection (finds free ports)
- ✅ Dependency installation
- ✅ Environment file creation
- ✅ Parallel service startup
- ✅ Colored output
- ✅ PID file management
- ✅ Log file creation

**Usage**:
```bash
chmod +x start.sh
./start.sh
```

### 2. `stop.sh` - Stop Script
**Purpose**: Cleanly stop both services

**Features**:
- ✅ Graceful shutdown
- ✅ PID-based process termination
- ✅ Cleanup of PID files
- ✅ Error handling

**Usage**:
```bash
chmod +x stop.sh
./stop.sh
```

### 3. `STARTUP_GUIDE.md` - Comprehensive Guide
**Purpose**: Complete startup documentation

**Includes**:
- ✅ Quick start instructions
- ✅ Prerequisites
- ✅ Installation steps
- ✅ Environment setup
- ✅ Multiple startup methods
- ✅ Port detection explanation
- ✅ Access points
- ✅ Development commands
- ✅ Database setup
- ✅ Troubleshooting
- ✅ Docker setup
- ✅ Performance tips

---

## Quick Start

### Single Command (Recommended)
```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Start both services
./start.sh

# Stop both services
./stop.sh
```

### What Happens
1. ✅ Checks Node.js and npm
2. ✅ Detects available ports (3000, 3001)
3. ✅ Installs dependencies if needed
4. ✅ Creates .env files if needed
5. ✅ Starts backend on detected port
6. ✅ Starts frontend on detected port
7. ✅ Displays access URLs
8. ✅ Saves PIDs for easy cleanup

---

## Port Detection

### Automatic
```bash
./start.sh
# Automatically finds free ports and configures both services
```

### Manual
```bash
# Backend on custom port
PORT=4000 npm run dev

# Frontend on custom port
cd frontend
PORT=4001 npm run dev
```

---

## Access Points

After running `./start.sh`:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000/api/v1 |
| API Docs | http://localhost:3000/api-docs |
| Business Dashboard | http://localhost:3001/business |
| Personal Dashboard | http://localhost:3001/personal |
| Admin Dashboard | http://localhost:3001/admin |

---

## Common Commands

```bash
# Start everything
./start.sh

# Stop everything
./stop.sh

# View backend logs
tail -f backend.log

# View frontend logs
tail -f frontend.log

# Run tests
npm test

# Build for production
npm run build

# Check API health
curl http://localhost:3000/api/v1/health
```

---

## Environment Files

### Backend (.env)
Created automatically with:
- PORT (auto-detected)
- DATABASE_URL
- REDIS_URL
- JWT secrets
- Marqeta credentials
- Logging configuration

### Frontend (.env.local)
Created automatically with:
- NEXT_PUBLIC_API_URL (points to backend)

---

## Troubleshooting

### Port Already in Use
```bash
# start.sh automatically finds next available port
./start.sh

# Or manually check
lsof -i :3000
```

### Dependencies Missing
```bash
# start.sh automatically installs dependencies
./start.sh

# Or manually
npm install
cd frontend && npm install
```

### Database Connection Error
```bash
# Ensure databases are running
# PostgreSQL, MongoDB, Redis, RabbitMQ
```

---

## Features

### start.sh
- ✅ Automatic port detection
- ✅ Dependency installation
- ✅ Environment setup
- ✅ Parallel startup
- ✅ Colored output
- ✅ Error handling
- ✅ Log file creation
- ✅ PID management

### stop.sh
- ✅ Graceful shutdown
- ✅ Process cleanup
- ✅ PID file removal
- ✅ Error handling

### STARTUP_GUIDE.md
- ✅ Complete documentation
- ✅ Multiple startup methods
- ✅ Troubleshooting guide
- ✅ Docker setup
- ✅ Performance tips
- ✅ Quick reference

---

## Single Command Usage

```bash
# Everything in one command
./start.sh

# This will:
# 1. Check prerequisites
# 2. Find available ports
# 3. Install dependencies
# 4. Create environment files
# 5. Start backend
# 6. Start frontend
# 7. Display URLs
# 8. Show logs location
```

---

## File Locations

```
Atlanticfrewaycard/
├── start.sh              # Main startup script
├── stop.sh               # Stop script
├── STARTUP_GUIDE.md      # This guide
├── .env                  # Backend config (auto-created)
├── .backend.pid          # Backend PID (auto-created)
├── .frontend.pid         # Frontend PID (auto-created)
├── backend.log           # Backend logs (auto-created)
├── frontend.log          # Frontend logs (auto-created)
├── frontend/
│   └── .env.local        # Frontend config (auto-created)
└── ...
```

---

## Next Steps

1. ✅ Make scripts executable: `chmod +x start.sh stop.sh`
2. ✅ Run startup: `./start.sh`
3. ✅ Access frontend: http://localhost:3001
4. ✅ Check API: http://localhost:3000/api/v1/health
5. ✅ View logs: `tail -f backend.log` and `tail -f frontend.log`
6. ✅ Stop services: `./stop.sh`

---

**Ready to start!** 🚀
