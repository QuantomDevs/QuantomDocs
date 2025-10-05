// Dynamic Multi-Product Documentation System
// Handles product overview, dynamic loading, and navigation

let currentProduct = null;
let currentCategory = null;
let currentFile = null;

// Initialize the documentation page
async function initDocsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedProduct = urlParams.get('product');
    const selectedFile = urlParams.get('file');

    if (!selectedProduct) {
        // Show product overview
        await loadProductOverview();
    } else {
        // Load specific product docs
        currentProduct = selectedProduct;
        await loadProductDocs(selectedProduct, selectedFile);
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
    document.querySelector('.sidebar-left').style.display = 'none';
    document.querySelector('.sidebar-right').style.display = 'none';
    document.querySelector('.main-content').style.display = 'none';
    document.querySelector('.mobile-menu-buttons').style.display = 'none';
}

// Show docs containers when loading product
function showDocsContainers() {
    document.getElementById('product-overview').style.display = 'none';
    document.querySelector('.sidebar-left').style.display = 'block';
    document.querySelector('.sidebar-right').style.display = 'block';
    document.querySelector('.main-content').style.display = 'block';

    // Show mobile menu buttons on small screens
    if (window.innerWidth <= 1024) {
        document.querySelector('.mobile-menu-buttons').style.display = 'flex';
    }
}

// Select a product and load its documentation
function selectProduct(productId) {
    // Update URL
    const newUrl = `${window.location.pathname}?product=${productId}`;
    window.history.pushState({ product: productId }, '', newUrl);

    // Load product docs
    currentProduct = productId;
    loadProductDocs(productId);
}

// Load product documentation
async function loadProductDocs(productId, specificFile = null) {
    try {
        // Show docs containers
        showDocsContainers();

        // Fetch product structure from backend
        const apiBase = window.location.port === '5005' ? 'http://localhost:3090' : '';
        const response = await fetch(`${apiBase}/api/docs/products/${productId}/structure`);
        if (!response.ok) {
            throw new Error('Failed to fetch product structure');
        }

        const data = await response.json();
        const categories = data.categories;

        // Build sidebar from structure
        buildSidebar(categories, productId);

        // Load the specified file or first doc by default
        if (specificFile) {
            loadMarkdownFile(specificFile);
            // Set active link in sidebar for the loaded file
            setActiveSidebarLink(specificFile);
        } else if (categories.length > 0 && categories[0].files.length > 0) {
            loadMarkdownFile(categories[0].files[0].path);
        }
    } catch (error) {
        console.error('Error loading product docs:', error);
        document.querySelector('.main-content').innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">
                <h2>Failed to load documentation</h2>
                <p>Product "${productId}" could not be found.</p>
                <button onclick="window.location.href='docs.html'" style="margin-top: 20px; padding: 10px 20px; background: var(--accent-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Back to Products
                </button>
            </div>
        `;
    }
}

// Build the left sidebar navigation from categories
function buildSidebar(categories, productId) {
    const sidebar = document.querySelector('.sidebar-left');
    sidebar.innerHTML = '';

    // Add "Back to Products" link
    const backLink = document.createElement('div');
    backLink.className = 'back-to-products';
    backLink.innerHTML = `
        <a href="docs.html" style="display: flex; align-items: center; gap: 8px; padding: 12px; margin-bottom: 20px; background: var(--card-background-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-color); text-decoration: none; transition: all 0.2s;">
            <i class="fas fa-arrow-left"></i>
            <span>All Products</span>
        </a>
    `;
    sidebar.appendChild(backLink);

    categories.forEach(category => {
        const categoryBlock = document.createElement('div');
        categoryBlock.className = 'nav-block';

        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = category.displayName;
        categoryBlock.appendChild(categoryTitle);

        const fileList = document.createElement('ul');
        category.files.forEach(file => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = file.displayName;
            a.setAttribute('data-file-path', file.path);
            a.onclick = (e) => {
                e.preventDefault();

                // Remove active class from all links
                sidebar.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                // Add active class to clicked link
                a.classList.add('active');

                // Update URL with file parameter
                const newUrl = `${window.location.pathname}?product=${productId}&file=${encodeURIComponent(file.path)}`;
                window.history.pushState({ product: productId, file: file.path }, '', newUrl);

                loadMarkdownFile(file.path);
            };
            li.appendChild(a);
            fileList.appendChild(li);
        });

        categoryBlock.appendChild(fileList);
        sidebar.appendChild(categoryBlock);
    });
}

// Load and display markdown file
async function loadMarkdownFile(filePath) {
    const dynamicContent = document.getElementById('dynamic-content-area');

    try {
        // Show loading skeleton
        showLoadingSkeleton();

        const response = await fetch(`docs/${filePath}`);
        if (!response.ok) {
            throw new Error(`Failed to load: ${filePath}`);
        }

        const markdown = await response.text();
        const html = marked.parse(markdown);

        // Hide static getting started content
        const staticContent = document.getElementById('static-getting-started');
        if (staticContent) {
            staticContent.style.display = 'none';
        }

        // Show dynamic content area with loaded content
        dynamicContent.innerHTML = html;
        dynamicContent.style.display = 'block';

        // Update breadcrumb navigation
        updateBreadcrumb(filePath);

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

// Update breadcrumb navigation
async function updateBreadcrumb(filePath) {
    const breadcrumb = document.querySelector('.breadcrumb');
    const breadcrumbList = document.getElementById('breadcrumb-list');

    if (!breadcrumb || !breadcrumbList) return;

    try {
        // Parse file path: productId/categoryName/fileName.md
        const pathParts = filePath.split('/');
        const productId = pathParts[0];
        const categoryName = pathParts[1];
        const fileName = pathParts[2];

        // Get product info from config
        const configResponse = await fetch('config/docs-config.json');
        const config = await configResponse.json();
        const product = config.products.find(p => p.id === productId);

        // Format names for display
        const categoryDisplayName = formatCategoryName(categoryName);
        const fileDisplayName = formatFileName(fileName);

        // Build breadcrumb HTML
        breadcrumbList.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="docs.html">Documentation</a></li>
            <li><a href="docs.html?product=${productId}">${product ? product.name : productId}</a></li>
            <li>${categoryDisplayName}</li>
            <li aria-current="page">${fileDisplayName}</li>
        `;

        // Show breadcrumb
        breadcrumb.style.display = 'block';
    } catch (error) {
        console.error('Error updating breadcrumb:', error);
        breadcrumb.style.display = 'none';
    }
}

// Format category name for display
function formatCategoryName(folderName) {
    return folderName
        .replace(/-/g, ' ')
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
function updateTableOfContents(contentElement) {
    const headings = contentElement.querySelectorAll('h1, h2, h3');
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

    if (!pageHeaderControls || !categoryNameElement) return;

    try {
        // Parse file path: productId/categoryName/fileName.md
        const pathParts = filePath.split('/');
        const categoryName = pathParts[1];

        // Format category name for display
        const categoryDisplayName = formatCategoryName(categoryName);

        // Update category name
        categoryNameElement.textContent = categoryDisplayName;

        // Store current category
        currentCategory = categoryDisplayName;

        // Show page header controls
        pageHeaderControls.style.display = 'flex';
    } catch (error) {
        console.error('Error updating page header controls:', error);
        pageHeaderControls.style.display = 'none';
    }
}

// Note: addCopyButtonListeners is defined in docs.js and will be called from there

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    if (event.state) {
        if (event.state.product) {
            loadProductDocs(event.state.product, event.state.file);
        }
    } else {
        loadProductOverview();
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initDocsPage();
});
