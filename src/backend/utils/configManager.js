/**
 * Configuration Manager
 * Centralized JSON configuration management with hot reload support
 */

const path = require('path');
const fileAdapter = require('../data/fileSystemAdapter');
const { ResourceNotFoundError } = require('./customErrors');

// Configuration cache
const configCache = new Map();

// Base paths for configuration files
const CONFIG_PATHS = {
    users: path.join(__dirname, '..', '..', 'apps', 'docs', 'config', 'users.json'),
    docs: path.join(__dirname, '..', '..', 'apps', 'docs', 'config', 'docs-config.json'),
    tokenBlacklist: path.join(__dirname, '..', '..', 'apps', 'docs', 'config', 'token-blacklist.json')
};

/**
 * Read JSON configuration file
 * @param {string} configName - Name of config (users, docs, tokenBlacklist)
 * @param {boolean} useCache - Whether to use cached version
 * @returns {object} Configuration object
 */
function readConfig(configName, useCache = true) {
    const configPath = CONFIG_PATHS[configName];

    if (!configPath) {
        throw new Error(`Unknown configuration: ${configName}`);
    }

    // Return cached version if available and cache is enabled
    if (useCache && configCache.has(configName)) {
        return configCache.get(configName);
    }

    try {
        if (!fileAdapter.exists(configPath)) {
            // Return default structures for missing configs
            const defaults = getDefaultConfig(configName);
            configCache.set(configName, defaults);
            return defaults;
        }

        const data = fileAdapter.exists(configPath)
            ? JSON.parse(require('fs').readFileSync(configPath, 'utf8'))
            : getDefaultConfig(configName);

        // Cache the configuration
        configCache.set(configName, data);
        return data;

    } catch (error) {
        console.error(`Error reading config ${configName}:`, error);
        const defaults = getDefaultConfig(configName);
        configCache.set(configName, defaults);
        return defaults;
    }
}

/**
 * Write JSON configuration file
 * @param {string} configName - Name of config
 * @param {object} data - Data to write
 * @returns {boolean} Success status
 */
function writeConfig(configName, data) {
    const configPath = CONFIG_PATHS[configName];

    if (!configPath) {
        throw new Error(`Unknown configuration: ${configName}`);
    }

    try {
        // Ensure directory exists
        const dir = path.dirname(configPath);
        if (!fileAdapter.exists(dir)) {
            require('fs').mkdirSync(dir, { recursive: true });
        }

        // Write file
        require('fs').writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');

        // Update cache
        configCache.set(configName, data);

        return true;
    } catch (error) {
        console.error(`Error writing config ${configName}:`, error);
        return false;
    }
}

/**
 * Get default configuration structure
 * @param {string} configName - Name of config
 * @returns {object} Default configuration
 */
function getDefaultConfig(configName) {
    const defaults = {
        users: {
            users: []
        },
        docs: {
            products: []
        },
        tokenBlacklist: {
            blacklistedTokens: [],
            lastCleanup: null
        }
    };

    return defaults[configName] || {};
}

/**
 * Invalidate cache for a specific config
 * @param {string} configName - Name of config to invalidate
 */
function invalidateCache(configName) {
    if (configName) {
        configCache.delete(configName);
    } else {
        configCache.clear();
    }
}

/**
 * Get all config paths
 * @returns {object} Config paths
 */
function getConfigPaths() {
    return { ...CONFIG_PATHS };
}

module.exports = {
    readConfig,
    writeConfig,
    invalidateCache,
    getConfigPaths,
    CONFIG_PATHS
};
