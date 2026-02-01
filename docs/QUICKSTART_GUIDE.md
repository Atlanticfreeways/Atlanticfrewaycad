# 🚀 Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Node.js 20+ installed
- Terminal access

## Step 1: Start Infrastructure (2 minutes)

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Verify services are running
docker-compose ps
```

Expected output: All services should show "Up (healthy)"

## Step 2: Initialize Database (1 minute)

```bash
# Run migrations
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -f /docker-entrypoint-initdb.d/001_enhanced_schema.sql
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -f /docker-entrypoint-initdb.d/002_kyc_tiers.sql
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -f /docker-entrypoint-initdb.d/003_event_audit.sql
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -f /docker-entrypoint-initdb.d/004_partner_affiliate_schema.sql

# Verify tables created
docker-compose exec postgres psql -U postgres -d atlanticfrewaycard -c "\dt"
```

## Step 3: Install Dependencies (2 minutes)

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

## Step 4: Start Backend (30 seconds)

```bash
# Start backend server
npm run dev
```

Backend should start on http://localhost:3000

## Step 5: Start Frontend (30 seconds)

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend should start on http://localhost:3001

## Step 6: Test the Application

### Test Backend API
```bash
# Health check
curl http://localhost:3000/health

# Test Marqeta connection
curl -X GET \
  -H 'Content-Type: application/json' \
  --user 09fad57c-cbf8-497f-9f15-ae2bf53b1a2c:fa2dbbc3-c031-47f8-91f5-9e65be443dad \
  'https://sandbox-api.marqeta.com/v3/cardproducts?count=1'
```

### Access Dashboard
Open browser: http://localhost:3001/dashboard

## Troubleshooting

### Docker containers not starting
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### Database connection errors
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port already in use
```bash
# Change ports in docker-compose.yml or stop conflicting services
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
```

## Services Overview

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:3000 | - |
| Frontend | http://localhost:3001 | - |
| PostgreSQL | localhost:5432 | postgres/password |
| Redis | localhost:6379 | - |
| RabbitMQ UI | http://localhost:15672 | guest/guest |
| MongoDB | localhost:27017 | - |

## Next Steps

1. Create a test user via API
2. Issue a test card
3. View dashboard with real data
4. Test card operations

## Complete Setup Time: ~6 minutes
