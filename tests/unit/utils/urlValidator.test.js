const { isValidUrl, sanitizeUrl } = require('../../../src/utils/urlValidator');

describe('URL Validator', () => {
  it('should accept whitelisted URLs', () => {
    expect(isValidUrl('https://api.marqeta.com/v3/users')).toBe(true);
    expect(isValidUrl('https://sandbox-api.marqeta.com/v3/cards')).toBe(true);
  });

  it('should reject non-whitelisted URLs', () => {
    expect(isValidUrl('https://evil.com/api')).toBe(false);
    expect(isValidUrl('http://malicious.site')).toBe(false);
  });

  it('should reject blocked IPs', () => {
    expect(isValidUrl('http://127.0.0.1/api')).toBe(false);
    expect(isValidUrl('http://localhost/api')).toBe(false);
    expect(isValidUrl('http://169.254.169.254/metadata')).toBe(false);
  });

  it('should reject invalid protocols', () => {
    expect(isValidUrl('ftp://api.marqeta.com')).toBe(false);
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });

  it('should throw error for invalid URLs in sanitizeUrl', () => {
    expect(() => sanitizeUrl('https://evil.com')).toThrow('Invalid or unauthorized URL');
  });
});
