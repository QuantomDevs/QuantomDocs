/**
 * Event Manager - Centralized event listener management to prevent memory leaks
 * Tracks all event listeners and provides cleanup functionality
 */

class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Add an event listener and track it for cleanup
     * @param {Element} element - DOM element to attach listener to
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event listener options
     */
    addEventListener(element, event, handler, options) {
        if (!element) {
            console.warn('Cannot add event listener: element is null');
            return;
        }

        // Store listener for cleanup
        const key = `${element.id || 'anonymous'}-${event}`;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }

        this.listeners.get(key).push({ element, event, handler, options });
        element.addEventListener(event, handler, options);
    }

    /**
     * Remove a specific event listener
     * @param {Element} element - DOM element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    removeEventListener(element, event, handler) {
        if (!element) return;

        element.removeEventListener(event, handler);

        // Remove from tracking
        const key = `${element.id || 'anonymous'}-${event}`;
        const listeners = this.listeners.get(key);
        if (listeners) {
            const index = listeners.findIndex(l => l.handler === handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Remove all tracked listeners
     */
    cleanup() {
        // Remove all tracked listeners
        this.listeners.forEach((listeners) => {
            listeners.forEach(({ element, event, handler }) => {
                if (element) {
                    element.removeEventListener(event, handler);
                }
            });
        });
        this.listeners.clear();
    }

    /**
     * Remove all listeners for a specific element
     * @param {Element} element - DOM element to cleanup
     */
    cleanupElement(element) {
        // Remove all listeners for a specific element
        this.listeners.forEach((listeners, key) => {
            const filtered = listeners.filter(({ element: el, event, handler }) => {
                if (el === element) {
                    el.removeEventListener(event, handler);
                    return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                this.listeners.delete(key);
            } else {
                this.listeners.set(key, filtered);
            }
        });
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.eventManager = new EventManager();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        window.eventManager.cleanup();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}
