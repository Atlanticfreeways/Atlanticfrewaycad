# 🚀 Deploying to Render

This guide will help you deploy the Atlantic Freeway platform to Render.com using the Blueprint configuration.

## 1. Prerequisites
- A [Render.com](https://render.com) account.
- This repository connected to your Render account.

## 2. Setup Using Blueprint
1. Go to your Render Dashboard.
2. Click **New +** -> **Blueprint**.
3. Select this repository.
4. Render will detect `render.yaml` and prompt you to create the following services:
   - `atlantic-backend` (Web Service)
   - `atlantic-frontend` (Web Service)
   - `atlantic-db` (Postgres)
   - `atlantic-cache` (Redis)

## 3. Environment Variables (Secrets)
Render will ask for values for variables marked `sync: false`. You must provide these.

### 🔑 API Keys Checklist
**GOOD NEWS**: The current build is configured in **Mock Mode**.
You do **NOT** need real keys to deploy and test the application right now. The system will use internal simulators for Plaid, Paystack, and Onfido.

**For Future Production (Real Money):**
When you are ready to switch to real banking, you will need to sign up for these:

#### A. Identity & KYC (Onfido)
- **Sign up**: [onfido.com](https://onfido.com)
- **Variable**: `ONFIDO_API_TOKEN`

#### B. US Banking (Plaid)
- **Sign up**: [plaid.com/dashboard](https://dashboard.plaid.com)
- **Variables**: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`

#### C. Africa Payments (Paystack)
- **Sign up**: [paystack.com](https://paystack.com)
- **Variable**: `PAYSTACK_SECRET_KEY`

#### D. Core Security (REQUIRED)
- **JWT_SECRET**: You MUST set this. Generate: `openssl rand -base64 32`

## 4. Finalizing Deployment
1. Click **Apply**.
2. Render will provision the Database and Redis first.
3. Once the database is ready, the Backend service will build.
4. Finally, the Frontend will build and connect to the Backend.

## ⚠️ Important Note on "Production"
While this deploys a "live" version, **DO NOT** use real money until you:
1. Complete PCI-DSS compliance.
2. switch Plaid/Paystack keys from Sandbox to Live.
3. Enable SSL/TLS (Render handles this automatically).
