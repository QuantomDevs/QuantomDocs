/**
 * Docs Header Module
 * Dynamically generates and manages the documentation header
 */

let headerDocsConfig = null;
let headerCurrentProduct = null;

/**
 * Initialize the docs header
 */
async function initDocsHeader() {
    try {
        // Load docs configuration
        headerDocsConfig = await loadDocsConfig();

        // Get current product from URL or config
        headerCurrentProduct = getCurrentProduct();

        // Generate and inject header
        const header = document.querySelector('header');
        if (header) {
            header.innerHTML = generateHeaderHTML();
            attachHeaderEventListeners();
            updateActiveTab();
        }

        // Add scroll effect
        window.addEventListener('scroll', handleHeaderScroll);

    } catch (error) {
        console.error('Failed to initialize docs header:', error);
    }
}

/**
 * Load docs configuration
 */
async function loadDocsConfig() {
    try {
        const response = await fetch('/docs/config/docs-config.json');
        if (!response.ok) {
            throw new Error('Failed to load docs config');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading docs config:', error);
        return { products: [], general: {} };
    }
}

/**
 * Get current product from URL or default
 */
function getCurrentProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productFromUrl = urlParams.get('product');

    if (productFromUrl) {
        return productFromUrl;
    }

    return headerDocsConfig?.general?.defaultProduct || 'quantom';
}

/**
 * Generate header HTML
 */
function generateHeaderHTML() {
    const products = headerDocsConfig?.products || [];
    const hasMultipleProducts = products.length > 1;

    return `
        <div class="docs-header">
            <div class="docs-header-inner">
                <!-- Logo Section -->
                <a href="/docs" class="docs-header-logo">
                    <div class="docs-header-logo-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <span class="docs-header-logo-text">Quantom Docs</span>
                </a>

                <!-- Navigation Tabs (Desktop) -->
                <nav class="docs-header-nav" aria-label="Main navigation">
                    ${generateNavTabs(products, hasMultipleProducts)}
                </nav>

                <!-- Actions Section -->
                <div class="docs-header-actions">
                    <!-- Search Button (Desktop) -->
                    <button class="docs-header-search-btn" id="docs-header-search-btn" aria-label="Search documentation">
                        <i class="fas fa-search"></i>
                        <span>Search...</span>
                        <span class="docs-header-search-shortcut">⌘K</span>
                    </button>

                    <!-- Theme Toggle -->
                    <button class="docs-header-theme-toggle" id="docs-header-theme-toggle" aria-label="Toggle theme">
                        <i class="fas fa-moon"></i>
                    </button>

                    <!-- Mobile Menu Button -->
                    <button class="docs-header-mobile-menu" id="docs-header-mobile-menu" aria-label="Open menu">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="docs-mobile-nav-overlay" id="docs-mobile-nav-overlay"></div>
        <div class="docs-mobile-nav-menu" id="docs-mobile-nav-menu">
            ${generateMobileNavItems(products)}
        </div>
    `;
}

/**
 * Generate navigation tabs
 */
function generateNavTabs(products, hasMultipleProducts) {
    if (!hasMultipleProducts || products.length === 0) {
        // Single product or no products - show simple tabs
        return `
            <a href="/docs" class="docs-nav-tab active" data-tab="documentation">
                <i class="fas fa-book"></i>
                <span>Documentation</span>
            </a>
            <a href="/docs/editor" class="docs-nav-tab" data-tab="editor">
                <i class="fas fa-edit"></i>
                <span>Editor</span>
            </a>
            <a href="/docs/settings" class="docs-nav-tab" data-tab="settings">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </a>
        `;
    }

    // Multiple products - show product dropdown
    const currentProductData = products.find(p => p.id === headerCurrentProduct) || products[0];

    return `
        <div class="docs-header-product-dropdown">
            <button class="docs-header-product-btn" id="docs-header-product-btn" aria-expanded="false">
                <span class="docs-header-product-icon">${currentProductData?.icon || '📦'}</span>
                <span>${currentProductData?.name || 'Select Product'}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="docs-header-product-menu" id="docs-header-product-menu">
                ${products.filter(p => p.showInDocs).map(product => `
                    <a href="/docs?product=${product.id}"
                       class="docs-header-product-item ${product.id === headerCurrentProduct ? 'active' : ''}"
                       data-product="${product.id}">
                        <span class="docs-header-product-icon">${product.icon || '📦'}</span>
                        <div class="docs-header-product-info">
                            <span class="docs-header-product-name">${product.name}</span>
                            ${product.description ? `<span class="docs-header-product-desc">${product.description}</span>` : ''}
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
        <a href="/docs/editor" class="docs-nav-tab" data-tab="editor">
            <i class="fas fa-edit"></i>
            <span>Editor</span>
        </a>
        <a href="/docs/settings" class="docs-nav-tab" data-tab="settings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
        </a>
    `;
}

/**
 * Generate mobile navigation items
 */
function generateMobileNavItems(products) {
    const items = [];

    // Add product links if multiple products
    if (products.length > 1) {
        items.push('<div style="padding: var(--spacing-sm) var(--spacing-lg); color: var(--secondary-text-color); font-size: 12px; font-weight: 600; text-transform: uppercase;">Products</div>');
        products.filter(p => p.showInDocs).forEach(product => {
            items.push(`
                <a href="/docs?product=${product.id}"
                   class="docs-mobile-nav-item ${product.id === headerCurrentProduct ? 'active' : ''}"
                   data-product="${product.id}">
                    <i class="fas fa-cube"></i>
                    ${product.name}
                </a>
            `);
        });
        items.push('<div style="height: 1px; background: var(--border-color); margin: var(--spacing-sm) 0;"></div>');
    }

    // Add main navigation items
    items.push('<div style="padding: var(--spacing-sm) var(--spacing-lg); color: var(--secondary-text-color); font-size: 12px; font-weight: 600; text-transform: uppercase;">Navigation</div>');
    items.push(`
        <a href="/docs" class="docs-mobile-nav-item active">
            <i class="fas fa-book"></i>
            Documentation
        </a>
        <a href="/docs/editor" class="docs-mobile-nav-item">
            <i class="fas fa-edit"></i>
            Editor
        </a>
        <a href="/docs/settings" class="docs-mobile-nav-item">
            <i class="fas fa-cog"></i>
            Settings
        </a>
    `);

    return items.join('');
}

/**
 * Attach event listeners to header elements
 */
function attachHeaderEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('docs-header-mobile-menu');
    const mobileMenuOverlay = document.getElementById('docs-mobile-nav-overlay');
    const mobileMenu = document.getElementById('docs-mobile-nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenu.classList.contains('active');
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Product dropdown toggle
    const productBtn = document.getElementById('docs-header-product-btn');
    const productMenu = document.getElementById('docs-header-product-menu');

    if (productBtn && productMenu) {
        productBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = productMenu.classList.contains('active');
            if (isActive) {
                closeProductDropdown();
            } else {
                openProductDropdown();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!productBtn.contains(e.target) && !productMenu.contains(e.target)) {
                closeProductDropdown();
            }
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('docs-header-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

    // Search button
    const searchBtn = document.getElementById('docs-header-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            // Trigger existing search functionality
            const sidebarSearchBtn = document.getElementById('docs-search-btn');
            if (sidebarSearchBtn) {
                sidebarSearchBtn.click();
            }
        });
    }

    // Close mobile menu when clicking on a link
    const mobileNavItems = document.querySelectorAll('.docs-mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
    const overlay = document.getElementById('docs-mobile-nav-overlay');
    const menu = document.getElementById('docs-mobile-nav-menu');

    if (overlay && menu) {
        overlay.classList.add('active');
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const overlay = document.getElementById('docs-mobile-nav-overlay');
    const menu = document.getElementById('docs-mobile-nav-menu');

    if (overlay && menu) {
        overlay.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Open product dropdown
 */
function openProductDropdown() {
    const btn = document.getElementById('docs-header-product-btn');
    const menu = document.getElementById('docs-header-product-menu');

    if (btn && menu) {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        menu.classList.add('active');
    }
}

/**
 * Close product dropdown
 */
function closeProductDropdown() {
    const btn = document.getElementById('docs-header-product-btn');
    const menu = document.getElementById('docs-header-product-menu');

    if (btn && menu) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
    }
}

/**
 * Toggle theme
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

/**
 * Update theme icon
 */
function updateThemeIcon() {
    const themeToggle = document.getElementById('docs-header-theme-toggle');
    if (!themeToggle) return;

    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const icon = themeToggle.querySelector('i');

    if (icon) {
        if (currentTheme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }
}

/**
 * Update active tab based on current page
 */
function updateActiveTab() {
    const currentPath = window.location.pathname;
    const tabs = document.querySelectorAll('.docs-nav-tab');

    tabs.forEach(tab => {
        tab.classList.remove('active');
        const href = tab.getAttribute('href');

        if (href === currentPath ||
            (href === '/docs' && currentPath.startsWith('/docs') && !currentPath.includes('/editor') && !currentPath.includes('/settings')) ||
            (href.includes('/editor') && currentPath.includes('/editor')) ||
            (href.includes('/settings') && currentPath.includes('/settings'))) {
            tab.classList.add('active');
        }
    });
}

/**
 * Handle header scroll effect
 */
function handleHeaderScroll() {
    const header = document.querySelector('.docs-header');
    if (!header) return;

    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

/**
 * Export for external use
 */
if (typeof window !== 'undefined') {
    window.DocsHeader = {
        init: initDocsHeader,
        updateActiveTab,
        closeMobileMenu
    };
}

// Do NOT auto-initialize - will be called manually from docs initialization
// This prevents conflicts with lazy-loading system
