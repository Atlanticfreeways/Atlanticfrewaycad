// Click Tracking Service
const memoryStore = require('../utils/memoryStore');

class ClickTrackingService {
  constructor() {
    this.clicks = new Map();
  }

  // Track a referral click
  trackClick(referralCode, metadata = {}) {
    const clickId = 'click-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    
    const click = {
      id: clickId,
      referral_code: referralCode,
      ip: metadata.ip,
      user_agent: metadata.user_agent,
      referrer: metadata.referrer,
      country: this.getCountryFromIP(metadata.ip),
      device: this.detectDevice(metadata.user_agent),
      browser: this.detectBrowser(metadata.user_agent),
      timestamp: new Date().toISOString(),
      converted: false
    };

    this.clicks.set(clickId, click);
    
    // Update partner analytics
    this.updatePartnerAnalytics(referralCode);
    
    return click;
  }

  // Detect device type from user agent
  detectDevice(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Detect browser from user agent
  detectBrowser(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('safari')) return 'safari';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('edge')) return 'edge';
    return 'other';
  }

  // Get country from IP (simplified)
  getCountryFromIP(ip) {
    // In production, use IP geolocation service
    // For now, return 'US' as default
    return 'US';
  }

  // Check for duplicate clicks (fraud detection)
  isDuplicateClick(referralCode, ip, timeWindow = 3600000) { // 1 hour
    const recentClicks = Array.from(this.clicks.values())
      .filter(c => 
        c.referral_code === referralCode &&
        c.ip === ip &&
        Date.now() - new Date(c.timestamp).getTime() < timeWindow
      );
    
    return recentClicks.length > 1;
  }

  // Get clicks for a referral code
  getClicksByCode(referralCode) {
    return Array.from(this.clicks.values())
      .filter(c => c.referral_code === referralCode)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get click statistics
  getClickStats(referralCode) {
    const clicks = this.getClicksByCode(referralCode);
    
    const deviceBreakdown = clicks.reduce((acc, c) => {
      acc[c.device] = (acc[c.device] || 0) + 1;
      return acc;
    }, {});

    const browserBreakdown = clicks.reduce((acc, c) => {
      acc[c.browser] = (acc[c.browser] || 0) + 1;
      return acc;
    }, {});

    const countryBreakdown = clicks.reduce((acc, c) => {
      acc[c.country] = (acc[c.country] || 0) + 1;
      return acc;
    }, {});

    const uniqueIPs = new Set(clicks.map(c => c.ip)).size;
    const conversions = clicks.filter(c => c.converted).length;

    return {
      total_clicks: clicks.length,
      unique_clicks: uniqueIPs,
      conversions,
      conversion_rate: clicks.length > 0 ? ((conversions / clicks.length) * 100).toFixed(2) : 0,
      devices: deviceBreakdown,
      browsers: browserBreakdown,
      countries: countryBreakdown,
      last_click: clicks[0]?.timestamp
    };
  }

  // Update partner analytics
  updatePartnerAnalytics(referralCode) {
    const partner = memoryStore.getPartner(referralCode);
    if (!partner) return;

    const stats = memoryStore.getPartnerStats(partner.id);
    // Analytics are automatically updated through memoryStore
  }

  // Mark click as converted
  markConverted(referralCode, ip) {
    const clicks = Array.from(this.clicks.values())
      .filter(c => c.referral_code === referralCode && c.ip === ip);
    
    clicks.forEach(click => {
      click.converted = true;
      this.clicks.set(click.id, click);
    });
  }

  // Get click trends (hourly)
  getClickTrends(referralCode, hours = 24) {
    const clicks = this.getClicksByCode(referralCode);
    const now = Date.now();
    const hourlyData = {};

    for (let i = 0; i < hours; i++) {
      const hourStart = now - (i * 3600000);
      const hourEnd = hourStart + 3600000;
      
      const hourClicks = clicks.filter(c => {
        const clickTime = new Date(c.timestamp).getTime();
        return clickTime >= hourStart && clickTime < hourEnd;
      });

      const hour = new Date(hourStart).getHours();
      hourlyData[hour] = hourClicks.length;
    }

    return hourlyData;
  }

  // Fraud detection
  detectFraud(referralCode) {
    const clicks = this.getClicksByCode(referralCode);
    const suspiciousPatterns = [];

    // Check for rapid clicks from same IP
    const ipCounts = clicks.reduce((acc, c) => {
      acc[c.ip] = (acc[c.ip] || 0) + 1;
      return acc;
    }, {});

    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > 10) {
        suspiciousPatterns.push({
          type: 'excessive_clicks',
          ip,
          count,
          severity: 'high'
        });
      }
    });

    // Check for bot-like user agents
    const botClicks = clicks.filter(c => 
      c.user_agent && (
        c.user_agent.includes('bot') ||
        c.user_agent.includes('crawler') ||
        c.user_agent.includes('spider')
      )
    );

    if (botClicks.length > 0) {
      suspiciousPatterns.push({
        type: 'bot_traffic',
        count: botClicks.length,
        severity: 'medium'
      });
    }

    return {
      is_suspicious: suspiciousPatterns.length > 0,
      patterns: suspiciousPatterns,
      risk_score: this.calculateRiskScore(suspiciousPatterns)
    };
  }

  // Calculate risk score
  calculateRiskScore(patterns) {
    let score = 0;
    patterns.forEach(p => {
      if (p.severity === 'high') score += 50;
      if (p.severity === 'medium') score += 25;
      if (p.severity === 'low') score += 10;
    });
    return Math.min(score, 100);
  }
}

module.exports = new ClickTrackingService();
