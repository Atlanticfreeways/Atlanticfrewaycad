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
router.use('/business/approvals', require('./business/approvals')); // NEW: Approval workflows
router.use('/business/finance', require('./business/finance')); // Existing
router.use('/business/finance', require('./business/budgets')); // NEW: Budget tracking
router.use('/business/accounting', require('./business/accounting')); // NEW: Accounting integrations
router.use('/personal', personalRoutes);
router.use('/shared', sharedRoutes);
router.use('/kyc', kycRoutes);
router.use('/events', eventsRoutes);
router.use('/partners', partnerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/transactions', require('./transactions')); // NEW: Advanced transaction search & export
router.use('/disputes', require('./disputes')); // NEW: Dispute management
router.use('/rates', require('./rates'));
router.use('/config', require('./config'));
router.use('/compliance', require('./compliance'));

// User routes
router.use('/users/profile', require('./users/profile')); // NEW: User profile
router.use('/users/privacy', require('./users/privacy')); // NEW: GDPR privacy
router.use('/users', require('./users/password')); // NEW: Password change
router.use('/users', require('./users/apiKeys')); // NEW: API key management
router.use('/users/mfa', require('./users/mfa')); // NEW: Multi-factor authentication

// Notifications
router.use('/notifications', require('./notifications')); // NEW: Notifications center

// Reports
router.use('/reports', require('./reports')); // NEW: Analytics and reports

// Admin Routes
const marqetaLogsRouter = require('./admin/marqetaLogs');
const jitTracesRouter = require('./admin/jitTraces');

router.use('/admin', marqetaLogsRouter);
router.use('/admin', marqetaLogsRouter);
router.use('/admin', jitTracesRouter);
router.use('/admin/reconcile', require('./admin/reconciliation'));
router.use('/admin/audit-logs', require('./admin/auditLogs')); // NEW: Audit logs
router.use('/banking', require('./banking'));
router.use('/funding', require('./funding'));


module.exports = router;
