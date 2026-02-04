const logger = require('../utils/logger');

class LedgerService {
    constructor(repositories, notificationService = null) {
        this.ledgerRepo = repositories.ledger;
        this.userRepo = repositories.user;
        this.notification = notificationService;
    }

    /**
     * Ensure a user has a ledger account. Creates one if missing.
     */
    async getOrCreateUserAccount(userId, userName) {
        let account = await this.ledgerRepo.findAccountByOwner(userId, 'liability');

        if (!account) {
            logger.info(`Creating ledger account for user: ${userId}`);
            account = await this.ledgerRepo.createAccount({
                name: `Wallet Account: ${userName}`,
                code: `2000-WALLET-${userId.substring(0, 8).toUpperCase()}`,
                type: 'liability',
                ownerId: userId,
                currency: 'USD'
            });
        }
        return account;
    }

    /**
     * Record a wallet load (Deposit)
     * Asset (Platform Bank) DR / Liability (User Wallet) CR
     */
    async recordWalletLoad(userId, amount, referenceId, description = 'Wallet Load', isSandbox = false) {
        const user = await this.userRepo.findById(userId);
        const userAccount = await this.getOrCreateUserAccount(userId, `${user.first_name} ${user.last_name}`);

        // Platform Operating Asset Account (Hardcoded code from migration)
        const platformAssetAcc = await this.ledgerRepo.findAccountByCode('1000-ASSET-OP');

        const txId = await this.ledgerRepo.recordTransaction({
            referenceType: 'wallet_load',
            referenceId,
            description,
            entries: [
                { accountId: platformAssetAcc.id, type: 'debit', amount },
                { accountId: userAccount.id, type: 'credit', amount }
            ],
            isSandbox
        });

        this.sendBalanceUpdate(userId);
        return txId;
    }

    /**
     * Record a card spend
     * Liability (User Wallet) DR / Asset (Merchant Settlement) CR
     */
    async recordCardSpend(userId, amount, referenceId, description = 'Card Transaction', isSandbox = false) {
        const user = await this.userRepo.findById(userId);
        const userAccount = await this.getOrCreateUserAccount(userId, `${user.first_name} ${user.last_name}`);

        // Merchant Settlement Asset Account (Hardcoded code from migration)
        const settlementAcc = await this.ledgerRepo.findAccountByCode('1100-ASSET-SETTLE');

        const txId = await this.ledgerRepo.recordTransaction({
            referenceType: 'card_spend',
            referenceId,
            description,
            entries: [
                { accountId: userAccount.id, type: 'debit', amount },
                { accountId: settlementAcc.id, type: 'credit', amount }
            ],
            isSandbox
        });

        this.sendBalanceUpdate(userId);
        return txId;
    }

    /**
     * Record commission payout to partner
     * Equity/Revenue (Platform) DR / Liability (Partner Balance) CR
     */
    async recordCommission(partnerUserId, amount, referenceId, description = 'Partner Commission', isSandbox = false) {
        const partnerAcc = await this.getOrCreateUserAccount(partnerUserId, 'Partner Commission Acc');
        const revenueAcc = await this.ledgerRepo.findAccountByCode('4000-REV-FEES');

        const txId = await this.ledgerRepo.recordTransaction({
            referenceType: 'commission',
            referenceId,
            description,
            entries: [
                { accountId: revenueAcc.id, type: 'debit', amount },
                { accountId: partnerAcc.id, type: 'credit', amount }
            ],
            isSandbox
        });

        this.sendBalanceUpdate(partnerUserId);
        return txId;
    }

    async sendBalanceUpdate(userId) {
        if (this.notification) {
            // Fetch updated balance? Or just tell frontend to refetch?
            // Telling frontend to refetch is safer and easier.
            this.notification.sendUserAlert(userId, 'balance_updated', {
                timestamp: new Date()
            });
        }
    }
}


module.exports = LedgerService;
