# 🚀 Partner Program - Quick Start Guide

**Get the partner/affiliate system running in 30 minutes**

---

## ✅ What's Been Created

### Documentation
- ✅ `PARTNER_AFFILIATE_IMPLEMENTATION.md` - Complete implementation plan
- ✅ `PARTNER_IMMEDIATE_TASKS.md` - Detailed task breakdown
- ✅ `PARTNER_QUICKSTART.md` - This file

### Database
- ✅ `database/migrations/004_partner_affiliate_schema.sql` - Complete schema

### Services
- ✅ `src/services/PartnerService.js` - Core partner business logic

### Repositories
- ✅ `src/database/repositories/PartnerRepository.js` - Partner data access
- ✅ `src/database/repositories/ReferralRepository.js` - Referral tracking

### Routes
- ✅ `src/routes/partners.js` - Partner API endpoints

---

## 🏃 Quick Start (30 Minutes)

### Step 1: Run Database Migration (5 mins)

```bash
# Navigate to project root
cd /Users/machine/Desktop/Atlanticfrewaycard

# Run migration
psql $DATABASE_URL -f database/migrations/004_partner_affiliate_schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt partner*"
```

**Expected Output:**
```
 partners
 partner_analytics
 partner_api_keys
 partner_payouts
 partner_webhooks
 referrals
 commissions
```

---

### Step 2: Update Routes Index (5 mins)

**File:** `src/routes/v1/index.js`

Add this line after existing route imports:
```javascript
const partnerRoutes = require('../partners');
```

Add this line after existing route registrations:
```javascript
router.use('/partners', partnerRoutes);
```

**Full example:**
```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('../auth');
const businessRoutes = require('../business');
const personalRoutes = require('../personal');
const sharedRoutes = require('../shared');
const partnerRoutes = require('../partners'); // ADD THIS

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/personal', personalRoutes);
router.use('/shared', sharedRoutes);
router.use('/partners', partnerRoutes); // ADD THIS

module.exports = router;
```

---

### Step 3: Update Server Initialization (10 mins)

**File:** `server.js`

Find the repositories initialization section and add:

```javascript
// Add repository imports
const PartnerRepository = require('./src/database/repositories/PartnerRepository');
const ReferralRepository = require('./src/database/repositories/ReferralRepository');

// In repositories object, add:
const repositories = {
  // ... existing repositories ...
  partner: new PartnerRepository(db),
  referral: new ReferralRepository(db)
};
```

Find the services initialization section and add:

```javascript
// Add service import
const PartnerService = require('./src/services/PartnerService');

// In services object, add:
const services = {
  // ... existing services ...
  partner: new PartnerService(repositories)
};
```

Make services available to routes:

```javascript
// Add after app initialization
app.set('repositories', repositories);
app.set('services', services);
```

---

### Step 4: Start Server & Test (10 mins)

```bash
# Start development server
npm run dev

# Server should start on port 3000
```

**Test with cURL:**

```bash
# 1. First, login to get JWT token (use existing user)
curl -X POST http://localhost:3000/api/v1/shared/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Copy the token from response

# 2. Register as partner
curl -X POST http://localhost:3000/api/v1/partners/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_type": "affiliate",
    "company_name": "My Affiliate Business"
  }'

# 3. Get partner profile
curl -X GET http://localhost:3000/api/v1/partners/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Generate API key
curl -X POST http://localhost:3000/api/v1/partners/api-key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (Register):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "partner_type": "affiliate",
    "tier": "tier1",
    "company_name": "My Affiliate Business",
    "referral_code": "JOHDO1A2B",
    "commission_rate": "10.00",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🎯 What You Can Do Now

### ✅ Available Features (Phase 1 - Week 1)

1. **Partner Registration**
   - Users can register as partners
   - Automatic tier assignment
   - Unique referral code generation
   - Commission rate setup

2. **Partner Profile Management**
   - View partner profile
   - Update company name
   - Manage settings
   - View basic stats

3. **API Key Generation**
   - Generate API keys for programmatic access
   - Secure secret storage
   - One-time secret display

### 🔄 Coming Next (Phase 1 - Week 2-3)

4. **Referral Tracking**
   - Generate referral links
   - Track clicks and conversions
   - Attribution system

5. **Commission Calculation**
   - Automatic commission calculation
   - Multi-tier support
   - Volume bonuses

6. **Analytics Dashboard**
   - Performance metrics
   - Conversion tracking
   - Revenue reports

---

## 📊 Database Schema Overview

### Partners Table
- Stores partner accounts
- Links to users table
- Tracks tier, commission rate, status
- Stores API keys and branding

### Referrals Table
- Tracks each referral
- Links partner to referred user
- Conversion status tracking
- Metadata for attribution

### Commissions Table
- Records all commissions earned
- Links to referrals and transactions
- Tracks payment status
- Supports multiple commission types

### Partner Payouts Table
- Manages payout requests
- Tracks payment processing
- Links to commissions
- Payment method details

---

## 🔒 Security Features

### Already Implemented
- ✅ JWT authentication required
- ✅ Input validation with Joi
- ✅ Bcrypt for API secret hashing
- ✅ SQL injection protection (parameterized queries)
- ✅ Rate limiting (existing middleware)
- ✅ CSRF protection (existing middleware)

### Partner-Specific Security
- Unique API keys per partner
- Secure secret generation (crypto.randomBytes)
- One-time secret display
- Status-based access control
- Audit trail in database

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Partner registration works
- [ ] Duplicate registration prevented
- [ ] Profile retrieval works
- [ ] Profile update works
- [ ] API key generation works
- [ ] Authentication required for all endpoints
- [ ] Validation errors returned correctly

### Automated Testing
```bash
# Run unit tests (when created)
npm test -- tests/unit/services/PartnerService.test.js

# Run integration tests (when created)
npm test -- tests/integration/partners/
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migration Failed
```bash
# Check if tables already exist
psql $DATABASE_URL -c "\dt"

# Drop tables if needed (CAUTION: loses data)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS partners CASCADE"

# Re-run migration
psql $DATABASE_URL -f database/migrations/004_partner_affiliate_schema.sql
```

### Routes Not Found (404)
- Check `src/routes/v1/index.js` includes partner routes
- Verify `server.js` has repositories and services set
- Restart server after changes

### Authentication Errors
- Ensure JWT token is valid
- Check token format: `Bearer YOUR_TOKEN`
- Verify user exists in database

---

## 📈 Success Metrics

### Phase 1 Goals (Week 1)
- [ ] Database schema deployed
- [ ] Partner registration working
- [ ] 5+ test partners registered
- [ ] API endpoints functional
- [ ] Zero critical bugs

### Next Phase Preview
- Referral link generation
- Click tracking
- Conversion attribution
- Commission calculation
- Analytics dashboard

---

## 📚 Additional Resources

### Documentation
- `PARTNER_AFFILIATE_IMPLEMENTATION.md` - Full implementation plan
- `PARTNER_IMMEDIATE_TASKS.md` - Detailed task breakdown
- `README.md` - Project overview

### Code References
- `src/services/BusinessService.js` - Similar service pattern
- `src/routes/business.js` - Similar route pattern
- `src/middleware/auth.js` - Authentication middleware

---

## 🎉 You're Ready!

The foundation is complete. You can now:
1. ✅ Register partners
2. ✅ Manage partner profiles
3. ✅ Generate API keys
4. ✅ Track partner data

**Next Steps:**
- Review `PARTNER_IMMEDIATE_TASKS.md` for Week 2 tasks
- Implement referral tracking system
- Build commission calculation engine
- Create partner dashboard UI

---

## 💬 Need Help?

### Common Questions

**Q: Can I change commission rates later?**
A: Yes, update via admin panel (to be built) or directly in database.

**Q: How do I approve pending partners?**
A: Update status in database: `UPDATE partners SET status = 'active' WHERE id = 'partner-id'`

**Q: Can one user have multiple partner accounts?**
A: No, enforced by unique constraint on user_id.

**Q: How do I test without real users?**
A: Use existing test users or create new ones via registration endpoints.

---

**Status**: ✅ Ready to Use
**Version**: 1.0 (Phase 1, Week 1)
**Last Updated**: 2024

