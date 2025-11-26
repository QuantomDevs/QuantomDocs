/**
 * Docs Utilities Module
 * Common utilities shared across all docs modules
 * @module DocsUtils
 */

// Constants
export const CONSTANTS = {
    BREAKPOINTS: {
        MOBILE: 1024,
        TABLET: 768,
        DESKTOP: 1025
    },
    TIMING: {
        DEBOUNCE_DEFAULT: 100,
        THROTTLE_DEFAULT: 150,
        ANIMATION_DURATION: 300,
        INIT_DELAY: 300
    },
    STORAGE_KEYS: {
        THEME: 'theme',
        SIDEBAR_COLLAPSED: 'sidebarCollapsed'
    }
};

// Logger utility with different levels
export const Logger = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    error(module, message, error) {
        console.error(`[${module}] ${message}:`, error);
    },

    warn(module, message) {
        console.warn(`[${module}] ${message}`);
    },

    info(module, message) {
        if (this.isDevelopment) {
            console.info(`[${module}] ${message}`);
        }
    },

    debug(module, message, data) {
        if (this.isDevelopment) {
            console.log(`[${module}] ${message}`, data || '');
        }
    }
};

// Safe localStorage wrapper
export const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? value : defaultValue;
        } catch (error) {
            Logger.error('Storage', 'Failed to get item', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to set item', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to remove item', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            Logger.error('Storage', 'Failed to clear storage', error);
            return false;
        }
    }
};

// DOM utilities
export const DOM = {
    /**
     * Safely query selector
     */
    query(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            Logger.error('DOM', `Failed to query selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Safely query selector all
     */
    queryAll(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            Logger.error('DOM', `Failed to query all: ${selector}`, error);
            return [];
        }
    },

    /**
     * Safely add event listener
     */
    on(element, event, handler, options = {}) {
        if (!element) {
            Logger.warn('DOM', `Cannot add event listener: element is null`);
            return () => {};
        }

        try {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        } catch (error) {
            Logger.error('DOM', `Failed to add event listener: ${event}`, error);
            return () => {};
        }
    },

    /**
     * Safely add class
     */
    addClass(element, ...classes) {
        if (!element) return false;
        try {
            element.classList.add(...classes);
            return true;
        } catch (error) {
            Logger.error('DOM', 'Failed to add class', error);
            return false;
        }
    },

    /**
     * Safely remove class
     */
    removeClass(element, ...classes) {
        if (!element) return false;
        try {
            element.classList.remove(...classes);
            return true;
        } catch (error) {
            Logger.error('DOM', 'Failed to remove class', error);
            return false;
        }
    },

    /**
     * Safely toggle class
     */
    toggleClass(element, className, force) {
        if (!element) return false;
        try {
            return element.classList.toggle(className, force);
        } catch (error) {
            Logger.error('DOM', 'Failed to toggle class', error);
            return false;
        }
    }
};

// Performance utilities
export const Performance = {
    /**
     * Debounce function calls
     */
    debounce(func, wait = CONSTANTS.TIMING.DEBOUNCE_DEFAULT) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit = CONSTANTS.TIMING.THROTTLE_DEFAULT) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Request animation frame wrapper
     */
    raf(callback) {
        let rafId;
        return (...args) => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => callback(...args));
            return rafId;
        };
    },

    /**
     * Measure performance
     */
    measure(name, fn) {
        if (!Logger.isDevelopment) {
            return fn();
        }

        const start = performance.now();
        const result = fn();
        const end = performance.now();
        Logger.debug('Performance', `${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

// Validation utilities
export const Validate = {
    isString(value) {
        return typeof value === 'string';
    },

    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },

    isFunction(value) {
        return typeof value === 'function';
    },

    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },

    isArray(value) {
        return Array.isArray(value);
    },

    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (this.isString(value)) return value.trim().length === 0;
        if (this.isArray(value)) return value.length === 0;
        if (this.isObject(value)) return Object.keys(value).length === 0;
        return false;
    }
};

// URL utilities
export const URL = {
    getParams() {
        try {
            return new URLSearchParams(window.location.search);
        } catch (error) {
            Logger.error('URL', 'Failed to get URL params', error);
            return new URLSearchParams();
        }
    },

    getParam(key, defaultValue = null) {
        try {
            const params = this.getParams();
            return params.get(key) || defaultValue;
        } catch (error) {
            Logger.error('URL', `Failed to get param: ${key}`, error);
            return defaultValue;
        }
    },

    setParam(key, value) {
        try {
            const params = this.getParams();
            params.set(key, value);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
            return true;
        } catch (error) {
            Logger.error('URL', `Failed to set param: ${key}`, error);
            return false;
        }
    }
};

// Screen utilities
export const Screen = {
    isMobile() {
        return window.innerWidth <= CONSTANTS.BREAKPOINTS.MOBILE;
    },

    isTablet() {
        return window.innerWidth > CONSTANTS.BREAKPOINTS.TABLET &&
               window.innerWidth <= CONSTANTS.BREAKPOINTS.MOBILE;
    },

    isDesktop() {
        return window.innerWidth > CONSTANTS.BREAKPOINTS.MOBILE;
    },

    getWidth() {
        return window.innerWidth;
    },

    getHeight() {
        return window.innerHeight;
    }
};

// Export as window global for non-module scripts
if (typeof window !== 'undefined') {
    window.DocsUtils = {
        CONSTANTS,
        Logger,
        Storage,
        DOM,
        Performance,
        Validate,
        URL,
        Screen
    };
}
