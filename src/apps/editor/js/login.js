/**
 * ===========================
 * LOGIN FUNCTIONALITY
 * ===========================
 *
 * Diese Datei verwaltet die Login-Funktionalität für den Documentation Editor.
 *
 * AKTUELLE IMPLEMENTIERUNG (Demo-Version):
 * - Einfache Passwort-Überprüfung (hardcoded: "demo")
 * - Session-basierte Authentifizierung (localStorage)
 * - Keine Backend-Kommunikation
 *
 * HINWEISE FÜR ZUKÜNFTIGE ENTWICKLUNG:
 * ----------------------------------------
 *
 * 1. BACKEND-INTEGRATION:
 *    - Ersetze die hardcoded Passwort-Überprüfung durch API-Calls
 *    - Implementiere JWT-Token basierte Authentifizierung
 *    - Füge Server-seitige Session-Verwaltung hinzu
 *
 * 2. SICHERHEITSVERBESSERUNGEN:
 *    - Implementiere bcrypt oder ähnliche Hash-Funktionen
 *    - Füge Rate-Limiting hinzu (z.B. max 5 Versuche)
 *    - HTTPS erzwingen
 *    - CSRF-Token implementieren
 *    - Content Security Policy (CSP) Header
 *
 * 3. ZUSÄTZLICHE FEATURES:
 *    - Benutzername + Passwort statt nur Passwort
 *    - "Remember Me" Funktion
 *    - Passwort vergessen / Reset
 *    - 2-Faktor-Authentifizierung (2FA)
 *    - OAuth Integration (Google, GitHub, etc.)
 *    - Session-Timeout mit automatischem Logout
 *
 * 4. UX VERBESSERUNGEN:
 *    - Loading-States während API-Calls
 *    - Bessere Error-Messages
 *    - Progress-Indicator
 *    - Erfolgs-Animation nach Login
 *
 * 5. DATENSTRUKTUR FÜR ZUKÜNFTIGE USER-VERWALTUNG:
 *    {
 *      username: string,
 *      email: string,
 *      role: 'admin' | 'editor' | 'viewer',
 *      permissions: string[],
 *      lastLogin: Date,
 *      createdAt: Date
 *    }
 *
 * ===========================
 */

// ===========================
// KONFIGURATION
// ===========================

/**
 * DEMO-KONFIGURATION
 *
 * WICHTIG: Diese Werte sind nur für die Demo-Version!
 * In der Produktionsversion müssen diese Werte aus einer sicheren Quelle kommen.
 */
const LOGIN_CONFIG = {
    // Hardcoded Demo-Passwort
    DEMO_PASSWORD: 'demo',

    // Session-Schlüssel für localStorage
    SESSION_KEY: 'editor_auth_session',

    // Session-Dauer in Millisekunden (24 Stunden)
    SESSION_DURATION: 24 * 60 * 60 * 1000,

    // Maximale Login-Versuche (für zukünftige Implementierung)
    MAX_LOGIN_ATTEMPTS: 5,

    // Redirect-URL nach erfolgreichem Login
    REDIRECT_URL: '/editor/index.html'
};

// ===========================
// DOM-ELEMENTE
// ===========================

let loginForm;
let passwordInput;
let togglePasswordBtn;
let errorMessage;
let errorText;

// ===========================
// INITIALISIERUNG
// ===========================

/**
 * Initialisiert die Login-Seite
 * Wird aufgerufen, sobald das DOM geladen ist
 */
function initLogin() {
    // DOM-Elemente abrufen
    loginForm = document.getElementById('login-form');
    passwordInput = document.getElementById('password');
    togglePasswordBtn = document.getElementById('toggle-password');
    errorMessage = document.getElementById('error-message');
    errorText = document.getElementById('error-text');

    // Prüfen, ob bereits eine gültige Session existiert
    if (isLoggedIn()) {
        redirectToEditor();
        return;
    }

    // Event Listeners einrichten
    setupEventListeners();

    // Auto-Focus auf Passwort-Input
    passwordInput.focus();
}

// ===========================
// EVENT LISTENERS
// ===========================

/**
 * Richtet alle Event Listeners ein
 */
function setupEventListeners() {
    // Form Submit Event
    loginForm.addEventListener('submit', handleLogin);

    // Password Toggle Button
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // Enter-Taste im Passwort-Feld
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin(e);
        }
    });

    // Input Event - Verstecke Error Message beim Tippen
    passwordInput.addEventListener('input', () => {
        hideError();
    });
}

// ===========================
// LOGIN-LOGIK
// ===========================

/**
 * Verarbeitet den Login-Versuch
 *
 * AKTUELLE IMPLEMENTIERUNG: Einfache Passwort-Überprüfung
 *
 * ZUKÜNFTIGE IMPLEMENTIERUNG:
 * - async function handleLogin(e) { ... }
 * - API-Call an Backend: POST /api/auth/login
 * - Response mit JWT-Token verarbeiten
 * - Token sicher speichern (httpOnly Cookie bevorzugt)
 * - User-Daten abrufen und speichern
 */
function handleLogin(e) {
    e.preventDefault();

    const password = passwordInput.value.trim();

    // Validierung: Passwort darf nicht leer sein
    if (!password) {
        showError('Bitte geben Sie ein Passwort ein.');
        return;
    }

    // Demo-Authentifizierung: Passwort überprüfen
    if (password === LOGIN_CONFIG.DEMO_PASSWORD) {
        // Login erfolgreich
        handleSuccessfulLogin();
    } else {
        // Login fehlgeschlagen
        handleFailedLogin();
    }

    /**
     * BEISPIEL FÜR ZUKÜNFTIGE API-INTEGRATION:
     *
     * async function handleLogin(e) {
     *     e.preventDefault();
     *
     *     const password = passwordInput.value.trim();
     *     const username = usernameInput.value.trim(); // Falls Username hinzugefügt wird
     *
     *     try {
     *         // Loading-State aktivieren
     *         setLoading(true);
     *
     *         // API-Call
     *         const response = await fetch('/api/auth/login', {
     *             method: 'POST',
     *             headers: {
     *                 'Content-Type': 'application/json',
     *             },
     *             body: JSON.stringify({ username, password })
     *         });
     *
     *         if (!response.ok) {
     *             throw new Error('Login fehlgeschlagen');
     *         }
     *
     *         const data = await response.json();
     *
     *         // Token speichern
     *         storeAuthToken(data.token);
     *
     *         // User-Daten speichern
     *         storeUserData(data.user);
     *
     *         // Redirect zum Editor
     *         redirectToEditor();
     *
     *     } catch (error) {
     *         console.error('Login error:', error);
     *         showError('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
     *     } finally {
     *         setLoading(false);
     *     }
     * }
     */
}

/**
 * Verarbeitet einen erfolgreichen Login
 */
function handleSuccessfulLogin() {
    // Session-Daten erstellen
    const sessionData = {
        authenticated: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + LOGIN_CONFIG.SESSION_DURATION,

        // Demo-User-Daten (für zukünftige Features)
        user: {
            username: 'demo',
            role: 'editor',
            permissions: ['read', 'write', 'delete']
        }
    };

    // Session in localStorage speichern
    localStorage.setItem(LOGIN_CONFIG.SESSION_KEY, JSON.stringify(sessionData));

    // Erfolgs-Animation (optional)
    showSuccessAnimation();

    // Zum Editor weiterleiten
    setTimeout(() => {
        redirectToEditor();
    }, 500);
}

/**
 * Verarbeitet einen fehlgeschlagenen Login
 */
function handleFailedLogin() {
    // Error Message anzeigen
    showError('Falsches Passwort. Bitte versuchen Sie es erneut.');

    // Passwort-Feld leeren
    passwordInput.value = '';

    // Passwort-Feld fokussieren
    passwordInput.focus();

    // Input-Feld schütteln (CSS-Animation)
    passwordInput.parentElement.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
        passwordInput.parentElement.style.animation = '';
    }, 300);

    /**
     * ZUKÜNFTIGE ERWEITERUNG: Login-Versuche tracken
     *
     * let loginAttempts = parseInt(localStorage.getItem('login_attempts') || '0');
     * loginAttempts++;
     * localStorage.setItem('login_attempts', loginAttempts.toString());
     *
     * if (loginAttempts >= LOGIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
     *     // Account temporär sperren
     *     lockAccount();
     * }
     */
}

// ===========================
// SESSION-VERWALTUNG
// ===========================

/**
 * Prüft, ob eine gültige Session existiert
 *
 * @returns {boolean} true wenn eingeloggt, false sonst
 */
function isLoggedIn() {
    const sessionData = getSessionData();

    if (!sessionData) {
        return false;
    }

    // Prüfen, ob Session abgelaufen ist
    if (Date.now() > sessionData.expiresAt) {
        // Session abgelaufen - aufräumen
        clearSession();
        return false;
    }

    return sessionData.authenticated === true;
}

/**
 * Holt die Session-Daten aus dem localStorage
 *
 * @returns {Object|null} Session-Daten oder null
 */
function getSessionData() {
    try {
        const data = localStorage.getItem(LOGIN_CONFIG.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading session data:', error);
        return null;
    }
}

/**
 * Löscht die Session
 */
function clearSession() {
    localStorage.removeItem(LOGIN_CONFIG.SESSION_KEY);
}

// ===========================
// UI-HILFSFUNKTIONEN
// ===========================

/**
 * Zeigt eine Error-Message an
 *
 * @param {string} message - Die anzuzeigende Fehlermeldung
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

/**
 * Versteckt die Error-Message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Zeigt eine Erfolgs-Animation (optional)
 */
function showSuccessAnimation() {
    // Ändern des Button-Texts
    const loginBtn = loginForm.querySelector('.btn-login');
    const originalContent = loginBtn.innerHTML;

    loginBtn.innerHTML = '<i class="fas fa-check"></i><span>Erfolgreich!</span>';
    loginBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
}

/**
 * Schaltet die Sichtbarkeit des Passworts um
 */
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Icon ändern
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// ===========================
// NAVIGATION
// ===========================

/**
 * Leitet zum Editor weiter
 */
function redirectToEditor() {
    window.location.href = LOGIN_CONFIG.REDIRECT_URL;
}

// ===========================
// INITIALISIERUNG BEIM LADEN
// ===========================

// Event Listener für DOM-Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
} else {
    initLogin();
}

// ===========================
// GLOBALE HILFSFUNKTIONEN
// (für andere Dateien zugänglich)
// ===========================

/**
 * Exportiert die isLoggedIn-Funktion für andere Dateien
 * Diese Funktion wird in auth.js verwendet
 */
window.isUserLoggedIn = isLoggedIn;

/**
 * Exportiert die Logout-Funktion
 * Kann von anderen Seiten aufgerufen werden
 */
window.logoutUser = function() {
    clearSession();
    window.location.href = '/editor/login.html';
};

/**
 * PLATZHALTER FÜR ZUKÜNFTIGE FUNKTIONEN
 * ======================================
 *
 * Beispiele für zusätzliche Funktionen, die implementiert werden können:
 *
 * 1. function validatePassword(password) { }
 *    - Passwort-Stärke prüfen
 *    - Mindestanforderungen überprüfen
 *
 * 2. function refreshSession() { }
 *    - Session-Token erneuern
 *    - Automatisches Refresh vor Ablauf
 *
 * 3. function setupTwoFactor() { }
 *    - 2FA einrichten
 *    - QR-Code generieren
 *
 * 4. function verifyTwoFactorCode(code) { }
 *    - 2FA-Code überprüfen
 *
 * 5. function sendPasswordResetEmail(email) { }
 *    - Passwort-Reset-Link senden
 *
 * 6. function socialLogin(provider) { }
 *    - OAuth-Login (Google, GitHub, etc.)
 *
 * 7. function trackLoginAttempts() { }
 *    - Fehlgeschlagene Login-Versuche tracken
 *    - Rate-Limiting implementieren
 *
 * 8. function getUserPermissions() { }
 *    - User-Permissions abrufen
 *    - Für Zugriffskontrolle
 */
