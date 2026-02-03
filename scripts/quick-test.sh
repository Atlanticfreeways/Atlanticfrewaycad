#!/bin/bash

# Quick Test Script - Atlantic Freeway Card Enterprise Features
# This script tests the newly implemented pages

echo "🧪 Testing Atlantic Freeway Card - Enterprise Features"
echo "======================================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}ℹ️  Backend Status:${NC}"
echo "Checking health endpoint..."
curl -s $BASE_URL/health || echo "❌ Backend not running!"
echo ""
echo ""

echo -e "${BLUE}📋 Available Endpoints:${NC}"
echo ""
echo "User Profile:"
echo "  GET  /api/v1/users/profile - Fetch user profile"
echo "  PATCH /api/v1/users/profile - Update profile"
echo ""
echo "Privacy & GDPR:"
echo "  GET  /api/v1/users/privacy/data-export - Export all data"
echo "  POST /api/v1/users/privacy/delete-request - Request deletion"
echo "  GET  /api/v1/users/privacy/deletion-status - Check status"
echo ""
echo "Notifications:"
echo "  GET  /api/v1/notifications - List notifications"
echo "  GET  /api/v1/notifications/unread-count - Unread count"
echo "  PATCH /api/v1/notifications/:id/read - Mark as read"
echo "  DELETE /api/v1/notifications/:id - Delete notification"
echo ""
echo "Team Management (Business Only):"
echo "  GET  /api/v1/business/team - List team members"
echo "  POST /api/v1/business/team/invite - Invite member"
echo "  PATCH /api/v1/business/team/:id/role - Update role"
echo "  DELETE /api/v1/business/team/:id - Remove member"
echo ""
echo "Audit Logs (Admin Only):"
echo "  GET  /api/v1/admin/audit-logs - List logs"
echo "  GET  /api/v1/admin/audit-logs/export - Export CSV"
echo "  GET  /api/v1/admin/audit-logs/stats - Get statistics"
echo ""
echo ""

echo -e "${BLUE}🌐 Frontend Pages (localhost:3001):${NC}"
echo ""
echo "General Pages:"
echo "  • /profile - User Profile"
echo "  • /settings - Account Settings (5 tabs)"
echo "  • /settings/privacy - GDPR Privacy Controls"
echo "  • /notifications - Notification Center"
echo "  • /help - Help Center & FAQ"
echo "  • /reports - Analytics Dashboard"
echo ""
echo "Business Pages:"
echo "  • /business/team - Team Management"
echo ""
echo "Admin Pages:"
echo "  • /admin/audit-logs - Security Audit Logs"
echo ""
echo ""

echo -e "${BLUE}🔑 To Test APIs:${NC}"
echo ""
echo "1. First, login to get a JWT token:"
echo '   TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"email":"your@email.com","password":"yourpassword"}'"'"' \'
echo '     | grep -o '"'"'"token":"[^"]*"'"'"' | cut -d'"'"'":"'"'"' -f2 | tr -d '"'"'"'"'"')'
echo ""
echo "2. Then test an endpoint:"
echo '   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/users/profile'
echo ""
echo ""

echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Backend: http://localhost:3000 (Running)"
echo "Frontend: Start with 'cd frontend && npm run dev'"
echo ""
