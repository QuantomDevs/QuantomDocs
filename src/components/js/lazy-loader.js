/**
 * Lazy Loading Module für QuantomDocs
 * Lädt externe Bibliotheken und Module nur wenn benötigt
 */

// Tracking welche Ressourcen bereits geladen wurden
const loadedResources = {
    marked: false,
    prismPlugins: false,
    docsSearch: false,
    docsCore: false
};

/**
 * Lädt ein externes Script dynamisch
 * @param {string} src - URL des Scripts
 * @param {string} id - Eindeutige ID für das Script-Element
 * @param {boolean} isModule - Ob das Script als ES6 Modul geladen werden soll
 * @returns {Promise} Promise die resolved wenn das Script geladen ist
 */
function loadScript(src, id, isModule = false) {
    return new Promise((resolve, reject) => {
        // Prüfen ob Script bereits existiert
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;

        // Set type="module" if specified
        if (isModule) {
            script.type = 'module';
        }

        script.onload = () => {
            console.log(`✓ Loaded: ${id}${isModule ? ' (module)' : ''}`);
            resolve();
        };

        script.onerror = () => {
            console.error(`✗ Failed to load: ${id}`);
            reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Lädt ein CSS-Stylesheet dynamisch
 * @param {string} href - URL des Stylesheets
 * @param {string} id - Eindeutige ID für das Link-Element
 * @returns {Promise} Promise die resolved wenn das Stylesheet geladen ist
 */
function loadStylesheet(href, id) {
    return new Promise((resolve, reject) => {
        // Prüfen ob Stylesheet bereits existiert
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.id = id;

        link.onload = () => {
            console.log(`✓ Loaded: ${id}`);
            resolve();
        };

        link.onerror = () => {
            console.error(`✗ Failed to load: ${id}`);
            reject(new Error(`Failed to load stylesheet: ${href}`));
        };

        document.head.appendChild(link);
    });
}

/**
 * Lädt Marked.js Bibliothek
 * @returns {Promise}
 */
async function loadMarked() {
    if (loadedResources.marked) {
        return Promise.resolve();
    }

    try {
        await loadScript(
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'marked-js'
        );
        loadedResources.marked = true;
    } catch (error) {
        console.error('Failed to load Marked.js:', error);
        throw error;
    }
}

/**
 * Lädt Prism.js Language Plugins
 * @returns {Promise}
 */
async function loadPrismPlugins() {
    if (loadedResources.prismPlugins) {
        return Promise.resolve();
    }

    try {
        // Lade alle Language Components parallel
        await Promise.all([
            loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js',
                'prism-yaml'
            ),
            loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js',
                'prism-java'
            ),
            loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js',
                'prism-bash'
            ),
            loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js',
                'prism-json'
            )
        ]);

        loadedResources.prismPlugins = true;
    } catch (error) {
        console.error('Failed to load Prism.js plugins:', error);
        throw error;
    }
}

/**
 * Lädt alle notwendigen Ressourcen für die Dokumentationsseite
 * @returns {Promise}
 */
async function loadDocsModules() {
    if (loadedResources.docsCore) {
        return Promise.resolve();
    }

    try {
        // Zeige Loading Indicator
        showLoadingIndicator('Loading documentation modules...');

        // Lade Bibliotheken parallel
        await Promise.all([
            loadMarked(),
            loadPrismPlugins()
        ]);

        // Lade Docs-spezifische Module
        // Absolute Pfade von der Root
        await Promise.all([
            loadScript('/docs/js/docs.js', 'docs-js'),
            loadScript('/docs/js/marked-extension.js', 'marked-extension-js', true), // Load as ES6 module (now uses imports)
            loadScript('/docs/js/component-orchestrator.js', 'component-orchestrator-js', true), // Load as ES6 module
            loadScript('/docs/js/docs-nested-categories.js', 'docs-nested-categories-js', true), // Load as ES6 module
            loadScript('/docs/js/docs-products.js', 'docs-products-js', true), // Load as ES6 module
            loadScript('/docs/js/docs-page-actions.js', 'docs-page-actions-js')
        ]);

        loadedResources.docsCore = true;

        // Verstecke Loading Indicator
        hideLoadingIndicator();

        console.log('✓ All documentation modules loaded');
    } catch (error) {
        console.error('Failed to load documentation modules:', error);
        hideLoadingIndicator();
        showErrorMessage('Failed to load documentation. Please refresh the page.');
        throw error;
    }
}

/**
 * Lädt das Search Modul on-demand
 * @returns {Promise}
 */
async function loadSearchModule() {
    if (loadedResources.docsSearch) {
        return Promise.resolve();
    }

    try {
        // Zeige Loading Indicator
        showLoadingIndicator('Initializing search...');

        // Lade Search Modul und Analytics parallel mit absoluten Pfaden
        await Promise.all([
            // loadScript('/docs/js/search-analytics.js', 'search-analytics-js'), // <-- ENTFERNEN oder AUSKOMMENTIEREN
            loadScript('/docs/js/docs-search.js', 'docs-search-js')
        ]);

        loadedResources.docsSearch = true;

        // Verstecke Loading Indicator
        hideLoadingIndicator();

        console.log('✓ Search module loaded');
    } catch (error) {
        console.error('Failed to load search module:', error);
        hideLoadingIndicator();
        throw error;
    }
}

/**
 * Zeigt einen Loading Indicator
 * @param {string} message - Nachricht die angezeigt werden soll
 */
function showLoadingIndicator(message = 'Loading...') {
    let indicator = document.getElementById('lazy-loading-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'lazy-loading-indicator';
        indicator.className = 'lazy-loading-indicator';
        indicator.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span class="loading-message">${message}</span>
            </div>
        `;
        document.body.appendChild(indicator);
    } else {
        const messageEl = indicator.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        indicator.style.display = 'flex';
    }
}

/**
 * Versteckt den Loading Indicator
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('lazy-loading-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Zeigt eine Fehlermeldung
 * @param {string} message - Fehlermeldung
 */
function showErrorMessage(message) {
    // Erstelle temporäre Error Box
    const errorBox = document.createElement('div');
    errorBox.className = 'lazy-load-error';
    errorBox.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(errorBox);

    // Entferne nach 5 Sekunden
    setTimeout(() => {
        errorBox.remove();
    }, 5000);
}

// Exportiere Funktionen für globalen Zugriff
window.LazyLoader = {
    loadMarked,
    loadPrismPlugins,
    loadDocsModules,
    loadSearchModule,
    showLoadingIndicator,
    hideLoadingIndicator
};
