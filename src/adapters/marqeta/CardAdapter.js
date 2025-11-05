const marqetaClient = require('./MarqetaClient');
const { v4: uuidv4 } = require('uuid');

class CardAdapter {
  async createCardProduct(config) {
    const payload = {
      token: uuidv4(),
      name: config.name,
      active: true,
      start_date: new Date().toISOString().split('T')[0],
      config: {
        fulfillment: {
          payment_instrument: 'VIRTUAL_PAN'
        },
        poi: {
          ecommerce: true
        },
        card_life_cycle: {
          activate_upon_issue: true
        }
      }
    };

    return await marqetaClient.post('/cardproducts', payload, uuidv4());
  }

  async issueCard(cardData) {
    const payload = {
      token: uuidv4(),
      user_token: cardData.userToken,
      card_product_token: cardData.cardProductToken,
      expedite: false
    };

    return await marqetaClient.post('/cards', payload, uuidv4());
  }

  async getCard(cardToken) {
    return await marqetaClient.get(`/cards/${cardToken}`);
  }

  async updateCardStatus(cardToken, status) {
    const statusMap = {
      'active': 'ACTIVE',
      'frozen': 'SUSPENDED',
      'terminated': 'TERMINATED'
    };

    const payload = {
      token: cardToken,
      state: statusMap[status] || 'ACTIVE'
    };

    return await marqetaClient.put(`/cards/${cardToken}`, payload);
  }

  async showPAN(cardToken) {
    return await marqetaClient.get(`/cards/${cardToken}/showpan`);
  }
}

module.exports = new CardAdapter();
