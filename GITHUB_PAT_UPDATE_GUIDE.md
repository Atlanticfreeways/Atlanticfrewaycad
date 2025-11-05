# 🔑 GitHub Personal Access Token (PAT) Update Guide

## Step-by-Step Instructions to Add Workflow Scope

### Step 1: Go to GitHub Settings
1. Open your browser and go to **https://github.com**
2. Click your **profile picture** (top right corner)
3. Click **Settings**

### Step 2: Navigate to Developer Settings
1. Scroll down the left sidebar
2. Click **Developer settings** (at the very bottom)

### Step 3: Access Personal Access Tokens
1. In the left sidebar, click **Personal access tokens**
2. Click **Tokens (classic)** or **Fine-grained tokens** (depending on your token type)

### Step 4: Find Your Current Token
**Option A: If you see your token in the list:**
1. Find the token you're currently using
2. Click **Edit** (pencil icon) next to it

**Option B: If you don't see it or want to create a new one:**
1. Click **Generate new token** → **Generate new token (classic)**
2. Enter your password if prompted

### Step 5: Configure Token Scopes
1. **Note/Name:** Enter a description (e.g., "Atlanticfrewaycard Full Access")
2. **Expiration:** Choose expiration (recommend: 90 days or No expiration)
3. **Select scopes** - Check these boxes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
   - ✅ **workflow** (Update GitHub Action workflows) ← **THIS IS THE KEY ONE**
   - ✅ **write:packages** (optional, for publishing packages)
   - ✅ **read:org** (optional, if using organizations)

### Step 6: Generate/Update Token
1. Scroll to the bottom
2. Click **Generate token** (for new) or **Update token** (for existing)
3. **IMPORTANT:** Copy the token immediately (it looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`)
4. **Save it somewhere safe** - you won't see it again!

### Step 7: Update Git Credentials on Your Computer

**Option A: Update Remote URL (Recommended)**
```bash
cd /Users/machine/Desktop/Atlanticfrewaycard

# Replace YOUR_NEW_TOKEN with the token you just copied
git remote set-url origin https://YOUR_NEW_TOKEN@github.com/Atlanticfreeways/Atlanticfrewaycad.git
```

**Option B: Use Git Credential Manager**
```bash
# Remove old credentials
git credential reject <<EOF
protocol=https
host=github.com
EOF

# Next push will prompt for new token
git push origin main
# Username: your-github-username
# Password: paste-your-new-token-here
```

**Option C: macOS Keychain Update**
```bash
# Open Keychain Access app
# Search for "github.com"
# Double-click the entry
# Click "Show password"
# Replace with your new token
# Save
```

### Step 8: Restore and Push Workflows
```bash
cd /Users/machine/Desktop/Atlanticfrewaycard

# Restore the workflow files
git checkout HEAD~1 -- .github/workflows/

# Or manually create them again
mkdir -p .github/workflows

# Add the files
git add .github/workflows/

# Commit
git commit -m "feat: add CI/CD workflows with proper PAT scope"

# Push (this should work now!)
git push origin main
```

### Step 9: Verify Success
1. Go to your GitHub repository: https://github.com/Atlanticfreeways/Atlanticfrewaycad
2. Check if `.github/workflows/` folder appears
3. Click **Actions** tab to see if workflows are detected

---

## Quick Reference

### What You Need:
- ✅ `repo` scope (repository access)
- ✅ `workflow` scope (GitHub Actions access) ← **Required for workflows**

### Token Format:
- Classic: `ghp_xxxxxxxxxxxxxxxxxxxx`
- Fine-grained: `github_pat_xxxxxxxxxxxxxxxxxxxx`

### Where to Use Token:
```bash
# In git remote URL
https://YOUR_TOKEN@github.com/username/repo.git

# Or when prompted for password
Username: your-github-username
Password: your-token-here
```

---

## Troubleshooting

### "Token not found" Error
- Make sure you copied the entire token
- Check for extra spaces at the beginning/end
- Token should start with `ghp_` or `github_pat_`

### "Permission denied" Error
- Verify `workflow` scope is checked
- Make sure token hasn't expired
- Confirm you're using the new token, not the old one

### "Remote rejected" Error
- This means the token doesn't have `workflow` scope
- Go back to Step 5 and ensure `workflow` is checked

### Still Not Working?
1. Create a completely new token (don't edit existing)
2. Make sure to check both `repo` AND `workflow` scopes
3. Copy the new token
4. Update git remote URL with new token
5. Try pushing again

---

## Security Best Practices

1. **Never commit tokens to code** - Always use environment variables
2. **Set expiration dates** - Rotate tokens every 90 days
3. **Use minimal scopes** - Only enable what you need
4. **Store securely** - Use password manager or secure notes
5. **Revoke old tokens** - Delete tokens you're no longer using

---

## Alternative: Use SSH Instead of HTTPS

If you prefer SSH (no token needed):

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:Atlanticfreeways/Atlanticfrewaycad.git

# Push
git push origin main
```

---

## Summary Checklist

- [ ] Go to GitHub Settings → Developer settings
- [ ] Click Personal access tokens → Tokens (classic)
- [ ] Edit existing token or create new one
- [ ] Check `repo` scope
- [ ] Check `workflow` scope ← **CRITICAL**
- [ ] Generate/Update token
- [ ] Copy token immediately
- [ ] Update git remote URL with new token
- [ ] Restore workflow files
- [ ] Push to GitHub
- [ ] Verify workflows appear in repository

---

**Need Help?** 
- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Token Scopes: https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps

**Last Updated:** 2024
