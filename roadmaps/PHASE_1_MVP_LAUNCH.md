# Phase 1 MVP Launch Roadmap

This document tracks the detailed implementation progress for the initial MVP launch on Render.com.

## Phase 1: Authentication & User Journey [x]
- [x] **Consolidate Login/Register**
  - [x] Verify `frontend/app/auth/login/page.tsx` exists and has both login/register options.
  - [x] Check Social Login UI (placeholders present).
- [x] **Implement Real Registration**
  - [x] Wire up `frontend/app/auth/register/page.tsx` to `POST /api/v1/auth/register`.
  - [x] Ensure token is saved to `localStorage` or cookie on success.
  - [x] Redirect to Dashboard on success.
- [x] **Fix Auth Gaps**
  - [x] Ensure `frontend/components/layout/DashboardShell.tsx` checks for auth token.
  - [x] Redirect unauthenticated users to `/auth/login`.

## Phase 2: Landing Page & Navigation [x]
- [x] **Modernize Navbar**
  - [x] Update `frontend/components/landing/ModernLayout.tsx`.
  - [x] Add "Products" dropdown (Virtual Cards, Physical Cards, API).
  - [x] Add "Solutions" dropdown (Expense Management, Payroll, Crypto).
  - [x] Ensure "Sign In" and "Launch Console" buttons are prominent.
- [x] **Enhance Landing Page Content**
  - [x] Verify "Instant Sandbox" CTA exists.
  - [x] Check for "Issuance Specifications" section (technical details).

## Phase 3: Dashboard & Stability [x]
- [x] **Dashboard Layout**
  - [x] Verify Sidebar navigation links (Overview, Transactions, Cards, etc.) work.
  - [x] Ensure "Sandbox Mode" indicator is visible.
- [x] **Stability Polish**
  - [x] Run `npm run lint` and fix high-priority styling/code issues.
  - [x] Ensure no broken links in the new Navbar/Footer.
  - [x] Type-safe API Client updates.

## Phase 4: Visual Polish [x]
- [x] **Hero Updates**
  - [x] Replace "v2.0 Infrastructure Live" with "instant access available...".
- [x] **Theme Update**
  - [x] Change landing page color to grey (zinc palette).
- [x] **Navbar Refinement**
  - [x] Limit to 2 dropdowns (Products, Solutions).
  - [x] Replace "A" logo with standard Card Icon.

## Phase 5: Functional Depth & Integrations [x]
- [x] **Authentication Completeness**
  - [x] Implement "Forgot Password" flow (Frontend + Backend).
  - [x] Implement "Social Auth" (Google/GitHub UI).
- [x] **Functional Connections**
  - [x] Connect "Contact Sales" to a form/email endpoint.
  - [x] Wire up "Start Your Trial" to the registration flow (verify context passing).

## Phase 6: Deployment & Infrastructure [x]
- [x] **Infrastructure Hardening**
  - [x] Consolidate Real Test Keys into `RENDER_COPY_PASTE.env`.
  - [x] Sync local `.env` with production keys.
- [x] **Production Deployment Prep**
  - [x] Verify build artifacts (`npm run start`).
  - [x] Prepare `render.yaml` configuration.

## Next Steps (Post-Launch)
- [ ] Monitor Render deployment.
- [ ] Configure custom domain.
- [ ] Set up SendGrid in production.
- [ ] Begin AWS migration (Tier 2 Roadmap).
