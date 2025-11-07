/**
 * Test Configuration
 * Centralized test data and configuration
 */

module.exports = {
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  },

  testCompany: {
    name: 'Test Company Inc',
    email: 'company@example.com'
  },

  testCard: {
    nickname: 'Test Card',
    dailyLimit: 1000,
    monthlyLimit: 5000
  },

  testToken: process.env.TEST_API_TOKEN || 'test-token-' + Date.now(),

  marqeta: {
    baseUrl: process.env.MARQETA_BASE_URL || 'https://sandbox-api.marqeta.com/v3',
    appToken: process.env.TEST_MARQETA_APP_TOKEN || 'test-app-token',
    adminToken: process.env.TEST_MARQETA_ADMIN_TOKEN || 'test-admin-token'
  },

  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'atlanticfrewaycard_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres'
  }
};
