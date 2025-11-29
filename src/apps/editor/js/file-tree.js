/**
 * File Tree Module for Editor
 * Handles file tree loading, navigation, and file management
 */

let currentFileTree = null;
let selectedItem = null; // Currently selected file or folder

// Initialize file tree on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFileTree();
});

/**
 * Initialize file tree functionality
 */
function initializeFileTree() {
    const fileTreeContainer = document.getElementById('file-tree-container');
    const refreshBtn = document.getElementById('refresh-tree-btn');

    // Setup drag and drop
    if (fileTreeContainer) {
        setupDragAndDrop(fileTreeContainer);
    }

    // Setup context menu
    setupContextMenu();

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadFileTree();
        });
    }

    // Click outside to close context menu
    document.addEventListener('click', () => {
        hideContextMenu();
    });

    // Load file tree immediately
    loadFileTree();
}

/**
 * Setup drag and drop for file upload
 */
function setupDragAndDrop(container) {
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', async (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);

        for (const file of files) {
            // Only accept markdown and json files
            if (!file.name.match(/\.(md|mdx|json)$/)) {
                alert(`Skipping ${file.name}: Only .md, .mdx, and .json files are allowed.`);
                continue;
            }

            try {
                const content = await file.text();
                const token = getAuthToken();

                const response = await fetch('/api/files/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
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
        loadFileTree();
    });
}

/**
 * Setup context menu
 */
function setupContextMenu() {
    const contextMenu = document.getElementById('context-menu');

    if (!contextMenu) return;

    // Context menu actions
    const menuItems = contextMenu.querySelectorAll('.context-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            handleContextMenuAction(action);
            hideContextMenu();
        });
    });
}

/**
 * Show context menu
 */
function showContextMenu(x, y, item) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;

    selectedItem = item;

    // Position the context menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';

    // Update toolbar buttons
    updateToolbarButtons(true);
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

/**
 * Handle context menu action
 */
function handleContextMenuAction(action) {
    if (!selectedItem) return;

    switch (action) {
        case 'open':
            if (selectedItem.type === 'file') {
                openFile(selectedItem);
            }
            break;
        case 'rename':
            renameItem(selectedItem);
            break;
        case 'duplicate':
            duplicateItem(selectedItem);
            break;
        case 'move':
            moveItem(selectedItem);
            break;
        case 'delete':
            deleteItem(selectedItem);
            break;
    }
}

/**
 * Rename item
 */
function renameItem(item) {
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('rename-input');

    if (modal && input) {
        input.value = item.name;
        modal.style.display = 'flex';
        input.focus();
        input.select();

        // Store item to rename
        modal.dataset.itemPath = item.path;
        modal.dataset.itemType = item.type;
    }
}

/**
 * Duplicate item
 */
async function duplicateItem(item) {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/files/duplicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                path: item.path,
                type: item.type
            })
        });

        if (!response.ok) {
            throw new Error('Failed to duplicate');
        }

        // Reload file tree
        loadFileTree();

    } catch (error) {
        console.error('Duplicate error:', error);
        alert('Failed to duplicate item.');
    }
}

/**
 * Move item
 */
function moveItem(item) {
    // Show move dialog (to be implemented)
    alert('Move functionality coming soon.');
}

/**
 * Delete item
 */
function deleteItem(item) {
    const modal = document.getElementById('delete-modal');
    const itemNameSpan = document.getElementById('delete-item-name');

    if (modal && itemNameSpan) {
        itemNameSpan.textContent = item.name;
        modal.style.display = 'flex';

        // Store item to delete
        modal.dataset.itemPath = item.path;
        modal.dataset.itemType = item.type;
    }
}

/**
 * Update toolbar buttons based on selection
 */
function updateToolbarButtons(enabled) {
    const buttons = [
        document.getElementById('rename-btn'),
        document.getElementById('duplicate-btn'),
        document.getElementById('move-btn'),
        document.getElementById('delete-btn')
    ];

    buttons.forEach(btn => {
        if (btn) {
            btn.disabled = !enabled;
        }
    });
}

/**
 * Load file tree (loads the entire content folder)
 */
async function loadFileTree() {
    const container = document.getElementById('file-tree-container');

    try {
        // Show loading state
        container.innerHTML = '<div class="file-tree-empty"><i class="fas fa-spinner fa-spin"></i><p>Loading files...</p></div>';

        const token = getAuthToken();
        const response = await fetch('/api/files/tree', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load file tree');
        }

        const data = await response.json();
        currentFileTree = data.tree;

        // Render tree
        renderFileTree(currentFileTree, container);

    } catch (error) {
        console.error('Error loading file tree:', error);
        showErrorState(container, 'Failed to load files. Please check your connection and try again.');
    }
}

/**
 * Show error state
 */
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="file-tree-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p class="error-title">Error</p>
            <p class="error-message">${message}</p>
            <button id="retry-load-btn" class="btn-retry">
                <i class="fas fa-sync-alt"></i>
                Retry
            </button>
        </div>
    `;

    // Add retry functionality
    const retryBtn = container.querySelector('#retry-load-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => loadFileTree());
    }
}

/**
 * Render file tree in container
 */
function renderFileTree(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="file-tree-empty">
                <i class="fas fa-folder-open"></i>
                <p>No files found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    items.forEach(item => {
        if (item.type === 'folder') {
            renderFolderItem(item, container);
        } else if (item.type === 'file') {
            renderFileItem(item, container);
        }
    });
}

/**
 * Render a folder item
 */
function renderFolderItem(folder, container, level = 0) {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'file-tree-folder';
    folderDiv.style.marginLeft = `${level * 12}px`;

    const header = document.createElement('div');
    header.className = 'folder-header';
    header.innerHTML = `
        <i class="fas fa-chevron-down"></i>
        <i class="fas fa-folder"></i>
        <span>${folder.name}</span>
    `;

    const contents = document.createElement('div');
    contents.className = 'folder-contents';

    // Toggle folder on click
    header.addEventListener('click', (e) => {
        if (e.target.closest('.folder-header') === header) {
            header.classList.toggle('collapsed');
            contents.classList.toggle('collapsed');
        }
    });

    // Right-click context menu
    header.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY, folder);

        // Visual selection
        document.querySelectorAll('.folder-header.selected, .file-tree-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        header.classList.add('selected');
    });

    folderDiv.appendChild(header);
    folderDiv.appendChild(contents);
    container.appendChild(folderDiv);

    // Render children
    if (folder.children && folder.children.length > 0) {
        folder.children.forEach(child => {
            if (child.type === 'folder') {
                renderFolderItem(child, contents, level + 1);
            } else if (child.type === 'file') {
                renderFileItem(child, contents, level + 1);
            }
        });
    }
}

/**
 * Render a file item
 */
function renderFileItem(file, container, level = 0) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-tree-item';
    fileDiv.style.marginLeft = `${level * 12}px`;

    // Determine file icon based on extension
    const extension = file.path.split('.').pop();
    let icon = 'fa-file';

    if (extension === 'md' || extension === 'mdx') {
        icon = 'fa-file-lines';
    } else if (extension === 'json') {
        icon = 'fa-file-code';
    }

    fileDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${file.name}</span>
    `;

    // Click to open file
    fileDiv.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.file-tree-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        fileDiv.classList.add('active');

        // Open file
        openFile(file);
    });

    // Right-click context menu
    fileDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY, file);

        // Visual selection
        document.querySelectorAll('.folder-header.selected, .file-tree-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        fileDiv.classList.add('selected');
    });

    container.appendChild(fileDiv);
}

/**
 * Open a file in the editor
 */
async function openFile(file) {
    try {
        // Load file content
        const token = getAuthToken();
        const response = await fetch(`/api/files/content?filePath=${encodeURIComponent(file.path)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load file');
        }

        const data = await response.json();

        // Load content into editor
        if (typeof loadFileContent === 'function') {
            loadFileContent(data.content, file, data.fileType || 'md');
        }

    } catch (error) {
        console.error('Error opening file:', error);
        alert(`Failed to load file: ${file.name}\n\nPlease ensure the backend server is running.`);
    }
}

/**
 * Get selected product (not used anymore, kept for compatibility)
 */
function getSelectedProduct() {
    return null;
}
