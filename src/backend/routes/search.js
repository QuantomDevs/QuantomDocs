/**
 * Search Routes
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', searchController.searchDocs);
router.get('/stats', searchController.getStats);

// Protected routes (admin only)
router.post('/rebuild', verifyToken, searchController.rebuildIndex);

module.exports = router;
