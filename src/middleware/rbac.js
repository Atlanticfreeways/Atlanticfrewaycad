const { ForbiddenError } = require('../errors/AppError');
const logger = require('../utils/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRole = req.user.role || 'employee'; // Default to lowest privilege

            // Platform Admins can access everything (optional, but good for superusers)
            if (userRole === 'admin') {
                return next();
            }

            if (!allowedRoles.includes(userRole)) {
                logger.warn(`Access denied for user ${req.user.id} with role ${userRole}. Required: ${allowedRoles.join(', ')}`);
                return res.status(403).json({
                    error: 'Access denied: Insufficient permissions',
                    required_roles: allowedRoles
                });
            }

            next();
        } catch (error) {
            logger.error('RBAC Error', error);
            res.status(500).json({ error: 'Internal Server Error during authorization' });
        }
    };
};

/**
 * Permission Definitions (Can be expanded to DB-backed permissions later)
 */
const ROLES = {
    ADMIN: 'admin',                  // Platform Owner
    BUSINESS_ADMIN: 'business_admin', // Company Owner (Can issue cards)
    FINANCE_MANAGER: 'finance_manager', // Can view finances, export reports
    EMPLOYEE: 'employee'             // Regular user
};

module.exports = {
    requireRole,
    ROLES
};
