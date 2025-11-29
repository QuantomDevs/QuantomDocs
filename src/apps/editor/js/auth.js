/**
 * ===========================
 * AUTHENTICATION MODULE
 * ===========================
 *
 * Handles user authentication for the editor.
 *
 * AKTUELLE IMPLEMENTIERUNG:
 * - Prüft Session aus localStorage
 * - Leitet zu Login-Seite weiter wenn nicht authentifiziert
 *
 * HINWEISE FÜR ZUKÜNFTIGE ENTWICKLUNG:
 * -------------------------------------
 *
 * 1. TOKEN-VERWALTUNG:
 *    - JWT-Token statt einfacher Session
 *    - Token-Refresh-Mechanismus
 *    - Sichere Token-Speicherung (httpOnly Cookies bevorzugt)
 *
 * 2. PERMISSION-SYSTEM:
 *    - Rollenbasierte Zugriffskontrolle (RBAC)
 *    - Feature-Flags für verschiedene User-Rollen
 *    - Granulare Permissions (read, write, delete, admin)
 *
 * 3. SESSION-MANAGEMENT:
 *    - Session-Timeout mit Warnung
 *    - Automatische Session-Verlängerung bei Aktivität
 *    - Mehrere gleichzeitige Sessions verwalten
 *
 * 4. SECURITY:
 *    - CSRF-Token-Validierung
 *    - XSS-Schutz
 *    - Rate-Limiting für API-Calls
 *    - IP-Whitelisting (optional)
 *
 * ===========================
 */

// ===========================
// KONFIGURATION
// ===========================

const AUTH_CONFIG = {
    // Session-Schlüssel (muss mit login.js übereinstimmen)
    SESSION_KEY: 'editor_auth_session',

    // Login-Seite URL
    LOGIN_URL: '/editor/login.html',

    // API-Endpoint für Token-Validierung (zukünftig)
    VALIDATE_TOKEN_URL: '/api/auth/validate',

    // Interval für Session-Check in Millisekunden (5 Minuten)
    SESSION_CHECK_INTERVAL: 5 * 60 * 1000
};

// ===========================
// SESSION-VALIDIERUNG
// ===========================

/**
 * Prüft, ob der User authentifiziert ist
 *
 * AKTUELLE IMPLEMENTIERUNG:
 * - Liest Session aus localStorage
 * - Prüft Ablaufdatum
 *
 * ZUKÜNFTIGE IMPLEMENTIERUNG:
 * - Validiert JWT-Token
 * - Prüft Token-Signatur
 * - Verifiziert mit Backend
 *
 * @returns {boolean} true wenn authentifiziert, false sonst
 */
function checkAuth() {
    try {
        // Session-Daten aus localStorage holen
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);

        if (!sessionData) {
            redirectToLogin();
            return false;
        }

        // Session-Daten parsen
        const session = JSON.parse(sessionData);

        // Prüfen ob Session abgelaufen ist
        if (Date.now() > session.expiresAt) {
            console.log('Session expired');
            clearSession();
            redirectToLogin();
            return false;
        }

        // Prüfen ob authenticated-Flag gesetzt ist
        if (!session.authenticated) {
            redirectToLogin();
            return false;
        }

        // Optional: Session-Informationen im window-Objekt speichern
        window.currentUser = session.user;

        return true;

    } catch (error) {
        console.error('Auth check error:', error);
        redirectToLogin();
        return false;
    }

    /**
     * BEISPIEL FÜR ZUKÜNFTIGE JWT-VALIDIERUNG:
     *
     * async function checkAuth() {
     *     try {
     *         const token = getAuthToken();
     *
     *         if (!token) {
     *             redirectToLogin();
     *             return false;
     *         }
     *
     *         // Token mit Backend validieren
     *         const response = await fetch(AUTH_CONFIG.VALIDATE_TOKEN_URL, {
     *             headers: {
     *                 'Authorization': `Bearer ${token}`
     *             }
     *         });
     *
     *         if (!response.ok) {
     *             throw new Error('Token validation failed');
     *         }
     *
     *         const data = await response.json();
     *         window.currentUser = data.user;
     *
     *         return true;
     *
     *     } catch (error) {
     *         console.error('Auth check error:', error);
     *         redirectToLogin();
     *         return false;
     *     }
     * }
     */
}

// ===========================
// TOKEN-VERWALTUNG
// ===========================

/**
 * Holt das Authentifizierungs-Token
 *
 * AKTUELLE IMPLEMENTIERUNG:
 * - Holt Session aus localStorage
 * - Gibt einfaches Token zurück
 *
 * ZUKÜNFTIGE IMPLEMENTIERUNG:
 * - JWT-Token aus httpOnly Cookie holen (sicherer)
 * - Token-Refresh wenn nötig
 *
 * @returns {string|null} Token oder null
 */
function getAuthToken() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);

        if (!sessionData) {
            return null;
        }

        const session = JSON.parse(sessionData);

        // Für die aktuelle Demo-Version geben wir ein einfaches Token zurück
        // In der Zukunft wird hier ein JWT-Token zurückgegeben
        return `demo-token-${session.timestamp}`;

    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }

    /**
     * BEISPIEL FÜR ZUKÜNFTIGE JWT-IMPLEMENTIERUNG:
     *
     * function getAuthToken() {
     *     // Token aus httpOnly Cookie holen (bevorzugt) oder localStorage
     *     const token = localStorage.getItem('jwt_token');
     *
     *     if (!token) {
     *         return null;
     *     }
     *
     *     // Token-Ablauf prüfen
     *     if (isTokenExpired(token)) {
     *         // Token-Refresh durchführen
     *         return refreshAuthToken();
     *     }
     *
     *     return token;
     * }
     */
}

// ===========================
// SESSION-VERWALTUNG
// ===========================

/**
 * Löscht die aktuelle Session
 */
function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);

    // Zukünftig: Auch Token und andere Auth-Daten löschen
    // localStorage.removeItem('jwt_token');
    // localStorage.removeItem('refresh_token');
    // sessionStorage.clear();
}

/**
 * Leitet zur Login-Seite weiter
 */
function redirectToLogin() {
    // Aktuelle URL speichern für Redirect nach Login
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirect_after_login', currentUrl);

    window.location.href = AUTH_CONFIG.LOGIN_URL;
}

// ===========================
// LOGOUT-FUNKTIONALITÄT
// ===========================

/**
 * Loggt den User aus
 *
 * AKTUELLE IMPLEMENTIERUNG:
 * - Löscht Session aus localStorage
 * - Leitet zur Login-Seite weiter
 *
 * ZUKÜNFTIGE IMPLEMENTIERUNG:
 * - Invalidiert Token auf dem Server
 * - Löscht alle Sessions auf allen Geräten (optional)
 * - Sendet Analytics-Event
 */
function logout() {
    // Session lokal löschen
    clearSession();

    // Zur Login-Seite weiterleiten
    window.location.href = AUTH_CONFIG.LOGIN_URL;

    /**
     * BEISPIEL FÜR ZUKÜNFTIGE SERVER-SEITIGE LOGOUT:
     *
     * async function logout() {
     *     try {
     *         const token = getAuthToken();
     *
     *         // Server über Logout informieren
     *         await fetch('/api/auth/logout', {
     *             method: 'POST',
     *             headers: {
     *                 'Authorization': `Bearer ${token}`
     *             }
     *         });
     *
     *     } catch (error) {
     *         console.error('Logout error:', error);
     *     } finally {
     *         // Lokale Session immer löschen, auch bei Fehler
     *         clearSession();
     *         window.location.href = AUTH_CONFIG.LOGIN_URL;
     *     }
     * }
     */
}

// ===========================
// AUTOMATISCHE SESSION-PRÜFUNG
// ===========================

/**
 * Startet periodische Session-Überprüfung
 * Prüft alle 5 Minuten ob die Session noch gültig ist
 */
function startSessionMonitoring() {
    setInterval(() => {
        const isValid = checkAuth();

        if (!isValid) {
            console.log('Session invalid, redirecting to login...');
            // checkAuth() leitet bereits weiter, aber zur Sicherheit
            redirectToLogin();
        }
    }, AUTH_CONFIG.SESSION_CHECK_INTERVAL);

    /**
     * ZUKÜNFTIGE ERWEITERUNG: Activity-basiertes Session-Management
     *
     * let lastActivity = Date.now();
     * const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 Minuten
     *
     * // User-Aktivität tracken
     * document.addEventListener('mousemove', () => lastActivity = Date.now());
     * document.addEventListener('keypress', () => lastActivity = Date.now());
     *
     * setInterval(() => {
     *     if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
     *         logout();
     *     }
     * }, 60000); // Jede Minute prüfen
     */
}

// Session-Monitoring starten wenn Seite geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSessionMonitoring);
} else {
    startSessionMonitoring();
}

// ===========================
// HILFSFUNKTIONEN FÜR PERMISSIONS
// (Platzhalter für zukünftige Implementierung)
// ===========================

/**
 * Prüft ob User eine bestimmte Permission hat
 *
 * @param {string} permission - Die zu prüfende Permission
 * @returns {boolean} true wenn Permission vorhanden
 *
 * BEISPIEL:
 * if (hasPermission('delete')) {
 *     // User darf Dateien löschen
 * }
 */
function hasPermission(permission) {
    if (!window.currentUser) {
        return false;
    }

    const permissions = window.currentUser.permissions || [];
    return permissions.includes(permission);

    /**
     * ZUKÜNFTIGE ERWEITERUNG: Rollenbasierte Permissions
     *
     * const rolePermissions = {
     *     admin: ['read', 'write', 'delete', 'manage_users'],
     *     editor: ['read', 'write', 'delete'],
     *     viewer: ['read']
     * };
     *
     * const userRole = window.currentUser.role;
     * const allowedPermissions = rolePermissions[userRole] || [];
     *
     * return allowedPermissions.includes(permission);
     */
}

/**
 * Prüft ob User eine bestimmte Rolle hat
 *
 * @param {string} role - Die zu prüfende Rolle
 * @returns {boolean} true wenn Rolle passt
 */
function hasRole(role) {
    if (!window.currentUser) {
        return false;
    }

    return window.currentUser.role === role;
}

/**
 * PLATZHALTER FÜR WEITERE ZUKÜNFTIGE FUNKTIONEN:
 * ===============================================
 *
 * 1. function refreshAuthToken() { }
 *    - Token erneuern bevor er abläuft
 *
 * 2. function isTokenExpired(token) { }
 *    - JWT-Token-Ablauf prüfen
 *
 * 3. function getUserProfile() { }
 *    - User-Profil vom Server laden
 *
 * 4. function updateUserProfile(data) { }
 *    - User-Profil aktualisieren
 *
 * 5. function changePassword(oldPassword, newPassword) { }
 *    - Passwort ändern
 *
 * 6. function enableTwoFactor() { }
 *    - 2FA aktivieren
 *
 * 7. function logoutAllSessions() { }
 *    - Alle Sessions auf allen Geräten beenden
 */
