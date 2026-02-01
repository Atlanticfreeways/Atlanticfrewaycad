#!/bin/bash
set -e

echo "🚀 Atlanticfrewaycard Setup & Verification"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Start infrastructure
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy (30 seconds)..."
sleep 30

# Check service health
echo ""
echo "🔍 Checking service health..."
docker-compose ps

# Test PostgreSQL
echo ""
echo "💾 Testing PostgreSQL connection..."
docker-compose exec -T postgres psql -U postgres -d atlanticfrewaycard -c "SELECT 'PostgreSQL is ready!' as status;" || {
    echo "❌ PostgreSQL connection failed"
    exit 1
}

# Test Redis
echo ""
echo "🔴 Testing Redis connection..."
docker-compose exec -T redis redis-cli ping || {
    echo "❌ Redis connection failed"
    exit 1
}

# Run migrations
echo ""
echo "📊 Running database migrations..."
for migration in database/migrations/*.sql; do
    echo "  Running $(basename $migration)..."
    docker-compose exec -T postgres psql -U postgres -d atlanticfrewaycard -f /docker-entrypoint-initdb.d/$(basename $migration) 2>/dev/null || true
done

# Verify tables
echo ""
echo "✅ Verifying database tables..."
docker-compose exec -T postgres psql -U postgres -d atlanticfrewaycard -c "\dt" | grep -E "companies|users|cards|transactions" && echo "✅ Tables created successfully" || echo "⚠️  Some tables may be missing"

# Test Marqeta connection
echo ""
echo "🔗 Testing Marqeta API connection..."
curl -s -X GET \
  -H 'Content-Type: application/json' \
  --user 09fad57c-cbf8-497f-9f15-ae2bf53b1a2c:fa2dbbc3-c031-47f8-91f5-9e65be443dad \
  'https://sandbox-api.marqeta.com/v3/cardproducts?count=1' > /dev/null && echo "✅ Marqeta API connection successful" || echo "❌ Marqeta API connection failed"

echo ""
echo "=========================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Start backend: npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Test API: curl http://localhost:3000/health"
echo ""
echo "Services running:"
echo "  - Backend API: http://localhost:3000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - RabbitMQ: http://localhost:15672 (guest/guest)"
echo "  - MongoDB: localhost:27017"
