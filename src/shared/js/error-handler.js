/**
 * Error Handler - Centralized error handling and user notifications
 * Provides user-friendly error messages and toast notifications
 */

class ErrorHandler {
    static showError(message, type = 'error', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = this.getToastContainer();
        container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            success: 'check-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    static getToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    static handleNetworkError(error) {
        if (!navigator.onLine) {
            this.showError('You appear to be offline. Please check your internet connection.', 'warning');
        } else {
            this.showError('A network error occurred. Please try again.', 'error');
        }
    }

    static handleApiError(error, defaultMessage = 'An error occurred') {
        let message = defaultMessage;

        if (error.response) {
            // Server responded with error
            message = error.response.data?.error || error.response.statusText || defaultMessage;
        } else if (error.request) {
            // Request made but no response
            this.handleNetworkError(error);
            return;
        } else {
            // Something else happened
            message = error.message || defaultMessage;
        }

        this.showError(message, 'error');
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static clearAll() {
        const container = document.getElementById('toast-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
