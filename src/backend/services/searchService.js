/**
 * Search Service
 * Handles search indexing and querying using Fuse.js
 */

const Fuse = require('fuse.js');
const fileService = require('./fileService');
const config = require('../config');

// Search index and Fuse instance
let searchIndex = [];
let fuse = null;

// Fuse.js configuration
const fuseOptions = {
    keys: [
        { name: 'title', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'path', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.3,  // Fuzzy matching threshold
    minMatchCharLength: 2,
    ignoreLocation: true
};

/**
 * Extract plain text from markdown content
 * Removes markdown syntax for better searching
 * @param {string} markdown - Markdown content
 * @returns {string} Plain text
 */
function extractPlainText(markdown) {
    if (!markdown) return '';

    let text = markdown;

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`[^`]+`/g, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Remove markdown links but keep the text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

    // Remove headers markers
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Remove emphasis markers
    text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');

    // Remove horizontal rules
    text = text.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');

    // Remove list markers
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^[\s]*\d+\.\s+/gm, '');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Recursively collect all files from a tree
 * @param {Array} tree - File tree from fileService
 * @param {string} productId - Product ID
 * @param {string} basePath - Base path for constructing file paths
 * @returns {Array} List of files
 */
function collectFilesFromTree(tree, productId, basePath = '') {
    const files = [];

    for (const item of tree) {
        if (item.type === 'file') {
            files.push({
                path: item.path,
                fileName: item.fileName,
                name: item.name,
                urlSlug: item.urlSlug,
                fileType: item.fileType,
                productId: productId
            });
        } else if (item.type === 'category' && item.children) {
            const categoryFiles = collectFilesFromTree(item.children, productId, item.path);
            files.push(...categoryFiles);
        }
    }

    return files;
}

/**
 * Build search index for a specific product
 * @param {string} productId - Product ID to index
 * @returns {Promise<number>} Number of documents indexed
 */
async function buildProductIndex(productId) {
    try {
        console.log(`[SearchService] Building index for product: ${productId}`);

        const productTree = fileService.getProductTree(productId);
        const files = collectFilesFromTree(productTree.tree, productId);

        const indexedDocs = [];
        const errors = [];

        for (const file of files) {
            try {
                // getRawContent expects path relative to content directory
                const path = require('path'); // Falls path oben noch nicht importiert ist
                const fullPath = path.join(productId, file.path);
                const rawContent = await fileService.getRawContent(fullPath);
                const plainText = extractPlainText(rawContent);

                // Extract title from first heading or use file name
                const titleMatch = rawContent.match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1] : file.name;

                // Get category from path
                const pathParts = file.path.split('/');
                const category = pathParts.length > 1 ? pathParts[pathParts.length - 2] : productId;

                indexedDocs.push({
                    title: title,
                    content: plainText.substring(0, 500), // Limit content length
                    path: file.path,
                    urlSlug: file.urlSlug,
                    fileName: file.fileName,
                    fileType: file.fileType,
                    category: category,
                    productId: productId
                });
            } catch (error) {
                // Collect errors silently instead of logging each one
                errors.push(file.path);
            }
        }

        // Log summary instead of individual errors
        if (errors.length > 0) {
            console.log(`[SearchService] ⚠ Skipped ${errors.length} missing file(s) in product: ${productId}`);
        }

        return indexedDocs;

    } catch (error) {
        console.error(`Error building index for ${productId}:`, error);
        return [];
    }
}

/**
 * Build complete search index for all products
 * @returns {Promise<number>} Number of documents indexed
 */
async function buildIndex() {
    try {
        console.log('[SearchService] Starting full index build...');

        searchIndex = [];

        // Get all products from content directory
        const contentPath = config.paths.content;
        const fileAdapter = require('../data/fileSystemAdapter');
        const products = fileAdapter.readdirSync(contentPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => !dirent.name.startsWith('.'))
            .map(dirent => dirent.name);

        console.log(`[SearchService] Found ${products.length} product(s) to index`);

        // Index each product
        for (const productId of products) {
            const docs = await buildProductIndex(productId);
            searchIndex.push(...docs);
        }

        // Initialize Fuse with the index
        fuse = new Fuse(searchIndex, fuseOptions);

        if (searchIndex.length === 0) {
            console.log(`[SearchService] ⚠ Index build complete: No documents indexed (empty content directory)`);
        } else {
            console.log(`[SearchService] ✓ Index build complete: ${searchIndex.length} document(s) indexed`);
        }

        return searchIndex.length;

    } catch (error) {
        console.error('[SearchService] Index build failed:', error);
        throw error;
    }
}

/**
 * Search documents
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Array} Search results
 */
function search(query, options = {}) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    if (!fuse) {
        console.warn('[SearchService] Search index not initialized');
        return [];
    }

    const limit = options.limit || 20;
    const productFilter = options.product;

    let results = fuse.search(query);

    // Filter by product if specified
    if (productFilter) {
        results = results.filter(r => r.item.productId === productFilter);
    }

    // Limit and format results
    return results.slice(0, limit).map(r => ({
        score: r.score,
        title: r.item.title,
        content: r.item.content,
        path: r.item.path,
        urlSlug: r.item.urlSlug,
        fileName: r.item.fileName,
        fileType: r.item.fileType,
        category: r.item.category,
        productId: r.item.productId
    }));
}

/**
 * Rebuild index for a specific file (after edit)
 * @param {string} filePath - File path that was updated
 */
async function updateFileInIndex(filePath) {
    try {
        // Remove old entry
        searchIndex = searchIndex.filter(doc => doc.path !== filePath);

        // Add new entry
        try {
            const rawContent = await fileService.getRawContent(filePath);
            const plainText = extractPlainText(rawContent);

            const titleMatch = rawContent.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : filePath.split('/').pop();

            const pathParts = filePath.split('/');
            const productId = pathParts[0];
            const category = pathParts.length > 1 ? pathParts[pathParts.length - 2] : productId;

            searchIndex.push({
                title: title,
                content: plainText.substring(0, 500),
                path: filePath,
                category: category,
                productId: productId
            });

            // Rebuild Fuse index
            fuse = new Fuse(searchIndex, fuseOptions);

            console.log(`[SearchService] Updated file in index: ${filePath}`);
        } catch (fileError) {
            // File might have been deleted or doesn't exist
            console.log(`[SearchService] File no longer exists or is inaccessible: ${filePath}`);
        }

    } catch (error) {
        console.error(`Error updating file in index ${filePath}:`, error);
    }
}

/**
 * Get index statistics
 * @returns {object} Index stats
 */
function getStats() {
    return {
        totalDocuments: searchIndex.length,
        indexed: fuse !== null,
        products: [...new Set(searchIndex.map(doc => doc.productId))]
    };
}

module.exports = {
    buildIndex,
    buildProductIndex,
    search,
    updateFileInIndex,
    getStats
};
