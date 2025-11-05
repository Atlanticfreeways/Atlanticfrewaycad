const featureFlags = require('../services/FeatureFlagService');
const { ForbiddenError } = require('../errors/AppError');

const requireFeature = (featureName) => {
  return (req, res, next) => {
    const userId = req.user?.id;
    
    if (!featureFlags.isEnabled(featureName, userId)) {
      throw new ForbiddenError(`Feature '${featureName}' is not available`);
    }
    
    next();
  };
};

module.exports = { requireFeature };
