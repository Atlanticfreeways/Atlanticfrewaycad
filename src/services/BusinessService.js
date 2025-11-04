// Business Service - SpendCtrl functionality
class BusinessService {
  constructor(marqetaAdapter, database) {
    this.marqeta = marqetaAdapter;
    this.db = database;
  }

  // Company management
  async createCompany(companyData) {
    return await this.db.companies.create(companyData);
  }

  // Employee management
  async addEmployee(companyId, employeeData) {
    const employee = await this.db.users.create({
      ...employeeData,
      companyId,
      accountType: 'business',
      role: 'employee'
    });
    
    // Create Marqeta user
    const marqetaUser = await this.marqeta.createUser({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email
    });
    
    await this.db.users.update(employee.id, {
      marqetaUserToken: marqetaUser.token
    });
    
    return employee;
  }

  // Corporate card issuance
  async issueCorporateCard(employeeId, cardConfig) {
    const employee = await this.db.users.findById(employeeId);
    const company = await this.db.companies.findById(employee.companyId);
    
    const marqetaCard = await this.marqeta.issueCard({
      cardProductToken: company.cardProductToken,
      userToken: employee.marqetaUserToken,
      firstName: employee.firstName,
      lastName: employee.lastName
    });

    return await this.db.cards.create({
      userId: employeeId,
      marqetaCardToken: marqetaCard.token,
      cardType: 'corporate',
      dailyLimit: cardConfig.dailyLimit,
      monthlyLimit: cardConfig.monthlyLimit,
      fundingSource: 'company_budget'
    });
  }

  // Expense reporting
  async getExpenseReport(companyId, filters = {}) {
    return await this.db.transactions.getByCompany(companyId, filters);
  }

  // Spending approvals
  async processSpendingApproval(transactionId, approved, reason) {
    return await this.db.transactions.updateApprovalStatus(
      transactionId, 
      approved ? 'approved' : 'declined',
      reason
    );
  }
}

module.exports = BusinessService;