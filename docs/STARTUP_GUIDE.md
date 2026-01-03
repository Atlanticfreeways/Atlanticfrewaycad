# 🚀 Atlanticfrewaycard - Startup Guide

## Quick Start (Single Command)

```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Start both backend and frontend
./start.sh

# Stop both services
./stop.sh
```

---

## Prerequisites

### Required
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- PostgreSQL 12+ (for database)
- MongoDB 4+ (for personal data)
- Redis (for caching)
- RabbitMQ (for message queue)

### Optional
- Docker & Docker Compose (for containerized setup)
- Postman (for API testing)

---

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Atlanticfrewaycard
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Setup Environment Variables

**Backend (.env)**
```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/atlanticfrewaycard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGINS=http://localhost:3001
MARQETA_API_KEY=your-api-key
MARQETA_API_SECRET=your-api-secret
MARQETA_BASE_URL=https://sandbox-api.marqeta.com
LOG_LEVEL=info
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Startup Methods

### Method 1: Single Command (Recommended)
```bash
# Start both backend and frontend with automatic port detection
./start.sh

# Stop both services
./stop.sh
```

### Method 2: Manual Backend
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Method 3: Production Build
```bash
# Build backend
npm run build

# Build frontend
cd frontend
npm run build
cd ..

# Start production
npm start
```

### Method 4: Docker Compose
```bash
# Start all services (backend, frontend, databases)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Port Detection

The `start.sh` script automatically:
1. Checks if ports 3000 and 3001 are available
2. Finds next available ports if occupied
3. Configures both services with detected ports
4. Displays URLs for access

### Manual Port Configuration
```bash
# Backend on custom port
PORT=4000 npm run dev

# Frontend on custom port
cd frontend
PORT=4001 npm run dev
```

---

## Access Points

### After Starting Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3001 | User interface |
| Backend API | http://localhost:3000/api/v1 | API endpoints |
| API Docs | http://localhost:3000/api-docs | Swagger documentation |
| Business Dashboard | http://localhost:3001/business | Company admin |
| Personal Dashboard | http://localhost:3001/personal | User dashboard |
| Admin Dashboard | http://localhost:3001/admin | Platform admin |

---

## Development Commands

### Backend
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Database Setup

### PostgreSQL
```bash
# Create database
createdb atlanticfrewaycard

# Run migrations
npm run migrate

# Run all migrations
npm run migrate:all
```

### MongoDB
```bash
# MongoDB should be running on localhost:27017
# Collections will be created automatically
```

### Redis
```bash
# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:latest
```

### RabbitMQ
```bash
# Start RabbitMQ
rabbitmq-server

# Or with Docker
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or let start.sh find available port automatically
./start.sh
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d atlanticfrewaycard

# Check MongoDB is running
mongo

# Check Redis is running
redis-cli ping
```

### Dependencies Not Installed
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port Detection Issues
```bash
# Check which ports are in use
lsof -i -P -n | grep LISTEN

# Manually specify ports
PORT=4000 npm run dev
cd frontend && PORT=4001 npm run dev
```

---

## Logs

### View Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log

# Combined logs
tail -f *.log
```

### Clear Logs
```bash
rm backend.log frontend.log
```

---

## Cleanup

### Stop Services
```bash
# Using stop script
./stop.sh

# Or manually
kill $(cat .backend.pid)
kill $(cat .frontend.pid)
```

### Remove Generated Files
```bash
# Remove PID files
rm .backend.pid .frontend.pid

# Remove logs
rm backend.log frontend.log

# Remove node_modules
rm -rf node_modules frontend/node_modules
```

---

## Docker Setup

### Build Images
```bash
# Build backend image
docker build -t atlanticfrewaycard-backend .

# Build frontend image
cd frontend
docker build -t atlanticfrewaycard-frontend .
cd ..
```

### Run Containers
```bash
# Run backend
docker run -p 3000:3000 atlanticfrewaycard-backend

# Run frontend
docker run -p 3001:3001 atlanticfrewaycard-frontend

# Run with docker-compose
docker-compose up -d
```

---

## Environment Variables Reference

### Backend (.env)
```
PORT=3000                                    # Backend port
NODE_ENV=development                         # Environment
DATABASE_URL=postgresql://...                # PostgreSQL connection
REDIS_URL=redis://localhost:6379             # Redis connection
JWT_SECRET=your-secret-key                   # JWT secret
JWT_REFRESH_SECRET=your-refresh-secret       # JWT refresh secret
ALLOWED_ORIGINS=http://localhost:3001        # CORS origins
MARQETA_API_KEY=your-api-key                 # Marqeta API key
MARQETA_API_SECRET=your-api-secret           # Marqeta API secret
MARQETA_BASE_URL=https://sandbox-api...      # Marqeta base URL
LOG_LEVEL=info                               # Logging level
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1  # Backend API URL
```

---

## Performance Tips

### Optimize Development
```bash
# Use faster builds
npm run dev -- --turbo

# Enable hot reload
npm run dev

# Monitor performance
npm run test -- --coverage
```

### Optimize Production
```bash
# Build with optimizations
npm run build

# Use production environment
NODE_ENV=production npm start

# Enable caching
REDIS_URL=redis://localhost:6379 npm start
```

---

## Support & Help

### Check Status
```bash
# Backend health check
curl http://localhost:3000/api/v1/health

# Frontend status
curl http://localhost:3001
```

### View Documentation
- API Docs: http://localhost:3000/api-docs
- README: ./README.md
- Architecture: ./TECHNICAL_ARCHITECTURE.md

### Common Issues
- Port conflicts: Run `./start.sh` (auto-detects ports)
- Database errors: Check PostgreSQL/MongoDB running
- API errors: Check backend logs with `tail -f backend.log`
- Frontend errors: Check frontend logs with `tail -f frontend.log`

---

## Quick Reference

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

# Access frontend
open http://localhost:3001
```

---

**Ready to start developing!** 🚀
