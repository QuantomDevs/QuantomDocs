/**
 * Downloads Page Client-Side JavaScript (Subphase 1.8)
 * Handles dynamic rendering of download products and modules
 */

// ==================== Utility Functions ====================

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Simple markdown to HTML converter
 * @param {string} markdown - Markdown text
 * @returns {string} HTML text
 */
function parseMarkdown(markdown) {
    if (!markdown) return '';

    let html = escapeHtml(markdown);

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Line breaks (double newlines become paragraphs)
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines become <br>
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

/**
 * Hides the loading indicator
 */
function hideLoading() {
    const loadingEl = document.getElementById('downloads-loading');
    if (loadingEl) loadingEl.style.display = 'none';
}

/**
 * Shows the content area
 */
function showContent() {
    const contentEl = document.getElementById('downloads-content');
    if (contentEl) contentEl.style.display = 'block';
}

/**
 * Gets the container element for a module position
 * @param {string} position - Module position (main, sidebar, full-width-top)
 * @returns {HTMLElement|null} Container element
 */
function getModuleContainer(position) {
    const containerMap = {
        'full-width-top': 'downloads-full-width-top',
        'main': 'downloads-main-content',
        'sidebar': 'downloads-sidebar'
    };

    const containerId = containerMap[position];
    return containerId ? document.getElementById(containerId) : null;
}

// ==================== Configuration & URL Handling ====================

/**
 * Fetches the downloads configuration from the API
 * @returns {Promise<Object|null>} Configuration object or null on error
 */
async function fetchDownloadsConfig() {
    try {
        const response = await fetch('/api/downloads/config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Config load error:', error);
        return null;
    }
}

/**
 * Extracts product ID from current URL
 * @returns {string|null} Product ID or null for base /downloads URL
 */
function getProductIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/^\/downloads\/([^\/]+)$/);
    return match ? match[1] : null;
}

/**
 * Loads and navigates to the default product
 * @param {Object} config - Configuration object
 * @returns {Object|null} Default product or null if not found
 */
function loadDefaultProduct(config) {
    if (!config.defaultProductId) {
        return null;
    }

    const defaultProduct = config.products.find(p => p.id === config.defaultProductId);
    if (defaultProduct) {
        // Update URL without page reload
        history.replaceState(null, '', `/downloads/${defaultProduct.id}`);
    }

    return defaultProduct;
}

/**
 * Finds a product by ID (case-insensitive)
 * @param {Object} config - Configuration object
 * @param {string} productId - Product ID to find
 * @returns {Object|null} Product object or null if not found
 */
function findProduct(config, productId) {
    if (!productId || !config.products) return null;

    const normalizedId = productId.toLowerCase();
    return config.products.find(p => p.id.toLowerCase() === normalizedId);
}

// ==================== Module Renderers ====================

/**
 * Renders a product header module
 * @param {Object} content - Module content
 * @returns {string} HTML string
 */
function renderProductHeader(content) {
    const hasImage = content.previewImage;
    const hasActions = content.learnMoreUrl || content.whatsNewUrl;

    return `
        <div class="product-header">
            <div class="product-header-text">
                <h1>${escapeHtml(content.title)}</h1>
                <p class="product-description">${escapeHtml(content.description)}</p>
                ${hasActions ? `
                    <div class="product-header-actions">
                        ${content.learnMoreUrl ? `
                            <a href="${escapeHtml(content.learnMoreUrl)}" class="btn btn-primary">
                                <i class="fas fa-book"></i> Learn More
                            </a>
                        ` : ''}
                        ${content.whatsNewUrl ? `
                            <a href="${escapeHtml(content.whatsNewUrl)}" class="btn btn-outline">
                                <i class="fas fa-star"></i> What's New
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            ${hasImage ? `
                <div class="product-header-image">
                    <img src="${escapeHtml(content.previewImage)}" alt="${escapeHtml(content.title)}" loading="lazy">
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Renders a feature list module
 * @param {Object} content - Module content
 * @returns {string} HTML string
 */
function renderFeatureList(content) {
    if (!content.features || content.features.length === 0) {
        return '';
    }

    const featuresHtml = content.features.map(feature => `
        <div class="feature-card">
            <div class="feature-icon">
                <i class="${escapeHtml(feature.icon)}"></i>
            </div>
            <h3 class="feature-title">${escapeHtml(feature.title)}</h3>
            <p class="feature-description">${escapeHtml(feature.description)}</p>
        </div>
    `).join('');

    return `
        <div class="feature-list">
            ${content.title ? `<h2 class="module-title">${escapeHtml(content.title)}</h2>` : ''}
            <div class="features-grid">
                ${featuresHtml}
            </div>
        </div>
    `;
}

/**
 * Renders a download grid module
 * @param {Object} content - Module content
 * @returns {string} HTML string
 */
function renderDownloadGrid(content) {
    if (!content.downloads || content.downloads.length === 0) {
        return '';
    }

    const downloadsHtml = content.downloads.map(download => `
        <div class="download-card ${download.isPrimary ? 'primary' : ''}">
            <div class="download-icon">
                <i class="${escapeHtml(download.icon)}"></i>
            </div>
            <h3 class="download-os">${escapeHtml(download.os)}</h3>
            <p class="download-version">
                Version ${escapeHtml(download.version)}
                ${download.beta ? '<span class="badge badge-beta">Beta</span>' : ''}
            </p>
            <a href="${escapeHtml(download.url)}" class="btn btn-download" download>
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `).join('');

    return `
        <div class="download-grid">
            ${content.title ? `<h2 class="module-title">${escapeHtml(content.title)}</h2>` : ''}
            <div class="downloads-grid">
                ${downloadsHtml}
            </div>
        </div>
    `;
}

/**
 * Renders an image banner module
 * @param {Object} content - Module content
 * @returns {string} HTML string
 */
function renderImageBanner(content) {
    if (!content.imageUrl) return '';

    const imageHtml = `
        <img src="${escapeHtml(content.imageUrl)}"
             alt="${escapeHtml(content.altText || 'Banner')}"
             loading="lazy">
    `;

    return `
        <div class="image-banner">
            ${content.link ? `
                <a href="${escapeHtml(content.link)}">
                    ${imageHtml}
                </a>
            ` : imageHtml}
        </div>
    `;
}

/**
 * Renders a text block module
 * @param {Object} content - Module content
 * @returns {string} HTML string
 */
function renderTextBlock(content) {
    if (!content.text) return '';

    const textHtml = content.supportMarkdown
        ? parseMarkdown(content.text)
        : `<p>${escapeHtml(content.text)}</p>`;

    return `
        <div class="text-block">
            ${content.title ? `<h2 class="module-title">${escapeHtml(content.title)}</h2>` : ''}
            <div class="text-content">
                ${textHtml}
            </div>
        </div>
    `;
}

/**
 * Renders a module based on its type
 * @param {Object} module - Module object
 * @returns {string} HTML string
 */
function renderModule(module) {
    const renderers = {
        'productHeader': renderProductHeader,
        'featureList': renderFeatureList,
        'downloadGrid': renderDownloadGrid,
        'imageBanner': renderImageBanner,
        'textBlock': renderTextBlock
    };

    const renderer = renderers[module.type];
    if (!renderer) {
        console.warn(`Unknown module type: ${module.type}`);
        return '';
    }

    try {
        return renderer(module.content);
    } catch (error) {
        console.error(`Error rendering module ${module.moduleId}:`, error);
        return '';
    }
}

// ==================== Page Rendering ====================

/**
 * Renders the complete downloads page for a product
 * @param {Object} product - Product object with modules
 */
function renderDownloadsPage(product) {
    // Get container elements
    const fullWidthTop = document.getElementById('downloads-full-width-top');
    const mainContent = document.getElementById('downloads-main-content');
    const sidebar = document.getElementById('downloads-sidebar');

    // Clear all containers
    if (fullWidthTop) fullWidthTop.innerHTML = '';
    if (mainContent) mainContent.innerHTML = '';
    if (sidebar) sidebar.innerHTML = '';

    // Render each module
    if (product.modules && product.modules.length > 0) {
        product.modules.forEach(module => {
            const html = renderModule(module);
            if (html) {
                const container = getModuleContainer(module.position);
                if (container) {
                    container.innerHTML += html;
                } else {
                    console.warn(`Invalid position for module ${module.moduleId}: ${module.position}`);
                }
            }
        });
    } else {
        // No modules defined - show placeholder
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x"></i>
                    <h2>No Content Available</h2>
                    <p>This product doesn't have any download information yet.</p>
                </div>
            `;
        }
    }

    // Update page title
    document.title = `${product.name} - Downloads \ Quantom`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', `Download ${product.name} for your platform`);
    }

    // Hide loading, show content
    hideLoading();
    showContent();
}

/**
 * Displays an error message to the user
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function showError(title, message) {
    hideLoading();

    const errorEl = document.getElementById('downloads-error');
    const errorTitleEl = document.getElementById('error-title');
    const errorMessageEl = document.getElementById('error-message');

    if (errorTitleEl) errorTitleEl.textContent = title;
    if (errorMessageEl) errorMessageEl.textContent = message;
    if (errorEl) errorEl.style.display = 'block';
}

// ==================== Initialization ====================

/**
 * Main initialization function
 * Loads configuration, determines product, and renders page
 */
async function initDownloadsPage() {
    try {
        // Fetch configuration
        const config = await fetchDownloadsConfig();
        if (!config) {
            showError(
                'Configuration Error',
                'Failed to load downloads configuration. Please try again later or contact support.'
            );
            return;
        }

        // Check if there are any products
        if (!config.products || config.products.length === 0) {
            showError(
                'No Downloads Available',
                'There are no downloads available at this time. Please check back later.'
            );
            return;
        }

        // Get product ID from URL
        let productId = getProductIdFromUrl();
        let product;

        if (!productId) {
            // No product specified - load default
            product = loadDefaultProduct(config);
            if (!product) {
                // No default product set - show first product
                product = config.products[0];
                history.replaceState(null, '', `/downloads/${product.id}`);
            }
        } else {
            // Product ID specified - find it
            product = findProduct(config, productId);
        }

        // Check if product was found
        if (!product) {
            showError(
                'Product Not Found',
                `The product "${productId}" could not be found. It may have been removed or the URL is incorrect.`
            );
            return;
        }

        // Render the product page
        renderDownloadsPage(product);

    } catch (error) {
        console.error('Downloads page initialization error:', error);
        showError(
            'Unexpected Error',
            'An unexpected error occurred while loading the page. Please refresh and try again.'
        );
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDownloadsPage);
} else {
    initDownloadsPage();
}
