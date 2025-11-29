/**
 * Documentation Controller
 * Handles documentation-related HTTP requests
 */

const fileService = require('../services/fileService');

/**
 * Get product tree
 */
function getProductTree(req, res, next) {
    try {
        const { product } = req.params;

        const result = fileService.getProductTree(product);

        res.json(result);

    } catch (error) {
        next(error);
    }
}

/**
 * Get file content by URL path
 * Returns pre-rendered HTML
 */
async function getFileContent(req, res, next) {
    try {
        const productId = req.params.product;
        const urlPath = req.params[0]; // Everything after product ID

        // Skip if this looks like an existing endpoint
        if (!urlPath || urlPath === 'tree' || urlPath === 'super-categories') {
            return res.status(404).json({ error: 'File not found' });
        }

        const result = await fileService.getFileByUrlPath(productId, urlPath);

        res.json({
            content: result.content,
            rawContent: result.rawContent,
            fileType: result.fileType,
            path: urlPath,
            metadata: {
                size: result.size,
                lastModified: result.lastModified
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Save document (for editor)
 */
async function saveDocument(req, res, next) {
    try {
        const { product, superCategory, category, fileName, content } = req.body;

        if (!product || !superCategory || !category || !fileName || content === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate fileName
        if (!/^[a-z0-9-_]+$/.test(fileName)) {
            return res.status(400).json({ error: 'Invalid file name format' });
        }

        const filePath = `${product}/${superCategory}/${category}/${fileName}.md`;
        const safePath = fileService.resolveSafePath(filePath);

        // Ensure directory exists
        const path = require('path');
        const dir = path.dirname(safePath);
        const fileAdapter = require('../data/fileSystemAdapter');

        if (!fileAdapter.exists(dir)) {
            await fileAdapter.mkdir(dir);
        }

        // Write file
        await fileAdapter.writeFile(safePath, content);

        // Clear cache for this file
        fileService.clearCache(filePath);

        res.json({
            success: true,
            message: 'Document saved successfully',
            path: filePath
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProductTree,
    getFileContent,
    saveDocument
};
