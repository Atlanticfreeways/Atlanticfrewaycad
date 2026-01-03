#!/bin/bash

# Atlanticfrewaycard - Complete Startup Script
# Starts both backend and frontend with automatic port detection

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Better port detection using Python
find_available_port() {
  python3 << EOF
import socket
start_port = $1
for port in range(start_port, start_port + 100):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind(('localhost', port))
        s.close()
        print(port)
        break
    except OSError:
        continue
EOF
}

main() {
  print_header "Atlanticfrewaycard Platform Startup"
  
  # Check prerequisites
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
  fi
  print_success "Node.js found: $(node --version)"
  
  if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
  fi
  print_success "npm found: $(npm --version)"
  
  # Find available ports
  print_info "Detecting available ports..."
  BACKEND_PORT=$(find_available_port 3000)
  FRONTEND_PORT=$(find_available_port $((BACKEND_PORT + 1)))
  
  print_success "Backend port: $BACKEND_PORT"
  print_success "Frontend port: $FRONTEND_PORT"
  
  # Check directories
  if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found"
    exit 1
  fi
  
  # Install dependencies
  if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install > /dev/null 2>&1
    print_success "Backend dependencies installed"
  fi
  
  if [ ! -d "frontend/node_modules" ]; then
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install > /dev/null 2>&1
    cd ..
    print_success "Frontend dependencies installed"
  fi
  
  # Create .env files
  if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cat > .env << EOF
PORT=$BACKEND_PORT
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/atlanticfrewaycard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGINS=http://localhost:$FRONTEND_PORT
MARQETA_API_KEY=your-api-key
MARQETA_API_SECRET=your-api-secret
MARQETA_BASE_URL=https://sandbox-api.marqeta.com
LOG_LEVEL=info
EOF
    print_success ".env file created"
  fi
  
  if [ ! -f "frontend/.env.local" ]; then
    print_info "Creating frontend .env.local file..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT/api/v1
EOF
    print_success "Frontend .env.local file created"
  fi
  
  print_header "Starting Services"
  
  # Start backend
  print_info "Starting backend on port $BACKEND_PORT..."
  PORT=$BACKEND_PORT npm run dev > backend.log 2>&1 &
  BACKEND_PID=$!
  print_success "Backend started (PID: $BACKEND_PID)"
  
  sleep 2
  
  # Start frontend
  print_info "Starting frontend on port $FRONTEND_PORT..."
  cd frontend
  PORT=$FRONTEND_PORT npm run dev > ../frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
  print_success "Frontend started (PID: $FRONTEND_PID)"
  
  sleep 2
  
  print_header "Services Running"
  print_success "Backend: http://localhost:$BACKEND_PORT"
  print_success "Frontend: http://localhost:$FRONTEND_PORT"
  print_success "API: http://localhost:$BACKEND_PORT/api/v1"
  print_success "API Docs: http://localhost:$BACKEND_PORT/api-docs"
  
  print_info "Backend logs: tail -f backend.log"
  print_info "Frontend logs: tail -f frontend.log"
  print_info "Stop services: kill $BACKEND_PID $FRONTEND_PID"
  
  echo "$BACKEND_PID" > .backend.pid
  echo "$FRONTEND_PID" > .frontend.pid
  
  print_header "Ready for Development"
  print_success "All services are running!"
  
  wait $BACKEND_PID $FRONTEND_PID
}

main "$@"
