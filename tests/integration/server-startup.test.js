const request = require('supertest');

describe('Server Startup', () => {
  let app;

  beforeAll(async () => {
    // Mock environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.REDIS_URL = 'redis://localhost:6379';
    
    // Import app after setting env vars
    app = require('../../server');
  });

  afterAll(async () => {
    // Clean up if needed
    if (app && app.close) {
      await app.close();
    }
  });

  it('should start server and respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  it('should respond to root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Atlanticfrewaycard Platform API');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('services');
  });

  it('should return 404 for unknown endpoints', async () => {
    await request(app)
      .get('/unknown-endpoint')
      .expect(404);
  });
});