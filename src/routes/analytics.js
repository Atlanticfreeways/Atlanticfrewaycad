const express = require('express');
const router = express.Router();
const clickTrackingService = require('../services/ClickTrackingService');
const memoryStore = require('../utils/memoryStore');

// Get click statistics for a partner
router.get('/clicks/:code', (req, res) => {
  const stats = clickTrackingService.getClickStats(req.params.code);
  
  res.json({
    success: true,
    data: stats
  });
});

// Get click trends
router.get('/trends/:code', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const trends = clickTrackingService.getClickTrends(req.params.code, hours);
  
  res.json({
    success: true,
    data: {
      referral_code: req.params.code,
      period_hours: hours,
      hourly_clicks: trends
    }
  });
});

// Get fraud detection report
router.get('/fraud/:code', (req, res) => {
  const report = clickTrackingService.detectFraud(req.params.code);
  
  res.json({
    success: true,
    data: report
  });
});

// Get detailed click history
router.get('/history/:code', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const clicks = clickTrackingService.getClicksByCode(req.params.code).slice(0, limit);
  
  res.json({
    success: true,
    data: clicks,
    count: clicks.length
  });
});

module.exports = router;
