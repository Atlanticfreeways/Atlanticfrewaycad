# Security Documentation

## Authentication Flow

### Registration
1. Request CSRF token: `GET /api/v1/csrf-token`
2. Submit with token, input validated & sanitized
3. Password hashed (bcrypt, 10 rounds)
4. JWT tokens issued

### Login
1. Request CSRF token
2. Submit credentials with token
3. Rate limited (5/15min)
4. JWT tokens on success

---

## CSRF Protection

Cookie-based tokens required for all POST/PUT/DELETE operations.

```javascript
const res = await fetch('/api/v1/csrf-token');
const { csrfToken } = await res.json();

fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  credentials: 'include',
  body: JSON.stringify(data)
});
```

---

## Rate Limiting

- **Auth**: 5 requests / 15 minutes
- **Strict**: 10 requests / minute (card creation, funding)
- **API**: 100 requests / 15 minutes

---

## Input Validation

Joi schemas on all endpoints:
- Email validation
- Password requirements (8+ chars, uppercase, number)
- Sanitization via DOMPurify
- HTML entity encoding

---

## SSRF Protection

**Whitelist**: api.atlanticfrewaycard.com, sandbox-api.marqeta.com, api.marqeta.com  
**Blocked**: 127.0.0.1, localhost, 169.254.169.254

```javascript
import { getApiUrl } from './utils/urlValidator';
const url = getApiUrl('/kyc/verify');
```

---

## Authorization

**Roles**: admin, manager, employee, personal

```javascript
router.use(authenticate);
router.post('/companies', authorize('admin'), handler);
```

---

## Webhook Security

HMAC signature verification on all Marqeta webhooks.

---

## Security Headers

- Helmet.js (CSP, X-Frame-Options, HSTS)
- CORS with origin whitelist
- X-Content-Type-Options: nosniff

---

## Logging

Winston structured logging with file rotation.

```javascript
logger.info('User registered', { userId, email });
logger.error('Error occurred', { error: err.message });
```

---

## Compliance

✅ OWASP Top 10 (2021) addressed  
✅ PCI DSS compliance ready  
✅ Security rating: 8.5/10

See [SECURITY_AUDIT.md](../SECURITY_AUDIT.md) for details.
