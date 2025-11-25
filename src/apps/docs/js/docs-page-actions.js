// Page Actions: Split Button Functionality for Copy, View, and Download
// Handles all interactions with the split button and its dropdown menu

// Initialize page actions when DOM is ready
function initPageActions() {
    const mainCopyBtn = document.getElementById('main-copy-btn');
    const arrowBtn = document.getElementById('split-button-arrow');
    const dropdown = document.getElementById('split-button-dropdown');
    const dropdownCopy = document.getElementById('dropdown-copy');
    const dropdownView = document.getElementById('dropdown-view');
    const dropdownDownload = document.getElementById('dropdown-download');

    // Main copy button click handler
    if (mainCopyBtn) {
        mainCopyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await copyPageToClipboard();
        });
    }

    // Arrow button toggle dropdown
    if (arrowBtn) {
        arrowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }

    // Dropdown option: Copy Page
    if (dropdownCopy) {
        dropdownCopy.addEventListener('click', async (e) => {
            e.stopPropagation();
            await copyPageToClipboard();
            closeDropdown();
        });
    }

    // Dropdown option: View as Markdown
    if (dropdownView) {
        dropdownView.addEventListener('click', async (e) => {
            e.stopPropagation();
            await viewAsMarkdown();
            closeDropdown();
        });
    }

    // Dropdown option: Download Page
    if (dropdownDownload) {
        dropdownDownload.addEventListener('click', async (e) => {
            e.stopPropagation();
            await downloadPageAsMarkdown();
            closeDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const splitButtonContainer = document.querySelector('.split-button-container');
        if (splitButtonContainer && !splitButtonContainer.contains(e.target)) {
            closeDropdown();
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDropdown();
            closeMarkdownViewModal();
        }
    });

    // Initialize markdown view modal close handlers
    initMarkdownViewModal();
}

// Toggle dropdown visibility
function toggleDropdown() {
    const dropdown = document.getElementById('split-button-dropdown');
    const arrowBtn = document.getElementById('split-button-arrow');

    if (!dropdown || !arrowBtn) return;

    const isOpen = dropdown.classList.contains('show');

    if (isOpen) {
        closeDropdown();
    } else {
        // Show dropdown with animation
        dropdown.style.display = 'block';
        // Force reflow for animation
        dropdown.offsetHeight;
        dropdown.classList.add('show');
        arrowBtn.classList.add('active');
        arrowBtn.setAttribute('aria-expanded', 'true');
    }
}

// Close dropdown
function closeDropdown() {
    const dropdown = document.getElementById('split-button-dropdown');
    const arrowBtn = document.getElementById('split-button-arrow');

    if (!dropdown || !arrowBtn) return;

    dropdown.classList.remove('show');
    arrowBtn.classList.remove('active');
    arrowBtn.setAttribute('aria-expanded', 'false');

    // Hide dropdown after animation
    setTimeout(() => {
        if (!dropdown.classList.contains('show')) {
            dropdown.style.display = 'none';
        }
    }, 200);
}

// Copy page markdown to clipboard
async function copyPageToClipboard() {
    const mainCopyBtn = document.getElementById('main-copy-btn');

    try {
        // Check if currentFile is available
        if (typeof currentFile === 'undefined' || !currentFile) {
            console.error('No file is currently loaded');
            showCopyError(mainCopyBtn, 'No file loaded');
            return;
        }

        const markdown = await fetchCurrentMarkdown();

        // Copy to clipboard
        copyToClipboard(markdown);

        // Show success feedback
        showCopySuccess(mainCopyBtn);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        showCopyError(mainCopyBtn, 'Copy failed');
    }
}

// Fetch current markdown content
async function fetchCurrentMarkdown() {
    // currentFile is defined in docs-products.js as a global variable
    if (typeof currentFile === 'undefined' || !currentFile) {
        throw new Error('No file is currently loaded');
    }

    const response = await fetch(`/docs/content/${currentFile}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.statusText}`);
    }

    const markdown = await response.text();
    return markdown;
}

// Show copy success state
function showCopySuccess(button) {
    if (!button) return;

    const originalHTML = button.innerHTML;
    button.classList.add('copied');
    button.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';

    setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHTML;
    }, 3000);
}

// Show copy error state
function showCopyError(button, message = 'Failed') {
    if (!button) return;

    const originalHTML = button.innerHTML;
    const originalColor = button.style.color;

    button.innerHTML = `<i class="fa-solid fa-xmark"></i><span>${message}</span>`;
    button.style.color = 'var(--text-error)';

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.color = originalColor;
    }, 3000);
}

// View markdown in modal
async function viewAsMarkdown() {
    const modal = document.getElementById('markdown-view-modal');
    const markdownText = document.getElementById('markdown-view-text');

    if (!modal || !markdownText) {
        console.error('Modal elements not found');
        return;
    }

    try {
        const markdown = await fetchCurrentMarkdown();

        // Display markdown in modal
        markdownText.textContent = markdown;

        // Show modal
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
    } catch (error) {
        console.error('Failed to load markdown:', error);
        markdownText.textContent = 'Failed to load markdown content: ' + error.message;
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
    }
}

// Close markdown view modal
function closeMarkdownViewModal() {
    const modal = document.getElementById('markdown-view-modal');

    if (!modal) return;

    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

// Initialize markdown view modal handlers
function initMarkdownViewModal() {
    const modal = document.getElementById('markdown-view-modal');
    const closeBtn = document.getElementById('markdown-view-close');
    const overlay = modal?.querySelector('.markdown-view-overlay');

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMarkdownViewModal();
        });
    }

    // Click outside to close
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMarkdownViewModal();
        });
    }
}

// Download page as markdown file
async function downloadPageAsMarkdown() {
    try {
        const markdown = await fetchCurrentMarkdown();
        const filename = getCurrentPageFilename();

        // Create blob and download
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download markdown:', error);
        alert('Failed to download the file. Please try again.');
    }
}

// Get current page filename for download
function getCurrentPageFilename() {
    // currentFile is a global variable from docs-products.js
    if (typeof currentFile === 'undefined' || !currentFile) {
        return 'document.md';
    }

    // Extract filename from path: productId/categoryName/fileName.md
    const pathParts = currentFile.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // Sanitize filename (remove invalid characters)
    const sanitized = fileName.replace(/[<>:"/\\|?*]/g, '-');

    return sanitized || 'document.md';
}

// Get current page title for display
function getCurrentPageTitle() {
    // currentFile is a global variable from docs-products.js
    if (typeof currentFile === 'undefined' || !currentFile) {
        return 'Document';
    }

    const pathParts = currentFile.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // Remove .md extension and format
    return fileName.replace('.md', '').replace(/-/g, ' ');
}

// Initialize when the module is loaded (lazy loaded by docs page)
// Note: This will be called after DOMContentLoaded by the lazy loader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageActions);
} else {
    // DOM already loaded
    initPageActions();
}
