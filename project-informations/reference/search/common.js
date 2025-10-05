// Common JavaScript functionalities and header/footer injection
let flattenedDocs = [];

// Authentication helper functions
const API_BASE_URL = 'http://localhost:3090/api';

const checkAuthToken = () => {
    const authCode = localStorage.getItem('quantomAuthCode');
    return authCode !== null && authCode !== undefined && authCode.trim() !== '';
};

const handleLogout = async () => {
    // Clear local storage
    localStorage.removeItem('quantomAuthCode');
    localStorage.removeItem('quantomUserData');

    // Refresh page to update UI
    window.location.reload();
};

const getAuthHeaders = () => {
    const authCode = localStorage.getItem('quantomAuthCode');
    return authCode ? { 'Authorization': `Bearer ${authCode}` } : {};
};

const isUserLoggedIn = () => {
    return checkAuthToken();
};

// Server Status Functions
let serverStatus = 'checking';
let statusCheckInterval = null;

const checkServerStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });

        if (response.ok) {
            setServerStatus('online');
        } else {
            setServerStatus('offline');
        }
    } catch (error) {
        setServerStatus('offline');
        console.error('Server status check failed:', error);
    }
};

const setServerStatus = (status) => {
    serverStatus = status;
    updateServerStatusDisplay();

    // If server is offline and we're not on index.html, redirect
    if (status === 'offline' && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('docs.html')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
};

const updateServerStatusDisplay = () => {
    // Update any server status indicators on the page
    const statusIndicators = document.querySelectorAll('.server-status-indicator');
    statusIndicators.forEach(indicator => {
        indicator.className = `server-status-indicator ${serverStatus}`;
        const statusText = indicator.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = getServerStatusText();
        }
    });

    // Show warning on index page if server is offline
    if (window.location.pathname.includes('index.html') && serverStatus === 'offline') {
        showServerOfflineWarning();
    } else {
        hideServerOfflineWarning();
    }
};

const getServerStatusText = () => {
    switch (serverStatus) {
        case 'online':
            return 'Server Online';
        case 'offline':
            return 'Server Offline';
        case 'checking':
        default:
            return 'Checking Server...';
    }
};

const showServerOfflineWarning = () => {
    let warningBox = document.getElementById('server-offline-warning');

    if (!warningBox) {
        warningBox = document.createElement('div');
        warningBox.id = 'server-offline-warning';
        warningBox.className = 'server-offline-warning';
        warningBox.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="warning-text">
                    <strong>Server-Probleme</strong>
                    <span>Der Backend-Server ist derzeit nicht erreichbar. Einige Funktionen sind möglicherweise nicht verfügbar.</span>
                </div>
                <button onclick="hideServerOfflineWarning()" class="warning-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Insert after header
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(warningBox, main.firstChild);
        }
    }

    warningBox.style.display = 'block';
};

const hideServerOfflineWarning = () => {
    const warningBox = document.getElementById('server-offline-warning');
    if (warningBox) {
        warningBox.style.display = 'none';
    }
};

const initServerStatusChecking = () => {
    // Initial check
    checkServerStatus();

    // Set up periodic checks every 30 seconds
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }

    statusCheckInterval = setInterval(checkServerStatus, 30000);
};

const stopServerStatusChecking = () => {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
};

// Header and Footer Injection System
const injectHeader = () => {
    // Check if user is logged in
    const isLoggedIn = checkAuthToken();
    const userData = isLoggedIn ? JSON.parse(localStorage.getItem('userData') || '{}') : null;

    const loginStatusHTML = isLoggedIn ? `
        <div class="login-status">
            <i class="fas fa-user-check"></i>
            <span class="username">${userData.username}</span>
            <button class="logout-btn" onclick="handleLogout()" title="Logout">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    ` : '';

    // Check if we're on the docs page to show search bar
    const isDocsPage = window.location.pathname.includes('docs.html');
    const searchBarHTML = isDocsPage ? `
        <button id="docs-search-btn" class="docs-search-button" title="Search documentation (⌘K)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Search...</span>
            <span class="shortcut-hint">⌘K</span>
        </button>
    ` : '';

    const headerHTML = `
        <div class="header-content">
            <div class="logo-container">
                <img src="images/favicon/favicon.png" alt="Quantom Logo" class="logo-img">
                <span class="logo-text"><strong>Quantom</strong></span>
            </div>
            <button id="mobileMenuToggle" class="mobile-menu-toggle-btn"><i class="fas fa-bars"></i></button>
            <nav id="mainNav">
            ${searchBarHTML}
                <a href="index.html" class="nav-link">Home</a>
                <a href="downloads.html" class="nav-link">Download</a>
                <a href="blog.html" class="nav-link">Blog</a>
                <a href="docs.html" class="nav-link">Documentation</a>
                <div class="icon-links">
                    <a href="https://github.com/Snenjih" class="icon-link"><i class="fab fa-github"></i></a>
                    <a href="https://discord.gg/5gdthYHqSv" class="icon-link"><i class="fab fa-discord"></i></a>
                    ${loginStatusHTML}
                </div>
            </nav>
        </div>
    `;

    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = headerHTML;
        setActiveNavLink();
    }
};

const injectFooter = () => {
    const footerHTML = `
        <div class="footer-content">
            <div class="footer-bottom">
                <div class="footer-left">
                    <span class="logo">✦ Snenjih</span>
                    <span>© 2025 Quantom Systems</span>
                </div>
                <div class="footer-right">
                    <a href="https://instagram.com/Snenjih" class="social-icon" title="Instagram">
                        <i class="fab fa-instagram"></i>
                        <span class="social-name">Instagram</span>
                    </a>
                    <a href="https://x.com/Snenjih" class="social-icon" title="Twitter/X">
                        <i class="fab fa-twitter"></i>
                        <span class="social-name">Twitter</span>
                    </a>
                    <a href="https://github.com/Snenjih" class="social-icon" title="GitHub">
                        <i class="fab fa-github"></i>
                        <span class="social-name">GitHub</span>
                    </a>
                    <a href="https://discord.gg/5gdthYHqSv" class="social-icon" title="Discord">
                        <i class="fab fa-discord"></i>
                        <span class="social-name">Discord</span>
                    </a>
                    <a href="login.html" class="social-icon login-icon" title="Admin Login">
                        <i class="fas fa-sign-in-alt"></i>
                        <span class="social-name">Login</span>
                    </a>
                </div>
            </div>
            <div class="footer-contact-status">
                <span id="contact-status"></span>
            </div>
        </div>
    `;

    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = footerHTML;
    }
};

const injectMobileMenu = () => {
    const isLoggedIn = checkAuthToken();
    const userData = isLoggedIn ? JSON.parse(localStorage.getItem('userData') || '{}') : null;

    const mobileLoginStatusHTML = isLoggedIn ? `
        <div class="mobile-login-status">
            <div class="mobile-user-info">
                <i class="fas fa-user-check"></i>
                <span>Logged in as ${userData.username}</span>
            </div>
            <button class="mobile-logout-btn" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        </div>
    ` : `
        <div class="mobile-login-status">
            <a href="login.html" class="mobile-login-btn">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </a>
        </div>
    `;

    const mobileMenuHTML = `
        <button id="mobileMenuCloseBtn" class="close-btn"><i class="fas fa-times"></i></button>
        <nav>
            <a href="index.html" class="nav-link">Home</a>
            <a href="downloads.html" class="nav-link">Download</a>
            <a href="blog.html" class="nav-link">Blog</a>
            <a href="docs.html" class="nav-link">Docs</a>
            <div class="language-dropdown">
                <a href="#" class="icon-link"><i class="fas fa-language"></i> English <i class="fas fa-chevron-down"></i></a>
                <div class="dropdown-content">
                    <a href="#">English</a>
                    <a href="#">Deutsch</a>
                </div>
            </div>
        </nav>
        ${mobileLoginStatusHTML}
        <div class="icon-links">
            <a href="https://github.com/Snenjih" class="icon-link"><i class="fab fa-github"></i></a>
            <a href="https://discord.gg/5gdthYHqSv" class="icon-link"><i class="fab fa-discord"></i></a>
        </div>
    `;

    const mobileMenu = document.getElementById('mobile-overlay-menu');
    if (mobileMenu) {
        mobileMenu.innerHTML = mobileMenuHTML;
    }
};

const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
};

// NEUE FUNKTION 1: Flacht die Konfiguration ab
// Diese Funktion wandelt die verschachtelte Struktur aus docsConfig in eine einzelne, flache Liste um.
// Das ist entscheidend, um eine einfache, lineare "vorher/nächstes" Logik zu ermöglichen.
const flattenDocsConfig = (config) => {
    return config.flatMap(category => category.items);
};

// NEUE FUNKTION 2: Generiert und rendert die Navigations-Buttons
// Dies ist die Kernfunktion. Sie nimmt das aktuell angezeigte Item entgegen.
const renderPageNavigation = (currentItem, allItems) => {
    const navigationWrapper = document.getElementById('page-navigation-wrapper');
    if (!navigationWrapper) return; // Sicherheits-Check

    navigationWrapper.innerHTML = ''; // Vorherige Buttons löschen

    // Finde den Index des aktuellen Items in der flachen Liste
    const currentIndex = allItems.findIndex(item => 
        (item.id && item.id === currentItem.id) || (item.file && item.file === currentItem.file)
    );

    if (currentIndex === -1) return; // Item nicht gefunden, keine Buttons anzeigen

    // Ermittle das vorherige und nächste Item
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

    // Erstelle den "Previous Page" Button, wenn prevItem existiert
    if (prevItem) {
        const prevLink = document.createElement('a');
        prevLink.href = '#'; // Verhindert Neuladen der Seite
        prevLink.className = 'nav-page-link prev';
        prevLink.innerHTML = `
            <span class="nav-label">Previous page</span>
            <span class="nav-title">${prevItem.name}</span>
        `;
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(prevItem); // Ruft die existierende Ladefunktion auf
        });
        navigationWrapper.appendChild(prevLink);
    }

    // Erstelle den "Next Page" Button, wenn nextItem existiert
    if (nextItem) {
        const nextLink = document.createElement('a');
        nextLink.href = '#';
        nextLink.className = 'nav-page-link next';
        nextLink.innerHTML = `
            <span class="nav-label">Next page</span>
            <span class="nav-title">${nextItem.name}</span>
        `;
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(nextItem); // Ruft die existierende Ladefunktion auf
        });
        navigationWrapper.appendChild(nextLink);
    }
};

const staticContentArea = document.getElementById('static-getting-started');
const dynamicContentArea = document.getElementById('dynamic-content-area');
const sidebarLeft = document.querySelector('.sidebar-left');
const sidebarRight = document.querySelector('.sidebar-right');
const header = document.querySelector('header');
const headerHeight = header ? header.offsetHeight : 0;

let docsConfig = [];

// Function to load content based on config item
const loadContent = async (item) => {
    // Update active class in left sidebar
    document.querySelectorAll('.sidebar-left ul li a').forEach(link => {
        link.classList.remove('active');
    });
    const currentLink = sidebarLeft.querySelector(`[data-file="${item.file}"]`) || sidebarLeft.querySelector(`[data-id="${item.id}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }

    if (item.type === 'html' && item.id) {
        staticContentArea.style.display = 'block';
        dynamicContentArea.style.display = 'none';
        updateRightSidebar(staticContentArea);
    } else if (item.type === 'md' && item.file) {
        staticContentArea.style.display = 'none';
        dynamicContentArea.style.display = 'block';
        try {
            const response = await fetch(`docs/${item.file}`);
            if (!response.ok) {
                throw new Error(`Could not load Markdown file: ${item.file}`);
            }
            const markdownText = await response.text();
            dynamicContentArea.innerHTML = marked.parse(markdownText);
            updateRightSidebar(dynamicContentArea);
            addCopyButtonListeners(); // Re-add listeners for new content
        } catch (error) {
            console.error(error);
            dynamicContentArea.innerHTML = `<p style="color: red;">Error loading content: ${error.message}</p>`;
            sidebarRight.innerHTML = '<h4>On this page</h4><ul></ul>'; // Clear right sidebar on error
        }
    }

    // FÜGE DIESEN AUFRUF AM ENDE HINZU
    // Dadurch werden die Navigations-Buttons jedes Mal neu generiert, wenn eine Seite geladen wird.
    renderPageNavigation(item, flattenedDocs);
};

// Function to update the right sidebar (On this page)
const updateRightSidebar = (contentElement) => {
    sidebarRight.innerHTML = '<h4>On this page</h4><ul></ul>';
    const ul = sidebarRight.querySelector('ul');
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach(heading => {
        const id = heading.id || heading.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        heading.id = id; // Ensure heading has an ID
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        ul.appendChild(li);

        // Add click listener to update active state immediately
        a.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default jump
            const targetId = a.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Trigger scroll-spy update after smooth scroll completes
                setTimeout(() => {
                    onScroll(); // Re-evaluate scroll position and update active state
                }, 300); // Adjust delay if needed to match scroll animation
            }
        });
    });

    // Re-apply scroll-spy logic for new headings
    setupScrollSpy(contentElement);
};

// Scroll-Spy functionality
let activeHeadingId = null;
const setupScrollSpy = (contentElement) => {
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const navLinks = sidebarRight.querySelectorAll('ul li a');

    const onScroll = () => {
        let closestHeading = null;
        let minDistance = Infinity;

        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const headingCenter = rect.top + rect.height / 2;
            const distance = Math.abs(headingCenter - viewportCenter);

            // Consider headings that are at least partially in view
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                if (distance < minDistance) {
                    minDistance = distance;
                    closestHeading = heading;
                }
            }
        });

        if (closestHeading && closestHeading.id && closestHeading.id !== activeHeadingId) {
            activeHeadingId = closestHeading.id;
            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
                if (link.getAttribute('href') === `#${activeHeadingId}`) {
                    link.parentElement.classList.add('active');
                }
            });
        } else if (!closestHeading && window.scrollY < (headings[0] ? headings[0].offsetTop - headerHeight - 20 : 0)) {
            // If scrolled above the first heading, deactivate all
            activeHeadingId = null;
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
        }
    };

    window.removeEventListener('scroll', onScroll); // Remove old listener
    window.addEventListener('scroll', onScroll); // Add new listener
    onScroll(); // Initial check
};

// Add copy button listeners
const addCopyButtonListeners = () => {
    document.querySelectorAll('.copy-code-btn').forEach(button => {
        button.addEventListener('click', () => {
            const code = decodeURIComponent(button.dataset.code);
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
};


document.addEventListener('DOMContentLoaded', () => {
    // Inject common header, footer, and mobile menu on all pages
    injectHeader();
    injectFooter();
    injectMobileMenu();

    // Initialize server status checking
    initServerStatusChecking();

    // Initialize Docs Page
    const initDocsPage = async () => {
        try {
            const response = await fetch('config/docs-config.json');
            if (!response.ok) {
                throw new Error('Could not load docs-config.json');
            }
            docsConfig = await response.json();
            flattenedDocs = flattenDocsConfig(docsConfig); // HIER DIE NEUE ZEILE EINFÜGEN

            // Generate left sidebar navigation
            sidebarLeft.innerHTML = `
                <div class="logo-section">
                    <img src="images/favicon/favicon.png" alt="Quantom Logo">
                    <span>Quantom</span>
                </div>
            `;
            docsConfig.forEach(category => {
                const navBlock = document.createElement('div');
                navBlock.classList.add('nav-block');
                navBlock.innerHTML = `<h4>${category.category}</h4><ul></ul>`;
                const ul = navBlock.querySelector('ul');

                category.items.forEach(item => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#'; // Prevent default navigation
                    a.textContent = item.name;
                    a.dataset.type = item.type;
                    if (item.type === 'html') {
                        a.dataset.id = item.id;
                    } else if (item.type === 'md') {
                        a.dataset.file = item.file;
                    }

                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        loadContent(item);
                    });
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                sidebarLeft.appendChild(navBlock);
                sidebarLeft.appendChild(document.createElement('hr'));
            });
            // Remove the last hr
            if (sidebarLeft.lastElementChild.tagName === 'HR') {
                sidebarLeft.removeChild(sidebarLeft.lastElementChild);
            }


            // Load default content
            const defaultItem = docsConfig.flatMap(cat => cat.items).find(item => item.default);
            if (defaultItem) {
                loadContent(defaultItem);
            } else {
                // Fallback: show static content if no default is set
                staticContentArea.style.display = 'block';
                dynamicContentArea.style.display = 'none';
                updateRightSidebar(staticContentArea);
            }

        } catch (error) {
            console.error('Error initializing docs page:', error);
            sidebarLeft.innerHTML = `<p style="color: red;">Error loading navigation: ${error.message}</p>`;
        }
    };

    // Only initialize docs page if on docs.html
    if (window.location.pathname.includes('docs.html')) {
        initDocsPage();
    }
});
