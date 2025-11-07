# 🎯 Next Task: Database & Service Layer Implementation

**Priority**: HIGH  
**Estimated Time**: 8-10 hours  
**Phase**: Core Implementation

---

## 📋 Task Overview

Complete the database layer and service implementations to make the platform fully functional.

---

## Task 2.2: Database Connection Retry Logic

**Status**: ⚠️ NEXT  
**Priority**: P1  
**Time**: 1 hour

**File**: `src/database/connection.js`

**Implementation**:
```javascript
const { Pool } = require('pg');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  async connect(retries = 0) {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: true
        } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });

      await this.pool.query('SELECT NOW()');
      logger.info('Database connected successfully');
      return this.pool;
    } catch (error) {
      if (retries < this.maxRetries) {
        logger.warn(`Database connection failed, retrying... (${retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect(retries + 1);
      }
      logger.error('Database connection failed after max retries', { error: error.message });
      throw error;
    }
  }

  async healthCheck() {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new DatabaseConnection();
```

---

## Task 2.3: Complete Repository Implementations

**Status**: TODO  
**Priority**: P1  
**Time**: 4 hours

**Files**:
- `src/database/repositories/UserRepository.js`
- `src/database/repositories/CompanyRepository.js`
- `src/database/repositories/CardRepository.js`
- `src/database/repositories/TransactionRepository.js`

**Pattern**:
```javascript
class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async create(userData) {
    const { email, passwordHash, firstName, lastName, accountType, role } = userData;
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, account_type, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, passwordHash, firstName, lastName, accountType, role]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
    
    const result = await this.pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }
}
```

---

## Task 2.4: Complete Service Layer

**Status**: TODO  
**Priority**: P1  
**Time**: 3 hours

**Files**:
- `src/services/BusinessService.js`
- `src/services/PersonalService.js`
- `src/services/KYCService.js`

**Pattern**:
```javascript
class BusinessService {
  constructor(repositories) {
    this.companyRepo = repositories.company;
    this.cardRepo = repositories.card;
    this.userRepo = repositories.user;
  }

  async createCompany(companyData) {
    // Validate data
    if (!companyData.name || !companyData.taxId) {
      throw new ValidationError('Missing required fields');
    }

    // Create company
    const company = await this.companyRepo.create(companyData);
    
    // Log action
    logger.info('Company created', { companyId: company.id });
    
    return company;
  }

  async issueCorporateCard(userId, cardData) {
    // Verify user belongs to company
    const user = await this.userRepo.findById(userId);
    if (!user.company_id) {
      throw new AuthorizationError('User not associated with company');
    }

    // Create card via Marqeta
    const marqetaCard = await this.marqetaClient.createCard({
      user_token: user.marqeta_user_token,
      card_product_token: process.env.MARQETA_CARD_PRODUCT_TOKEN
    });

    // Save to database
    const card = await this.cardRepo.create({
      user_id: userId,
      company_id: user.company_id,
      marqeta_card_token: marqetaCard.token,
      ...cardData
    });

    return card;
  }
}
```

---

## Task 2.5: Database Migrations

**Status**: TODO  
**Priority**: P1  
**Time**: 2 hours

**Create**: `database/migrations/001_initial_schema.sql`

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('business', 'personal')),
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  company_id UUID REFERENCES companies(id),
  marqeta_user_token VARCHAR(255),
  kyc_tier VARCHAR(20) DEFAULT 'atlantic',
  monthly_limit DECIMAL(10,2) DEFAULT 5000.00,
  monthly_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(50) UNIQUE NOT NULL,
  address JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  marqeta_card_token VARCHAR(255) UNIQUE NOT NULL,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  status VARCHAR(20) DEFAULT 'active',
  spending_limit DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  merchant_name VARCHAR(255),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  marqeta_transaction_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

---

## Success Criteria

- [ ] Database connection with retry logic
- [ ] All repositories implemented
- [ ] All services implemented
- [ ] Database migrations created
- [ ] Integration tests passing
- [ ] Health check includes database status

---

## Next Steps After Completion

1. Marqeta API integration
2. Frontend development
3. End-to-end testing
4. Production deployment

---

**Estimated Total Time**: 10 hours  
**Priority**: HIGH  
**Blocking**: Frontend development, E2E testing
