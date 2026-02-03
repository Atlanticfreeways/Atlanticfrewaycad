#!/bin/bash

# Backend API Testing Script
# Tests all newly created API endpoints

API_URL="${API_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-}"

echo "🧪 Testing Atlantic Freeway Card Backend APIs"
echo "API URL: $API_URL"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ $http_code -ge 200 ] && [ $http_code -lt 300 ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Check if token is set
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No TOKEN set. Please export TOKEN variable or login first.${NC}"
    echo "Example: export TOKEN=\$(curl -s -X POST $API_URL/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password\"}' | jq -r '.token')"
    echo ""
fi

echo ""
echo "📋 User Profile API"
test_endpoint "GET" "/api/v1/users/profile" "Fetch user profile"
test_endpoint "PATCH" "/api/v1/users/profile" "Update user profile" '{"full_name":"Test User","phone":"+1234567890"}'

echo ""
echo "🔒 Privacy & GDPR API"
test_endpoint "GET" "/api/v1/users/privacy/data-export" "Export user data"
test_endpoint "POST" "/api/v1/users/privacy/delete-request" "Create deletion request" '{"reason":"Testing"}'
test_endpoint "GET" "/api/v1/users/privacy/deletion-status" "Check deletion status"

echo ""
echo "🔔 Notifications API"
test_endpoint "GET" "/api/v1/notifications" "List notifications"
test_endpoint "GET" "/api/v1/notifications?type=security" "Filter notifications by type"
test_endpoint "GET" "/api/v1/notifications/unread-count" "Get unread count"

echo ""
echo "👥 Team Management API"
test_endpoint "GET" "/api/v1/business/team" "List team members"
test_endpoint "POST" "/api/v1/business/team/invite" "Invite team member" '{"email":"new@example.com","role":"viewer"}'

echo ""
echo "🛡️  Admin Audit Logs API"
test_endpoint "GET" "/api/v1/admin/audit-logs" "List audit logs"
test_endpoint "GET" "/api/v1/admin/audit-logs?action=profile_update" "Filter logs by action"
test_endpoint "GET" "/api/v1/admin/audit-logs/stats" "Get audit stats"

echo ""
echo "=========================================="
echo "Testing complete!"
