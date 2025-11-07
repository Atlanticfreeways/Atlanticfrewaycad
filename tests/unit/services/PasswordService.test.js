const PasswordService = require('../../../src/services/auth/PasswordService');
const testConfig = require('../../fixtures/testConfig');

describe('PasswordService', () => {
  describe('validate', () => {
    it('should validate strong password', () => {
      const result = PasswordService.validate(testConfig.testUser.password);
      expect(result.valid).toBe(true);
    });

    it('should reject weak password', () => {
      const result = PasswordService.validate('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('hash and compare', () => {
    it('should hash and verify password', async () => {
      const password = testConfig.testUser.password;
      const hash = await PasswordService.hash(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isValid = await PasswordService.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await PasswordService.hash('correct');
      const isValid = await PasswordService.compare('wrong', hash);
      expect(isValid).toBe(false);
    });
  });
});
