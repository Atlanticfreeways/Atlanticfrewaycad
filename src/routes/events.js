const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const EventAuditService = require('../services/EventAuditService');

const router = express.Router();

router.use(authenticate);

router.get('/audit', authorize('admin'), async (req, res, next) => {
  try {
    const auditService = new EventAuditService(req.repositories);
    const events = await auditService.getEventHistory(req.query);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

router.get('/audit/user/:userId', async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const auditService = new EventAuditService(req.repositories);
    const events = await auditService.getEventHistory({ userId: req.params.userId });
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
