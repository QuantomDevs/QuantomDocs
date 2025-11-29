/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const config = require('../config');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rate limiting for auth endpoints
const authLimiter = rateLimit(config.rateLimit.auth);

// Public routes
router.post('/login', authLimiter, authController.login);

// Protected routes
router.get('/verify', verifyToken, authController.verify);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh', verifyToken, authController.refreshToken);
router.post('/change-password', verifyToken, authController.changePassword);

// User management routes (protected)
router.get('/users', verifyToken, authController.getAllUsers);
router.post('/users', verifyToken, authController.createUser);
router.put('/users/:username', verifyToken, authController.updateUser);
router.delete('/users/:username', verifyToken, authController.deleteUser);

module.exports = router;
