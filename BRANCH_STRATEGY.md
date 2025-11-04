# 🌿 Atlanticfrewaycard Branch Strategy

## Branch Structure

### **main** 
- **Purpose**: Production-ready, tested features only
- **Protection**: Requires PR approval, all tests must pass
- **Deployment**: Auto-deploys to production
- **Merge Policy**: Only from `development` via PR

### **development**
- **Purpose**: Integration branch for all features
- **Testing**: Comprehensive testing before merge to main
- **Merge Policy**: Features merge here first
- **Deployment**: Staging environment

### **Feature Branches**

#### **feature/business-service**
- **Purpose**: SpendCtrl business functionality
- **Scope**: Corporate cards, expense management, company controls
- **Owner**: Business team
- **Merge to**: `development`

#### **feature/personal-service** 
- **Purpose**: Freeway Cards personal functionality
- **Scope**: Personal cards, crypto funding, KYC verification
- **Owner**: Personal team
- **Merge to**: `development`

#### **feature/database-integration**
- **Purpose**: Database adapters and models
- **Scope**: PostgreSQL, MongoDB, Redis integration
- **Owner**: Backend team
- **Merge to**: `development`

#### **feature/marqeta-integration**
- **Purpose**: Real Marqeta API integration
- **Scope**: Card issuance, webhooks, transaction processing
- **Owner**: Integration team
- **Merge to**: `development`

## Workflow

### Development Flow
1. **Create feature branch** from `development`
2. **Develop and test** feature
3. **Create PR** to `development`
4. **Code review** and approval
5. **Merge** to `development`
6. **Integration testing** in staging
7. **PR from development** to `main`
8. **Production deployment**

### Hotfix Flow
1. **Create hotfix branch** from `main`
2. **Fix critical issue**
3. **PR directly** to `main`
4. **Emergency deployment**
5. **Merge back** to `development`

## Branch Protection Rules

### **main**
- ✅ Require PR reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to admins only
- ✅ Require linear history

### **development**
- ✅ Require PR reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Allow force pushes for maintainers

## Current Status

### ✅ Completed
- [x] Repository initialized
- [x] Branch structure created
- [x] Foundation code pushed
- [x] Branch protection configured

### 🔄 Active Development
- **feature/business-service**: Ready for SpendCtrl implementation
- **feature/personal-service**: Ready for Freeway Cards implementation  
- **feature/database-integration**: Ready for DB adapters
- **feature/marqeta-integration**: Ready for API integration

### 📋 Next Steps
1. **Assign teams** to feature branches
2. **Set up CI/CD** pipeline
3. **Configure staging** environment
4. **Begin parallel** development