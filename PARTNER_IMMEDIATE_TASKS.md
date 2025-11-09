# 🚀 Partner Program - Immediate Implementation Tasks

**Phase 1, Week 1: Foundation Setup**

---

## ✅ TASK 1: Database Setup (30 mins) - COMPLETED

### Files Created
- ✅ `database/migrations/004_partner_affiliate_schema.sql`

### Action Required
```bash
# Run the migration
psql $DATABASE_URL -f database/migrations/004_partner_affiliate_schema.sql

# Or if using migration tool
npm run migrate:up
```

### Verification
```sql
-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'partner%';

-- Should return:
-- partners
-- referrals
-- commissions
-- partner_payouts
-- partner_api_keys
-- partner_webhooks
-- partner_analytics
```

---

## ✅ TASK 2: Create Repository Layer (1 hour) - COMPLETED

### Files Created
- ✅ `src/database/repositories/PartnerRepository.js`
- ✅ `src/database/repositories/ReferralRepository.js`

### Implementation
```javascript
const BaseRepository = require('../BaseRepository');

class PartnerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'partners');
  }

  async findByReferralCode(code) {
    return this.db.query(
      'SELECT * FROM partners WHERE referral_code = $1',
      [code]
    ).then(res => res.rows[0]);
  }

  async findByUserId(userId) {
    return this.db.query(
      'SELECT * FROM partners WHERE user_id = $1',
      [userId]
    ).then(res => res.rows[0]);
  }

  async findByTier(tier) {
    return this.db.query(
      'SELECT * FROM partners WHERE tier = $1 AND status = $2',
      [tier, 'active']
    ).then(res => res.rows);
  }

  async updateStatus(id, status) {
    return this.db.query(
      'UPDATE partners SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    ).then(res => res.rows[0]);
  }
}

module.exports = PartnerRepository;
```

### File to Create
`src/database/repositories/ReferralRepository.js`

### Implementation
```javascript
const BaseRepository = require('../BaseRepository');

class ReferralRepository extends BaseRepository {
  constructor(db) {
    super(db, 'referrals');
  }

  async findByCode(code) {
    return this.db.query(
      'SELECT * FROM referrals WHERE referral_code = $1 ORDER BY created_at DESC',
      [code]
    ).then(res => res.rows);
  }

  async findByPartner(partnerId, limit = 100) {
    return this.db.query(
      'SELECT * FROM referrals WHERE partner_id = $1 ORDER BY created_at DESC LIMIT $2',
      [partnerId, limit]
    ).then(res => res.rows);
  }

  async countByStatus(partnerId, status) {
    return this.db.query(
      'SELECT COUNT(*) as count FROM referrals WHERE partner_id = $1 AND status = $2',
      [partnerId, status]
    ).then(res => parseInt(res.rows[0].count));
  }

  async markConverted(id, userId) {
    return this.db.query(
      'UPDATE referrals SET status = $1, referred_user_id = $2, conversion_date = NOW() WHERE id = $3 RETURNING *',
      ['converted', userId, id]
    ).then(res => res.rows[0]);
  }
}

module.exports = ReferralRepository;
```

---

## ✅ TASK 3: Create Core Service (1.5 hours) - COMPLETED

### Files Created
- ✅ `src/services/PartnerService.js`

### Implementation
```javascript
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { NotFoundError, ValidationError } = require('../errors/AppError');

class PartnerService {
  constructor(repositories) {
    this.partnerRepo = repositories.partner;
    this.userRepo = repositories.user;
    this.referralRepo = repositories.referral;
  }

  async registerPartner(userId, partnerData) {
    // Validate user exists
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    // Check if already a partner
    const existing = await this.partnerRepo.findByUserId(userId);
    if (existing) throw new ValidationError('User is already a partner');

    // Generate unique referral code
    const referralCode = await this.generateReferralCode(user);

    // Determine tier based on partner type
    const tier = this.determineTier(partnerData.partner_type);

    // Create partner
    return await this.partnerRepo.create({
      user_id: userId,
      partner_type: partnerData.partner_type || 'affiliate',
      tier,
      company_name: partnerData.company_name || `${user.first_name} ${user.last_name}`,
      referral_code: referralCode,
      commission_rate: this.getDefaultCommissionRate(tier),
      status: 'pending', // Requires approval
      settings: partnerData.settings || {}
    });
  }

  async getPartnerProfile(partnerId) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    // Get stats
    const totalReferrals = await this.referralRepo.countByStatus(partnerId, 'converted');
    
    return {
      ...partner,
      stats: {
        total_referrals: totalReferrals
      }
    };
  }

  async updatePartner(partnerId, updates) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    const allowed = ['company_name', 'settings', 'branding'];
    const filtered = Object.keys(updates)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

    return await this.partnerRepo.update(partnerId, filtered);
  }

  async generateAPIKey(partnerId) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    const apiKey = 'pk_' + crypto.randomBytes(32).toString('hex');
    const apiSecret = 'sk_' + crypto.randomBytes(32).toString('hex');
    const secretHash = await bcrypt.hash(apiSecret, 10);

    await this.partnerRepo.update(partnerId, {
      api_key: apiKey,
      api_secret_hash: secretHash
    });

    // Return secret only once
    return { api_key: apiKey, api_secret: apiSecret };
  }

  async generateReferralCode(user) {
    const base = (user.first_name.substring(0, 3) + user.last_name.substring(0, 3)).toUpperCase();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${base}${random}`;
  }

  determineTier(partnerType) {
    const tierMap = {
      'affiliate': 'tier1',
      'reseller': 'tier2',
      'whitelabel': 'tier3',
      'technology': 'tier4'
    };
    return tierMap[partnerType] || 'tier1';
  }

  getDefaultCommissionRate(tier) {
    const rates = {
      'tier1': 10.00,
      'tier2': 25.00,
      'tier3': 50.00,
      'tier4': 15.00
    };
    return rates[tier] || 10.00;
  }
}

module.exports = PartnerService;
```

---

## ✅ TASK 4: Create Routes (45 mins) - COMPLETED

### Files Created
- ✅ `src/routes/partners.js`

### Implementation
```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  partner_type: Joi.string().valid('affiliate', 'reseller', 'whitelabel', 'technology').required(),
  company_name: Joi.string().max(255),
  settings: Joi.object()
});

const updateSchema = Joi.object({
  company_name: Joi.string().max(255),
  settings: Joi.object(),
  branding: Joi.object()
});

// Routes
router.post('/register',
  authenticateToken,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partner = await partnerService.registerPartner(req.user.id, req.body);
    res.status(201).json({ success: true, data: partner });
  })
);

router.get('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const profile = await partnerService.getPartnerProfile(partner.id);
    res.json({ success: true, data: profile });
  })
);

router.put('/profile',
  authenticateToken,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const updated = await partnerService.updatePartner(partner.id, req.body);
    res.json({ success: true, data: updated });
  })
);

router.post('/api-key',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const keys = await partnerService.generateAPIKey(partner.id);
    res.json({ 
      success: true, 
      data: keys,
      message: 'Store the API secret securely. It will not be shown again.'
    });
  })
);

module.exports = router;
```

---

## ⚠️ TASK 5: Update Main Routes (15 mins) - NEXT TASK

### File to Update
`src/routes/v1/index.js`

### Add this line
```javascript
const partnerRoutes = require('../partners');

// ... existing routes ...

router.use('/partners', partnerRoutes);
```

---

## ⏳ TASK 6: Update Server Initialization (15 mins) - PENDING

### File to Update
`server.js`

### Add to services initialization
```javascript
// Add to repositories
const PartnerRepository = require('./src/database/repositories/PartnerRepository');
const ReferralRepository = require('./src/database/repositories/ReferralRepository');

// Initialize repositories
const repositories = {
  // ... existing repositories ...
  partner: new PartnerRepository(db),
  referral: new ReferralRepository(db)
};

// Add to services
const PartnerService = require('./src/services/PartnerService');

// Initialize services
const services = {
  // ... existing services ...
  partner: new PartnerService(repositories)
};

// Make available to routes
app.set('repositories', repositories);
app.set('services', services);
```

---

## ✅ TASK 7: Create Tests (1 hour) - COMPLETED

### Files Created
- ✅ `tests/unit/services/PartnerService.test.js`

### Basic Test Structure
```javascript
const PartnerService = require('../../../src/services/PartnerService');

describe('PartnerService', () => {
  let partnerService;
  let mockRepos;

  beforeEach(() => {
    mockRepos = {
      partner: {
        create: jest.fn(),
        findById: jest.fn(),
        findByUserId: jest.fn(),
        update: jest.fn()
      },
      user: {
        findById: jest.fn()
      },
      referral: {
        countByStatus: jest.fn()
      }
    };
    partnerService = new PartnerService(mockRepos);
  });

  describe('registerPartner', () => {
    it('should create a new partner', async () => {
      const userId = 'user-123';
      const user = { id: userId, first_name: 'John', last_name: 'Doe' };
      const partnerData = { partner_type: 'affiliate' };

      mockRepos.user.findById.mockResolvedValue(user);
      mockRepos.partner.findByUserId.mockResolvedValue(null);
      mockRepos.partner.create.mockResolvedValue({ id: 'partner-123', ...partnerData });

      const result = await partnerService.registerPartner(userId, partnerData);

      expect(result).toBeDefined();
      expect(mockRepos.partner.create).toHaveBeenCalled();
    });

    it('should throw error if user already a partner', async () => {
      const userId = 'user-123';
      mockRepos.user.findById.mockResolvedValue({ id: userId });
      mockRepos.partner.findByUserId.mockResolvedValue({ id: 'partner-123' });

      await expect(
        partnerService.registerPartner(userId, {})
      ).rejects.toThrow('User is already a partner');
    });
  });
});
```

---

## ⏳ TASK 8: Test the Implementation (30 mins) - PENDING

### Manual Testing with cURL

```bash
# 1. Register as partner
curl -X POST http://localhost:3000/api/v1/partners/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_type": "affiliate",
    "company_name": "My Affiliate Business"
  }'

# 2. Get partner profile
curl -X GET http://localhost:3000/api/v1/partners/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Update partner profile
curl -X PUT http://localhost:3000/api/v1/partners/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Updated Business Name"
  }'

# 4. Generate API key
curl -X POST http://localhost:3000/api/v1/partners/api-key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Run Unit Tests
```bash
npm test -- tests/unit/services/PartnerService.test.js
```

---

## 📊 Success Criteria

- [x] Database migration file created
- [x] All 7 partner tables schema ready
- [x] PartnerRepository created
- [x] ReferralRepository created
- [x] PartnerService implemented
- [x] API routes created
- [x] Tests written
- [ ] Routes integrated (TASK 5)
- [ ] Server updated (TASK 6)
- [ ] Database migration executed
- [ ] Manual testing successful (TASK 8)

---

## 🎯 Next Steps (Week 2)

After completing these tasks, move to:
1. ReferralService implementation
2. Referral tracking system
3. Referral link generation
4. Commission calculation basics

---

## 📝 Notes

- All files are non-conflicting with existing codebase
- Uses existing authentication middleware
- Follows existing patterns (BaseRepository, asyncHandler)
- Maintains security standards (bcrypt, validation)
- Ready for immediate implementation

---

## ⏱️ Estimated Time

- **Total**: 5-6 hours
- **Can be split across multiple sessions**
- **Recommended**: Complete in 1-2 days

---

**Status**: Ready to implement
**Priority**: High
**Dependencies**: Existing database connection, user authentication

