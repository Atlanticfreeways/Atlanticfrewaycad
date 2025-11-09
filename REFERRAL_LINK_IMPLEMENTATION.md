# 🔗 Referral Link Implementation

**Create working referral links tagged to user's username**

---

## 🎯 Goal

Enable users to generate unique referral links like:
- `https://atlanticfrewaycard.com/ref/JOHN123`
- `https://atlanticfrewaycard.com/ref/MARY456`

When someone clicks the link and signs up, the referrer gets credit.

---

## 📋 Implementation Tasks

### ✅ TASK 1: Create Referral Tracking Route (15 min)

**File**: `src/routes/referral.js`

```javascript
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

// Track referral click
router.get('/:code', asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  // Store in cookie for 30 days
  res.cookie('ref_code', code, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  
  // Track click in database (if available)
  if (req.repositories?.referral) {
    try {
      const partner = await req.repositories.partner.findByReferralCode(code);
      if (partner) {
        await req.repositories.referral.create({
          partner_id: partner.id,
          referral_code: code,
          status: 'pending',
          metadata: {
            ip: req.ip,
            user_agent: req.get('user-agent'),
            timestamp: new Date()
          }
        });
      }
    } catch (err) {
      // Silent fail - don't block redirect
    }
  }
  
  // Redirect to homepage
  res.redirect('/?ref=' + code);
}));

module.exports = router;
```

---

### ✅ TASK 2: Update Server to Handle Referral Routes (5 min)

**File**: `server.js`

Add after other route imports:
```javascript
const referralRoutes = require('./src/routes/referral');
```

Add before other routes:
```javascript
app.use('/ref', referralRoutes);
```

---

### ✅ TASK 3: Track Referral on User Registration (10 min)

**File**: `src/routes/auth.js` (or wherever registration happens)

Add to registration handler:
```javascript
// After user is created
const refCode = req.cookies.ref_code;
if (refCode && req.repositories?.referral) {
  try {
    const partner = await req.repositories.partner.findByReferralCode(refCode);
    if (partner) {
      await req.repositories.referral.markConverted(
        /* referral_id from pending record */,
        newUser.id
      );
    }
  } catch (err) {
    // Silent fail
  }
}
```

---

### ✅ TASK 4: Update Partner Dashboard to Show Link (5 min)

**File**: `public/partner-dashboard.html`

Already implemented! The dashboard shows:
```javascript
document.getElementById('referralLink').textContent = 
  `https://atlanticfrewaycard.com/ref/${data.referral_code}`;
```

---

### ✅ TASK 5: Add Referral Code to Registration Pages (5 min)

**Files**: `public/business/register.html`, `public/personal/register.html`

Add hidden field:
```html
<input type="hidden" id="refCode" name="ref_code">

<script>
// Get ref code from URL or cookie
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref') || getCookie('ref_code');
if (refCode) {
  document.getElementById('refCode').value = refCode;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
</script>
```

---

## 🚀 Quick Start (40 minutes total)

### Step 1: Create referral route file
```bash
# Create the file
touch src/routes/referral.js
# Copy code from TASK 1 above
```

### Step 2: Update server.js
```bash
# Add 2 lines to server.js (see TASK 2)
```

### Step 3: Test it
```bash
# Start server
npm run dev

# Test referral link
curl -L http://localhost:3000/ref/TEST123
# Should redirect to homepage with cookie set
```

---

## 🔍 How It Works

### Flow:
1. Partner gets code: `JOHN123`
2. Partner shares: `https://site.com/ref/JOHN123`
3. User clicks → Cookie stored for 30 days
4. User registers → Referral tracked
5. Partner gets credit

### Cookie-Based Tracking:
- **Duration**: 30 days
- **Secure**: HttpOnly, Secure in production
- **Fallback**: URL parameter if cookies disabled

---

## ✅ Success Criteria

After implementation:
- [ ] `/ref/CODE` redirects to homepage
- [ ] Cookie `ref_code` is set
- [ ] Partner dashboard shows working link
- [ ] Registration captures referral code
- [ ] Database tracks referrals (when DB connected)

---

## 🎯 Start Here

**Priority Order:**
1. Create `src/routes/referral.js` (TASK 1)
2. Update `server.js` (TASK 2)
3. Test with `curl` or browser
4. Add to registration forms (TASK 5)
5. Connect to database when ready (TASK 3)

**Estimated Time**: 40 minutes
**Difficulty**: Easy
**Dependencies**: None (works without database)

---

## 📝 Notes

- Works immediately without database
- Database connection adds tracking
- Cookie-based = works across sessions
- 30-day attribution window
- Silent failures = never breaks user flow

---

**Status**: Ready to implement
**Files to create**: 1 (`src/routes/referral.js`)
**Files to modify**: 1 (`server.js`)
