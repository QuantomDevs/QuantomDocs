/**
 * Image Lazy Loading Module for QuantomDocs
 * Uses IntersectionObserver for efficient lazy loading of images
 */

class ImageLazyLoader {
    constructor() {
        this.observer = null;
        this.initializeObserver();
    }

    /**
     * Initialize the IntersectionObserver
     */
    initializeObserver() {
        const options = {
            root: null, // Use viewport as root
            rootMargin: '50px', // Start loading 50px before image enters viewport
            threshold: 0.01 // Trigger when even 1% of image is visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    /**
     * Load an image by setting its src from data-src
     * @param {HTMLImageElement} img - The image element to load
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Show loading placeholder
        img.classList.add('loading');

        // Create a temporary image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');

            // Remove data-src attribute
            delete img.dataset.src;
        };

        tempImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            img.alt = 'Failed to load image';

            console.error(`Failed to load image: ${src}`);
        };

        tempImg.src = src;
    }

    /**
     * Observe a single image element
     * @param {HTMLImageElement} element - The image element to observe
     */
    observe(element) {
        if (element.tagName === 'IMG' && element.dataset.src) {
            this.observer.observe(element);
        }
    }

    /**
     * Observe all images with data-src attribute in a container
     * @param {HTMLElement} container - The container element (defaults to document.body)
     */
    observeAll(container = document.body) {
        const images = container.querySelectorAll('img[data-src]');
        images.forEach(img => this.observe(img));
    }

    /**
     * Disconnect the observer
     */
    disconnect() {
        this.observer?.disconnect();
    }
}

// Create and export global instance
window.imageLazyLoader = new ImageLazyLoader();

// Auto-observe on DOM changes using MutationObserver
const contentObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // ELEMENT_NODE
                // Check if the node itself is an image
                if (node.tagName === 'IMG' && node.dataset.src) {
                    window.imageLazyLoader.observe(node);
                }
                // Check for images within the node
                if (node.querySelectorAll) {
                    window.imageLazyLoader.observeAll(node);
                }
            }
        });
    });
});

// Observe the body for changes
contentObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial observation on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageLazyLoader.observeAll();
    });
} else {
    // DOM is already loaded
    window.imageLazyLoader.observeAll();
}

console.log('✓ Image Lazy Loader initialized');
