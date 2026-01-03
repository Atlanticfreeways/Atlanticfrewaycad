const fc = require('fast-check');
const JITFundingService = require('../../../src/services/marqeta/JITFundingService');
const { RedisAdapter } = require('../../../src/adapters/RedisAdapter');
const { PostgresAdapter } = require('../../../src/adapters/PostgresAdapter');

describe('JIT Funding Service - Property-Based Tests', () => {
  let jitService;
  let redisAdapter;
  let postgresAdapter;

  beforeAll(async () => {
    redisAdapter = new RedisAdapter();
    postgresAdapter = new PostgresAdapter();
    jitService = new JITFundingService(postgresAdapter, redisAdapter);
    await redisAdapter.connect();
    await postgresAdapter.connect();
  });

  afterAll(async () => {
    await redisAdapter.disconnect();
    await postgresAdapter.disconnect();
  });

  // Arbitraries for generating test data
  const userIdArbitrary = fc.integer({ min: 1, max: 10000 }).map(id => `user_${id}`);
  const cardIdArbitrary = fc.integer({ min: 1, max: 10000 }).map(id => `card_${id}`);
  const amountArbitrary = fc.integer({ min: 1, max: 100000 });
  const merchantArbitrary = fc.oneof(
    fc.constant('RESTRICTED_MERCHANT'),
    fc.integer({ min: 1, max: 1000 }).map(id => `merchant_${id}`)
  );

  describe('Property 1: Authorization Decision Consistency', () => {
    it('should produce same authorization decision for identical transactions', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, amountArbitrary, merchantArbitrary, async (userId, cardId, amount, merchant) => {
          const transaction = { userId, cardId, amount, merchant, timestamp: Date.now() };
          
          // Mock user and card data
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 100000
          }), 3600);

          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          // First authorization
          const result1 = await jitService.authorizeTransaction(transaction);
          
          // Second authorization with same data
          const result2 = await jitService.authorizeTransaction(transaction);

          // Both should have same decision
          expect(result1.approved).toBe(result2.approved);
          expect(result1.reason).toBe(result2.reason);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Spending Limit Enforcement', () => {
    it('should enforce daily spending limits consistently', () => {
      fc.assert(
        fc.property(
          userIdArbitrary,
          cardIdArbitrary,
          fc.array(amountArbitrary, { minLength: 1, maxLength: 10 }),
          async (userId, cardId, amounts) => {
            const dailyLimit = 50000;

            // Setup card with daily limit
            await redisAdapter.set(`card:${cardId}`, JSON.stringify({
              id: cardId,
              userId,
              status: 'active',
              dailyLimit,
              monthlyLimit: 500000,
              spentToday: 0,
              spentThisMonth: 0
            }), 900);

            // Setup user
            await redisAdapter.set(`user:${userId}`, JSON.stringify({
              id: userId,
              status: 'active',
              balance: 1000000
            }), 3600);

            // Process transactions
            let cumulativeSpent = 0;
            for (const amount of amounts) {
              const transaction = {
                userId,
                cardId,
                amount,
                merchant: `merchant_${Math.random()}`,
                timestamp: Date.now()
              };

              const result = await jitService.authorizeTransaction(transaction);
              cumulativeSpent += amount;

              // If cumulative exceeds limit, should be denied
              if (cumulativeSpent > dailyLimit) {
                expect(result.approved).toBe(false);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 3: Merchant Restriction Validation', () => {
    it('should consistently deny restricted merchants', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, amountArbitrary, async (userId, cardId, amount) => {
          const restrictedMerchant = 'RESTRICTED_MERCHANT';

          // Setup card
          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0,
            restrictedMerchants: [restrictedMerchant]
          }), 900);

          // Setup user
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 100000
          }), 3600);

          const transaction = {
            userId,
            cardId,
            amount,
            merchant: restrictedMerchant,
            timestamp: Date.now()
          };

          const result = await jitService.authorizeTransaction(transaction);
          expect(result.approved).toBe(false);
          expect(result.reason).toContain('restricted');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Balance Validation', () => {
    it('should deny transactions exceeding available balance', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, async (userId, cardId) => {
          const balance = 1000;
          const amount = 5000;

          // Setup user with low balance
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance
          }), 3600);

          // Setup card
          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          const transaction = {
            userId,
            cardId,
            amount,
            merchant: `merchant_${Math.random()}`,
            timestamp: Date.now()
          };

          const result = await jitService.authorizeTransaction(transaction);
          expect(result.approved).toBe(false);
          expect(result.reason).toContain('balance');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Card Status Validation', () => {
    it('should deny transactions on inactive cards', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, amountArbitrary, async (userId, cardId, amount) => {
          // Setup user
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 100000
          }), 3600);

          // Setup inactive card
          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'inactive',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          const transaction = {
            userId,
            cardId,
            amount,
            merchant: `merchant_${Math.random()}`,
            timestamp: Date.now()
          };

          const result = await jitService.authorizeTransaction(transaction);
          expect(result.approved).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Latency Bounds', () => {
    it('should complete authorization within latency bounds', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, amountArbitrary, async (userId, cardId, amount) => {
          // Setup user
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 100000
          }), 3600);

          // Setup card
          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          const transaction = {
            userId,
            cardId,
            amount,
            merchant: `merchant_${Math.random()}`,
            timestamp: Date.now()
          };

          const result = await jitService.authorizeTransaction(transaction);
          
          // Latency should be tracked
          expect(result.latency).toBeDefined();
          expect(result.latency).toBeLessThan(100);
          expect(result.stages).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Deterministic Behavior with Edge Cases', () => {
    it('should handle boundary amounts consistently', () => {
      fc.assert(
        fc.property(
          userIdArbitrary,
          cardIdArbitrary,
          fc.oneof(
            fc.constant(0),
            fc.constant(1),
            fc.constant(50000),
            fc.constant(50001),
            fc.constant(999999)
          ),
          async (userId, cardId, amount) => {
            // Setup user
            await redisAdapter.set(`user:${userId}`, JSON.stringify({
              id: userId,
              status: 'active',
              balance: 1000000
            }), 3600);

            // Setup card
            await redisAdapter.set(`card:${cardId}`, JSON.stringify({
              id: cardId,
              userId,
              status: 'active',
              dailyLimit: 50000,
              monthlyLimit: 500000,
              spentToday: 0,
              spentThisMonth: 0
            }), 900);

            const transaction = {
              userId,
              cardId,
              amount,
              merchant: `merchant_${Math.random()}`,
              timestamp: Date.now()
            };

            const result = await jitService.authorizeTransaction(transaction);
            
            // Should always return a decision
            expect(result.approved).toBeDefined();
            expect(typeof result.approved).toBe('boolean');
            expect(result.reason).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: No Unexpected Exceptions', () => {
    it('should handle all random inputs without throwing', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, amountArbitrary, merchantArbitrary, async (userId, cardId, amount, merchant) => {
          // Setup minimal data
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 100000
          }), 3600);

          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          const transaction = {
            userId,
            cardId,
            amount,
            merchant,
            timestamp: Date.now()
          };

          // Should not throw
          const result = await jitService.authorizeTransaction(transaction);
          expect(result).toBeDefined();
          expect(result.approved).toBeDefined();
        }),
        { numRuns: 200 }
      );
    });
  });

  describe('Property 9: Cumulative Spending Consistency', () => {
    it('should track cumulative spending consistently across multiple transactions', () => {
      fc.assert(
        fc.property(
          userIdArbitrary,
          cardIdArbitrary,
          fc.array(fc.integer({ min: 100, max: 5000 }), { minLength: 2, maxLength: 5 }),
          async (userId, cardId, amounts) => {
            // Setup user with high balance
            await redisAdapter.set(`user:${userId}`, JSON.stringify({
              id: userId,
              status: 'active',
              balance: 1000000
            }), 3600);

            // Setup card
            await redisAdapter.set(`card:${cardId}`, JSON.stringify({
              id: cardId,
              userId,
              status: 'active',
              dailyLimit: 100000,
              monthlyLimit: 1000000,
              spentToday: 0,
              spentThisMonth: 0
            }), 900);

            let totalSpent = 0;
            const results = [];

            for (const amount of amounts) {
              const transaction = {
                userId,
                cardId,
                amount,
                merchant: `merchant_${Math.random()}`,
                timestamp: Date.now()
              };

              const result = await jitService.authorizeTransaction(transaction);
              results.push(result);
              
              if (result.approved) {
                totalSpent += amount;
              }
            }

            // Verify cumulative spending logic
            expect(results.length).toBe(amounts.length);
            expect(totalSpent).toBeLessThanOrEqual(100000);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 10: Idempotency of Denied Transactions', () => {
    it('should consistently deny the same invalid transaction', () => {
      fc.assert(
        fc.property(userIdArbitrary, cardIdArbitrary, async (userId, cardId) => {
          // Setup user with no balance
          await redisAdapter.set(`user:${userId}`, JSON.stringify({
            id: userId,
            status: 'active',
            balance: 0
          }), 3600);

          // Setup card
          await redisAdapter.set(`card:${cardId}`, JSON.stringify({
            id: cardId,
            userId,
            status: 'active',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            spentToday: 0,
            spentThisMonth: 0
          }), 900);

          const transaction = {
            userId,
            cardId,
            amount: 1000,
            merchant: 'test_merchant',
            timestamp: Date.now()
          };

          // Multiple attempts should all be denied
          const result1 = await jitService.authorizeTransaction(transaction);
          const result2 = await jitService.authorizeTransaction(transaction);
          const result3 = await jitService.authorizeTransaction(transaction);

          expect(result1.approved).toBe(false);
          expect(result2.approved).toBe(false);
          expect(result3.approved).toBe(false);
        }),
        { numRuns: 50 }
      );
    });
  });
});
