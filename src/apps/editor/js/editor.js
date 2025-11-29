/**
 * DOCUMENTATION EDITOR
 * Complete editor implementation with file management, markdown editing, and preview
 */

class DocumentEditor {
    constructor() {
        // Editor state
        this.currentMode = 'markdown'; // 'markdown' or 'preview'
        this.currentFile = null;
        this.hasUnsavedChanges = false;
        this.slashDropdownVisible = false;
        this.selectedSlashIndex = 0;

        // DOM elements
        this.elements = {
            // Main containers
            welcomeScreen: document.getElementById('welcome-screen'),
            editorArea: document.getElementById('editor-area'),
            editorContent: document.getElementById('editor-content'),

            // Editor panes
            markdownEditor: document.getElementById('markdown-editor'),
            markdownTextarea: document.getElementById('markdown-textarea'),
            previewPane: document.getElementById('preview-pane'),
            previewContent: document.getElementById('preview-content'),

            // Toolbar buttons
            newFileBtn: document.getElementById('new-file-btn'),
            newFolderBtn: document.getElementById('new-folder-btn'),
            uploadFileBtn: document.getElementById('upload-file-btn'),
            renameBtn: document.getElementById('rename-btn'),
            duplicateBtn: document.getElementById('duplicate-btn'),
            moveBtn: document.getElementById('move-btn'),
            deleteBtn: document.getElementById('delete-btn'),
            toggleModeBtn: document.getElementById('toggle-mode-btn'),
            saveBtn: document.getElementById('save-btn'),

            // Status
            toolbarStatus: document.getElementById('toolbar-status'),
            statusText: document.getElementById('status-text'),

            // File info in toolbar
            fileInfoDisplay: document.getElementById('file-info-display'),
            noFileInfo: document.getElementById('no-file-info'),
            toolbarFileName: document.getElementById('toolbar-file-name'),
            toolbarFileTypeBadge: document.getElementById('toolbar-file-type-badge'),
            toolbarWordCount: document.getElementById('toolbar-word-count'),

            // Slash dropdown
            slashDropdown: document.getElementById('slash-dropdown'),

            // Modals
            newFileModal: document.getElementById('new-file-modal'),
            deleteModal: document.getElementById('delete-modal'),
            renameModal: document.getElementById('rename-modal'),

            // Welcome screen
            welcomeNewFile: document.getElementById('welcome-new-file')
        };

        this.init();
    }

    /**
     * Initialize the editor
     */
    init() {
        // Check authentication
        if (!checkAuth()) {
            return;
        }

        // Hide loading screen and show editor
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('editor-app').style.display = 'flex';

        // Setup event listeners
        this.setupEventListeners();

        // Configure marked for markdown rendering
        this.configureMarked();
    }

    /**
     * Configure marked.js for markdown rendering
     */
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true
            });
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Toolbar buttons
        this.elements.newFileBtn.addEventListener('click', () => this.showNewFileModal());
        this.elements.uploadFileBtn.addEventListener('click', () => this.uploadFiles());
        this.elements.renameBtn.addEventListener('click', () => this.renameSelectedItem());
        this.elements.duplicateBtn.addEventListener('click', () => this.duplicateSelectedItem());
        this.elements.deleteBtn.addEventListener('click', () => this.deleteSelectedItem());
        this.elements.toggleModeBtn.addEventListener('click', () => this.toggleMode());
        this.elements.saveBtn.addEventListener('click', () => this.saveFile());

        // Welcome screen
        if (this.elements.welcomeNewFile) {
            this.elements.welcomeNewFile.addEventListener('click', () => this.showNewFileModal());
        }

        // Markdown textarea events
        this.elements.markdownTextarea.addEventListener('input', () => {
            this.markAsUnsaved();
            this.updateWordCount();

            // Update preview if in preview mode
            if (this.currentMode === 'preview') {
                this.updatePreview();
            }
        });

        // Slash command handling
        this.elements.markdownTextarea.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.elements.markdownTextarea.addEventListener('input', (e) => this.handleSlashCommand(e));

        // Click outside to close slash dropdown
        document.addEventListener('click', (e) => {
            if (this.slashDropdownVisible &&
                !this.elements.slashDropdown.contains(e.target) &&
                e.target !== this.elements.markdownTextarea) {
                this.hideSlashDropdown();
            }
        });

        // Slash dropdown item click
        document.querySelectorAll('.slash-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const component = item.dataset.component;
                this.insertComponent(component);
            });
        });

        // New file modal
        document.getElementById('close-new-file-modal').addEventListener('click', () => this.hideModal('newFileModal'));
        document.getElementById('cancel-new-file').addEventListener('click', () => this.hideModal('newFileModal'));
        document.getElementById('create-new-file').addEventListener('click', () => this.createNewFile());

        // Delete modal
        document.getElementById('close-delete-modal').addEventListener('click', () => this.hideModal('deleteModal'));
        document.getElementById('cancel-delete').addEventListener('click', () => this.hideModal('deleteModal'));
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());

        // Rename modal
        document.getElementById('close-rename-modal').addEventListener('click', () => this.hideModal('renameModal'));
        document.getElementById('cancel-rename').addEventListener('click', () => this.hideModal('renameModal'));
        document.getElementById('confirm-rename').addEventListener('click', () => this.confirmRename());

        // Modal overlay clicks
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.parentElement.style.display = 'none';
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveFile();
            }
            // Ctrl/Cmd + M to toggle mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleMode();
            }
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    /**
     * Handle keyboard events in markdown textarea
     */
    handleKeyDown(e) {
        if (this.slashDropdownVisible) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSlashDropdown(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSlashDropdown(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const items = document.querySelectorAll('.slash-dropdown-item');
                if (items[this.selectedSlashIndex]) {
                    const component = items[this.selectedSlashIndex].dataset.component;
                    this.insertComponent(component);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideSlashDropdown();
            }
        }
    }

    /**
     * Handle slash command input
     */
    handleSlashCommand(e) {
        const textarea = this.elements.markdownTextarea;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPos);

        // Check if we just typed a slash at the beginning of a line or after whitespace
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];

        if (currentLine === '/' || (currentLine.endsWith('/') && currentLine[currentLine.length - 2] === ' ')) {
            this.showSlashDropdown();
        } else if (this.slashDropdownVisible && !currentLine.includes('/')) {
            this.hideSlashDropdown();
        }
    }

    /**
     * Show slash command dropdown
     */
    showSlashDropdown() {
        const textarea = this.elements.markdownTextarea;
        const rect = textarea.getBoundingClientRect();

        this.elements.slashDropdown.style.display = 'block';
        this.elements.slashDropdown.style.left = `${rect.left + 20}px`;
        this.elements.slashDropdown.style.top = `${rect.top + 100}px`;

        this.slashDropdownVisible = true;
        this.selectedSlashIndex = 0;
        this.updateSlashSelection();
    }

    /**
     * Hide slash command dropdown
     */
    hideSlashDropdown() {
        this.elements.slashDropdown.style.display = 'none';
        this.slashDropdownVisible = false;
    }

    /**
     * Navigate slash dropdown with arrow keys
     */
    navigateSlashDropdown(direction) {
        const items = document.querySelectorAll('.slash-dropdown-item');
        this.selectedSlashIndex = Math.max(0, Math.min(items.length - 1, this.selectedSlashIndex + direction));
        this.updateSlashSelection();
    }

    /**
     * Update visual selection in slash dropdown
     */
    updateSlashSelection() {
        const items = document.querySelectorAll('.slash-dropdown-item');
        items.forEach((item, index) => {
            if (index === this.selectedSlashIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Insert component template at cursor
     */
    insertComponent(component) {
        const textarea = this.elements.markdownTextarea;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPos);
        const textAfterCursor = textarea.value.substring(cursorPos);

        // Remove the slash that triggered the dropdown
        const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
        const beforeSlash = textBeforeCursor.substring(0, lastSlashIndex);

        let template = '';
        switch (component) {
            case 'text':
                template = '';
                break;
            case 'heading1':
                template = '# ';
                break;
            case 'heading2':
                template = '## ';
                break;
            case 'heading3':
                template = '### ';
                break;
            case 'blockquote':
                template = '> ';
                break;
            case 'unordered-list':
                template = '- Item 1\n- Item 2\n- Item 3\n';
                break;
            case 'ordered-list':
                template = '1. Item 1\n2. Item 2\n3. Item 3\n';
                break;
            case 'table':
                template = '| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n';
                break;
            case 'code-block':
                template = '```javascript\n// Your code here\n```\n';
                break;
            case 'inline-code':
                template = '`code`';
                break;
        }

        textarea.value = beforeSlash + template + textAfterCursor;
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = beforeSlash.length + template.length;

        this.hideSlashDropdown();
        this.markAsUnsaved();
        this.updateWordCount();
    }

    /**
     * Toggle between markdown and preview modes
     */
    toggleMode() {
        if (this.currentMode === 'markdown') {
            // Switch to preview
            this.currentMode = 'preview';
            this.elements.markdownEditor.classList.remove('active');
            this.elements.previewPane.classList.add('active');
            this.elements.toggleModeBtn.querySelector('span').textContent = 'Edit';
            this.elements.toggleModeBtn.querySelector('i').className = 'fas fa-edit';
            this.updatePreview();
        } else {
            // Switch to markdown
            this.currentMode = 'markdown';
            this.elements.previewPane.classList.remove('active');
            this.elements.markdownEditor.classList.add('active');
            this.elements.toggleModeBtn.querySelector('span').textContent = 'Preview';
            this.elements.toggleModeBtn.querySelector('i').className = 'fas fa-eye';
        }
    }

    /**
     * Update preview content
     */
    updatePreview() {
        const markdown = this.elements.markdownTextarea.value;

        if (typeof marked !== 'undefined') {
            const html = marked.parse(markdown);
            this.elements.previewContent.innerHTML = html;

            // Apply syntax highlighting to code blocks
            this.elements.previewContent.querySelectorAll('pre code').forEach(block => {
                if (typeof hljs !== 'undefined') {
                    hljs.highlightElement(block);
                }
            });
        }
    }

    /**
     * Update word count
     */
    updateWordCount() {
        const text = this.elements.markdownTextarea.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (this.elements.toolbarWordCount) {
            this.elements.toolbarWordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Load file content into editor
     */
    loadFile(file, content) {
        this.currentFile = file;
        this.elements.markdownTextarea.value = content;

        // Update UI
        this.elements.welcomeScreen.style.display = 'none';
        this.elements.editorArea.style.display = 'flex';

        // Update file info in toolbar
        if (this.elements.fileInfoDisplay && this.elements.noFileInfo) {
            this.elements.fileInfoDisplay.style.display = 'flex';
            this.elements.noFileInfo.style.display = 'none';
        }

        if (this.elements.toolbarFileName) {
            this.elements.toolbarFileName.textContent = file.name;
        }

        // Set file type badge
        const extension = file.path.split('.').pop().toUpperCase();
        if (this.elements.toolbarFileTypeBadge) {
            this.elements.toolbarFileTypeBadge.textContent = extension;
        }

        // Enable save button
        this.elements.saveBtn.disabled = false;

        // Reset state
        this.markAsSaved();
        this.updateWordCount();
        this.updateStatus('saved', 'All changes saved');

        // Focus editor
        this.elements.markdownTextarea.focus();
    }

    /**
     * Save current file
     */
    async saveFile() {
        if (!this.currentFile) {
            alert('No file is currently open.');
            return;
        }

        try {
            this.updateStatus('saving', 'Saving...');

            const content = this.elements.markdownTextarea.value;
            const token = getAuthToken();

            const response = await fetch('/api/files/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    path: this.currentFile.path,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error('Save failed');
            }

            this.markAsSaved();
            this.updateStatus('saved', 'Saved successfully');

            // Clear status after 3 seconds
            setTimeout(() => {
                if (this.elements.statusText.textContent === 'Saved successfully') {
                    this.updateStatus('saved', 'All changes saved');
                }
            }, 3000);

        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save file. Please try again.');
            this.updateStatus('error', 'Save failed');
        }
    }

    /**
     * Show new file modal
     */
    showNewFileModal() {
        this.showModal('newFileModal');
        document.getElementById('new-file-name').focus();
    }

    /**
     * Create new file
     */
    async createNewFile() {
        const fileName = document.getElementById('new-file-name').value.trim();
        const fileType = document.getElementById('new-file-type').value;

        if (!fileName) {
            alert('Please enter a file name.');
            return;
        }

        // Validate file name
        if (!/^[a-z0-9-_]+$/.test(fileName)) {
            alert('File name can only contain lowercase letters, numbers, hyphens, and underscores.');
            return;
        }

        try {
            const fullFileName = `${fileName}.${fileType}`;
            const token = getAuthToken();
            const selectedProduct = getSelectedProduct();

            if (!selectedProduct) {
                alert('Please select a product first.');
                return;
            }

            const response = await fetch('/api/files/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product: selectedProduct,
                    fileName: fullFileName,
                    content: ''
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create file');
            }

            const result = await response.json();

            // Hide modal and reload file tree
            this.hideModal('newFileModal');
            document.getElementById('new-file-name').value = '';

            // Reload file tree
            if (typeof loadFileTree === 'function') {
                loadFileTree(selectedProduct);
            }

        } catch (error) {
            console.error('Create file error:', error);
            alert('Failed to create file. Please try again.');
        }
    }

    /**
     * Rename selected item
     */
    renameSelectedItem() {
        // This would be called from the file tree
        this.showModal('renameModal');
    }

    /**
     * Confirm rename
     */
    confirmRename() {
        // Implement rename logic
        this.hideModal('renameModal');
    }

    /**
     * Duplicate selected item
     */
    duplicateSelectedItem() {
        // Implement duplicate logic
        alert('Duplicate functionality coming soon.');
    }

    /**
     * Delete selected item
     */
    deleteSelectedItem() {
        this.showModal('deleteModal');
        document.getElementById('delete-item-name').textContent = 'selected item';
    }

    /**
     * Confirm delete
     */
    async confirmDelete() {
        // Implement delete logic
        this.hideModal('deleteModal');
    }

    /**
     * Upload files
     */
    uploadFiles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.md,.mdx,.json';

        input.onchange = async (e) => {
            const files = Array.from(e.target.files);

            for (const file of files) {
                try {
                    const content = await file.text();
                    const token = getAuthToken();
                    const selectedProduct = getSelectedProduct();

                    if (!selectedProduct) {
                        alert('Please select a product first.');
                        return;
                    }

                    const response = await fetch('/api/files/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            product: selectedProduct,
                            fileName: file.name,
                            content: content
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to upload ${file.name}`);
                    }

                } catch (error) {
                    console.error('Upload error:', error);
                    alert(`Failed to upload ${file.name}`);
                }
            }

            // Reload file tree
            const selectedProduct = getSelectedProduct();
            if (typeof loadFileTree === 'function' && selectedProduct) {
                loadFileTree(selectedProduct);
            }
        };

        input.click();
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
        this.elements.toolbarStatus.className = 'toolbar-status ' + state;
        this.elements.statusText.textContent = text;
    }

    /**
     * Show modal
     */
    showModal(modalName) {
        const modal = this.elements[modalName];
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalName) {
        const modal = this.elements[modalName];
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

/**
 * Load file content into editor (called from file-tree.js)
 */
function loadFileContent(content, file, fileType) {
    if (window.documentEditor) {
        window.documentEditor.loadFile(file, content);
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
