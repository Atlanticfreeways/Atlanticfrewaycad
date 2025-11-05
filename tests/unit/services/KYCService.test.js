const KYCService = require('../../../src/services/KYCService');

describe('KYCService', () => {
  let kycService;
  let mockRepos;

  beforeEach(() => {
    mockRepos = {
      user: {
        findById: jest.fn(),
        update: jest.fn(),
        query: jest.fn()
      }
    };
    kycService = new KYCService(mockRepos);
  });

  describe('checkLimit', () => {
    it('should allow transaction within limit', async () => {
      mockRepos.user.findById.mockResolvedValue({
        id: '1',
        monthly_limit: 5000,
        monthly_spent: 1000,
        limit_reset_at: new Date(Date.now() + 86400000)
      });

      const result = await kycService.checkLimit('1', 500);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4000);
    });

    it('should reject transaction exceeding limit', async () => {
      mockRepos.user.findById.mockResolvedValue({
        id: '1',
        monthly_limit: 5000,
        monthly_spent: 4800,
        limit_reset_at: new Date(Date.now() + 86400000)
      });

      await expect(kycService.checkLimit('1', 500)).rejects.toThrow('Monthly limit exceeded');
    });
  });

  describe('canIssueCard', () => {
    it('should allow visa for atlantic tier', () => {
      expect(kycService.canIssueCard('atlantic', 'visa', 'virtual')).toBe(true);
    });

    it('should reject mastercard for atlantic tier', () => {
      expect(kycService.canIssueCard('atlantic', 'mastercard', 'virtual')).toBe(false);
    });

    it('should allow both networks for business tier', () => {
      expect(kycService.canIssueCard('business', 'visa', 'virtual')).toBe(true);
      expect(kycService.canIssueCard('business', 'mastercard', 'corporate')).toBe(true);
    });
  });
});
