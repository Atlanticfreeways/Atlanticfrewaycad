# ⚡ Quick Start - What To Do First

**For this week (Week 1 of Phase 1)**:

## 🔧 Day 1: Setup & Verification
- [ ] Clone repo: `git clone <url>`
- [ ] Install deps: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Verify PostgreSQL is running
- [ ] Verify MongoDB is running
- [ ] Verify Redis is running
- [ ] Test: `npm test` (should pass existing tests)

## 🗄️ Day 2-3: Database Connection
- [ ] Update `.env` with real DB credentials
- [ ] Run migrations: `npm run migrate:all`
- [ ] Verify tables created in PostgreSQL
- [ ] Test connection: `node -e "const db = require('./src/database/connection'); db.init();"`
- [ ] Implement PostgreSQL adapter with real pool
- [ ] Test adapter: `npm test`

## 🔑 Day 4-5: Real Authentication
- [ ] Replace mock auth with real bcrypt hashing
- [ ] Test user registration with real password storage
- [ ] Test user login with real password verification
- [ ] Test JWT token generation
- [ ] Verify tokens stored in Redis

## 🎴 Day 6-7: Marqeta Setup
- [ ] Register for Marqeta sandbox account
- [ ] Get API credentials
- [ ] Add to `.env`
- [ ] Test API connectivity
- [ ] Create first card product in sandbox

---

## 📋 Key Milestones This Week

| Milestone | Owner | Date | Status |
|-----------|-------|------|--------|
| Database connected & working | Backend | Day 3 | [ ] |
| Real auth system functional | Backend | Day 5 | [ ] |
| Marqeta sandbox account ready | Backend | Day 7 | [ ] |

---

## 🆘 If Stuck...

1. **Database won't connect**
   - Check credentials in `.env`
   - Verify services running: `docker ps`
   - Check logs: `docker-compose logs postgres`

2. **Tests failing**
   - Check Node version: `node -v` (should be 20+)
   - Clear cache: `npm cache clean --force && npm install`
   - Run specific test: `npm test -- --verbose`

3. **Marqeta API issues**
   - Check credentials are correct in `.env`
   - Test endpoint directly with curl
   - Check Marqeta status page

---

## 📞 Daily Standup Questions

- What did I complete?
- What's blocking me?
- What will I complete today?
