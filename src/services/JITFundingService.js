const { ValidationError, ForbiddenError } = require('../errors/AppError');

class JITFundingService {
  constructor(repositories) {
    this.userRepo = repositories.user;
    this.cardRepo = repositories.card;
    this.spendingControlRepo = repositories.spendingControl;
    this.transactionRepo = repositories.transaction;
  }

  /**
   * Authorize a transaction in real-time
   * Target: <100ms response time
   */
  async authorizeTransaction(transactionData) {
    const startTime = Date.now();
    
    try {
      const { cardId, amount, merchantName, merchantCategory } = transactionData;
      
      // Step 1: Get card details (should be cached)
      const card = await this.cardRepo.findById(cardId);
      if (!card) {
        return this.createDecision(false, 'CARD_NOT_FOUND', startTime);
      }

      if (card.status !== 'active') {
        return this.createDecision(false, 'CARD_INACTIVE', startTime);
      }

      // Step 2: Get user details (should be cached)
      const user = await this.userRepo.findById(card.user_id);
      if (!user) {
        return this.createDecision(false, 'USER_NOT_FOUND', startTime);
      }

      // Step 3: Check spending limits
      const spendingCheck = await this.checkSpendingLimits(cardId, amount);
      if (!spendingCheck.allowed) {
        return this.createDecision(false, spendingCheck.reason, startTime);
      }

      // Step 4: Check merchant restrictions
      const merchantCheck = await this.checkMerchantRestrictions(cardId, merchantName, merchantCategory);
      if (!merchantCheck.allowed) {
        return this.createDecision(false, merchantCheck.reason, startTime);
      }

      // Step 5: Check balance (for personal cards)
      if (user.account_type === 'personal') {
        const balanceCheck = await this.checkBalance(user.id, amount);
        if (!balanceCheck.allowed) {
          return this.createDecision(false, balanceCheck.reason, startTime);
        }
      }

      // All checks passed - approve transaction
      await this.updateSpendingCounters(cardId, amount);
      
      return this.createDecision(true, 'APPROVED', startTime);

    } catch (error) {
      console.error('JIT Funding error:', error);
      return this.createDecision(false, 'SYSTEM_ERROR', startTime);
    }
  }

  async checkSpendingLimits(cardId, amount) {
    try {
      const controls = await this.spendingControlRepo.findByCard(cardId);
      if (!controls) {
        return { allowed: true };
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Check daily limit
      if (controls.daily_limit) {
        const dailySpent = await this.getDailySpending(cardId, today);
        if (dailySpent + amount > controls.daily_limit) {
          return { 
            allowed: false, 
            reason: 'DAILY_LIMIT_EXCEEDED',
            details: { limit: controls.daily_limit, spent: dailySpent, attempted: amount }
          };
        }
      }

      // Check monthly limit
      if (controls.monthly_limit) {
        const monthlySpent = await this.getMonthlySpending(cardId, thisMonth);
        if (monthlySpent + amount > controls.monthly_limit) {
          return { 
            allowed: false, 
            reason: 'MONTHLY_LIMIT_EXCEEDED',
            details: { limit: controls.monthly_limit, spent: monthlySpent, attempted: amount }
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking spending limits:', error);
      return { allowed: false, reason: 'LIMIT_CHECK_ERROR' };
    }
  }

  async checkMerchantRestrictions(cardId, merchantName, merchantCategory) {
    try {
      const controls = await this.spendingControlRepo.findByCard(cardId);
      if (!controls || !controls.merchant_restrictions) {
        return { allowed: true };
      }

      const restrictions = JSON.parse(controls.merchant_restrictions);
      
      // Check blocked merchants
      if (restrictions.blocked_merchants && restrictions.blocked_merchants.includes(merchantName)) {
        return { allowed: false, reason: 'MERCHANT_BLOCKED' };
      }

      // Check blocked categories
      if (restrictions.blocked_categories && restrictions.blocked_categories.includes(merchantCategory)) {
        return { allowed: false, reason: 'CATEGORY_BLOCKED' };
      }

      // Check allowed merchants (if whitelist exists)
      if (restrictions.allowed_merchants && restrictions.allowed_merchants.length > 0) {
        if (!restrictions.allowed_merchants.includes(merchantName)) {
          return { allowed: false, reason: 'MERCHANT_NOT_ALLOWED' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking merchant restrictions:', error);
      return { allowed: false, reason: 'MERCHANT_CHECK_ERROR' };
    }
  }

  async checkBalance(userId, amount) {
    try {
      // For personal cards, check wallet balance
      const wallet = await this.userRepo.query(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [userId]
      );

      if (!wallet.rows.length) {
        return { allowed: false, reason: 'WALLET_NOT_FOUND' };
      }

      const balance = parseFloat(wallet.rows[0].balance) || 0;
      if (balance < amount) {
        return { 
          allowed: false, 
          reason: 'INSUFFICIENT_FUNDS',
          details: { balance, attempted: amount }
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking balance:', error);
      return { allowed: false, reason: 'BALANCE_CHECK_ERROR' };
    }
  }

  async getDailySpending(cardId, date) {
    try {
      const result = await this.transactionRepo.query(
        `SELECT COALESCE(SUM(amount), 0) as total 
         FROM transactions 
         WHERE card_id = $1 AND DATE(created_at) = $2 AND status = 'completed'`,
        [cardId, date]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      console.error('Error getting daily spending:', error);
      return 0;
    }
  }

  async getMonthlySpending(cardId, month) {
    try {
      const result = await this.transactionRepo.query(
        `SELECT COALESCE(SUM(amount), 0) as total 
         FROM transactions 
         WHERE card_id = $1 AND DATE_TRUNC('month', created_at) = $2 AND status = 'completed'`,
        [cardId, month + '-01']
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      console.error('Error getting monthly spending:', error);
      return 0;
    }
  }

  async updateSpendingCounters(cardId, amount) {
    try {
      // This could be optimized with Redis counters for better performance
      const now = new Date();
      await this.transactionRepo.query(
        `INSERT INTO spending_counters (card_id, amount, transaction_date) 
         VALUES ($1, $2, $3)
         ON CONFLICT (card_id, transaction_date) 
         DO UPDATE SET amount = spending_counters.amount + $2`,
        [cardId, amount, now.toISOString().split('T')[0]]
      );
    } catch (error) {
      console.error('Error updating spending counters:', error);
      // Don't fail the transaction for counter update errors
    }
  }

  createDecision(approved, reason, startTime) {
    const duration = Date.now() - startTime;
    
    // Log slow decisions for monitoring
    if (duration > 100) {
      console.warn(`Slow JIT funding decision: ${duration}ms`, { reason, approved });
    }

    return {
      approved,
      reason,
      timestamp: new Date().toISOString(),
      processingTime: duration
    };
  }

  /**
   * Process webhook from Marqeta for transaction events
   */
  async processTransactionWebhook(webhookData) {
    try {
      const { type, transaction } = webhookData;
      
      if (type === 'transaction.authorization') {
        // Real-time authorization request
        return await this.authorizeTransaction({
          cardId: transaction.card_token,
          amount: transaction.amount / 100, // Convert from cents
          merchantName: transaction.merchant?.name,
          merchantCategory: transaction.merchant?.mcc
        });
      }

      if (type === 'transaction.clearing') {
        // Transaction cleared - update final records
        await this.recordTransaction(transaction);
      }

      return { processed: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { processed: false, error: error.message };
    }
  }

  async recordTransaction(transactionData) {
    try {
      await this.transactionRepo.create({
        marqetaTransactionToken: transactionData.token,
        cardId: transactionData.card_token,
        amount: transactionData.amount / 100,
        merchantName: transactionData.merchant?.name,
        merchantCategory: transactionData.merchant?.mcc,
        status: transactionData.state,
        transactionType: transactionData.type,
        createdAt: transactionData.created_time
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }
}

module.exports = JITFundingService;