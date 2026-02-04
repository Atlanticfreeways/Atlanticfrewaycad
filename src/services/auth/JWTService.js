const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../../errors/AppError');

class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || this.secret;
    this.accessExpiry = process.env.JWT_EXPIRY || '15m';
    this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.accessExpiry });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiry });
  }

  generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      accountType: user.account_type,
      companyId: user.company_id
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ id: user.id }),
      expiresIn: this.accessExpiry
    };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  generateMFAToken(user) {
    const payload = {
      id: user.id,
      mfaPending: true
    };
    return jwt.sign(payload, this.secret, { expiresIn: '10m' });
  }

  verifyMFAToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (!decoded.mfaPending) throw new Error('Not an MFA token');
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired MFA token');
    }
  }
}

module.exports = new JWTService();
