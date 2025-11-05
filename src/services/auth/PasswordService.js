const bcrypt = require('bcryptjs');

class PasswordService {
  constructor() {
    this.rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  }

  async hash(password) {
    return bcrypt.hash(password, this.rounds);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }

  validate(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Minimum ${minLength} characters`);
    if (!hasUpperCase) errors.push('One uppercase letter required');
    if (!hasLowerCase) errors.push('One lowercase letter required');
    if (!hasNumbers) errors.push('One number required');
    if (!hasSpecialChar) errors.push('One special character required');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new PasswordService();
