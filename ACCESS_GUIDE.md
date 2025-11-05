# 🌐 Atlanticfreway Access Guide

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database
psql $DATABASE_URL -f database/migrations/003_waitlist.sql

# 3. Start server
npm run dev

# Server will start at http://localhost:3000
```

---

## 📍 All Access Points

### 🏠 Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| **Landing Page** | http://localhost:3000 | Coming soon page with waitlist form |
| **Admin Dashboard** | http://localhost:3000/admin/waitlist.html | View waitlist signups & stats |
| **API Documentation** | http://localhost:3000/api-docs | Swagger API docs |

---

### 🔌 API Endpoints

#### Waitlist API
```bash
# Add email to waitlist
POST http://localhost:3000/api/waitlist
Content-Type: application/json

{
  "email": "user@example.com"
}

# Get all waitlist entries (admin)
GET http://localhost:3000/api/waitlist

# Get statistics
GET http://localhost:3000/api/waitlist/stats
```

#### Business APIs (v1)
```bash
POST http://localhost:3000/api/v1/business/companies
POST http://localhost:3000/api/v1/business/employees
POST http://localhost:3000/api/v1/business/cards/corporate
GET  http://localhost:3000/api/v1/business/expenses
```

#### Personal APIs (v1)
```bash
POST http://localhost:3000/api/v1/personal/cards/virtual
POST http://localhost:3000/api/v1/personal/wallet/crypto
POST http://localhost:3000/api/v1/personal/kyc
```

#### Shared APIs (v1)
```bash
POST http://localhost:3000/api/v1/shared/auth/login
GET  http://localhost:3000/api/v1/shared/transactions
GET  http://localhost:3000/api/v1/shared/health
```

---

## 🎯 Testing the Waitlist Feature

### 1. Submit Email (Frontend)
1. Open: http://localhost:3000
2. Enter email in form
3. Click "Notify Me"
4. See success message

### 2. Submit Email (API)
```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. View Admin Dashboard
1. Open: http://localhost:3000/admin/waitlist.html
2. See all signups
3. View statistics
4. Export CSV

### 4. Check Database
```bash
psql $DATABASE_URL -c "SELECT * FROM waitlist ORDER BY created_at DESC;"
```

---

## 📊 Admin Dashboard Features

**URL:** http://localhost:3000/admin/waitlist.html

**Features:**
- ✅ Real-time statistics (Total, Today, This Week)
- ✅ View all waitlist entries
- ✅ Export to CSV
- ✅ Auto-refresh every 30 seconds
- ✅ Email addresses with timestamps
- ✅ IP tracking and user agent

**Actions:**
- 🔄 Refresh - Reload data
- 📥 Export CSV - Download all emails
- ✉️ Email All - Coming soon

---

## 🗂️ File Structure

```
Atlanticfrewaycard/
├── public/
│   ├── index.html              # Landing page ✅
│   ├── admin/
│   │   └── waitlist.html       # Admin dashboard ✅
│   ├── logo.svg
│   ├── banner.svg
│   └── favicon.svg
├── src/
│   └── routes/
│       └── waitlist.js         # Waitlist API ✅
├── database/
│   └── migrations/
│       └── 003_waitlist.sql    # Database schema ✅
└── server.js                   # Main server ✅
```

---

## 🔐 Database Schema

### Waitlist Table
```sql
CREATE TABLE waitlist (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    source VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP,
    status VARCHAR(20)
);
```

### Admin Activity Table
```sql
CREATE TABLE admin_activity (
    id UUID PRIMARY KEY,
    activity_type VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP
);
```

---

## 📧 Email Notifications

Currently, emails are stored in database. To receive email notifications:

### Option 1: View Admin Dashboard
- Check http://localhost:3000/admin/waitlist.html regularly

### Option 2: Database Query
```bash
# Get new signups from last hour
psql $DATABASE_URL -c "
  SELECT email, created_at 
  FROM waitlist 
  WHERE created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC;
"
```

### Option 3: Add Email Service (Future)
See `GOOGLE_FORM_SETUP.md` for Nodemailer integration

---

## 🧪 Testing Checklist

- [ ] Landing page loads at http://localhost:3000
- [ ] Waitlist form submits successfully
- [ ] Email saved to database
- [ ] Admin dashboard shows entry
- [ ] Statistics update correctly
- [ ] CSV export works
- [ ] API endpoints respond correctly

---

## 🚨 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Use different port
PORT=3001 npm run dev
```

### Database connection error
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Waitlist form not working
1. Check browser console for errors
2. Verify server is running
3. Check database migration ran
4. Test API directly with curl

---

## 📞 Support

**Email:** diamondman1960@gmail.com

**Documentation:**
- README.md - Project overview
- IMPROVEMENT_TASKS.md - Development tasks
- GOOGLE_FORM_SETUP.md - Alternative setup

---

## 🎉 Quick Demo

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@atlanticfreway.com"}'

# Browser: View results
open http://localhost:3000/admin/waitlist.html
```

---

**Last Updated:** 2024
**Version:** 1.0.0
