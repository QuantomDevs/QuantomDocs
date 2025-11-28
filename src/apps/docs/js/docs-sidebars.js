/**
 * Docs Sidebars Module
 * Manages both left and right sidebars functionality
 * @module DocsSidebars
 */

// Constants
const STORAGE_KEYS = {
    SIDEBAR_COLLAPSED: 'sidebarCollapsed'
};

const BREAKPOINTS = {
    MOBILE: 1024,
    DESKTOP: 1025
};

const TIMING = {
    RESIZE_DEBOUNCE: 100,
    ANIMATION_DURATION: 300
};

const ERROR_MESSAGES = {
    INIT_FAILED: 'Failed to initialize docs sidebars',
    STORAGE_ACCESS: 'Failed to access localStorage',
    DOM_ACCESS: 'Failed to access DOM elements',
    EVENT_BINDING: 'Failed to bind event listeners'
};

// Logger utility
const Logger = {
    error(message, error) {
        console.error(`[DocsSidebars] ${message}:`, error);
    },

    warn(message) {
        console.warn(`[DocsSidebars] ${message}`);
    },

    info(message) {
        console.info(`[DocsSidebars] ${message}`);
    }
};

// Safe localStorage wrapper
const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? value : defaultValue;
        } catch (error) {
            Logger.error(ERROR_MESSAGES.STORAGE_ACCESS, error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            Logger.error(ERROR_MESSAGES.STORAGE_ACCESS, error);
            return false;
        }
    }
};

// State management with error handling
const SidebarState = {
    isCollapsed: false,
    isMobile: false,

    load() {
        try {
            this.isCollapsed = Storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
            this.isMobile = window.innerWidth <= BREAKPOINTS.MOBILE;
        } catch (error) {
            Logger.error('Failed to load sidebar state', error);
            this.isCollapsed = false;
            this.isMobile = false;
        }
    },

    save() {
        return Storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, this.isCollapsed.toString());
    },

    toggle() {
        this.isCollapsed = !this.isCollapsed;
        return this.save();
    }
};

// DOM Elements Cache
const DOMElements = {
    sidebarLeft: null,
    sidebarRight: null,
    sidebarCollapsedBox: null,
    collapseBtn: null,
    expandBtn: null,
    searchMiniBtn: null,
    docsSearchBtn: null,

    cache() {
        this.sidebarLeft = document.querySelector('.sidebar-left');
        this.sidebarRight = document.querySelector('.sidebar-right');
        this.sidebarCollapsedBox = document.querySelector('.sidebar-collapsed-box');
        this.collapseBtn = document.getElementById('sidebar-collapse-btn');
        this.expandBtn = document.getElementById('sidebar-expand-btn');
        this.searchMiniBtn = document.getElementById('sidebar-search-mini-btn');
        this.docsSearchBtn = document.getElementById('docs-search-btn');
    }
};

/**
 * Inject sidebar header controls (logo + collapse button)
 */
function injectSidebarHeaderControls() {
    const sidebarLeft = document.querySelector('.sidebar-left');
    if (!sidebarLeft || document.querySelector('.sidebar-header-controls')) {
        return;
    }

    const headerControlsHTML = `
        <div class="sidebar-header-controls">
            <a href="/main" class="sidebar-logo-container">
                <img src="/images/favicon/favicon.png" alt="Quantom Logo" class="sidebar-logo-img">
                <span class="sidebar-logo-text"><strong>Quantom Docs</strong></span>
            </a>
            <button id="sidebar-collapse-btn" class="sidebar-collapse-btn" title="Collapse sidebar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;

    sidebarLeft.insertAdjacentHTML('afterbegin', headerControlsHTML);
}

/**
 * Inject collapsed sidebar mini box
 */
function injectCollapsedSidebarBox() {
    if (document.querySelector('.sidebar-collapsed-box')) {
        return;
    }

    const collapsedBoxHTML = `
        <div class="sidebar-collapsed-box">
            <button id="sidebar-expand-btn" class="sidebar-mini-btn" title="Expand sidebar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <button id="sidebar-search-mini-btn" class="sidebar-mini-btn" title="Search">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', collapsedBoxHTML);
}

/**
 * Check if sidebar header controls should be shown
 */
function shouldShowHeaderControls(showHeader, isDesktop, isMobile) {
    return (!showHeader && isDesktop) || isMobile;
}

/**
 * Check if collapsed box should be injected
 */
function shouldInjectCollapsedBox(showHeader, isDesktop) {
    return !showHeader && isDesktop;
}

/**
 * Apply sidebar collapsed state
 */
function applySidebarState(isCollapsed) {
    if (!DOMElements.sidebarLeft || !DOMElements.sidebarCollapsedBox) {
        return;
    }

    if (isCollapsed) {
        DOMElements.sidebarLeft.classList.add('collapsed');
        DOMElements.sidebarCollapsedBox.classList.add('visible');
    } else {
        DOMElements.sidebarLeft.classList.remove('collapsed');
        DOMElements.sidebarCollapsedBox.classList.remove('visible');
    }
}

/**
 * Apply sidebar collapsed state without transition (for initial load)
 * Prevents flickering by disabling transitions temporarily
 */
function applySidebarStateWithoutTransition(isCollapsed) {
    if (!DOMElements.sidebarLeft) {
        return;
    }

    try {
        // Disable transitions temporarily
        const originalTransition = DOMElements.sidebarLeft.style.transition;
        DOMElements.sidebarLeft.style.transition = 'none';

        // Apply state
        if (isCollapsed) {
            DOMElements.sidebarLeft.classList.add('collapsed');
            if (DOMElements.sidebarCollapsedBox) {
                DOMElements.sidebarCollapsedBox.classList.add('visible');
            }
        } else {
            DOMElements.sidebarLeft.classList.remove('collapsed');
            if (DOMElements.sidebarCollapsedBox) {
                DOMElements.sidebarCollapsedBox.classList.remove('visible');
            }
        }

        // Force reflow to ensure the change is applied
        void DOMElements.sidebarLeft.offsetHeight;

        // Re-enable transitions after a short delay
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (DOMElements.sidebarLeft) {
                    DOMElements.sidebarLeft.style.transition = originalTransition;
                }
            }, 50);
        });
    } catch (error) {
        Logger.error('Failed to apply sidebar state without transition', error);
        // Fallback to regular state application
        applySidebarState(isCollapsed);
    }
}

/**
 * Collapse sidebar
 */
function collapseSidebar() {
    SidebarState.isCollapsed = true;
    SidebarState.save();
    applySidebarState(true);
}

/**
 * Expand sidebar
 */
function expandSidebar() {
    SidebarState.isCollapsed = false;
    SidebarState.save();
    applySidebarState(false);
}

/**
 * Setup event listeners for sidebar controls
 */
function setupEventListeners() {
    // Collapse button
    if (DOMElements.collapseBtn) {
        DOMElements.collapseBtn.addEventListener('click', collapseSidebar);
    }

    // Expand button
    if (DOMElements.expandBtn) {
        DOMElements.expandBtn.addEventListener('click', expandSidebar);
    }

    // Search from mini box
    if (DOMElements.searchMiniBtn && DOMElements.docsSearchBtn) {
        DOMElements.searchMiniBtn.addEventListener('click', () => {
            DOMElements.docsSearchBtn.click();
        });
    }
}

/**
 * Handle window resize events with performance optimization
 */
function handleResize() {
    let resizeTimer;
    let rafId;
    let isResizing = false;

    const performResize = () => {
        try {
            const isDesktopNow = window.innerWidth > BREAKPOINTS.MOBILE;
            const showHeader = window.docsHeaderConfig?.general?.showHeader !== false;

            // Update mobile state
            SidebarState.isMobile = !isDesktopNow;

            // Re-cache elements in case they were injected/removed
            DOMElements.cache();

            if (SidebarState.isMobile) {
                // On mobile: always expand sidebar and hide collapsed box
                if (DOMElements.sidebarLeft) {
                    DOMElements.sidebarLeft.classList.remove('collapsed');
                }
                if (DOMElements.sidebarCollapsedBox) {
                    DOMElements.sidebarCollapsedBox.classList.remove('visible');
                }
            } else if (!showHeader) {
                // On desktop with header disabled: restore saved state
                applySidebarState(SidebarState.isCollapsed);
            }

            isResizing = false;
        } catch (error) {
            Logger.error('Resize handler failed', error);
            isResizing = false;
        }
    };

    const onResize = () => {
        // Cancel any pending animation frame
        if (rafId) {
            cancelAnimationFrame(rafId);
        }

        // Clear existing timer
        clearTimeout(resizeTimer);

        // Use requestAnimationFrame for smooth updates
        if (!isResizing) {
            isResizing = true;
            rafId = requestAnimationFrame(() => {
                resizeTimer = setTimeout(performResize, TIMING.RESIZE_DEBOUNCE);
            });
        }
    };

    window.addEventListener('resize', onResize, { passive: true });
}

/**
 * Initialize left sidebar functionality
 */
function initLeftSidebar() {
    // Load state FIRST before any DOM manipulation
    SidebarState.load();

    // Get configuration
    const showHeader = window.docsHeaderConfig?.general?.showHeader !== false;
    const isDesktop = window.innerWidth > BREAKPOINTS.MOBILE;
    const isMobile = !isDesktop;

    // Update state
    SidebarState.isMobile = isMobile;

    // Inject header controls if needed
    if (shouldShowHeaderControls(showHeader, isDesktop, isMobile)) {
        injectSidebarHeaderControls();
    }

    // Inject collapsed box if needed
    if (shouldInjectCollapsedBox(showHeader, isDesktop)) {
        injectCollapsedSidebarBox();
    }

    // Cache DOM elements after injection
    DOMElements.cache();

    // Setup functionality only on desktop when header is disabled
    if (!showHeader && isDesktop) {
        // Apply saved state IMMEDIATELY without transition to prevent flickering
        applySidebarStateWithoutTransition(SidebarState.isCollapsed);

        // Setup event listeners
        setupEventListeners();
    }

    // Handle window resize
    handleResize();
}

/**
 * Initialize right sidebar functionality
 */
function initRightSidebar() {
    // Right sidebar functionality can be added here
    // Currently handled by other modules
}

/**
 * Initialize both sidebars
 */
function initDocsSidebars() {
    try {
        initLeftSidebar();
        initRightSidebar();
    } catch (error) {
        console.error('Failed to initialize docs sidebars:', error);
    }
}

/**
 * Export for external use
 */
if (typeof window !== 'undefined') {
    window.DocsSidebars = {
        init: initDocsSidebars,
        collapse: collapseSidebar,
        expand: expandSidebar,
        toggle: () => {
            SidebarState.toggle();
            applySidebarState(SidebarState.isCollapsed);
        }
    };
}
