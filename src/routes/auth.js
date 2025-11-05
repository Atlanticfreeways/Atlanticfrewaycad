const express = require('express');
const JWTService = require('../services/auth/JWTService');
const PasswordService = require('../services/auth/PasswordService');
const { ValidationError, AuthenticationError } = require('../errors/AppError');
const { authLimiter } = require('../middleware/rateLimiter');

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
router.post('/register', authLimiter, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

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
router.post('/login', authLimiter, async (req, res, next) => {
  try {
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

    const tokens = JWTService.generateTokenPair(user);
    delete user.password_hash;

    res.json({ success: true, user, tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
