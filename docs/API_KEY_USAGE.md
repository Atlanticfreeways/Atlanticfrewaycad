# API Key Authentication Guide

## Overview

API keys provide programmatic access to the Atlantic Freeway Card platform without requiring interactive login. They're perfect for:
- Backend integrations
- Automation scripts
- Mobile apps
- Third-party services

## Security Features

-✅ **Hashed Storage** - Keys are bcrypt-hashed in database (never stored in plaintext)
- ✅ **One-Time Display** - Plaintext key shown only once during generation
- ✅ **Rate Limiting** - 10 requests per second per key
- ✅ **Audit Logging** - All API key usage is logged
- ✅ **Expiration** - Keys can expire (30-365 days)
- ✅ **Revocation** - Keys can be revoked at any time

## Generating an API Key

### Via Frontend

1. Navigate to Settings → API Keys
2. Click "Generate New Key"
3. Enter a descriptive name (e.g., "Mobile App", "Analytics Script")
4. Select expiration (30-365 days)
5. **Copy the key immediately** - it won't be shown again!

### Example Key Format

```
afc_1234567890abcdef1234567890ab
```

All keys start with `afc_` prefix.

## Using an API Key

### HTTP Header

Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: afc_your_key_here" \
     https://api.atlanticfreewaycard.com/api/v1/transactions
```

### Supported Endpoints

The following endpoints support API key authentication:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/shared/transactions` | GET | Get transaction history |
| `/api/v1/shared/analytics` | GET | Get transaction analytics |
| `/api/v1/reports/spending` | GET | Get spending reports |

More endpoints will be added in future releases.

### JavaScript Example

```javascript
const apiKey = 'afc_your_key_here';

const response = await fetch('https://api.atlanticfreewaycard.com/api/v1/shared/transactions', {
    headers: {
        'X-API-Key': apiKey
    }
});

const data = await response.json();
console.log(data.transactions);
```

### Python Example

```python
import requests

api_key = 'afc_your_key_here'

headers = {
    'X-API-Key': api_key
}

response = requests.get(
    'https://api.atlanticfreewaycard.com/api/v1/shared/transactions',
    headers=headers
)

data = response.json()
print(data['transactions'])
```

### Node.js Example

```javascript
const axios = require('axios');

const apiKey = 'afc_your_key_here';

async function getTransactions() {
    try {
        const response = await axios.get(
            'https://api.atlanticfreewaycard.com/api/v1/shared/transactions',
            {
                headers: {
                    'X-API-Key': apiKey
                }
            }
        );
        
        console.log(response.data.transactions);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

getTransactions();
```

## Rate Limits 

- **Per Key**: 10 requests per second
- **Response**: HTTP 429 if exceeded

```json
{
    "success": false,
    "error": "Rate limit exceeded",
    "message": "Maximum 10 requests per second per API key"
}
```

## Error Handling

### Invalid Key Format

```json
{
    "success": false,
    "error": "Invalid API key format"
}
```

### Invalid Key

```json
{
    "success": false,
    "error": "Invalid API key"
}
```

### Expired or Revoked Key

```json
{
    "success": false,
    "error": "Invalid API key"
}
```

### Inactive User Account

```json
{
    "success": false,
    "error": "User account is not active"
}
```

## Best Practices

### ✅ DO

- Store API keys in environment variables
- Use different keys for different environments (dev, staging, prod)
- Rotate keys periodically
- Set appropriate expiration dates
- Revoke unused keys
- Monitor API key usage in audit logs

### ❌ DON'T

- Commit keys to version control
- Share keys between applications
- Use keys in client-side code (browsers)
- Store keys in plaintext files
- Use the same key for multiple services

## Monitoring

### Check Last Used

Go to Settings → API Keys to see when each key was last used.

### Audit Logs

All API key requests are logged in the audit logs:
- Settings → Audit History
- Filter by action: "api_key_auth"

### Revoke Compromised Keys

If a key is compromised:
1. Go to Settings → API Keys
2. Click "Revoke" next to the compromised key
3. Generate a new key
4. Update your application with the new key

## Limitations

- **Maximum Keys**: 10 active keys per user
- **Rate Limit**: 10 requests/second per key
- **Minimum Expiration**: 30 days
- **Maximum Expiration**: 365 days

## Migration from JWT

If you're currently using JWT tokens, API keys offer several advantages:

| Feature | JWT (Bearer Token) | API Key |
|---------|-------------------|---------|
| Expiration | Short-lived (24h) | Long-lived (30-365 days) |
| Refresh | Requires re-login | No refresh needed |
| Use Case | Interactive users | Programmatic access |
| Rate Limiting | Per user | Per key |

You can use both JWT and API keys in the same application.

## Support

For questions or issues:
- Email: api-support@atlanticfreewaycard.com
- Documentation: https://docs.atlanticfreewaycard.com
- Status Page: https://status.atlanticfreewaycard.com

## Changelog

### v1.0.0 (2026-02-03)
- Initial API key implementation
- Support for transactions, analytics, and reports endpoints
- Rate limiting (10 req/sec)
- Audit logging
