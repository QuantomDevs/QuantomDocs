/**
 * File Tree Module for Editor
 * Handles file tree loading and navigation
 */

let currentFileTree = null;
let selectedProduct = null;

// Initialize file tree on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFileTree();
});

/**
 * Initialize file tree functionality
 */
function initializeFileTree() {
    const productSelect = document.getElementById('product-select');
    const refreshBtn = document.getElementById('refresh-tree-btn');

    if (productSelect) {
        productSelect.addEventListener('change', handleProductChange);
        loadProducts();
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (selectedProduct) {
                loadFileTree(selectedProduct);
            }
        });
    }
}

/**
 * Load available products
 */
async function loadProducts() {
    try {
        const response = await fetch('/docs/config/docs-config.json');
        const config = await response.json();

        const productSelect = document.getElementById('product-select');
        const modalProductSelect = document.getElementById('modal-product-select');

        // Clear existing options (keep placeholder)
        [productSelect, modalProductSelect].forEach(select => {
            if (select) {
                while (select.options.length > 1) {
                    select.remove(1);
                }
            }
        });

        // Add products
        config.products.forEach(product => {
            const option1 = document.createElement('option');
            option1.value = product.id;
            option1.textContent = product.name;

            const option2 = option1.cloneNode(true);

            if (productSelect) productSelect.appendChild(option1);
            if (modalProductSelect) modalProductSelect.appendChild(option2);
        });

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

/**
 * Handle product selection change
 */
async function handleProductChange(event) {
    const productId = event.target.value;

    if (!productId) {
        clearFileTree();
        return;
    }

    selectedProduct = productId;
    await loadFileTree(productId);
}

/**
 * Load file tree for a product
 */
async function loadFileTree(productId) {
    const container = document.getElementById('file-tree-container');

    try {
        // Show loading state
        container.innerHTML = '<div class="file-tree-empty"><i class="fas fa-spinner fa-spin"></i><p>Loading files...</p></div>';

        const token = getAuthToken();
        const response = await fetch(`/api/files/${productId}/tree`, {
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
        container.innerHTML = `
            <div class="file-tree-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load files</p>
            </div>
        `;
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
    header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        contents.classList.toggle('collapsed');
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
    const icon = file.extension === '.md' || file.extension === '.mdx'
        ? 'fa-file-lines'
        : 'fa-file';

    fileDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${file.name}</span>
    `;

    // Click to open file
    fileDiv.addEventListener('click', () => {
        openFile(file);
    });

    container.appendChild(fileDiv);
}

/**
 * Open a file in the editor
 */
async function openFile(file) {
    try {
        // Remove active class from all items
        document.querySelectorAll('.file-tree-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        event.target.closest('.file-tree-item')?.classList.add('active');

        // Load file content
        const token = getAuthToken();
        const response = await fetch(`/api/files/${selectedProduct}/content?filePath=${encodeURIComponent(file.path)}`, {
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
        alert('Failed to open file. Please try again.');
    }
}

/**
 * Clear file tree
 */
function clearFileTree() {
    const container = document.getElementById('file-tree-container');
    container.innerHTML = `
        <div class="file-tree-empty">
            <i class="fas fa-folder-open"></i>
            <p>Select a product to view files</p>
        </div>
    `;
    currentFileTree = null;
}

/**
 * Get selected product
 */
function getSelectedProduct() {
    return selectedProduct;
}
