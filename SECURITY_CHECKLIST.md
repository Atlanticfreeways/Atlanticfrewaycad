# 🔒 Security Checklist

## ✅ Current Security Status

### Protected
- ✅ `.env` in `.gitignore`
- ✅ CSRF protection implemented
- ✅ XSS sanitization utilities
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Helmet security headers

### ⚠️ Needs Attention
- ⚠️ Real Marqeta tokens in `.env` file
- ⚠️ No secret scanning in CI
- ⚠️ No dependency vulnerability scanning
- ⚠️ Test coverage only 17.83%

## 🔐 Immediate Actions Required

### 1. Rotate Exposed Credentials
Your current tokens in `.env`:
```
MARQETA_APP_TOKEN=09fad57c-cbf8-497f-9f15-ae2bf53b1a2c
MARQETA_ADMIN_TOKEN=fa2dbbc3-c031-47f8-91f5-9e65be443dad
```

**Action:**
1. Go to Marqeta dashboard
2. Revoke these tokens
3. Generate new tokens
4. Update `.env` locally only

### 2. Use GitHub Secrets for CI/CD

**Never put real credentials in workflow files!**

Instead, use GitHub Secrets:
1. Go to: Settings → Secrets and variables → Actions
2. Add secrets:
   - `MARQETA_APP_TOKEN`
   - `MARQETA_ADMIN_TOKEN`
   - `JWT_SECRET`
   - `SNYK_TOKEN` (for security scanning)

3. Reference in workflows:
```yaml
env:
  MARQETA_APP_TOKEN: ${{ secrets.MARQETA_APP_TOKEN }}
```

### 3. Enable GitHub Security Features

**In your repository settings:**
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable Secret scanning
- ✅ Enable Code scanning (CodeQL)

**How:**
1. Go to: Settings → Security → Code security and analysis
2. Enable all options

### 4. Add Pre-commit Hooks

Prevent secrets from being committed:

```bash
# Install
npm install --save-dev husky lint-staged

# Setup
npx husky install
npx husky add .husky/pre-commit "npm run lint"

# Add secret detection
npm install --save-dev @secretlint/secretlint-rule-preset-recommend
```

Create `.secretlintrc.json`:
```json
{
  "rules": [
    {
      "@secretlint/secretlint-rule-preset-recommend": {
        "allows": []
      }
    }
  ]
}
```

## 🛡️ Security Best Practices

### Environment Variables
```bash
# ✅ GOOD - Use in .env (gitignored)
MARQETA_APP_TOKEN=real_token_here

# ❌ BAD - Never hardcode in code
const token = "09fad57c-cbf8-497f-9f15-ae2bf53b1a2c"
```

### API Keys in CI/CD
```yaml
# ✅ GOOD - Use GitHub Secrets
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ BAD - Hardcoded
env:
  API_KEY: "sk_live_abc123"
```

### Database Credentials
```bash
# ✅ GOOD - Environment variables
POSTGRES_PASSWORD=${{ secrets.DB_PASSWORD }}

# ❌ BAD - In docker-compose.yml
POSTGRES_PASSWORD: postgres123
```

## 🔍 What Workflows Check

### CI Workflow (ci.yml)
- ✅ ESLint (code quality)
- ✅ Jest tests
- ✅ Code coverage
- ❌ No secret scanning
- ❌ No dependency scanning

### Security Workflow (security.yml) - NEW
- ✅ TruffleHog (secret detection)
- ✅ Snyk (dependency vulnerabilities)
- ✅ Runs on every push/PR

## 📊 Security Scanning Tools

### 1. TruffleHog
Scans for:
- API keys
- Passwords
- Private keys
- Tokens
- Credentials in git history

### 2. Snyk
Scans for:
- Vulnerable npm packages
- Known CVEs
- License issues
- Outdated dependencies

### 3. GitHub Secret Scanning
Automatically detects:
- AWS keys
- GitHub tokens
- Stripe keys
- Many other providers

## 🚨 If Secrets Are Exposed

### Immediate Steps:
1. **Revoke the exposed credentials immediately**
2. **Generate new credentials**
3. **Update all systems using old credentials**
4. **Check access logs for unauthorized use**
5. **Notify security team if applicable**

### Git History Cleanup:
```bash
# Remove secret from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

## ✅ Security Checklist

- [ ] Rotate Marqeta tokens
- [ ] Add GitHub Secrets
- [ ] Enable Dependabot
- [ ] Enable Secret scanning
- [ ] Add pre-commit hooks
- [ ] Review `.gitignore`
- [ ] Audit npm packages
- [ ] Enable 2FA on GitHub
- [ ] Review access permissions
- [ ] Document security procedures

## 📞 Security Contacts

- **GitHub Security:** https://github.com/security
- **Marqeta Security:** security@marqeta.com
- **Report Vulnerability:** security@atlanticfrewaycard.com

---

**Last Updated:** 2024
**Review Frequency:** Monthly
