/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');

/**
 * Login handler
 */
async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        // Validate user credentials
        const user = await authService.validateUser(username, password);

        // Generate JWT token
        const tokenData = authService.generateToken(user);

        res.json({
            success: true,
            token: tokenData.token,
            expiresAt: tokenData.expiresAt,
            expiresIn: tokenData.expiresIn,
            user: user
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Verify token handler
 */
function verify(req, res) {
    // User is already verified by middleware
    res.json({
        success: true,
        user: req.user
    });
}

/**
 * Logout handler
 */
function logout(req, res, next) {
    try {
        const token = req.token;

        // Decode token to get expiration
        const decoded = authService.decodeToken(token);
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null;

        // Add token to blacklist
        if (authService.blacklistToken(token, expiresAt)) {
            res.json({ success: true, message: 'Logged out successfully' });
        } else {
            res.status(500).json({ error: 'Failed to logout properly' });
        }

    } catch (error) {
        next(error);
    }
}

/**
 * Refresh token handler
 */
function refreshToken(req, res, next) {
    try {
        const oldToken = req.token;
        const user = req.user;

        // Generate new token
        const tokenData = authService.generateToken(user);

        // Blacklist old token
        const decoded = authService.decodeToken(oldToken);
        const oldExpiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null;
        authService.blacklistToken(oldToken, oldExpiresAt);

        res.json({
            success: true,
            token: tokenData.token,
            expiresAt: tokenData.expiresAt,
            expiresIn: tokenData.expiresIn
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get all users handler
 */
function getAllUsers(req, res, next) {
    try {
        const users = authService.getAllUsers();
        res.json({ users });
    } catch (error) {
        next(error);
    }
}

/**
 * Create user handler
 */
async function createUser(req, res, next) {
    try {
        const { username, password, role } = req.body;

        const user = await authService.createUser(username, password, role);

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update user handler
 */
async function updateUser(req, res, next) {
    try {
        const { username } = req.params;
        const { role, password } = req.body;

        const user = await authService.updateUser(username, { role, password });

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete user handler
 */
function deleteUser(req, res, next) {
    try {
        const { username } = req.params;

        // Prevent deleting your own account
        if (req.user.username === username) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        authService.deleteUser(username);

        res.json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        next(error);
    }
}

/**
 * Change password handler
 */
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        const username = req.user.username;

        // Verify current password
        await authService.validateUser(username, currentPassword);

        // Update password
        await authService.updateUser(username, { password: newPassword });

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    verify,
    logout,
    refreshToken,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword
};
