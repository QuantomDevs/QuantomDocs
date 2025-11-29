/**
 * Search Controller
 * Handles search-related HTTP requests
 */

const searchService = require('../services/searchService');

/**
 * Search documents
 */
function searchDocs(req, res, next) {
    try {
        const { q, product, limit } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const results = searchService.search(q, {
            product: product,
            limit: limit ? parseInt(limit) : 20
        });

        res.json({
            query: q,
            results: results,
            count: results.length
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Rebuild search index
 */
async function rebuildIndex(req, res, next) {
    try {
        const count = await searchService.buildIndex();

        res.json({
            success: true,
            message: 'Search index rebuilt successfully',
            documentsIndexed: count
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get search index statistics
 */
function getStats(req, res, next) {
    try {
        const stats = searchService.getStats();

        res.json(stats);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchDocs,
    rebuildIndex,
    getStats
};
