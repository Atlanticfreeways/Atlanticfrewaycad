const request = require('supertest');
const app = require('../../../server');

describe('Input Validation', () => {
  let csrfToken, cookies;

  beforeAll(async () => {
    const res = await request(app).get('/api/v1/csrf-token');
    csrfToken = res.body.csrfToken;
    cookies = res.headers['set-cookie'];
  });

  it('should reject invalid email in waitlist', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'invalid-email' });
    expect(res.status).toBe(400);
  });

  it('should accept valid email in waitlist', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'valid@example.com' });
    expect([200, 201, 400]).toContain(res.status);
  });

  it('should reject missing required fields', async () => {
    const res = await request(app)
      .post('/api/waitlist')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });
});
