const express = require('express');
const authRoutes = require('../auth');
const businessRoutes = require('../business');
const personalRoutes = require('../personal');
const sharedRoutes = require('../shared');
const kycRoutes = require('../kyc');
const eventsRoutes = require('../events');
const partnerRoutes = require('../partners');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/personal', personalRoutes);
router.use('/shared', sharedRoutes);
router.use('/kyc', kycRoutes);
router.use('/events', eventsRoutes);
router.use('/partners', partnerRoutes);

module.exports = router;
