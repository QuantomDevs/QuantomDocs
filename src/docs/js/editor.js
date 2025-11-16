/**
 * DOCUMENTATION EDITOR
 * WYSIWYG and Markdown editor for QuantomDocs
 */

class DocumentEditor {
    constructor() {
        this.quill = null;
        this.currentMode = 'wysiwyg'; // 'wysiwyg' or 'markdown'
        this.currentProduct = null;
        this.currentSuperCategory = null;
        this.currentCategory = null;
        this.currentFileName = null;
        this.hasUnsavedChanges = false;
        this.autoSaveInterval = null;

        // DOM elements
        this.elements = {
            wysiwygContainer: document.getElementById('wysiwyg-container'),
            markdownContainer: document.getElementById('markdown-container'),
            previewContainer: document.getElementById('preview-container'),
            markdownTextarea: document.getElementById('markdown-textarea'),
            previewContent: document.getElementById('preview-content'),
            productSelect: document.getElementById('product-select'),
            superCategorySelect: document.getElementById('super-category-select'),
            categorySelect: document.getElementById('category-select'),
            fileNameInput: document.getElementById('file-name-input'),
            toggleModeBtn: document.getElementById('toggle-mode-btn'),
            previewBtn: document.getElementById('preview-btn'),
            saveBtn: document.getElementById('save-btn'),
            closePreviewBtn: document.getElementById('close-preview-btn'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text')
        };

        this.initializeEditor();
        this.loadProducts();
        this.setupEventListeners();
        this.startAutoSave();
    }

    /**
     * Initialize Quill editor
     */
    initializeEditor() {
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['blockquote', 'code-block'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Start writing your documentation...'
        });

        // Track changes
        this.quill.on('text-change', () => {
            this.markAsUnsaved();
            if (this.currentMode === 'wysiwyg') {
                this.syncToMarkdown();
                this.updatePreview();
            }
        });
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mode toggle
        this.elements.toggleModeBtn.addEventListener('click', () => this.toggleMode());

        // Preview toggle
        this.elements.previewBtn.addEventListener('click', () => this.togglePreview());
        this.elements.closePreviewBtn.addEventListener('click', () => this.togglePreview());

        // Save button
        this.elements.saveBtn.addEventListener('click', () => this.saveDocument());

        // Product/Category selection
        this.elements.productSelect.addEventListener('change', () => this.onProductChange());
        this.elements.superCategorySelect.addEventListener('change', () => this.onSuperCategoryChange());
        this.elements.categorySelect.addEventListener('change', () => this.onCategoryChange());

        // File name input
        this.elements.fileNameInput.addEventListener('input', () => this.markAsUnsaved());

        // Markdown textarea
        this.elements.markdownTextarea.addEventListener('input', () => {
            this.markAsUnsaved();
            if (this.currentMode === 'markdown') {
                this.updatePreview();
            }
        });

        // Markdown toolbar buttons
        document.querySelectorAll('.markdown-toolbar .toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const insert = btn.dataset.insert;
                const wrap = btn.dataset.wrap;
                this.insertMarkdown(insert, wrap);
            });
        });

        // Prevent accidental navigation with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDocument();
            }
            // Ctrl/Cmd + P to toggle preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.togglePreview();
            }
            // Ctrl/Cmd + M to toggle mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleMode();
            }
        });
    }

    /**
     * Load available products
     */
    async loadProducts() {
        try {
            const response = await fetch('/docs/config/docs-config.json');
            const config = await response.json();

            this.elements.productSelect.innerHTML = '<option value="">Select Product...</option>';

            config.products
                .filter(p => p.showInDocs)
                .forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.name;
                    this.elements.productSelect.appendChild(option);
                });
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products');
        }
    }

    /**
     * Handle product selection change
     */
    async onProductChange() {
        const productId = this.elements.productSelect.value;

        if (!productId) {
            this.elements.superCategorySelect.disabled = true;
            this.elements.categorySelect.disabled = true;
            this.elements.fileNameInput.disabled = true;
            return;
        }

        this.currentProduct = productId;
        this.elements.superCategorySelect.disabled = false;

        try {
            const response = await fetch(`/api/docs/${productId}/super-categories`);
            const data = await response.json();

            this.elements.superCategorySelect.innerHTML = '<option value="">Select Super Category...</option>';

            data.superCategories.forEach(sc => {
                const option = document.createElement('option');
                option.value = sc.fullName;
                option.textContent = sc.name;
                this.elements.superCategorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading super categories:', error);
            this.showError('Failed to load super categories');
        }
    }

    /**
     * Handle super category selection change
     */
    async onSuperCategoryChange() {
        const superCategory = this.elements.superCategorySelect.value;

        if (!superCategory) {
            this.elements.categorySelect.disabled = true;
            this.elements.fileNameInput.disabled = true;
            return;
        }

        this.currentSuperCategory = superCategory;
        this.elements.categorySelect.disabled = false;

        try {
            const response = await fetch(`/api/docs/${this.currentProduct}/${superCategory}/categories`);
            const data = await response.json();

            this.elements.categorySelect.innerHTML = '<option value="">Select Category...</option>';

            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                this.elements.categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load categories');
        }
    }

    /**
     * Handle category selection change
     */
    onCategoryChange() {
        const category = this.elements.categorySelect.value;

        if (!category) {
            this.elements.fileNameInput.disabled = true;
            return;
        }

        this.currentCategory = category;
        this.elements.fileNameInput.disabled = false;
    }

    /**
     * Toggle between WYSIWYG and Markdown modes
     */
    toggleMode() {
        if (this.currentMode === 'wysiwyg') {
            // Switch to markdown
            this.syncToMarkdown();
            this.elements.wysiwygContainer.classList.remove('active');
            this.elements.markdownContainer.classList.add('active');
            this.currentMode = 'markdown';
            this.elements.toggleModeBtn.querySelector('span').textContent = 'WYSIWYG Mode';
        } else {
            // Switch to WYSIWYG
            this.syncToWYSIWYG();
            this.elements.markdownContainer.classList.remove('active');
            this.elements.wysiwygContainer.classList.add('active');
            this.currentMode = 'wysiwyg';
            this.elements.toggleModeBtn.querySelector('span').textContent = 'Markdown Mode';
        }

        this.updatePreview();
    }

    /**
     * Toggle preview pane
     */
    togglePreview() {
        this.elements.previewContainer.classList.toggle('active');

        if (this.elements.previewContainer.classList.contains('active')) {
            this.updatePreview();
        }
    }

    /**
     * Sync content from WYSIWYG to Markdown
     */
    syncToMarkdown() {
        const html = this.quill.root.innerHTML;
        const markdown = window.markdownSync.htmlToMarkdown(html);
        this.elements.markdownTextarea.value = markdown;
    }

    /**
     * Sync content from Markdown to WYSIWYG
     */
    syncToWYSIWYG() {
        const markdown = this.elements.markdownTextarea.value;
        const html = window.markdownSync.markdownToQuillHtml(markdown);
        this.quill.root.innerHTML = html;
    }

    /**
     * Update preview pane
     */
    updatePreview() {
        let markdown;

        if (this.currentMode === 'wysiwyg') {
            const html = this.quill.root.innerHTML;
            markdown = window.markdownSync.htmlToMarkdown(html);
        } else {
            markdown = this.elements.markdownTextarea.value;
        }

        const html = window.markdownSync.markdownToHtml(markdown);
        this.elements.previewContent.innerHTML = html;

        // Apply syntax highlighting to code blocks
        this.elements.previewContent.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    /**
     * Insert markdown syntax at cursor position
     */
    insertMarkdown(insert, wrap) {
        const textarea = this.elements.markdownTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);

        let newText;
        let cursorPos;

        if (wrap) {
            // Wrap selected text (e.g., **bold**)
            newText = before + wrap + selectedText + wrap + after;
            cursorPos = wrap ? start + wrap.length : start + insert.length;
        } else {
            // Insert at cursor (e.g., # for heading)
            newText = before + insert + selectedText + after;
            cursorPos = start + insert.length;
        }

        textarea.value = newText;
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);

        this.markAsUnsaved();
        this.updatePreview();
    }

    /**
     * Save document
     */
    async saveDocument() {
        if (!this.validateInput()) {
            return;
        }

        const fileName = this.elements.fileNameInput.value.trim();
        let markdown;

        if (this.currentMode === 'wysiwyg') {
            const html = this.quill.root.innerHTML;
            markdown = window.markdownSync.htmlToMarkdown(html);
        } else {
            markdown = this.elements.markdownTextarea.value;
        }

        // Validate and sanitize markdown
        const validation = window.markdownSync.validateMarkdown(markdown);
        if (!validation.valid) {
            this.showError('Markdown validation failed: ' + validation.errors.join(', '));
            return;
        }

        markdown = window.markdownSync.sanitizeMarkdown(markdown);
        markdown = window.markdownSync.formatMarkdown(markdown);

        const filePath = `${this.currentProduct}/${this.currentSuperCategory}/${this.currentCategory}/${fileName}`;

        try {
            this.updateStatus('saving', 'Saving...');

            const response = await fetch('/api/docs/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product: this.currentProduct,
                    superCategory: this.currentSuperCategory,
                    category: this.currentCategory,
                    fileName: fileName,
                    content: markdown
                })
            });

            if (!response.ok) {
                throw new Error('Save failed');
            }

            const result = await response.json();

            this.markAsSaved();
            this.updateStatus('saved', 'Saved successfully');
            this.currentFileName = fileName;

            // Clear status after 3 seconds
            setTimeout(() => {
                if (this.elements.statusText.textContent === 'Saved successfully') {
                    this.updateStatus('saved', 'All changes saved');
                }
            }, 3000);

        } catch (error) {
            console.error('Save error:', error);
            this.showError('Failed to save document');
            this.updateStatus('error', 'Save failed');
        }
    }

    /**
     * Validate input before saving
     */
    validateInput() {
        if (!this.currentProduct) {
            this.showError('Please select a product');
            return false;
        }

        if (!this.currentSuperCategory) {
            this.showError('Please select a super category');
            return false;
        }

        if (!this.currentCategory) {
            this.showError('Please select a category');
            return false;
        }

        const fileName = this.elements.fileNameInput.value.trim();
        if (!fileName) {
            this.showError('Please enter a file name');
            return false;
        }

        // Validate file name (alphanumeric, hyphens, underscores only)
        if (!/^[a-z0-9-_]+$/.test(fileName)) {
            this.showError('File name can only contain lowercase letters, numbers, hyphens, and underscores');
            return false;
        }

        return true;
    }

    /**
     * Mark document as having unsaved changes
     */
    markAsUnsaved() {
        this.hasUnsavedChanges = true;
        this.updateStatus('unsaved', 'Unsaved changes');
    }

    /**
     * Mark document as saved
     */
    markAsSaved() {
        this.hasUnsavedChanges = false;
    }

    /**
     * Update status indicator
     */
    updateStatus(state, text) {
        this.elements.statusIndicator.className = 'status-indicator ' + state;
        this.elements.statusText.textContent = text;
    }

    /**
     * Show error message
     */
    showError(message) {
        alert(message); // TODO: Replace with toast notification
    }

    /**
     * Start auto-save interval
     */
    startAutoSave() {
        // Auto-save every 2 minutes if there are unsaved changes
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges && this.validateInput()) {
                console.log('Auto-saving...');
                this.saveDocument();
            }
        }, 120000); // 2 minutes
    }

    /**
     * Stop auto-save interval
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Initialize editor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.documentEditor = new DocumentEditor();
    });
} else {
    window.documentEditor = new DocumentEditor();
}
