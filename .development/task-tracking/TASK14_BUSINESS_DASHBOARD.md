# Task 14: Business Dashboard Implementation

**Status**: 🚀 IN PROGRESS
**Priority**: High
**Assignee**: Frontend Team
**Modules**: `frontend/app/business`, `src/routes/business.js`

## 🎯 Objective
Build the corporate-facing dashboard for business clients to manage expenses, employees, and corporate cards.

## 📋 Sub-Tasks

### 14.1 Layout & Navigation
- [ ] Create `frontend/app/business/layout.tsx`
  - [ ] Implement Sidebar (Overview, Employees, Cards, Settings)
  - [ ] Implement Header (User Profile, Notifications)
  - [ ] Ensure Mobile Responsiveness

### 14.2 Dashboard Overview (Home)
- [ ] Create `frontend/app/business/page.tsx`
  - [ ] Fetch summary statistics (Total Spend, Active Cards, Recent Txns)
  - [ ] Display "Spend vs Budget" Chart
  - [ ] Show "Recent Activity" table

### 14.3 Company Management
- [ ] Create `frontend/app/business/settings/page.tsx`
  - [ ] Implement form to update Company Details
  - [ ] Implement "Add Funds" functionality (Mock/Stripe integration point)

### 14.4 Employee Management
- [ ] Create `frontend/app/business/employees/page.tsx`
  - [ ] List all employees with pagination
  - [ ] "Add Employee" Modal (POST `/api/v1/business/employees`)
  - [ ] "Edit Employee" Slide-over

### 14.5 Corporate Card Management
- [ ] Create `frontend/app/business/cards/page.tsx`
  - [ ] List all issued corporate cards
  - [ ] "Issue Card" Modal (POST `/api/v1/business/cards/corporate`)
  - [ ] Card Details View (Freeze/Unfreeze, View PIN)

### 14.6 Spending Controls
- [ ] Create `frontend/app/business/controls/page.tsx` or Modal
  - [ ] Implement Spend Limits (Daily, Monthly)
  - [ ] Implement Category Restrictions (MCC Codes)

## 🔗 API Dependencies
- `GET /business/expenses` (Dashboard)
- `POST /business/employees` (Employee Mgmt)
- `POST /business/cards/corporate` (Card Issuance)
- `PUT /business/cards/:id/controls` (Controls)

## ✅ Success Criteria
- [ ] Admin can view total spend.
- [ ] Admin can add a new employee.
- [ ] Admin can issue a virtual card to an employee.
- [ ] UI handles 401/403 errors gracefully (redirects to login).
