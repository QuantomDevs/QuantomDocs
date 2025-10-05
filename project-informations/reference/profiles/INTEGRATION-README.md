# Search Popup Integration Guide für Electron Apps

**Ziel:** Diese Anleitung erklärt, wie die moderne Suchleiste 1:1 in eine bestehende Electron-App integriert wird und die alte Profile-Suchleiste vollständig ersetzt.

---

## 📋 Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Komponenten-Struktur](#komponenten-struktur)
3. [Benötigte Dateien](#benötigte-dateien)
4. [Schritt-für-Schritt Integration](#schritt-für-schritt-integration)
5. [Anpassung an die Electron-App](#anpassung-an-die-electron-app)
6. [Verbindungsaufbau (SSH/SFTP)](#verbindungsaufbau-sshsftp)
7. [CSS-Variablen Mapping](#css-variablen-mapping)
8. [Wichtige Funktionen](#wichtige-funktionen)
9. [Testing & Debugging](#testing--debugging)

---

## 🎯 Übersicht

### Was macht diese Suchleiste?

Die Suchleiste ist ein modernes, overlay-basiertes Popup, das:
- **SSH- und SFTP-Verbindungen** durchsucht
- **Echtzeit-Filterung** nach Name, Host, User und Tags
- **Modus-Umschaltung** zwischen SSH und SFTP
- **Tastatur-Navigation** (ESC zum Schließen)
- **Kategorisierte Ergebnisse** (Production, Development, etc.)
- **Click-Handler** für direkten Verbindungsaufbau

### Technologie-Stack

- **Vanilla JavaScript** (ES6+)
- **CSS Custom Properties** (für einfache Theme-Anpassung)
- **JSON-basierte Datenquelle** (suche.json)
- **Electron-kompatibel** (IPC-Ready)

---

## 📦 Komponenten-Struktur

```
search-popup/
├── search-popup.css      # Alle Styles (CSS Variables, Popup, Results)
├── search-popup.js       # Alle Logik (Search, Filter, Events)
├── suche.json           # Verbindungsdaten (SSH/SFTP Connections)
└── index.html           # HTML-Struktur (Overlay + Popup)
```

### HTML-Struktur (aus index.html Zeile 58-94)

```html
<!-- Search Popup Overlay -->
<div id="search-overlay" class="search-overlay">
    <div id="search-popup" class="search-popup">
        <!-- Search Input Container -->
        <div class="search-input-container">
            <div class="search-icon">
                <svg><!-- Lupe Icon --></svg>
            </div>
            <input
                type="text"
                id="search-input"
                class="search-input"
                placeholder="Search for anything..."
                autocomplete="off"
            >
            <div class="search-actions">
                <button id="ssh-btn" class="action-btn active">
                    <svg><!-- SSH Icon --></svg>
                    SSH
                </button>
                <button id="sftp-btn" class="action-btn">
                    <svg><!-- SFTP Icon --></svg>
                    SFTP
                </button>
            </div>
        </div>

        <!-- Search Results Container (wird dynamisch befüllt) -->
        <div id="search-results" class="search-results"></div>
    </div>
</div>
```

---

## 📄 Benötigte Dateien

### 1. **search-popup.css** (445 Zeilen)

**Wichtige Sektionen:**
- **CSS Variablen** (Zeile 17-63): Alle Farben, Abstände, Animationen
- **Search Popup Styles** (Zeile 72-123): Overlay, Container, Expanded State
- **Search Input Styles** (Zeile 132-221): Suchfeld, Icons, Buttons
- **Search Results Styles** (Zeile 230-365): Ergebnisse, Items, Badges
- **Animations** (Zeile 374-410): Expand, Fade-In, Staggered Animation
- **Scrollbar Styling** (Zeile 429-444): Custom Scrollbar

### 2. **search-popup.js** (418 Zeilen)

**Hauptfunktionen:**
- `loadConnections()` (Zeile 161): Lädt Verbindungen aus suche.json
- `handleSearch()` (Zeile 181): Filtert und zeigt Ergebnisse
- `switchMode(mode)` (Zeile 133): Wechselt zwischen SSH/SFTP
- `handleConnectionClick(connection)` (Zeile 367): **WICHTIG für Electron-Integration**

### 3. **suche.json** (205 Zeilen)

**Datenstruktur:**
```json
{
  "connections": [
    {
      "id": "conn-001",
      "name": "Production Web Server",
      "type": "ssh",              // "ssh" oder "sftp"
      "host": "web-prod-01.example.com",
      "port": 22,
      "user": "admin",
      "category": "Production",   // Gruppierung
      "tags": ["web", "production", "critical"]
    }
  ]
}
```

**Wichtige Felder:**
- `type`: Muss `"ssh"` oder `"sftp"` sein (für Modus-Filter)
- `category`: Gruppiert Ergebnisse (z.B. "Production", "Development")
- `tags`: Array für zusätzliche Suchbegriffe

---

## 🔧 Schritt-für-Schritt Integration

### Phase 1: Dateien in Electron-App kopieren

```bash
# 1. Erstelle Verzeichnis für Search Popup
mkdir src/renderer/components/search-popup

# 2. Kopiere CSS
cp search-popup.css src/renderer/components/search-popup/

# 3. Kopiere JavaScript
cp search-popup.js src/renderer/components/search-popup/

# 4. Kopiere suche.json ins User-Data-Verzeichnis
# WICHTIG: In Electron sollte suche.json aus app.getPath('userData') geladen werden
```

### Phase 2: HTML in bestehende App integrieren

**In der Haupt-HTML-Datei der Electron-App:**

```html
<!-- SCHRITT 1: CSS einbinden (im <head>) -->
<link rel="stylesheet" href="components/search-popup/search-popup.css">

<!-- SCHRITT 2: HTML-Struktur einfügen (vor </body>) -->
<!-- Search Popup Overlay -->
<div id="search-overlay" class="search-overlay">
    <div id="search-popup" class="search-popup">
        <!-- ... komplette HTML-Struktur von oben ... -->
    </div>
</div>

<!-- SCHRITT 3: JavaScript einbinden (vor </body>) -->
<script src="components/search-popup/search-popup.js"></script>
```

### Phase 3: Alte Suchleiste entfernen

**Suche nach folgenden Elementen und entferne sie:**

```javascript
// 1. Suche nach der alten Suchleiste in HTML
// Identifiziere durch:
// - ID oder Klasse (z.B. "profile-search", "old-search-popup")
// - Suchfeld mit ähnlicher Funktion
```

```bash
# Finde alte Suchleiste
grep -r "profile.*search" src/renderer/
grep -r "class=\".*search.*popup" src/renderer/
```

**Entferne:**
1. **HTML:** Das alte Suchleisten-Markup
2. **CSS:** Alle Styles für die alte Suchleiste
3. **JavaScript:** Event-Listener und Funktionen der alten Suchleiste

### Phase 4: Button/Trigger anpassen

**Ersetze den alten Suchleisten-Button:**

```html
<!-- ALT -->
<button id="old-search-btn">Profile suchen</button>

<!-- NEU -->
<button id="search-btn" class="search-button">Verbindungen suchen</button>
```

**Im JavaScript (search-popup.js Zeile 75):**
```javascript
// Stelle sicher, dass die Button-ID korrekt ist
const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', openSearchPopup);
```

### Phase 5: Globaler Shortcut (Electron Main Process)

**In `main.js` (Electron Main Process):**

```javascript
const { app, BrowserWindow, globalShortcut } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        // ... window config
    });

    // Globaler Shortcut für Suchpopup (Cmd+K oder Ctrl+K)
    globalShortcut.register('CommandOrControl+K', () => {
        win.webContents.send('open-search-popup');
    });
}

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
```

**In Renderer Process (search-popup.js):**

```javascript
// Füge am Anfang der Datei hinzu
const { ipcRenderer } = require('electron');

// Event-Listener für IPC
ipcRenderer.on('open-search-popup', () => {
    openSearchPopup();
});
```

---

## 🎨 Anpassung an die Electron-App

### CSS-Variablen Mapping

**Die Suchleiste verwendet CSS Custom Properties (search-popup.css Zeile 17-63).**

**So passt du die Farben an deine Electron-App an:**

```css
/* In deiner main.css oder theme.css */
:root {
    /* Haupt-App Farben */
    --app-bg-primary: #1e1e1e;
    --app-bg-secondary: #2d2d2d;
    --app-text-primary: #e0e0e0;
    --app-text-secondary: #9ca3af;
    --app-accent-color: #3b82f6;
    --app-border-color: #3e3e3e;
}
```

**Dann in search-popup.css anpassen:**

```css
/* VORHER (Original-Werte) */
:root {
    --popup-bg: #ffffff;
    --popup-border-color: #e9e8e7;
    --search-input-bg: #f9fafb;
    --search-input-text: #1f2937;
    /* ... */
}

/* NACHHER (Angepasst an deine App) */
:root {
    --popup-bg: var(--app-bg-secondary);
    --popup-border-color: var(--app-border-color);
    --search-input-bg: var(--app-bg-primary);
    --search-input-text: var(--app-text-primary);
    --search-input-placeholder: var(--app-text-secondary);
    --search-input-focus-border: var(--app-accent-color);

    /* Button Farben */
    --action-btn-bg: var(--app-bg-primary);
    --action-btn-hover-bg: var(--app-bg-secondary);
    --action-btn-text: var(--app-text-secondary);
    --action-btn-active-text: var(--app-text-primary);

    /* Ergebnis Farben */
    --result-item-bg: var(--app-bg-primary);
    --result-item-hover-bg: var(--app-bg-secondary);
    --result-title-text: var(--app-text-primary);
    --result-subtitle-text: var(--app-text-secondary);
}
```

**Vollständige Mapping-Tabelle:**

| Suchleisten-Variable | Zweck | Ersetze mit App-Variable |
|---------------------|-------|--------------------------|
| `--popup-overlay-bg` | Overlay Hintergrund | Meist beibehalten oder anpassen an `rgba(var(--app-bg-primary-rgb), 0.8)` |
| `--popup-bg` | Popup Hintergrund | `var(--app-bg-secondary)` |
| `--popup-border-color` | Popup Rahmen | `var(--app-border-color)` |
| `--search-input-bg` | Suchfeld Hintergrund | `var(--app-bg-primary)` |
| `--search-input-text` | Suchfeld Text | `var(--app-text-primary)` |
| `--search-input-focus-border` | Fokus-Rahmen | `var(--app-accent-color)` |
| `--action-btn-bg` | Button Hintergrund | `var(--app-bg-primary)` |
| `--result-item-bg` | Ergebnis Hintergrund | `var(--app-bg-primary)` |
| `--result-title-text` | Ergebnis Titel | `var(--app-text-primary)` |
| `--icon-color` | Icon Farbe | `var(--app-text-secondary)` |

---

## 🔗 Verbindungsaufbau (SSH/SFTP)

### Verbindungsdaten laden

**WICHTIG:** In Electron muss `loadConnections()` angepasst werden!

**Original (search-popup.js Zeile 161):**
```javascript
async function loadConnections() {
    try {
        const response = await fetch('suche.json');
        const data = await response.json();
        allConnections = data.connections || [];
    } catch (error) {
        console.error('Fehler beim Laden der Verbindungen:', error);
    }
}
```

**Electron-Version (Renderer Process):**

```javascript
const { ipcRenderer } = require('electron');
const path = require('path');

async function loadConnections() {
    try {
        // Option 1: Lade aus User-Data-Verzeichnis via IPC
        const connections = await ipcRenderer.invoke('load-connections');
        allConnections = connections || [];
    } catch (error) {
        console.error('Fehler beim Laden der Verbindungen:', error);
        allConnections = [];
    }
}
```

**Main Process (main.js):**

```javascript
const { app, ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// IPC Handler für Verbindungen laden
ipcMain.handle('load-connections', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const connectionsPath = path.join(userDataPath, 'connections.json');

        // Prüfe ob Datei existiert
        try {
            await fs.access(connectionsPath);
        } catch {
            // Wenn nicht, erstelle default Datei
            await fs.writeFile(connectionsPath, JSON.stringify({ connections: [] }, null, 2));
        }

        const data = await fs.readFile(connectionsPath, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.connections || [];
    } catch (error) {
        console.error('Fehler beim Laden der Verbindungen:', error);
        return [];
    }
});
```

### Verbindungsaufbau implementieren

**Die wichtigste Funktion: `handleConnectionClick()` (search-popup.js Zeile 367)**

**Original (nur Alert):**
```javascript
function handleConnectionClick(connection) {
    console.log('Verbindung ausgewählt:', connection);
    alert(`Verbinde zu: ${connection.name}\n${connection.user}@${connection.host}:${connection.port}`);
    closeSearchPopup();
}
```

**Electron-Version (mit IPC):**

```javascript
const { ipcRenderer } = require('electron');

function handleConnectionClick(connection) {
    console.log('Verbindung ausgewählt:', connection);

    // Sende IPC-Event an Main Process
    if (connection.type === 'ssh') {
        ipcRenderer.send('connect-ssh', connection);
    } else if (connection.type === 'sftp') {
        ipcRenderer.send('connect-sftp', connection);
    }

    closeSearchPopup();
}
```

**Main Process (main.js) - SSH Verbindung:**

```javascript
const { ipcMain } = require('electron');
const { Client } = require('ssh2'); // npm install ssh2

ipcMain.on('connect-ssh', (event, connection) => {
    console.log('Baue SSH-Verbindung auf:', connection);

    const conn = new Client();

    conn.on('ready', () => {
        console.log('SSH-Verbindung bereit:', connection.name);

        // Öffne Shell
        conn.shell((err, stream) => {
            if (err) {
                console.error('Shell-Fehler:', err);
                event.reply('ssh-error', err.message);
                return;
            }

            // Stream-Handling für Terminal
            stream.on('data', (data) => {
                event.reply('ssh-data', data.toString());
            });

            stream.on('close', () => {
                console.log('SSH-Stream geschlossen');
                conn.end();
            });

            // Sende Bestätigung an Renderer
            event.reply('ssh-connected', {
                connectionId: connection.id,
                name: connection.name
            });
        });
    });

    conn.on('error', (err) => {
        console.error('SSH-Verbindungsfehler:', err);
        event.reply('ssh-error', err.message);
    });

    // Verbinde
    conn.connect({
        host: connection.host,
        port: connection.port,
        username: connection.user,
        // Authentifizierung (Passwort, Key, Agent)
        // WICHTIG: Sichere Speicherung erforderlich!
        // privateKey: await loadPrivateKey(connection.keyPath),
        // oder: agent: process.env.SSH_AUTH_SOCK
    });
});
```

**Main Process (main.js) - SFTP Verbindung:**

```javascript
ipcMain.on('connect-sftp', (event, connection) => {
    console.log('Baue SFTP-Verbindung auf:', connection);

    const conn = new Client();

    conn.on('ready', () => {
        console.log('SFTP-Verbindung bereit:', connection.name);

        conn.sftp((err, sftp) => {
            if (err) {
                console.error('SFTP-Fehler:', err);
                event.reply('sftp-error', err.message);
                return;
            }

            // Sende Bestätigung an Renderer
            event.reply('sftp-connected', {
                connectionId: connection.id,
                name: connection.name,
                sftp: sftp // WICHTIG: Speichere SFTP-Client für spätere Operationen
            });

            // Beispiel: Liste Verzeichnis
            sftp.readdir('/', (err, list) => {
                if (err) {
                    console.error('SFTP readdir Fehler:', err);
                    return;
                }
                event.reply('sftp-directory-list', list);
            });
        });
    });

    conn.on('error', (err) => {
        console.error('SFTP-Verbindungsfehler:', err);
        event.reply('sftp-error', err.message);
    });

    conn.connect({
        host: connection.host,
        port: connection.port,
        username: connection.user,
        // Authentifizierung wie bei SSH
    });
});
```

### Authentifizierung

**Wichtige Sicherheitsüberlegungen:**

1. **Passwörter NIEMALS im JSON speichern!**
2. **Verwende Electron's `safeStorage` API für Credentials:**

```javascript
const { safeStorage } = require('electron');

// Passwort verschlüsseln
function encryptPassword(password) {
    return safeStorage.encryptString(password).toString('base64');
}

// Passwort entschlüsseln
function decryptPassword(encrypted) {
    const buffer = Buffer.from(encrypted, 'base64');
    return safeStorage.decryptString(buffer);
}
```

3. **Erweitere suche.json um Authentifizierungs-Info:**

```json
{
  "id": "conn-001",
  "name": "Production Web Server",
  "type": "ssh",
  "host": "web-prod-01.example.com",
  "port": 22,
  "user": "admin",
  "authType": "key",
  "keyPath": "/Users/niklas/.ssh/id_rsa",
  "keyEncrypted": false
}
```

**Auth-Typen:**
- `"key"`: SSH-Key Authentifizierung
- `"password"`: Passwort (verschlüsselt gespeichert)
- `"agent"`: SSH-Agent Authentifizierung

4. **Lade Private Key sicher:**

```javascript
const fs = require('fs').promises;

async function loadPrivateKey(keyPath) {
    try {
        const keyData = await fs.readFile(keyPath, 'utf8');
        return keyData;
    } catch (error) {
        console.error('Fehler beim Laden des Private Keys:', error);
        throw error;
    }
}
```

---

## ⚙️ Wichtige Funktionen

### 1. `openSearchPopup()` (Zeile 107)

**Was sie tut:**
- Zeigt Overlay an (`.search-overlay.active`)
- Fokussiert Suchfeld
- Zeigt alle Verbindungen des aktuellen Modus

**Verwendung:**
```javascript
// Via Button
document.getElementById('search-btn').addEventListener('click', openSearchPopup);

// Via IPC (Globaler Shortcut)
ipcRenderer.on('open-search-popup', openSearchPopup);

// Programmatisch
openSearchPopup();
```

### 2. `closeSearchPopup()` (Zeile 117)

**Was sie tut:**
- Versteckt Overlay
- Leert Suchfeld
- Entfernt Ergebnisse
- Entfernt `expanded` State

**Automatisches Schließen:**
- ESC-Taste (Zeile 86)
- Klick auf Overlay (Zeile 78)
- Nach Verbindungsauswahl (Zeile 373)

### 3. `switchMode(mode)` (Zeile 133)

**Was sie tut:**
- Wechselt zwischen `'ssh'` und `'sftp'`
- Aktualisiert Button-States (`.active`)
- Filtert Ergebnisse neu

**Verwendung:**
```javascript
switchMode('ssh');   // Zeigt nur SSH-Verbindungen
switchMode('sftp');  // Zeigt nur SFTP-Verbindungen
```

### 4. `handleSearch()` (Zeile 181)

**Filterlogik (Zeile 184-197):**
```javascript
// 1. Filter nach Typ (ssh/sftp)
let filteredConnections = allConnections.filter(conn => conn.type === currentMode);

// 2. Filter nach Suchbegriff
if (query) {
    filteredConnections = filteredConnections.filter(conn => {
        return (
            conn.name.toLowerCase().includes(query) ||      // Name
            conn.host.toLowerCase().includes(query) ||      // Host
            conn.user.toLowerCase().includes(query) ||      // User
            (conn.tags && conn.tags.some(tag => tag.toLowerCase().includes(query)))  // Tags
        );
    });
}
```

**Erweiterte Suchoptionen:**

```javascript
// Zusätzlich nach Port suchen
conn.port.toString().includes(query) ||

// Zusätzlich nach Kategorie suchen
conn.category.toLowerCase().includes(query) ||

// Fuzzy Search implementieren
fuzzyMatch(conn.name, query)
```

### 5. `displayResults(results, query)` (Zeile 221)

**Was sie tut:**
- Leert Ergebniscontainer
- Zeigt Empty State bei 0 Ergebnissen
- Gruppiert nach Kategorie
- Rendert HTML für jedes Ergebnis
- Fügt Click-Handler hinzu

**Ergebnis-HTML-Struktur (Zeile 290-299):**
```html
<div class="result-item" data-connection='{"id":"conn-001",...}'>
    <div class="result-icon">[SVG]</div>
    <div class="result-content">
        <div class="result-title">Production Web Server</div>
        <div class="result-subtitle">admin@web-prod-01.example.com:22</div>
    </div>
    <div class="result-badge">
        <span class="badge">web</span>
    </div>
</div>
```

### 6. `handleConnectionClick(connection)` (Zeile 367)

**⚠️ WICHTIGSTE FUNKTION FÜR INTEGRATION!**

**Original:**
```javascript
function handleConnectionClick(connection) {
    console.log('Verbindung ausgewählt:', connection);
    alert(`Verbinde zu: ${connection.name}\n${connection.user}@${connection.host}:${connection.port}`);
    closeSearchPopup();
}
```

**Das musst du anpassen:**

```javascript
const { ipcRenderer } = require('electron');

function handleConnectionClick(connection) {
    console.log('Verbindung ausgewählt:', connection);

    // 1. Schließe Popup
    closeSearchPopup();

    // 2. Zeige Loading-Indikator (optional)
    showConnectionLoader(connection.name);

    // 3. Sende IPC-Event basierend auf Typ
    if (connection.type === 'ssh') {
        ipcRenderer.send('connect-ssh', connection);
    } else if (connection.type === 'sftp') {
        ipcRenderer.send('connect-sftp', connection);
    }

    // 4. Höre auf Erfolg/Fehler
    ipcRenderer.once('connection-success', (event, data) => {
        hideConnectionLoader();
        showNotification(`Verbunden mit ${connection.name}`, 'success');

        // Optional: Öffne neue Terminal-Tab oder SFTP-View
        openConnectionView(connection, data);
    });

    ipcRenderer.once('connection-error', (event, error) => {
        hideConnectionLoader();
        showNotification(`Fehler: ${error}`, 'error');
    });
}
```

---

## 🧪 Testing & Debugging

### Manuelle Tests

**Checkliste für Integration:**

- [ ] **Popup öffnet sich** via Button-Klick
- [ ] **Popup öffnet sich** via Keyboard-Shortcut (Cmd/Ctrl+K)
- [ ] **Popup schließt** via ESC-Taste
- [ ] **Popup schließt** via Klick auf Overlay
- [ ] **Suchfeld** zeigt alle SSH-Verbindungen initial
- [ ] **SSH/SFTP Toggle** funktioniert
- [ ] **Echtzeit-Suche** filtert nach Name, Host, User, Tags
- [ ] **Ergebnisse** sind nach Kategorie gruppiert
- [ ] **Click auf Verbindung** ruft `handleConnectionClick()` auf
- [ ] **SSH-Verbindung** wird korrekt aufgebaut
- [ ] **SFTP-Verbindung** wird korrekt aufgebaut
- [ ] **CSS-Farben** passen zum App-Theme
- [ ] **Animationen** laufen flüssig
- [ ] **Keine Fehler** in DevTools Console

### Debug-Tipps

**1. Verbindungen laden nicht:**

```javascript
// In loadConnections() hinzufügen
console.log('Geladene Verbindungen:', allConnections);

// Prüfe Dateipfad
console.log('Lade von:', await ipcRenderer.invoke('get-connections-path'));
```

**2. Suche findet nichts:**

```javascript
// In handleSearch() hinzufügen
console.log('Query:', query);
console.log('Current Mode:', currentMode);
console.log('Gefiltert:', filteredConnections);
```

**3. Click-Handler feuert nicht:**

```javascript
// In addResultClickHandlers() hinzufügen
console.log('Click-Handler hinzugefügt für', resultItems.length, 'Items');

// In handleConnectionClick() hinzufügen
console.log('Connection clicked:', connection);
```

**4. CSS nicht korrekt:**

```javascript
// Öffne DevTools Elements Tab
// Inspiziere .search-popup Element
// Prüfe Computed Styles für CSS-Variablen
```

### Debugging mit Chrome DevTools

```javascript
// Öffne in Electron Main Process
mainWindow.webContents.openDevTools();

// Setze Breakpoints in search-popup.js:
// - Zeile 181 (handleSearch)
// - Zeile 367 (handleConnectionClick)
// - Zeile 161 (loadConnections)
```

---

## 📝 Zusammenfassung der Änderungen

### Was du BEHALTEN kannst:

✅ Komplette HTML-Struktur (index.html Zeile 58-94)
✅ CSS-Datei vollständig (nur Variablen anpassen)
✅ JavaScript-Logik für UI (Popup, Suche, Filter)

### Was du ANPASSEN musst:

🔧 `loadConnections()`: Fetch → IPC-Call
🔧 `handleConnectionClick()`: Alert → SSH/SFTP Connection
🔧 CSS-Variablen: Hardcoded Colors → App Theme Variables
🔧 Datenquelle: suche.json → User Data Directory

### Was du HINZUFÜGEN musst:

➕ IPC-Handler im Main Process (connect-ssh, connect-sftp, load-connections)
➕ SSH2 Client-Implementierung
➕ Credential-Management (safeStorage)
➕ Connection-View/Terminal-Integration
➕ Error-Handling & User-Feedback

---

## 🚀 Quick Start Checklist

```bash
# 1. Dateien kopieren
cp search-popup.css src/renderer/components/
cp search-popup.js src/renderer/components/
cp suche.json ~/.electron-app/connections.json

# 2. HTML integrieren
# Füge Overlay-HTML in main.html ein

# 3. CSS-Variablen anpassen
# Öffne search-popup.css, ersetze :root Variablen

# 4. JavaScript anpassen
# Öffne search-popup.js:
#   - Zeile 161: loadConnections() → IPC
#   - Zeile 367: handleConnectionClick() → SSH/SFTP

# 5. IPC-Handler hinzufügen
# Öffne main.js, füge Handler hinzu

# 6. Alte Suchleiste entfernen
# Lösche altes HTML/CSS/JS

# 7. Testen
npm run dev
```

---

## 📚 Zusätzliche Ressourcen

**Electron Dokumentation:**
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Safe Storage API](https://www.electronjs.org/docs/latest/api/safe-storage)
- [Global Shortcuts](https://www.electronjs.org/docs/latest/api/global-shortcut)

**SSH2 Dokumentation:**
- [ssh2 npm package](https://www.npmjs.com/package/ssh2)
- [SSH Client Examples](https://github.com/mscdex/ssh2#client-examples)

**CSS Custom Properties:**
- [MDN: Using CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

## 🔒 Sicherheitshinweise

⚠️ **NIEMALS Passwörter unverschlüsselt speichern!**
⚠️ **Verwende Electron's safeStorage für Credentials**
⚠️ **Validiere alle User-Inputs (XSS-Schutz via escapeHtml())**
⚠️ **Speichere connections.json mit korrekten Dateiberechtigungen (chmod 600)**
⚠️ **Verwende SSH-Agent wenn möglich (sichere Key-Verwaltung)**

---

## 💡 Tipps & Best Practices

### Performance

**Große Connection-Listen:**
```javascript
// Implementiere Virtual Scrolling für > 100 Verbindungen
// Verwende Debouncing für Suche
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 300);
});
```

### User Experience

**Loading States:**
```javascript
// Zeige Spinner während Verbindungsaufbau
function showConnectionLoader(name) {
    // Implementierung: Overlay mit Spinner
}
```

**Keyboard Navigation:**
```javascript
// Erweitere um Pfeiltasten-Navigation durch Ergebnisse
// Enter zum Verbinden
document.addEventListener('keydown', (e) => {
    if (!searchOverlay.classList.contains('active')) return;

    if (e.key === 'ArrowDown') selectNextResult();
    if (e.key === 'ArrowUp') selectPreviousResult();
    if (e.key === 'Enter') connectToSelectedResult();
});
```

### Error Handling

```javascript
// Implementiere Retry-Logik
async function connectWithRetry(connection, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await connect(connection);
            return;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(1000 * (i + 1)); // Exponential backoff
        }
    }
}
```

---

**Ende der Integration-Anleitung**

*Bei Fragen oder Problemen: Prüfe Console-Logs und vergleiche mit Original-Implementierung.*
