# 🚀 Git Push Guide

## Quick Push Commands

```bash
# Navigate to project
cd /Users/machine/Desktop/Atlanticfrewaycard

# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: Complete landing page with waitlist functionality

- Implemented glassmorphism UI design
- Added functional waitlist/newsletter signup
- Created admin dashboard for viewing signups
- Removed all emojis from UI
- Made logo clickable home button
- Added database schema for waitlist
- Integrated backend API endpoints
- Updated documentation"

# Push to remote
git push origin main
```

## If Repository Not Initialized

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Atlanticfreway platform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/atlanticfrewaycard.git

# Push to main branch
git push -u origin main
```

## What's Being Pushed

### New Files:
- ✅ `/public/index.html` - Landing page with glassmorphism
- ✅ `/public/admin/waitlist.html` - Admin dashboard
- ✅ `/public/logo.svg` - Logo file
- ✅ `/public/banner.svg` - Banner image
- ✅ `/public/banner-red.svg` - Red banner variant
- ✅ `/public/favicon.svg` - Favicon
- ✅ `/src/routes/waitlist.js` - Waitlist API
- ✅ `/database/migrations/003_waitlist.sql` - Database schema
- ✅ `/ACCESS_GUIDE.md` - Complete access documentation
- ✅ `/GOOGLE_FORM_SETUP.md` - Alternative setup guide
- ✅ `/GIT_PUSH_GUIDE.md` - This file

### Modified Files:
- ✅ `/server.js` - Added waitlist routes
- ✅ `/README.md` - Updated with new endpoints
- ✅ `/IMPROVEMENT_TASKS.md` - Marked completed tasks
- ✅ `/.gitignore` - Added marqeta api folder

## Verify Before Push

```bash
# Check what will be committed
git diff

# Check staged files
git diff --cached

# View commit history
git log --oneline
```

## Branch Strategy (Optional)

```bash
# Create feature branch
git checkout -b feature/landing-page

# Push feature branch
git push origin feature/landing-page

# Merge to main later
git checkout main
git merge feature/landing-page
git push origin main
```

## Common Issues

### Issue: "fatal: not a git repository"
```bash
git init
```

### Issue: "remote origin already exists"
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### Issue: "rejected - non-fast-forward"
```bash
git pull origin main --rebase
git push origin main
```

### Issue: Large files
```bash
# Check file sizes
du -sh *

# Remove large files from git
git rm --cached large-file.zip
echo "large-file.zip" >> .gitignore
```

## GitHub Repository Setup

1. Go to https://github.com/new
2. Create repository: `atlanticfrewaycard`
3. Don't initialize with README (you already have one)
4. Copy the repository URL
5. Run:
```bash
git remote add origin https://github.com/yourusername/atlanticfrewaycard.git
git push -u origin main
```

## Deployment After Push

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### Deploy to Heroku
```bash
heroku login
heroku create atlanticfreway
git push heroku main
```

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## Environment Variables

Don't forget to set these in your deployment:

```
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret
NODE_ENV=production
```

---

**Ready to push?** Run:
```bash
git add . && git commit -m "feat: Complete platform" && git push origin main
```
