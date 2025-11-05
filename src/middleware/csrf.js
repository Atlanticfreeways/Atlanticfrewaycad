const crypto = require('crypto');

const tokens = new Map();

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    const token = generateToken();
    tokens.set(token, Date.now());
    res.locals.csrfToken = token;
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || !tokens.has(token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  const timestamp = tokens.get(token);
  if (Date.now() - timestamp > 3600000) {
    tokens.delete(token);
    return res.status(403).json({ error: 'CSRF token expired' });
  }

  tokens.delete(token);
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of tokens.entries()) {
    if (now - timestamp > 3600000) {
      tokens.delete(token);
    }
  }
}, 300000);

module.exports = { csrfProtection };
