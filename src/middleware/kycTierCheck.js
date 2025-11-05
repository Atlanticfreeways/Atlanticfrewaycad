const { ForbiddenError } = require('../errors/AppError');
const KYCService = require('../services/KYCService');

const requireTier = (minTier) => {
  const tierLevels = { basic: 1, standard: 2, turbo: 3, business: 4 };
  
  return async (req, res, next) => {
    try {
      const user = await req.repositories.user.findById(req.user.id);
      
      if (!user || !user.kyc_tier) {
        throw new ForbiddenError('KYC verification required');
      }

      const userLevel = tierLevels[user.kyc_tier] || 0;
      const requiredLevel = tierLevels[minTier] || 0;

      if (userLevel < requiredLevel) {
        throw new ForbiddenError(`${minTier} tier required. Current tier: ${user.kyc_tier}`);
      }

      req.user.kycTier = user.kyc_tier;
      req.user.monthlyLimit = user.monthly_limit;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const checkSpendingLimit = async (req, res, next) => {
  try {
    const amount = parseFloat(req.body.amount || 0);
    if (amount <= 0) return next();

    const kycService = new KYCService(req.repositories);
    await kycService.checkLimit(req.user.id, amount);
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireTier, checkSpendingLimit };
