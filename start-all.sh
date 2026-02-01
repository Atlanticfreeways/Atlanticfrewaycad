#!/bin/bash

# Kill any existing processes on ports 3000 and 3001
echo "🧹 Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Install concurrently if not present (optional, but good for unified view)
# We will just run in background with wait for simplicity and robustness

echo "🚀 Starting Atlantic Freeway Services..."

# 1. Start Backend (Port 3000)
echo "📦 Starting Backend on port 3000..."
export PORT=3000
# Using node directly to avoid nodemon permission issues
node server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   -> Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for Backend to be healthy..."
max_retries=30
count=0
while ! curl -s http://localhost:3000/health > /dev/null; do
    sleep 1
    count=$((count+1))
    if [ $count -ge $max_retries ]; then
        echo "❌ Backend failed to start. Check logs/backend.log"
        cat logs/backend.log
        kill $BACKEND_PID
        exit 1
    fi
    echo -n "."
done
echo " ✅ Backend Online!"

# 2. Start Frontend (Port 3001)
echo "💻 Starting Frontend on port 3001..."
cd frontend
# Force port 3001 for Next.js
npm run dev -- -p 3001 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   -> Frontend PID: $FRONTEND_PID"

echo "✅ All Systems Operational!"
echo "   - Backend API: http://localhost:3000"
echo "   - Frontend UI: http://localhost:3001"
echo ""
echo "📝 Logs are being written to logs/backend.log and logs/frontend.log"
echo "Press CTRL+C to stop all services."

# Trap SIGINT to kill web servers
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
