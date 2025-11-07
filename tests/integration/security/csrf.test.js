const request = require('supertest');
const app = require('../../../server');

describe('CSRF Protection', () => {
  it('should reject POST requests without CSRF token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Test123!@#' });
    expect(res.status).toBe(403);
  });

  it('should provide CSRF token on GET request', async () => {
    const res = await request(app).get('/api/v1/csrf-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('csrfToken');
  });

  it('should accept requests with valid CSRF token', async () => {
    const tokenRes = await request(app).get('/api/v1/csrf-token');
    const csrfToken = tokenRes.body.csrfToken;
    const cookies = tokenRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/waitlist')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'test@example.com' });
    
    expect(res.status).not.toBe(403);
  });
});
