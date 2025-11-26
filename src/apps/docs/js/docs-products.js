// Dynamic Multi-Product Documentation System
// Handles product overview, dynamic loading, and navigation with nested categories

let currentProduct = null;
let currentCategory = null;
let currentMarkdown = null;
let currentFile = null;
let currentProductTree = null;

// Initialize the documentation page
async function initDocsPage() {
    // Load config first
    let config = null;
    try {
        const response = await fetch('/docs/config/docs-config.json');
        config = await response.json();
    } catch (error) {
        console.error('Failed to load docs config:', error);
        return;
    }

    // Parse URL path: /docs or /docs/quantom/getting-started/installation
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);

    // Remove 'docs' from the beginning
    if (pathParts[0] === 'docs') {
        pathParts.shift();
    }

    if (pathParts.length === 0) {
        // Just "/docs" - check if default is enabled
        const general = config.general || {};
        if (general.default === true && general.defaultProduct) {
            // Load default product
            const defaultProduct = general.defaultProduct;
            const product = config.products.find(p => p.id === defaultProduct);

            if (product && product.firstSide) {
                // Load the firstSide file
                currentProduct = defaultProduct;
                await loadProductDocs(defaultProduct, product.firstSide);
            } else {
                // Fallback to product overview
                await loadProductOverview();
            }
        } else {
            // Show product overview
            await loadProductOverview();
        }
    } else {
        // Product selected: /docs/{product}/... or /docs/{product}/{path...}
        const selectedProduct = pathParts[0];

        // Build file path from URL slugs
        let selectedFilePath = null;
        if (pathParts.length > 1) {
            // Join the path segments after product
            selectedFilePath = pathParts.slice(1).join('/');
        }

        // Load specific product docs
        currentProduct = selectedProduct;
        await loadProductDocs(selectedProduct, selectedFilePath);
    }
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

        // Load recursive tree structure for this product
        await loadProductStructure(productId);

        // Load the specified file if provided
        if (specificFilePath) {
            await loadMarkdownFileByPath(specificFilePath);
        } else if (currentProductTree && currentProductTree.length > 0) {
            // Load first available file
            loadFirstAvailableFile(currentProductTree);
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

// Load product structure using tree endpoint
async function loadProductStructure(productId) {
    try {
        showLoadingSkeleton();

        // Fetch recursive tree instead of flat categories
        const response = await fetch(`/api/docs/${productId}/tree`);

        if (!response.ok) {
            throw new Error(`Failed to load product structure: ${response.status}`);
        }

        const data = await response.json();

        // Store tree globally for navigation
        currentProductTree = data.tree;

        // Render sidebar with tree
        renderSidebar(data.tree);

    } catch (error) {
        console.error('Error loading product structure:', error);
        throw error;
    }
}

// Render the sidebar with tree structure
function renderSidebar(tree) {
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

    // Clear sidebar and add search button
    sidebar.innerHTML = searchButtonHTML;

    // Render tree structure
    const treeHTML = renderSidebarTree(tree, 0, []);
    sidebar.innerHTML += treeHTML;

    // Initialize category toggle listeners
    initializeCategoryToggles();
}

// Recursively render sidebar tree
function renderSidebarTree(items, depth = 0, parentPath = []) {
    if (!items || items.length === 0) return '';

    let html = `<ul class="sidebar-tree" data-depth="${depth}">`;

    for (const item of items) {
        if (item.type === 'category') {
            html += renderCategory(item, depth, parentPath);
        } else if (item.type === 'file') {
            html += renderFile(item, depth, parentPath);
        }
    }

    html += '</ul>';
    return html;
}

// Render a category with potential children
function renderCategory(category, depth, parentPath) {
    const hasChildren = category.children && category.children.length > 0;
    const indent = depth * 16; // 16px per depth level
    const currentPath = [...parentPath, category.urlSlug];
    const categoryId = category.id.replace(/[^a-zA-Z0-9]/g, '-');

    // Check if this category should be expanded (from localStorage)
    const isExpanded = loadExpansionState(categoryId);

    let html = `
        <li class="sidebar-category ${isExpanded ? 'expanded' : ''}" data-category="${escapeHtml(categoryId)}" style="padding-left: ${indent}px;">
            <div class="category-header">
                ${hasChildren ?
                    `<i class="category-toggle fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>` :
                    '<i class="category-icon fas fa-folder"></i>'}
                <span class="category-name">${escapeHtml(category.name)}</span>
            </div>
    `;

    if (hasChildren) {
        // Add collapsible children container
        html += `<div class="category-children" style="display: ${isExpanded ? 'block' : 'none'};">`;
        html += renderSidebarTree(category.children, depth + 1, currentPath);
        html += `</div>`;
    }

    html += '</li>';

    return html;
}

// Render a file entry
function renderFile(file, depth, parentPath) {
    const indent = depth * 16;
    const filePath = [...parentPath, file.urlSlug].join('/');
    const fileUrl = `/docs/${currentProduct}/${filePath}`;

    return `
        <li class="sidebar-file" data-file="${escapeHtml(file.id)}" style="padding-left: ${indent}px;">
            <a href="${fileUrl}" class="file-link" data-path="${escapeHtml(filePath)}" onclick="return handleFileClick(event, '${escapeHtml(filePath)}')">
                <i class="file-icon fas fa-file-alt"></i>
                <span class="file-name">${escapeHtml(file.name)}</span>
            </a>
        </li>
    `;
}

// Handle file link clicks
window.handleFileClick = function(event, filePath) {
    event.preventDefault();

    // Remove active class from all links
    document.querySelectorAll('.sidebar-left .file-link').forEach(link => link.classList.remove('active'));

    // Add active class to clicked link
    event.currentTarget.classList.add('active');

    // Load the markdown file
    loadMarkdownFileByPath(filePath);

    // Update URL
    const newUrl = `/docs/${currentProduct}/${filePath}`;
    window.history.pushState({ product: currentProduct, filePath }, '', newUrl);

    return false;
};

// Initialize category toggle functionality
function initializeCategoryToggles() {
    // Event delegation for category toggles
    const sidebar = document.querySelector('.sidebar-left');
    if (!sidebar) return;

    // Remove existing listeners by cloning
    const newSidebar = sidebar.cloneNode(true);
    sidebar.parentNode.replaceChild(newSidebar, sidebar);

    newSidebar.addEventListener('click', (e) => {
        const toggleIcon = e.target.closest('.category-toggle');
        if (!toggleIcon) return;

        const categoryHeader = toggleIcon.closest('.category-header');
        const categoryItem = categoryHeader.closest('.sidebar-category');
        const childrenContainer = categoryItem.querySelector('.category-children');

        if (!childrenContainer) return;

        // Toggle visibility
        const isExpanded = childrenContainer.style.display !== 'none';

        if (isExpanded) {
            // Collapse
            childrenContainer.style.display = 'none';
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-right');
            categoryItem.classList.remove('expanded');
        } else {
            // Expand
            childrenContainer.style.display = 'block';
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-down');
            categoryItem.classList.add('expanded');
        }

        // Store expansion state in localStorage
        saveExpansionState(categoryItem.dataset.category, !isExpanded);
    });
}

// Save category expansion state to localStorage
function saveExpansionState(categoryId, isExpanded) {
    const key = `category-expanded-${currentProduct}-${categoryId}`;
    localStorage.setItem(key, isExpanded ? 'true' : 'false');
}

// Load category expansion state from localStorage
function loadExpansionState(categoryId) {
    const key = `category-expanded-${currentProduct}-${categoryId}`;
    return localStorage.getItem(key) === 'true';
}

// Load first available file in the tree
function loadFirstAvailableFile(tree) {
    for (const item of tree) {
        if (item.type === 'file') {
            loadMarkdownFileByPath(item.urlSlug);
            return;
        } else if (item.type === 'category' && item.children && item.children.length > 0) {
            loadFirstAvailableFile(item.children);
            return;
        }
    }
}

// Load markdown file using URL slug path
async function loadMarkdownFileByPath(urlSlugPath) {
    const dynamicContent = document.getElementById('dynamic-content-area');

    try {
        // Show loading skeleton
        showLoadingSkeleton();

        // Use the wildcard endpoint with URL slugs
        const apiUrl = `/api/docs/${currentProduct}/${urlSlugPath}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to load: ${urlSlugPath}`);
        }

        // Parse JSON response
        const data = await response.json();
        const markdown = data.content;
        const html = marked.parse(markdown);

        // Hide static getting started content
        const staticContent = document.getElementById('static-getting-started');
        if (staticContent) {
            staticContent.style.display = 'none';
        }

        // Show dynamic content area with loaded content
        dynamicContent.innerHTML = html;
        dynamicContent.style.display = 'block';

        // Update page header controls (category + split button)
        updatePageHeaderControls(urlSlugPath);

        // Update right sidebar (table of contents)
        updateTableOfContents(dynamicContent);

        // Trigger event for docs.js to add copy button listeners
        const event = new CustomEvent('markdownLoaded');
        document.dispatchEvent(event);

        // Scroll to top
        window.scrollTo(0, 0);

        // Store current file path
        currentFile = urlSlugPath;

        // Update active state in sidebar
        updateSidebarActiveState(urlSlugPath);

        // Track analytics for markdown file view
        trackMarkdownView(urlSlugPath);

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

// Update active state in sidebar
function updateSidebarActiveState(filePath) {
    const sidebar = document.querySelector('.sidebar-left');
    if (!sidebar) return;

    // Remove active class from all links
    sidebar.querySelectorAll('.file-link').forEach(link => link.classList.remove('active'));

    // Find and activate the link matching the current file path
    const activeLink = sidebar.querySelector(`.file-link[data-path="${filePath}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Track markdown file view in analytics
async function trackMarkdownView(filePath) {
    try {
        const trackPath = `/docs/${currentProduct}/${filePath}`;

        // Send analytics tracking request (no auth required for tracking)
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: trackPath,
                type: 'markdown'
            })
        });
    } catch (error) {
        // Silently fail - don't interrupt user experience for analytics
        console.debug('Analytics tracking failed:', error);
    }
}

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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

    // Intersection Observer options
    const observerOptions = {
        rootMargin: '-80px 0px -70% 0px', // Trigger when heading is near top of viewport
        threshold: 0
    };

    // Create observer
    window.headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveHeading(entry.target.id);
            }
        });
    }, observerOptions);

    // Observe all headings
    headings.forEach(heading => {
        window.headingObserver.observe(heading);
    });
}

// Update active heading in table of contents
function updateActiveHeading(headingId) {
    // Remove active class from all TOC links
    const allLinks = document.querySelectorAll('.sidebar-right a, .mobile-right-sidebar-content a');
    allLinks.forEach(link => link.classList.remove('active'));

    // Add active class to current heading's link
    const activeLinks = document.querySelectorAll(`a[data-heading-id="${headingId}"]`);
    activeLinks.forEach(link => link.classList.add('active'));
}

// Update page header controls (category display + split button)
function updatePageHeaderControls(filePath) {
    const pageHeaderControls = document.getElementById('page-header-controls');
    const categoryNameElement = document.getElementById('current-category-name');
    const markdownNameElement = document.getElementById('current-markdown-name');

    if (!pageHeaderControls || !categoryNameElement) return;

    try {
        // Parse file path: path/to/file
        const pathParts = filePath.split('/');

        // Get category name (first part of path or "Documentation")
        const categoryName = pathParts.length > 1 ? pathParts[0] : 'Documentation';

        // Get markdown name (last part of path)
        const markdownName = pathParts[pathParts.length - 1];

        // Format names for display
        const categoryDisplayName = formatCategoryName(categoryName);
        const markdownDisplayName = formatCategoryName(markdownName);

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
