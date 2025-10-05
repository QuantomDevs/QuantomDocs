# QuantomDocs - Umfassende Verbesserungsvorschläge & Optimierungsstrategien

**Dokument-Version**: 1.0
**Erstellt am**: 2025-10-04
**Zuletzt aktualisiert**: 2025-10-04
**Status**: Vorschlagsdokument für zukünftige Entwicklung

---

## Inhaltsverzeichnis

1. [Architektur & Skalierbarkeit](#1-architektur--skalierbarkeit)
2. [Features & Funktionalität](#2-features--funktionalität)
3. [Performance-Optimierung](#3-performance-optimierung)
4. [Developer Experience](#4-developer-experience)
5. [Content-Erweiterungen](#5-content-erweiterungen)
6. [Technical Debt & Code-Qualität](#6-technical-debt--code-qualität)
7. [Analytics & Monitoring](#7-analytics--monitoring)
8. [Quick Wins](#8-quick-wins-hoher-impact-geringer-aufwand)
9. [Langfristige Skalierbarkeit](#9-langfristige-skalierbarkeit)
10. [Implementierungs-Roadmap](#10-implementierungs-roadmap)

---

## 1. Architektur & Skalierbarkeit

### 1.1 Content Management System (CMS)

#### **Aktuelles Problem**
Die aktuelle Lösung verwendet JSON-Dateien (`docs-config.json`, `downloads.json`, `blog.json`) für die Content-Verwaltung. Dies ist zwar einfach und funktioniert gut für kleine bis mittlere Projekte, hat aber erhebliche Einschränkungen:

- **Keine Versionierung**: Änderungen an Content sind nicht nachvollziehbar
- **Keine Benutzerrollen**: Jeder mit Dateizugriff kann alles ändern
- **Keine Workflow-Unterstützung**: Keine Draft/Review/Publish-Workflows
- **Schwierige Zusammenarbeit**: Mehrere Personen können nicht gleichzeitig editieren
- **Keine Asset-Verwaltung**: Bilder und andere Medien müssen manuell verwaltet werden
- **Keine Such-/Filterfunktionen**: Schwierig, Content zu organisieren bei wachsender Menge

#### **Vorgeschlagene Lösung: Headless CMS**

**Empfohlene Optionen:**

1. **Strapi** (Open Source, selbst gehostet)
   - Vollständig anpassbar und erweiterbar
   - GraphQL und REST API
   - Benutzer- und Rollenverwaltung integriert
   - Media Library für Asset-Management
   - Kostenlos und Open Source
   - **Ideal für**: Volle Kontrolle und Anpassbarkeit

2. **Directus** (Open Source, selbst gehostet)
   - Arbeitet direkt mit SQL-Datenbank
   - Sehr flexible Datenmodellierung
   - Moderne Admin-UI
   - Unterstützt verschiedene Datenbanken (PostgreSQL, MySQL, SQLite)
   - **Ideal für**: Datenbankbasierte Projekte

3. **Sanity.io** (Cloud-basiert, Freemium)
   - Echtzeit-Zusammenarbeit
   - Strukturierter Content mit portablem Text
   - Hervorragende Developer Experience
   - Kostenloser Tier verfügbar
   - **Ideal für**: Schneller Start mit Cloud-Lösung

#### **Implementierungs-Roadmap für CMS-Migration**

**Phase 1: Vorbereitung (1-2 Wochen)**
- Aktuelle Content-Struktur analysieren und dokumentieren
- CMS-Auswahl treffen (basierend auf Anforderungen)
- CMS lokal aufsetzen und testen
- Content-Modelle definieren (Documentation, Downloads, Blog, etc.)

**Phase 2: Schema-Design (1 Woche)**
```javascript
// Beispiel: Strapi Content-Type für Documentation
{
  "kind": "collectionType",
  "collectionName": "docs",
  "info": {
    "singularName": "doc",
    "pluralName": "docs",
    "displayName": "Documentation"
  },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::category.category" },
    "content": { "type": "richtext" },
    "markdownContent": { "type": "text" },
    "order": { "type": "integer" },
    "tags": { "type": "json" },
    "version": { "type": "string" },
    "lastUpdated": { "type": "datetime" },
    "author": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "isPublished": { "type": "boolean", "default": false }
  }
}
```

**Phase 3: Daten-Migration (2-3 Wochen)**
- Migration-Scripts für bestehende JSON-Daten erstellen
- Content in CMS importieren
- Verlinkungen und Beziehungen überprüfen
- Asset-Upload (Bilder, Downloads)

**Phase 4: Frontend-Integration (2-3 Wochen)**
- API-Endpunkte für Frontend erstellen
- Frontend-Code anpassen für CMS-API-Calls
- Caching-Layer implementieren
- Fehlerbehandlung und Fallbacks

**Phase 5: Testing & Rollout (1-2 Wochen)**
- Umfangreiche Tests aller Funktionen
- Performance-Tests
- Schrittweiser Rollout (z.B. erst Blog, dann Docs)
- Monitoring und Optimierung

#### **Vorteile nach Implementation**
- ✅ Einfaches Content-Management über Web-Interface
- ✅ Mehrsprachigkeit out-of-the-box
- ✅ Versionierung und Revision-History
- ✅ Benutzer- und Rollen-Management
- ✅ Media Library für einfaches Asset-Management
- ✅ RESTful/GraphQL API für flexible Integration
- ✅ Workflow-Management (Draft → Review → Publish)

---

### 1.2 Build-System & Static Site Generation

#### **Aktuelles Problem**
Die Website lädt Markdown-Dateien zur Laufzeit und rendert sie client-seitig mit Marked.js:

```javascript
// Aktueller Ansatz in docs.js
const loadMarkdown = async (filePath) => {
    const response = await fetch(filePath);
    const markdown = await response.text();
    document.getElementById('dynamic-content-area').innerHTML = marked.parse(markdown);
};
```

**Probleme dabei:**
- **Langsame initiale Ladezeit**: Jede Seite muss erst geladen und geparst werden
- **Keine SEO-Optimierung**: Suchmaschinen sehen nur leere HTML-Container
- **Kein Code-Splitting**: Marked.js wird immer geladen, auch wenn nicht benötigt
- **Keine Build-Zeit-Optimierungen**: Bilder werden nicht optimiert, Code nicht minifiziert
- **Client-seitige Fehler**: Wenn JavaScript fehlschlägt, ist die Seite leer

#### **Vorgeschlagene Lösung: Static Site Generation (SSG)**

**Empfohlene Tools:**

1. **VitePress** (Vue-basiert)
   - Speziell für Dokumentation entwickelt
   - Extrem schnell (Vite-basiert)
   - Markdown-fokussiert mit Vue-Komponenten-Support
   - Eingebaute Suche, Sidebar-Generation
   - **Ideal für**: Reine Dokumentations-Seiten

2. **Docusaurus** (React-basiert)
   - Von Facebook/Meta entwickelt
   - Sehr feature-reich (Versioning, i18n, Suche)
   - Große Community und viele Plugins
   - Blog-Funktion integriert
   - **Ideal für**: Komplette Dokumentations-Websites mit Community

3. **Astro** (Framework-agnostisch)
   - "Bring your own framework" (React, Vue, Svelte, etc.)
   - Zero JavaScript by default (Islands Architecture)
   - Extrem schnell
   - Sehr flexibel
   - **Ideal für**: Maximum Performance und Flexibilität

#### **Implementierungs-Beispiel mit VitePress**

**1. Installation und Setup**
```bash
npm init vitepress
npm install
```

**2. Konfiguration (`.vitepress/config.js`)**
```javascript
export default {
  title: 'Quantom Docs',
  description: 'Documentation for Quantom Minecraft Server',

  themeConfig: {
    logo: '/favicon.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Downloads', link: '/downloads' },
      { text: 'Docs', link: '/docs/' },
    ],

    sidebar: {
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/docs/getting-started' },
            { text: 'FAQ', link: '/docs/faq' },
          ]
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Quantom Global', link: '/docs/config-quantom-global' },
            { text: 'Quantom Config', link: '/docs/quantom-config' },
          ]
        },
        // ... weitere Kategorien
      ]
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

**3. Automatische Sidebar-Generierung**
```javascript
// utils/generateSidebar.js
import fs from 'fs';
import path from 'path';

export function generateSidebar(docsPath) {
  const categories = fs.readdirSync(docsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const categoryPath = path.join(docsPath, dirent.name);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          text: formatTitle(file),
          link: `/docs/${dirent.name}/${file.replace('.md', '')}`
        }));

      return {
        text: formatTitle(dirent.name),
        items: files
      };
    });

  return categories;
}
```

**4. Build und Deployment**
```json
{
  "scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  }
}
```

#### **Vorteile nach Implementation**
- ✅ **10x schnellere Ladezeiten**: Pre-rendered HTML
- ✅ **Perfektes SEO**: Vollständiger HTML-Content für Crawler
- ✅ **Offline-fähig**: Progressive Web App (PWA) Support
- ✅ **Automatische Code-Optimierung**: Minifizierung, Tree-shaking
- ✅ **Hot Module Replacement (HMR)**: Instant Updates während Entwicklung
- ✅ **Automatische Bild-Optimierung**: WebP-Konvertierung, Lazy-Loading
- ✅ **Built-in Features**: Suche, Sidebar, Dark Mode, etc.

#### **Migration-Strategie**
1. Parallel-Entwicklung: Neue SSG-Version parallel zur aktuellen entwickeln
2. Feature-Parity sicherstellen: Alle bestehenden Features portieren
3. Schrittweiser Rollout: Erst Staging, dann Production
4. Redirects einrichten: Alte URLs auf neue mappen
5. Monitoring: Performance und Fehler überwachen

---

### 1.3 Verbesserte Datei-Organisation

#### **Aktuelle Struktur**
```
docs/
  ├── config-quantom-global.md
  ├── quantom-config.md
  ├── downloads-manager-usage.md
  ├── example-features.md
  ├── faq.md
  ├── how-to-optimize-server.md
  ├── linux_commands_reference.md
  ├── mysql-reference.md
  ├── neueinstalation.md
  ├── preset-motd.md
  ├── python_venv_readme.md
  └── readme/
      └── README.md
```

**Probleme:**
- Alle Dateien in einem Ordner (schwer zu navigieren bei Wachstum)
- Keine klare Kategorisierung durch Ordnerstruktur
- Inkonsistente Namenskonventionen (snake_case, kebab-case, camelCase)
- README in eigenem Ordner isoliert

#### **Vorgeschlagene Struktur**
```
docs/
  ├── index.md                          # Hauptseite
  ├── getting-started/
  │   ├── index.md                      # Übersicht
  │   ├── introduction.md               # Was ist Quantom?
  │   ├── installation.md               # Erste Installation
  │   ├── quick-start.md                # Quick Start Guide
  │   └── faq.md                        # Häufige Fragen
  │
  ├── configuration/
  │   ├── index.md                      # Übersicht Konfiguration
  │   ├── quantom-global.md             # Global Config
  │   ├── quantom-config.md             # Main Config
  │   ├── server-properties.md          # Server Properties
  │   └── advanced/
  │       ├── performance-tuning.md     # Performance-Optimierung
  │       └── network-settings.md       # Netzwerk-Einstellungen
  │
  ├── guides/
  │   ├── index.md                      # Guide-Übersicht
  │   ├── server-optimization.md        # Server optimieren
  │   ├── plugin-installation.md        # Plugins installieren
  │   ├── world-management.md           # Welten verwalten
  │   ├── backup-restore.md             # Backup & Restore
  │   └── troubleshooting/
  │       ├── common-issues.md          # Häufige Probleme
  │       ├── performance-issues.md     # Performance-Probleme
  │       └── crash-reports.md          # Crash-Reports analysieren
  │
  ├── development/
  │   ├── index.md                      # Dev-Übersicht
  │   ├── getting-started.md            # Dev Setup
  │   ├── api-reference.md              # API-Dokumentation
  │   ├── contributing.md               # Contribution Guide
  │   ├── plugin-development/
  │   │   ├── basics.md                 # Plugin-Grundlagen
  │   │   ├── events.md                 # Event-System
  │   │   └── commands.md               # Command-API
  │   └── building-quantom.md           # Quantom bauen
  │
  ├── reference/
  │   ├── index.md                      # Referenz-Übersicht
  │   ├── commands.md                   # Alle Commands
  │   ├── permissions.md                # Permissions-Liste
  │   ├── configuration-options.md      # Alle Config-Optionen
  │   ├── linux-commands.md             # Linux-Befehle
  │   ├── mysql-reference.md            # MySQL-Referenz
  │   └── preset-motd.md                # MOTD-Presets
  │
  ├── tools/
  │   ├── downloads-manager.md          # Downloads-Manager nutzen
  │   ├── python-venv.md                # Python VEnv Setup
  │   └── discord-bot.md                # Discord-Bot nutzen
  │
  └── assets/
      ├── images/
      │   ├── getting-started/
      │   ├── configuration/
      │   └── guides/
      ├── diagrams/
      └── downloads/
```

#### **Naming-Konventionen**

**Einheitliche Regeln:**
1. **Ordner**: Immer `kebab-case` (z.B. `getting-started`, `plugin-development`)
2. **Dateien**: Immer `kebab-case` mit `.md` Extension (z.B. `quick-start.md`)
3. **Assets**: Beschreibender Name mit Kontext (z.B. `server-config-example.png`)
4. **Index-Dateien**: Jeder Ordner hat `index.md` als Einstiegspunkt

**Vorteile:**
- Einfache Navigation durch logische Gruppierung
- Skalierbar für hunderte von Dokumenten
- Klare Verantwortlichkeiten
- SEO-freundliche URLs
- Einfache Maintenance

#### **Automatische Migration**

**Migration-Script (Node.js):**
```javascript
// migrate-docs.js
import fs from 'fs';
import path from 'path';

const migrations = [
  { from: 'config-quantom-global.md', to: 'configuration/quantom-global.md' },
  { from: 'quantom-config.md', to: 'configuration/quantom-config.md' },
  { from: 'how-to-optimize-server.md', to: 'guides/server-optimization.md' },
  { from: 'linux_commands_reference.md', to: 'reference/linux-commands.md' },
  { from: 'mysql-reference.md', to: 'reference/mysql-reference.md' },
  { from: 'neueinstalation.md', to: 'getting-started/installation.md' },
  { from: 'faq.md', to: 'getting-started/faq.md' },
  { from: 'downloads-manager-usage.md', to: 'tools/downloads-manager.md' },
  { from: 'python_venv_readme.md', to: 'tools/python-venv.md' },
  // ... weitere Mappings
];

function migrateFiles() {
  migrations.forEach(({ from, to }) => {
    const sourcePath = path.join('docs', from);
    const targetPath = path.join('docs', to);
    const targetDir = path.dirname(targetPath);

    // Erstelle Ziel-Verzeichnis
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Kopiere Datei
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Migrated: ${from} → ${to}`);
    } else {
      console.warn(`⚠ Not found: ${from}`);
    }
  });
}

migrateFiles();
```

**Update Config:**
```javascript
// update-docs-config.js
import fs from 'fs';

const oldConfig = JSON.parse(fs.readFileSync('config/docs-config.json', 'utf-8'));

const newConfig = [
  {
    category: "Getting Started",
    items: [
      { name: "Introduction", type: "md", file: "getting-started/introduction.md" },
      { name: "Installation", type: "md", file: "getting-started/installation.md" },
      { name: "Quick Start", type: "md", file: "getting-started/quick-start.md" },
      { name: "FAQ", type: "md", file: "getting-started/faq.md" }
    ]
  },
  // ... weitere Kategorien
];

fs.writeFileSync('config/docs-config.json', JSON.stringify(newConfig, null, 2));
console.log('✓ Config updated');
```

---

## 2. Features & Funktionalität

### 2.1 Such-Verbesserungen

#### **Aktuelle Implementation**
Die aktuelle Suche (`docs-search.js`) bietet grundlegende Funktionalität:

```javascript
// Einfache String-Matching-Suche
const filteredEntries = allDocsEntries.filter(entry => {
    const nameMatch = entry.name.toLowerCase().includes(query);
    const categoryMatch = entry.category.toLowerCase().includes(query);
    const contentMatch = entry.content.toLowerCase().includes(query);
    return nameMatch || categoryMatch || contentMatch;
});
```

**Einschränkungen:**
- ❌ Nur exakte String-Matches (keine Tippfehler-Toleranz)
- ❌ Keine Relevanz-Sortierung (alle Treffer gleich gewichtet)
- ❌ Keine Highlighting von Suchbegriffen im Titel
- ❌ Keine Suchhistorie
- ❌ Keine Tastatur-Navigation zwischen Ergebnissen
- ❌ Keine Suchvorschläge/Autocomplete
- ❌ Keine Filterung nach Kategorie/Tag

#### **Vorgeschlagene Verbesserungen**

##### **2.1.1 Fuzzy Search mit Fuse.js**

**Installation:**
```bash
npm install fuse.js
```

**Implementation:**
```javascript
// Enhanced docs-search.js
import Fuse from 'fuse.js';

let fuseInstance = null;

async function buildSearchIndex() {
    // ... bestehender Code zum Laden der Docs ...

    // Fuse.js Konfiguration
    const fuseOptions = {
        keys: [
            { name: 'name', weight: 0.5 },        // Titel am wichtigsten
            { name: 'category', weight: 0.2 },    // Kategorie zweitwichtigst
            { name: 'content', weight: 0.3 }      // Content-Match
        ],
        threshold: 0.4,                           // Fuzzy-Match-Schwellwert (0 = exakt, 1 = alles)
        ignoreLocation: true,                     // Position im String egal
        minMatchCharLength: 2,                    // Mindestens 2 Zeichen
        shouldSort: true,                         // Nach Relevanz sortieren
        includeScore: true,                       // Score zurückgeben
        includeMatches: true                      // Matches für Highlighting
    };

    fuseInstance = new Fuse(allDocsEntries, fuseOptions);
}

function handleDocsSearch() {
    const query = docsSearchInput.value.trim();

    if (!query) {
        displayDocsResults(allDocsEntries, query);
        return;
    }

    // Fuzzy Search
    const results = fuseInstance.search(query);

    // Ergebnisse mit Score und Highlighting
    const processedResults = results.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
    }));

    displayDocsResults(processedResults, query);
}
```

**Vorteile:**
- ✅ Findet "quantm" auch wenn User "quantum" sucht
- ✅ Tippfehler-tolerant
- ✅ Intelligente Relevanz-Sortierung
- ✅ Schnell auch bei tausenden Einträgen

##### **2.1.2 Erweiterte Ergebnis-Anzeige mit Highlighting**

```javascript
function createDocsResultItem(entry, query, matches) {
    const icon = getDocsIcon(entry.type);
    const highlightedTitle = highlightMatches(entry.name, matches, 'name');
    const preview = getContentPreview(entry.content, query, matches);
    const scoreIndicator = getRelevanceIndicator(entry.score);

    return `
        <div class="docs-result-item" data-entry='${JSON.stringify({file: entry.file, id: entry.id})}'>
            <div class="docs-result-icon">${icon}</div>
            <div class="docs-result-content">
                <div class="docs-result-breadcrumb">
                    ${escapeHtml(entry.category)}
                    ${scoreIndicator}
                </div>
                <div class="docs-result-title">${highlightedTitle}</div>
                ${preview ? `<div class="docs-result-preview">${preview}</div>` : ''}
            </div>
            <div class="docs-result-shortcut">
                <kbd>↵</kbd>
            </div>
        </div>
    `;
}

function highlightMatches(text, matches, key) {
    if (!matches) return escapeHtml(text);

    const match = matches.find(m => m.key === key);
    if (!match) return escapeHtml(text);

    let result = escapeHtml(text);

    // Sortiere Indices rückwärts um String-Offsets zu vermeiden
    const sortedIndices = match.indices.sort((a, b) => b[0] - a[0]);

    sortedIndices.forEach(([start, end]) => {
        const before = result.substring(0, start);
        const matched = result.substring(start, end + 1);
        const after = result.substring(end + 1);
        result = `${before}<mark class="search-highlight">${matched}</mark>${after}`;
    });

    return result;
}

function getRelevanceIndicator(score) {
    if (score < 0.1) return '<span class="relevance-badge high">Exact</span>';
    if (score < 0.3) return '<span class="relevance-badge medium">Good</span>';
    return '<span class="relevance-badge low">Match</span>';
}
```

**CSS für Highlighting:**
```css
.search-highlight {
    background-color: var(--accent-color);
    color: var(--background-color);
    font-weight: 600;
    padding: 0 2px;
    border-radius: 2px;
}

.relevance-badge {
    font-size: 0.7em;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 8px;
}

.relevance-badge.high {
    background-color: #4ade80;
    color: #1a1a1a;
}

.relevance-badge.medium {
    background-color: #fbbf24;
    color: #1a1a1a;
}

.relevance-badge.low {
    background-color: #94a3b8;
    color: #1a1a1a;
}
```

##### **2.1.3 Tastatur-Navigation**

```javascript
let selectedResultIndex = -1;
let currentResults = [];

function registerDocsSearchListeners(searchBtn) {
    // ... bestehender Code ...

    // Tastatur-Navigation
    docsSearchInput.addEventListener('keydown', (e) => {
        const resultItems = document.querySelectorAll('.docs-result-item');

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedResultIndex = Math.min(selectedResultIndex + 1, resultItems.length - 1);
                updateSelectedResult(resultItems);
                break;

            case 'ArrowUp':
                e.preventDefault();
                selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
                updateSelectedResult(resultItems);
                break;

            case 'Enter':
                e.preventDefault();
                if (selectedResultIndex >= 0 && resultItems[selectedResultIndex]) {
                    const entry = JSON.parse(resultItems[selectedResultIndex].dataset.entry);
                    handleDocsResultClick(entry);
                }
                break;

            case 'Escape':
                closeDocsSearchPopup();
                break;
        }
    });
}

function updateSelectedResult(resultItems) {
    resultItems.forEach((item, index) => {
        if (index === selectedResultIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}
```

**CSS für Selektion:**
```css
.docs-result-item {
    cursor: pointer;
    transition: all 0.2s ease;
}

.docs-result-item.selected {
    background-color: rgba(217, 119, 87, 0.1);
    border-left: 3px solid var(--accent-color);
    padding-left: 17px; /* Kompensiert Border */
}

.docs-result-shortcut {
    opacity: 0;
    transition: opacity 0.2s;
}

.docs-result-item.selected .docs-result-shortcut {
    opacity: 1;
}
```

##### **2.1.4 Suchhistorie**

```javascript
const SEARCH_HISTORY_KEY = 'quantom_search_history';
const MAX_HISTORY_ITEMS = 10;

function saveSearchQuery(query) {
    if (!query || query.length < 2) return;

    let history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');

    // Entferne Duplikate
    history = history.filter(item => item.query !== query);

    // Füge neue Query am Anfang hinzu
    history.unshift({
        query: query,
        timestamp: Date.now()
    });

    // Limitiere auf MAX_HISTORY_ITEMS
    history = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function showSearchHistory() {
    const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');

    if (history.length === 0) {
        docsSearchResults.innerHTML = `
            <div class="search-history-empty">
                <i class="fas fa-history"></i>
                <p>No recent searches</p>
            </div>
        `;
        return;
    }

    const historyHTML = `
        <div class="search-history">
            <div class="search-history-header">
                <h4><i class="fas fa-history"></i> Recent Searches</h4>
                <button class="clear-history-btn" onclick="clearSearchHistory()">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
            <div class="search-history-items">
                ${history.map(item => `
                    <div class="search-history-item" onclick="loadHistoryQuery('${escapeHtml(item.query)}')">
                        <i class="fas fa-clock"></i>
                        <span>${escapeHtml(item.query)}</span>
                        <span class="search-history-time">${formatTimeAgo(item.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    docsSearchResults.innerHTML = historyHTML;
}

function loadHistoryQuery(query) {
    docsSearchInput.value = query;
    handleDocsSearch();
}

function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    showSearchHistory();
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
```

##### **2.1.5 Filter-System**

```javascript
// Filter-UI in search popup
function addSearchFilters() {
    const filterHTML = `
        <div class="docs-search-filters">
            <button class="filter-chip active" data-filter="all">
                All
            </button>
            <button class="filter-chip" data-filter="guides">
                <i class="fas fa-book"></i> Guides
            </button>
            <button class="filter-chip" data-filter="configuration">
                <i class="fas fa-cog"></i> Config
            </button>
            <button class="filter-chip" data-filter="development">
                <i class="fas fa-code"></i> Dev
            </button>
            <button class="filter-chip" data-filter="reference">
                <i class="fas fa-list"></i> Reference
            </button>
        </div>
    `;

    // Füge Filter nach Input ein
    docsSearchInput.insertAdjacentHTML('afterend', filterHTML);

    // Event Listener
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            handleDocsSearch();
        });
    });
}

function handleDocsSearch() {
    const query = docsSearchInput.value.trim();
    const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';

    let results;

    if (!query) {
        results = allDocsEntries;
    } else {
        results = fuseInstance.search(query).map(r => r.item);
    }

    // Filter anwenden
    if (activeFilter !== 'all') {
        results = results.filter(entry =>
            entry.category.toLowerCase().includes(activeFilter)
        );
    }

    displayDocsResults(results, query);
}
```

**CSS für Filter:**
```css
.docs-search-filters {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
}

.filter-chip {
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    color: var(--secondary-text-color);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9em;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-chip:hover {
    background-color: var(--accent-color);
    color: var(--background-color);
    border-color: var(--accent-color);
}

.filter-chip.active {
    background-color: var(--accent-color);
    color: var(--background-color);
    border-color: var(--accent-color);
    font-weight: 600;
}
```

---

### 2.2 Versions-Management System

#### **Warum Versions-Management kritisch ist**

Quantom ist Server-Software, die:
- Regelmäßig Updates erhält
- Mehrere Versionen parallel unterstützt (z.B. 1.20.x, 1.21.x)
- Breaking Changes zwischen Versionen haben kann
- Unterschiedliche Config-Optionen pro Version hat

**Ohne Versions-Management:**
- ❌ User finden veraltete Informationen
- ❌ Config-Beispiele funktionieren nicht für ihre Version
- ❌ Migrationsanleitungen fehlen
- ❌ Keine Übersicht welche Features in welcher Version verfügbar sind

#### **Vorgeschlagene Implementation**

##### **2.2.1 Datenstruktur für Versionen**

**Erweiterte docs-config.json:**
```json
{
  "versions": [
    {
      "id": "1.21",
      "label": "1.21.x (Latest)",
      "status": "stable",
      "releaseDate": "2024-12-15",
      "docsPath": "docs/v1.21",
      "default": true
    },
    {
      "id": "1.20",
      "label": "1.20.x (LTS)",
      "status": "lts",
      "releaseDate": "2024-06-10",
      "docsPath": "docs/v1.20",
      "supportUntil": "2025-12-31"
    },
    {
      "id": "1.19",
      "label": "1.19.x",
      "status": "deprecated",
      "releaseDate": "2023-11-20",
      "docsPath": "docs/v1.19",
      "deprecatedSince": "2024-12-01"
    }
  ],
  "categories": {
    "v1.21": [ /* version-spezifische categories */ ],
    "v1.20": [ /* version-spezifische categories */ ],
    // ...
  }
}
```

##### **2.2.2 Version Selector UI**

```html
<!-- Version Selector in Header oder Sidebar -->
<div class="version-selector">
    <button class="version-selector-btn" id="versionSelectorBtn">
        <i class="fas fa-code-branch"></i>
        <span class="current-version">v1.21.x</span>
        <i class="fas fa-chevron-down"></i>
    </button>

    <div class="version-dropdown" id="versionDropdown">
        <div class="version-dropdown-header">
            <span>Select Version</span>
        </div>

        <div class="version-list">
            <!-- Wird dynamisch generiert -->
        </div>

        <div class="version-dropdown-footer">
            <a href="/changelog">
                <i class="fas fa-file-alt"></i>
                View Changelog
            </a>
        </div>
    </div>
</div>
```

**JavaScript für Version Selector:**
```javascript
let currentVersion = null;
let availableVersions = [];

async function initVersionSelector() {
    const config = await fetch('config/docs-config.json').then(r => r.json());
    availableVersions = config.versions;

    // Lade gespeicherte Version oder Default
    const savedVersion = localStorage.getItem('quantom_selected_version');
    currentVersion = availableVersions.find(v => v.id === savedVersion)
                     || availableVersions.find(v => v.default);

    renderVersionSelector();
    loadDocsForVersion(currentVersion.id);
}

function renderVersionSelector() {
    const versionList = document.querySelector('.version-list');

    versionList.innerHTML = availableVersions.map(version => {
        const isActive = version.id === currentVersion.id;
        const statusBadge = getVersionStatusBadge(version);

        return `
            <div class="version-item ${isActive ? 'active' : ''}"
                 data-version="${version.id}"
                 onclick="selectVersion('${version.id}')">
                <div class="version-item-main">
                    <span class="version-label">${version.label}</span>
                    ${statusBadge}
                </div>
                <div class="version-item-meta">
                    Released ${formatDate(version.releaseDate)}
                    ${version.supportUntil ? ` · Support until ${formatDate(version.supportUntil)}` : ''}
                </div>
                ${isActive ? '<i class="fas fa-check version-check"></i>' : ''}
            </div>
        `;
    }).join('');
}

function getVersionStatusBadge(version) {
    switch(version.status) {
        case 'stable':
            return '<span class="version-badge stable">Latest</span>';
        case 'lts':
            return '<span class="version-badge lts">LTS</span>';
        case 'deprecated':
            return '<span class="version-badge deprecated">Deprecated</span>';
        case 'beta':
            return '<span class="version-badge beta">Beta</span>';
        default:
            return '';
    }
}

function selectVersion(versionId) {
    const version = availableVersions.find(v => v.id === versionId);
    if (!version) return;

    currentVersion = version;
    localStorage.setItem('quantom_selected_version', versionId);

    // UI aktualisieren
    document.querySelector('.current-version').textContent = `v${version.id}`;
    renderVersionSelector();

    // Docs für neue Version laden
    loadDocsForVersion(versionId);

    // Dropdown schließen
    closeVersionDropdown();
}

async function loadDocsForVersion(versionId) {
    const config = await fetch('config/docs-config.json').then(r => r.json());
    const versionCategories = config.categories[versionId] || config.categories['default'];

    // Sidebar neu aufbauen
    rebuildSidebar(versionCategories);

    // Deprecation Warning anzeigen falls nötig
    const version = availableVersions.find(v => v.id === versionId);
    if (version.status === 'deprecated') {
        showDeprecationWarning(version);
    }
}

function showDeprecationWarning(version) {
    const latestVersion = availableVersions.find(v => v.default);
    const warningHTML = `
        <div class="version-warning deprecated">
            <div class="warning-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="warning-content">
                <h4>Deprecated Version</h4>
                <p>
                    You are viewing documentation for Quantom ${version.label},
                    which is no longer supported since ${formatDate(version.deprecatedSince)}.
                </p>
                <button onclick="selectVersion('${latestVersion.id}')" class="upgrade-btn">
                    <i class="fas fa-arrow-up"></i>
                    Upgrade to ${latestVersion.label}
                </button>
            </div>
            <button onclick="this.parentElement.remove()" class="warning-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Füge Warning am Anfang der Main Content ein
    const mainContent = document.querySelector('.main-content');
    mainContent.insertAdjacentHTML('afterbegin', warningHTML);
}
```

**CSS für Version Selector:**
```css
.version-selector {
    position: relative;
    margin: 15px 0;
}

.version-selector-btn {
    width: 100%;
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
}

.version-selector-btn:hover {
    border-color: var(--accent-color);
    background-color: rgba(217, 119, 87, 0.05);
}

.current-version {
    flex: 1;
    font-weight: 600;
    color: var(--text-color);
}

.version-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: none;
}

.version-dropdown.active {
    display: block;
}

.version-dropdown-header {
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.9em;
    color: var(--secondary-text-color);
    text-transform: uppercase;
}

.version-item {
    padding: 12px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--border-color);
    position: relative;
}

.version-item:last-child {
    border-bottom: none;
}

.version-item:hover {
    background-color: rgba(217, 119, 87, 0.05);
}

.version-item.active {
    background-color: rgba(217, 119, 87, 0.1);
}

.version-item-main {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
}

.version-label {
    font-weight: 600;
    color: var(--text-color);
}

.version-badge {
    font-size: 0.7em;
    padding: 3px 8px;
    border-radius: 10px;
    font-weight: 600;
    text-transform: uppercase;
}

.version-badge.stable {
    background-color: #4ade80;
    color: #1a1a1a;
}

.version-badge.lts {
    background-color: #3b82f6;
    color: white;
}

.version-badge.deprecated {
    background-color: #ef4444;
    color: white;
}

.version-badge.beta {
    background-color: #f59e0b;
    color: #1a1a1a;
}

.version-item-meta {
    font-size: 0.85em;
    color: var(--secondary-text-color);
}

.version-check {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent-color);
}

.version-warning {
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid #ef4444;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.version-warning.deprecated {
    border-left-color: #ef4444;
}

.warning-icon {
    font-size: 1.5em;
    color: #ef4444;
}

.warning-content h4 {
    margin: 0 0 10px 0;
    color: var(--text-color);
}

.warning-content p {
    margin: 0 0 15px 0;
    color: var(--secondary-text-color);
}

.upgrade-btn {
    background-color: var(--accent-color);
    color: var(--background-color);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.upgrade-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(217, 119, 87, 0.3);
}

.warning-close {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    font-size: 1.2em;
    padding: 0;
    margin-left: auto;
}
```

##### **2.2.3 Version-spezifische Feature-Badges**

```markdown
<!-- In Dokumentation -->
# Server Optimization Guide

## Performance Tuning <Badge type="version" text="1.21+" />

Diese Features sind nur in Quantom 1.21 und höher verfügbar.

### Thread Optimization <Badge type="version" text="1.21+" /> <Badge type="status" text="Experimental" />

```yaml
quantom:
  threads:
    enable-async-chunks: true  # Nur 1.21+
```

### Legacy Options <Badge type="deprecated" text="Deprecated in 1.21" />

Diese Option wird in Version 1.22 entfernt.
```

**Markdown Extension für Badges:**
```javascript
// marked-extension.js erweitern
marked.use({
    extensions: [
        {
            name: 'badge',
            level: 'inline',
            start(src) { return src.match(/<Badge/)?.index; },
            tokenizer(src) {
                const rule = /^<Badge\s+type="([^"]+)"\s+text="([^"]+)"\s*\/>/;
                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'badge',
                        raw: match[0],
                        badgeType: match[1],
                        text: match[2]
                    };
                }
            },
            renderer(token) {
                const typeClass = token.badgeType.toLowerCase();
                return `<span class="doc-badge ${typeClass}">${token.text}</span>`;
            }
        }
    ]
});
```

**CSS für Doc Badges:**
```css
.doc-badge {
    display: inline-block;
    font-size: 0.75em;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 600;
    margin-left: 8px;
    vertical-align: middle;
}

.doc-badge.version {
    background-color: #3b82f6;
    color: white;
}

.doc-badge.status {
    background-color: #f59e0b;
    color: #1a1a1a;
}

.doc-badge.deprecated {
    background-color: #ef4444;
    color: white;
}

.doc-badge.new {
    background-color: #10b981;
    color: white;
}
```

---

### 2.3 Code-Beispiel-Verbesserungen

#### **Aktueller Stand**
Code-Blöcke haben basic Copy-to-Clipboard Funktionalität, aber:
- ❌ Kein Syntax-Highlighting
- ❌ Keine Zeilen-Nummern
- ❌ Keine Möglichkeit, bestimmte Zeilen zu highlighten
- ❌ Keine Sprach-Tabs für Multi-Language-Beispiele
- ❌ Kein Dark/Light Theme Toggle

#### **Vorgeschlagene Verbesserungen**

##### **2.3.1 Syntax-Highlighting mit Prism.js**

**Installation:**
```html
<!-- In docs.html -->
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-yaml.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-kotlin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>

<!-- Plugins -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.css" rel="stylesheet">
```

**Marked.js Code-Renderer überschreiben:**
```javascript
// marked-extension.js
const customRenderer = new marked.Renderer();

customRenderer.code = function(code, language, isEscaped) {
    const validLang = language && Prism.languages[language] ? language : 'plaintext';
    const highlighted = Prism.highlight(code, Prism.languages[validLang], validLang);

    return `
        <div class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-language">${validLang}</span>
                <button class="copy-code-btn" data-code="${encodeURIComponent(code)}">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
            <pre class="line-numbers language-${validLang}"><code class="language-${validLang}">${highlighted}</code></pre>
        </div>
    `;
};

marked.use({ renderer: customRenderer });
```

##### **2.3.2 Zeilen-Highlighting**

```markdown
<!-- In Dokumentation -->
```yaml{3-5,8}
quantom:
  settings:
    # Diese Zeilen werden highlighted
    async-chunks: true
    view-distance: 10

  network:
    compression: true  # Auch highlighted
```
```

**Parser für Zeilen-Highlighting:**
```javascript
customRenderer.code = function(code, infostring, isEscaped) {
    // Parse language und highlight info
    // z.B. "yaml{3-5,8}" -> language: yaml, highlight: [3,4,5,8]
    const match = infostring?.match(/^(\w+)(?:\{([\d,-]+)\})?$/);
    const language = match?.[1] || 'plaintext';
    const highlightLines = match?.[2] ? parseHighlightLines(match[2]) : [];

    const validLang = Prism.languages[language] ? language : 'plaintext';
    const highlighted = Prism.highlight(code, Prism.languages[validLang], validLang);

    // data-line Attribut für Prism Line Highlight Plugin
    const dataLine = highlightLines.length > 0
        ? `data-line="${highlightLines.join(',')}"`
        : '';

    return `
        <div class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-language">${validLang}</span>
                <button class="copy-code-btn" data-code="${encodeURIComponent(code)}">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
            <pre class="line-numbers language-${validLang}" ${dataLine}><code class="language-${validLang}">${highlighted}</code></pre>
        </div>
    `;
};

function parseHighlightLines(highlightStr) {
    const lines = [];
    const parts = highlightStr.split(',');

    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                lines.push(i);
            }
        } else {
            lines.push(Number(part));
        }
    });

    return lines;
}
```

##### **2.3.3 Multi-Language Code Tabs**

```markdown
<!-- In Dokumentation mit spezieller Syntax -->
:::code-group
```java [Java]
public class MyPlugin extends JavaPlugin {
    @Override
    public void onEnable() {
        getLogger().info("Plugin enabled!");
    }
}
```

```kotlin [Kotlin]
class MyPlugin : JavaPlugin() {
    override fun onEnable() {
        logger.info("Plugin enabled!")
    }
}
```
:::
```

**Marked Extension für Code Groups:**
```javascript
marked.use({
    extensions: [
        {
            name: 'codeGroup',
            level: 'block',
            start(src) { return src.match(/^:::code-group/)?.index; },
            tokenizer(src) {
                const rule = /^:::code-group\n([\s\S]*?)\n:::/;
                const match = rule.exec(src);

                if (match) {
                    const content = match[1];
                    const codeBlocks = [];

                    // Parse individual code blocks
                    const blockRegex = /```(\w+)\s*\[([^\]]+)\]\n([\s\S]*?)```/g;
                    let blockMatch;

                    while ((blockMatch = blockRegex.exec(content)) !== null) {
                        codeBlocks.push({
                            language: blockMatch[1],
                            label: blockMatch[2],
                            code: blockMatch[3].trim()
                        });
                    }

                    return {
                        type: 'codeGroup',
                        raw: match[0],
                        blocks: codeBlocks
                    };
                }
            },
            renderer(token) {
                const tabs = token.blocks.map((block, index) => `
                    <button class="code-tab ${index === 0 ? 'active' : ''}"
                            onclick="switchCodeTab(this, ${index})">
                        ${block.label}
                    </button>
                `).join('');

                const contents = token.blocks.map((block, index) => {
                    const highlighted = Prism.highlight(
                        block.code,
                        Prism.languages[block.language] || Prism.languages.plaintext,
                        block.language
                    );

                    return `
                        <div class="code-tab-content ${index === 0 ? 'active' : ''}">
                            <div class="code-block-wrapper">
                                <div class="code-block-header">
                                    <span class="code-language">${block.language}</span>
                                    <button class="copy-code-btn" data-code="${encodeURIComponent(block.code)}">
                                        <i class="fas fa-copy"></i>
                                        <span>Copy</span>
                                    </button>
                                </div>
                                <pre class="line-numbers language-${block.language}"><code class="language-${block.language}">${highlighted}</code></pre>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="code-group">
                        <div class="code-tabs">
                            ${tabs}
                        </div>
                        <div class="code-tab-contents">
                            ${contents}
                        </div>
                    </div>
                `;
            }
        }
    ]
});

// Tab-Switching Funktion
function switchCodeTab(button, index) {
    const codeGroup = button.closest('.code-group');

    // Deaktiviere alle Tabs und Contents
    codeGroup.querySelectorAll('.code-tab').forEach(tab => tab.classList.remove('active'));
    codeGroup.querySelectorAll('.code-tab-content').forEach(content => content.classList.remove('active'));

    // Aktiviere gewählten Tab und Content
    button.classList.add('active');
    codeGroup.querySelectorAll('.code-tab-content')[index].classList.add('active');
}
```

**CSS für Code Groups:**
```css
.code-group {
    margin: 20px 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
}

.code-tabs {
    display: flex;
    background-color: var(--card-background-color);
    border-bottom: 1px solid var(--border-color);
}

.code-tab {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    padding: 12px 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
}

.code-tab:hover {
    color: var(--text-color);
    background-color: rgba(217, 119, 87, 0.05);
}

.code-tab.active {
    color: var(--accent-color);
    border-bottom-color: var(--accent-color);
}

.code-tab-contents {
    position: relative;
}

.code-tab-content {
    display: none;
}

.code-tab-content.active {
    display: block;
}

.code-tab-content .code-block-wrapper {
    margin: 0;
    border: none;
    border-radius: 0;
}
```

---

### 2.4 Interaktive Dokumentations-Features

#### **2.4.1 Live Config Validator**

```html
<!-- Interaktiver Config Editor -->
<div class="interactive-config">
    <h3>🛠️ Try it yourself - quantom.yml</h3>

    <div class="config-editor-wrapper">
        <div class="editor-toolbar">
            <button onclick="validateConfig()">
                <i class="fas fa-check-circle"></i>
                Validate
            </button>
            <button onclick="resetConfig()">
                <i class="fas fa-undo"></i>
                Reset
            </button>
            <button onclick="copyConfig()">
                <i class="fas fa-copy"></i>
                Copy
            </button>
        </div>

        <textarea id="configEditor" class="config-editor" spellcheck="false">
quantom:
  settings:
    async-chunks: true
    view-distance: 10
  network:
    compression: true
        </textarea>

        <div id="validationResult" class="validation-result"></div>
    </div>
</div>
```

**JavaScript für Validation:**
```javascript
async function validateConfig() {
    const editor = document.getElementById('configEditor');
    const result = document.getElementById('validationResult');
    const config = editor.value;

    try {
        // Einfache YAML-Syntax-Prüfung (oder jsyaml Library verwenden)
        const lines = config.split('\n');
        const errors = [];
        const warnings = [];

        lines.forEach((line, index) => {
            // Prüfe Einrückung (YAML benötigt 2 oder 4 Spaces)
            const leadingSpaces = line.match(/^ */)[0].length;
            if (leadingSpaces % 2 !== 0 && line.trim() !== '') {
                errors.push({
                    line: index + 1,
                    message: 'Invalid indentation (must be multiple of 2)'
                });
            }

            // Prüfe Tabs (in YAML nicht erlaubt)
            if (line.includes('\t')) {
                errors.push({
                    line: index + 1,
                    message: 'Tabs are not allowed in YAML, use spaces'
                });
            }

            // Prüfe bekannte Config-Optionen
            if (line.includes('view-distance:')) {
                const value = parseInt(line.split(':')[1]);
                if (value > 32) {
                    warnings.push({
                        line: index + 1,
                        message: 'High view distance may impact performance'
                    });
                }
            }
        });

        // Zeige Ergebnisse
        if (errors.length === 0 && warnings.length === 0) {
            result.innerHTML = `
                <div class="validation-success">
                    <i class="fas fa-check-circle"></i>
                    Configuration is valid!
                </div>
            `;
        } else {
            let html = '';

            if (errors.length > 0) {
                html += '<div class="validation-errors">';
                html += '<h4><i class="fas fa-times-circle"></i> Errors</h4>';
                errors.forEach(error => {
                    html += `<div class="validation-item error">
                        <span class="line-number">Line ${error.line}:</span>
                        ${error.message}
                    </div>`;
                });
                html += '</div>';
            }

            if (warnings.length > 0) {
                html += '<div class="validation-warnings">';
                html += '<h4><i class="fas fa-exclamation-triangle"></i> Warnings</h4>';
                warnings.forEach(warning => {
                    html += `<div class="validation-item warning">
                        <span class="line-number">Line ${warning.line}:</span>
                        ${warning.message}
                    </div>`;
                });
                html += '</div>';
            }

            result.innerHTML = html;
        }

        result.style.display = 'block';

    } catch (error) {
        result.innerHTML = `
            <div class="validation-errors">
                <h4><i class="fas fa-times-circle"></i> Parsing Error</h4>
                <div class="validation-item error">
                    ${error.message}
                </div>
            </div>
        `;
        result.style.display = 'block';
    }
}
```

**CSS für Interactive Config:**
```css
.interactive-config {
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
}

.interactive-config h3 {
    margin-top: 0;
    color: var(--text-color);
}

.config-editor-wrapper {
    margin-top: 15px;
}

.editor-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.editor-toolbar button {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.editor-toolbar button:hover {
    background-color: var(--accent-color);
    color: var(--background-color);
    border-color: var(--accent-color);
}

.config-editor {
    width: 100%;
    min-height: 200px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    padding: 15px;
    background-color: #282c34;
    color: #abb2bf;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    resize: vertical;
    tab-size: 2;
}

.validation-result {
    margin-top: 15px;
    display: none;
}

.validation-success {
    background-color: rgba(74, 222, 128, 0.1);
    border: 1px solid #4ade80;
    border-radius: 6px;
    padding: 15px;
    color: #4ade80;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
}

.validation-errors,
.validation-warnings {
    margin-bottom: 15px;
}

.validation-errors h4 {
    color: #ef4444;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.validation-warnings h4 {
    color: #f59e0b;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.validation-item {
    background-color: var(--background-color);
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 8px;
    border-left: 3px solid;
}

.validation-item.error {
    border-left-color: #ef4444;
    color: var(--text-color);
}

.validation-item.warning {
    border-left-color: #f59e0b;
    color: var(--text-color);
}

.validation-item .line-number {
    font-weight: 600;
    color: var(--accent-color);
    margin-right: 8px;
}
```

---

## 3. Performance-Optimierung

### 3.1 Lazy Loading & Code Splitting

#### **Aktuelles Problem**
Alle JavaScript-Dateien und Libraries werden beim initialen Seitenaufruf geladen:
- Marked.js (~50KB) wird immer geladen, auch wenn nicht gebraucht
- Search-Funktionalität (~30KB) lädt auf allen Seiten
- Alle Docs werden beim ersten Load in Search-Index geladen

**Performance-Impact:**
- Langsame initiale Ladezeit
- Hoher Speicherverbrauch
- Schlechte Lighthouse-Scores

#### **Lösung: Dynamic Imports**

**Lazy Loading für Marked.js:**
```javascript
// common.js
let markedLoaded = false;

async function loadMarked() {
    if (markedLoaded) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            markedLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Nur laden wenn auf Docs-Seite
if (window.location.pathname.includes('docs.html')) {
    loadMarked().then(() => {
        initDocsPage();
    });
}
```

**Lazy Loading für Search:**
```javascript
// Search nur laden wenn geöffnet
let searchLoaded = false;

async function loadSearchModule() {
    if (searchLoaded) return;

    const module = await import('./docs-search.js');
    searchLoaded = true;
    return module;
}

document.getElementById('docs-search-btn')?.addEventListener('click', async () => {
    await loadSearchModule();
    openDocsSearchPopup();
});
```

**Lazy Loading für Bilder:**
```html
<!-- Nutze native Lazy Loading -->
<img src="screenshot.png" loading="lazy" alt="Screenshot">

<!-- Für größere Kontrolle: Intersection Observer -->
<img data-src="large-image.png" class="lazy-image" alt="Image">
```

```javascript
// Lazy Image Loader
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('.lazy-image').forEach(img => {
    imageObserver.observe(img);
});
```

### 3.2 Caching-Strategie

#### **Service Worker für Offline-Support**

```javascript
// service-worker.js
const CACHE_NAME = 'quantom-docs-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/docs.html',
    '/css/common.css',
    '/css/docs.css',
    '/js/common.js',
    '/favicon.png'
];

// Install Event - Cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network First, falling back to cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone response to cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request);
            })
    );
});
```

**Service Worker registrieren:**
```javascript
// In common.js oder index.html
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
```

#### **IndexedDB für Search-Index**

```javascript
// search-cache.js
const DB_NAME = 'quantom-docs-cache';
const DB_VERSION = 1;
const STORE_NAME = 'search-index';

class SearchCache {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async saveIndex(indexData) {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await store.put({
            id: 'main-index',
            data: indexData,
            timestamp: Date.now()
        });
    }

    async getIndex() {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get('main-index');
            request.onsuccess = () => {
                const result = request.result;

                // Cache für 24 Stunden
                if (result && (Date.now() - result.timestamp < 86400000)) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Usage in docs-search.js
const searchCache = new SearchCache();

async function buildSearchIndex() {
    await searchCache.init();

    // Versuche zuerst aus Cache zu laden
    const cachedIndex = await searchCache.getIndex();
    if (cachedIndex) {
        allDocsEntries = cachedIndex;
        searchIndexLoaded = true;
        console.log('Search index loaded from cache');
        return;
    }

    // Sonst neu bauen und cachen
    // ... existing build logic ...

    await searchCache.saveIndex(allDocsEntries);
    console.log('Search index built and cached');
}
```

### 3.3 Resource Optimization

#### **Image Optimization**

**WebP-Konvertierung und Responsive Images:**
```html
<!-- Moderne Bild-Optimierung -->
<picture>
    <source
        srcset="screenshot-mobile.webp 480w,
                screenshot-tablet.webp 768w,
                screenshot-desktop.webp 1200w"
        sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 80vw,
               1200px"
        type="image/webp">
    <source
        srcset="screenshot-mobile.jpg 480w,
                screenshot-tablet.jpg 768w,
                screenshot-desktop.jpg 1200w"
        sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 80vw,
               1200px"
        type="image/jpeg">
    <img src="screenshot-desktop.jpg"
         alt="Quantom Server Dashboard"
         loading="lazy"
         decoding="async">
</picture>
```

**Build-Script für Bild-Optimierung:**
```javascript
// optimize-images.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = 'assets/images-source';
const OUTPUT_DIR = 'assets/images';
const SIZES = [480, 768, 1200];

async function optimizeImages() {
    const files = fs.readdirSync(INPUT_DIR);

    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        const inputPath = path.join(INPUT_DIR, file);
        const baseName = path.parse(file).name;

        for (const size of SIZES) {
            // WebP
            await sharp(inputPath)
                .resize(size)
                .webp({ quality: 80 })
                .toFile(path.join(OUTPUT_DIR, `${baseName}-${size}.webp`));

            // JPEG Fallback
            await sharp(inputPath)
                .resize(size)
                .jpeg({ quality: 80, progressive: true })
                .toFile(path.join(OUTPUT_DIR, `${baseName}-${size}.jpg`));
        }

        console.log(`✓ Optimized: ${file}`);
    }
}

optimizeImages();
```

---

## 4. Developer Experience

### 4.1 Automatische Dokumentations-Generation

#### **JSDoc/TSDoc für Code-Dokumentation**

```javascript
/**
 * Loads and renders markdown content from a file
 * @param {Object} item - The documentation item to load
 * @param {string} item.file - Path to the markdown file
 * @param {string} item.type - Type of content ('md' or 'html')
 * @param {string} [item.id] - HTML element ID for static content
 * @returns {Promise<void>}
 * @throws {Error} If markdown file cannot be loaded
 *
 * @example
 * await loadContent({
 *   type: 'md',
 *   file: 'getting-started/intro.md',
 *   name: 'Introduction'
 * });
 */
async function loadContent(item) {
    // ... implementation
}
```

**Automatische API-Docs generieren:**
```json
{
  "scripts": {
    "docs:api": "jsdoc -c jsdoc.json -d docs/api"
  }
}
```

**jsdoc.json:**
```json
{
  "source": {
    "include": ["js/"],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(node_modules/|docs/)"
  },
  "opts": {
    "template": "templates/docdash",
    "encoding": "utf8",
    "destination": "docs/api/",
    "recurse": true,
    "verbose": true
  },
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

### 4.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/docs.yml
name: Documentation CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint Markdown
        run: npm run lint:md

      - name: Lint JavaScript
        run: npm run lint:js

      - name: Check for broken links
        run: npm run check:links

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Check accessibility
        run: npm run test:a11y

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build documentation
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: docs-build
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: docs-build
          path: dist/

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://deploy-preview-${{ github.event.number }}--quantom-docs.netlify.app
          uploadArtifacts: true
```

**package.json Scripts:**
```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "lint:js": "eslint 'js/**/*.js'",
    "check:links": "markdown-link-check docs/**/*.md",
    "test": "jest",
    "test:a11y": "pa11y-ci",
    "build": "npm run build:css && npm run build:js && npm run build:html",
    "build:css": "postcss css/*.css --dir dist/css",
    "build:js": "webpack --mode production",
    "build:html": "node scripts/build-html.js"
  }
}
```

---

## 8. Quick Wins (Hoher Impact, Geringer Aufwand)

### Priorität 1 (Sofort umsetzbar, 1-4 Stunden)

#### **1. Breadcrumb-Navigation hinzufügen**
```html
<!-- In docs.html, nach header -->
<nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/docs">Documentation</a></li>
        <li><span id="breadcrumb-category">Configuration</span></li>
        <li aria-current="page"><span id="breadcrumb-page">Quantom Global</span></li>
    </ol>
</nav>
```

```css
.breadcrumb {
    padding: 15px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.breadcrumb ol {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.breadcrumb li {
    display: flex;
    align-items: center;
    font-size: 0.9em;
}

.breadcrumb li:not(:last-child)::after {
    content: '/';
    margin-left: 8px;
    color: var(--secondary-text-color);
}

.breadcrumb a {
    color: var(--accent-color);
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.breadcrumb [aria-current="page"] {
    color: var(--text-color);
    font-weight: 600;
}
```

```javascript
// Update breadcrumb dynamically
function updateBreadcrumb(category, pageName) {
    document.getElementById('breadcrumb-category').textContent = category;
    document.getElementById('breadcrumb-page').textContent = pageName;
}
```

**Aufwand**: 1 Stunde
**Impact**: Verbesserte Navigation und SEO

---

#### **2. "Zuletzt aktualisiert"-Datum zu Docs**
```markdown
---
title: Server Optimization Guide
lastUpdated: 2025-10-04
author: Quantom Team
---

# Server Optimization Guide
```

```javascript
// Parse Frontmatter und zeige Datum
function parseFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { content: markdown, meta: {} };

    const frontmatter = match[1];
    const content = markdown.slice(match[0].length);

    const meta = {};
    frontmatter.split('\n').forEach(line => {
        const [key, ...value] = line.split(':');
        if (key && value.length) {
            meta[key.trim()] = value.join(':').trim();
        }
    });

    return { content, meta };
}

function displayLastUpdated(meta) {
    if (meta.lastUpdated) {
        const date = new Date(meta.lastUpdated);
        const formatted = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const html = `
            <div class="doc-meta">
                <span class="last-updated">
                    <i class="fas fa-clock"></i>
                    Zuletzt aktualisiert: ${formatted}
                </span>
                ${meta.author ? `<span class="author">von ${meta.author}</span>` : ''}
            </div>
        `;

        dynamicContentArea.insertAdjacentHTML('afterbegin', html);
    }
}
```

**Aufwand**: 2 Stunden
**Impact**: Nutzer wissen, ob Info aktuell ist

---

#### **3. Syntax-Highlighting (Prism.js)**
Siehe ausführliche Beschreibung in Abschnitt 2.3.1

**Aufwand**: 2-3 Stunden
**Impact**: Massiv bessere Code-Lesbarkeit

---

#### **4. Search-Ranking verbessern**
```javascript
// Gewichte Titel-Matches höher
const filteredEntries = allDocsEntries.filter(entry => {
    const nameMatch = entry.name.toLowerCase().includes(query);
    const categoryMatch = entry.category.toLowerCase().includes(query);
    const contentMatch = entry.content.toLowerCase().includes(query);

    return nameMatch || categoryMatch || contentMatch;
}).sort((a, b) => {
    // Titel-Match = höchste Priorität
    const aNameMatch = a.name.toLowerCase().includes(query);
    const bNameMatch = b.name.toLowerCase().includes(query);

    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;

    // Dann Kategorie-Match
    const aCategoryMatch = a.category.toLowerCase().includes(query);
    const bCategoryMatch = b.category.toLowerCase().includes(query);

    if (aCategoryMatch && !bCategoryMatch) return -1;
    if (!aCategoryMatch && bCategoryMatch) return 1;

    return 0;
});
```

**Aufwand**: 30 Minuten
**Impact**: Bessere Suchergebnisse

---

#### **5. 404-Seite mit Suche**
```html
<!-- 404.html -->
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>404 - Seite nicht gefunden | Quantom Docs</title>
    <link rel="stylesheet" href="/css/common.css">
    <link rel="stylesheet" href="/css/404.css">
</head>
<body>
    <div class="error-page">
        <div class="error-content">
            <h1 class="error-code">404</h1>
            <h2>Oops! Seite nicht gefunden</h2>
            <p>Die gesuchte Seite existiert nicht oder wurde verschoben.</p>

            <div class="error-search">
                <h3>Vielleicht hilft die Suche?</h3>
                <input type="text"
                       id="error-search-input"
                       placeholder="Dokumentation durchsuchen..."
                       class="search-input">
                <div id="error-search-results"></div>
            </div>

            <div class="error-suggestions">
                <h3>Beliebte Seiten:</h3>
                <ul>
                    <li><a href="/docs.html">📖 Dokumentation</a></li>
                    <li><a href="/downloads.html">⬇️ Downloads</a></li>
                    <li><a href="/docs.html#getting-started">🚀 Getting Started</a></li>
                    <li><a href="/docs.html#faq">❓ FAQ</a></li>
                </ul>
            </div>

            <a href="/" class="back-home">
                <i class="fas fa-home"></i>
                Zurück zur Startseite
            </a>
        </div>
    </div>

    <script src="/js/404-search.js"></script>
</body>
</html>
```

```css
/* 404.css */
.error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.error-content {
    max-width: 600px;
    text-align: center;
}

.error-code {
    font-size: 120px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--accent-color), #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    line-height: 1;
}

.error-search {
    margin: 40px 0;
    text-align: left;
}

.search-input {
    width: 100%;
    padding: 15px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px;
    background-color: var(--card-background-color);
    color: var(--text-color);
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent-color);
}

.error-suggestions {
    margin: 30px 0;
    text-align: left;
}

.error-suggestions ul {
    list-style: none;
    padding: 0;
}

.error-suggestions li {
    margin: 10px 0;
}

.error-suggestions a {
    color: var(--accent-color);
    text-decoration: none;
    font-size: 1.1em;
}

.error-suggestions a:hover {
    text-decoration: underline;
}

.back-home {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background-color: var(--accent-color);
    color: var(--background-color);
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 20px;
    transition: transform 0.2s;
}

.back-home:hover {
    transform: translateY(-2px);
}
```

**Aufwand**: 2 Stunden
**Impact**: Bessere User Experience bei toten Links

---

### Priorität 2 (Mittelfristig, 4-8 Stunden)

#### **6. Ordner-Struktur für Docs**
Siehe ausführliche Beschreibung in Abschnitt 1.3

**Aufwand**: 4-6 Stunden (inkl. Testing)
**Impact**: Bessere Skalierbarkeit

---

#### **7. Dark Mode für Code-Blöcke**
```css
/* Light Mode Code Theme */
:root[data-theme="light"] pre code {
    background-color: #f5f5f5 !important;
    color: #24292e !important;
}

/* Dark Mode Code Theme */
:root[data-theme="dark"] pre code {
    background-color: #282c34 !important;
    color: #abb2bf !important;
}

/* Toggle Button */
.theme-toggle {
    background: none;
    border: 2px solid var(--border-color);
    color: var(--text-color);
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}
```

```javascript
// Theme Toggle Funktionalität
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}
```

**Aufwand**: 3 Stunden
**Impact**: Nutzer-Präferenz wird respektiert

---

#### **8. Copy-Button-Animation**
```css
.copy-code-btn {
    position: relative;
    overflow: hidden;
}

.copy-code-btn::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 1.5em;
    color: #4ade80;
    opacity: 0;
    transition: all 0.3s ease;
}

.copy-code-btn.copied::after {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.copy-code-btn.copied span {
    opacity: 0;
}
```

```javascript
button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code);
    button.classList.add('copied');

    setTimeout(() => {
        button.classList.remove('copied');
    }, 2000);
});
```

**Aufwand**: 1 Stunde
**Impact**: Besseres Feedback für User

---

## 10. Implementierungs-Roadmap

### Phase 1: Fundamentale Verbesserungen (Woche 1-2)

**Woche 1:**
- ✅ Ordner-Struktur für Docs erstellen
- ✅ Breadcrumb-Navigation implementieren
- ✅ "Zuletzt aktualisiert"-Daten hinzufügen
- ✅ Syntax-Highlighting (Prism.js)

**Woche 2:**
- ✅ Search-Ranking verbessern
- ✅ 404-Seite mit Suche
- ✅ Dark Mode Toggle
- ✅ Copy-Button-Animationen

**Erfolgskriterien:**
- Alle Docs haben korrekte Timestamps
- Code-Blöcke haben Syntax-Highlighting
- Suche liefert relevantere Ergebnisse
- 404-Seite existiert und ist hilfreich

---

### Phase 2: Performance & Skalierbarkeit (Woche 3-4)

**Woche 3:**
- ✅ Lazy Loading implementieren
- ✅ Service Worker für Offline-Support
- ✅ Bild-Optimierung (WebP, Responsive)
- ✅ IndexedDB für Search-Cache

**Woche 4:**
- ✅ Build-System aufsetzen (Vite/Webpack)
- ✅ CSS/JS Minifizierung
- ✅ CDN-Integration
- ✅ Lighthouse-Optimierung (Score > 90)

**Erfolgskriterien:**
- Initiale Ladezeit < 2s
- Lighthouse Performance Score > 90
- Offline-Funktionalität für Docs
- Bilder in WebP-Format

---

### Phase 3: Erweiterte Features (Woche 5-6)

**Woche 5:**
- ✅ Versions-Management System
- ✅ Fuzzy Search (Fuse.js)
- ✅ Tastatur-Navigation in Suche
- ✅ Suchhistorie

**Woche 6:**
- ✅ Code-Tabs (Multi-Language)
- ✅ Interaktiver Config-Validator
- ✅ Version-spezifische Badges
- ✅ Migration-Guides

**Erfolgskriterien:**
- Version-Switcher funktioniert
- Suche findet auch mit Tippfehlern
- Code-Beispiele in Java und Kotlin
- Config-Validator funktioniert

---

### Phase 4: CMS & Automatisierung (Woche 7-8)

**Woche 7:**
- ✅ CMS-Auswahl und Setup (Strapi/Directus)
- ✅ Content-Modelle definieren
- ✅ Daten-Migration vorbereiten

**Woche 8:**
- ✅ Frontend-Integration
- ✅ CI/CD-Pipeline einrichten
- ✅ Automatische Tests
- ✅ Deploy-Automation

**Erfolgskriterien:**
- CMS ist produktionsbereit
- Content kann über UI verwaltet werden
- Automatische Deployments funktionieren
- Tests laufen bei jedem PR

---

### Phase 5: Community & Interaktivität (Woche 9-10)

**Woche 9:**
- ✅ Kommentar-System (Giscus)
- ✅ "War diese Seite hilfreich?"-Widget
- ✅ "Diese Seite bearbeiten"-Links
- ✅ Contributors-Seite

**Woche 10:**
- ✅ Analytics (Plausible/Fathom)
- ✅ Error-Tracking (Sentry)
- ✅ User-Feedback-System
- ✅ Newsletter-Integration

**Erfolgskriterien:**
- User können Feedback geben
- Kommentare funktionieren
- Analytics läuft
- Error-Tracking aktiv

---

## Zusammenfassung & Priorisierung

### Must-Have (Sofort)
1. ✅ Syntax-Highlighting
2. ✅ Ordner-Struktur
3. ✅ Search-Verbesserungen
4. ✅ Performance-Optimierung

### Should-Have (Kurzfristig)
5. ✅ Versions-Management
6. ✅ Dark Mode
7. ✅ Lazy Loading
8. ✅ Service Worker

### Nice-to-Have (Mittelfristig)
9. ✅ CMS-Migration
10. ✅ Interaktive Features
11. ✅ Community-Features
12. ✅ CI/CD-Automation

### Optional (Langfristig)
13. ⚠️ Multi-Language (i18n)
14. ⚠️ Video-Tutorials
15. ⚠️ Plugin-Marketplace
16. ⚠️ API-Playground

---

## Ressourcen & Tools

### Development Tools
- **VS Code Extensions:**
  - Markdown All in One
  - Markdown Preview Enhanced
  - ESLint
  - Prettier
  - Live Server

### Testing Tools
- **Lighthouse CI** - Performance-Monitoring
- **Pa11y** - Accessibility-Testing
- **Jest** - JavaScript-Testing
- **Playwright** - E2E-Testing

### Build Tools
- **Vite** - Modern Build Tool
- **PostCSS** - CSS Processing
- **Sharp** - Bild-Optimierung
- **Webpack** - Module Bundler

### Libraries
- **Fuse.js** - Fuzzy Search
- **Prism.js** - Syntax-Highlighting
- **Marked.js** - Markdown Parsing
- **YAML.js** - YAML Parsing

---

## Kontakt & Feedback

Für Fragen oder Vorschläge zu diesem Dokument:
- Discord: https://discord.gg/5gdthYHqSv
- GitHub Issues: [Repository-Link]
- E-Mail: [Kontakt-E-Mail]

---

**Letzte Aktualisierung**: 2025-10-04
**Version**: 1.0
**Autoren**: Quantom Development Team
