# Next Tasks - Atlantic Freeway Card Platform

## 🎯 Current Status

### ✅ Completed (Last Session - 2026-02-03)
- Password change functionality
- API key management system
- Reports with real transaction data
- Error handling & loading states
- Toast notification system
- Skeleton loaders
- All database migrations executed

### 📊 Completion Stats
- **Backend Routes**: 15+ endpoints implemented
- **Frontend Pages**: 8 enterprise pages functional
- **Database**: All 8 migrations applied
- **Code Quality**: Production-ready

---

## 📋 Immediate Next Tasks (No External Dependencies)

### 1. **Form Validation** (2-3 hours)
**Why**: Improve UX with real-time validation
**Tasks**:
- [ ] Install Zod validation library (`npm install zod`)
- [ ] Create validation schemas for:
  - [ ] User profile form
  - [ ] Password change form
  - [ ] API key generation form
  - [ ] Team invitation form
- [ ] Add inline error messages
- [ ] Disable submit buttons until valid
- [ ] Frontend validation before API calls

**Files to Update**:
- `/frontend/app/settings/page.tsx`
- `/frontend/app/business/team/page.tsx`
- `/frontend/app/profile/page.tsx`

---

### 2. **Mobile Responsive Design** (3-4 hours)
**Why**: Make the app usable on mobile devices
**Tasks**:
- [ ] Update sidebar to use hamburger menu on mobile
- [ ] Make charts responsive on small screens
- [ ] Fix table layouts for mobile
- [ ] Add touch-friendly button sizes
- [ ] Test on viewport sizes: 375px, 768px, 1024px

**Files to Update**:
- `/frontend/components/layout/DashboardShell.tsx`
- `/frontend/app/reports/page.tsx`
- `/frontend/app/notifications/page.tsx`
- Global CSS for mobile breakpoints

---

### 3. **Profile Page Enhancement** (1-2 hours)
**Why**: Add skeletons and error handling to profile
**Tasks**:
- [ ] Add `ProfileSkeleton` while loading
- [ ] Add `ErrorDisplay` with retry
- [ ] Add toast feedback on profile update
- [ ] Show success message on save
- [ ] Optimistic UI updates

**Files to Update**:
- `/frontend/app/profile/page.tsx`

---

### 4. **Help Center Content** (1-2 hours)
**Why**: Add real FAQ content
**Tasks**:
- [ ] Replace placeholder FAQ items with real questions
- [ ] Add FAQ for password reset
- [ ] Add FAQ for API key usage
- [ ] Add FAQ for GDPR data export
- [ ] Add FAQ for team management
- [ ] Update contact information

**Files to Update**:
- `/frontend/app/help/page.tsx`

---

### 5. **API Key Usage Middleware** (2-3 hours)
**Why**: Allow authentication via API keys
**Tasks**:
- [ ] Create `/src/middleware/apiKeyAuth.js`
- [ ] Check for `X-API-Key` header
- [ ] Validate key hash against database
- [ ] Update `last_used_at` timestamp
- [ ] Populate `req.user` from key owner
- [ ] Add to rate limiting
- [ ] Create audit log entry

**Files to Create**:
- `/src/middleware/apiKeyAuth.js`

**Routes to Protect**:
- Transactions API
- Cards API
- Reports API (allow API key access)

---

### 6. **CSV Export for Reports** (2-3 hours)
**Why**: Allow users to export data
**Tasks**:
- [ ] Install `json2csv` library
- [ ] Create CSV export endpoint in reports route
- [ ] Generate CSV from transaction data
- [ ] Add "Download CSV" button to reports page
- [ ] Set proper headers for download

**Files to Update**:
- `/src/routes/v1/reports.js`
- `/frontend/app/reports/page.tsx`

---

### 7. **Audit Logs Export to CSV** (1 hour)
**Why**: Already implemented backend, just hook up frontend
**Tasks**:
- [ ] Add loading state to export button
- [ ] Show toast on export start
- [ ] Handle download in browser
- [ ] Error handling if export fails

**Files to Update**:
- `/frontend/app/admin/audit-logs/page.tsx`

---

### 8. **Notification Preferences** (2-3 hours)
**Why**: Settings page has placeholder for notifications
**Tasks**:
- [ ] Add `notification_preferences` JSONB column to `users`
- [ ] Create GET/PATCH endpoints for preferences
- [ ] Update Settings → Notifications tab
- [ ] Save preferences (email, push, in-app toggles)
- [ ] Apply preferences when creating notifications

**Files to Create**:
- `/src/routes/v1/users/preferences.js`

**Files to Update**:
- `/frontend/app/settings/page.tsx` (Notifications tab)
- Database migration for preferences

---

### 9. **Team Member Roles Management** (1-2 hours)
**Why**: Backend exists, frontend needs dropdown
**Tasks**:
- [ ] Add role dropdown to team members list
- [ ] Show current role
- [ ] Allow role change with confirmation
- [ ] Toast feedback on update
- [ ] Disable for non-admins

**Files to Update**:
- `/frontend/app/business/team/page.tsx`

---

### 10. **Transaction History Page** (3-4 hours)
**Why**: Core feature - view all transactions
**Tasks**:
- [ ] Create `/frontend/app/transactions/page.tsx`
- [ ] Fetch from `/api/v1/transactions` endpoint (already exists)
- [ ] Display in table with:
  - Merchant name
  - Amount
  - Date/time
  - Status (approved/declined)
  - MCC category
- [ ] Add filters: date range, status, amount range
- [ ] Add pagination (20 per page)
- [ ] Add search by merchant
- [ ] Skeleton loader while fetching
- [ ] Error handling with retry

**Files to Create**:
- `/frontend/app/transactions/page.tsx`

---

## 🔐 Tasks Requiring External APIs (Future)

### 11. **Email Service Integration** (3-4 hours)
**Requires**: SendGrid API key
**Tasks**:
- [ ] Install `@sendgrid/mail`
- [ ] Create email templates for:
  - Team invitations
  - Password change confirmation
  - Account deletion confirmation
  - Security alerts
- [ ] Update team invite to send email
- [ ] Update password change to send email

---

### 12. **Two-Factor Authentication (2FA)** (4-5 hours)
**Requires**: TOTP library (no external API needed!)
**Tasks**:
- [ ] Install `speakeasy` for TOTP
- [ ] Add `two_factor_secret` column to users
- [ ] Create 2FA enable endpoint
  - Generate secret
  - Return QR code
  - Store encrypted secret
- [ ] Create 2FA verify endpoint
- [ ] Create 2FA disable endpoint
- [ ] Require 2FA code on login if enabled
- [ ] Generate backup codes

**Actually No External API Needed!** Can implement with `speakeasy` library

---

### 13. **Real-Time Notifications (Socket.io)** (3-4 hours)
**No External API Needed!**
**Tasks**:
- [ ] Setup Socket.io server
- [ ] Connect client in layout
- [ ] Emit notification on creation
- [ ] Update notifications count in real-time
- [ ] Show toast on new notification arrival
- [ ] Add connection status indicator

---

## 🎨 UI/UX Enhancements (Nice to Have)

### 14. **Dark/Light Mode Toggle** (2-3 hours)
- [ ] Add theme context
- [ ] Create toggle component
- [ ] Update CSS variables for light mode
- [ ] Store preference in localStorage
- [ ] Add smooth transition

### 15. **Keyboard Shortcuts** (2-3 hours)
- [ ] Add keyboard shortcut library
- [ ] ?` for help dialog
- [ ] `/` for search
- [ ] `g + n` for notifications
- [ ] `g + s` for settings
- [ ] Show shortcuts in help

### 16. **Advanced Filters for Reports** (2-3 hours)
- [ ] Add merchant search/filter
- [ ] Add amount range slider
- [ ] Add category multi-select
- [ ] Add card filter (if multiple cards)
- [ ] Add "Compare periods" feature

---

## 🧪 Testing & Quality

### 17. **Backend API Testing** (4-5 hours)
- [ ] Install Jest and Supertest
- [ ] Write tests for:
  - Password change endpoint
  - API key generation
  - Reports endpoint
  - Notifications CRUD
- [ ] Mock database calls
- [ ] Test error scenarios
- [ ] Test validation

### 18. **Frontend Component Testing** (4-5 hours)
- [ ] Install React Testing Library
- [ ] Write tests for:
  - Settings page forms
  - API key generation
  - Notifications list
  - Reports charts
- [ ] Test loading states
- [ ] Test error states
- [ ] Test user interactions

### 19. **E2E Testing** (5-6 hours)
- [ ] Install Playwright
- [ ] Write E2E tests for:
  - Login → View Profile
  - Generate API Key
  - Change Password
  - View Reports
  - Mark Notifications as Read

---

## 📦 Deployment & DevOps

### 20. **Production Environment Setup** (3-4 hours)
- [ ] Set up Railway/Render/Vercel accounts
- [ ] Configure production DATABASE_URL
- [ ] Set up Redis for sessions
- [ ] Configure environment variables
- [ ] Run migrations on production DB

### 21. **CI/CD Pipeline** (3-4 hours)
- [ ] Create GitHub Actions workflow
- [ ] Run tests on PR
- [ ] Lint check
- [ ] Build check
- [ ] Auto-deploy on main branch merge

### 22. **Monitoring & Logging** (3-4 hours)
- [ ] Set up Sentry for error tracking
- [ ] Add structured logging (Winston)
- [ ] Set up DataDog/LogRocket (optional)
- [ ] Create alerts for errors
- [ ] Monitor API response times

---

## 📝 Documentation

### 23. **API Documentation** (3-4 hours)
- [ ] Install Swagger/OpenAPI
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Add authentication section
- [ ] Add error codes reference
- [ ] Generate  Postman collection

### 24. **User Guide** (2-3 hours)
- [ ] Write user guide for Settings
- [ ] Write guide for API keys
- [ ] Write guide for Teams
- [ ] Write guide for GDPR
- [ ] Add screenshots

---

## 🎯 Recommended Order

**This Week (High Priority)**:
1. Form Validation
2. Mobile Responsive
3. Profile Page Enhancement
4. API Key Usage Middleware
5. Transaction History Page

**Next Week (Medium Priority)**:
6. CSV Export for Reports
7. Notification Preferences
8. 2FA Implementation (no external API!)
9. Socket.io Real-time (no external API!)
10. Help Center Content

**Following Weeks (Nice to Have)**:
11. Dark mode
12. Keyboard shortcuts
13. Advanced filters
14. Testing suite
15. Deployment

---

## 💡 Quick Wins (< 1 hour each)

- [ ] Add favicon and app icon
- [ ] Update page titles (SEO)
- [ ] Add meta descriptions
- [ ] Fix console warnings/errors
- [ ] Add loading spinners to all buttons
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add "Copy" buttons for API keys/IDs
- [ ] Add last login timestamp to profile
-[ ] Add created date to profile
- [ ] Show API key usage count

---

## 🚀 Summary

**Total Remaining Tasks**: ~24 tasks
**Estimated Time**: 40-60 hours of development
**No External API Tasks**: 10+ tasks ready now
**Requires External APIs**: 2 tasks (Email, nothing else!)

**Priority Focus:**
1. Form validation (better UX)
2. Mobile responsiveness (accessibility)
3. Transaction history (core feature)
4. 2FA (security enhancement, no external API needed!)
5. Real-time notifications (Socket.io, no external API!)

You have a solid foundation. Most remaining work is polish, testing, and deployment! 🎉
