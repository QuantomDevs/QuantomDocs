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
                <a href="/main" class="logo-container">
                <img src="/shared/images/favicon/favicon.png" alt="Quantom Logo" class="logo-img">
                <span class="logo-text"><strong>Quantom Docs</strong></span>
            </a>

                <!-- Navigation Tabs (Desktop) -->
                <nav class="docs-header-nav" aria-label="Main navigation">
                </nav>

                <!-- Actions Section -->
                <div class="docs-header-actions">
                    <!-- Search Button (Desktop) -->
                    <button class="docs-header-search-btn" id="docs-header-search-btn" aria-label="Search documentation">
                        <i class="fas fa-search"></i>
                        <span>Search...</span>
                        <span class="docs-header-search-shortcut">⌘K</span>
                    </button>


                    <button id="docs-header-theme-toggle" class="docs-header-theme-toggle" title="Toggle dark/light mode" aria-label="Toggle theme">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z" fill="currentColor"/>
                        </svg>
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
    const themeBtn = document.querySelector('#docs-header-theme-toggle');

    if (themeBtn) {
        if (currentTheme === 'dark') {
            // Moon icon for dark mode
            themeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z" fill="currentColor"/>
                </svg>
            `;
        } else {
            // Sun icon for light mode
            themeBtn.innerHTML = ` <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.11133V2.00022 M12.8711 3.12891L12.2427 3.75735 M14.8889 8H14 M12.8711 12.8711L12.2427 12.2427 M8 14.8889V14 M3.12891 12.8711L3.75735 12.2427 M1.11133 8H2.00022 M3.12891 3.12891L3.75735 3.75735 M8.00043 11.7782C10.0868 11.7782 11.7782 10.0868 11.7782 8.00043C11.7782 5.91402 10.0868 4.22266 8.00043 4.22266C5.91402 4.22266 4.22266 5.91402 4.22266 8.00043C4.22266 10.0868 5.91402 11.7782 8.00043 11.7782Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                `;
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
