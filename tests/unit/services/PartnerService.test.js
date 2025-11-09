const PartnerService = require('../../../src/services/PartnerService');
const { NotFoundError, ValidationError } = require('../../../src/errors/AppError');

describe('PartnerService', () => {
  let partnerService;
  let mockRepos;

  beforeEach(() => {
    mockRepos = {
      partner: {
        create: jest.fn(),
        findById: jest.fn(),
        findByUserId: jest.fn(),
        update: jest.fn()
      },
      user: {
        findById: jest.fn()
      },
      referral: {
        countByStatus: jest.fn()
      }
    };
    partnerService = new PartnerService(mockRepos);
  });

  describe('registerPartner', () => {
    it('should create a new partner successfully', async () => {
      const userId = 'user-123';
      const user = { 
        id: userId, 
        first_name: 'John', 
        last_name: 'Doe',
        email: 'john@example.com'
      };
      const partnerData = { 
        partner_type: 'affiliate',
        company_name: 'Test Company'
      };

      mockRepos.user.findById.mockResolvedValue(user);
      mockRepos.partner.findByUserId.mockResolvedValue(null);
      mockRepos.partner.create.mockResolvedValue({ 
        id: 'partner-123',
        user_id: userId,
        partner_type: 'affiliate',
        tier: 'tier1',
        referral_code: 'JOHDOE1234',
        commission_rate: 10.00,
        status: 'pending'
      });

      const result = await partnerService.registerPartner(userId, partnerData);

      expect(result).toBeDefined();
      expect(result.partner_type).toBe('affiliate');
      expect(result.tier).toBe('tier1');
      expect(mockRepos.partner.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const userId = 'nonexistent-user';
      mockRepos.user.findById.mockResolvedValue(null);

      await expect(
        partnerService.registerPartner(userId, {})
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if user is already a partner', async () => {
      const userId = 'user-123';
      const user = { id: userId, first_name: 'John', last_name: 'Doe' };
      
      mockRepos.user.findById.mockResolvedValue(user);
      mockRepos.partner.findByUserId.mockResolvedValue({ 
        id: 'partner-123',
        user_id: userId 
      });

      await expect(
        partnerService.registerPartner(userId, {})
      ).rejects.toThrow(ValidationError);
      
      expect(mockRepos.partner.create).not.toHaveBeenCalled();
    });

    it('should assign correct tier based on partner type', async () => {
      const userId = 'user-123';
      const user = { id: userId, first_name: 'John', last_name: 'Doe' };

      mockRepos.user.findById.mockResolvedValue(user);
      mockRepos.partner.findByUserId.mockResolvedValue(null);
      mockRepos.partner.create.mockImplementation((data) => Promise.resolve(data));

      const result = await partnerService.registerPartner(userId, { 
        partner_type: 'reseller' 
      });

      expect(result.tier).toBe('tier2');
    });

    it('should set default commission rate based on tier', async () => {
      const userId = 'user-123';
      const user = { id: userId, first_name: 'John', last_name: 'Doe' };

      mockRepos.user.findById.mockResolvedValue(user);
      mockRepos.partner.findByUserId.mockResolvedValue(null);
      mockRepos.partner.create.mockImplementation((data) => Promise.resolve(data));

      const result = await partnerService.registerPartner(userId, { 
        partner_type: 'whitelabel' 
      });

      expect(result.commission_rate).toBe(50.00);
    });
  });

  describe('getPartnerProfile', () => {
    it('should return partner profile with stats', async () => {
      const partnerId = 'partner-123';
      const partner = {
        id: partnerId,
        user_id: 'user-123',
        partner_type: 'affiliate',
        tier: 'tier1',
        referral_code: 'ABC123',
        status: 'active'
      };

      mockRepos.partner.findById.mockResolvedValue(partner);
      mockRepos.referral.countByStatus.mockResolvedValue(5);

      const result = await partnerService.getPartnerProfile(partnerId);

      expect(result).toBeDefined();
      expect(result.id).toBe(partnerId);
      expect(result.stats).toBeDefined();
      expect(result.stats.total_referrals).toBe(5);
    });

    it('should throw NotFoundError if partner does not exist', async () => {
      mockRepos.partner.findById.mockResolvedValue(null);

      await expect(
        partnerService.getPartnerProfile('nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updatePartner', () => {
    it('should update allowed fields only', async () => {
      const partnerId = 'partner-123';
      const partner = { id: partnerId, company_name: 'Old Name' };
      const updates = {
        company_name: 'New Name',
        settings: { key: 'value' },
        tier: 'tier3', // Should be filtered out
        commission_rate: 50.00 // Should be filtered out
      };

      mockRepos.partner.findById.mockResolvedValue(partner);
      mockRepos.partner.update.mockImplementation((id, data) => 
        Promise.resolve({ ...partner, ...data })
      );

      const result = await partnerService.updatePartner(partnerId, updates);

      expect(mockRepos.partner.update).toHaveBeenCalledWith(
        partnerId,
        expect.objectContaining({
          company_name: 'New Name',
          settings: { key: 'value' }
        })
      );
      expect(mockRepos.partner.update).toHaveBeenCalledWith(
        partnerId,
        expect.not.objectContaining({
          tier: expect.anything(),
          commission_rate: expect.anything()
        })
      );
    });

    it('should throw NotFoundError if partner does not exist', async () => {
      mockRepos.partner.findById.mockResolvedValue(null);

      await expect(
        partnerService.updatePartner('nonexistent', {})
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('generateAPIKey', () => {
    it('should generate API key and secret', async () => {
      const partnerId = 'partner-123';
      const partner = { id: partnerId };

      mockRepos.partner.findById.mockResolvedValue(partner);
      mockRepos.partner.update.mockResolvedValue({ ...partner });

      const result = await partnerService.generateAPIKey(partnerId);

      expect(result).toBeDefined();
      expect(result.api_key).toMatch(/^pk_/);
      expect(result.api_secret).toMatch(/^sk_/);
      expect(mockRepos.partner.update).toHaveBeenCalledWith(
        partnerId,
        expect.objectContaining({
          api_key: expect.stringMatching(/^pk_/),
          api_secret_hash: expect.any(String)
        })
      );
    });

    it('should throw NotFoundError if partner does not exist', async () => {
      mockRepos.partner.findById.mockResolvedValue(null);

      await expect(
        partnerService.generateAPIKey('nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('determineTier', () => {
    it('should map partner types to correct tiers', () => {
      expect(partnerService.determineTier('affiliate')).toBe('tier1');
      expect(partnerService.determineTier('reseller')).toBe('tier2');
      expect(partnerService.determineTier('whitelabel')).toBe('tier3');
      expect(partnerService.determineTier('technology')).toBe('tier4');
    });

    it('should default to tier1 for unknown types', () => {
      expect(partnerService.determineTier('unknown')).toBe('tier1');
    });
  });

  describe('getDefaultCommissionRate', () => {
    it('should return correct commission rates for each tier', () => {
      expect(partnerService.getDefaultCommissionRate('tier1')).toBe(10.00);
      expect(partnerService.getDefaultCommissionRate('tier2')).toBe(25.00);
      expect(partnerService.getDefaultCommissionRate('tier3')).toBe(50.00);
      expect(partnerService.getDefaultCommissionRate('tier4')).toBe(15.00);
    });

    it('should default to 10% for unknown tiers', () => {
      expect(partnerService.getDefaultCommissionRate('unknown')).toBe(10.00);
    });
  });

  describe('generateReferralCode', () => {
    it('should generate referral code from user name', async () => {
      const user = { first_name: 'John', last_name: 'Doe' };
      
      const code = await partnerService.generateReferralCode(user);

      expect(code).toMatch(/^JOHDOE/);
      expect(code.length).toBeGreaterThan(6);
    });

    it('should generate unique codes', async () => {
      const user = { first_name: 'John', last_name: 'Doe' };
      
      const code1 = await partnerService.generateReferralCode(user);
      const code2 = await partnerService.generateReferralCode(user);

      expect(code1).not.toBe(code2);
    });
  });
});
