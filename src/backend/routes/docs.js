/**
 * Documentation Routes
 */

const express = require('express');
const router = express.Router();
const docsController = require('../controllers/docsController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/:product/tree', docsController.getProductTree);
router.get('/:product/*', docsController.getFileContent);

// Protected routes (for editor)
router.post('/save', verifyToken, docsController.saveDocument);

module.exports = router;
