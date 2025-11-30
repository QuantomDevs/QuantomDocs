/**
 * DOCS SEARCH FUNCTIONALITY
 * Search through documentation content
 *
 * UPDATED: Now uses server-side search API instead of client-side indexing
 */

// ===========================
// GLOBALE VARIABLEN
// ===========================

/** @type {Array<Object>} All searchable doc entries - DEPRECATED: Now using server-side search */
let allDocsEntries = [];

/** @type {boolean} Whether search index is loaded - DEPRECATED: Now using server-side search */
let searchIndexLoaded = false;

/** @type {number} Currently selected result index (-1 = none selected) */
let selectedResultIndex = -1;

// ===========================
// DOM ELEMENTE
// ===========================

const docsSearchOverlay = document.getElementById('docs-search-overlay');
const docsSearchPopup = document.getElementById('docs-search-popup');
const docsSearchInput = document.getElementById('docs-search-input');
const docsSearchResults = document.getElementById('docs-search-results');

// ===========================
// INITIALISIERUNG
// ===========================

/**
 * Initialize docs search
 * UPDATED: Removed client-side index building - now uses server-side search API
 */
function initDocsSearch() {
    console.log('[Search] Initializing search module...');

    const docsSearchBtn = document.getElementById('docs-search-btn');
    if (docsSearchBtn) {
        console.log('[Search] Search button found, registering listeners...');
        registerDocsSearchListeners(docsSearchBtn);
        // Client-side index building removed - now using server-side search API
        searchIndexLoaded = true; // Mark as loaded for UI compatibility
    } else {
        console.error('[Search] Search button not found!');
        // Retry after a delay
        setTimeout(() => {
            const retryBtn = document.getElementById('docs-search-btn');
            if (retryBtn) {
                console.log('[Search] Search button found on retry');
                registerDocsSearchListeners(retryBtn);
                searchIndexLoaded = true; // Mark as loaded for UI compatibility
            }
        }, 500);
    }
}

// Auto-initialize if DOM is already loaded, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocsSearch);
} else {
    // DOM already loaded, initialize immediately
    initDocsSearch();
}

// ===========================
// EVENT LISTENER
// ===========================

/**
 * Register all event listeners for docs search
 */
function registerDocsSearchListeners(searchBtn) {
    // Open search popup via button click
    searchBtn.addEventListener('click', openDocsSearchPopup);

    // Close popup when clicking on overlay
    docsSearchOverlay.addEventListener('click', (e) => {
        if (e.target === docsSearchOverlay) {
            closeDocsSearchPopup();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && docsSearchOverlay.classList.contains('active')) {
            closeDocsSearchPopup();
        }

        // CMD+K or CTRL+K to open search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openDocsSearchPopup();
        }
    });

    // Real-time search on input
    docsSearchInput.addEventListener('input', handleDocsSearch);

    // Keyboard navigation (Arrow keys and Enter)
    docsSearchInput.addEventListener('keydown', handleSearchKeyboardNavigation);
}

// ===========================
// KEYBOARD NAVIGATION
// ===========================

/**
 * Handle keyboard navigation in search results
 */
function handleSearchKeyboardNavigation(e) {
    const resultItems = document.querySelectorAll('.docs-result-item');

    if (resultItems.length === 0) return;

    // Arrow Down: Select next result
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedResultIndex = Math.min(selectedResultIndex + 1, resultItems.length - 1);
        updateSelectedResult(resultItems);
    }

    // Arrow Up: Select previous result
    else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
        updateSelectedResult(resultItems);
    }

    // Enter: Open selected result
    else if (e.key === 'Enter') {
        e.preventDefault();

        if (selectedResultIndex >= 0 && selectedResultIndex < resultItems.length) {
            const selectedItem = resultItems[selectedResultIndex];
            const entry = JSON.parse(selectedItem.dataset.entry);
            handleDocsResultClick(entry);
        }
    }
}

/**
 * Update visual selection of result item
 */
function updateSelectedResult(resultItems) {
    // Remove active class from all items
    resultItems.forEach((item, index) => {
        if (index === selectedResultIndex) {
            item.classList.add('active');
            // Scroll into view if needed
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// ===========================
// POPUP CONTROL
// ===========================

/**
 * Open the docs search popup
 */
function openDocsSearchPopup() {
    docsSearchOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    docsSearchInput.focus();
    selectedResultIndex = -1; // Reset selection
    handleDocsSearch(); // Show initial results
}

/**
 * Close the docs search popup
 */
function closeDocsSearchPopup() {
    docsSearchOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll'); 
    docsSearchInput.value = '';
    docsSearchResults.innerHTML = '';
    docsSearchResults.classList.remove('visible');
    docsSearchPopup.classList.remove('expanded');
}

// ===========================
// SEARCH INDEX BUILDING
// ===========================

/**
 * DEPRECATED: Build search index from docs-config.json and markdown files
 * This function is no longer used - search now uses server-side API
 * Kept for reference only
 */
async function buildSearchIndex() {
    // DEPRECATED: Client-side indexing is disabled
    // Search now uses server-side API at /api/search
    console.log('[Search] Client-side indexing is deprecated - using server-side search API');
    searchIndexLoaded = true;
    return;

    // Legacy code below (kept for reference, never executed):
    /* eslint-disable no-unreachable */
    try {
        // Load docs configuration (new product-based structure)
        const configUrl = '/docs/config/docs-config.json';
        console.log('[Search] Fetching config from:', configUrl);
        const response = await fetch(configUrl);

        if (!response.ok) {
            throw new Error(`Failed to load docs-config.json: ${response.status} ${response.statusText}`);
        }

        const config = await response.json();
        const products = config.products.filter(p => p.showInDocs);

        // Build index for all products
        for (const product of products) {
            try {
                // Fetch super-categories for this product
                const apiBase = window.location.origin;
                const scResponse = await fetch(`${apiBase}/api/docs/${product.id}/super-categories`);

                if (!scResponse.ok) {
                    console.error(`Failed to fetch super-categories for ${product.id}: ${scResponse.status}`);
                    continue;
                }

                const scData = await scResponse.json();

                // Process each super-category
                for (const superCat of scData.superCategories) {
                    // Get categories for this super-category
                    const catResponse = await fetch(`${apiBase}/api/docs/${product.id}/${superCat.fullName}/categories`);

                    if (!catResponse.ok) {
                        console.error(`Failed to fetch categories for ${product.id}/${superCat.fullName}: ${catResponse.status}`);
                        continue;
                    }

                    const catData = await catResponse.json();

                    // Process each category and file
                    for (const category of catData.categories) {
                        for (const file of category.files) {
                            const filePath = `${product.id}/${superCat.fullName}/${category.id}/${file}`;

                            const entry = {
                                productId: product.id,
                                productName: product.name,
                                superCategory: superCat.name,
                                superCategoryFull: superCat.fullName,
                                name: file.replace(/-/g, ' '),
                                category: category.name,
                                categoryId: category.id,
                                type: 'md',
                                file: filePath,
                                id: null,
                                content: ''
                            };

                            // Load markdown content for searching
                            try {
                                const contentResponse = await fetch(`/docs/content/${filePath}.md`);

                                if (!contentResponse.ok) {
                                    console.error(`Failed to load ${filePath}: ${contentResponse.status}`);
                                    entry.content = ''; // Set empty content if fetch fails
                                } else {
                                    const markdown = await contentResponse.text();
                                    entry.content = extractTextFromMarkdown(markdown);
                                }
                            } catch (error) {
                                console.error(`Failed to load ${filePath}:`, error);
                                entry.content = ''; // Set empty content on error
                            }

                            allDocsEntries.push(entry);
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to load structure for product ${product.id}:`, error);
            }
        }

        searchIndexLoaded = true;
        console.log(`Search index built: ${allDocsEntries.length} entries across ${products.length} products`);
    } catch (error) {
        console.error('Failed to build search index:', error);
        searchIndexLoaded = false;
    }
    /* eslint-enable no-unreachable */
}

/**
 * DEPRECATED: Extract plain text from markdown
 * Removes markdown syntax for better search results
 * This function is no longer used - search now uses server-side API
 */
function extractTextFromMarkdown(markdown) {
    return markdown
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
        // Remove headers but keep text
        .replace(/^#+\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        // Remove HTML tags
        .replace(/<[^>]+>/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

// ===========================
// SEARCH FUNCTIONALITY (DEPRECATED - Client-side search logic)
// These functions are kept for reference but are no longer used
// Search now uses server-side API at /api/search
// ===========================

/**
 * DEPRECATED: Parse search query for boolean operators
 * This function is no longer used - search now uses server-side API
 * @param {string} query - Raw search query
 * @returns {Object} Parsed query object
 */
function parseSearchQuery(query) {
    const tokens = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < query.length; i++) {
        const char = query[i];

        if (char === '"') {
            inQuotes = !inQuotes;
            if (!inQuotes && current) {
                tokens.push({ type: 'phrase', value: current.toLowerCase() });
                current = '';
            }
        } else if (char === ' ' && !inQuotes) {
            if (current) {
                addSearchToken(tokens, current);
                current = '';
            }
        } else {
            current += char;
        }
    }

    if (current) {
        addSearchToken(tokens, current);
    }

    return buildSearchExpression(tokens);
}

/**
 * Add a token to the search tokens array
 * @param {Array} tokens - Array of tokens
 * @param {string} text - Text to tokenize
 */
function addSearchToken(tokens, text) {
    const upper = text.toUpperCase();
    if (upper === 'AND' || upper === 'OR' || upper === 'NOT') {
        tokens.push({ type: 'operator', value: upper });
    } else if (text.endsWith('*')) {
        tokens.push({ type: 'wildcard', value: text.slice(0, -1).toLowerCase() });
    } else if (text.includes(':')) {
        const [field, value] = text.split(':');
        tokens.push({ type: 'field', field: field.toLowerCase(), value: value.toLowerCase() });
    } else {
        tokens.push({ type: 'term', value: text.toLowerCase() });
    }
}

/**
 * Build search expression from tokens
 * @param {Array} tokens - Array of tokens
 * @returns {Object} Search expression
 */
function buildSearchExpression(tokens) {
    const expr = {
        operator: 'AND',
        terms: []
    };

    let currentOperator = 'AND';

    tokens.forEach(token => {
        if (token.type === 'operator') {
            currentOperator = token.value;
        } else {
            expr.terms.push({
                ...token,
                operator: currentOperator
            });
        }
    });

    return expr;
}

/**
 * Match a document against search expression
 * @param {Object} entry - Document entry
 * @param {Object} expression - Search expression
 * @returns {boolean} Whether document matches
 */
function matchSearchExpression(entry, expression) {
    if (expression.terms.length === 0) return true;

    let result = expression.operator === 'AND';

    for (const term of expression.terms) {
        let match = false;

        switch (term.type) {
            case 'term':
                match = matchTerm(entry, term.value);
                break;
            case 'phrase':
                match = matchPhrase(entry, term.value);
                break;
            case 'wildcard':
                match = matchWildcard(entry, term.value);
                break;
            case 'field':
                match = matchField(entry, term.field, term.value);
                break;
        }

        if (term.operator === 'AND') {
            result = result && match;
        } else if (term.operator === 'OR') {
            result = result || match;
        } else if (term.operator === 'NOT') {
            result = result && !match;
        }
    }

    return result;
}

/**
 * Match a term in document
 * @param {Object} entry - Document entry
 * @param {string} term - Search term
 * @returns {boolean} Whether term matches
 */
function matchTerm(entry, term) {
    const searchText = `${entry.name} ${entry.category} ${entry.content}`.toLowerCase();
    return searchText.includes(term);
}

/**
 * Match a phrase in document
 * @param {Object} entry - Document entry
 * @param {string} phrase - Search phrase
 * @returns {boolean} Whether phrase matches
 */
function matchPhrase(entry, phrase) {
    const searchText = `${entry.name} ${entry.category} ${entry.content}`.toLowerCase();
    return searchText.includes(phrase);
}

/**
 * Match wildcard pattern in document
 * @param {Object} entry - Document entry
 * @param {string} prefix - Wildcard prefix
 * @returns {boolean} Whether wildcard matches
 */
function matchWildcard(entry, prefix) {
    const searchText = `${entry.name} ${entry.category} ${entry.content}`.toLowerCase();
    const words = searchText.split(/\s+/);
    return words.some(word => word.startsWith(prefix));
}

/**
 * Match a specific field in document
 * @param {Object} entry - Document entry
 * @param {string} field - Field name
 * @param {string} value - Field value to match
 * @returns {boolean} Whether field matches
 */
function matchField(entry, field, value) {
    const fieldValue = entry[field];
    if (!fieldValue) return false;
    return fieldValue.toLowerCase().includes(value);
}

/**
 * Calculate Levenshtein distance for spelling suggestions
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Get spelling suggestions for query
 * @param {string} query - Search query
 * @returns {Array} Spelling corrections
 */
function getSpellingSuggestions(query) {
    const allTerms = allDocsEntries.flatMap(doc =>
        `${doc.name} ${doc.category}`.toLowerCase().split(/\s+/)
    );

    const uniqueTerms = [...new Set(allTerms)];
    const corrections = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    queryWords.forEach(word => {
        if (word.length < 3) return;

        const similar = uniqueTerms
            .map(term => ({
                term,
                distance: levenshteinDistance(word, term)
            }))
            .filter(({ distance }) => distance > 0 && distance <= 2)
            .sort((a, b) => a.distance - b.distance);

        if (similar.length > 0) {
            corrections.push({
                original: word,
                suggestion: similar[0].term
            });
        }
    });

    return corrections;
}

/**
 * Handle search input and display results
 * UPDATED: Now uses server-side search API instead of client-side filtering
 */
async function handleDocsSearch() {
    const query = docsSearchInput.value.trim();

    console.log('[Search] Query:', query);

    if (!query) {
        // Clear results when search is empty
        console.log('[Search] Empty query, clearing results');
        docsSearchResults.innerHTML = '';
        docsSearchPopup.classList.remove('expanded');
        docsSearchResults.classList.remove('visible');
        selectedResultIndex = -1;
        return;
    }

    try {
        // Call server-side search API
        const apiUrl = `/api/search?q=${encodeURIComponent(query)}&limit=50`;
        console.log('[Search] Fetching from:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Search API failed: ${response.status}`);
        }

        const data = await response.json();

        // Response format:
        // {
        //   query: "search term",
        //   results: [
        //     {
        //       score: 0.1,
        //       title: "Page Title",
        //       content: "Preview text...",
        //       path: "product/category/file.md",
        //       urlSlug: "url-slug",
        //       category: "category-name",
        //       productId: "product-id"
        //     }
        //   ],
        //   count: 10
        // }

        console.log('[Search] Server results:', data.count);

        // Track search analytics
        if (window.searchAnalytics) {
            window.searchAnalytics.trackQuery(query, data.count);
        }

        // Convert server results to our display format
        const displayResults = data.results.map(result => ({
            productId: result.productId,
            productName: result.productId, // Could be enhanced with product name lookup
            name: result.title,
            category: result.category,
            content: result.content,
            file: result.path,
            urlSlug: result.urlSlug,
            type: 'md'
        }));

        // Display results
        displayDocsResults(displayResults, query);

        // Update UI states
        if (displayResults.length > 0) {
            docsSearchPopup.classList.add('expanded');
            docsSearchResults.classList.add('visible');

            // Auto-select first result
            selectedResultIndex = 0;

            // Apply active class to first result after DOM update
            setTimeout(() => {
                const resultItems = document.querySelectorAll('.docs-result-item');
                if (resultItems.length > 0 && selectedResultIndex === 0) {
                    resultItems[0].classList.add('active');
                }
            }, 10);
        } else {
            docsSearchPopup.classList.add('expanded');
            docsSearchResults.classList.add('visible');
            selectedResultIndex = -1;
        }
    } catch (error) {
        console.error('[Search] Error querying server:', error);

        // Show error state
        docsSearchResults.innerHTML = `
            <div class="docs-empty-state">
                <div class="docs-empty-state-icon">⚠️</div>
                <div class="docs-empty-state-text">Search Error</div>
                <div class="docs-empty-state-hint">Failed to search. Please try again.</div>
            </div>
        `;
        docsSearchPopup.classList.add('expanded');
        docsSearchResults.classList.add('visible');
    }
}

// ===========================
// RESULTS DISPLAY
// ===========================

/**
 * Display search results
 */
function displayDocsResults(results, query) {
    docsSearchResults.innerHTML = '';

    // No results
    if (results.length === 0) {
        if (query) {
            docsSearchResults.innerHTML = createDocsEmptyState(query);
        }
        return;
    }

    // Group results by category
    const grouped = groupDocsResultsByCategory(results);

    // Create HTML for each category
    Object.entries(grouped).forEach(([category, entries]) => {
        const categoryHTML = createDocsCategorySection(category, entries, query);
        docsSearchResults.innerHTML += categoryHTML;
    });

    // Add click handlers
    addDocsResultClickHandlers();
}

/**
 * Group results by category
 */
function groupDocsResultsByCategory(results) {
    const grouped = {};

    results.forEach(entry => {
        const category = entry.category || 'Other';

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push(entry);
    });

    return grouped;
}

/**
 * Create HTML for a category section
 */
function createDocsCategorySection(category, entries, query) {
    let html = `<div class="docs-result-category">${escapeHtml(category)}</div>`;

    entries.forEach(entry => {
        html += createDocsResultItem(entry, query);
    });

    return html;
}

/**
 * Create HTML for a single result item
 */
function createDocsResultItem(entry, query) {
    const icon = getDocsIcon(entry.type);
    const preview = getContentPreview(entry.content, query);
    // Include super-category in breadcrumb
    const breadcrumb = entry.superCategory
        ? `${entry.productName} > ${entry.superCategory} > ${entry.category}`
        : `${entry.productName} / ${entry.category} / ${entry.name}`;

    return `
        <div class="docs-result-item" data-entry='${JSON.stringify({productId: entry.productId, file: entry.file, id: entry.id, name: entry.name, superCategory: entry.superCategoryFull, categoryId: entry.categoryId})}'>
            <div class="docs-result-icon">${icon}</div>
            <div class="docs-result-content">
                <div class="docs-result-breadcrumb">${escapeHtml(breadcrumb)}</div>
                <div class="docs-result-title">${escapeHtml(entry.name)}</div>
                ${preview ? `<div class="docs-result-preview">${preview}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Get content preview with highlighted search term
 */
function getContentPreview(content, query) {
    if (!content || !query) return '';

    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) return '';

    // Get context around the match (50 chars before and after)
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);

    let preview = content.substring(start, end);

    // Add ellipsis if needed
    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';

    // Highlight the search term
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    preview = escapeHtml(preview).replace(regex, '<mark>$1</mark>');

    return preview;
}

/**
 * Create empty state HTML
 */
function createDocsEmptyState(query) {
    return `
        <div class="docs-empty-state">
            <div class="docs-empty-state-icon">🔍</div>
            <div class="docs-empty-state-text">No documentation found</div>
            <div class="docs-empty-state-hint">No results for "${escapeHtml(query)}"</div>
        </div>
    `;
}

/**
 * Get icon for doc type
 */
function getDocsIcon(type) {
    if (type === 'md') {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

// ===========================
// RESULT INTERACTION
// ===========================

/**
 * Add click handlers to all result items
 */
function addDocsResultClickHandlers() {
    const resultItems = document.querySelectorAll('.docs-result-item');

    resultItems.forEach(item => {
        item.addEventListener('click', () => {
            const entry = JSON.parse(item.dataset.entry);
            handleDocsResultClick(entry);
        });
    });
}

/**
 * Handle click on a documentation result
 */
function handleDocsResultClick(entry) {
    console.log('Doc selected:', entry);
    closeDocsSearchPopup();

    // Navigate to the documentation using new product-based URL structure
    if (entry.file && entry.productId) {
        // Navigate to product documentation page with file parameter
        const newUrl = `${window.location.pathname}?product=${entry.productId}&file=${encodeURIComponent(entry.file)}`;
        window.location.href = newUrl;
    } else if (entry.id) {
        // Show static HTML content (legacy support)
        showStaticContentFromSearch(entry.id);
    }
}

/**
 * Load markdown file from search result
 */
async function loadMarkdownFromSearch(filePath) {
    try {
        // Extract file name from path (e.g., "docs/example.md" -> "example.md")
        const fileName = filePath.replace('docs/', '');

        // Update active class in left sidebar
        updateSidebarActiveState(fileName, null);

        // Hide static content
        const staticContent = document.getElementById('static-getting-started');
        if (staticContent) {
            staticContent.style.display = 'none';
        }

        // Show dynamic content area
        const dynamicContent = document.getElementById('dynamic-content-area');
        if (dynamicContent) {
            dynamicContent.style.display = 'block';
        }

        // Load the markdown file
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();

        // Parse and display markdown
        if (window.marked) {
            dynamicContent.innerHTML = marked.parse(markdown);

            // Trigger re-generation of TOC and other features
            const tocEvent = new CustomEvent('regenerateTOC');
            document.dispatchEvent(tocEvent);
        }
    } catch (error) {
        console.error('Error loading markdown from search:', error);
        const dynamicContent = document.getElementById('dynamic-content-area');
        if (dynamicContent) {
            dynamicContent.innerHTML = `
                <div class="warning-box">
                    <div class="warning-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error Loading Documentation</span>
                    </div>
                    <p>Failed to load the requested documentation page.</p>
                </div>
            `;
        }
    }
}

/**
 * Show static HTML content from search result
 */
function showStaticContentFromSearch(contentId) {
    // Update active class in left sidebar
    updateSidebarActiveState(null, contentId);

    // Hide dynamic content
    const dynamicContent = document.getElementById('dynamic-content-area');
    if (dynamicContent) {
        dynamicContent.style.display = 'none';
    }

    // Show static content
    const staticContent = document.getElementById(contentId);
    if (staticContent) {
        staticContent.style.display = 'block';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger TOC regeneration
        const tocEvent = new CustomEvent('regenerateTOC');
        document.dispatchEvent(tocEvent);
    }
}

/**
 * Update active state in left sidebar
 */
function updateSidebarActiveState(fileName, contentId) {
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-left ul li a').forEach(link => {
        link.classList.remove('active');
    });

    // Find and activate the matching link
    const sidebarLeft = document.querySelector('.sidebar-left');
    if (!sidebarLeft) return;

    let activeLink = null;

    if (fileName) {
        // Find link with matching data-file attribute
        activeLink = sidebarLeft.querySelector(`[data-file="${fileName}"]`);
    } else if (contentId) {
        // Find link with matching data-id attribute
        activeLink = sidebarLeft.querySelector(`[data-id="${contentId}"]`);
    }

    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
