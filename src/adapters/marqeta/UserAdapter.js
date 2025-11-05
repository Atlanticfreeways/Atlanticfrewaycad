const marqetaClient = require('./MarqetaClient');
const { v4: uuidv4 } = require('uuid');

class UserAdapter {
  async createUser(userData) {
    const payload = {
      token: uuidv4(),
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone || null,
      uses_parent_account: false,
      active: true
    };

    return await marqetaClient.post('/users', payload, uuidv4());
  }

  async getUser(userToken) {
    return await marqetaClient.get(`/users/${userToken}`);
  }

  async updateUser(userToken, updates) {
    return await marqetaClient.put(`/users/${userToken}`, updates);
  }
}

module.exports = new UserAdapter();
