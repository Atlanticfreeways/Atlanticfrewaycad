const request = require('supertest');
const app = require('../../../server');

describe('KYC Routes', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });
    token = res.body.tokens.accessToken;
  });

  describe('POST /api/v1/kyc/verify', () => {
    it('should submit KYC verification', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'ace', documents: {} });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/kyc/limits', () => {
    it('should return user limits', async () => {
      const res = await request(app)
        .get('/api/v1/kyc/limits')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.limits).toBeDefined();
    });
  });
});
