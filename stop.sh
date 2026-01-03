#!/bin/bash

# Atlanticfrewaycard - Stop Script
# Stops both backend and frontend services

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

main() {
  print_header "Stopping Atlanticfrewaycard Services"
  
  # Stop backend
  if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
      print_info "Stopping backend (PID: $BACKEND_PID)..."
      kill $BACKEND_PID
      sleep 1
      print_success "Backend stopped"
      rm .backend.pid
    else
      print_error "Backend process not found"
      rm .backend.pid
    fi
  else
    print_error "Backend PID file not found"
  fi
  
  # Stop frontend
  if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
      print_info "Stopping frontend (PID: $FRONTEND_PID)..."
      kill $FRONTEND_PID
      sleep 1
      print_success "Frontend stopped"
      rm .frontend.pid
    else
      print_error "Frontend process not found"
      rm .frontend.pid
    fi
  else
    print_error "Frontend PID file not found"
  fi
  
  print_header "All Services Stopped"
  print_success "Cleanup complete"
}

main "$@"
