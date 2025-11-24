#!/bin/bash

echo "🔧 Atlanticfrewaycard Startup Fix Script"
echo "=========================================="

# Kill process on port 3000
echo "1️⃣  Killing process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   No process found on port 3000"

# Stop Docker services
echo "2️⃣  Stopping Docker services..."
docker-compose down 2>/dev/null || echo "   Docker services not running"

# Wait a moment
sleep 2

# Remove old volumes (optional - comment out to keep data)
# echo "3️⃣  Removing old volumes..."
# docker-compose down -v

# Start Docker services
echo "3️⃣  Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "4️⃣  Waiting for services to be ready (30 seconds)..."
sleep 30

# Check service status
echo "5️⃣  Checking service status..."
docker-compose ps

# Verify health
echo "6️⃣  Verifying health endpoint..."
curl -s http://localhost:3000/health | head -c 100
echo ""

echo ""
echo "✅ Startup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev"
echo ""
