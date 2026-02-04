const { ValidationError, ForbiddenError } = require('../errors/AppError');

class JITFundingService {
  constructor(repositories, services = {}) {
    this.userRepo = repositories.user;
    this.cardRepo = repositories.card;
    this.spendingControlRepo = repositories.spendingControl;
    this.transactionRepo = repositories.transaction;
    this.exchangeRateService = services.exchangeRate;
    this.conversionLogger = services.conversionLogger;
    this.ledger = services.ledger;
    this.notification = services.notification;
    this.fraud = services.fraud;
  }

  /**
   * Authorize a transaction in real-time
   * Delegates to Go service via RPC for high performance
   * Target: <100ms response time
   */
  async authorizeTransaction(transactionData, req = {}) {
    const startTime = Date.now();
    const traceSteps = []; // Visualizer Access Log

    const addStep = (name, status, metadata = {}) => {
      traceSteps.push({
        name,
        status,
        metadata,
        timestamp: new Date().toISOString()
      });
    };

    const { marqetaToken } = transactionData;

    try {
      // Step 0: Try RPC call for performance (Mocking the Go service call)
      if (process.env.USE_GO_RPC === 'true') {
        try {
          const decision = await this.callGoRPC(transactionData);
          addStep('RPC_Response', decision.approved ? 'PASS' : 'FAIL', { reason: decision.reason });

          await this.saveTrace(marqetaToken, traceSteps, decision.approved, Date.now() - startTime);

          return {
            approved: decision.approved,
            reason: decision.reason,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          };
        } catch (rpcError) {
          console.error('Go JIT RPC failed, falling back to Node:', rpcError.message);
          addStep('RPC_Call', 'ERROR', { error: rpcError.message });
          // Fallthrough to local logic...
        }
      }

      // Legacy Node Logic (Fallback)
      const { cardId, amount, merchantName, merchantCategory } = transactionData;
      const isSandboxRequest = req.user?.isSandbox || false;

      // Phase 7: Sandbox Magic Amounts
      if (isSandboxRequest) {
        const amountStr = amount.toString();
        if (amountStr.endsWith('.99')) {
          addStep('Sandbox_Magic_Amount', 'AUTO_APPROVE', { amount });
          await this.updateSpendingCounters(cardId, amount);
          if (this.ledger) {
            try {
              await this.ledger.recordCardSpend(req.user.id, amount, marqetaToken, `Sandbox Magic Approval for ${merchantName}`, true);
            } catch (le) {
              console.error('Sandbox Ledger error (Non-blocking):', le);
            }
          }
          this.sendTransactionAlert(req.user.id, true, amount, merchantName, 'SANDBOX_MAGIC_APPROVED');
          return this.createDecision(true, 'SANDBOX_MAGIC_APPROVED', startTime);
        }
        if (amountStr.endsWith('.00')) {
          addStep('Sandbox_Magic_Amount', 'AUTO_DECLINE', { amount });
          this.sendTransactionAlert(req.user.id, false, amount, merchantName, 'SANDBOX_MAGIC_DECLINED');
          return this.createDecision(false, 'SANDBOX_MAGIC_DECLINED', startTime);
        }
      }

      // Step 1: Get card details
      const card = await this.cardRepo.findById(cardId);
      if (!card) {
        addStep('Card_Lookup', 'FAIL', { cardId });
        await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
        return this.createDecision(false, 'CARD_NOT_FOUND', startTime);
      }
      addStep('Card_Lookup', 'PASS', { status: card.status });

      if (card.status !== 'active') {
        addStep('Card_Status_Check', 'FAIL', { status: card.status });
        await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
        this.sendTransactionAlert(card.user_id, false, amount, merchantName, 'CARD_INACTIVE');
        return this.createDecision(false, 'CARD_INACTIVE', startTime);
      }
      addStep('Card_Status_Check', 'PASS');

      // Step 2: Get user details
      const user = await this.userRepo.findById(card.user_id);
      if (!user) {
        addStep('User_Lookup', 'FAIL', { userId: card.user_id });
        await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
        // Can't alert user if user not found
        return this.createDecision(false, 'USER_NOT_FOUND', startTime);
      }
      addStep('User_Lookup', 'PASS', { userId: user.id, type: user.account_type });

      // Phase 9: Advanced Fraud Detection
      if (this.fraud) {
        const fraudCheck = await this.fraud.evaluateTransaction({
          cardId,
          amount,
          merchantCategory,
          country: transactionData.merchantCountry || 'US', // Default
          merchantName
        });

        if (!fraudCheck.approved) {
          addStep('Fraud_Check', 'FAIL', { reason: fraudCheck.reason, score: fraudCheck.riskScore });
          await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
          this.sendTransactionAlert(user.id, false, amount, merchantName, `FRAUD_BLOCK: ${fraudCheck.reason}`);
          return this.createDecision(false, fraudCheck.reason, startTime);
        }
        addStep('Fraud_Check', 'PASS', { score: fraudCheck.riskScore });
      }

      // Step 3: Check spending limits
      const spendingCheck = await this.checkSpendingLimits(cardId, amount);
      if (!spendingCheck.allowed) {
        addStep('Spending_Limits', 'FAIL', { reason: spendingCheck.reason });
        await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
        this.sendTransactionAlert(user.id, false, amount, merchantName, spendingCheck.reason);
        return this.createDecision(false, spendingCheck.reason, startTime);
      }
      addStep('Spending_Limits', 'PASS');

      // Step 4: Check merchant restrictions
      const merchantCheck = await this.checkMerchantRestrictions(cardId, merchantName, merchantCategory);
      if (!merchantCheck.allowed) {
        addStep('Merchant_Controls', 'FAIL', { merchant: merchantName, reason: merchantCheck.reason });
        await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
        this.sendTransactionAlert(user.id, false, amount, merchantName, merchantCheck.reason);
        return this.createDecision(false, merchantCheck.reason, startTime);
      }
      addStep('Merchant_Controls', 'PASS', { merchant: merchantName });

      // Step 5: Check balance
      if (user.account_type === 'personal') {
        const balanceCheck = await this.checkBalance(user.id, amount, 'USD');
        if (!balanceCheck.allowed) {
          addStep('Balance_Check', 'FAIL', { reason: balanceCheck.reason, required: amount });
          await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
          this.sendTransactionAlert(user.id, false, amount, merchantName, balanceCheck.reason);
          return this.createDecision(false, balanceCheck.reason, startTime);
        }
        addStep('Balance_Check', 'PASS', { currency: 'USD' });
      }

      // Final Approval
      await this.updateSpendingCounters(cardId, amount);
      addStep('Final_Approval', 'APPROVED');
      await this.saveTrace(marqetaToken, traceSteps, true, Date.now() - startTime);

      // Phase 3/7: Ledger Integration
      if (this.ledger) {
        try {
          await this.ledger.recordCardSpend(user.id, amount, marqetaToken, `JIT Authorization for ${merchantName}`, isSandboxRequest);
        } catch (ledgerError) {
          console.error('Ledger error during JIT (Non-blocking):', ledgerError);
        }
      }

      this.sendTransactionAlert(user.id, true, amount, merchantName, 'APPROVED');
      return this.createDecision(true, 'APPROVED', startTime);

    } catch (error) {
      console.error('JIT Funding error:', error);
      addStep('System_Error', 'CRASH', { error: error.message });
      await this.saveTrace(marqetaToken, traceSteps, false, Date.now() - startTime);
      return this.createDecision(false, 'SYSTEM_ERROR', startTime);
    }
  }

  createDecision(approved, reason, startTime) {
    return {
      approved,
      reason,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };
  }

  async saveTrace(token, steps, approved, latency) {
    try {
      if (this.userRepo && this.userRepo.pool) {
        await this.userRepo.pool.query(
          `INSERT INTO jit_execution_traces (marqeta_event_token, steps, final_decision, total_latency_ms) VALUES ($1, $2, $3, $4)`,
          [token, JSON.stringify(steps), approved ? 'APPROVED' : 'DECLINED', latency]
        );
      }
    } catch (e) {
      console.error('Failed to save JIT trace', e);
    }
  }

  async checkSpendingLimits(cardId, amount) {
    try {
      const controls = await this.spendingControlRepo.findByCard(cardId);
      if (!controls) {
        return { allowed: true };
      }

      if (controls.daily_limit && (controls.current_daily_spend + amount) > controls.daily_limit) {
        return { allowed: false, reason: 'DAILY_LIMIT_EXCEEDED' };
      }

      if (controls.monthly_limit && (controls.current_monthly_spend + amount) > controls.monthly_limit) {
        return { allowed: false, reason: 'MONTHLY_LIMIT_EXCEEDED' };
      }

      return { allowed: true };
    } catch (e) {
      console.error('Spend control check failed:', e);
      return { allowed: true }; // Default to pass if controls fail? Or fail safe?
    }
  }

  async checkMerchantRestrictions(cardId, merchantName, merchantCategory) {
    // In a real implementation, we'd check against a whitelist/blacklist
    return { allowed: true };
  }

  async checkBalance(userId, amount, currency) {
    const WalletRepository = require('../database/repositories/WalletRepository');
    const walletRepo = new WalletRepository(this.userRepo.pool);
    const balance = await walletRepo.getBalance(userId, currency);

    if (balance < amount) {
      return { allowed: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    return { allowed: true };
  }

  async updateSpendingCounters(cardId, amount) {
    try {
      await this.spendingControlRepo.updateCounters(cardId, amount);
    } catch (e) {
      console.error('Failed to update spending counters:', e);
    }
  }

  async callGoRPC(data) {
    // Mock RPC call to the high-performance Go service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ approved: true, reason: 'OK' });
      }, 10);
    });
  }

  async sendTransactionAlert(userId, approved, amount, merchant, reason) {
    if (this.notification) {
      this.notification.sendUserAlert(userId, 'transaction_alert', {
        type: approved ? 'transaction_approved' : 'transaction_declined',
        amount,
        merchant,
        reason,
        timestamp: new Date()
      });
    }
  }
}

module.exports = JITFundingService;