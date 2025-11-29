/* ============================================
   SETTINGS PAGE JAVASCRIPT
   Handles authentication, navigation, and settings management
   ============================================ */

// Wrap everything in IIFE to avoid global scope conflicts
(function() {
    'use strict';

    // ==================== GLOBAL STATE ====================
    const state = {
        isAuthenticated: false,
        currentUser: null,
        currentTab: 'overview',
        isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true'
    };

    // Token refresh timer
    let tokenRefreshInterval = null;

    // ==================== TOKEN MANAGEMENT ====================
    /**
     * Check if token is expiring soon (within 5 minutes)
     */
    function isTokenExpiringSoon() {
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        if (!expiresAt) return true;

        const expirationTime = new Date(expiresAt).getTime();
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        return (expirationTime - currentTime) <= fiveMinutes;
    }

    /**
     * Check if token is expired
     */
    function isTokenExpired() {
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        if (!expiresAt) return true;

        const expirationTime = new Date(expiresAt).getTime();
        return Date.now() >= expirationTime;
    }

    /**
     * Refresh the authentication token
     */
    async function refreshToken() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try {
            const response = await fetch('/api/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Update stored token and expiration
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('tokenExpiresAt', data.expiresAt);
                localStorage.setItem('tokenExpiresIn', data.expiresIn);

                console.log('Token refreshed successfully');
                return true;
            } else {
                console.error('Token refresh failed:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    }

    /**
     * Start automatic token refresh timer
     * Checks every minute if token needs refresh
     */
    function startTokenRefreshTimer() {
        // Clear any existing timer
        stopTokenRefreshTimer();

        // Check immediately
        checkAndRefreshToken();

        // Set interval to check every minute
        tokenRefreshInterval = setInterval(() => {
            checkAndRefreshToken();
        }, 60 * 1000); // Check every 60 seconds
    }

    /**
     * Stop the token refresh timer
     */
    function stopTokenRefreshTimer() {
        if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval);
            tokenRefreshInterval = null;
        }
    }

    /**
     * Check if token needs refresh and refresh if necessary
     */
    async function checkAndRefreshToken() {
        // If token is expired, force logout
        if (isTokenExpired()) {
            console.log('Token expired, forcing logout');
            await handleLogout();
            return;
        }

        // If token is expiring soon, refresh it
        if (isTokenExpiringSoon()) {
            console.log('Token expiring soon, refreshing...');
            const success = await refreshToken();
            if (!success) {
                console.log('Token refresh failed, forcing logout');
                await handleLogout();
            }
        }
    }

    /**
     * Make an authenticated API call with automatic token refresh
     */
    async function authenticatedFetch(url, options = {}) {
        // Check if token needs refresh before making the call
        if (isTokenExpiringSoon()) {
            await refreshToken();
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token');
        }

        // Add authorization header
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        return fetch(url, { ...options, headers });
    }

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeEventListeners();
    initializeMobileSettings();
    initializeThemeToggle();
});

// ==================== AUTHENTICATION ====================
/**
 * Check if user is authenticated
 * If authenticated, show settings page
 * If not authenticated, show login page
 */
async function checkAuthentication() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        showLoginPage();
        return;
    }

    try {
        const response = await fetch('/api/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            state.isAuthenticated = true;
            state.currentUser = data.user;

            // Start token refresh timer
            startTokenRefreshTimer();

            showSettingsPage();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiresAt');
            localStorage.removeItem('tokenExpiresIn');
            showLoginPage();
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('tokenExpiresIn');
        showLoginPage();
    }
}

/**
 * Show the login page and hide settings page
 */
function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const settingsPage = document.getElementById('settingsPage');

    if (loginPage) loginPage.style.display = 'flex';
    if (settingsPage) settingsPage.style.display = 'none';
}

/**
 * Show the settings page and hide login page
 * Initialize settings page components
 */
function showSettingsPage() {
    const loginPage = document.getElementById('loginPage');
    const settingsPage = document.getElementById('settingsPage');

    if (loginPage) loginPage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'flex';

    // Inject header and footer
    injectHeaderAndFooter();

    // Update username display
    const usernameDisplay = document.getElementById('currentUsername');
    if (usernameDisplay && state.currentUser) {
        usernameDisplay.textContent = state.currentUser.username;
    }

    // Apply saved sidebar state
    if (state.isSidebarCollapsed) {
        document.getElementById('settingsSidebar').classList.add('collapsed');
    }

    // Load content for current tab
    loadTabContent(state.currentTab);
}

/**
 * Inject header and footer into settings page
 */
function injectHeaderAndFooter() {
    // Inject header
    const headerContainer = document.getElementById('settingsHeader');
    if (headerContainer && window.getHeaderHTML) {
        headerContainer.innerHTML = window.getHeaderHTML();
        // Initialize header interactions if needed
        if (window.initHeaderInteractions) {
            window.initHeaderInteractions();
        }
    }

    // Inject footer
    const footerContainer = document.getElementById('settingsFooter');
    if (footerContainer && window.getFooterHTML) {
        footerContainer.innerHTML = window.getFooterHTML();
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorEl = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');

    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing in...</span>';
    errorEl.style.display = 'none';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and expiration information
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('tokenExpiresAt', data.expiresAt);
            localStorage.setItem('tokenExpiresIn', data.expiresIn);
            state.isAuthenticated = true;
            state.currentUser = data.user;

            // Start token refresh timer
            startTokenRefreshTimer();

            // Show settings page
            showSettingsPage();
        } else {
            // Show error
            errorText.textContent = data.error || 'Login failed';
            errorEl.style.display = 'flex';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorText.textContent = 'Connection error. Please try again.';
        errorEl.style.display = 'flex';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Continue</span><i class="fas fa-arrow-right"></i>';
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    // Stop token refresh timer
    stopTokenRefreshTimer();

    const token = localStorage.getItem('authToken');

    if (token) {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local storage and state
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('tokenExpiresIn');
    state.isAuthenticated = false;
    state.currentUser = null;

    // Show login page
    showLoginPage();
}

// ==================== EVENT LISTENERS ====================
/**
 * Initialize all event listeners
 * This is the central place to add event listeners for various UI elements
 */
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = togglePassword.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // User dropdown toggle
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdown.style.display === 'block';
            userDropdown.style.display = isOpen ? 'none' : 'block';
            userMenuToggle.classList.toggle('active', !isOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.style.display = 'none';
            userMenuToggle.classList.remove('active');
        });
    }

    // Dropdown actions
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;

            if (action === 'change-password') {
                openChangePasswordModal();
            } else if (action === 'logout') {
                handleLogout();
            }
        });
    });

    // Sidebar collapse
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const sidebar = document.getElementById('settingsSidebar');
    if (collapseBtn && sidebar) {
        collapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            state.isSidebarCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', state.isSidebarCollapsed);
        });
    }

    // Navigation tabs
    document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, .btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.dataset.modal;
            if (modalId) {
                closeModal(modalId);
            }
        });
    });

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    if (changePasswordForm && savePasswordBtn) {
        savePasswordBtn.addEventListener('click', handleChangePassword);
    }

    // Authentication tab - create user button
    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', openCreateUserModal);
    }

    // User editor form
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', handleSaveUser);
    }
}

// ==================== TAB NAVIGATION ====================
/**
 * Switch to a different tab
 * To add a new tab:
 * 1. Add the tab button in HTML with data-tab="your-tab-name"
 * 2. Add the content div with id="your-tab-name-content"
 * 3. Add a case in the switch statement below to load your content
 */
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Update state
    state.currentTab = tabName;

    // Load content for specific tabs
    loadTabContent(tabName);
}

/**
 * Load content for specific tabs
 * Add cases here for tabs that need to load data dynamically
 */
function loadTabContent(tabName) {
    switch (tabName) {
        case 'authentication':
            loadAuthenticationTab();
            break;
        case 'settings':
            loadSettingsTab();
            break;
        case 'analytics':
            loadAnalyticsTab();
            break;
        case 'editor':
            loadEditorTab();
            break;
        case 'overview':
            // Future: load overview data
            break;
        case 'themes':
            // Future: load theme editor
            break;
    }
}

// ==================== AUTHENTICATION TAB ====================
/**
 * Load the authentication tab with user list
 */
async function loadAuthenticationTab() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    // Show loading state
    usersList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Loading users...</p></div>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderUsersList(data.users);
        } else {
            usersList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Error Loading Users</h3><p>Could not load user list.</p></div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Connection Error</h3><p>Could not connect to server.</p></div>';
    }
}

/**
 * Render the users list
 */
function renderUsersList(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state"><i class="fas fa-users empty-icon"></i><h3>No Users</h3><p>No users found in the system.</p></div>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-card-info">
                <div class="user-card-name">
                    <i class="fas fa-user-circle"></i> ${escapeHtml(user.username)}
                </div>
                <div class="user-card-meta">
                    Role: ${escapeHtml(user.role)} • Created: ${formatDate(user.createdAt)}
                </div>
            </div>
            <div class="user-card-actions">
                <button class="btn-icon" onclick="openEditUserModal('${escapeHtml(user.username)}', '${escapeHtml(user.role)}')" title="Edit user">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" onclick="deleteUser('${escapeHtml(user.username)}')" title="Delete user">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Open create user modal
 */
function openCreateUserModal() {
    const modal = document.getElementById('userEditorModal');
    const title = document.getElementById('userEditorTitle');
    const form = document.getElementById('userEditorForm');
    const error = document.getElementById('userEditorError');

    if (!modal || !title || !form) return;

    title.textContent = 'Create User';
    form.reset();
    document.getElementById('editUsername').value = '';
    document.getElementById('editorUsername').disabled = false;
    document.getElementById('editorPassword').required = true;
    error.style.display = 'none';

    modal.style.display = 'flex';
}

/**
 * Open edit user modal
 */
function openEditUserModal(username, role) {
    const modal = document.getElementById('userEditorModal');
    const title = document.getElementById('userEditorTitle');
    const form = document.getElementById('userEditorForm');
    const error = document.getElementById('userEditorError');

    if (!modal || !title || !form) return;

    title.textContent = 'Edit User';
    form.reset();
    document.getElementById('editUsername').value = username;
    document.getElementById('editorUsername').value = username;
    document.getElementById('editorUsername').disabled = true;
    document.getElementById('editorRole').value = role;
    document.getElementById('editorPassword').required = false;
    error.style.display = 'none';

    modal.style.display = 'flex';
}

/**
 * Handle save user (create or edit)
 */
async function handleSaveUser() {
    const editUsername = document.getElementById('editUsername').value;
    const username = document.getElementById('editorUsername').value;
    const password = document.getElementById('editorPassword').value;
    const role = document.getElementById('editorRole').value;
    const error = document.getElementById('userEditorError');
    const errorText = document.getElementById('userEditorErrorText');
    const saveBtn = document.getElementById('saveUserBtn');

    if (!username) {
        errorText.textContent = 'Username is required';
        error.style.display = 'flex';
        return;
    }

    if (!editUsername && !password) {
        errorText.textContent = 'Password is required for new users';
        error.style.display = 'flex';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    error.style.display = 'none';

    try {
        const token = localStorage.getItem('authToken');
        const isEdit = !!editUsername;
        const url = isEdit ? `/api/users/${editUsername}` : '/api/users';
        const method = isEdit ? 'PUT' : 'POST';
        const body = { username, role };

        if (password) {
            body.password = password;
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('userEditorModal');
            loadAuthenticationTab();
        } else {
            errorText.textContent = data.error || 'Failed to save user';
            error.style.display = 'flex';
        }
    } catch (error) {
        console.error('Save user error:', error);
        errorText.textContent = 'Connection error. Please try again.';
        error.style.display = 'flex';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save User';
    }
}

/**
 * Delete user with confirmation
 */
async function deleteUser(username) {
    const confirmed = await showConfirmation(
        'Delete User',
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/users/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadAuthenticationTab();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        alert('Connection error. Please try again.');
    }
}

// ==================== ANALYTICS TAB ====================
/**
 * Load the analytics tab with dashboard
 */
let analyticsChart = null; // Store chart instance
let analyticsData = null;   // Store analytics data
let currentTimeRange = '7d'; // Default time range

async function loadAnalyticsTab() {
    const container = document.getElementById('analyticsContainer');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Loading analytics...</p></div>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/analytics', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            analyticsData = await response.json();
            renderAnalyticsDashboard(analyticsData);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Error Loading Analytics</h3><p>Could not load analytics data.</p></div>';
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Connection Error</h3><p>Could not connect to server.</p></div>';
    }
}

/**
 * Render the analytics dashboard
 */
function renderAnalyticsDashboard(data) {
    const container = document.getElementById('analyticsContainer');
    if (!container) return;

    const currentMonth = data.currentMonth || {};
    const allTime = data.allTime || {};

    const html = `
        <!-- Stats Boxes -->
        <div class="analytics-stats">
            <div class="stat-box">
                <i class="fas fa-eye stat-box-icon"></i>
                <div class="stat-box-label">Total Visitors</div>
                <div class="stat-box-value">${formatNumber(allTime.totalVisits || 0)}</div>
                <div class="stat-box-change">All time</div>
            </div>
            <div class="stat-box">
                <i class="fas fa-calendar-alt stat-box-icon"></i>
                <div class="stat-box-label">This Month</div>
                <div class="stat-box-value">${formatNumber(currentMonth.totalVisits || 0)}</div>
                <div class="stat-box-change">${currentMonth.key || ''}</div>
            </div>
        </div>

        <!-- Chart Container -->
        <div class="analytics-chart-container">
            <div class="analytics-chart-header">
                <h2 class="analytics-chart-title">Visitor Trends</h2>
                <div class="time-range-selector">
                    <button class="time-range-btn ${currentTimeRange === '7d' ? 'active' : ''}" data-range="7d">7 Days</button>
                    <button class="time-range-btn ${currentTimeRange === '30d' ? 'active' : ''}" data-range="30d">30 Days</button>
                    <button class="time-range-btn ${currentTimeRange === '3m' ? 'active' : ''}" data-range="3m">3 Months</button>
                    <button class="time-range-btn ${currentTimeRange === 'all' ? 'active' : ''}" data-range="all">All Time</button>
                </div>
            </div>
            <canvas id="analyticsChart" class="analytics-chart-canvas"></canvas>
        </div>

        <!-- Popular Pages -->
        <div class="analytics-popular">
            <h2 class="analytics-popular-header">Popular Pages</h2>
            <div class="popular-pages-list" id="popularPagesList">
                ${renderPopularPages(data.topMarkdownFiles || [])}
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Initialize chart
    renderAnalyticsChart(data);

    // Add time range selector listeners
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const range = e.target.dataset.range;
            changeTimeRange(range);
        });
    });
}

/**
 * Render popular pages list
 */
function renderPopularPages(topFiles) {
    if (!topFiles || topFiles.length === 0) {
        return '<div class="empty-state" style="padding: var(--spacing-xl);"><p>No data available yet</p></div>';
    }

    const maxVisits = Math.max(...topFiles.map(f => f.visits));

    return topFiles.slice(0, 10).map((file, index) => {
        const percentage = maxVisits > 0 ? (file.visits / maxVisits) * 100 : 0;
        const pathParts = file.path.split('/').filter(p => p);
        const displayPath = pathParts.slice(2).join(' / ') || file.path; // Remove /docs/product

        return `
            <div class="popular-page-item">
                <div class="popular-page-rank">${index + 1}</div>
                <div class="popular-page-info">
                    <div class="popular-page-path" title="${escapeHtml(file.path)}">${escapeHtml(displayPath)}</div>
                    <div class="popular-page-views">${formatNumber(file.visits)} views</div>
                </div>
                <div class="popular-page-bar">
                    <div class="popular-page-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render analytics chart
 */
function renderAnalyticsChart(data) {
    const canvas = document.getElementById('analyticsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if exists
    if (analyticsChart) {
        analyticsChart.destroy();
    }

    const chartData = prepareChartData(data, currentTimeRange);

    // Get theme colors
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#e4e4e7' : '#18181b';
    const gridColor = isDark ? 'rgba(228, 228, 231, 0.1)' : 'rgba(24, 24, 27, 0.1)';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

    analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Visits',
                data: chartData.values,
                borderColor: accentColor,
                backgroundColor: `${accentColor}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: accentColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#27272a' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Visits: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

/**
 * Prepare chart data based on time range
 */
function prepareChartData(data, range) {
    const months = data.months || {};
    const monthKeys = Object.keys(months).sort();

    if (!monthKeys.length) {
        return { labels: ['No data'], values: [0] };
    }

    let filteredMonths = monthKeys;
    const now = new Date();

    switch (range) {
        case '7d':
            // Last 7 days - use daily data if available, otherwise show last month
            return prepareDailyData(data, 7);
        case '30d':
            // Last 30 days
            return prepareDailyData(data, 30);
        case '3m':
            // Last 3 months
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            filteredMonths = monthKeys.filter(key => {
                const [year, month] = key.split('-').map(Number);
                const monthDate = new Date(year, month - 1, 1);
                return monthDate >= threeMonthsAgo;
            });
            break;
        case 'all':
            // All time
            filteredMonths = monthKeys;
            break;
    }

    const labels = filteredMonths.map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    const values = filteredMonths.map(key => months[key].totalVisits || 0);

    return { labels, values };
}

/**
 * Prepare daily data (simulated from monthly for now)
 * In future, this could be enhanced to track daily visits
 */
function prepareDailyData(data, days) {
    const labels = [];
    const values = [];
    const now = new Date();

    // For now, distribute monthly data across days
    // This is a simplified version - ideally you'd track daily data
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = data.months?.[currentMonthKey];
    const totalVisits = currentMonthData?.totalVisits || 0;
    const avgPerDay = Math.floor(totalVisits / now.getDate());

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        // Simulate daily visits with some variation
        const variation = Math.random() * 0.4 + 0.8; // 80% to 120%
        values.push(Math.floor(avgPerDay * variation));
    }

    return { labels, values };
}

/**
 * Change time range and update chart
 */
function changeTimeRange(range) {
    currentTimeRange = range;

    // Update active button
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.range === range);
    });

    // Re-render chart with new data
    if (analyticsData) {
        renderAnalyticsChart(analyticsData);
    }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ==================== SETTINGS TAB ====================
/**
 * Load the settings tab with config editor
 */
async function loadSettingsTab() {
    const container = document.getElementById('settingsConfigContainer');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Loading settings...</p></div>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/config/docs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const config = await response.json();
            renderSettingsConfig(config);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Error Loading Settings</h3><p>Could not load configuration.</p></div>';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><h3>Connection Error</h3><p>Could not connect to server.</p></div>';
    }
}

/**
 * Render the settings configuration editor
 * Dynamically creates form elements based on config structure
 */
function renderSettingsConfig(config) {
    const container = document.getElementById('settingsConfigContainer');
    if (!container) return;

    let html = '<div class="settings-group">';

    // General Settings
    if (config.general) {
        html += '<div class="settings-section">';
        html += '<h2 class="settings-section-title">General Settings</h2>';

        // Default product
        if (config.general.defaultProduct !== undefined) {
            html += `
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Default Product</h3>
                            <p>The default product to display in documentation</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <select id="setting-defaultProduct" class="setting-input" data-path="general.defaultProduct">
                            ${config.products ? config.products.map(p => `
                                <option value="${p.id}" ${p.id === config.general.defaultProduct ? 'selected' : ''}>${p.name}</option>
                            `).join('') : ''}
                        </select>
                    </div>
                </div>
            `;
        }

        // Sidebar settings
        if (config.general.sidebarRightHeaders) {
            html += `
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Main Section Headers</h3>
                            <p>Show main section headers in right sidebar</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="general.sidebarRightHeaders.mainSectionHeader" ${config.general.sidebarRightHeaders.mainSectionHeader ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Sub Section Headers</h3>
                            <p>Show sub section headers in right sidebar</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="general.sidebarRightHeaders.subSectionHeader" ${config.general.sidebarRightHeaders.subSectionHeader ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Sub-Sub Section Headers</h3>
                            <p>Show sub-sub section headers in right sidebar</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="general.sidebarRightHeaders.subSubSectionHeader" ${config.general.sidebarRightHeaders.subSubSectionHeader ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            `;
        }

        html += '</div>';
    }

    // Error Pages Settings
    if (config.errorPages && config.errorPages['404']) {
        html += '<div class="settings-section">';
        html += '<h2 class="settings-section-title">404 Error Page</h2>';

        const errorConfig = config.errorPages['404'];

        if (errorConfig.redirect) {
            html += `
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Enable Redirect Features</h3>
                            <p>Show quick links and search on 404 page</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="errorPages.404.redirect.enabled" ${errorConfig.redirect.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Show Quick Links</h3>
                            <p>Display quick navigation links on 404 page</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="errorPages.404.redirect.showQuickLinks" ${errorConfig.redirect.showQuickLinks ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-header">
                        <div class="setting-info">
                            <h3>Show Search Bar</h3>
                            <p>Display search bar on 404 page</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="setting-input" data-path="errorPages.404.redirect.showSearchBar" ${errorConfig.redirect.showSearchBar ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            `;
        }

        html += '</div>';
    }

    html += '</div>';

    // Add save button
    html += '<div class="action-bar"><button class="btn btn-primary" id="saveConfigBtn"><i class="fas fa-save"></i> Save Settings</button></div>';

    container.innerHTML = html;

    // Add save button listener
    const saveBtn = document.getElementById('saveConfigBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveSettingsConfig(config));
    }
}

/**
 * Save settings configuration
 */
async function saveSettingsConfig(config) {
    const saveBtn = document.getElementById('saveConfigBtn');
    if (!saveBtn) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    // Collect all changed values
    const inputs = document.querySelectorAll('.setting-input');
    const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone

    inputs.forEach(input => {
        const path = input.dataset.path;
        if (!path) return;

        const value = input.type === 'checkbox' ? input.checked : input.value;
        setNestedValue(newConfig, path, value);
    });

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/config/docs', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newConfig)
        });

        if (response.ok) {
            // Show success feedback
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
            }, 2000);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to save settings');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
        }
    } catch (error) {
        console.error('Save settings error:', error);
        alert('Connection error. Please try again.');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
    }
}

// ==================== EDITOR TAB ====================
/**
 * Editor state
 */
let editorState = {
    currentProduct: 'quantom',
    currentFile: null,
    originalContent: '',
    isDirty: false,
    fileTree: null
};

/**
 * Load the editor tab
 */
async function loadEditorTab() {
    // Initialize product selector
    const productSelector = document.getElementById('productSelector');
    if (productSelector) {
        productSelector.addEventListener('change', (e) => {
            editorState.currentProduct = e.target.value;
            loadFileTree();
        });
    }

    // Initialize toolbar buttons
    document.getElementById('createMarkdownBtn')?.addEventListener('click', () => openCreateItemModal('file'));
    document.getElementById('createFolderBtn')?.addEventListener('click', () => openCreateItemModal('folder'));
    document.getElementById('publishBtn')?.addEventListener('click', saveCurrentFile);
    document.getElementById('saveItemBtn')?.addEventListener('click', handleCreateItem);
    document.getElementById('saveRenameBtn')?.addEventListener('click', handleRename);

    // Context menu
    document.addEventListener('click', () => hideContextMenu());

    // Load file tree
    await loadFileTree();

    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (editorState.isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

/**
 * Load file tree from API
 */
async function loadFileTree() {
    const fileTree = document.getElementById('fileTree');
    if (!fileTree) return;

    fileTree.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Loading files...</p></div>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}/tree`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            editorState.fileTree = data.tree;
            renderFileTree(data.tree);
        } else {
            fileTree.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><p>Failed to load files</p></div>';
        }
    } catch (error) {
        console.error('Load file tree error:', error);
        fileTree.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><p>Connection error</p></div>';
    }
}

/**
 * Render file tree
 */
function renderFileTree(tree, container = null) {
    const fileTreeEl = container || document.getElementById('fileTree');
    if (!fileTreeEl) return;

    if (!container) {
        fileTreeEl.innerHTML = '';
    }

    tree.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'tree-item-wrapper';

        const treeItem = document.createElement('div');
        treeItem.className = 'tree-item';
        treeItem.dataset.path = item.path;
        treeItem.dataset.type = item.type;
        treeItem.draggable = true;

        // Toggle for folders
        if (item.type === 'folder') {
            const toggle = document.createElement('div');
            toggle.className = 'tree-item-toggle';
            toggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFolder(treeItem);
            });
            treeItem.appendChild(toggle);
        } else {
            const spacer = document.createElement('div');
            spacer.style.width = '20px';
            treeItem.appendChild(spacer);
        }

        // Icon
        const icon = document.createElement('div');
        icon.className = `tree-item-icon ${item.type}`;
        icon.innerHTML = item.type === 'folder'
            ? '<i class="fas fa-folder"></i>'
            : getFileIcon(item.extension);
        treeItem.appendChild(icon);

        // Name
        const name = document.createElement('div');
        name.className = 'tree-item-name';
        name.textContent = item.name;
        name.title = item.path;
        treeItem.appendChild(name);

        // Click handler
        treeItem.addEventListener('click', () => handleFileClick(item));

        // Context menu
        treeItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, item);
        });

        // Drag and drop
        treeItem.addEventListener('dragstart', (e) => handleDragStart(e, item));
        treeItem.addEventListener('dragover', (e) => handleDragOver(e, item));
        treeItem.addEventListener('dragleave', (e) => handleDragLeave(e));
        treeItem.addEventListener('drop', (e) => handleDrop(e, item));

        itemEl.appendChild(treeItem);

        // Children container for folders
        if (item.type === 'folder' && item.children) {
            const childrenEl = document.createElement('div');
            childrenEl.className = 'tree-children';
            renderFileTree(item.children, childrenEl);
            itemEl.appendChild(childrenEl);
        }

        fileTreeEl.appendChild(itemEl);
    });
}

/**
 * Get icon for file type
 */
function getFileIcon(extension) {
    const icons = {
        '.md': '<i class="fas fa-file-alt"></i>',
        '.png': '<i class="fas fa-file-image"></i>',
        '.jpg': '<i class="fas fa-file-image"></i>',
        '.jpeg': '<i class="fas fa-file-image"></i>',
        '.gif': '<i class="fas fa-file-image"></i>',
        '.svg': '<i class="fas fa-file-image"></i>',
        '.json': '<i class="fas fa-file-code"></i>',
        '.js': '<i class="fas fa-file-code"></i>',
        '.css': '<i class="fas fa-file-code"></i>',
        '.html': '<i class="fas fa-file-code"></i>'
    };
    return icons[extension] || '<i class="fas fa-file"></i>';
}

/**
 * Toggle folder expand/collapse
 */
function toggleFolder(treeItem) {
    const isExpanded = treeItem.classList.toggle('expanded');
}

/**
 * Handle file click
 */
async function handleFileClick(item) {
    if (item.type === 'folder') {
        const treeItem = document.querySelector(`.tree-item[data-path="${item.path}"]`);
        if (treeItem) {
            toggleFolder(treeItem);
        }
        return;
    }

    // Check for unsaved changes
    if (editorState.isDirty) {
        const confirmed = await showConfirmation(
            'Unsaved Changes',
            'You have unsaved changes. Do you want to save before opening another file?'
        );
        if (confirmed) {
            await saveCurrentFile();
        }
    }

    // Load file content
    await loadFile(item);
}

/**
 * Load file content
 */
async function loadFile(item) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}/content?filePath=${encodeURIComponent(item.path)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            editorState.currentFile = item;
            editorState.originalContent = data.content;
            editorState.isDirty = false;

            // Update UI
            updateSelectedFile(item.path);
            showFileInEditor(item, data.content);
            updateToolbar(item);
        } else {
            alert('Failed to load file');
        }
    } catch (error) {
        console.error('Load file error:', error);
        alert('Error loading file');
    }
}

/**
 * Update selected file in tree
 */
function updateSelectedFile(path) {
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
    const selectedItem = document.querySelector(`.tree-item[data-path="${path}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
}

/**
 * Show file in editor
 */
function showFileInEditor(item, content) {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea) return;

    // Show toolbar
    const toolbar = document.getElementById('editorToolbar');
    if (toolbar) toolbar.style.display = 'flex';

    if (item.extension === '.md' || item.extension === '.txt' || item.extension === '.json' || item.extension === '.js' || item.extension === '.css' || item.extension === '.html') {
        // Show code editor
        editorArea.innerHTML = `
            <div class="code-editor">
                <div class="line-numbers" id="lineNumbers"></div>
                <div class="code-content">
                    <textarea class="code-textarea" id="codeTextarea" spellcheck="false"></textarea>
                </div>
            </div>
        `;

        const textarea = document.getElementById('codeTextarea');
        if (textarea) {
            textarea.value = content;
            textarea.addEventListener('input', () => {
                editorState.isDirty = true;
                updateLineNumbers();
                updatePublishButton();
            });
            textarea.addEventListener('scroll', syncScroll);
            updateLineNumbers();
        }
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(item.extension)) {
        // Show image preview
        const imagePath = `/docs/content/${editorState.currentProduct}/${item.path}`;
        editorArea.innerHTML = `
            <div class="file-preview">
                <img src="${imagePath}" alt="${item.name}">
            </div>
        `;
    } else {
        // Unsupported file type
        editorArea.innerHTML = `
            <div class="file-preview">
                <div class="unsupported-file">
                    <i class="fas fa-file"></i>
                    <p>This file type cannot be edited</p>
                    <small>${item.name}</small>
                </div>
            </div>
        `;
    }
}

/**
 * Update line numbers
 */
function updateLineNumbers() {
    const textarea = document.getElementById('codeTextarea');
    const lineNumbers = document.getElementById('lineNumbers');
    if (!textarea || !lineNumbers) return;

    const lines = textarea.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
}

/**
 * Sync scroll between line numbers and textarea
 */
function syncScroll() {
    const textarea = document.getElementById('codeTextarea');
    const lineNumbers = document.getElementById('lineNumbers');
    if (textarea && lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }
}

/**
 * Update toolbar
 */
function updateToolbar(item) {
    const filePathEl = document.getElementById('editorFilePath');
    if (filePathEl) {
        filePathEl.textContent = item.path;
    }
    updatePublishButton();
}

/**
 * Update publish button state
 */
function updatePublishButton() {
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.disabled = !editorState.isDirty;
    }
}

/**
 * Save current file
 */
async function saveCurrentFile() {
    if (!editorState.currentFile || !editorState.isDirty) return;

    const textarea = document.getElementById('codeTextarea');
    if (!textarea) return;

    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Saving...</span>';
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filePath: editorState.currentFile.path,
                content: textarea.value
            })
        });

        if (response.ok) {
            editorState.originalContent = textarea.value;
            editorState.isDirty = false;
            updatePublishButton();

            // Show success feedback
            if (publishBtn) {
                publishBtn.innerHTML = '<i class="fas fa-check"></i> <span>Saved!</span>';
                setTimeout(() => {
                    publishBtn.innerHTML = '<i class="fas fa-save"></i> <span>Publish</span>';
                }, 2000);
            }
        } else {
            alert('Failed to save file');
            if (publishBtn) {
                publishBtn.disabled = false;
                publishBtn.innerHTML = '<i class="fas fa-save"></i> <span>Publish</span>';
            }
        }
    } catch (error) {
        console.error('Save file error:', error);
        alert('Error saving file');
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.innerHTML = '<i class="fas fa-save"></i> <span>Publish</span>';
        }
    }
}

/**
 * Open create item modal
 */
function openCreateItemModal(type, folderPath = '') {
    const modal = document.getElementById('createItemModal');
    const title = document.getElementById('createItemTitle');
    const form = document.getElementById('createItemForm');
    const nameInput = document.getElementById('createItemName');
    const hint = document.getElementById('createItemHint');
    const error = document.getElementById('createItemError');

    if (!modal || !title || !form || !nameInput || !hint) return;

    title.textContent = type === 'folder' ? 'Create Folder' : 'Create Markdown File';
    document.getElementById('createItemType').value = type;
    document.getElementById('createItemFolder').value = folderPath;

    if (type === 'folder') {
        hint.textContent = 'Enter the folder name (e.g., 06-Development)';
        nameInput.placeholder = 'Enter folder name';
    } else {
        hint.textContent = 'Enter the file name with .md extension (e.g., Installation.md)';
        nameInput.placeholder = 'Enter file name';
    }

    form.reset();
    error.style.display = 'none';
    modal.style.display = 'flex';
    nameInput.focus();
}

/**
 * Handle create item
 */
async function handleCreateItem() {
    const type = document.getElementById('createItemType').value;
    const folderPath = document.getElementById('createItemFolder').value;
    const name = document.getElementById('createItemName').value.trim();
    const error = document.getElementById('createItemError');
    const errorText = document.getElementById('createItemErrorText');
    const saveBtn = document.getElementById('saveItemBtn');

    if (!name) {
        errorText.textContent = 'Name is required';
        error.style.display = 'flex';
        return;
    }

    // Validate file extension for files
    if (type === 'file' && !name.endsWith('.md')) {
        errorText.textContent = 'File name must end with .md';
        error.style.display = 'flex';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    error.style.display = 'none';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type,
                folderPath,
                name,
                content: type === 'file' ? '# ' + name.replace('.md', '') + '\n\nYour content here...' : undefined
            })
        });

        if (response.ok) {
            closeModal('createItemModal');
            await loadFileTree();
        } else {
            const data = await response.json();
            errorText.textContent = data.error || 'Failed to create';
            error.style.display = 'flex';
        }
    } catch (error) {
        console.error('Create item error:', error);
        errorText.textContent = 'Connection error';
        error.style.display = 'flex';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Create';
    }
}

/**
 * Show context menu
 */
function showContextMenu(event, item) {
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) return;

    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    // Store item data
    contextMenu.dataset.path = item.path;
    contextMenu.dataset.type = item.type;

    // Add click handlers
    const items = contextMenu.querySelectorAll('.context-menu-item');
    items.forEach(menuItem => {
        menuItem.onclick = () => handleContextMenuAction(menuItem.dataset.action, item);
    });
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

/**
 * Handle context menu action
 */
async function handleContextMenuAction(action, item) {
    hideContextMenu();

    switch (action) {
        case 'rename':
            openRenameModal(item);
            break;
        case 'delete':
            await handleDelete(item);
            break;
    }
}

/**
 * Open rename modal
 */
function openRenameModal(item) {
    const modal = document.getElementById('renameModal');
    const form = document.getElementById('renameForm');
    const nameInput = document.getElementById('renameNewName');
    const error = document.getElementById('renameError');

    if (!modal || !form || !nameInput) return;

    document.getElementById('renameOldPath').value = item.path;
    nameInput.value = item.name;
    error.style.display = 'none';
    modal.style.display = 'flex';
    nameInput.focus();
    nameInput.select();
}

/**
 * Handle rename
 */
async function handleRename() {
    const oldPath = document.getElementById('renameOldPath').value;
    const newName = document.getElementById('renameNewName').value.trim();
    const error = document.getElementById('renameError');
    const errorText = document.getElementById('renameErrorText');
    const saveBtn = document.getElementById('saveRenameBtn');

    if (!newName) {
        errorText.textContent = 'Name is required';
        error.style.display = 'flex';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Renaming...';
    error.style.display = 'none';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}/rename`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                oldPath,
                newName
            })
        });

        if (response.ok) {
            closeModal('renameModal');
            await loadFileTree();

            // Update current file if it was renamed
            if (editorState.currentFile && editorState.currentFile.path === oldPath) {
                const data = await response.json();
                editorState.currentFile.path = data.newPath;
                editorState.currentFile.name = newName;
                updateToolbar(editorState.currentFile);
            }
        } else {
            const data = await response.json();
            errorText.textContent = data.error || 'Failed to rename';
            error.style.display = 'flex';
        }
    } catch (error) {
        console.error('Rename error:', error);
        errorText.textContent = 'Connection error';
        error.style.display = 'flex';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Rename';
    }
}

/**
 * Handle delete
 */
async function handleDelete(item) {
    const confirmed = await showConfirmation(
        'Delete ' + (item.type === 'folder' ? 'Folder' : 'File'),
        `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}?filePath=${encodeURIComponent(item.path)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadFileTree();

            // Clear editor if deleted file was open
            if (editorState.currentFile && editorState.currentFile.path === item.path) {
                editorState.currentFile = null;
                editorState.isDirty = false;
                const editorArea = document.getElementById('editorArea');
                if (editorArea) {
                    editorArea.innerHTML = `
                        <div class="empty-editor-state">
                            <i class="fas fa-file-alt"></i>
                            <h3>No File Selected</h3>
                            <p>Select a file from the browser to start editing</p>
                        </div>
                    `;
                }
                const toolbar = document.getElementById('editorToolbar');
                if (toolbar) toolbar.style.display = 'none';
            }
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting item');
    }
}

/**
 * Drag and drop handlers
 */
let draggedItem = null;

function handleDragStart(e, item) {
    draggedItem = item;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e, item) {
    if (item.type === 'folder' && draggedItem && draggedItem.path !== item.path) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const treeItem = document.querySelector(`.tree-item[data-path="${item.path}"]`);
        if (treeItem) {
            treeItem.classList.add('drag-over');
        }
    }
}

function handleDragLeave(e) {
    const treeItem = e.currentTarget;
    if (treeItem) {
        treeItem.classList.remove('drag-over');
    }
}

async function handleDrop(e, targetItem) {
    e.preventDefault();
    const treeItem = document.querySelector(`.tree-item[data-path="${targetItem.path}"]`);
    if (treeItem) {
        treeItem.classList.remove('drag-over');
    }

    if (!draggedItem || draggedItem.path === targetItem.path || targetItem.type !== 'folder') return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/files/${editorState.currentProduct}/move`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sourcePath: draggedItem.path,
                targetPath: targetItem.path
            })
        });

        if (response.ok) {
            await loadFileTree();

            // Update current file path if it was moved
            if (editorState.currentFile && editorState.currentFile.path === draggedItem.path) {
                const data = await response.json();
                editorState.currentFile.path = data.newPath;
                updateToolbar(editorState.currentFile);
            }
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to move');
        }
    } catch (error) {
        console.error('Move error:', error);
        alert('Error moving item');
    }

    draggedItem = null;
}

// ==================== SLASH COMMAND SYSTEM ====================
/**
 * Command templates and definitions
 */
const SLASH_COMMANDS = [
    {
        command: '/callout',
        title: 'Callout',
        description: 'Insert a callout block (Note, Warning, Info, etc.)',
        icon: 'fa-info-circle',
        template: `<Note>\nYour note content here...\n</Note>`
    },
    {
        command: '/tabs',
        title: 'Tabs',
        description: 'Insert tabbed content',
        icon: 'fa-folder',
        template: `<Tabs>\n<Tab title="Tab 1" icon="code">\nContent for tab 1\n</Tab>\n<Tab title="Tab 2" icon="gear">\nContent for tab 2\n</Tab>\n</Tabs>`
    },
    {
        command: '/steps',
        title: 'Steps',
        description: 'Insert numbered progress steps',
        icon: 'fa-list-ol',
        template: `<Steps>\n<Step title="First Step">\nInstructions for step 1\n</Step>\n<Step title="Second Step" icon="check">\nInstructions for step 2\n</Step>\n</Steps>`
    },
    {
        command: '/accordion',
        title: 'Accordion',
        description: 'Insert collapsible accordion',
        icon: 'fa-chevron-down',
        template: `<Accordion title="FAQ Title" icon="question">\nYour answer content...\n</Accordion>`
    },
    {
        command: '/accordiongroup',
        title: 'Accordion Group',
        description: 'Insert multiple accordions',
        icon: 'fa-list',
        template: `<AccordionGroup>\n<Accordion title="Question 1">\nAnswer 1\n</Accordion>\n<Accordion title="Question 2">\nAnswer 2\n</Accordion>\n</AccordionGroup>`
    },
    {
        command: '/code',
        title: 'Code Group',
        description: 'Insert multi-language code examples',
        icon: 'fa-code',
        template: `<CodeGroup>\n\`\`\`javascript example.js\nconsole.log("Hello");\n\`\`\`\n\n\`\`\`python example.py\nprint("Hello")\n\`\`\`\n</CodeGroup>`
    },
    {
        command: '/columns',
        title: 'Columns',
        description: 'Insert multi-column card layout',
        icon: 'fa-columns',
        template: `<Columns cols={2}>\n<Card title="Card 1" icon="rocket">\nDescription\n</Card>\n<Card title="Card 2" icon="star">\nDescription\n</Card>\n</Columns>`
    },
    {
        command: '/frame',
        title: 'Frame',
        description: 'Insert image container with caption',
        icon: 'fa-image',
        template: `<Frame caption="Screenshot description">\n![Alt text](/path/to/image.png)\n</Frame>`
    },
    {
        command: '/expandable',
        title: 'Expandable',
        description: 'Insert collapsible section',
        icon: 'fa-expand',
        template: `<Expandable title="Advanced Options" defaultOpen=true>\nHidden content here...\n</Expandable>`
    },
    {
        command: '/field',
        title: 'Response Field',
        description: 'Insert API documentation field',
        icon: 'fa-database',
        template: `<ResponseField name="id" type="string" required>\nThe unique identifier\n</ResponseField>`
    },
    {
        command: '/h1',
        title: 'Heading 1',
        description: 'Insert level 1 heading',
        icon: 'fa-heading',
        template: `# Heading 1\n\n`
    },
    {
        command: '/h2',
        title: 'Heading 2',
        description: 'Insert level 2 heading',
        icon: 'fa-heading',
        template: `## Heading 2\n\n`
    },
    {
        command: '/h3',
        title: 'Heading 3',
        description: 'Insert level 3 heading',
        icon: 'fa-heading',
        template: `### Heading 3\n\n`
    },
    {
        command: '/list',
        title: 'Bullet List',
        description: 'Insert bullet list',
        icon: 'fa-list-ul',
        template: `- Item 1\n- Item 2\n- Item 3\n`
    },
    {
        command: '/ordered',
        title: 'Ordered List',
        description: 'Insert numbered list',
        icon: 'fa-list-ol',
        template: `1. First item\n2. Second item\n3. Third item\n`
    },
    {
        command: '/table',
        title: 'Table',
        description: 'Insert markdown table',
        icon: 'fa-table',
        template: `| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`
    },
    {
        command: '/image',
        title: 'Image',
        description: 'Insert image syntax',
        icon: 'fa-file-image',
        template: `![Alt text](/path/to/image.png)\n`
    }
];

let slashCommandState = {
    isOpen: false,
    selectedIndex: 0,
    filteredCommands: [...SLASH_COMMANDS],
    slashPosition: 0
};

/**
 * Initialize slash command system
 */
function initSlashCommands() {
    const textarea = document.getElementById('codeTextarea');
    if (!textarea) return;

    textarea.addEventListener('keydown', handleSlashCommandKeyDown);
    textarea.addEventListener('input', handleSlashCommandInput);

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#slashCommandPalette') && !e.target.closest('#codeTextarea')) {
            hideSlashCommandPalette();
        }
    });
}

/**
 * Handle keydown events for slash commands
 */
function handleSlashCommandKeyDown(e) {
    if (!slashCommandState.isOpen) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            slashCommandState.selectedIndex = Math.min(
                slashCommandState.selectedIndex + 1,
                slashCommandState.filteredCommands.length - 1
            );
            updateSlashCommandSelection();
            break;
        case 'ArrowUp':
            e.preventDefault();
            slashCommandState.selectedIndex = Math.max(slashCommandState.selectedIndex - 1, 0);
            updateSlashCommandSelection();
            break;
        case 'Enter':
            e.preventDefault();
            insertSlashCommand(slashCommandState.filteredCommands[slashCommandState.selectedIndex]);
            break;
        case 'Escape':
            e.preventDefault();
            hideSlashCommandPalette();
            break;
    }
}

/**
 * Handle input events for slash command detection
 */
function handleSlashCommandInput(e) {
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;

    // Find the last slash before cursor
    let slashPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
        if (text[i] === '/') {
            // Check if it's at start of line or after whitespace
            if (i === 0 || text[i-1] === '\n' || text[i-1] === ' ') {
                slashPos = i;
                break;
            }
        }
        if (text[i] === '\n' || text[i] === ' ') break;
    }

    if (slashPos !== -1) {
        const query = text.substring(slashPos, cursorPos);
        if (query.startsWith('/')) {
            slashCommandState.slashPosition = slashPos;
            showSlashCommandPalette(textarea, slashPos, query);
        }
    } else {
        hideSlashCommandPalette();
    }
}

/**
 * Show slash command palette
 */
function showSlashCommandPalette(textarea, slashPos, query) {
    const palette = document.getElementById('slashCommandPalette');
    const commandList = document.getElementById('commandList');
    const filter = document.getElementById('commandFilter');

    if (!palette || !commandList) return;

    // Filter commands
    const filterText = query.substring(1).toLowerCase();
    slashCommandState.filteredCommands = SLASH_COMMANDS.filter(cmd =>
        cmd.command.toLowerCase().includes(filterText) ||
        cmd.title.toLowerCase().includes(filterText) ||
        cmd.description.toLowerCase().includes(filterText)
    );

    if (slashCommandState.filteredCommands.length === 0) {
        hideSlashCommandPalette();
        return;
    }

    // Reset selection
    slashCommandState.selectedIndex = 0;

    // Render commands
    commandList.innerHTML = slashCommandState.filteredCommands.map((cmd, index) => `
        <div class="command-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
            <i class="fas ${cmd.icon}"></i>
            <div class="command-item-content">
                <div class="command-item-title">${cmd.title}</div>
                <div class="command-item-desc">${cmd.description}</div>
            </div>
            <div class="command-item-shortcut">${cmd.command}</div>
        </div>
    `).join('');

    // Add click handlers
    commandList.querySelectorAll('.command-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            insertSlashCommand(slashCommandState.filteredCommands[index]);
        });
    });

    // Position palette near cursor
    const rect = textarea.getBoundingClientRect();
    const lines = textarea.value.substring(0, slashPos).split('\n');
    const line = lines.length;
    const lineHeight = 22.4; // Match with line-numbers height
    const topOffset = line * lineHeight;

    palette.style.display = 'flex';
    palette.style.left = `${rect.left + 300}px`; // Position to the right of file browser
    palette.style.top = `${rect.top + Math.min(topOffset, rect.height - 200)}px`;

    filter.value = filterText;
    slashCommandState.isOpen = true;
}

/**
 * Hide slash command palette
 */
function hideSlashCommandPalette() {
    const palette = document.getElementById('slashCommandPalette');
    if (palette) {
        palette.style.display = 'none';
    }
    slashCommandState.isOpen = false;
}

/**
 * Update selected command in palette
 */
function updateSlashCommandSelection() {
    const items = document.querySelectorAll('.command-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === slashCommandState.selectedIndex);
    });
    // Scroll into view
    const selected = items[slashCommandState.selectedIndex];
    if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Insert selected slash command template
 */
function insertSlashCommand(command) {
    const textarea = document.getElementById('codeTextarea');
    if (!textarea || !command) return;

    const cursorPos = textarea.selectionStart;
    const text = textarea.value;

    // Replace /command with template
    const before = text.substring(0, slashCommandState.slashPosition);
    const after = text.substring(cursorPos);
    const newText = before + command.template + after;

    textarea.value = newText;

    // Position cursor at end of template
    const newCursorPos = before.length + command.template.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Mark as dirty
    editorState.isDirty = true;
    updateLineNumbers();
    updatePublishButton();

    hideSlashCommandPalette();
    textarea.focus();
}

// ==================== EDITOR MODE SWITCHING ====================
let editorMode = 'raw'; // 'raw' or 'visual'
let previewUpdateTimeout = null;

/**
 * Initialize editor mode toggle
 */
function initEditorMode() {
    const rawBtn = document.getElementById('rawModeBtn');
    const visualBtn = document.getElementById('visualModeBtn');

    if (!rawBtn || !visualBtn) return;

    rawBtn.addEventListener('click', () => switchEditorMode('raw'));
    visualBtn.addEventListener('click', () => switchEditorMode('visual'));

    // Load saved preference
    const savedMode = localStorage.getItem('editorMode') || 'raw';
    if (savedMode === 'visual') {
        switchEditorMode('visual');
    }
}

/**
 * Switch editor mode between raw and visual
 */
function switchEditorMode(mode) {
    if (!editorState.currentFile || editorState.currentFile.extension !== '.md') {
        // Only markdown files support visual mode
        if (mode === 'visual') {
            alert('Visual mode is only available for markdown files');
            return;
        }
    }

    editorMode = mode;
    localStorage.setItem('editorMode', mode);

    const rawBtn = document.getElementById('rawModeBtn');
    const visualBtn = document.getElementById('visualModeBtn');
    const editorArea = document.getElementById('editorArea');

    rawBtn.classList.toggle('active', mode === 'raw');
    visualBtn.classList.toggle('active', mode === 'visual');

    if (mode === 'visual') {
        showVisualPreview();
    } else {
        showRawEditor();
    }
}

/**
 * Show visual preview mode
 */
function showVisualPreview() {
    const editorArea = document.getElementById('editorArea');
    const textarea = document.getElementById('codeTextarea');

    if (!editorArea || !textarea) return;

    // Create preview container
    editorArea.innerHTML = `
        <div class="editor-preview markdown-body" id="editorPreview">
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Rendering preview...</p>
            </div>
        </div>
    `;

    // Render preview
    renderPreview(textarea.value);
}

/**
 * Show raw editor mode
 */
function showRawEditor() {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea || !editorState.currentFile) return;

    const content = editorState.isDirty
        ? document.getElementById('editorPreview')?.dataset.rawContent || editorState.originalContent
        : editorState.originalContent;

    editorArea.innerHTML = `
        <div class="code-editor">
            <div class="line-numbers" id="lineNumbers"></div>
            <div class="code-content">
                <textarea class="code-textarea" id="codeTextarea" spellcheck="false"></textarea>
            </div>
        </div>
    `;

    const textarea = document.getElementById('codeTextarea');
    if (textarea) {
        textarea.value = content;
        textarea.addEventListener('input', () => {
            editorState.isDirty = true;
            updateLineNumbers();
            updatePublishButton();
        });
        textarea.addEventListener('scroll', syncScroll);
        updateLineNumbers();

        // Re-initialize slash commands and file upload
        initSlashCommands();
        initFileUpload();
    }
}

/**
 * Render markdown preview
 */
function renderPreview(markdown) {
    const preview = document.getElementById('editorPreview');
    if (!preview) return;

    try {
        // Configure marked with extensions
        if (window.markedExtensions) {
            marked.use({
                extensions: window.markedExtensions.extensions,
                renderer: window.markedExtensions.renderer
            });
        }

        const html = marked.parse(markdown);
        preview.innerHTML = html;
        preview.dataset.rawContent = markdown; // Store for switching back

        // Initialize component interactions using component-orchestrator
        // Wait a short time for DOM to be fully updated
        setTimeout(() => {
            if (typeof initializeComponentScripts === 'function') {
                initializeComponentScripts();
            }
        }, 50);
    } catch (error) {
        console.error('Preview render error:', error);
        preview.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle empty-icon"></i>
                <h3>Preview Error</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

/**
 * Debounced preview update
 */
function updatePreviewDebounced(markdown) {
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
    }

    previewUpdateTimeout = setTimeout(() => {
        renderPreview(markdown);
    }, 300);
}

// ==================== FILE UPLOAD ====================
/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    const textarea = document.getElementById('codeTextarea');
    if (!textarea) return;

    // Drag and drop
    textarea.addEventListener('dragover', handleDragOverUpload);
    textarea.addEventListener('dragleave', handleDragLeaveUpload);
    textarea.addEventListener('drop', handleDropUpload);

    // Paste
    textarea.addEventListener('paste', handlePasteUpload);
}

/**
 * Handle drag over for file upload
 */
function handleDragOverUpload(e) {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging files
    if (e.dataTransfer.types.includes('Files')) {
        const editorArea = document.getElementById('editorArea');
        if (!document.getElementById('dragDropOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'dragDropOverlay';
            overlay.className = 'drag-drop-overlay';
            overlay.innerHTML = `
                <div class="drag-drop-overlay-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drop images here to upload</p>
                </div>
            `;
            editorArea.appendChild(overlay);
        }
    }
}

/**
 * Handle drag leave for file upload
 */
function handleDragLeaveUpload(e) {
    e.preventDefault();
    const overlay = document.getElementById('dragDropOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Handle drop for file upload
 */
async function handleDropUpload(e) {
    e.preventDefault();
    e.stopPropagation();

    const overlay = document.getElementById('dragDropOverlay');
    if (overlay) {
        overlay.remove();
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        alert('Please drop image files only');
        return;
    }

    for (const file of imageFiles) {
        await uploadFile(file);
    }
}

/**
 * Handle paste for file upload
 */
async function handlePasteUpload(e) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length === 0) return;

    e.preventDefault();

    for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
            await uploadFile(file);
        }
    }
}

/**
 * Upload file to server
 */
async function uploadFile(file) {
    // Validate file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please use PNG, JPG, GIF, or SVG.`);
        return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File size exceeds 5MB limit');
        return;
    }

    const progressEl = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (!progressEl) return;

    try {
        progressEl.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Uploading: 0%';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('product', editorState.currentProduct);

        const token = localStorage.getItem('authToken');
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = `${percent}%`;
                progressText.textContent = `Uploading: ${percent}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                insertImageMarkdown(response.path, file.name);

                progressText.textContent = 'Upload complete!';
                setTimeout(() => {
                    progressEl.style.display = 'none';
                }, 2000);
            } else {
                const error = JSON.parse(xhr.responseText);
                alert(`Upload failed: ${error.error || 'Unknown error'}`);
                progressEl.style.display = 'none';
            }
        });

        xhr.addEventListener('error', () => {
            alert('Upload failed: Network error');
            progressEl.style.display = 'none';
        });

        xhr.open('POST', `/api/files/${editorState.currentProduct}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);

    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        progressEl.style.display = 'none';
    }
}

/**
 * Insert image markdown syntax at cursor
 */
function insertImageMarkdown(path, alt) {
    const textarea = document.getElementById('codeTextarea');
    if (!textarea) return;

    const markdown = `![${alt}](${path})`;
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;

    const newText = text.substring(0, cursorPos) + markdown + text.substring(cursorPos);
    textarea.value = newText;

    const newCursorPos = cursorPos + markdown.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    editorState.isDirty = true;
    updateLineNumbers();
    updatePublishButton();
    textarea.focus();
}

// ==================== MODIFY EXISTING FUNCTIONS ====================
/**
 * Override showFileInEditor to initialize new features
 */
const originalShowFileInEditor = showFileInEditor;
showFileInEditor = function(item, content) {
    originalShowFileInEditor(item, content);

    // Initialize slash commands and file upload for markdown files
    if (item.extension === '.md') {
        initSlashCommands();
        initFileUpload();
        initEditorMode();
    }
};

// ==================== CHANGE PASSWORD ====================
/**
 * Open change password modal
 */
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const form = document.getElementById('changePasswordForm');
    const error = document.getElementById('changePasswordError');

    if (!modal || !form) return;

    form.reset();
    error.style.display = 'none';
    modal.style.display = 'flex';
}

/**
 * Handle change password
 */
async function handleChangePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const error = document.getElementById('changePasswordError');
    const errorText = document.getElementById('changePasswordErrorText');
    const saveBtn = document.getElementById('savePasswordBtn');

    if (newPassword !== confirmPassword) {
        errorText.textContent = 'New passwords do not match';
        error.style.display = 'flex';
        return;
    }

    if (newPassword.length < 8) {
        errorText.textContent = 'Password must be at least 8 characters';
        error.style.display = 'flex';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
    error.style.display = 'none';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('changePasswordModal');
            alert('Password changed successfully!');
        } else {
            errorText.textContent = data.error || 'Failed to change password';
            error.style.display = 'flex';
        }
    } catch (error) {
        console.error('Change password error:', error);
        errorText.textContent = 'Connection error. Please try again.';
        error.style.display = 'flex';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Password';
    }
}

// ==================== MOBILE SETTINGS ====================
/**
 * Initialize mobile settings sidebar toggle
 */
function initializeMobileSettings() {
    const sidebar = document.querySelector('.settings-sidebar');
    const sidebarHeader = sidebar?.querySelector('.sidebar-user-section');

    if (!sidebar || !sidebarHeader) return;

    // Add toggle button if not exists
    if (!sidebarHeader.querySelector('.settings-sidebar-toggle')) {
        const toggle = document.createElement('button');
        toggle.className = 'settings-sidebar-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.setAttribute('aria-label', 'Toggle settings menu');
        toggle.style.display = 'none'; // Hidden by default, shown via CSS on mobile
        sidebarHeader.appendChild(toggle);

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Auto-collapse on mobile on initial load
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    }

    // Close sidebar when selecting a tab on mobile
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                const toggle = sidebar.querySelector('.settings-sidebar-toggle i');
                if (toggle) {
                    toggle.classList.remove('fa-times');
                    toggle.classList.add('fa-bars');
                }
            }
        });
    });

    // Handle window resize
    const handleResize = () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('collapsed');
        }
    };

    // Debounce resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

// ==================== THEME TOGGLE ====================
/**
 * Initialize theme toggle functionality
 * Syncs with the theme toggle in common.js
 */
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggleSidebar');
    if (!themeToggle) return;

    // Update button based on current theme
    const updateThemeButton = () => {
        const isDark = document.body.classList.contains('dark-theme');

        // Create SVG icon
        const moonSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" class="theme-icon">
                <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z"/>
            </svg>
        `;

        const sunSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
                <path d="M8 1.11133V2.00022 M12.8711 3.12891L12.2427 3.75735 M14.8889 8H14 M12.8711 12.8711L12.2427 12.2427 M8 14.8889V14 M3.12891 12.8711L3.75735 12.2427 M1.11133 8H2.00022 M3.12891 3.12891L3.75735 3.75735 M8.00043 11.7782C10.0868 11.7782 11.7782 10.0868 11.7782 8.00043C11.7782 5.91402 10.0868 4.22266 8.00043 4.22266C5.91402 4.22266 4.22266 5.91402 4.22266 8.00043C4.22266 10.0868 5.91402 11.7782 8.00043 11.7782Z"/>
            </svg>
        `;

        const iconHTML = isDark ? sunSVG : moonSVG;
        const text = themeToggle.querySelector('span');

        // Update icon
        const iconContainer = themeToggle.querySelector('.theme-icon-container');
        if (iconContainer) {
            iconContainer.innerHTML = iconHTML;
        } else {
            const oldIcon = themeToggle.querySelector('.theme-icon');
            if (oldIcon) {
                oldIcon.outerHTML = iconHTML;
            } else {
                themeToggle.insertAdjacentHTML('afterbegin', iconHTML);
            }
        }

        if (text) {
            text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
    };

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeButton();

        // Re-render analytics chart if it exists (to update colors)
        if (analyticsData && document.getElementById('analyticsChart')) {
            renderAnalyticsChart(analyticsData);
        }
    });

    // Initial state
    updateThemeButton();
}

// ==================== MODAL HELPERS ====================
/**
 * Close a modal by ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Show confirmation dialog
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
function showConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmActionBtn');

        if (!modal || !titleEl || !messageEl || !confirmBtn) {
            resolve(false);
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.style.display = 'flex';

        // Remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Add new listener
        newConfirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            resolve(true);
        });

        // Cancel button
        const cancelBtn = modal.querySelector('.btn-secondary[data-modal="confirmModal"]');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(false);
            });
        }
    });
}

// ==================== DOWNLOADS MANAGEMENT TAB (Subphase 1.8) ====================

// Global state for downloads configuration
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Set a nested value in an object using dot notation
 * Example: setNestedValue(obj, 'a.b.c', value) sets obj.a.b.c = value
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
    target[lastKey] = value;
}

// ==================== EXPOSE FUNCTIONS TO GLOBAL SCOPE ====================
// These functions need to be accessible from HTML onclick attributes
window.openEditUserModal = openEditUserModal;
window.deleteUser = deleteUser;

})(); // End of IIFE
