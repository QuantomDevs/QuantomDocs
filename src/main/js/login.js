// Login page functionality - arbeitet direkt mit lokaler users.json

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const connectionStatusEl = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');

// Check if already logged in
const checkAuthStatus = () => {
    const authCode = localStorage.getItem('quantomAuthCode');
    if (authCode) {
        // Already logged in, redirect to home
        window.location.href = '/main';
    }
};

// Load users from JSON file
const loadUsers = async () => {
    try {
        const response = await fetch('config/users.json');
        if (!response.ok) {
            throw new Error('Could not load users');
        }
        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
};

// Toggle password visibility
const togglePasswordVisibility = () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    const icon = togglePasswordBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};

// Show error message
const showError = (message) => {
    errorText.textContent = message;
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Show success message
const showSuccess = (message) => {
    errorText.textContent = message;
    errorMessage.className = 'success-message';
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Hide error message
const hideError = () => {
    errorMessage.style.display = 'none';
};

// Set loading state
const setLoadingState = (loading) => {
    loginBtn.disabled = loading;
    loginBtn.classList.toggle('loading', loading);

    const spinner = loginBtn.querySelector('.loading-spinner');
    const span = loginBtn.querySelector('span');

    spinner.style.display = loading ? 'block' : 'none';
    span.style.opacity = loading ? '0' : '1';

    if (loading) {
        usernameInput.disabled = true;
        passwordInput.disabled = true;
    } else {
        usernameInput.disabled = false;
        passwordInput.disabled = false;
    }
};

// Handle login
const handleLogin = async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError('✗ Bitte Benutzername und Passwort eingeben');
        return;
    }

    setLoadingState(true);
    hideError();

    try {
        // Load users from JSON file
        const users = await loadUsers();

        // Find matching user
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Store auth code in localStorage
            localStorage.setItem('quantomAuthCode', user.authCode);
            localStorage.setItem('quantomUserData', JSON.stringify({
                username: user.username,
                role: user.role
            }));

            // Show success message
            showSuccess(`✓ Login erfolgreich! Willkommen ${user.username}`);

            // Show success state
            document.querySelector('.login-card').classList.add('success');

            // Redirect to home after 3 seconds
            setTimeout(() => {
                window.location.href = '/main';
            }, 3000);

        } else {
            // Wrong credentials
            showError('✗ Benutzername oder Passwort ist falsch');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('✗ Fehler beim Laden der Anmeldedaten. Versuche es erneut.');
    } finally {
        setLoadingState(false);
    }
};

// Input event listeners for real-time validation
const handleInputChange = () => {
    hideError();

    // Enable/disable login button based on input
    const hasUsername = usernameInput.value.trim().length > 0;
    const hasPassword = passwordInput.value.length > 0;

    if (hasUsername && hasPassword) {
        loginBtn.disabled = false;
    } else {
        loginBtn.disabled = true;
    }
};

// Keyboard shortcuts
const handleKeyDown = (e) => {
    // Enter key to submit form
    if (e.key === 'Enter' && !loginBtn.disabled) {
        handleLogin(e);
    }

    // Escape key to clear form
    if (e.key === 'Escape') {
        loginForm.reset();
        hideError();
        usernameInput.focus();
    }
};

// Initialize login page
const initLoginPage = () => {
    // Check if already authenticated
    checkAuthStatus();

    // Hide connection status (not needed for local auth)
    connectionStatusEl.style.display = 'none';

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    usernameInput.addEventListener('input', handleInputChange);
    passwordInput.addEventListener('input', handleInputChange);

    document.addEventListener('keydown', handleKeyDown);

    // Focus username field
    usernameInput.focus();

    // Initial button state
    loginBtn.disabled = true;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLoginPage);