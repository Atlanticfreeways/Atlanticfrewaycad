# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Heroku (Fastest)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create atlanticfrewaycard-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
heroku config:set ALLOWED_ORIGINS=https://atlanticfrewaycard-api.herokuapp.com
heroku config:set LOG_LEVEL=info

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate

# Open app
heroku open
```

### Option 2: Docker (Local/VPS)

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Option 3: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js atlanticfrewaycard

# Create environment
eb create atlanticfrewaycard-prod

# Deploy
eb deploy

# Open
eb open
```

---

## Environment Setup

### 1. Copy production template
```bash
cp .env.production.example .env.production
```

### 2. Generate secrets
```bash
# JWT secrets
openssl rand -base64 32

# Webhook secret
openssl rand -hex 32
```

### 3. Configure database
- Get PostgreSQL connection string from provider
- Update POSTGRES_* variables
- Enable SSL for production

### 4. Configure Redis
- Get Redis connection string
- Update REDIS_* variables

---

## Database Migration

```bash
# Run migrations
npm run migrate

# Or manually
psql $DATABASE_URL -f database/migrations/001_enhanced_schema.sql
psql $DATABASE_URL -f database/migrations/002_kyc_tiers.sql
psql $DATABASE_URL -f database/migrations/003_event_audit.sql
psql $DATABASE_URL -f database/migrations/003_waitlist.sql
```

---

## Health Check

```bash
# Check API
curl https://your-domain.com/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "postgres": "healthy",
    "redis": "healthy"
  },
  "version": "1.0.0"
}
```

---

## SSL/HTTPS Setup

### Heroku
- Automatic SSL with custom domain
- Add domain: `heroku domains:add app.atlanticfrewaycard.com`

### Docker/VPS
Use Let's Encrypt with Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name api.atlanticfrewaycard.com;

    ssl_certificate /etc/letsencrypt/live/api.atlanticfrewaycard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.atlanticfrewaycard.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring

### Heroku
```bash
# View logs
heroku logs --tail

# Metrics
heroku addons:create papertrail
```

### Docker
```bash
# Logs
docker-compose logs -f

# Stats
docker stats
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "atlanticfrewaycard-api"
          heroku_email: "your-email@example.com"
```

---

## Post-Deployment Checklist

- [ ] Health check returns 200
- [ ] Database connected
- [ ] Redis connected
- [ ] CSRF token endpoint works
- [ ] Authentication works
- [ ] Rate limiting active
- [ ] Logs being written
- [ ] SSL certificate valid
- [ ] Domain configured
- [ ] Monitoring set up

---

## Rollback

### Heroku
```bash
heroku releases
heroku rollback v123
```

### Docker
```bash
docker-compose down
git checkout previous-commit
docker-compose up -d
```

---

## Support

- Health: `GET /health`
- Logs: Check platform logs
- Errors: Check Winston logs in `logs/` directory
