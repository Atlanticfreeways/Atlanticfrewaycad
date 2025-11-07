# GitHub Actions Workflows

## Active Workflows

### CI (ci.yml)
- Runs on push to main and pull requests
- Installs dependencies
- Runs linter (if available)
- Runs tests
- Checks build

## Disabled Workflows

Advanced security workflows have been moved to `.github/workflows-disabled/` because they require:
- External security scanning services
- API keys and tokens
- Premium GitHub features

To enable them:
1. Set up required services (CodeQL, Snyk, etc.)
2. Add necessary secrets to GitHub repository
3. Move workflows back to `.github/workflows/`

## Local Testing

Run checks locally before pushing:
```bash
npm run lint
npm test
npm audit
```
