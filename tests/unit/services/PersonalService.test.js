const PersonalService = require('../../../src/services/PersonalService');

describe('PersonalService', () => {
  let personalService;
  let mockRepositories;

  beforeEach(() => {
    mockRepositories = {
      user: {
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        query: jest.fn()
      },
      card: {
        findById: jest.fn(),
        create: jest.fn(),
        findByUser: jest.fn(),
        update: jest.fn()
      },
      wallet: {
        create: jest.fn(),
        findByUser: jest.fn(),
        addFunds: jest.fn(),
        recordTransaction: jest.fn(),
        getTransactionHistory: jest.fn()
      },
      transaction: {
        findByUser: jest.fn()
      }
    };

    personalService = new PersonalService(mockRepositories);
  });

  describe('createPersonalAccount', () => {
    it('should create personal account with wallet', async () => {
      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      });

      mockRepositories.user.update.mockResolvedValue({
        id: 'user-123',
        account_type: 'personal'
      });

      mockRepositories.wallet.create.mockResolvedValue({
        id: 'wallet-123',
        user_id: 'user-123',
        balance: 0
      });

      const result = await personalService.createPersonalAccount('user-123', {});

      expect(result.user.account_type).toBe('personal');
      expect(result.wallet.balance).toBe(0);
      expect(mockRepositories.wallet.create).toHaveBeenCalledWith('user-123');
    });
  });

  describe('submitKYCVerification', () => {
    it('should submit KYC verification', async () => {
      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123'
      });

      mockRepositories.user.query.mockResolvedValue({
        rows: [{
          id: 'kyc-123',
          user_id: 'user-123',
          tier: 'tier_1',
          status: 'pending'
        }]
      });

      const result = await personalService.submitKYCVerification('user-123', {
        tier: 'tier_1',
        documents: { id: 'doc-123' }
      });

      expect(result.status).toBe('pending');
      expect(mockRepositories.user.query).toHaveBeenCalled();
    });
  });

  describe('getKYCStatus', () => {
    it('should return KYC status', async () => {
      mockRepositories.user.query.mockResolvedValue({
        rows: [{
          status: 'approved',
          tier: 'tier_2'
        }]
      });

      const result = await personalService.getKYCStatus('user-123');

      expect(result.status).toBe('approved');
      expect(result.tier).toBe('tier_2');
    });

    it('should return not_started if no KYC found', async () => {
      mockRepositories.user.query.mockResolvedValue({
        rows: []
      });

      const result = await personalService.getKYCStatus('user-123');

      expect(result.status).toBe('not_started');
    });
  });

  describe('issuePersonalCard', () => {
    it('should issue personal card', async () => {
      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        marqeta_user_token: 'user-token'
      });

      mockRepositories.cardRepo = {
        create: jest.fn().mockResolvedValue({
          id: 'card-123',
          user_id: 'user-123',
          status: 'active'
        })
      };

      mockRepositories.card.create.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'active'
      });

      const result = await personalService.issuePersonalCard('user-123', {
        nickname: 'My Card'
      });

      expect(result.status).toBe('active');
      expect(mockRepositories.card.create).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockRepositories.user.findById.mockResolvedValue(null);

      await expect(
        personalService.issuePersonalCard('nonexistent', {})
      ).rejects.toThrow('User not found');
    });
  });

  describe('freezeCard', () => {
    it('should freeze card', async () => {
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        marqeta_card_token: 'token-123',
        status: 'active'
      });

      mockRepositories.card.update.mockResolvedValue({
        id: 'card-123',
        status: 'frozen'
      });

      const result = await personalService.freezeCard('card-123', 'user-123');

      expect(result.status).toBe('frozen');
      expect(mockRepositories.card.update).toHaveBeenCalledWith('card-123', { status: 'frozen' });
    });

    it('should throw error if card not found', async () => {
      mockRepositories.card.findById.mockResolvedValue(null);

      await expect(
        personalService.freezeCard('nonexistent', 'user-123')
      ).rejects.toThrow('Card not found');
    });
  });

  describe('getWallet', () => {
    it('should return wallet', async () => {
      mockRepositories.wallet.findByUser.mockResolvedValue({
        id: 'wallet-123',
        user_id: 'user-123',
        balance: 1000
      });

      const result = await personalService.getWallet('user-123');

      expect(result.balance).toBe(1000);
    });
  });

  describe('addFunds', () => {
    it('should add funds to wallet', async () => {
      mockRepositories.wallet.findByUser.mockResolvedValue({
        id: 'wallet-123',
        balance: 1000
      });

      mockRepositories.wallet.addFunds.mockResolvedValue({
        id: 'wallet-123',
        balance: 1500
      });

      mockRepositories.wallet.recordTransaction.mockResolvedValue({
        id: 'tx-123'
      });

      const result = await personalService.addFunds('user-123', 500);

      expect(result.balance).toBe(1500);
      expect(mockRepositories.wallet.recordTransaction).toHaveBeenCalledWith(
        'user-123',
        500,
        'deposit',
        'bank_transfer'
      );
    });

    it('should throw error if wallet not found', async () => {
      mockRepositories.wallet.findByUser.mockResolvedValue(null);

      await expect(
        personalService.addFunds('user-123', 500)
      ).rejects.toThrow('Wallet not found');
    });
  });

  describe('getTransactions', () => {
    it('should return user transactions', async () => {
      mockRepositories.transaction.findByUser.mockResolvedValue([
        { id: 'tx-1', amount: 100 },
        { id: 'tx-2', amount: 200 }
      ]);

      const result = await personalService.getTransactions('user-123');

      expect(result.length).toBe(2);
      expect(result[0].amount).toBe(100);
    });
  });
});