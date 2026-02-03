# Next Steps: Running & Testing the Complete System

## 🎯 Overview

You now have a fully integrated system with:
- ✅ 8 frontend pages (Settings, Privacy, Notifications, Profile, Team, Audit Logs, Help, Reports)
- ✅ 10 backend API endpoints (User, Privacy, Notifications, Team, Audit Logs)
- ✅ 4 database migrations ready to run
- ✅ Complete GDPR compliance features

## 🚀 Quick Start (5 Steps)

### Step 1: Run Database Migrations

```bash
# Navigate to project directory
cd "/Users/machine/My Drive/Github Projects/Atlanticfrewaycard"

# Check your DATABASE_URL
echo $DATABASE_URL
# Should output something like: postgresql://user:pass@localhost:5432/atlantic

# Run all migrations in order
psql "$DATABASE_URL" -f database/migrations/005_notifications_table.sql
psql "$DATABASE_URL" -f database/migrations/006_api_keys_table.sql
psql "$DATABASE_URL" -f database/migrations/007_user_profile_extensions.sql
psql "$DATABASE_URL" -f database/migrations/008_account_deletions.sql

# Verify tables were created
psql "$DATABASE_URL" -c "\dt"
```

**Expected output:** You should see `notifications`, `user_api_keys`, and `account_deletion_requests` tables listed.

---

### Step 2: Restart Backend Server

```bash
# Stop current server (Ctrl+C if running)

# Start server
npm run dev

# Or if you prefer
node server.js

# Server should start on port 3000
```

**Expected output:**
```
Server running on port 3000
Database connected
Redis connected
```

---

### Step 3: Start Frontend

Open a new terminal:

```bash
cd "/Users/machine/My Drive/Github Projects/Atlanticfrewaycard/frontend"

# Install dependencies if needed
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
✓ Ready on http://localhost:3001
```

---

### Step 4: Test Backend APIs

```bash
# In another terminal, get an auth token first
# (Login with your test user)
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Export token for test script
export TOKEN

# Run API tests
./scripts/test-apis.sh
```

**Expected output:** All tests should show green checkmarks ✓

---

### Step 5: Test Frontend Pages

Visit these URLs in your browser:

1. **Profile:** http://localhost:3001/profile
   - Should display your user info, KYC tier, monthly limits

2. **Settings:** http://localhost:3001/settings
   - Try updating your name and phone
   - Click "Save Changes" - should see success message

3. **Privacy:** http://localhost:3001/settings/privacy
   - Click "Request Data Export" - should download JSON file
   - Open file - should contain your user data

4. **Notifications:** http://localhost:3001/notifications
   - Should show notification list (may be empty initially)
   - Test filters: All, Transaction, Security, KYC, System

5. **Team Management:** http://localhost:3001/business/team
   - (Business accounts only)
   - Try inviting a team member

6. **Audit Logs:** http://localhost:3001/admin/audit-logs
   - (Admin accounts only)
   - Should show recent actions
   - Try exporting to CSV

7. **Help Center:** http://localhost:3001/help
   - View FAQ, contact options

8. **Reports:** http://localhost:3001/reports
   - View spending charts and analytics

---

## 🧪 Manual Testing Checklist

### Profile Management
- [ ] Profile page loads without errors
- [ ] User data displays correctly
- [ ] Edit profile button navigates to settings
- [ ] KYC tier badge shows correct color

### Settings & Privacy
- [ ] Settings tabs all render correctly
- [ ] Account tab: Name/phone can be edited and saved
- [ ] Account tab: Email is read-only
- [ ] Privacy tab: Data export downloads valid JSON
- [ ] Privacy tab: Account deletion shows confirmation

### Notifications
- [ ] Notifications list displays
- [ ] Unread count shows in header
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Filters work (all types)
- [ ] "Mark All as Read" works

### Business Features
- [ ] Team list displays members
- [ ] Invite form sends invitation
- [ ] Role dropdown updates correctly
- [ ] Remove member works

### Admin Features
- [ ] Audit logs display with data
- [ ] Filters work (action, user, date)
- [ ] CSV export downloads
- [ ] Statistics show correctly

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" on API calls

**Cause:** JWT token is missing or invalid

**Fix:**
```javascript
// In browser console, check token
localStorage.getItem('token')

// If null, login again
// Navigate to /login
```

---

### Issue: "CORS" errors in browser console

**Cause:** Frontend URL not whitelisted in CORS config

**Fix:**
```javascript
// Check config/corsConfig.js
// Should include: http://localhost:3001
```

---

### Issue: "Cannot read property 'map' of undefined"

**Cause:** API returned null/undefined data

**Fix:**
- Check backend logs for errors
- Verify migrations ran successfully
- Check database has data

---

### Issue: Database migrations fail

**Cause:** Wrong DATABASE_URL or tables already exist

**Fix:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Drop tables if needed
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS notifications CASCADE;"
# Then re-run migration
```

---

## 📊 Expected API Responses

### GET /api/v1/users/profile
```json
{
  "success": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "kyc_tier": "standard",
    "monthly_limit": 50000,
    "monthly_spent": 5000,
    "account_type": "personal",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/notifications
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif-123",
      "type": "transaction",
      "title": "Card Purchase",
      "message": "Transaction at Amazon for $25.99",
      "read_at": null,
      "created_at": "2024-02-03T18:00:00Z",
      "data": {"amount": 25.99}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

## 🎨 UI Screenshots Expected

### Profile Page
- Gradient hero card with user avatar
- KYC tier badge (colored by tier)
- Personal info grid (email, phone, member since)
- Monthly limit progress

### Settings Page
- Left sidebar with 5 tabs
- Account tab with editable fields
- Security tab with password/2FA options
- Privacy tab with export/delete buttons

### Notifications Page
- Filter buttons at top (All, Transaction, Security, etc.)
- Notification cards with icons
- Unread badge in header
- Mark as read / delete buttons

---

## ✅ Success Criteria

All of these should work:

- [ ] All 8 pages load without errors
- [ ] Backend returns 200 status codes for all endpoints
- [ ] Database migrations completed
- [ ] Profile updates persist
- [ ] Data export downloads valid JSON
- [ ] Notifications can be marked as read
- [ ] Audit logs display admin actions
- [ ] No console errors in browser

---

## 📝 Next Development Tasks

After testing, consider implementing:

1. **Real-time Notifications**
   - Socket.io integration for live updates
   - Browser notifications API

2. **Email Service**
   - SendGrid integration for team invitations
   - Deletion confirmation emails

3. **API Keys System**
   - Generate/revoke API keys
   - Key usage tracking

4. **Advanced Reports**
   - Connect to real transaction data
   - Add date range filters
   - Export to PDF

5. **2FA Implementation**
   - TOTP generation
   - QR code display
   - Backup codes

---

## 🆘 Need Help?

If something doesn't work:

1. Check backend logs: `tail -f logs/app.log`
2. Check browser console for errors
3. Run API test script: `./scripts/test-apis.sh`
4. Verify migrations: `psql $DATABASE_URL -c "\dt"`
5. Check INTEGRATION_SUMMARY.md for detailed troubleshooting

---

**Ready?** Start with Step 1 above! 🚀
