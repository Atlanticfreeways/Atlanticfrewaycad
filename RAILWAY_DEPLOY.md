# 🚂 Railway Deployment Guide

**No Credit Card Required** ✅  
**Always On** (No Sleep) ✅  
**Deploy Time**: 5 minutes

---

## Quick Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --database postgres

# Add Redis
railway add --database redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
railway variables set LOG_LEVEL=info

# Deploy
railway up

# Get your URL
railway status
```

---

## Your Live API

After deployment, your API will be at:
`https://atlanticfrewaycard-api.railway.app`

**Endpoints**:
- Health: `/health`
- CSRF Token: `/api/v1/csrf-token`
- Register: `/api/v1/auth/register`
- Login: `/api/v1/auth/login`

---

## Update ALLOWED_ORIGINS

After getting your URL:
```bash
railway variables set ALLOWED_ORIGINS=https://your-app.railway.app
```

---

## Useful Commands

```bash
railway logs          # View logs
railway status        # Check status
railway open          # Open dashboard
railway up            # Redeploy
railway variables     # View env vars
```

---

## Cost

**Free Tier**: $5 credit/month  
**Your app usage**: ~$4.50/month  
**No card required** ✅

---

**Ready to deploy!** 🚀
