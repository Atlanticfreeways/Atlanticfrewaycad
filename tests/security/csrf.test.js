const request = require('supertest');
const app = require('../../server');

describe('CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    const res = await request(app)
      .post('/api/v1/business/companies')
      .send({ name: 'Test Company' });
    
    expect(res.status).toBe(403);
  });
});
