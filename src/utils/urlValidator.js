/**
 * URL Validator
 * Prevents SSRF attacks by validating URLs against whitelist
 */

const ALLOWED_HOSTS = [
  'api.atlanticfrewaycard.com',
  'sandbox-api.marqeta.com',
  'api.marqeta.com',
  'api.stripe.com'
];

const BLOCKED_IPS = [
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
  '169.254.169.254' // AWS metadata
];

/**
 * Validate URL against whitelist
 */
const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Check against blocked IPs
    if (BLOCKED_IPS.includes(url.hostname)) {
      return false;
    }

    // Check against whitelist
    return ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Validate and sanitize URL
 */
const sanitizeUrl = (urlString) => {
  if (!isValidUrl(urlString)) {
    throw new Error('Invalid or unauthorized URL');
  }
  return urlString;
};

module.exports = {
  isValidUrl,
  sanitizeUrl,
  ALLOWED_HOSTS
};
