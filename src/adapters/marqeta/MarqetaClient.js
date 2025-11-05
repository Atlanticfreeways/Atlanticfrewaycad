const axios = require('axios');
const { ExternalServiceError } = require('../../errors/AppError');

class MarqetaClient {
  constructor() {
    this.baseURL = process.env.MARQETA_API_URL || 'https://sandbox-api.marqeta.com/v3';
    this.appToken = process.env.MARQETA_APP_TOKEN;
    this.adminToken = process.env.MARQETA_ADMIN_TOKEN;
    this.maxRetries = 3;
    this.timeout = 5000;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      auth: {
        username: this.appToken,
        password: this.adminToken
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry >= this.maxRetries) {
          throw new ExternalServiceError('Marqeta', error.message, {
            status: error.response?.status,
            data: error.response?.data
          });
        }

        if (error.response?.status === 429 || error.response?.status >= 500) {
          config.retry += 1;
          const delay = Math.pow(2, config.retry) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        throw new ExternalServiceError('Marqeta', error.message, {
          status: error.response?.status,
          data: error.response?.data
        });
      }
    );
  }

  async post(endpoint, data, idempotencyKey = null) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(endpoint, data, { headers });
    return response.data;
  }

  async get(endpoint) {
    const response = await this.client.get(endpoint);
    return response.data;
  }

  async put(endpoint, data) {
    const response = await this.client.put(endpoint, data);
    return response.data;
  }
}

module.exports = new MarqetaClient();
