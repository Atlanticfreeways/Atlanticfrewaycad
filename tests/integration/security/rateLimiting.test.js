const request = require('supertest');
const app = require('../../../server');

describe('Rate Limiting', () => {
  it('should enforce rate limits on auth endpoints', async () => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(res => res.status === 429);
    expect(rateLimited).toBe(true);
  });

  it('should allow requests within rate limit', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
