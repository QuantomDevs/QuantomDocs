/**
 * SEARCH POPUP JAVASCRIPT
 * Funktionalität für das Terminus Suchpopup
 *
 * HAUPTFUNKTIONEN:
 * - Popup öffnen/schließen
 * - SSH/SFTP Modus umschalten
 * - Echtzeit-Suche in Verbindungen
 * - Suchergebnisse filtern und anzeigen
 * - Tastaturnavigation (ESC zum Schließen)
 *
 * VERWENDUNG IN ELECTRON:
 * - suche.json Datei muss im gleichen Verzeichnis liegen
 * - Passen Sie loadConnections() an für Electron's fs.readFileSync
 * - Event-Listener können für IPC-Kommunikation erweitert werden
 */

// ===========================
// GLOBALE VARIABLEN
// ===========================

/** @type {Array<Object>} Alle verfügbaren Verbindungen aus suche.json */
let allConnections = [];

/** @type {string} Aktuell ausgewählter Modus ('ssh' oder 'sftp') */
let currentMode = 'ssh';

// ===========================
// DOM ELEMENTE
// ===========================

/** @type {HTMLElement} Overlay Container */
const searchOverlay = document.getElementById('search-overlay');

/** @type {HTMLElement} Popup Container */
const searchPopup = document.getElementById('search-popup');

/** @type {HTMLInputElement} Suchfeld */
const searchInput = document.getElementById('search-input');

/** @type {HTMLElement} Ergebniscontainer */
const searchResults = document.getElementById('search-results');

/** @type {HTMLButtonElement} Suche öffnen Button */
const searchBtn = document.getElementById('search-btn');

/** @type {HTMLButtonElement} SSH Button */
const sshBtn = document.getElementById('ssh-btn');

/** @type {HTMLButtonElement} SFTP Button */
const sftpBtn = document.getElementById('sftp-btn');

// ===========================
// INITIALISIERUNG
// ===========================

/**
 * Initialisiert das Suchpopup beim Laden der Seite
 * Lädt Verbindungen und registriert Event-Listener
 */
document.addEventListener('DOMContentLoaded', () => {
    loadConnections();
    registerEventListeners();
});

// ===========================
// EVENT LISTENER
// ===========================

/**
 * Registriert alle Event-Listener für das Suchpopup
 *
 * Event-Typen:
 * 1. Click-Events: Popup öffnen/schließen, Modus wechseln
 * 2. Keyboard-Events: ESC zum Schließen
 * 3. Input-Events: Echtzeit-Suche
 *
 * @returns {void}
 */
function registerEventListeners() {
    // Popup öffnen via Button-Klick
    searchBtn.addEventListener('click', openSearchPopup);

    // Popup schließen bei Klick auf Overlay (außerhalb des Popups)
    // e.target === searchOverlay stellt sicher, dass nur Klicks auf den dunklen Bereich zählen
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearchPopup();
        }
    });

    // ESC-Taste zum Schließen (nur wenn Popup aktiv ist)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearchPopup();
        }
    });

    // Echtzeit-Suche bei jeder Eingabe im Suchfeld
    searchInput.addEventListener('input', handleSearch);

    // Modus-Umschaltung zwischen SSH und SFTP
    sshBtn.addEventListener('click', () => switchMode('ssh'));
    sftpBtn.addEventListener('click', () => switchMode('sftp'));
}

// ===========================
// POPUP STEUERUNG
// ===========================

/**
 * Öffnet das Suchpopup
 * Setzt Focus auf Suchfeld und zeigt aktuelle Ergebnisse
 *
 * Ablauf:
 * 1. Fügt 'active' Klasse zum Overlay hinzu (CSS triggert Fade-In Animation)
 * 2. Fokussiert Suchfeld für sofortige Eingabe
 * 3. Zeigt initiale Ergebnisse (alle Verbindungen des aktuellen Modus)
 *
 * @returns {void}
 */
function openSearchPopup() {
    searchOverlay.classList.add('active');
    searchInput.focus();
    handleSearch(); // Zeige initiale Ergebnisse
}

/**
 * Schließt das Suchpopup
 * Leert Suchfeld und entfernt alle Ergebnisse
 *
 * Ablauf:
 * 1. Entfernt 'active' Klasse (CSS triggert Fade-Out Animation)
 * 2. Leert Suchfeld-Wert
 * 3. Entfernt alle HTML-Ergebnisse
 * 4. Entfernt 'visible' und 'expanded' States
 *
 * @returns {void}
 */
function closeSearchPopup() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.remove('visible');
    searchPopup.classList.remove('expanded');
}

// ===========================
// MODUS-UMSCHALTUNG
// ===========================

/**
 * Schaltet zwischen SSH und SFTP Modus um
 *
 * Ablauf:
 * 1. Aktualisiert globale Variable currentMode
 * 2. Entfernt 'active' Klasse vom anderen Button
 * 3. Fügt 'active' Klasse zum gewählten Button hinzu
 * 4. Triggert neue Suche mit aktualisiertem Filter
 *
 * @param {string} mode - Der gewünschte Modus ('ssh' oder 'sftp')
 * @returns {void}
 *
 * @example
 * switchMode('ssh');   // Zeigt nur SSH-Verbindungen
 * switchMode('sftp');  // Zeigt nur SFTP-Verbindungen
 */
function switchMode(mode) {
    currentMode = mode;

    // Button-Status aktualisieren (Toggle Active-State)
    if (mode === 'ssh') {
        sshBtn.classList.add('active');
        sftpBtn.classList.remove('active');
    } else {
        sftpBtn.classList.add('active');
        sshBtn.classList.remove('active');
    }

    // Suchergebnisse mit neuem Filter aktualisieren
    handleSearch();
}

// ===========================
// DATEN LADEN
// ===========================

/**
 * Lädt Verbindungen aus suche.json
 *
 * Standard-Implementierung (Browser/Web):
 * - Verwendet fetch() API
 * - Lädt suche.json aus gleichem Verzeichnis
 *
 * FÜR ELECTRON ANPASSEN:
 * Ersetzen Sie fetch() durch IPC-Call:
 *
 * const { ipcRenderer } = require('electron');
 * async function loadConnections() {
 *     try {
 *         allConnections = await ipcRenderer.invoke('load-connections');
 *     } catch (error) {
 *         console.error('Fehler beim Laden der Verbindungen:', error);
 *         allConnections = [];
 *     }
 * }
 *
 * Im Main Process (main.js):
 * const fs = require('fs').promises;
 * const path = require('path');
 * ipcMain.handle('load-connections', async () => {
 *     const userDataPath = app.getPath('userData');
 *     const connectionsPath = path.join(userDataPath, 'connections.json');
 *     const data = await fs.readFile(connectionsPath, 'utf8');
 *     return JSON.parse(data).connections || [];
 * });
 *
 * @returns {Promise<void>}
 */
async function loadConnections() {
    try {
        const response = await fetch('suche.json');
        const data = await response.json();
        allConnections = data.connections || [];
    } catch (error) {
        console.error('Fehler beim Laden der Verbindungen:', error);
        allConnections = [];
    }
}

// ===========================
// SUCHFUNKTIONALITÄT
// ===========================

/**
 * Hauptsuchfunktion
 * Filtert Verbindungen basierend auf Sucheingabe und Modus
 * Zeigt Ergebnisse an oder leeren Zustand
 *
 * Filter-Pipeline:
 * 1. Filter nach Typ (currentMode: 'ssh' oder 'sftp')
 * 2. Filter nach Suchbegriff (name, host, user, tags)
 * 3. Zeige Ergebnisse oder Empty State
 * 4. Update UI States (expanded/visible)
 *
 * Durchsuchte Felder:
 * - name: z.B. "Production Web Server"
 * - host: z.B. "web-prod-01.example.com"
 * - user: z.B. "admin"
 * - tags: z.B. ["web", "production", "critical"]
 *
 * @returns {void}
 */
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    // FILTER STUFE 1: Nach aktuellem Modus (SSH oder SFTP)
    let filteredConnections = allConnections.filter(conn => conn.type === currentMode);

    // FILTER STUFE 2: Nach Suchbegriff (wenn vorhanden)
    if (query) {
        filteredConnections = filteredConnections.filter(conn => {
            return (
                conn.name.toLowerCase().includes(query) ||      // Suche in Name
                conn.host.toLowerCase().includes(query) ||      // Suche in Host
                conn.user.toLowerCase().includes(query) ||      // Suche in User
                (conn.tags && conn.tags.some(tag => tag.toLowerCase().includes(query)))  // Suche in Tags
            );
        });
    }

    // Zeige gefilterte Ergebnisse an
    displayResults(filteredConnections, query);

    // UI-States aktualisieren basierend auf Ergebnissen
    // expanded = Popup vergrößert sich
    // visible = Ergebnis-Container wird sichtbar
    if (filteredConnections.length > 0 || query) {
        searchPopup.classList.add('expanded');
        searchResults.classList.add('visible');
    } else {
        searchPopup.classList.remove('expanded');
        searchResults.classList.remove('visible');
    }
}

// ===========================
// ERGEBNISANZEIGE
// ===========================

/**
 * Zeigt Suchergebnisse an
 *
 * Ablauf:
 * 1. Leert bestehende Ergebnisse
 * 2. Bei 0 Ergebnissen: Zeige Empty State (wenn Suchbegriff vorhanden)
 * 3. Bei Ergebnissen: Gruppiere nach Kategorie und rendere HTML
 * 4. Füge Click-Handler zu allen Ergebnis-Items hinzu
 *
 * @param {Array<Object>} results - Array von gefilterten Verbindungen
 * @param {string} query - Aktueller Suchbegriff
 * @returns {void}
 *
 * @example
 * displayResults([{name: "Server1", ...}, {name: "Server2", ...}], "prod");
 */
function displayResults(results, query) {
    // Leere vorherige Ergebnisse
    searchResults.innerHTML = '';

    // Kein Ergebnis gefunden
    if (results.length === 0) {
        if (query) {
            // Zeige "Keine Ergebnisse" nur wenn User etwas gesucht hat
            searchResults.innerHTML = createEmptyState(query);
        }
        return;
    }

    // Gruppiere Ergebnisse nach Kategorie (Production, Development, etc.)
    const grouped = groupByCategory(results);

    // Erstelle HTML für jede Kategorie und ihre Verbindungen
    Object.entries(grouped).forEach(([category, connections]) => {
        const categoryHTML = createCategorySection(category, connections);
        searchResults.innerHTML += categoryHTML;
    });

    // Füge Event-Listener zu allen Ergebnis-Items hinzu
    addResultClickHandlers();
}

/**
 * Gruppiert Verbindungen nach Kategorie
 *
 * Erstellt ein Objekt mit Kategorien als Keys und Arrays von Verbindungen als Values
 *
 * @param {Array<Object>} connections - Array von Verbindungen
 * @returns {Object} Gruppierte Verbindungen
 *
 * @example
 * Input: [{category: "Production", ...}, {category: "Production", ...}, {category: "Dev", ...}]
 * Output: {
 *   "Production": [{...}, {...}],
 *   "Dev": [{...}]
 * }
 */
function groupByCategory(connections) {
    const grouped = {};

    connections.forEach(conn => {
        // Fallback zu "Andere" wenn keine Kategorie vorhanden
        const category = conn.category || 'Andere';

        // Initialisiere Array für neue Kategorie
        if (!grouped[category]) {
            grouped[category] = [];
        }

        // Füge Verbindung zur Kategorie hinzu
        grouped[category].push(conn);
    });

    return grouped;
}

/**
 * Erstellt HTML für eine Kategorie-Sektion
 * @param {string} category - Kategoriename
 * @param {Array<Object>} connections - Verbindungen in dieser Kategorie
 * @returns {string} HTML String
 */
function createCategorySection(category, connections) {
    let html = `<div class="result-category">${category}</div>`;

    connections.forEach(conn => {
        html += createResultItem(conn);
    });

    return html;
}

/**
 * Erstellt HTML für ein einzelnes Suchergebnis
 * @param {Object} connection - Verbindungsobjekt
 * @returns {string} HTML String
 */
function createResultItem(connection) {
    const icon = getConnectionIcon(connection.type);
    const badge = connection.tags && connection.tags.length > 0
        ? `<div class="result-badge"><span class="badge">${connection.tags[0]}</span></div>`
        : '';

    return `
        <div class="result-item" data-connection='${JSON.stringify(connection)}'>
            <div class="result-icon">${icon}</div>
            <div class="result-content">
                <div class="result-title">${escapeHtml(connection.name)}</div>
                <div class="result-subtitle">${escapeHtml(connection.user)}@${escapeHtml(connection.host)}:${connection.port}</div>
            </div>
            ${badge}
        </div>
    `;
}

/**
 * Erstellt HTML für den leeren Zustand
 * @param {string} query - Suchbegriff
 * @returns {string} HTML String
 */
function createEmptyState(query) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-text">Keine Verbindungen gefunden</div>
            <div class="empty-state-hint">Keine Ergebnisse für "${escapeHtml(query)}" im ${currentMode.toUpperCase()}-Modus</div>
        </div>
    `;
}

/**
 * Gibt das passende Icon für einen Verbindungstyp zurück
 * @param {string} type - Verbindungstyp ('ssh' oder 'sftp')
 * @returns {string} SVG Icon HTML
 */
function getConnectionIcon(type) {
    if (type === 'ssh') {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

// ===========================
// ERGEBNIS-INTERAKTION
// ===========================

/**
 * Fügt Click-Handler zu allen Suchergebnissen hinzu
 */
function addResultClickHandlers() {
    const resultItems = document.querySelectorAll('.result-item');

    resultItems.forEach(item => {
        item.addEventListener('click', () => {
            const connection = JSON.parse(item.dataset.connection);
            handleConnectionClick(connection);
        });
    });
}

/**
 * Behandelt Klick auf eine Verbindung
 *
 * Standard-Implementierung (Browser/Web):
 * - Zeigt Alert mit Verbindungsinformationen
 * - Schließt Popup
 *
 * FÜR ELECTRON ANPASSEN:
 * Ersetzen durch IPC-Event-Kommunikation:
 *
 * const { ipcRenderer } = require('electron');
 *
 * function handleConnectionClick(connection) {
 *     console.log('Verbindung ausgewählt:', connection);
 *     closeSearchPopup();
 *
 *     // Sende IPC-Event basierend auf Typ
 *     if (connection.type === 'ssh') {
 *         ipcRenderer.send('connect-ssh', connection);
 *     } else if (connection.type === 'sftp') {
 *         ipcRenderer.send('connect-sftp', connection);
 *     }
 *
 *     // Optional: Höre auf Erfolg/Fehler
 *     ipcRenderer.once('connection-success', (event, data) => {
 *         console.log('Verbindung erfolgreich:', data);
 *     });
 *
 *     ipcRenderer.once('connection-error', (event, error) => {
 *         console.error('Verbindungsfehler:', error);
 *     });
 * }
 *
 * @param {Object} connection - Ausgewählte Verbindung
 * @param {string} connection.id - Eindeutige ID
 * @param {string} connection.name - Anzeigename
 * @param {string} connection.type - 'ssh' oder 'sftp'
 * @param {string} connection.host - Hostname oder IP
 * @param {number} connection.port - Port-Nummer
 * @param {string} connection.user - Benutzername
 * @returns {void}
 */
function handleConnectionClick(connection) {
    console.log('Verbindung ausgewählt:', connection);

    // Beispiel: Alert zeigen (in Electron durch IPC ersetzen)
    alert(`Verbinde zu: ${connection.name}\n${connection.user}@${connection.host}:${connection.port}`);

    closeSearchPopup();

    // TODO: Implementieren Sie hier die tatsächliche Verbindungslogik
    // In einer Electron-App würde dies typischerweise ein IPC-Event triggern
    // Siehe JSDoc oben für Electron-Implementierung mit ssh2
}

// ===========================
// HILFSFUNKTIONEN
// ===========================

/**
 * Escaped HTML-Sonderzeichen zur Vermeidung von XSS
 *
 * Ersetzt gefährliche HTML-Zeichen durch ihre Entity-Entsprechungen
 * WICHTIG: Immer verwenden wenn User-Input in HTML eingefügt wird!
 *
 * @param {string} text - Zu escapender Text
 * @returns {string} Escaped Text
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 *
 * escapeHtml("Server & Co.")
 * // Returns: 'Server &amp; Co.'
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',   // Ampersand
        '<': '&lt;',    // Kleiner-als
        '>': '&gt;',    // Größer-als
        '"': '&quot;',  // Doppelte Anführungszeichen
        "'": '&#039;'   // Einfache Anführungszeichen
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===========================
// EXPORT FÜR ELECTRON
// ===========================

/**
 * Für Electron-Integration können folgende Funktionen exportiert werden:
 *
 * module.exports = {
 *     openSearchPopup,
 *     closeSearchPopup,
 *     loadConnections,
 *     switchMode
 * };
 *
 * Verwendung in Electron Main Process:
 * - Registrieren Sie globale Shortcuts zum Öffnen des Popups
 * - Implementieren Sie IPC-Handler für Verbindungsaufbau
 * - Laden Sie suche.json aus dem User-Data-Verzeichnis
 */
