const BusinessService = require('../../../src/services/BusinessService');

describe('BusinessService', () => {
  let businessService;
  let mockRepositories;

  beforeEach(() => {
    mockRepositories = {
      user: {
        findById: jest.fn(),
        create: jest.fn(),
        findByCompany: jest.fn(),
        update: jest.fn(),
        query: jest.fn()
      },
      company: {
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        getStats: jest.fn()
      },
      card: {
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      transaction: {
        findByUser: jest.fn(),
        findByCompany: jest.fn(),
        getSpendingByMerchant: jest.fn(),
        getSpendingByEmployee: jest.fn()
      },
      spendingControl: {
        findByCard: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    };

    businessService = new BusinessService(mockRepositories);
  });

  describe('createCompany', () => {
    it('should create a company with card product', async () => {
      const companyData = {
        name: 'Test Corp',
        settings: { currency: 'USD' }
      };

      mockRepositories.company.create.mockResolvedValue({
        id: 'company-123',
        name: 'Test Corp',
        card_product_token: 'product-token'
      });

      const result = await businessService.createCompany(companyData);

      expect(result.id).toBe('company-123');
      expect(result.name).toBe('Test Corp');
      expect(mockRepositories.company.create).toHaveBeenCalled();
    });
  });

  describe('addEmployee', () => {
    it('should add employee to company', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'employee'
      };

      mockRepositories.company.findById.mockResolvedValue({
        id: 'company-123',
        name: 'Test Corp'
      });

      mockRepositories.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
        company_id: 'company-123'
      });

      const result = await businessService.addEmployee('company-123', employeeData);

      expect(result.email).toBe('john@example.com');
      expect(result.company_id).toBe('company-123');
      expect(mockRepositories.user.create).toHaveBeenCalled();
    });

    it('should throw error if company not found', async () => {
      mockRepositories.company.findById.mockResolvedValue(null);

      await expect(
        businessService.addEmployee('nonexistent', {})
      ).rejects.toThrow('Company not found');
    });
  });

  describe('issueCorporateCard', () => {
    it('should issue corporate card to employee', async () => {
      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        company_id: 'company-123',
        marqeta_user_token: 'user-token'
      });

      mockRepositories.company.findById.mockResolvedValue({
        id: 'company-123',
        card_product_token: 'product-token'
      });

      mockRepositories.card.create.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'active'
      });

      mockRepositories.spendingControl.create.mockResolvedValue({
        id: 'control-123',
        daily_limit: 1000
      });

      const result = await businessService.issueCorporateCard('user-123', {
        dailyLimit: 1000,
        monthlyLimit: 10000
      });

      expect(result.id).toBe('card-123');
      expect(result.status).toBe('active');
      expect(mockRepositories.card.create).toHaveBeenCalled();
    });
  });

  describe('getCompanyStats', () => {
    it('should return company statistics', async () => {
      mockRepositories.company.getStats.mockResolvedValue({
        id: 'company-123',
        name: 'Test Corp',
        employee_count: 5,
        card_count: 5,
        total_spending: 50000
      });

      const result = await businessService.getCompanyStats('company-123');

      expect(result.employee_count).toBe(5);
      expect(result.card_count).toBe(5);
      expect(result.total_spending).toBe(50000);
    });
  });

  describe('getSpendingAnalytics', () => {
    it('should return spending analytics by merchant and employee', async () => {
      mockRepositories.transaction.getSpendingByMerchant.mockResolvedValue([
        { merchant_name: 'Amazon', transaction_count: 10, total_amount: '5000' },
        { merchant_name: 'Office Depot', transaction_count: 5, total_amount: '2000' }
      ]);

      mockRepositories.transaction.getSpendingByEmployee.mockResolvedValue([
        { id: 'user-1', first_name: 'John', last_name: 'Doe', transaction_count: 8, total_amount: '4000' },
        { id: 'user-2', first_name: 'Jane', last_name: 'Smith', transaction_count: 7, total_amount: '3000' }
      ]);

      const result = await businessService.getSpendingAnalytics('company-123', { days: 30 });

      expect(result.totalSpending).toBe(7000);
      expect(result.totalTransactions).toBe(15);
      expect(result.byMerchant.length).toBe(2);
      expect(result.byEmployee.length).toBe(2);
    });
  });

  describe('updateSpendingControls', () => {
    it('should update existing spending controls', async () => {
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123'
      });

      mockRepositories.spendingControl.findByCard.mockResolvedValue({
        id: 'control-123',
        daily_limit: 1000
      });

      mockRepositories.spendingControl.update.mockResolvedValue({
        id: 'control-123',
        daily_limit: 2000
      });

      const result = await businessService.updateSpendingControls('card-123', {
        dailyLimit: 2000
      });

      expect(result.daily_limit).toBe(2000);
      expect(mockRepositories.spendingControl.update).toHaveBeenCalled();
    });

    it('should create new spending controls if none exist', async () => {
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123'
      });

      mockRepositories.spendingControl.findByCard.mockResolvedValue(null);

      mockRepositories.spendingControl.create.mockResolvedValue({
        id: 'control-123',
        daily_limit: 1000
      });

      const result = await businessService.updateSpendingControls('card-123', {
        dailyLimit: 1000
      });

      expect(result.daily_limit).toBe(1000);
      expect(mockRepositories.spendingControl.create).toHaveBeenCalled();
    });
  });

  describe('getExpenseReport', () => {
    it('should generate expense report for company', async () => {
      mockRepositories.user.findByCompany.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' }
      ]);

      mockRepositories.transaction.findByUser
        .mockResolvedValueOnce([
          { id: 'tx-1', amount: 100, created_at: '2024-01-01' }
        ])
        .mockResolvedValueOnce([
          { id: 'tx-2', amount: 200, created_at: '2024-01-02' }
        ]);

      const result = await businessService.getExpenseReport('company-123');

      expect(result.total_transactions).toBe(2);
      expect(result.total_amount).toBe(300);
      expect(result.transactions.length).toBe(2);
    });
  });
});