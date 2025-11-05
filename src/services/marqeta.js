const axios = require('axios');

class MarqetaService {
  constructor() {
    this.baseURL = process.env.MARQETA_BASE_URL;
    this.appToken = process.env.MARQETA_APP_TOKEN;
    this.adminToken = process.env.MARQETA_ADMIN_TOKEN;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.appToken,
        password: this.adminToken
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async createUser(userData) {
    const response = await this.client.post('/users', {
      token: `user_${Date.now()}`,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      uses_parent_account: false,
      corporate_card_holder: true
    });
    return response.data;
  }

  async createCardProduct(productData) {
    const response = await this.client.post('/cardproducts', {
      token: `product_${Date.now()}`,
      name: productData.name,
      start_date: new Date().toISOString().split('T')[0],
      config: {
        fulfillment: {
          payment_instrument: 'VIRTUAL_PAN'
        },
        poi: {
          ecommerce: true,
          atm: true
        },
        card_life_cycle: {
          activate_upon_issue: true
        },
        jit_funding: {
          paymentcard_funding_source: {
            enabled: true,
            refunds_destination: 'GATEWAY'
          }
        }
      }
    });
    return response.data;
  }

  async issueCard(cardData) {
    const response = await this.client.post('/cards', {
      card_product_token: cardData.cardProductToken,
      user_token: cardData.userToken,
      fulfillment: {
        card_personalization: {
          text: {
            name_line_1: {
              value: `${cardData.firstName} ${cardData.lastName}`
            }
          }
        }
      }
    });
    return response.data;
  }

  async getCard(cardToken) {
    const response = await this.client.get(`/cards/${cardToken}`);
    return response.data;
  }

  async getTransactions(cardToken, params = {}) {
    const response = await this.client.get(`/cards/${cardToken}/transactions`, { params });
    return response.data;
  }
}

module.exports = new MarqetaService();