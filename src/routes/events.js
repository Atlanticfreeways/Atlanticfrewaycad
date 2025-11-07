const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const EventAuditService = require('../services/EventAuditService');

const router = express.Router();

router.use(authenticate);

router.get('/audit', authorize('admin'), asyncHandler(async (req, res) => {
  const auditService = new EventAuditService(req.repositories);
  const events = await auditService.getEventHistory(req.query);
  res.json({ success: true, events });
}));

router.get('/audit/user/:userId', asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const auditService = new EventAuditService(req.repositories);
  const events = await auditService.getEventHistory({ userId: req.params.userId });
  res.json({ success: true, events });
}));

module.exports = router;
