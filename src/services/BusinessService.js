const userAdapter = require('../adapters/marqeta/UserAdapter');
const cardAdapter = require('../adapters/marqeta/CardAdapter');
const { NotFoundError } = require('../errors/AppError');

class BusinessService {
  constructor(repositories) {
    this.userRepo = repositories.user;
    this.companyRepo = repositories.company;
    this.cardRepo = repositories.card;
    this.transactionRepo = repositories.transaction;
    this.spendingControlRepo = repositories.spendingControl;
  }

  async createCompany(companyData) {
    const cardProduct = await cardAdapter.createCardProduct({
      name: `${companyData.name} Corporate Card`
    });

    return await this.companyRepo.create({
      name: companyData.name,
      cardProductToken: cardProduct.token,
      settings: companyData.settings || {}
    });
  }

  async addEmployee(companyId, employeeData) {
    const company = await this.companyRepo.findById(companyId);
    if (!company) throw new NotFoundError('Company');

    const marqetaUser = await userAdapter.createUser({
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      phone: employeeData.phone
    });

    const passwordHash = await require('../services/auth/PasswordService').hash(employeeData.password);

    return await this.userRepo.create({
      email: employeeData.email,
      passwordHash,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      phone: employeeData.phone,
      accountType: 'business',
      role: employeeData.role || 'employee',
      companyId,
      marqetaUserToken: marqetaUser.token
    });
  }

  async issueCorporateCard(employeeId, cardConfig) {
    const employee = await this.userRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee');

    const company = await this.companyRepo.findById(employee.company_id);
    if (!company) throw new NotFoundError('Company');

    const marqetaCard = await cardAdapter.issueCard({
      userToken: employee.marqeta_user_token,
      cardProductToken: company.card_product_token
    });

    const card = await this.cardRepo.create({
      userId: employeeId,
      marqetaCardToken: marqetaCard.token,
      cardType: 'corporate',
      status: 'active',
      lastFour: marqetaCard.last_four,
      metadata: { cardProductToken: company.card_product_token }
    });

    if (cardConfig.dailyLimit || cardConfig.monthlyLimit) {
      await this.spendingControlRepo.create(card.id, {
        dailyLimit: cardConfig.dailyLimit,
        monthlyLimit: cardConfig.monthlyLimit,
        merchantRestrictions: cardConfig.merchantRestrictions || [],
        locationRestrictions: cardConfig.locationRestrictions || {},
        timeRestrictions: cardConfig.timeRestrictions || {}
      });
    }

    return card;
  }

  async getExpenseReport(companyId, filters = {}) {
    const employees = await this.userRepo.findByCompany(companyId);
    const employeeIds = employees.map(e => e.id);

    const transactions = [];
    for (const empId of employeeIds) {
      const empTxs = await this.transactionRepo.findByUser(empId, filters.limit || 100);
      transactions.push(...empTxs);
    }

    return {
      company_id: companyId,
      total_transactions: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      transactions: transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    };
  }

  async updateSpendingControls(cardId, controls) {
    const card = await this.cardRepo.findById(cardId);
    if (!card) throw new NotFoundError('Card');

    const existing = await this.spendingControlRepo.findByCard(cardId);
    
    if (existing) {
      return await this.spendingControlRepo.update(cardId, controls);
    } else {
      return await this.spendingControlRepo.create(cardId, controls);
    }
  }
}

module.exports = BusinessService;
