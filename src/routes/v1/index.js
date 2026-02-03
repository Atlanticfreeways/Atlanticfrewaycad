const express = require('express');
const authRoutes = require('../auth');
const businessRoutes = require('../business');
const personalRoutes = require('../personal');
const sharedRoutes = require('../shared');
const kycRoutes = require('../kyc');
const eventsRoutes = require('../events');
const partnerRoutes = require('../partners');
const dashboardRoutes = require('../dashboard');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/business', require('./business/bulkIssuance'));
router.use('/business/finance', require('./business/finance'));
router.use('/business/team', require('./business/team')); // NEW: Team management
router.use('/personal', personalRoutes);
router.use('/shared', sharedRoutes);
router.use('/kyc', kycRoutes);
router.use('/events', eventsRoutes);
router.use('/partners', partnerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/rates', require('./rates'));
router.use('/config', require('./config'));
router.use('/compliance', require('./compliance'));

// User routes
router.use('/users/profile', require('./users/profile')); // NEW: User profile
router.use('/users/privacy', require('./users/privacy')); // NEW: GDPR privacy
router.use('/users', require('./users/password')); // NEW: Password change

// Notifications
router.use('/notifications', require('./notifications')); // NEW: Notifications center

// Admin Routes
const marqetaLogsRouter = require('./admin/marqetaLogs');
const jitTracesRouter = require('./admin/jitTraces');

router.use('/admin', marqetaLogsRouter);
router.use('/admin', marqetaLogsRouter);
router.use('/admin', jitTracesRouter);
router.use('/admin/reconcile', require('./admin/reconciliation'));
router.use('/admin/audit-logs', require('./admin/auditLogs')); // NEW: Audit logs
router.use('/banking', require('./banking'));


module.exports = router;
