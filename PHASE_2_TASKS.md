# 🚀 Phase 2 Implementation Tasks

**Automated Commissions, Payouts & Advanced Analytics**

---

## 📊 Current Status

### ✅ Phase 1 Complete (100%)
- Partner registration system
- Referral link tracking
- In-memory storage (no database needed)
- Partner dashboard UI
- Basic analytics

### 🎯 Phase 2 Focus (0% - Starting Now)
- Automated commission calculation
- Payout automation
- Advanced analytics
- Click tracking system
- Conversion attribution
- Webhook notifications

---

## 📋 Implementation Roadmap

### **Week 2: Automation Core** (40 hours)

#### TASK 1: Click Tracking System (8 hours)
**Priority**: HIGH

**Features**:
- Track every referral link click
- Store IP, user agent, timestamp
- Detect duplicate clicks
- Geographic tracking
- Device fingerprinting

**Files to Create**:
- `src/services/ClickTrackingService.js`
- `src/middleware/clickTracker.js`

**Deliverables**:
- Real-time click tracking
- Click analytics dashboard
- Fraud detection (duplicate IPs)

---

#### TASK 2: Conversion Attribution (10 hours)
**Priority**: HIGH

**Features**:
- Track user registration source
- Link referral to user account
- Multi-touch attribution
- 30-day cookie window
- Last-click attribution

**Files to Create**:
- `src/services/ConversionService.js`
- Update registration handlers

**Deliverables**:
- Automatic referral → user linking
- Conversion tracking
- Attribution reports

---

#### TASK 3: Automated Commission Calculation (12 hours)
**Priority**: CRITICAL

**Features**:
- Calculate commissions on signup
- Calculate recurring commissions
- Volume bonuses
- Tier-based rates
- Transaction-based commissions

**Files to Create**:
- `src/services/CommissionCalculationService.js`
- `src/jobs/calculateCommissions.js`

**Deliverables**:
- Automatic commission calculation
- Daily/monthly batch processing
- Commission history

---

#### TASK 4: Payout Processing (10 hours)
**Priority**: HIGH

**Features**:
- Payout request system
- Minimum payout thresholds
- Payment method management
- Stripe Connect integration
- Payout history

**Files to Create**:
- `src/services/PayoutService.js`
- `src/routes/payouts.js`
- `src/integrations/stripe.js`

**Deliverables**:
- Automated payout processing
- Partner payout dashboard
- Payment tracking

---

### **Week 3: Analytics & Notifications** (30 hours)

#### TASK 5: Analytics Aggregation (12 hours)
**Priority**: MEDIUM

**Features**:
- Daily metrics aggregation
- Partner performance reports
- Conversion funnel analysis
- Revenue attribution
- Trend analysis

**Files to Create**:
- `src/services/AnalyticsAggregationService.js`
- `src/jobs/aggregateAnalytics.js`

**Deliverables**:
- Real-time analytics dashboard
- Performance reports
- Export functionality

---

#### TASK 6: Webhook Notifications (8 hours)
**Priority**: MEDIUM

**Features**:
- Partner event webhooks
- Real-time notifications
- Webhook signature verification
- Retry logic
- Event logging

**Files to Create**:
- `src/services/WebhookService.js`
- `src/routes/partner-webhooks.js`

**Deliverables**:
- Webhook system
- Event notifications
- Partner integrations

---

#### TASK 7: Advanced Dashboard (10 hours)
**Priority**: MEDIUM

**Features**:
- Interactive charts
- Date range filters
- Export to CSV/PDF
- Performance insights
- Earnings projections

**Files to Update**:
- `public/partner-dashboard.html`
- Add Chart.js library

**Deliverables**:
- Enhanced dashboard
- Visual analytics
- Reporting tools

---

## 🔧 Technical Implementation

### Commission Calculation Logic

```javascript
class CommissionCalculationService {
  async calculateSignupCommission(referral, user) {
    const partner = await this.getPartner(referral.partner_id);
    const rate = partner.commission_rate / 100;
    
    // Signup bonus
    const signupBonus = this.getSignupBonus(partner.tier);
    
    return {
      type: 'signup',
      amount: signupBonus,
      partner_id: partner.id,
      referral_id: referral.id,
      user_id: user.id
    };
  }

  async calculateRecurringCommission(partner, transaction) {
    const rate = partner.commission_rate / 100;
    const amount = transaction.amount * rate;
    
    // Apply volume bonuses
    const bonus = await this.calculateVolumeBonus(partner);
    
    return {
      type: 'recurring',
      amount: amount * (1 + bonus),
      partner_id: partner.id,
      transaction_id: transaction.id
    };
  }

  getSignupBonus(tier) {
    const bonuses = {
      tier1: 50,
      tier2: 100,
      tier3: 500,
      tier4: 200
    };
    return bonuses[tier] || 50;
  }
}
```

---

### Payout Processing Flow

```javascript
class PayoutService {
  async requestPayout(partnerId, amount) {
    // Check minimum threshold
    const partner = await this.getPartner(partnerId);
    const minimum = this.getMinimumPayout(partner.tier);
    
    if (amount < minimum) {
      throw new Error(`Minimum payout is $${minimum}`);
    }

    // Check available balance
    const balance = await this.getAvailableBalance(partnerId);
    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create payout request
    const payout = await this.createPayout({
      partner_id: partnerId,
      amount,
      status: 'pending'
    });

    // Process via Stripe
    await this.processStripeTransfer(payout);
    
    return payout;
  }

  async processStripeTransfer(payout) {
    // Stripe Connect transfer
    const transfer = await stripe.transfers.create({
      amount: payout.amount * 100,
      currency: 'usd',
      destination: payout.stripe_account_id
    });

    await this.updatePayout(payout.id, {
      status: 'completed',
      stripe_transfer_id: transfer.id
    });
  }
}
```

---

## ⚠️ Pending (Important - Database Required)

### Database-Dependent Features

**Status**: Code ready, waiting for PostgreSQL connection

1. **Partner Registration**
   - Schema: ✅ Ready
   - Code: ✅ Ready
   - Database: ❌ Not connected

2. **Referral Tracking**
   - Schema: ✅ Ready
   - Frontend: ✅ Ready
   - Backend: ⚠️ Using memory store (temporary)

3. **Commission Calculation**
   - Schema: ✅ Ready
   - Logic: ❌ Not built yet (Phase 2)

4. **Payout System**
   - Schema: ✅ Ready
   - Implementation: ❌ Not built yet (Phase 2)

---

## 🎯 Success Metrics

### Phase 2 Goals

**Week 2 Targets**:
- ✅ 100% automated commission calculation
- ✅ Real-time click tracking
- ✅ Conversion attribution working
- ✅ Payout system functional

**Week 3 Targets**:
- ✅ Advanced analytics live
- ✅ Webhook system operational
- ✅ 50+ partners using system
- ✅ $10K+ in commissions processed

---

## 📦 Dependencies

### Required for Phase 2

1. **PostgreSQL Database** (CRITICAL)
   - Run migration: `004_partner_affiliate_schema.sql`
   - Connect to production database

2. **Stripe Connect** (for payouts)
   - Create Stripe account
   - Set up Connect platform
   - Get API keys

3. **Job Scheduler** (for automation)
   - Install: `node-cron` or `bull`
   - Set up daily/hourly jobs

4. **Analytics Library** (for dashboard)
   - Install: `chart.js`
   - Add to frontend

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Set up PostgreSQL** (1 hour)
   ```bash
   # Install PostgreSQL
   brew install postgresql
   
   # Start service
   brew services start postgresql
   
   # Run migration
   psql -d atlanticfrewaycard -f database/migrations/004_partner_affiliate_schema.sql
   ```

2. **Start with TASK 1** (Click Tracking)
   - Easiest to implement
   - High impact
   - No external dependencies

3. **Then TASK 3** (Commission Calculation)
   - Core functionality
   - Enables payouts
   - Critical for partners

---

## 📝 Notes

- All Phase 2 tasks are independent
- Can be implemented in parallel
- Memory store works as fallback
- Database migration is seamless
- Zero downtime deployment

---

**Status**: 📋 Ready to Start
**Priority**: HIGH
**Estimated Time**: 70 hours (2-3 weeks)
**Team Size**: 1-2 developers
