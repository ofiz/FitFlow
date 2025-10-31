// tests/e2e/fixtures/auth.js
const axios = require('axios');

class AuthHelper {
  constructor(baseURL = 'http://localhost:5001') {
    this.baseURL = baseURL;
    this.apiURL = `${baseURL}/api`;
  }

  async registerUser(userData) {
    try {
      const response = await axios.post(`${this.apiURL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async loginUser(email, password) {
    try {
      const response = await axios.post(`${this.apiURL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await axios.post(`${this.apiURL}/auth/forgot-password`, {
        email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getResetToken(email) {
    const User = require('../../../server/models/User');
    const user = await User.findOne({ email });
    return user?.resetPasswordToken || null;
  }

  async clearUsers() {
    const User = require('../../../server/models/User');
    await User.deleteMany({});
  }
}

module.exports = { AuthHelper };