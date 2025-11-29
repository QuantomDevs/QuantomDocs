/**
 * File Service
 * Handles file operations, path validation, tree building, and server-side rendering
 */

const path = require('path');
const NodeCache = require('node-cache');
const { marked } = require('marked');
const config = require('../config');
const fileAdapter = require('../data/fileSystemAdapter');
const { ResourceNotFoundError, PathTraversalError, ValidationError } = require('../utils/customErrors');

// Initialize cache for rendered content
const contentCache = new NodeCache(config.cache);

// Base directories for content
const BASE_CONTENT_DIR = config.paths.content;

/**
 * Validate and resolve safe path
 * Prevents path traversal attacks
 * @param {string} requestedPath - Relative path from content directory
 * @param {string} baseDir - Base directory to resolve against
 * @returns {string} Resolved absolute path
 */
function resolveSafePath(requestedPath, baseDir = BASE_CONTENT_DIR) {
    try {
        // Decode URI components to handle URL-encoded attacks
        const decodedPath = decodeURIComponent(requestedPath);

        // Check for path traversal patterns
        const traversalPatterns = [
            /\.\./g,           // Parent directory
            /^~/,              // Home directory
            /%2e%2e/gi,        // URL-encoded ..
            /%252e%252e/gi,    // Double URL-encoded ..
        ];

        for (const pattern of traversalPatterns) {
            if (pattern.test(decodedPath) || pattern.test(requestedPath)) {
                throw new PathTraversalError('Path contains forbidden characters');
            }
        }

        // Check for absolute path
        if (path.isAbsolute(decodedPath)) {
            throw new PathTraversalError('Absolute paths are not allowed');
        }

        // Resolve to absolute path
        const absolutePath = path.resolve(baseDir, decodedPath);

        // Normalize the path
        const normalizedPath = path.normalize(absolutePath);

        // Ensure the normalized path still starts with the base directory
        if (!normalizedPath.startsWith(baseDir)) {
            throw new PathTraversalError('Path traversal attempt detected');
        }

        return normalizedPath;
    } catch (error) {
        if (error instanceof PathTraversalError) {
            throw error;
        }
        throw new ValidationError('Invalid path format');
    }
}

/**
 * Format folder/file name into URL-friendly slug
 * @param {string} name - Original name
 * @returns {string} URL slug
 */
function formatUrlPath(name) {
    let cleaned = name.replace(/\.(md|mdx)$/, '');
    cleaned = cleaned.replace(/^\d+-/, '');
    cleaned = cleaned.toLowerCase();
    cleaned = cleaned.replace(/[\s_]+/g, '-');
    cleaned = cleaned.replace(/[^a-z0-9-]/g, '');
    cleaned = cleaned.replace(/-+/g, '-');
    cleaned = cleaned.replace(/^-|-$/g, '');
    return cleaned;
}

/**
 * Resolve URL slug back to actual folder/file name
 * @param {string} parentPath - Absolute path to parent directory
 * @param {string} urlSlug - URL slug to resolve
 * @returns {string|null} Actual folder/file name
 */
function resolveUrlPath(parentPath, urlSlug) {
    try {
        const entries = fileAdapter.readdirSync(parentPath, { withFileTypes: true });

        for (const entry of entries) {
            const formatted = formatUrlPath(entry.name);
            if (formatted === urlSlug.toLowerCase()) {
                return entry.name;
            }
        }

        return null;
    } catch (error) {
        console.error(`Error resolving URL path in ${parentPath}:`, error);
        return null;
    }
}

/**
 * Recursively build category tree from directory
 * @param {string} dirPath - Absolute path to directory
 * @param {string} relativePath - Relative path from product root
 * @returns {Array} Category tree
 */
function buildCategoryTree(dirPath, relativePath = '') {
    const items = [];

    try {
        const entries = fileAdapter.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;

            const itemPath = path.join(dirPath, entry.name);
            const itemRelativePath = relativePath
                ? `${relativePath}/${entry.name}`
                : entry.name;

            if (entry.isDirectory()) {
                const match = entry.name.match(/^(\d+)-(.+)$/);
                const order = match ? parseInt(match[1], 10) : 999;
                const cleanName = match ? match[2] : entry.name;
                const urlSlug = formatUrlPath(entry.name);

                const indexMdPath = path.join(itemPath, 'index.md');
                const indexMdxPath = path.join(itemPath, 'index.mdx');
                const hasIndex = fileAdapter.exists(indexMdPath) || fileAdapter.exists(indexMdxPath);

                const children = buildCategoryTree(itemPath, itemRelativePath);

                items.push({
                    type: 'category',
                    id: entry.name,
                    name: cleanName,
                    urlSlug: urlSlug,
                    order: order,
                    path: itemRelativePath,
                    children: children,
                    hasFiles: children.some(child => child.type === 'file'),
                    hasSubcategories: children.some(child => child.type === 'category'),
                    hasIndex: hasIndex
                });

            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
                if (entry.name === 'index.md' || entry.name === 'index.mdx') continue;

                const fileExt = entry.name.endsWith('.mdx') ? '.mdx' : '.md';
                const fileType = entry.name.endsWith('.mdx') ? 'mdx' : 'md';
                const nameWithoutExt = entry.name.replace(/\.(md|mdx)$/, '');
                const match = nameWithoutExt.match(/^(\d+)-(.+)$/);
                const order = match ? parseInt(match[1], 10) : 999;
                const cleanName = match ? match[2] : nameWithoutExt;
                const urlSlug = formatUrlPath(entry.name);

                items.push({
                    type: 'file',
                    id: nameWithoutExt,
                    name: cleanName,
                    urlSlug: urlSlug,
                    order: order,
                    path: itemRelativePath,
                    fileName: entry.name,
                    fileType: fileType
                });
            }
        }

        items.sort((a, b) => {
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });

    } catch (error) {
        console.error(`Error building tree for ${dirPath}:`, error);
    }

    return items;
}

/**
 * Render Markdown content to HTML
 * @param {string} content - Raw markdown content
 * @returns {string} Rendered HTML
 */
async function renderMarkdown(content) {
    // Configure marked with basic options
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });

    // For now, render basic markdown
    // TODO: Integrate custom marked extensions for components
    return marked.parse(content);
}

/**
 * Render MDX content to HTML
 * @param {string} content - Raw MDX content
 * @returns {Promise<string>} Rendered HTML
 */
async function renderMDX(content) {
    // TODO: Implement proper MDX rendering with @mdx-js/mdx
    // For now, fall back to markdown rendering
    console.warn('MDX rendering not yet fully implemented, falling back to Markdown');
    return renderMarkdown(content);
}

/**
 * Get raw file content
 * @param {string} filePath - Relative path from content directory
 * @returns {Promise<string>} File content
 */
async function getRawContent(filePath) {
    const safePath = resolveSafePath(filePath);

    if (!fileAdapter.exists(safePath)) {
        throw new ResourceNotFoundError('File not found');
    }

    return fileAdapter.readFile(safePath, 'utf-8');
}

/**
 * Get rendered content with caching
 * @param {string} filePath - Relative path from content directory
 * @returns {Promise<object>} Rendered content and metadata
 */
async function getRenderedContent(filePath) {
    const safePath = resolveSafePath(filePath);

    // Check cache
    const cacheKey = safePath;
    const cached = contentCache.get(cacheKey);
    if (cached) {
        console.log(`[Cache HIT] ${filePath}`);
        return cached;
    }

    if (!fileAdapter.exists(safePath)) {
        throw new ResourceNotFoundError('File not found');
    }

    // Read content and stats
    const rawContent = await fileAdapter.readFile(safePath, 'utf-8');
    const stats = await fileAdapter.stat(safePath);

    // Determine file type
    const extension = path.extname(safePath);
    const fileType = extension === '.mdx' ? 'mdx' : 'md';

    // Render content
    let renderedHtml;
    if (fileType === 'mdx') {
        renderedHtml = await renderMDX(rawContent);
    } else {
        renderedHtml = await renderMarkdown(rawContent);
    }

    const result = {
        content: renderedHtml,
        rawContent: rawContent,
        fileType: fileType,
        fileName: path.basename(safePath, extension),
        lastModified: stats.mtime,
        size: stats.size
    };

    // Cache the result
    contentCache.set(cacheKey, result);
    console.log(`[Cache SET] ${filePath}`);

    return result;
}

/**
 * Get product tree
 * @param {string} productId - Product ID
 * @returns {object} Product tree
 */
function getProductTree(productId) {
    const productPath = resolveSafePath(productId);

    if (!fileAdapter.exists(productPath)) {
        throw new ResourceNotFoundError('Product not found');
    }

    const tree = buildCategoryTree(productPath);

    return {
        product: productId,
        tree: tree,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get file by URL path
 * @param {string} productId - Product ID
 * @param {string} urlPath - URL path (e.g., "getting-started/installation")
 * @returns {Promise<object>} File content and metadata
 */
async function getFileByUrlPath(productId, urlPath) {
    const urlSegments = urlPath.split('/').filter(s => s);

    const productPath = resolveSafePath(productId);
    if (!fileAdapter.exists(productPath)) {
        throw new ResourceNotFoundError('Product not found');
    }

    let currentPath = productPath;
    const resolvedSegments = [];

    for (const segment of urlSegments) {
        const actualName = resolveUrlPath(currentPath, segment);

        if (!actualName) {
            throw new ResourceNotFoundError(`Could not resolve: ${segment}`);
        }

        resolvedSegments.push(actualName);
        currentPath = path.join(currentPath, actualName);
    }

    // Check if path exists
    let fileType = 'md';
    if (!fileAdapter.exists(currentPath)) {
        const mdxPath = currentPath + '.mdx';
        if (fileAdapter.exists(mdxPath)) {
            currentPath = mdxPath;
            resolvedSegments[resolvedSegments.length - 1] += '.mdx';
            fileType = 'mdx';
        } else {
            currentPath += '.md';
            resolvedSegments[resolvedSegments.length - 1] += '.md';
            fileType = 'md';
        }
    } else if (currentPath.endsWith('.mdx')) {
        fileType = 'mdx';
    }

    const stats = fileAdapter.statSync(currentPath);

    if (stats.isDirectory()) {
        throw new ValidationError('Path is a directory, not a file');
    }

    // Get relative path for rendering
    const relativePath = path.join(productId, ...resolvedSegments);

    return getRenderedContent(relativePath);
}

/**
 * Clear content cache
 * @param {string} filePath - Optional specific file to clear
 */
function clearCache(filePath) {
    if (filePath) {
        const safePath = resolveSafePath(filePath);
        contentCache.del(safePath);
        console.log(`[Cache CLEARED] ${filePath}`);
    } else {
        contentCache.flushAll();
        console.log('[Cache CLEARED] All cache cleared');
    }
}

module.exports = {
    resolveSafePath,
    formatUrlPath,
    resolveUrlPath,
    buildCategoryTree,
    getRawContent,
    getRenderedContent,
    getProductTree,
    getFileByUrlPath,
    clearCache,
    renderMarkdown,
    renderMDX
};
