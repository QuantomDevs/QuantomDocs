/**
 * File Management Routes
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const config = require('../config');
const filesController = require('../controllers/filesController');
const { verifyToken } = require('../middleware/auth');

// Rate limiting for file uploads
const uploadLimiter = rateLimit(config.rateLimit.upload);

// All file routes require authentication
router.use(verifyToken);

// General file operations (all content)
router.get('/tree', filesController.getFileTree);
router.get('/content', filesController.readFileContent);
router.post('/save', filesController.saveFile);
router.post('/create', filesController.createFileOrFolder);
router.post('/duplicate', filesController.duplicateFileOrFolder);

// Product-specific file operations
router.get('/:product/tree', filesController.getProductFileTree);
router.get('/:product/content', filesController.readProductFileContent);
router.post('/:product', filesController.createFileOrFolder);
router.delete('/:product', filesController.deleteFileOrFolder);
router.post('/:product/rename', filesController.renameFileOrFolder);
router.post('/:product/move', filesController.moveFileOrFolder);

module.exports = router;
