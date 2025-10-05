/**
 * DOCS SEARCH FUNCTIONALITY
 * Search through documentation content
 */

// ===========================
// GLOBALE VARIABLEN
// ===========================

/** @type {Array<Object>} All searchable doc entries */
let allDocsEntries = [];

/** @type {boolean} Whether search index is loaded */
let searchIndexLoaded = false;

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
 * Initialize docs search when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for header to be injected
    setTimeout(() => {
        const docsSearchBtn = document.getElementById('docs-search-btn');
        if (docsSearchBtn) {
            registerDocsSearchListeners(docsSearchBtn);
            buildSearchIndex();
        }
    }, 100);
});

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
}

// ===========================
// POPUP CONTROL
// ===========================

/**
 * Open the docs search popup
 */
function openDocsSearchPopup() {
    docsSearchOverlay.classList.add('active');
    docsSearchInput.focus();
    handleDocsSearch(); // Show initial results
}

/**
 * Close the docs search popup
 */
function closeDocsSearchPopup() {
    docsSearchOverlay.classList.remove('active');
    docsSearchInput.value = '';
    docsSearchResults.innerHTML = '';
    docsSearchResults.classList.remove('visible');
    docsSearchPopup.classList.remove('expanded');
}

// ===========================
// SEARCH INDEX BUILDING
// ===========================

/**
 * Build search index from docs-config.json and markdown files
 */
async function buildSearchIndex() {
    try {
        // Load docs configuration
        const response = await fetch('config/docs-config.json');
        const docsConfig = await response.json();

        // Flatten all doc entries
        for (const category of docsConfig) {
            for (const item of category.items) {
                const entry = {
                    name: item.name,
                    category: category.category,
                    type: item.type,
                    file: item.file || null,
                    id: item.id || null,
                    content: ''
                };

                // Load content for markdown files
                if (item.type === 'md' && item.file) {
                    try {
                        const contentResponse = await fetch(`docs/${item.file}`);
                        const markdown = await contentResponse.text();
                        entry.content = extractTextFromMarkdown(markdown);
                    } catch (error) {
                        console.error(`Failed to load ${item.file}:`, error);
                    }
                } else if (item.type === 'html' && item.id) {
                    // For HTML content, try to get from DOM
                    const element = document.getElementById(item.id);
                    if (element) {
                        entry.content = element.textContent || '';
                    }
                }

                allDocsEntries.push(entry);
            }
        }

        searchIndexLoaded = true;
        console.log(`Search index built: ${allDocsEntries.length} entries`);
    } catch (error) {
        console.error('Failed to build search index:', error);
        searchIndexLoaded = false;
    }
}

/**
 * Extract plain text from markdown
 * Removes markdown syntax for better search results
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
// SEARCH FUNCTIONALITY
// ===========================

/**
 * Handle search input and display results
 */
function handleDocsSearch() {
    const query = docsSearchInput.value.trim().toLowerCase();

    if (!query) {
        // Show all docs when search is empty
        displayDocsResults(allDocsEntries, query);
        docsSearchPopup.classList.add('expanded');
        docsSearchResults.classList.add('visible');
        return;
    }

    // Filter docs entries
    const filteredEntries = allDocsEntries.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query);
        const categoryMatch = entry.category.toLowerCase().includes(query);
        const contentMatch = entry.content.toLowerCase().includes(query);

        return nameMatch || categoryMatch || contentMatch;
    });

    // Display filtered results
    displayDocsResults(filteredEntries, query);

    // Update UI states
    if (filteredEntries.length > 0 || query) {
        docsSearchPopup.classList.add('expanded');
        docsSearchResults.classList.add('visible');
    } else {
        docsSearchPopup.classList.remove('expanded');
        docsSearchResults.classList.remove('visible');
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
    const breadcrumb = `${entry.category} / ${entry.name}`;

    return `
        <div class="docs-result-item" data-entry='${JSON.stringify({file: entry.file, id: entry.id, name: entry.name})}'>
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

    // Navigate to the documentation
    if (entry.file) {
        // Load markdown file
        loadMarkdownFromSearch(`docs/${entry.file}`);
    } else if (entry.id) {
        // Show static HTML content
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
