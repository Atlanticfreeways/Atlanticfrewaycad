# Railway Deployment Setup

## Required Environment Variables

### Essential (Must Configure)
```bash
# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-refresh-secret>
MARQETA_WEBHOOK_SECRET=<your-webhook-secret>

# CORS (add your Railway domain)
ALLOWED_ORIGINS=https://your-app.railway.app
```

### Database (Add Railway Services)
```bash
# PostgreSQL (Add PostgreSQL service in Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Add Redis service in Railway)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

### Optional (For Full Functionality)
```bash
# Marqeta API
MARQETA_API_KEY=your-api-key
MARQETA_API_SECRET=your-api-secret
MARQETA_BASE_URL=https://sandbox-api.marqeta.com

# Logging
LOG_LEVEL=info
```

## Deployment Steps

1. **Create Railway Project**
   - Go to railway.app
   - Create new project
   - Connect GitHub repository

2. **Add Database Services**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Click "New" → "Database" → "Add Redis"
   - Railway will auto-populate connection variables

3. **Configure Environment Variables**
   - Go to your service → "Variables"
   - Add all required variables from above
   - Use Railway's variable references for databases

4. **Deploy**
   - Push to GitHub or click "Deploy"
   - Railway will build using Dockerfile
   - Healthcheck at `/health` will verify deployment

## Troubleshooting

### Deployment Fails with "Healthcheck failed"
- Check that DATABASE_URL is set correctly
- Verify Redis variables are configured
- Ensure PORT is set to 3000 or Railway's $PORT
- Check logs for database connection errors

### Database Connection Issues
- Verify PostgreSQL service is running
- Check Redis service is running
- Ensure SSL is enabled for production (already configured)

### CORS Errors
- Add your Railway domain to ALLOWED_ORIGINS
- Format: `https://your-app.railway.app`
- Multiple origins: comma-separated

## Health Check

The `/health` endpoint will return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "services": {
    "postgres": "healthy",
    "redis": "healthy"
  },
  "version": "1.0.0"
}
```

Status values:
- `healthy`: Service connected and responding
- `not_initialized`: Service not yet connected
- `unhealthy`: Service connection failed

## Quick Generate Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
