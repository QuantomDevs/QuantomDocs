/**
 * Docs Header Module
 * Dynamically generates and manages the documentation header
 */

/**
 * Initialize the docs header
 */
async function initDocsHeader() {
    try {
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
 * Generate header HTML
 */
function generateHeaderHTML() {
    return `
        <div class="docs-header">
            <div class="docs-header-inner">
                <!-- Logo Section -->
                <a href="/main" class="logo-container">
                    <img src="/shared/images/favicon/favicon.png" alt="Quantom Logo" class="logo-img">
                    <span class="logo-text"><strong>Quantom</strong></span>
                </a>

                <!-- Navigation Section (Center) -->
                <nav class="docs-header-nav" aria-label="Main navigation">
                    <a href="#" class="docs-nav-link" id="product-nav-btn">
                        Product
                        <svg class="nav-dropdown-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                            <path d="M490.24 644.848a40 40 0 0 0 54.476 0.128l0.856-0.816 224.016-220-56.056-57.08-196.676 193.156-207.456-193.84-54.62 58.452 235.456 220z"></path>
                        </svg>
                    </a>
                    <a href="/pricing" class="docs-nav-link">Pricing</a>
                    <a href="/docs" class="docs-nav-link">Docs</a>
                </nav>

                <!-- Actions Section (Right) -->
                <div class="docs-header-actions">
                    <!-- Theme Toggle (Desktop) -->
                    <button id="docs-header-theme-toggle" class="docs-header-theme-toggle" title="Toggle dark/light mode" aria-label="Toggle theme">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z" fill="currentColor"/>
                        </svg>
                    </button>

                    <!-- Download Button -->
                    <a href="/download" class="header-btn header-btn-primary">
                        <span class="btn-content">Download</span>
                    </a>

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
            <!-- Sidebar content will be loaded here dynamically -->
        </div>
    `;
}


/**
 * Load sidebar content into mobile menu (lazy loading)
 */
function loadSidebarContentToMobile() {
    const mobileMenu = document.getElementById('docs-mobile-nav-menu');
    const sidebarLeft = document.querySelector('.sidebar-left');

    if (mobileMenu && sidebarLeft) {
        // Check if already loaded
        if (mobileMenu.hasAttribute('data-loaded')) {
            return;
        }

        // Clone sidebar content
        const sidebarContent = sidebarLeft.cloneNode(true);

        // Hide search button in mobile sidebar
        const searchBtn = sidebarContent.querySelector('.docs-search-button-sidebar');
        if (searchBtn) {
            searchBtn.style.display = 'none';
        }

        // Remove sidebar-left class to avoid CSS conflicts
        sidebarContent.classList.remove('sidebar-left');
        sidebarContent.classList.add('mobile-sidebar-content');

        // Fix duplicate IDs by prefixing with 'mobile-'
        const elementsWithIds = sidebarContent.querySelectorAll('[id]');
        elementsWithIds.forEach(element => {
            const oldId = element.id;
            element.id = 'mobile-' + oldId;

            // Update any aria-controls or other references
            const ariaControls = element.getAttribute('aria-controls');
            if (ariaControls) {
                element.setAttribute('aria-controls', 'mobile-' + ariaControls);
            }
        });

        // Clear and insert content
        mobileMenu.innerHTML = '';
        mobileMenu.appendChild(sidebarContent);
        mobileMenu.setAttribute('data-loaded', 'true');

        // Re-bind event listeners for mobile sidebar
        bindMobileSidebarEvents();
    }
}

/**
 * Bind event listeners for mobile sidebar elements
 */
function bindMobileSidebarEvents() {
    // Super Category Selector
    const mobileSuperCategoryBtn = document.getElementById('mobile-super-category-btn');
    const mobileSuperCategoryDropdown = document.getElementById('mobile-super-category-dropdown');

    if (mobileSuperCategoryBtn && mobileSuperCategoryDropdown) {
        mobileSuperCategoryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileSuperCategoryBtn.classList.toggle('open');
            mobileSuperCategoryDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileSuperCategoryBtn.contains(e.target) && !mobileSuperCategoryDropdown.contains(e.target)) {
                mobileSuperCategoryBtn.classList.remove('open');
                mobileSuperCategoryDropdown.classList.remove('show');
            }
        });

        // Handle super category option clicks
        const mobileOptions = mobileSuperCategoryDropdown.querySelectorAll('.super-category-option');
        mobileOptions.forEach(option => {
            option.addEventListener('click', () => {
                const superCategoryId = option.getAttribute('data-super-category-id');
                const superCategoryName = option.textContent.trim();

                // Update button text
                const nameSpan = mobileSuperCategoryBtn.querySelector('.super-category-name');
                if (nameSpan) {
                    nameSpan.textContent = superCategoryName;
                }

                // Close dropdown
                mobileSuperCategoryBtn.classList.remove('open');
                mobileSuperCategoryDropdown.classList.remove('show');

                // Trigger the same functionality as desktop version
                if (window.handleSuperCategoryChange) {
                    window.handleSuperCategoryChange(superCategoryId, superCategoryName);
                }
            });
        });
    }

    // Product Selector (mobile)
    const mobileProductSelectorBtn = document.getElementById('mobile-product-selector-btn');
    const mobileProductSelectorDropdown = document.getElementById('mobile-product-selector-dropdown');

    if (mobileProductSelectorBtn && mobileProductSelectorDropdown) {
        mobileProductSelectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileProductSelectorBtn.classList.toggle('active');
            mobileProductSelectorDropdown.classList.toggle('active');
        });
    }
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
                // Load sidebar content before opening (lazy loading)
                loadSidebarContentToMobile();
                openMobileMenu();
            }
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Search icon (mobile)
    const searchIcon = document.getElementById('docs-header-search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            // Trigger existing search functionality
            const sidebarSearchBtn = document.getElementById('docs-search-btn');
            if (sidebarSearchBtn) {
                sidebarSearchBtn.click();
            }
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('docs-header-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
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

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocsHeader);
} else if (typeof window !== 'undefined') {
    // DOM is already ready
    initDocsHeader();
}
