const crypto = require('crypto');

console.log('--- 🔐 Production Environment Setup Companion ---');
console.log('Use these values to configure your Render Dashboard or .env.production file.\n');

// Generate Secure Secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated Secure Secrets (Copy these):');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);

console.log('\n--- ⚠️  External API Keys (You must provide these) ---');
console.log('PLAID_CLIENT_ID=');
console.log('PLAID_SECRET=');
console.log('PLAID_ENV=sandbox'); // Default to sandbox initially
console.log('PAYSTACK_SECRET_KEY=');
console.log('ONFIDO_API_TOKEN=');
console.log('SENDGRID_API_KEY=');

console.log('\n--- 🌍 Frontend Variables (Add to Frontend Service) ---');
console.log('NEXT_PUBLIC_PLAID_ENV=sandbox');
console.log('NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1');

console.log('\n-----------------------------------------------');
console.log('👉 Tip: Run "node scripts/setup_prod_env.js >> .env.production" to save to file locally.');
