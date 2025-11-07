const request = require('supertest');
const app = require('../../../server');
const testConfig = require('../../fixtures/testConfig');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testConfig.testUser.email,
          password: testConfig.testUser.password,
          firstName: testConfig.testUser.firstName,
          lastName: testConfig.testUser.lastName,
          accountType: 'personal'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.tokens).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: testConfig.testUser.password,
          firstName: testConfig.testUser.firstName,
          lastName: testConfig.testUser.lastName,
          accountType: 'personal'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testConfig.testUser.email,
          password: testConfig.testUser.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body.tokens).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testConfig.testUser.email,
          password: 'wrong'
        });
      
      expect(res.status).toBe(401);
    });
  });
});
