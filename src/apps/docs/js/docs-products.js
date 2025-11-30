// Dynamic Multi-Product Documentation System
// Handles product overview, dynamic loading, and navigation
//
// UPDATED: Now uses server-side pre-rendered HTML instead of client-side markdown parsing
// The server endpoint /api/docs/:product/* returns pre-rendered HTML in the 'content' field

// Import component orchestrator for initializing interactive components
import { initializeComponentScripts } from './component-orchestrator.js';
// Import sidebar rendering functions
import { renderSidebarTree, loadMarkdownFileByPath, loadCategoryIndex } from './docs-nested-categories.js';

let currentProduct = null;
let currentCategory = null;
let currentMarkdown = null;
let currentFile = null;

// Initialize the documentation page
async function initDocsPage() {
    // Parse URL path: /docs or /docs/category/file or /terminus or /terminus/category/file
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);

    // First part of URL is the product name
    // Examples: /docs -> product: "docs"
    //           /docs/getting-started -> product: "docs", path: "getting-started"
    //           /terminus -> product: "terminus"
    //           /terminus/api/overview -> product: "terminus", path: "api/overview"

    if (pathParts.length === 0) {
        // Root path "/" - show error or redirect
        window.location.href = '/docs';
        return;
    }

    const productId = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    // Load product documentation
    currentProduct = productId;
    await loadProductDocs(productId, filePath || null);
}

// Load and display product overview grid
async function loadProductOverview() {
    try {
        // Hide docs content, show product grid
        hideDocsContainers();
        document.getElementById('product-overview').style.display = 'grid';

        // Fetch products from config
        const response = await fetch('config/docs-config.json');
        const config = await response.json();
        const products = config.products.filter(p => p.showInDocs);

        // Generate product cards
        const gridHTML = products.map(product => `
            <div class="product-card" onclick="selectProduct('${product.id}')">
                <div class="product-icon">${product.icon}</div>
                <h2 class="product-name">${product.name}</h2>
                <p class="product-description">${product.description}</p>
                <button class="view-docs-btn">View Documentation →</button>
            </div>
        `).join('');

        document.getElementById('product-overview').innerHTML = gridHTML;
    } catch (error) {
        console.error('Error loading product overview:', error);
        document.getElementById('product-overview').innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

// Hide docs containers when showing product overview
function hideDocsContainers() {
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    const mainContent = document.querySelector('.main-content');

    if (sidebarLeft) sidebarLeft.style.display = 'none';
    if (sidebarRight) sidebarRight.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
}

// Show docs containers when loading product
function showDocsContainers() {
    const productOverview = document.getElementById('product-overview');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    const mainContent = document.querySelector('.main-content');

    if (productOverview) productOverview.style.display = 'none';

    // Show sidebars and main content
    // On mobile, sidebar should be hidden initially (transform handles visibility)
    if (sidebarLeft) {
        sidebarLeft.style.display = 'block';
        // On mobile, ensure it starts hidden (transform will be applied by CSS)
        if (window.innerWidth <= 1024) {
            sidebarLeft.classList.remove('active');
        }
    }
    if (sidebarRight) sidebarRight.style.display = 'block';
    if (mainContent) mainContent.style.display = 'block';
}

// Select a product and load its documentation
function selectProduct(productId) {
    // Update URL to path-based format: /docs/quantom
    const newUrl = `/docs/${productId}`;
    window.history.pushState({ product: productId }, '', newUrl);

    // Load product docs
    currentProduct = productId;
    loadProductDocs(productId);
}

// Load product documentation
async function loadProductDocs(productId, specificFilePath = null) {
    try {
        // Show docs containers
        showDocsContainers();

        // Store current product
        currentProduct = productId;

        // Load tree structure for this product
        const response = await fetch(`/api/docs/${productId}/tree`);
        if (!response.ok) {
            throw new Error(`Failed to load product tree: ${response.status}`);
        }

        const data = await response.json();

        // Render sidebar with tree structure
        if (typeof renderSidebarTree === 'function') {
            renderSidebarTree(data.tree, productId);
        } else {
            console.error('renderSidebarTree function not found. Make sure docs-nested-categories.js is loaded.');
        }

        // Load the specified file if provided
        if (specificFilePath) {
            if (typeof loadMarkdownFileByPath === 'function') {
                await loadMarkdownFileByPath(productId, specificFilePath);
            }
        } else {
            // Load first available file from tree
            loadFirstAvailableFile(data.tree, productId);
        }
    } catch (error) {
        console.error('Error loading product docs:', error);
        document.querySelector('.main-content').innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">
                <h2>Failed to load documentation</h2>
                <p>Product "${productId}" could not be found.</p>
                <button onclick="window.location.href='/docs'" style="margin-top: 20px; padding: 10px 20px; background: var(--accent-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Back to Products
                </button>
            </div>
        `;
    }
}

// Load first available file in the tree
function loadFirstAvailableFile(tree, productId, parentPath = []) {
    for (const item of tree) {
        if (item.type === 'file') {
            // Build full path including parent categories
            const fullPath = [...parentPath, item.urlSlug].join('/');
            if (typeof loadMarkdownFileByPath === 'function') {
                loadMarkdownFileByPath(productId, fullPath);
            }
            return true;
        } else if (item.type === 'category') {
            // Build current path
            const currentPath = [...parentPath, item.urlSlug];

            // Check if category has index
            if (item.hasIndex) {
                const categoryPath = currentPath.join('/');
                if (typeof loadCategoryIndex === 'function') {
                    loadCategoryIndex(productId, categoryPath);
                }
                return true;
            }
            // Recurse into children
            if (item.children && item.children.length > 0) {
                const found = loadFirstAvailableFile(item.children, productId, currentPath);
                if (found) return true;
            }
        }
    }
    return false;
}

// Build the left sidebar navigation from categories
function buildSidebar(categories, productId, superCategory) {
    const sidebar = document.querySelector('.sidebar-left');

    // Build search button HTML
    const searchButtonHTML = `
        <button id="docs-search-btn" class="docs-search-button-sidebar" title="Search documentation (⌘K)" style="display: flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Search</span>
            <span class="search-shortcut">⌘K</span>
        </button>
    `;

    // Clear sidebar and add elements
    // Note: This function is deprecated and uses old structure
    // Super-category selector is now handled by docs-nested-categories.js
    sidebar.innerHTML = searchButtonHTML;

    categories.forEach(category => {
        const categoryBlock = document.createElement('div');
        categoryBlock.className = 'nav-block';


        const fileList = document.createElement('ul');
        category.files.forEach(file => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = file.replace(/-/g, ' ');
            a.setAttribute('data-file-path', `${productId}/${superCategory}/${category.id}/${file}`);
            a.onclick = (e) => {
                e.preventDefault();

                // Remove active class from all links
                sidebar.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                // Add active class to clicked link
                a.classList.add('active');

                // Update URL with clean path
                const pathParts = [productId, superCategory, category.id, file];
                const cleanPath = pathParts.map(part =>
                    part.split('-').map(word => word.toLowerCase()).join('-')
                ).join('/');
                const newUrl = `/docs/${cleanPath}`;
                window.history.pushState({ product: productId, superCategory, category: category.id, file }, '', newUrl);

                loadMarkdownFile(`${productId}/${superCategory}/${category.id}/${file}`);
            };
            li.appendChild(a);
            fileList.appendChild(li);
        });

        categoryBlock.appendChild(fileList);
        sidebar.appendChild(categoryBlock);
    });
}

// Load super-categories for a product
// NOTE: This function is deprecated - new code uses renderSidebarTree from docs-nested-categories.js
async function loadSuperCategories(productId) {
    try {
        const response = await fetch(`/api/docs/${productId}/super-categories`);
        const data = await response.json();
        const availableSuperCategories = data.superCategories;

        // Get selector element
        const selector = document.getElementById('super-category-selector');

        // Hide selector if only one super-category
        if (availableSuperCategories.length <= 1) {
            if (selector) selector.style.display = 'none';
            const selectedSuperCategory = availableSuperCategories[0]?.fullName || null;

            // Load categories for the single super-category
            if (selectedSuperCategory) {
                await loadCategoriesForSuperCategory(productId, selectedSuperCategory);
            }
            return;
        }

        if (selector) selector.style.display = 'block';

        // Set default to first super-category (order 01)
        const selectedSuperCategory = availableSuperCategories[0].fullName;

        renderSuperCategorySelector();
        await loadCategoriesForSuperCategory(productId, selectedSuperCategory);
    } catch (error) {
        console.error('Failed to load super-categories:', error);
    }
}

// Render super-category selector dropdown
// NOTE: This function is deprecated - new code uses initializeSuperCategorySelector from docs-nested-categories.js
function renderSuperCategorySelector() {
    // Deprecated function - no longer used with new tree system
    return; 
}

// Toggle super-category dropdown
function toggleSuperCategoryDropdown(show) {
    const btn = document.getElementById('super-category-btn');
    const dropdown = document.getElementById('super-category-dropdown');

    if (!btn || !dropdown) return;

    if (show === undefined) {
        show = !dropdown.classList.contains('show');
    }

    if (show) {
        dropdown.classList.add('show');
        btn.classList.add('open');
    } else {
        dropdown.classList.remove('show');
        btn.classList.remove('open');
    }
}

// Initialize super-category selector event listeners
function initSuperCategorySelectorEvents() {
    const btn = document.getElementById('super-category-btn');

    if (!btn) return;

    // Remove existing listeners by cloning and replacing
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    // Button click handler
    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSuperCategoryDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const selector = document.getElementById('super-category-selector');
        if (selector && !selector.contains(e.target)) {
            toggleSuperCategoryDropdown(false);
        }
    });
}

// Load categories for a super-category
async function loadCategoriesForSuperCategory(productId, superCategory) {
    try {
        const response = await fetch(`/api/docs/${productId}/${superCategory}/categories`);
        const data = await response.json();

        // Update sidebar with categories
        buildSidebar(data.categories, productId, superCategory);

        // Note: Super-category selector is now handled by docs-nested-categories.js
        // Reinitialize super-category selector events after sidebar rebuild
        initSuperCategorySelectorEvents();

        // Load first file if no file is currently loaded
        if (!currentFile && data.categories.length > 0 && data.categories[0].files.length > 0) {
            const firstCategory = data.categories[0];
            const firstFile = firstCategory.files[0];
            const filePath = `${productId}/${superCategory}/${firstCategory.id}/${firstFile}`;
            loadMarkdownFile(filePath);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Load and display markdown file
async function loadMarkdownFile(filePath) {
    const dynamicContent = document.getElementById('dynamic-content-area');

    try {
        // Show loading skeleton
        showLoadingSkeleton();

        // Parse filePath: productId/superCategory/categoryId/fileName
        const pathParts = filePath.split('/');
        if (pathParts.length < 4) {
            throw new Error(`Invalid file path format: ${filePath}`);
        }

        const productId = pathParts[0];
        const superCategory = pathParts[1];
        const categoryId = pathParts[2];
        const fileName = pathParts[3];

        // Use the new API endpoint
        const apiUrl = `/api/docs/${productId}/${superCategory}/${categoryId}/${fileName}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to load: ${filePath}`);
        }

        // Parse JSON response
        const data = await response.json();

        // Response now includes pre-rendered HTML from the server:
        // - content: pre-rendered HTML (ready to inject)
        // - rawContent: raw markdown (for editing)
        // - fileType: 'md' or 'mdx'
        // - metadata.lastModified: timestamp
        // - metadata.size: file size

        // Use pre-rendered HTML directly from server
        const html = data.content;
        const fileType = data.fileType || 'md';  // Default to markdown if not specified

        // Client-side markdown parsing is now disabled - server provides pre-rendered HTML
        // Legacy code (commented out):
        // if (fileType === 'mdx' && typeof parseMDX === 'function') {
        //     html = parseMDX(content, MDX_COMPONENTS);
        // } else {
        //     html = marked.parse(content);
        // }

        // Hide static getting started content
        const staticContent = document.getElementById('static-getting-started');
        if (staticContent) {
            staticContent.style.display = 'none';
        }

        // Inject pre-rendered HTML directly
        dynamicContent.innerHTML = html;
        dynamicContent.style.display = 'block';

        // Initialize interactive components (Tabs, Accordions, CodeGroups, etc.)
        // This must be called AFTER innerHTML is set
        initializeComponentScripts();

        // Update page header controls (category + split button)
        updatePageHeaderControls(filePath);

        // Update right sidebar (table of contents)
        updateTableOfContents(dynamicContent);

        // Trigger event for docs.js to add copy button listeners
        const event = new CustomEvent('markdownLoaded');
        document.dispatchEvent(event);

        // Scroll to top
        window.scrollTo(0, 0);

        // Store current file path
        currentFile = filePath;

        // Analytics tracking removed (Task 1.10.6)

    } catch (error) {
        console.error('Error loading markdown file:', error);
        dynamicContent.innerHTML = `
            <div style="padding: 40px; color: var(--secondary-text-color);">
                <h2>Failed to load content</h2>
                <p>The requested file could not be loaded.</p>
            </div>
        `;
        dynamicContent.style.display = 'block';
    }
}

// Analytics tracking function removed (Task 1.10.6)

// Show loading skeleton while content is being fetched
function showLoadingSkeleton() {
    const dynamicContent = document.getElementById('dynamic-content-area');
    const staticContent = document.getElementById('static-getting-started');

    if (staticContent) {
        staticContent.style.display = 'none';
    }

    dynamicContent.innerHTML = `
        <div class="content-loading">
            <div class="loading-skeleton skeleton-title"></div>
            <div class="loading-skeleton skeleton-paragraph"></div>
            <div class="loading-skeleton skeleton-paragraph"></div>
            <div class="loading-skeleton skeleton-paragraph"></div>
            <div class="loading-skeleton skeleton-paragraph"></div>
            <div class="loading-skeleton skeleton-paragraph"></div>
        </div>
    `;
    dynamicContent.style.display = 'block';
}

// Format category name for display
function formatCategoryName(folderName) {
    return folderName
        .replace(/-/g, ' ')
        .replace('.md','')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format file name for display
function formatFileName(fileName) {
    return fileName
        .replace('.md', '')
        .replace(/-/g, ' ');
}

// Update table of contents in right sidebar
async function updateTableOfContents(contentElement) {
    // Load config to check sidebar settings
    let config = null;
    try {
        const response = await fetch('/docs/config/docs-config.json');
        config = await response.json();
    } catch (error) {
        console.error('Failed to load config for sidebar settings:', error);
        // Use defaults if config fails
        config = {
            general: {
                sidebarRightHeaders: {
                    mainSectionHeader: true,
                    subSectionHeader: true,
                    subSubSectionHeader: false
                },
                rightSidebarSectionGap: true
            }
        };
    }

    const settings = config.general || {};
    const headerSettings = settings.sidebarRightHeaders || {
        mainSectionHeader: true,
        subSectionHeader: true,
        subSubSectionHeader: false
    };
    const useGap = settings.rightSidebarSectionGap !== false;

    // Select headings based on settings
    let selector = '';
    const selectors = [];
    if (headerSettings.mainSectionHeader) selectors.push('h1');
    if (headerSettings.subSectionHeader) selectors.push('h2');
    if (headerSettings.subSubSectionHeader) selectors.push('h3');

    if (selectors.length === 0) {
        // If no headings selected, show all by default
        selectors.push('h1', 'h2', 'h3');
    }

    selector = selectors.join(', ');
    const headings = contentElement.querySelectorAll(selector);
    const sidebarRight = document.querySelector('.sidebar-right ul');
    const mobileRightSidebar = document.querySelector('.mobile-right-sidebar-content');

    if (!sidebarRight) return;

    sidebarRight.innerHTML = '';
    if (mobileRightSidebar) {
        mobileRightSidebar.innerHTML = '';
    }

    headings.forEach((heading, index) => {
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName.toLowerCase();
        a.dataset.headingId = heading.id;

        // Add gap class if needed (h2 and h3 get indented)
        if (useGap && (heading.tagName === 'H2' || heading.tagName === 'H3')) {
            a.classList.add('indented');
        }

        // Smooth scroll on click
        a.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Update URL hash without jumping
            history.pushState(null, null, `#${heading.id}`);

            // Update active state
            updateActiveHeading(heading.id);
        });

        li.appendChild(a);
        sidebarRight.appendChild(li);

        // Also add to mobile sidebar
        if (mobileRightSidebar) {
            const mobileLi = li.cloneNode(true);
            // Re-add event listener to cloned element
            mobileLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, null, `#${heading.id}`);
                updateActiveHeading(heading.id);

                // Close mobile sidebar
                const mobileSidebar = document.getElementById('mobile-right-sidebar-menu');
                if (mobileSidebar) {
                    mobileSidebar.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                }
            });
            mobileRightSidebar.appendChild(mobileLi);
        }
    });

    // Initialize scroll spy
    initScrollSpy(headings);
}

// Initialize scroll spy to track visible headings
function initScrollSpy(headings) {
    // Remove existing observer if any
    if (window.headingObserver) {
        window.headingObserver.disconnect();
    }

    // Set to track currently visible headings
    if (!window.visibleHeadings) {
        window.visibleHeadings = new Set();
    } else {
        window.visibleHeadings.clear();
    }

    // Intersection Observer options
    // Adjusted to detect when headings are actually visible in viewport
    const observerOptions = {
        rootMargin: '-80px 0px -20% 0px', // More flexible detection zone
        threshold: [0, 0.25, 0.5, 0.75, 1.0] // Multiple thresholds for better detection
    };

    // Create observer
    window.headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add to visible headings set
                window.visibleHeadings.add(entry.target.id);
            } else {
                // Remove from visible headings set
                window.visibleHeadings.delete(entry.target.id);
            }
        });

        // Update active state for all visible headings
        updateActiveHeadings();
    }, observerOptions);

    // Observe all headings
    headings.forEach(heading => {
        window.headingObserver.observe(heading);
    });
}

// Update active headings in table of contents (supports multiple active headings)
function updateActiveHeadings() {
    // Remove active class from all TOC links
    const allLinks = document.querySelectorAll('.sidebar-right a, .mobile-right-sidebar-content a');
    allLinks.forEach(link => link.classList.remove('active'));

    // Add active class to all currently visible headings
    if (window.visibleHeadings && window.visibleHeadings.size > 0) {
        window.visibleHeadings.forEach(headingId => {
            const activeLinks = document.querySelectorAll(`a[data-heading-id="${headingId}"]`);
            activeLinks.forEach(link => link.classList.add('active'));
        });
    }
}

// Legacy function - now calls the new multi-active version
function updateActiveHeading(headingId) {
    // For backward compatibility, update the set and call updateActiveHeadings
    if (!window.visibleHeadings) {
        window.visibleHeadings = new Set();
    }
    window.visibleHeadings.clear();
    window.visibleHeadings.add(headingId);
    updateActiveHeadings();
}

// Set active sidebar link for the currently loaded file
function setActiveSidebarLink(filePath) {
    const sidebar = document.querySelector('.sidebar-left');
    if (!sidebar) return;

    // Remove active class from all links
    sidebar.querySelectorAll('a').forEach(link => link.classList.remove('active'));

    // Find and activate the link matching the current file path
    const activeLink = sidebar.querySelector(`a[data-file-path="${filePath}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Update page header controls (category display + split button)
function updatePageHeaderControls(filePath) {
    const pageHeaderControls = document.getElementById('page-header-controls');
    const categoryNameElement = document.getElementById('current-category-name');
    const markdownNameElement = document.getElementById('current-markdown-name');

    if (!pageHeaderControls || !categoryNameElement) return;

    try {
        // Parse file path: productId/super-category/category/.../fileName
        // With new tree system, path can have multiple levels
        const pathParts = filePath.split('/').filter(p => p);

        if (pathParts.length < 2) {
            // Not enough path parts
            pageHeaderControls.style.display = 'none';
            return;
        }

        // Last part is the file name, second-to-last is the immediate category
        const markdownName = pathParts[pathParts.length - 1];
        const categoryName = pathParts[pathParts.length - 2];

        // Format names for display
        const categoryDisplayName = categoryName ? formatCategoryName(categoryName) : '';
        const markdownDisplayName = markdownName ? formatCategoryName(markdownName) : '';

        // Update category name
        categoryNameElement.textContent = categoryDisplayName;
        markdownNameElement.textContent = markdownDisplayName;

        // Store current category
        currentCategory = categoryDisplayName;
        currentMarkdown = markdownDisplayName;

        // Show page header controls
        pageHeaderControls.style.display = 'flex';
    } catch (error) {
        console.error('Error updating page header controls:', error);
        pageHeaderControls.style.display = 'none';
    }
}

// Note: addCopyButtonListeners is defined in docs.js and will be called from there

// Mobile Product Selector Functions
async function initMobileProductSelector() {
    const selectorContainer = document.getElementById('mobile-product-selector');
    const selectorButton = document.getElementById('product-selector-btn');
    const selectorDropdown = document.getElementById('product-selector-dropdown');
    const currentProductName = document.getElementById('current-product-name');

    if (!selectorContainer || !selectorButton || !selectorDropdown) {
        return;
    }

    try {
        // Load products from config
        const response = await fetch('/docs/config/docs-config.json');
        const config = await response.json();
        const products = config.products.filter(p => p.showInDocs);

        if (products.length <= 1) {
            // Hide selector if only one product or no products
            selectorContainer.style.display = 'none';
            return;
        }

        // Populate dropdown
        selectorDropdown.innerHTML = products.map(product => `
            <div class="product-selector-item" data-product-id="${product.id}">
                <span class="product-icon">${product.icon || '📦'}</span>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description || ''}</div>
                </div>
            </div>
        `).join('');

        // Update current product name
        if (currentProduct) {
            const product = products.find(p => p.id === currentProduct);
            if (product) {
                currentProductName.textContent = product.name;
            }
        }

        // Toggle dropdown
        selectorButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = selectorDropdown.classList.toggle('active');
            selectorButton.classList.toggle('active', isActive);
        });

        // Handle product selection
        selectorDropdown.querySelectorAll('.product-selector-item').forEach(item => {
            item.addEventListener('click', async () => {
                const productId = item.dataset.productId;
                const product = products.find(p => p.id === productId);

                if (product) {
                    // Close dropdown
                    selectorDropdown.classList.remove('active');
                    selectorButton.classList.remove('active');

                    // Update current product name
                    currentProductName.textContent = product.name;

                    // Load product documentation
                    if (product.firstSide) {
                        await loadProductDocs(productId, product.firstSide);
                    } else {
                        await loadProductDocs(productId);
                    }

                    // Close mobile sidebar
                    const sidebar = document.querySelector('.sidebar-left');
                    const overlay = document.getElementById('mobile-sidebar-overlay');
                    if (sidebar) {
                        sidebar.classList.remove('active');
                        document.body.classList.remove('no-scroll');
                    }
                    if (overlay) {
                        overlay.classList.remove('active');
                    }
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!selectorContainer.contains(e.target)) {
                selectorDropdown.classList.remove('active');
                selectorButton.classList.remove('active');
            }
        });

    } catch (error) {
        console.error('Failed to initialize mobile product selector:', error);
        selectorContainer.style.display = 'none';
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    // Re-initialize based on current URL path
    initDocsPage();
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await initDocsPage();
    // Initialize mobile product selector after docs page loads
    await initMobileProductSelector();
});

// Export functions for use by other modules and global scope
export {
    initDocsPage,
    loadProductDocs,
    loadProductOverview,
    selectProduct
};

// Also expose to window for backward compatibility with inline scripts
window.initDocsPage = initDocsPage;
window.loadProductDocs = loadProductDocs;
window.selectProduct = selectProduct;