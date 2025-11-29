/**
 * Markdown Caching Module for QuantomDocs
 * Implements LRU cache for parsed markdown to improve performance
 *
 * ==========================================
 * DEPRECATED: This module is no longer used
 * ==========================================
 *
 * The backend has been refactored to use server-side markdown rendering.
 * The server now provides pre-rendered HTML in the API responses, eliminating
 * the need for client-side caching of parsed markdown.
 *
 * This file is kept for backward compatibility but should not be used in new code.
 * Consider removing this file in future versions after confirming no dependencies exist.
 *
 * Migration Note:
 * - Use server-side pre-rendered HTML from /api/docs/* endpoints
 * - Server provides response.content with ready-to-inject HTML
 * - Client-side markdown parsing (marked.parse) is no longer needed
 */

class MarkdownCache {
    constructor(maxSize = 50) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Generate a cache key from markdown content and options
     * @param {string} markdown - The markdown content
     * @param {Object} options - Parsing options
     * @returns {string} Cache key
     */
    generateKey(markdown, options = {}) {
        const optionsStr = JSON.stringify(options);
        return `${this.hashCode(markdown)}-${this.hashCode(optionsStr)}`;
    }

    /**
     * Generate a hash code from a string
     * @param {string} str - The string to hash
     * @returns {string} Hash code in base36
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * Get cached HTML for markdown content
     * @param {string} markdown - The markdown content
     * @param {Object} options - Parsing options
     * @returns {string|undefined} Cached HTML or undefined if not found
     */
    get(markdown, options) {
        const key = this.generateKey(markdown, options);
        const cached = this.cache.get(key);

        if (cached) {
            this.hits++;
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, cached);
            return cached.html;
        }

        this.misses++;
        return undefined;
    }

    /**
     * Store parsed HTML in cache
     * @param {string} markdown - The markdown content
     * @param {Object} options - Parsing options
     * @param {string} html - The parsed HTML
     */
    set(markdown, options, html) {
        const key = this.generateKey(markdown, options);

        // Implement LRU cache - remove oldest entry if at capacity
        if (this.cache.size >= this.maxSize) {
            // Remove first (oldest) entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            html,
            timestamp: Date.now()
        });
    }

    /**
     * Clear all cached entries
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const totalRequests = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: totalRequests > 0 ? (this.hits / totalRequests) : 0,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage in bytes
     * @returns {number} Estimated memory usage in bytes
     */
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const [key, value] of this.cache.entries()) {
            // Rough estimate: key size + html size
            totalSize += key.length * 2; // 2 bytes per character (UTF-16)
            totalSize += value.html.length * 2;
            totalSize += 8; // timestamp (8 bytes for number)
        }
        return totalSize;
    }

    /**
     * Remove entries older than specified time
     * @param {number} maxAge - Maximum age in milliseconds
     */
    pruneOld(maxAge = 3600000) { // Default: 1 hour
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.cache.delete(key);
            }
        }
    }
}

// Create global instance
const markdownCache = new MarkdownCache(50);

/**
 * Enhanced marked parsing with cache
 * @param {string} content - Markdown content to parse
 * @param {Object} options - Marked options
 * @returns {Promise<string>} Parsed HTML
 */
async function parseMarkdown(content, options = {}) {
    // Check cache first
    const cached = markdownCache.get(content, options);
    if (cached) {
        console.log('✓ Markdown cache hit');
        return cached;
    }

    // Parse markdown
    console.log('⚠ Markdown cache miss - parsing...');

    // Ensure marked is loaded
    if (!window.marked) {
        throw new Error('Marked.js library is not loaded');
    }

    // Parse with marked
    const html = await marked.parse(content, options);

    // Cache result
    markdownCache.set(content, options, html);

    return html;
}

// Export to window
window.markdownCache = markdownCache;
window.parseMarkdown = parseMarkdown;

// Periodically prune old entries (every 10 minutes)
setInterval(() => {
    markdownCache.pruneOld();
    const stats = markdownCache.getStats();
    console.log('Markdown cache stats:', stats);
}, 600000);

console.log('✓ Markdown Cache initialized');
