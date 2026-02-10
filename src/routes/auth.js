const express = require('express');
const JWTService = require('../services/auth/JWTService');
const PasswordService = require('../services/auth/PasswordService');
const MFAService = require('../services/auth/MFAService');
const SessionService = require('../services/SessionService');
const SecurityService = require('../services/SecurityService');
const { ValidationError, AuthenticationError } = require('../errors/AppError');
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const { csrfProtection } = require('../middleware/csrfProtection');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();
const passwordResetRoutes = require('./auth/passwordReset');

router.use('/', passwordResetRoutes);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 */
router.post('/register', authLimiter, csrfProtection, validate(schemas.register), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, accountType } = req.body;

  if (!email || !password || !firstName || !lastName || !accountType) {
    throw new ValidationError('Missing required fields');
  }

  const passwordValidation = PasswordService.validate(password);
  if (!passwordValidation.valid) {
    throw new ValidationError('Invalid password', { errors: passwordValidation.errors });
  }

  const userRepo = req.repositories.user;
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ValidationError('Email already registered');
  }

  const passwordHash = await PasswordService.hash(password);
  const user = await userRepo.create({
    email,
    passwordHash,
    firstName,
    lastName,
    accountType,
    role: accountType === 'business' ? 'employee' : 'personal'
  });

  if (accountType === 'personal') {
    await req.repositories.wallet.create(user.id);
  }

  // Generate tokens
  const tokens = JWTService.generateTokenPair(user);

  // Store session
  const sessionService = new SessionService(req.repositories);
  await sessionService.createSession(user.id, tokens.refreshToken, req.ip, req.get('user-agent'));

  // Set cookie
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    user,
    accessToken: tokens.accessToken
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 */
router.post('/login', authLimiter, csrfProtection, validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }

  const securityService = new SecurityService(req.repositories);
  await securityService.checkLockout(email, req.ip);

  const userRepo = req.repositories.user;
  const user = await userRepo.findByEmail(email);

  if (!user) {
    await securityService.logLoginAttempt(email, req.ip, false);
    throw new AuthenticationError('Invalid credentials');
  }

  const valid = await PasswordService.compare(password, user.password_hash);
  if (!valid) {
    await securityService.logLoginAttempt(email, req.ip, false);
    throw new AuthenticationError('Invalid credentials');
  }

  // Success
  await securityService.logLoginAttempt(email, req.ip, true);

  if (user.two_factor_enabled) {
    const mfaToken = JWTService.generateMFAToken(user);
    return res.json({
      success: true,
      mfaRequired: true,
      mfaToken
    });
  }

  const tokens = JWTService.generateTokenPair(user);

  // Store session
  const sessionService = new SessionService(req.repositories);
  await sessionService.createSession(user.id, tokens.refreshToken, req.ip, req.get('user-agent'));

  // Set cookie
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  delete user.password_hash;
  delete user.two_factor_secret;
  delete user.two_factor_backup_codes;

  res.json({
    success: true,
    user,
    accessToken: tokens.accessToken
  });
}));

/**
 * POST /auth/mfa/verify
 */
router.post('/mfa/verify', authLimiter, csrfProtection, asyncHandler(async (req, res) => {
  const { code, mfaToken } = req.body;

  if (!code || !mfaToken) {
    throw new ValidationError('Code and MFA token required');
  }

  const decoded = JWTService.verifyMFAToken(mfaToken);
  const userRepo = req.repositories.user;
  const user = await userRepo.findById(decoded.id);

  if (!user || !user.two_factor_enabled) {
    throw new AuthenticationError('MFA not active or user not found');
  }

  const isTokenValid = MFAService.verifyToken(user.two_factor_secret, code);
  let isBackupValid = false;
  let backupCodes = JSON.parse(user.two_factor_backup_codes || '[]');

  if (!isTokenValid) {
    const codeIndex = backupCodes.indexOf(code.toUpperCase());
    if (codeIndex !== -1) {
      isBackupValid = true;
      backupCodes.splice(codeIndex, 1);
      await userRepo.update(user.id, { two_factor_backup_codes: JSON.stringify(backupCodes) });
    }
  }

  if (!isTokenValid && !isBackupValid) {
    throw new AuthenticationError('Invalid MFA code');
  }

  const tokens = JWTService.generateTokenPair(user);

  // Store session
  const sessionService = new SessionService(req.repositories);
  await sessionService.createSession(user.id, tokens.refreshToken, req.ip, req.get('user-agent'));

  // Set cookie
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  delete user.password_hash;
  delete user.two_factor_secret;
  delete user.two_factor_backup_codes;

  res.json({
    success: true,
    user,
    accessToken: tokens.accessToken
  });
}));

router.post('/refresh', csrfProtection, asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ValidationError('Refresh token required');
  }

  let decoded;
  try {
    decoded = JWTService.verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AuthenticationError('Invalid refresh token');
  }

  const sessionService = new SessionService(req.repositories);
  const user = await req.repositories.user.findById(decoded.id);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Generate NEW tokens
  const newTokens = JWTService.generateTokenPair(user);

  // Rotate Session (Verification happens inside)
  await sessionService.rotateSession(refreshToken, newTokens.refreshToken, req.ip, req.get('user-agent'));

  // Update cookie
  res.cookie('refreshToken', newTokens.refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    accessToken: newTokens.accessToken
  });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (refreshToken) {
    const sessionService = new SessionService(req.repositories);
    await sessionService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}));

module.exports = router;
