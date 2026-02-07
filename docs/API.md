# Atlantic Freeway Card API Documentation

> **Version**: 1.0.0  
> **Last Updated**: 2026-02-07

This document provides comprehensive API reference for the Atlantic Freeway Card platform, including authentication, business operations, personal banking, KYC verification, and webhooks.


## Base URL
```
http://localhost:3000/api/v1
```

---

## Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json
X-CSRF-Token: <token>

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "accountType": "personal"
}
```

### Login
```http
POST /api/v1/auth/login
X-CSRF-Token: <token>

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
X-CSRF-Token: <token>

{
  "refreshToken": "<refresh_token>"
}
```

---

## Business APIs

### Create Company
```http
POST /api/v1/business/companies
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "name": "Acme Corp",
  "taxId": "12-3456789",
  "address": {...}
}
```

### Add Employee
```http
POST /api/v1/business/employees
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "email": "employee@acme.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee"
}
```

### Issue Corporate Card
```http
POST /api/v1/business/cards/corporate
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "employeeId": "emp_123",
  "cardType": "virtual",
  "spendingLimit": 5000
}
```

---

## Personal APIs

### Issue Personal Card
```http
POST /api/v1/personal/cards
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "cardType": "virtual",
  "tier": "ace"
}
```

### Fund Wallet
```http
POST /api/v1/personal/wallet/fund
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "amount": 1000,
  "source": "crypto"
}
```

### Freeze Card
```http
POST /api/v1/personal/cards/:cardId/freeze
Authorization: Bearer <token>
X-CSRF-Token: <token>
```

---

## KYC APIs

### Submit Verification
```http
POST /api/v1/kyc/verify
Authorization: Bearer <token>
X-CSRF-Token: <token>

{
  "tier": "ace",
  "documents": [...]
}
```

### Get KYC Status
```http
GET /api/v1/kyc/status
Authorization: Bearer <token>
```

---

## Shared APIs

### Get Transactions
```http
GET /api/v1/shared/transactions?limit=50
Authorization: Bearer <token>
```

### Get Analytics
```http
GET /api/v1/shared/analytics
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

---

## Waitlist

### Add to Waitlist
```http
POST /api/waitlist
X-CSRF-Token: <token>

{
  "email": "user@example.com"
}
```

---

## Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (CSRF)
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

---

## Rate Limits

Responses include headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
