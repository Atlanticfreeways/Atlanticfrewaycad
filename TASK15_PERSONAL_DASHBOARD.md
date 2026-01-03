# 🎯 Task 15: Personal Dashboard - PLANNED

**Task**: Personal Dashboard Implementation
**Priority**: HIGH | **Effort**: 1.5 weeks | **Status**: 📋 PLANNED
**Week**: Week 9

---

## 📋 Personal Dashboard Pages

### 1. Dashboard Home (Overview)
**File**: `app/personal/dashboard/page.tsx`

```typescript
// Key Metrics
- Account Balance
- Active Cards
- Monthly Spend
- Total Transactions

// Quick Actions
- Create Card
- Add Funds
- View Transactions
- Manage Wallet

// Recent Transactions
- Latest 5 transactions
- Transaction status
- Amount and merchant
```

### 2. Account Setup
**File**: `app/personal/account/page.tsx`

```typescript
// Features
- Personal profile
- KYC verification status
- Account settings
- Security settings
- Notification preferences
- API keys

// API Endpoints
- GET /personal/account
- PUT /personal/account
- POST /personal/kyc
- GET /personal/kyc/status
```

### 3. Card Management
**File**: `app/personal/cards/page.tsx`

```typescript
// Features
- List all cards
- Create virtual card
- View card details
- Freeze/unfreeze card
- Set spending limits
- View card transactions
- Delete card

// API Endpoints
- GET /personal/cards
- POST /personal/cards
- PUT /personal/cards/:id
- DELETE /personal/cards/:id
```

### 4. Wallet Management
**File**: `app/personal/wallet/page.tsx`

```typescript
// Features
- View wallet balance
- Add funds (crypto/bank)
- Withdraw funds
- View funding history
- Set auto-reload
- View exchange rates

// API Endpoints
- GET /personal/wallet
- POST /personal/wallet/deposit
- POST /personal/wallet/withdraw
- GET /personal/wallet/history
```

### 5. Transaction History
**File**: `app/personal/transactions/page.tsx`

```typescript
// Features
- List all transactions
- Filter by date
- Filter by merchant
- Filter by amount
- Search transactions
- Export transactions
- View transaction details

// API Endpoints
- GET /personal/transactions
- GET /personal/transactions/:id
- GET /personal/transactions/export
```

### 6. KYC Verification
**File**: `app/personal/kyc/page.tsx`

```typescript
// Features
- KYC status
- Upload documents
- Verify identity
- Verify address
- View verification history
- Resubmit if rejected

// API Endpoints
- GET /personal/kyc
- POST /personal/kyc/submit
- POST /personal/kyc/documents
- GET /personal/kyc/status
```

### 7. Settings
**File**: `app/personal/settings/page.tsx`

```typescript
// Features
- Profile settings
- Security settings
- Notification preferences
- Privacy settings
- Connected accounts
- API keys
- Account deletion

// API Endpoints
- GET /personal/settings
- PUT /personal/settings
- POST /personal/settings/password
```

---

## 🔧 Components to Create

### Common Components
```
components/common/
├── Header.tsx
├── Sidebar.tsx
├── Footer.tsx
├── Table.tsx
├── Modal.tsx
├── Form.tsx
└── Loading.tsx
```

### Personal Components
```
components/personal/
├── CardForm.tsx
├── WalletForm.tsx
├── TransactionTable.tsx
├── KYCForm.tsx
├── BalanceCard.tsx
└── QuickActions.tsx
```

---

## 📊 Data Models

### PersonalAccount
```typescript
interface PersonalAccount {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  balance: number;
  activeCards: number;
  createdAt: string;
}
```

### VirtualCard
```typescript
interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  status: 'active' | 'frozen' | 'inactive';
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
  spentThisMonth: number;
  createdAt: string;
}
```

### Wallet
```typescript
interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  fundingMethods: FundingMethod[];
  autoReload: boolean;
  autoReloadAmount: number;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  merchant: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}
```

### KYC
```typescript
interface KYC {
  id: string;
  userId: string;
  status: 'pending' | 'verified' | 'rejected';
  documents: Document[];
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}
```

---

## 🎯 Implementation Steps

### Step 1: Create Layout
- [ ] Create personal layout wrapper
- [ ] Add sidebar navigation
- [ ] Add header with user info
- [ ] Add footer

### Step 2: Create Dashboard Home
- [ ] Fetch account metrics
- [ ] Display key metrics
- [ ] Add quick actions
- [ ] Show recent transactions

### Step 3: Create Account Setup
- [ ] Display account info
- [ ] Edit profile form
- [ ] Security settings
- [ ] Notification preferences

### Step 4: Create Card Management
- [ ] List cards
- [ ] Create card form
- [ ] Freeze/unfreeze cards
- [ ] Set spending limits

### Step 5: Create Wallet Management
- [ ] Display wallet balance
- [ ] Add funds form
- [ ] Withdraw funds form
- [ ] View funding history

### Step 6: Create Transaction History
- [ ] List transactions
- [ ] Filter transactions
- [ ] Search transactions
- [ ] Export transactions

### Step 7: Create KYC Verification
- [ ] Display KYC status
- [ ] Upload documents
- [ ] Verify identity
- [ ] Verify address

### Step 8: Create Settings
- [ ] Profile settings
- [ ] Security settings
- [ ] Notification preferences
- [ ] API keys

---

## 📈 API Integration

### Authentication
```typescript
// All requests include JWT token
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Wallet Funding
```typescript
// Crypto funding
POST /personal/wallet/crypto
{
  amount: number,
  currency: string,
  walletAddress: string
}

// Bank transfer
POST /personal/wallet/bank
{
  amount: number,
  bankAccount: string
}
```

### Card Operations
```typescript
// Create card
POST /personal/cards
{
  dailyLimit: number,
  monthlyLimit: number
}

// Freeze card
PUT /personal/cards/:id
{
  status: 'frozen'
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- Form validation
- Data formatting

### Integration Tests
- API integration
- Authentication flow
- Wallet operations
- Card management

### E2E Tests
- Complete user workflows
- Card creation
- Fund transfers
- Transaction viewing

---

## 📊 Task 15 Progress

| Subtask | Status | Effort |
|---------|--------|--------|
| Dashboard Home | 📋 PLANNED | 2 days |
| Account Setup | 📋 PLANNED | 2 days |
| Card Management | 📋 PLANNED | 2 days |
| Wallet Management | 📋 PLANNED | 2 days |
| Transaction History | 📋 PLANNED | 2 days |
| KYC Verification | 📋 PLANNED | 2 days |
| Settings | 📋 PLANNED | 1 day |
| **Total** | **📋** | **1.5 weeks** |

---

## 🎯 Success Criteria

- [ ] All pages functional
- [ ] API integration complete
- [ ] User authentication working
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] Data persistence
- [ ] Wallet operations working
- [ ] Card management working

---

## 🚀 Next Tasks

### Task 16: Admin Dashboard (Week 10)
- Dashboard home
- User management
- Company management
- Analytics
- Compliance monitoring
- System health

---

**Status**: 📋 Task 15 Planned

**Timeline**: Week 9 (1.5 weeks)

**Next**: Task 16 - Admin Dashboard
