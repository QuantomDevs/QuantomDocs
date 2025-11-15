/**
 * SEARCH ANALYTICS MODULE
 * Tracks search queries and provides analytics
 */

class SearchAnalytics {
    constructor() {
        this.queries = [];
        this.loadQueries();
    }

    /**
     * Track a search query
     * @param {string} query - The search query
     * @param {number} resultsCount - Number of results found
     */
    trackQuery(query, resultsCount) {
        const entry = {
            query: query.trim(),
            resultsCount: resultsCount || 0,
            timestamp: Date.now()
        };

        this.queries.push(entry);
        this.saveQueries();

        // Send to server for centralized analytics
        this.sendToServer(entry);
    }

    /**
     * Send analytics to server
     * @param {Object} entry - Query entry to send
     */
    async sendToServer(entry) {
        try {
            await fetch('/api/analytics/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: entry.query,
                    resultsCount: entry.resultsCount
                })
            });
        } catch (error) {
            console.error('Failed to send search analytics:', error);
        }
    }

    /**
     * Get popular search queries
     * @param {number} limit - Maximum number of queries to return
     * @returns {Array} Popular queries with counts
     */
    getPopularQueries(limit = 10) {
        const queryCount = {};

        this.queries.forEach(({ query }) => {
            const normalized = query.toLowerCase();
            queryCount[normalized] = (queryCount[normalized] || 0) + 1;
        });

        return Object.entries(queryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }

    /**
     * Get queries that returned no results
     * @returns {Array} Queries with no results
     */
    getNoResultQueries() {
        return [...new Set(
            this.queries
                .filter(q => q.resultsCount === 0)
                .map(q => q.query)
        )];
    }

    /**
     * Get recent search queries
     * @param {number} limit - Maximum number of queries to return
     * @returns {Array} Recent queries
     */
    getRecentQueries(limit = 10) {
        return this.queries
            .slice(-limit)
            .reverse()
            .map(q => q.query);
    }

    /**
     * Clear old queries (older than 30 days)
     */
    clearOldQueries() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.queries = this.queries.filter(q => q.timestamp > thirtyDaysAgo);
        this.saveQueries();
    }

    /**
     * Load queries from localStorage
     */
    loadQueries() {
        try {
            const stored = localStorage.getItem('searchQueries');
            if (stored) {
                this.queries = JSON.parse(stored);
                // Clean old queries on load
                this.clearOldQueries();
            }
        } catch (error) {
            console.error('Error loading search queries:', error);
            this.queries = [];
        }
    }

    /**
     * Save queries to localStorage
     */
    saveQueries() {
        try {
            // Keep only last 1000 queries locally
            const toSave = this.queries.slice(-1000);
            localStorage.setItem('searchQueries', JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving search queries:', error);
        }
    }

    /**
     * Get search statistics
     * @returns {Object} Statistics about searches
     */
    getStatistics() {
        const totalSearches = this.queries.length;
        const noResultSearches = this.queries.filter(q => q.resultsCount === 0).length;
        const avgResults = this.queries.reduce((sum, q) => sum + q.resultsCount, 0) / totalSearches || 0;

        return {
            totalSearches,
            noResultSearches,
            noResultPercentage: totalSearches > 0 ? (noResultSearches / totalSearches * 100).toFixed(1) : 0,
            avgResults: avgResults.toFixed(1)
        };
    }
}

// Create global instance
window.searchAnalytics = new SearchAnalytics();
