/**
 * Legal Page - Dynamic Content Loader
 * Handles routing and markdown loading for legal pages
 */

// Available legal pages
const LEGAL_PAGES = {
    'terms-of-service': {
        file: '/shared/legal-content/terms-of-service.md',
        title: 'Terms of Service'
    },
    'privacy-policy': {
        file: '/shared/legal-content/privacy-policy.md',
        title: 'Privacy Policy'
    },
    'impressum': {
        file: '/shared/legal-content/impressum.md',
        title: 'Impressum'
    }
};

// DOM Elements
let contentSection;
let navLinks;

/**
 * Initialize the legal page
 */
function initLegalPage() {
    // Get DOM elements
    contentSection = document.getElementById('legal-content');
    navLinks = document.querySelectorAll('.legal-nav-link');

    // Set up navigation link event listeners
    setupNavigation();

    // Handle initial page load based on URL
    handleRouting();

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handleRouting);
}

/**
 * Set up navigation link click handlers
 */
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            const url = `/legal/${page}`;

            // Update URL without reload
            history.pushState({ page }, '', url);

            // Load the page
            loadPage(page);
        });
    });
}

/**
 * Handle routing based on current URL
 */
function handleRouting() {
    const path = window.location.pathname;

    // Check if we're on a specific legal page
    if (path.startsWith('/legal/')) {
        const pageName = path.replace('/legal/', '').replace(/\/$/, '');

        if (pageName && LEGAL_PAGES[pageName]) {
            loadPage(pageName);
        } else if (pageName === '') {
            // Just /legal/ - load first document (terms-of-service)
            history.replaceState({ page: 'terms-of-service' }, '', '/legal/terms-of-service');
            loadPage('terms-of-service');
        } else {
            // Invalid page - redirect to first document
            console.warn(`Invalid legal page: ${pageName}`);
            history.replaceState({ page: 'terms-of-service' }, '', '/legal/terms-of-service');
            loadPage('terms-of-service');
        }
    } else {
        // Default to first document
        history.replaceState({ page: 'terms-of-service' }, '', '/legal/terms-of-service');
        loadPage('terms-of-service');
    }
}

/**
 * Load and display a legal page
 * @param {string} pageName - Name of the page to load
 */
async function loadPage(pageName) {
    if (!LEGAL_PAGES[pageName]) {
        console.error(`Legal page not found: ${pageName}`);
        // Load first document as fallback
        loadPage('terms-of-service');
        return;
    }

    const pageInfo = LEGAL_PAGES[pageName];

    try {
        // Show loading state
        contentSection.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--text-secondary);"></i></div>';
        contentSection.style.display = 'block';

        // Fetch markdown file
        const response = await fetch(pageInfo.file);

        if (!response.ok) {
            throw new Error(`Failed to load ${pageInfo.title}: ${response.status}`);
        }

        const markdownText = await response.text();

        // Configure marked.js options
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        // Parse markdown to HTML
        const htmlContent = marked.parse(markdownText);

        // Display content
        contentSection.innerHTML = htmlContent;
        contentSection.style.display = 'block';

        // Update active navigation
        updateActiveNav(pageName);

        // Update page title
        document.title = `${pageInfo.title} - Quantom`;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error loading legal page:', error);
        contentSection.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h2 style="color: var(--text-primary);">Error Loading Page</h2>
                <p style="color: var(--text-secondary);">Sorry, we couldn't load this page. Please try again later.</p>
                <a href="/legal/" style="color: var(--accent-color); text-decoration: none; font-weight: 600;">
                    <i class="fas fa-arrow-left"></i> Back to Legal Home
                </a>
            </div>
        `;
    }
}

/**
 * Update active navigation item
 * @param {string} pageName - Name of the active page
 */
function updateActiveNav(pageName) {
    clearActiveNav();

    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
}

/**
 * Clear all active navigation states
 */
function clearActiveNav() {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initLegalPage();
});

/**
 * Export functions for external use if needed
 */
if (typeof window !== 'undefined') {
    window.legalPage = {
        loadPage,
        handleRouting
    };
}
