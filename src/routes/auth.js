const express = require('express');
const JWTService = require('../services/auth/JWTService');
const PasswordService = require('../services/auth/PasswordService');
const MFAService = require('../services/auth/MFAService');
const { ValidationError, AuthenticationError } = require('../errors/AppError');
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const { csrfProtection } = require('../middleware/csrfProtection');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - accountType
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [business, personal]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
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

  const tokens = JWTService.generateTokenPair(user);
  res.status(201).json({ success: true, user, tokens });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, csrfProtection, validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }

  const userRepo = req.repositories.user;
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const valid = await PasswordService.compare(password, user.password_hash);
  if (!valid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if MFA is enabled
  if (user.two_factor_enabled) {
    const mfaToken = JWTService.generateMFAToken(user);
    return res.json({
      success: true,
      mfaRequired: true,
      mfaToken
    });
  }

  const tokens = JWTService.generateTokenPair(user);
  delete user.password_hash;
  delete user.two_factor_secret;
  delete user.two_factor_backup_codes;

  res.json({ success: true, user, tokens });
}));

/**
 * POST /auth/mfa/verify
 * Secondary step of login if MFA is enabled
 */
router.post('/mfa/verify', authLimiter, csrfProtection, asyncHandler(async (req, res) => {
  const { code, mfaToken } = req.body;

  if (!code || !mfaToken) {
    throw new ValidationError('Code and MFA token required');
  }

  // 1. Verify mfaToken
  const decoded = JWTService.verifyMFAToken(mfaToken);

  // 2. Fetch user
  const userRepo = req.repositories.user;
  const user = await userRepo.findById(decoded.id);

  if (!user || !user.two_factor_enabled) {
    throw new AuthenticationError('MFA not active or user not found');
  }

  // 3. Verify MFA code OR backup code
  const isTokenValid = MFAService.verifyToken(user.two_factor_secret, code);

  let isBackupValid = false;
  let backupCodes = JSON.parse(user.two_factor_backup_codes || '[]');
  if (!isTokenValid) {
    const codeIndex = backupCodes.indexOf(code.toUpperCase());
    if (codeIndex !== -1) {
      isBackupValid = true;
      backupCodes.splice(codeIndex, 1);
      // Update backup codes in DB
      await userRepo.update(user.id, { two_factor_backup_codes: JSON.stringify(backupCodes) });
    }
  }

  if (!isTokenValid && !isBackupValid) {
    throw new AuthenticationError('Invalid MFA code');
  }

  // 4. Issue full tokens
  const tokens = JWTService.generateTokenPair(user);
  delete user.password_hash;
  delete user.two_factor_secret;
  delete user.two_factor_backup_codes;

  res.json({ success: true, user, tokens });
}));

router.post('/refresh', csrfProtection, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token required');
  }

  const decoded = JWTService.verifyRefreshToken(refreshToken);
  const user = await req.repositories.user.findById(decoded.id);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  const tokens = JWTService.generateTokenPair(user);
  res.json({ success: true, tokens });
}));

module.exports = router;
