# 🔐 Render Environment Variables Setup Guide

## Quick Copy-Paste for Render Dashboard

When deploying to Render, you'll need to set these environment variables in the Render Dashboard under **Environment** → **Secret Files** or **Environment Variables**.

---

## ✅ Auto-Generated Secure Keys (Ready to Use)

### JWT Secrets
```
JWT_SECRET=ebHlAhGPt0mtlfRT+5YKG5PYyX30VoPE4Xbgl9g7n4w=
JWT_REFRESH_SECRET=p9fqHoVruiBfCGlqk5vPdTNA9/Txo2CKI5iY4/UKn20=
```

### Webhook Secrets
```
MARQETA_WEBHOOK_SECRET=ab99b98fb6ac96f001e55c03e93e75e3c2239e34d54fd0e647ef208c73675923
STRIPE_WEBHOOK_SECRET=whsec_711d861083d7952eff61a8652b8743489f5c21f5ae1f3a7465efb2f0b331063b
```

---

## 🔑 API Keys You Need to Obtain

### 1. Stripe Identity (KYC) - **PRE-FILLED**
**Get Test Keys**: Pre-filled with `sk_test_51Sy1...`

```
STRIPE_SECRET_KEY=sk_test_51Sy1...
STRIPE_PUBLISHABLE_KEY=pk_test_51Sy1...
```

**Setup Webhook**:
1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://your-app.onrender.com/webhooks/kyc/stripe`
3. Select events: `identity.verification_session.*`
4. Copy the webhook signing secret

---

### 2. Marqeta (Card Issuing) - **REQUIRED**
**Sign up**: https://www.marqeta.com/company/contact

**Get Sandbox Credentials**: https://www.marqeta.com/docs/developer-guides/core-api-quick-start

```
MARQETA_APP_TOKEN=[YOUR_APP_TOKEN]
MARQETA_ADMIN_TOKEN=[YOUR_ADMIN_TOKEN]
```

---

### 3. Paystack (Payments) - **PRE-FILLED**
**Get Test Keys**: Pre-filled with `sk_test_...` (Found in project)

```
PAYSTACK_SECRET_KEY=b1f2e...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

---

### 4. NOWPayments (Crypto) - **OPTIONAL**
**Sign up**: https://nowpayments.io/

**Get Sandbox API Key**: https://account.nowpayments.io/settings/api-keys

```
NOWPAYMENTS_API_KEY=[YOUR_API_KEY]
NOWPAYMENTS_IPN_SECRET=[YOUR_IPN_SECRET]
```

---

### 5. SendGrid (Email) - **OPTIONAL** (for production)
**Sign up**: https://signup.sendgrid.com/

**Get API Key**: https://app.sendgrid.com/settings/api_keys

```
SENDGRID_API_KEY=SG.[YOUR_KEY_HERE]
```

---

## 📋 Complete Environment Variables for Render

Copy this entire block and paste into Render's environment variable section:

```bash
# Security (Generated - Ready to Use)
JWT_SECRET=ebHlAhGPt0mtlfRT+5YKG5PYyX30VoPE4Xbgl9g7n4w=
JWT_REFRESH_SECRET=p9fqHoVruiBfCGlqk5vPdTNA9/Txo2CKI5iY4/UKn20=
MARQETA_WEBHOOK_SECRET=ab99b98fb6ac96f001e55c03e93e75e3c2239e34d54fd0e647ef208c73675923
STRIPE_WEBHOOK_SECRET=whsec_711d861083d7952eff61a8652b8743489f5c21f5ae1f3a7465efb2f0b331063b

# Stripe Identity (Replace with your test keys)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Marqeta (Replace with your sandbox credentials)
MARQETA_APP_TOKEN=YOUR_APP_TOKEN_HERE
MARQETA_ADMIN_TOKEN=YOUR_ADMIN_TOKEN_HERE

# Paystack (Replace with your test keys)
PAYSTACK_SECRET_KEY=sk_test_YOUR_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_test_YOUR_KEY_HERE

# NOWPayments (Optional - Replace if using crypto)
NOWPAYMENTS_API_KEY=YOUR_API_KEY_HERE
NOWPAYMENTS_IPN_SECRET=YOUR_IPN_SECRET_HERE

# SendGrid (Optional - Replace if using email)
SENDGRID_API_KEY=SG.YOUR_KEY_HERE
FROM_EMAIL=noreply@atlanticfrewaycard.com
```

---

## 🚀 Deployment Checklist

- [ ] Sign up for Stripe and get test API keys
- [ ] Sign up for Marqeta and get sandbox credentials
- [ ] Sign up for Paystack and get test API keys
- [ ] (Optional) Sign up for NOWPayments
- [ ] (Optional) Sign up for SendGrid
- [ ] Copy all environment variables to Render Dashboard
- [ ] Deploy the application
- [ ] Test KYC flow with Stripe Identity
- [ ] Test card issuance with Marqeta
- [ ] Test payments with Paystack

---

## ⚠️ Important Notes

1. **All keys above are TEST/SANDBOX keys** - Do not use production keys yet
2. **JWT secrets are pre-generated** - You can use them as-is for testing
3. **Webhook secrets are pre-generated** - Configure them in your provider dashboards
4. **Never commit these keys to Git** - They're in `.env.render.test` which should be gitignored
5. **Database and Redis** - Automatically configured by Render Blueprint

---

## 🔄 Next Steps After Deployment

1. Configure Stripe webhook endpoint in Stripe Dashboard
2. Configure Marqeta webhook endpoint in Marqeta Dashboard
3. Configure Paystack webhook endpoint in Paystack Dashboard
4. Test the complete user flow:
   - User registration
   - KYC verification
   - Card issuance
   - Wallet funding
   - Transactions
