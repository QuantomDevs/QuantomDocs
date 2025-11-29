/**
 * Files Controller
 * Handles file management operations for the editor
 */

const path = require('path');
const multer = require('multer');
const config = require('../config');
const fileService = require('../services/fileService');
const fileAdapter = require('../data/fileSystemAdapter');
const { ValidationError } = require('../utils/customErrors');

/**
 * Build file tree recursively
 */
function buildFileTree(dirPath, relativePath = '') {
    const items = fileAdapter.readdirSync(dirPath, { withFileTypes: true })
        .filter(item => !item.name.startsWith('.'))
        .map(item => {
            const itemPath = path.join(dirPath, item.name);
            const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

            if (item.isDirectory()) {
                return {
                    name: item.name,
                    type: 'folder',
                    path: itemRelativePath,
                    children: buildFileTree(itemPath, itemRelativePath)
                };
            } else {
                const stats = fileAdapter.statSync(itemPath);
                return {
                    name: item.name,
                    type: 'file',
                    path: itemRelativePath,
                    extension: path.extname(item.name),
                    size: stats.size,
                    modified: stats.mtime
                };
            }
        });

    return items.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
    });
}

/**
 * Get complete file tree
 */
function getFileTree(req, res, next) {
    try {
        const contentPath = config.paths.content;

        if (!fileAdapter.exists(contentPath)) {
            return res.status(404).json({ error: 'Content directory not found' });
        }

        const tree = buildFileTree(contentPath);

        res.json({ tree });
    } catch (error) {
        next(error);
    }
}

/**
 * Get file tree for a specific product
 */
function getProductFileTree(req, res, next) {
    try {
        const { product } = req.params;
        const productPath = path.join(config.paths.content, product);

        if (!fileAdapter.exists(productPath)) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const tree = buildFileTree(productPath);

        res.json({ product, tree });
    } catch (error) {
        next(error);
    }
}

/**
 * Read file content (raw, for editing)
 */
async function readFileContent(req, res, next) {
    try {
        const { filePath } = req.query;

        if (!filePath) {
            throw new ValidationError('File path is required');
        }

        const rawContent = await fileService.getRawContent(filePath);
        const safePath = fileService.resolveSafePath(filePath);
        const stats = await fileAdapter.stat(safePath);

        const fileType = safePath.endsWith('.mdx') ? 'mdx' :
                        safePath.endsWith('.json') ? 'json' : 'md';

        res.json({
            content: rawContent,
            fileType: fileType,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Read file content for a specific product
 */
async function readProductFileContent(req, res, next) {
    try {
        const { product } = req.params;
        const { filePath } = req.query;

        if (!filePath) {
            throw new ValidationError('File path is required');
        }

        const requestedPath = path.join(product, filePath);
        const rawContent = await fileService.getRawContent(requestedPath);
        const safePath = fileService.resolveSafePath(requestedPath);
        const stats = await fileAdapter.stat(safePath);

        const fileType = safePath.endsWith('.mdx') ? 'mdx' : 'md';

        res.json({
            content: rawContent,
            fileType: fileType,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Save file content
 */
async function saveFile(req, res, next) {
    try {
        const { path: filePath, content } = req.body;

        if (!filePath || content === undefined) {
            throw new ValidationError('File path and content are required');
        }

        const safePath = fileService.resolveSafePath(filePath);

        // Ensure directory exists
        const dir = path.dirname(safePath);
        if (!fileAdapter.exists(dir)) {
            await fileAdapter.mkdir(dir);
        }

        await fileAdapter.writeFile(safePath, content);

        // Clear cache for this file
        fileService.clearCache(filePath);

        // Update search index
        const searchService = require('../services/searchService');
        await searchService.updateFileInIndex(filePath);

        res.json({
            success: true,
            message: 'File saved successfully',
            path: filePath
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create new file or folder
 */
async function createFileOrFolder(req, res, next) {
    try {
        const { type, folderPath, name, content, product } = req.body;

        if (!type || !name) {
            throw new ValidationError('Type and name are required');
        }

        const basePath = product
            ? path.join(config.paths.content, product)
            : config.paths.content;

        const targetPath = folderPath
            ? path.join(basePath, folderPath, name)
            : path.join(basePath, name);

        // Security check
        if (!targetPath.startsWith(config.paths.content)) {
            throw new ValidationError('Access denied');
        }

        if (fileAdapter.exists(targetPath)) {
            throw new ValidationError('File or folder already exists');
        }

        if (type === 'folder') {
            await fileAdapter.mkdir(targetPath);
        } else if (type === 'file') {
            const dir = path.dirname(targetPath);
            if (!fileAdapter.exists(dir)) {
                await fileAdapter.mkdir(dir);
            }
            await fileAdapter.writeFile(targetPath, content || '');
        } else {
            throw new ValidationError('Invalid type');
        }

        const relativePath = path.relative(config.paths.content, targetPath);

        res.json({
            success: true,
            message: `${type === 'folder' ? 'Folder' : 'File'} created successfully`,
            path: relativePath
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete file or folder
 */
async function deleteFileOrFolder(req, res, next) {
    try {
        const { product } = req.params;
        const { filePath } = req.query;

        if (!filePath) {
            throw new ValidationError('File path is required');
        }

        const requestedPath = product ? path.join(product, filePath) : filePath;
        const safePath = fileService.resolveSafePath(requestedPath);

        if (!fileAdapter.exists(safePath)) {
            throw new ValidationError('File or folder not found');
        }

        const stats = fileAdapter.statSync(safePath);

        if (stats.isDirectory()) {
            await fileAdapter.rmdir(safePath);
        } else {
            await fileAdapter.unlink(safePath);
        }

        res.json({
            success: true,
            message: 'Deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Rename file or folder
 */
async function renameFileOrFolder(req, res, next) {
    try {
        const { product } = req.params;
        const { oldPath, newName } = req.body;

        if (!oldPath || !newName) {
            throw new ValidationError('Old path and new name are required');
        }

        const basePath = product ? path.join(config.paths.content, product) : config.paths.content;
        const oldFullPath = path.join(basePath, oldPath);
        const directory = path.dirname(oldFullPath);
        const newFullPath = path.join(directory, newName);

        // Security check
        if (!oldFullPath.startsWith(basePath) || !newFullPath.startsWith(basePath)) {
            throw new ValidationError('Access denied');
        }

        if (!fileAdapter.exists(oldFullPath)) {
            throw new ValidationError('File or folder not found');
        }

        if (fileAdapter.exists(newFullPath)) {
            throw new ValidationError('A file or folder with that name already exists');
        }

        await fileAdapter.rename(oldFullPath, newFullPath);

        const newPath = oldPath.replace(path.basename(oldPath), newName);

        res.json({
            success: true,
            message: 'Renamed successfully',
            newPath
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Move file or folder
 */
async function moveFileOrFolder(req, res, next) {
    try {
        const { product } = req.params;
        const { sourcePath, targetPath } = req.body;

        if (!sourcePath || !targetPath) {
            throw new ValidationError('Source and target paths are required');
        }

        const basePath = product ? path.join(config.paths.content, product) : config.paths.content;
        const sourceFullPath = path.join(basePath, sourcePath);
        const targetFullPath = path.join(basePath, targetPath, path.basename(sourcePath));

        // Security check
        if (!sourceFullPath.startsWith(basePath) || !targetFullPath.startsWith(basePath)) {
            throw new ValidationError('Access denied');
        }

        if (!fileAdapter.exists(sourceFullPath)) {
            throw new ValidationError('Source not found');
        }

        const targetDir = path.join(basePath, targetPath);
        if (!fileAdapter.exists(targetDir)) {
            throw new ValidationError('Target folder not found');
        }

        if (fileAdapter.exists(targetFullPath)) {
            throw new ValidationError('A file with that name already exists in target folder');
        }

        await fileAdapter.rename(sourceFullPath, targetFullPath);

        const newPath = `${targetPath}/${path.basename(sourcePath)}`.replace(/^\//, '');

        res.json({
            success: true,
            message: 'Moved successfully',
            newPath
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Duplicate file or folder
 */
function duplicateFileOrFolder(req, res, next) {
    try {
        const { path: itemPath, type } = req.body;

        if (!itemPath) {
            throw new ValidationError('Path is required');
        }

        const safePath = fileService.resolveSafePath(itemPath);

        if (!fileAdapter.exists(safePath)) {
            throw new ValidationError('Item not found');
        }

        // Generate new name with " - Copy" suffix
        const ext = path.extname(safePath);
        const nameWithoutExt = path.basename(safePath, ext);
        const dir = path.dirname(safePath);

        let copyNumber = 1;
        let newPath;
        do {
            const suffix = copyNumber === 1 ? ' - Copy' : ` - Copy (${copyNumber})`;
            newPath = path.join(dir, `${nameWithoutExt}${suffix}${ext}`);
            copyNumber++;
        } while (fileAdapter.exists(newPath));

        // Copy file or folder
        if (type === 'folder' || fileAdapter.statSync(safePath).isDirectory()) {
            fileAdapter.copySync(safePath, newPath);
        } else {
            const content = require('fs').readFileSync(safePath);
            require('fs').writeFileSync(newPath, content);
        }

        const relativePath = path.relative(config.paths.content, newPath);

        res.json({
            success: true,
            message: 'Duplicated successfully',
            newPath: relativePath
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFileTree,
    getProductFileTree,
    readFileContent,
    readProductFileContent,
    saveFile,
    createFileOrFolder,
    deleteFileOrFolder,
    renameFileOrFolder,
    moveFileOrFolder,
    duplicateFileOrFolder
};
