// Nested Categories Rendering System
// Handles recursive tree rendering with expand/collapse functionality
//
// UPDATED: Now uses server-side pre-rendered HTML instead of client-side markdown parsing

// Import component orchestrator for initializing interactive components
import { initializeComponentScripts } from './component-orchestrator.js';

// Global variable to store super categories and current selection
let availableSuperCategories = [];
let currentSuperCategory = null;
let superCategorySelectorInitialized = false;

/**
 * Render the complete sidebar tree structure
 * @param {Array} tree - The tree structure from the API
 * @param {string} productId - Current product ID
 */
function renderSidebarTree(tree, productId) {
    const sidebar = document.querySelector('.sidebar-left');

    // Extract super-categories (first level items)
    availableSuperCategories = tree.filter(item => item.type === 'category');

    // Set current super-category (load from localStorage or default to first)
    const savedSuperCat = localStorage.getItem(`current-super-category-${productId}`);
    if (savedSuperCat && availableSuperCategories.find(sc => sc.urlSlug === savedSuperCat)) {
        currentSuperCategory = savedSuperCat;
    } else if (availableSuperCategories.length > 0) {
        currentSuperCategory = availableSuperCategories[0].urlSlug;
    }

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

    // Build super-category selector (only if multiple super-categories exist)
    const showSelector = availableSuperCategories.length > 1;
    const currentSuperCatObj = availableSuperCategories.find(sc => sc.urlSlug === currentSuperCategory);
    const superCategorySelectorHTML = showSelector ? `
        <div id="super-category-selector" class="super-category-selector">
            <button id="super-category-btn" class="super-category-button">
                <span class="super-category-name">${currentSuperCatObj ? currentSuperCatObj.name : 'Select Category'}</span>
                <i class="fas fa-chevron-down super-category-icon"></i>
            </button>
            <div id="super-category-dropdown" class="super-category-dropdown">
                ${availableSuperCategories.map(sc => `
                    <div class="super-category-option ${sc.urlSlug === currentSuperCategory ? 'active' : ''}"
                         data-super-category="${sc.urlSlug}">
                        ${sc.name}
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    // =========================================================================
    // FIX START: Header Controls (Logo + Collapse Button) retten
    // =========================================================================
    
    // Prüfen, ob Controls bereits existieren (durch docs-sidebars.js injiziert)
    const existingHeaderControls = sidebar.querySelector('.sidebar-header-controls');
    
    // Sidebar leeren
    sidebar.innerHTML = '';

    // Wenn Controls existierten, füge sie als erstes wieder ein
    if (existingHeaderControls) {
        sidebar.appendChild(existingHeaderControls);
    }
    
    // Neue Navigationselemente anhängen (statt innerHTML zu überschreiben)
    // Wir erstellen einen temporären Container, um HTML Strings in Nodes zu wandeln
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = searchButtonHTML + superCategorySelectorHTML;
    
    // Kinder des tempContainers in die Sidebar verschieben
    while (tempContainer.firstChild) {
        sidebar.appendChild(tempContainer.firstChild);
    }

    // =========================================================================
    // FIX ENDE
    // =========================================================================

    // Render only the selected super-category
    const selectedSuperCat = availableSuperCategories.find(sc => sc.urlSlug === currentSuperCategory);
    if (selectedSuperCat) {
        const itemElement = renderTreeItem(selectedSuperCat, productId, [], 0);
        sidebar.appendChild(itemElement);
    }

    // Initialize event listeners
    initializeCategoryEventListeners(productId);
    initializeSuperCategorySelector(productId, tree);
    
    // Re-initialize Sidebar Events if necessary (z.B. Collapse Button neu binden falls verloren)
    if (window.DocsSidebars && typeof window.DocsSidebars.init === 'function') {
        // Falls die Elemente neu erstellt wurden, müssen wir die Listener evtl. neu binden
        // Da wir das Element aber behalten haben (.appendChild(existingHeaderControls)), 
        // sollten die Event-Listener noch aktiv sein.
    }
}

/**
 * Recursively render a single tree item (category or file)
 * @param {Object} item - Tree item object
 * @param {string} productId - Current product ID
 * @param {Array} parentPath - Array of parent URL slugs
 * @param {number} depth - Current depth in tree (0 = super-category, 1 = category, 2+ = nested)
 * @returns {HTMLElement} - Rendered DOM element
 */
function renderTreeItem(item, productId, parentPath, depth) {
    if (item.type === 'category') {
        return renderCategory(item, productId, parentPath, depth);
    } else if (item.type === 'file') {
        return renderFile(item, productId, parentPath, depth);
    }
}

/**
 * Render a category with potential children
 * @param {Object} category - Category object
 * @param {string} productId - Current product ID
 * @param {Array} parentPath - Array of parent URL slugs
 * @param {number} depth - Current depth (0 = super-category, 1 = category, 2+ = nested)
 * @returns {HTMLElement} - Category DOM element
 */
function renderCategory(category, productId, parentPath, depth) {
    // Build path for this category
    const currentPath = [...parentPath, category.urlSlug];

    // Depth 0 and 1: Use old nav-block design (super-category and category)
    // Depth 2+: Use new nested category design
    if (depth < 2) {
        return renderTraditionalCategory(category, productId, currentPath, depth);
    } else {
        return renderNestedCategory(category, productId, currentPath, depth);
    }
}

/**
 * Render traditional category (super-category or category level)
 * Uses the old nav-block design with H4 and ul/li
 */
function renderTraditionalCategory(category, productId, currentPath, depth) {
    const navBlock = document.createElement('div');
    navBlock.className = 'nav-block';

    // Category title
    const title = document.createElement('h4');
    title.textContent = category.name;
    navBlock.appendChild(title);

    // File list
    if (category.children && category.children.length > 0) {
        const fileList = document.createElement('ul');

        category.children.forEach(child => {
            const childElement = renderTreeItem(child, productId, currentPath, depth + 1);
            fileList.appendChild(childElement);
        });

        navBlock.appendChild(fileList);
    }

    return navBlock;
}

/**
 * Render nested category (depth 2+)
 * Uses the new expandable button design
 */
function renderNestedCategory(category, productId, currentPath, depth) {
    const container = document.createElement('div');
    container.className = 'sidebar-category-item';

    const pathString = currentPath.join('/');
    const isExpanded = getCategoryExpansionState(productId, pathString);

    // Create category button
    const button = document.createElement('button');
    button.className = `sidebar-category-button ${isExpanded ? 'expanded' : ''}`;
    button.dataset.categoryPath = pathString;
    button.dataset.hasIndex = category.hasIndex || false;

    // Category name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.textContent = category.name;
    button.appendChild(nameSpan);

    // Arrow icon (only if has children)
    if (category.children && category.children.length > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'category-arrow';
        arrow.textContent = '▶';
        button.appendChild(arrow);
    }

    container.appendChild(button);

    // Create nested content container
    if (category.children && category.children.length > 0) {
        const nestedContent = document.createElement('div');
        nestedContent.className = `sidebar-nested-content ${isExpanded ? 'expanded' : ''}`;
        nestedContent.style.display = isExpanded ? 'block' : 'none';

        // Recursively render children
        category.children.forEach(child => {
            const childElement = renderTreeItem(child, productId, currentPath, depth + 1);
            nestedContent.appendChild(childElement);
        });

        container.appendChild(nestedContent);
    }

    return container;
}

/**
 * Render a file item
 * @param {Object} file - File object
 * @param {string} productId - Current product ID
 * @param {Array} parentPath - Array of parent URL slugs
 * @param {number} depth - Current depth
 * @returns {HTMLElement} - File DOM element
 */
function renderFile(file, productId, parentPath, depth) {
    // Build full path
    const filePath = [...parentPath, file.urlSlug].join('/');
    const fileUrl = `/${productId}/${filePath}`;

    // For traditional categories (depth < 2): use li element
    // For nested categories (depth >= 2): use div element
    const container = depth < 2 ? document.createElement('li') : document.createElement('div');
    if (depth >= 2) {
        container.className = 'sidebar-file-item';
    }

    // Create link
    const link = document.createElement('a');
    link.href = fileUrl;
    link.className = depth < 2 ? '' : 'sidebar-file-link';
    link.dataset.filePath = filePath;
    link.textContent = file.name;

    container.appendChild(link);

    return container;
}

/**
 * Initialize event listeners for category buttons and file links
 * @param {string} productId - Current product ID
 */
function initializeCategoryEventListeners(productId) {
    const sidebar = document.querySelector('.sidebar-left');

    // Category button click handler (for nested categories)
    sidebar.addEventListener('click', (e) => {
        const button = e.target.closest('.sidebar-category-button');
        if (!button) return;

        e.preventDefault();

        const categoryPath = button.dataset.categoryPath;
        const hasIndex = button.dataset.hasIndex === 'true';
        const nestedContent = button.parentElement.querySelector('.sidebar-nested-content');

        // Toggle expansion
        const isExpanded = button.classList.contains('expanded');

        if (nestedContent) {
            if (isExpanded) {
                // Collapse
                button.classList.remove('expanded');
                nestedContent.classList.remove('expanded');
                nestedContent.style.display = 'none';
            } else {
                // Expand
                button.classList.add('expanded');
                nestedContent.classList.add('expanded');
                nestedContent.style.display = 'block';
            }

            // Save expansion state
            saveCategoryExpansionState(productId, categoryPath, !isExpanded);
        }

        // If has index.md, load it
        if (hasIndex) {
            // Remove active class from all
            sidebar.querySelectorAll('.sidebar-category-button, .sidebar-file-link, .nav-block a').forEach(el => {
                el.classList.remove('active');
            });

            // Add active class to this button
            button.classList.add('active');

            // Load index.md
            loadCategoryIndex(productId, categoryPath);

            // Update URL
            const newUrl = `/${productId}/${categoryPath}/`;
            window.history.pushState({ product: productId, path: categoryPath, isIndex: true }, '', newUrl);
        }
    });

    // File link click handler (for nested categories)
    sidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-file-link');
        if (!link) return;

        e.preventDefault();

        const filePath = link.dataset.filePath;

        // Remove active class from all
        sidebar.querySelectorAll('.sidebar-category-button, .sidebar-file-link, .nav-block a').forEach(el => {
            el.classList.remove('active');
        });

        // Add active class to this link
        link.classList.add('active');

        // Load file
        loadMarkdownFileByPath(productId, filePath);

        // Update URL
        const newUrl = `/${productId}/${filePath}`;
        window.history.pushState({ product: productId, path: filePath, isFile: true }, '', newUrl);
    });

    // Traditional file link click handler (for nav-block links)
    sidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-block a');
        if (!link) return;
        // Check if it's not already handled by sidebar-file-link
        if (link.classList.contains('sidebar-file-link')) return;

        e.preventDefault();

        const filePath = link.dataset.filePath;

        // Remove active class from all
        sidebar.querySelectorAll('.sidebar-category-button, .sidebar-file-link, .nav-block a').forEach(el => {
            el.classList.remove('active');
        });

        // Add active class to this link
        link.classList.add('active');

        // Load file
        loadMarkdownFileByPath(productId, filePath);

        // Update URL
        const newUrl = `/${productId}/${filePath}`;
        window.history.pushState({ product: productId, path: filePath, isFile: true }, '', newUrl);
    });
}

/**
 * Load a category's index.md file
 * @param {string} productId - Product ID
 * @param {string} categoryPath - Category path (URL slugs)
 */
async function loadCategoryIndex(productId, categoryPath) {
    try {
        showLoadingSkeleton();

        // Fetch index.md content
        const response = await fetch(`/api/docs/${productId}/${categoryPath}/index`);

        if (!response.ok) {
            throw new Error(`Failed to load index: ${response.status}`);
        }

        const data = await response.json();

        // Response now includes pre-rendered HTML from the server:
        // - content: pre-rendered HTML (ready to inject)
        // - rawContent: raw markdown (for editing)
        // - fileType: 'md' or 'mdx'
        // - metadata.lastModified: timestamp
        // - metadata.size: file size

        const dynamicContent = document.getElementById('dynamic-content-area');
        const html = data.content; // Use pre-rendered HTML directly
        const fileType = data.fileType || 'md';

        // Client-side markdown parsing is now disabled - server provides pre-rendered HTML
        // Legacy code (commented out):
        // if (fileType === 'mdx' && typeof parseMDX === 'function') {
        //     html = parseMDX(content, MDX_COMPONENTS);
        // } else {
        //     html = marked.parse(content);
        // }

        // Inject pre-rendered HTML directly
        dynamicContent.innerHTML = html;
        dynamicContent.style.display = 'block';

        // Initialize interactive components (Tabs, Accordions, CodeGroups, etc.)
        initializeComponentScripts();

        const categoryName = categoryPath.split('/').pop();
        updatePageTitle(categoryName);

        // Update page header
        updatePageHeaderControls(categoryPath);

        // Update table of contents
        updateTableOfContents(dynamicContent);

        // Add copy button listeners to code blocks
        if (typeof addCopyButtonListeners === 'function') {
            addCopyButtonListeners();
        }

        // Scroll to top
        window.scrollTo(0, 0);

        // Analytics tracking removed (Task 1.10.6)

    } catch (error) {
        console.error('Error loading category index:', error);
        document.getElementById('dynamic-content-area').innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">
                <h2>Failed to load content</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Load a markdown file by its path (URL slugs)
 * @param {string} productId - Product ID
 * @param {string} filePath - File path (URL slugs)
 */
async function loadMarkdownFileByPath(productId, filePath) {
    try {
        showLoadingSkeleton();

        // Fetch file content
        const response = await fetch(`/api/docs/${productId}/${filePath}`);

        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status}`);
        }

        const data = await response.json();

        // Response now includes pre-rendered HTML from the server:
        // - content: pre-rendered HTML (ready to inject)
        // - rawContent: raw markdown (for editing)
        // - fileType: 'md' or 'mdx'
        // - metadata.lastModified: timestamp
        // - metadata.size: file size

        const dynamicContent = document.getElementById('dynamic-content-area');
        const html = data.content; // Use pre-rendered HTML directly
        const fileType = data.fileType || 'md';

        // Client-side markdown parsing is now disabled - server provides pre-rendered HTML
        // Legacy code (commented out):
        // if (fileType === 'mdx' && typeof parseMDX === 'function') {
        //     html = parseMDX(content, MDX_COMPONENTS);
        // } else {
        //     html = marked.parse(content);
        // }

        // Inject pre-rendered HTML directly
        dynamicContent.innerHTML = html;
        dynamicContent.style.display = 'block';

        // Initialize interactive components (Tabs, Accordions, CodeGroups, etc.)
        initializeComponentScripts();

        const fileName = filePath.split('/').pop();
        updatePageTitle(fileName);

        // Update page header
        updatePageHeaderControls(filePath);

        // Update table of contents
        updateTableOfContents(dynamicContent);

        // Add copy button listeners
        if (typeof addCopyButtonListeners === 'function') {
            addCopyButtonListeners();
        }

        // Scroll to top
        window.scrollTo(0, 0);

        // Analytics tracking removed (Task 1.10.6)

    } catch (error) {
        console.error('Error loading markdown file:', error);
        document.getElementById('dynamic-content-area').innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--secondary-text-color);">
                <h2>Failed to load content</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Save category expansion state to localStorage
 * @param {string} productId - Product ID
 * @param {string} categoryPath - Category path
 * @param {boolean} isExpanded - Expansion state
 */
function saveCategoryExpansionState(productId, categoryPath, isExpanded) {
    const key = `category-expansion-${productId}-${categoryPath}`;
    localStorage.setItem(key, isExpanded ? 'true' : 'false');
}

/**
 * Get category expansion state from localStorage
 * @param {string} productId - Product ID
 * @param {string} categoryPath - Category path
 * @returns {boolean} - Expansion state
 */
function getCategoryExpansionState(productId, categoryPath) {
    const key = `category-expansion-${productId}-${categoryPath}`;
    return localStorage.getItem(key) === 'true';
}

/**
 * Initialize super-category selector event listeners
 * @param {string} productId - Product ID
 * @param {Array} tree - Full tree structure
 */
function initializeSuperCategorySelector(productId, tree) {
    // Only initialize event listeners once using event delegation on the sidebar
    if (!superCategorySelectorInitialized) {
        const sidebar = document.querySelector('.sidebar-left');

        // Use event delegation for button clicks
        sidebar.addEventListener('click', (e) => {
            const selectorBtn = e.target.closest('#super-category-btn');
            if (!selectorBtn) return;

            e.stopPropagation();
            const dropdown = document.getElementById('super-category-dropdown');
            if (!dropdown) return;

            const isOpen = dropdown.classList.contains('show');

            if (isOpen) {
                dropdown.classList.remove('show');
                selectorBtn.classList.remove('open');
                const icon = selectorBtn.querySelector('.super-category-icon');
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                dropdown.classList.add('show');
                selectorBtn.classList.add('open');
                const icon = selectorBtn.querySelector('.super-category-icon');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });

        // Use event delegation for dropdown option clicks
        sidebar.addEventListener('click', (e) => {
            const option = e.target.closest('.super-category-option');
            if (!option) return;

            const dropdown = document.getElementById('super-category-dropdown');
            const selectorBtn = document.getElementById('super-category-btn');
            if (!dropdown || !selectorBtn) return;

            const selectedSlug = option.dataset.superCategory;

            // Update active state
            dropdown.querySelectorAll('.super-category-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');

            // Save to localStorage
            localStorage.setItem(`current-super-category-${productId}`, selectedSlug);

            // Update current super category
            currentSuperCategory = selectedSlug;

            // Re-render sidebar with new super-category
            renderSidebarTree(tree, productId);

            // Close dropdown
            dropdown.classList.remove('show');
            selectorBtn.classList.remove('open');
            const icon = selectorBtn.querySelector('.super-category-icon');
            if (icon) icon.style.transform = 'rotate(0deg)';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#super-category-selector')) {
                const dropdown = document.getElementById('super-category-dropdown');
                const selectorBtn = document.getElementById('super-category-btn');
                if (dropdown) {
                    dropdown.classList.remove('show');
                    if (selectorBtn) {
                        selectorBtn.classList.remove('open');
                        const icon = selectorBtn.querySelector('.super-category-icon');
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });

        superCategorySelectorInitialized = true;
    }
}

/**
 * Show loading skeleton
 */
function showLoadingSkeleton() {
    const dynamicContent = document.getElementById('dynamic-content-area');
    if (dynamicContent) {
        dynamicContent.innerHTML = `
            <div class="loading-skeleton">
                <div class="skeleton-line" style="width: 60%;"></div>
                <div class="skeleton-line" style="width: 80%;"></div>
                <div class="skeleton-line" style="width: 70%;"></div>
            </div>
        `;
    }
}

/**
 * Update page header controls (category display + split button)
 */
function updatePageHeaderControls(filePath) {
    const pageHeaderControls = document.getElementById('page-header-controls');
    const categoryNameElement = document.getElementById('current-category-name');
    const markdownNameElement = document.getElementById('current-markdown-name');

    if (!pageHeaderControls || !categoryNameElement) return;

    try {
        // Parse file path: super-category/category/.../fileName
        const pathParts = filePath.split('/').filter(p => p);

        if (pathParts.length < 1) {
            pageHeaderControls.style.display = 'none';
            return;
        }

        // Last part is the file name, second-to-last is the immediate category
        const markdownName = pathParts[pathParts.length - 1];
        const categoryName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';

        // Format names for display
        const categoryDisplayName = categoryName ? formatCategoryName(categoryName) : '';
        const markdownDisplayName = markdownName ? formatCategoryName(markdownName).replace(/\.md$/, '') : '';

        // Update category name
        if (categoryNameElement) categoryNameElement.textContent = categoryDisplayName;
        if (markdownNameElement) markdownNameElement.textContent = markdownDisplayName;

        // Show page header controls
        pageHeaderControls.style.display = 'flex';
    } catch (error) {
        console.error('Error updating page header controls:', error);
        pageHeaderControls.style.display = 'none';
    }
}

/**
 * Helper to format category/file names (replace hyphens with spaces, capitalize)
 */
function formatCategoryName(name) {
    if (!name) return '';
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Update table of contents in right sidebar
 */
function updateTableOfContents(contentElement) {
    // Default settings
    const headerSettings = {
        mainSectionHeader: true,
        subSectionHeader: true,
        subSubSectionHeader: false
    };
    const useGap = true;

    // Select headings based on settings
    let selector = 'h1, h2, h3';
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
            history.pushState(null, null, `#${heading.id}`);
            updateActiveHeadings();
        });

        li.appendChild(a);
        sidebarRight.appendChild(li);

        // Also add to mobile sidebar
        if (mobileRightSidebar) {
            const mobileLi = li.cloneNode(true);
            const mobileLink = mobileLi.querySelector('a');
            mobileLink.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const mobileSidebar = document.getElementById('mobile-right-sidebar-menu');
                if (mobileSidebar) mobileSidebar.classList.remove('active');
            });
            mobileRightSidebar.appendChild(mobileLi);
        }
    });

    // Initialize scroll spy
    initScrollSpy(headings);
}

/**
 * Initialize scroll spy to track visible headings
 */
function initScrollSpy(headings) {
    if (window.headingObserver) {
        window.headingObserver.disconnect();
    }

    if (!window.visibleHeadings) {
        window.visibleHeadings = new Set();
    } else {
        window.visibleHeadings.clear();
    }

    const observerOptions = {
        rootMargin: '-80px 0px -20% 0px',
        threshold: [0, 1.0]
    };

    window.headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.visibleHeadings.add(entry.target.id);
            } else {
                window.visibleHeadings.delete(entry.target.id);
            }
        });
        updateActiveHeadings();
    }, observerOptions);

    headings.forEach(heading => {
        window.headingObserver.observe(heading);
    });
}

/**
 * Update active headings in table of contents
 */
function updateActiveHeadings() {
    const allLinks = document.querySelectorAll('.sidebar-right a, .mobile-right-sidebar-content a');
    allLinks.forEach(link => link.classList.remove('active'));

    if (window.visibleHeadings && window.visibleHeadings.size > 0) {
        // Find the first visible heading to mark as active
        // (You can adapt this logic to highlight all visible headings if preferred)
        const firstVisibleId = Array.from(window.visibleHeadings)[0];
        if (firstVisibleId) {
             const activeLinks = document.querySelectorAll(`a[data-heading-id="${firstVisibleId}"]`);
             activeLinks.forEach(link => link.classList.add('active'));
        }
    }
}


/**
 * Updates the browser tab title
 * @param {string} titleSegment - The name of the current page/file
 */
function updatePageTitle(titleSegment) {
    if (!titleSegment) {
        document.title = 'QuantomDocs';
        return;
    }

    // Formatierung: "meine-seite.md" -> "Meine Seite"
    const formattedTitle = titleSegment
        .replace(/\.md$/, '')      // Entferne .md
        .replace(/-/g, ' ')        // Ersetze Bindestriche durch Leerzeichen
        .split(' ')                // Wörter splitten
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Erstes Zeichen groß
        .join(' ');

    document.title = `${formattedTitle} | QuantomDocs`;
}

export {
    renderSidebarTree,
    loadMarkdownFileByPath,
    loadCategoryIndex,
    initializeSuperCategorySelector,
    updatePageHeaderControls,
    updateTableOfContents
};