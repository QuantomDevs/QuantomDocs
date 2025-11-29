/**
 * Authentication Middleware
 * JWT verification and role checking
 */

const authService = require('../services/authService');
const { AuthenticationError, AuthorizationError } = require('../utils/customErrors');

/**
 * Verify JWT token middleware
 */
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new AuthenticationError('Access token required');
        }

        // Check if token is blacklisted
        if (authService.isTokenBlacklisted(token)) {
            throw new AuthenticationError('Token has been revoked');
        }

        // Verify token
        const user = authService.verifyToken(token);

        // Attach user and token to request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Check user role middleware
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
function checkRole(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new AuthorizationError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Optional authentication middleware
 * Verifies token if present but doesn't require it
 */
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            // Check if token is blacklisted
            if (!authService.isTokenBlacklisted(token)) {
                try {
                    const user = authService.verifyToken(token);
                    req.user = user;
                    req.token = token;
                } catch (error) {
                    // Token invalid, continue without auth
                    console.warn('Invalid token in optional auth:', error.message);
                }
            }
        }

        next();
    } catch (error) {
        // For optional auth, continue even if error occurs
        next();
    }
}

module.exports = {
    verifyToken,
    checkRole,
    optionalAuth
};
