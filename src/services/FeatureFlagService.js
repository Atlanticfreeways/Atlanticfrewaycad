const fs = require('fs');
const path = require('path');

class FeatureFlagService {
  constructor() {
    this.flags = this.loadFlags();
    this.env = process.env.NODE_ENV || 'development';
  }

  loadFlags() {
    const flagsPath = path.join(__dirname, '../../config/features.json');
    return JSON.parse(fs.readFileSync(flagsPath, 'utf8'));
  }

  isEnabled(featureName, userId = null) {
    const feature = this.flags[featureName];
    if (!feature) return false;
    
    if (!feature.enabled) return false;
    if (!feature.environments.includes(this.env)) return false;
    
    if (userId && feature.userWhitelist) {
      return feature.userWhitelist.includes(userId);
    }
    
    return true;
  }

  reload() {
    this.flags = this.loadFlags();
  }
}

module.exports = new FeatureFlagService();
