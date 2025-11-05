# 📝 Google Form Setup Instructions

## Current Status
❌ **Mailchimp/API NOT implemented**
✅ **Google Form redirect ready** (needs configuration)

## Setup Steps

### 1. Create Google Form
1. Go to https://forms.google.com
2. Click "Blank Form"
3. Add these fields:
   - **Email** (required)
   - **Name** (optional)
   - **Interest** (optional: Business/Personal)

### 2. Get Form URL
1. Click "Send" button
2. Click link icon
3. Copy the form URL
4. It looks like: `https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform`

### 3. Get Email Field Entry ID
1. Open your form
2. Right-click on email field → Inspect
3. Find `entry.XXXXXXXXX` in the HTML
4. Copy the number (e.g., `entry.123456789`)

### 4. Configure Email Notifications
1. In Google Form, click "Responses" tab
2. Click three dots → "Get email notifications for new responses"
3. Enter: `diamondman1960@gmail.com`

### 5. Update index.html
Replace in `/public/index.html` (around line 50):

```html
<form class="email-form" action="https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse" method="POST" target="_blank">
    <input type="email" name="entry.YOUR_ENTRY_ID" placeholder="Enter your email" required>
    <button type="submit">Notify Me</button>
</form>
```

With your actual values:
```html
<form class="email-form" action="https://docs.google.com/forms/d/e/1FAIpQLSc_YOUR_ACTUAL_ID/formResponse" method="POST" target="_blank">
    <input type="email" name="entry.123456789" placeholder="Enter your email" required>
    <button type="submit">Notify Me</button>
</form>
```

**Important:** Change `/viewform` to `/formResponse` in the URL!

## Alternative: Direct Email (No Form)

If you want emails sent directly without Google Form:

### Option A: Mailto Link (Simple)
```javascript
function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    window.location.href = 'mailto:diamondman1960@gmail.com?subject=Waitlist Signup&body=Email: ' + email;
    e.target.reset();
}
```

### Option B: Backend API (Recommended for Production)
Create `/api/waitlist` endpoint:

```javascript
// server.js
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;
    
    // Save to database
    await db.query('INSERT INTO waitlist (email) VALUES ($1)', [email]);
    
    // Send email notification
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
        }
    });
    
    await transporter.sendMail({
        from: 'noreply@atlanticfreway.com',
        to: 'diamondman1960@gmail.com',
        subject: 'New Waitlist Signup',
        text: `New signup: ${email}`
    });
    
    res.json({ success: true });
});
```

## Mailchimp Integration (Future)

To implement Mailchimp later:

### 1. Install Package
```bash
npm install @mailchimp/mailchimp_marketing
```

### 2. Create API Endpoint
```javascript
const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX
});

app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    
    try {
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
            email_address: email,
            status: 'subscribed'
        });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
```

### 3. Update Frontend
```javascript
async function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    
    const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    
    if (response.ok) {
        alert('Thanks! You\'re on the waitlist.');
    }
    e.target.reset();
}
```

## Current Implementation

**What's Active:**
- ✅ Form collects email
- ✅ Redirects to Google Form (needs your form URL)
- ✅ Pre-fills email in Google Form

**What's NOT Active:**
- ❌ Mailchimp integration
- ❌ Direct email sending
- ❌ Database storage
- ❌ Backend API

## Recommended Next Steps

1. **Immediate (5 min)**: Create Google Form and update URL
2. **Short-term (1 hour)**: Add backend API endpoint
3. **Long-term (1 day)**: Implement Mailchimp integration

---

**Contact:** diamondman1960@gmail.com
**Last Updated:** 2024
