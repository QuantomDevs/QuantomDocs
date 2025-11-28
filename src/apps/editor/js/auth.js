/**
 * Authentication Module for Editor
 * Handles user authentication and token management
 */

let currentUser = null;
let authToken = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});

/**
 * Check if user is authenticated
 */
async function checkAuth() {
    const loadingScreen = document.getElementById('loading-screen');
    const authRequired = document.getElementById('auth-required');
    const editorApp = document.getElementById('editor-app');

    try {
        // Get token from localStorage
        authToken = localStorage.getItem('authToken');

        if (!authToken) {
            showAuthRequired();
            return;
        }

        // Verify token with server
        const response = await fetch('/api/verify', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            showAuthRequired();
            return;
        }

        const data = await response.json();
        currentUser = data.user;

        // Show editor app
        loadingScreen.style.display = 'none';
        editorApp.style.display = 'flex';

        // Update user name in header
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = currentUser.username;
        }

    } catch (error) {
        console.error('Authentication check failed:', error);
        showAuthRequired();
    }
}

/**
 * Show authentication required screen
 */
function showAuthRequired() {
    const loadingScreen = document.getElementById('loading-screen');
    const authRequired = document.getElementById('auth-required');
    const editorApp = document.getElementById('editor-app');

    loadingScreen.style.display = 'none';
    authRequired.style.display = 'flex';
    editorApp.style.display = 'none';
}

/**
 * Logout user
 */
async function logout() {
    try {
        // Call logout endpoint to blacklist token
        if (authToken) {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage and redirect
        localStorage.removeItem('authToken');
        window.location.href = '/settings';
    }
}

/**
 * Get current auth token
 */
function getAuthToken() {
    return authToken;
}

/**
 * Get current user
 */
function getCurrentUser() {
    return currentUser;
}

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
