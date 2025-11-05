# 🔧 GitHub Workflows Setup Guide

## Required Secrets

Add these secrets in: **Settings → Secrets and variables → Actions → New repository secret**

### 1. GitGuardian (Secret Scanning)
- **Secret Name**: `GITGUARDIAN_API_KEY`
- **Get it**: [dashboard.gitguardian.com](https://dashboard.gitguardian.com/)
- **Free tier**: Yes (public repos + 25 commits/month)

### 2. Snyk (Dependency Scanning) - Optional
- **Secret Name**: `SNYK_TOKEN`
- **Get it**: [app.snyk.io](https://app.snyk.io/account)
- **Free tier**: Yes (unlimited tests for open source)

### 3. SonarCloud (Code Quality) - Optional
- **Secret Name**: `SONAR_TOKEN`
- **Get it**: [sonarcloud.io](https://sonarcloud.io/)
- **Free tier**: Yes (open source projects)

### 4. Codecov (Coverage Reports) - Optional
- **Setup**: Automatic for public repos
- **Token**: Not required for public repos

## Workflow Features

### 🔒 security.yml
- **TruffleHog**: Scans for secrets (no setup needed)
- **GitGuardian**: Advanced secret detection (requires API key)
- **npm audit**: Built-in vulnerability scanning
- **Snyk**: Dependency security (optional)
- **Schedule**: Weekly automated scans

### 🤖 autofix.yml
- **ESLint auto-fix**: Automatically fixes linting issues
- **Prettier**: Auto-formats code
- **Auto-commit**: Commits fixes to PR branches
- **CodeQL**: GitHub's security analysis (free)
- **SonarCloud**: Code quality metrics (optional)
- **Dependency updates**: Auto-creates PRs for updates

### ✅ ci.yml (Enhanced)
- **Linting**: ESLint checks
- **Formatting**: Prettier validation
- **Testing**: Jest with PostgreSQL/Redis
- **Coverage**: Codecov integration
- **Test reports**: Visual test results

### 🚀 deploy.yml
- **Staging**: Auto-deploy on main branch
- **Production**: Manual approval required
- **Docker**: Container builds

## Quick Setup (Minimal)

**Required for full functionality:**
```bash
# 1. GitGuardian only (recommended minimum)
# Add GITGUARDIAN_API_KEY secret
```

**Optional enhancements:**
```bash
# 2. Add other secrets as needed
# SNYK_TOKEN, SONAR_TOKEN
```

## Workflow Triggers

| Workflow | Push | PR | Schedule | Manual |
|----------|------|----|---------:|--------|
| CI | ✅ | ✅ | - | - |
| Security | ✅ | ✅ | Weekly | - |
| Auto-fix | development | ✅ | - | - |
| Deploy | main | - | - | ✅ |

## Testing Locally

```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Security audit
npm audit
```

## Troubleshooting

**GitGuardian fails**: Add `GITGUARDIAN_API_KEY` secret or disable in security.yml
**Snyk fails**: Add `SNYK_TOKEN` or set `continue-on-error: true`
**SonarCloud fails**: Add `SONAR_TOKEN` or remove from autofix.yml
**Auto-commit fails**: Check branch protection rules allow bot commits

## Next Steps

1. ✅ Add `GITGUARDIAN_API_KEY` secret (required)
2. ⚙️ Test workflows by creating a PR
3. 📊 Review security/quality reports
4. 🔧 Add optional integrations as needed
