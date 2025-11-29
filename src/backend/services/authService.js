/**
 * Authentication Service
 * Handles user authentication, JWT generation, and token management
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const configManager = require('../utils/configManager');
const { AuthenticationError, ValidationError } = require('../utils/customErrors');

/**
 * Validate user credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<object>} User object (without password)
 */
async function validateUser(username, password) {
    if (!username || !password) {
        throw new ValidationError('Username and password are required');
    }

    const usersData = configManager.readConfig('users');

    if (!usersData || !usersData.users) {
        throw new Error('User database not found');
    }

    const user = usersData.users.find(u => u.username === username);

    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
    }

    // Return user without password
    return {
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
    };
}

/**
 * Generate JWT token
 * @param {object} user - User object
 * @returns {object} Token data
 */
function generateToken(user) {
    const token = jwt.sign(
        { username: user.username, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );

    // Calculate expiration timestamp (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
        token,
        expiresAt,
        expiresIn: 24 * 60 * 60 // seconds
    };
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token data
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token');
    }
}

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object} Decoded token data
 */
function decodeToken(token) {
    return jwt.decode(token);
}

/**
 * Add token to blacklist
 * @param {string} token - Token to blacklist
 * @param {string} expiresAt - Token expiration timestamp
 * @returns {boolean} Success status
 */
function blacklistToken(token, expiresAt) {
    try {
        const blacklist = configManager.readConfig('tokenBlacklist');

        // Add token with expiration timestamp
        blacklist.blacklistedTokens.push({
            token,
            blacklistedAt: new Date().toISOString(),
            expiresAt
        });

        // Cleanup expired tokens (older than expiration)
        const now = Date.now();
        blacklist.blacklistedTokens = blacklist.blacklistedTokens.filter(item => {
            if (!item.expiresAt) return false;
            return new Date(item.expiresAt).getTime() > now;
        });

        blacklist.lastCleanup = new Date().toISOString();

        return configManager.writeConfig('tokenBlacklist', blacklist);
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        return false;
    }
}

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} True if blacklisted
 */
function isTokenBlacklisted(token) {
    try {
        const blacklist = configManager.readConfig('tokenBlacklist');
        return blacklist.blacklistedTokens.some(item => item.token === token);
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
}

/**
 * Create new user
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} role - User role
 * @returns {Promise<object>} Created user (without password)
 */
async function createUser(username, password, role = 'user') {
    if (!username || !password) {
        throw new ValidationError('Username and password are required');
    }

    const usersData = configManager.readConfig('users');

    // Check if user already exists
    if (usersData.users.find(u => u.username === username)) {
        throw new ValidationError('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create new user
    const newUser = {
        username,
        password: hashedPassword,
        role: role || 'user',
        authCode: `qnt_auth_2025_${username}_${Date.now()}`,
        createdAt: new Date().toISOString()
    };

    usersData.users.push(newUser);

    if (configManager.writeConfig('users', usersData)) {
        return {
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt
        };
    } else {
        throw new Error('Failed to save user data');
    }
}

/**
 * Update user
 * @param {string} username - Username
 * @param {object} updates - Updates to apply
 * @returns {Promise<object>} Updated user (without password)
 */
async function updateUser(username, updates) {
    const usersData = configManager.readConfig('users');

    const userIndex = usersData.users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        throw new ValidationError('User not found');
    }

    // Update role if provided
    if (updates.role) {
        usersData.users[userIndex].role = updates.role;
    }

    // Update password if provided
    if (updates.password) {
        usersData.users[userIndex].password = await bcrypt.hash(updates.password, config.security.bcryptRounds);
    }

    if (configManager.writeConfig('users', usersData)) {
        return {
            username: usersData.users[userIndex].username,
            role: usersData.users[userIndex].role,
            createdAt: usersData.users[userIndex].createdAt
        };
    } else {
        throw new Error('Failed to save user data');
    }
}

/**
 * Delete user
 * @param {string} username - Username to delete
 * @returns {boolean} Success status
 */
function deleteUser(username) {
    const usersData = configManager.readConfig('users');

    const userIndex = usersData.users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        throw new ValidationError('User not found');
    }

    usersData.users.splice(userIndex, 1);

    if (configManager.writeConfig('users', usersData)) {
        return true;
    } else {
        throw new Error('Failed to save user data');
    }
}

/**
 * Get all users
 * @returns {Array} List of users (without passwords)
 */
function getAllUsers() {
    const usersData = configManager.readConfig('users');

    return usersData.users.map(user => ({
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
    }));
}

module.exports = {
    validateUser,
    generateToken,
    verifyToken,
    decodeToken,
    blacklistToken,
    isTokenBlacklisted,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
};
