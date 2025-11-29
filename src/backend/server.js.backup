const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { fileTypeFromBuffer } = require('file-type');
const DOMPurify = require('isomorphic-dompurify');

const app = express();

// ==================== Path Validation & Security Functions ====================

// Define safe base directories
const SAFE_DIRECTORIES = {
    content: path.join(__dirname, '..', '..', 'content'),
    uploads: path.join(__dirname, '..', 'apps', 'main', 'downloads'),
    data: path.join(__dirname, '..', '..', 'data')
};

/**
 * Validates that a file path is safe and within allowed directories
 * @param {string} requestedPath - The path to validate
 * @param {string} baseType - The base directory type ('content', 'uploads', 'data')
 * @returns {Object} { valid: boolean, resolvedPath: string, error: string }
 */
function validatePath(requestedPath, baseType = 'content') {
    const baseDir = SAFE_DIRECTORIES[baseType];

    if (!baseDir) {
        return {
            valid: false,
            error: `Invalid base directory type: ${baseType}`
        };
    }

    try {
        // Decode URI components to handle URL-encoded attacks
        const decodedPath = decodeURIComponent(requestedPath);

        // Check for obvious traversal attempts
        const traversalPatterns = [
            /\.\./g,           // Parent directory
            /^~/,              // Home directory
            /%2e%2e/gi,        // URL-encoded ..
            /%252e%252e/gi,    // Double URL-encoded ..
            /\\/g,             // Backslash (Windows-style)
            /\/\//g            // Double slashes
        ];

        for (const pattern of traversalPatterns) {
            if (pattern.test(decodedPath)) {
                logSecurityEvent('Path traversal attempt detected', {
                    requestedPath,
                    pattern: pattern.toString()
                });
                return {
                    valid: false,
                    error: 'Invalid path: contains forbidden characters'
                };
            }
        }

        // Resolve to absolute path
        const absolutePath = path.resolve(baseDir, decodedPath);

        // Ensure the resolved path is within the base directory
        const relativePath = path.relative(baseDir, absolutePath);

        // If relative path starts with '..' or is absolute, it's outside the base
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            logSecurityEvent('Path traversal attempt detected', {
                requestedPath,
                absolutePath,
                relativePath,
                baseDir
            });
            return {
                valid: false,
                error: 'Access denied: path is outside allowed directory'
            };
        }

        return {
            valid: true,
            resolvedPath: absolutePath
        };

    } catch (error) {
        logSecurityEvent('Path validation error', {
            requestedPath,
            error: error.message
        });
        return {
            valid: false,
            error: 'Invalid path format'
        };
    }
}

/**
 * Log security events for monitoring
 */
function logSecurityEvent(event, details) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        event,
        ...details,
        ip: details.ip || 'unknown'
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
        console.warn('[SECURITY]', JSON.stringify(logEntry, null, 2));
    }

    // In production, you might want to log to a file or monitoring service
    // fs.appendFileSync('security.log', JSON.stringify(logEntry) + '\n');
}
const HOST = '0.0.0.0'; // Bind to all network interfaces
const PORT = 5005;
const JWT_SECRET = 'quantom_secret_key_2025'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Analytics middleware removed (Task 1.10.6)

// Serve static files from new structure
app.use('/components', express.static(path.join(__dirname, '..', 'components')));
app.use('/shared', express.static(path.join(__dirname, '..', 'components'))); // Keep /shared for backward compatibility
app.use('/main', express.static(path.join(__dirname, '..', 'apps', 'main')));
app.use('/docs', express.static(path.join(__dirname, '..', 'apps', 'docs')));
app.use('/editor', express.static(path.join(__dirname, '..', 'apps', 'editor')));
app.use('/downloads', express.static(path.join(__dirname, '..', 'apps', 'downloads')));

// Serve public directory (images, etc.)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));


// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: 'Too many login attempts, please try again later' }
});

// Upload rate limiting (5 uploads per minute per IP)
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 uploads per minute
    message: { error: 'Too many upload attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});


// Helper functions
const readJsonFile = (filePath) => {
    try {
        // Resolve path relative to src/apps/main/config for main config files
        const fullPath = filePath.startsWith('config/')
            ? path.join(__dirname, '..', 'apps', 'main', filePath)
            : filePath;
        if (fs.existsSync(fullPath)) {
            const data = fs.readFileSync(fullPath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        // Resolve path relative to src/apps/main/config for main config files
        const fullPath = filePath.startsWith('config/')
            ? path.join(__dirname, '..', 'apps', 'main', filePath)
            : filePath;
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// Analytics helper functions removed (Task 1.10.6)

// Token blacklist helper functions
const tokenBlacklistPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'token-blacklist.json');

const readBlacklist = () => {
    try {
        if (fs.existsSync(tokenBlacklistPath)) {
            const data = fs.readFileSync(tokenBlacklistPath, 'utf8');
            return JSON.parse(data);
        }
        return {
            blacklistedTokens: [],
            lastCleanup: null
        };
    } catch (error) {
        console.error('Error reading token blacklist:', error);
        return { blacklistedTokens: [], lastCleanup: null };
    }
};

const writeBlacklist = (data) => {
    try {
        fs.writeFileSync(tokenBlacklistPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing token blacklist:', error);
        return false;
    }
};

const addToBlacklist = (token, expiresAt) => {
    try {
        const blacklist = readBlacklist();

        // Add token with expiration timestamp
        blacklist.blacklistedTokens.push({
            token,
            blacklistedAt: new Date().toISOString(),
            expiresAt
        });

        // Cleanup expired tokens (older than 48 hours)
        const now = Date.now();
        blacklist.blacklistedTokens = blacklist.blacklistedTokens.filter(item => {
            if (!item.expiresAt) return false;
            return new Date(item.expiresAt).getTime() > now;
        });

        blacklist.lastCleanup = new Date().toISOString();

        return writeBlacklist(blacklist);
    } catch (error) {
        console.error('Error adding to blacklist:', error);
        return false;
    }
};

const isTokenBlacklisted = (token) => {
    try {
        const blacklist = readBlacklist();
        return blacklist.blacklistedTokens.some(item => item.token === token);
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return false;
    }
};

// ==================== File Upload Security Functions ====================

/**
 * Validate file type using magic bytes (file signature)
 * Prevents MIME type spoofing attacks
 * @param {Buffer} fileBuffer - File buffer to validate
 * @param {string} declaredMimeType - MIME type from multer
 * @returns {Promise<{valid: boolean, detectedType: string|null, error: string|null}>}
 */
async function validateFileType(fileBuffer, declaredMimeType) {
    try {
        const fileTypeResult = await fileTypeFromBuffer(fileBuffer);

        if (!fileTypeResult) {
            return {
                valid: false,
                detectedType: null,
                error: 'Could not determine file type'
            };
        }

        // Allowed image types
        const allowedMimeTypes = {
            'image/png': ['image/png'],
            'image/jpeg': ['image/jpeg', 'image/jpg'],
            'image/jpg': ['image/jpeg', 'image/jpg'],
            'image/gif': ['image/gif'],
            'image/svg+xml': ['image/svg+xml'] // SVG requires additional sanitization
        };

        const detectedMime = fileTypeResult.mime;

        // Check if detected type matches declared type
        if (!allowedMimeTypes[declaredMimeType]) {
            return {
                valid: false,
                detectedType: detectedMime,
                error: `Declared MIME type ${declaredMimeType} is not allowed`
            };
        }

        if (!allowedMimeTypes[declaredMimeType].includes(detectedMime)) {
            return {
                valid: false,
                detectedType: detectedMime,
                error: `File signature mismatch. Declared: ${declaredMimeType}, Detected: ${detectedMime}`
            };
        }

        return {
            valid: true,
            detectedType: detectedMime,
            error: null
        };
    } catch (error) {
        console.error('File type validation error:', error);
        return {
            valid: false,
            detectedType: null,
            error: 'File type validation failed'
        };
    }
}

/**
 * Sanitize SVG content to remove potentially malicious scripts
 * Prevents XSS attacks through SVG files
 * @param {string} svgContent - SVG file content as string
 * @returns {string} - Sanitized SVG content
 */
function sanitizeSVG(svgContent) {
    try {
        // DOMPurify configuration for SVG
        const config = {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['use'],
            ADD_ATTR: ['target'],
            FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'a'],
            FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseenter', 'onmouseleave'],
            ALLOW_DATA_ATTR: false
        };

        const sanitized = DOMPurify.sanitize(svgContent, config);

        // Additional check: ensure no script tags remain
        if (sanitized.toLowerCase().includes('<script')) {
            console.warn('SVG sanitization warning: script tag detected after sanitization');
            return svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        return sanitized;
    } catch (error) {
        console.error('SVG sanitization error:', error);
        // Return empty SVG on error to prevent potential XSS
        return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    }
}

/**
 * Sanitize and validate filename
 * Prevents path traversal and special character attacks
 * @param {string} filename - Original filename
 * @returns {{valid: boolean, sanitized: string, error: string|null}}
 */
function sanitizeFilename(filename) {
    try {
        // Remove any path components
        const basename = path.basename(filename);

        // Check for dangerous patterns
        const dangerousPatterns = [
            /\.\./,           // Parent directory traversal
            /^\./, // Hidden files
            /[<>:"|?*\x00-\x1f]/,  // Windows invalid chars
            /^\s+|\s+$/,      // Leading/trailing whitespace
            /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i // Windows reserved names
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(basename)) {
                return {
                    valid: false,
                    sanitized: '',
                    error: `Filename contains invalid pattern: ${pattern}`
                };
            }
        }

        // Extract extension
        const ext = path.extname(basename).toLowerCase();
        const nameWithoutExt = path.basename(basename, ext);

        // Validate extension
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
        if (!allowedExtensions.includes(ext)) {
            return {
                valid: false,
                sanitized: '',
                error: `File extension ${ext} is not allowed`
            };
        }

        // Sanitize filename: only alphanumeric, dash, underscore
        const sanitizedName = nameWithoutExt
            .replace(/[^a-zA-Z0-9-_]/g, '_')  // Replace invalid chars with underscore
            .replace(/_{2,}/g, '_')             // Replace multiple underscores with single
            .substring(0, 100);                 // Limit length

        // Ensure filename is not empty after sanitization
        if (!sanitizedName || sanitizedName.length === 0) {
            return {
                valid: false,
                sanitized: '',
                error: 'Filename is empty after sanitization'
            };
        }

        const finalFilename = `${sanitizedName}${ext}`;

        return {
            valid: true,
            sanitized: finalFilename,
            error: null
        };
    } catch (error) {
        console.error('Filename sanitization error:', error);
        return {
            valid: false,
            sanitized: '',
            error: 'Filename sanitization failed'
        };
    }
}

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        req.token = token; // Store token for potential blacklisting
        next();
    });
};

// Authentication Routes
app.post('/api/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Load users (now from apps/docs/config)
        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);
        if (!usersData || !usersData.users) {
            return res.status(500).json({ error: 'User database not found' });
        }

        // Find user
        const user = usersData.users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token with expiration
        const expiresIn = '24h';
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn }
        );

        // Calculate expiration timestamp (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        res.json({
            success: true,
            token,
            expiresAt,
            expiresIn: 24 * 60 * 60, // seconds
            user: {
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Logout endpoint - blacklists the current token
app.post('/api/logout', verifyToken, (req, res) => {
    try {
        const token = req.token;

        // Decode token to get expiration
        const decoded = jwt.decode(token);
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null;

        // Add token to blacklist
        if (addToBlacklist(token, expiresAt)) {
            res.json({ success: true, message: 'Logged out successfully' });
        } else {
            res.status(500).json({ error: 'Failed to logout properly' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Token refresh endpoint
app.post('/api/refresh', verifyToken, (req, res) => {
    try {
        const oldToken = req.token;
        const user = req.user;

        // Create new JWT token with same user data
        const expiresIn = '24h';
        const newToken = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn }
        );

        // Calculate expiration timestamp
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Blacklist the old token
        const decoded = jwt.decode(oldToken);
        const oldExpiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null;
        addToBlacklist(oldToken, oldExpiresAt);

        res.json({
            success: true,
            token: newToken,
            expiresAt,
            expiresIn: 24 * 60 * 60 // seconds
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Product structure discovery endpoint (legacy - will be deprecated)
app.get('/api/docs/products/:productId/structure', (req, res) => {
    try {
        const { productId } = req.params;
        const productPath = path.join(__dirname, '..', '..', 'content', productId);

        // Check if product directory exists
        if (!fs.existsSync(productPath)) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Helper function to format folder/file names for display
        // Supports format: "01-Get-Started" -> "Get Started" (extracts name, removes number prefix)
        const formatName = (name) => {
            // Check if name starts with number pattern (e.g., "01-", "02-")
            const match = name.match(/^\d+-(.+)$/);
            if (match) {
                // Extract the name part after the number prefix
                return match[1].replace(/-/g, ' ');
            }
            // Fallback to original behavior if no number prefix
            return name.replace(/-/g, ' ');
        };

        // Helper function to extract order number from folder name
        const extractOrderNumber = (name) => {
            const match = name.match(/^(\d+)-/);
            return match ? parseInt(match[1], 10) : 999; // Default to 999 for non-numbered folders
        };

        // Read all category folders
        const categories = fs.readdirSync(productPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => !dirent.name.startsWith('.')) // Ignore hidden folders like .DS_Store
            .map(dirent => {
                const categoryName = dirent.name;
                const categoryPath = path.join(productPath, categoryName);

                // Read all markdown files in category
                const files = fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.md'))
                    .map(file => ({
                        fileName: file,
                        displayName: formatName(file.replace('.md', '')),
                        path: `${productId}/${categoryName}/${file}`
                    }));

                return {
                    categoryName: categoryName,
                    displayName: formatName(categoryName),
                    orderNumber: extractOrderNumber(categoryName),
                    files: files
                };
            })
            .sort((a, b) => a.orderNumber - b.orderNumber); // Sort by order number

        res.json({ categories });
    } catch (error) {
        console.error('Error reading product structure:', error);
        res.status(500).json({ error: 'Failed to read product structure' });
    }
});

// Get super-categories for a product
app.get('/api/docs/:product/super-categories', (req, res) => {
    try {
        const productId = req.params.product;

        const validation = validatePath(productId, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized super-categories access attempt', {
                productId,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if product directory exists
        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const contentPath = validation.resolvedPath;

        const folders = fs.readdirSync(contentPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => !dirent.name.startsWith('.')) // Ignore hidden folders
            .map(dirent => {
                const name = dirent.name;
                const match = name.match(/^(\d+)-(.+)$/);
                return {
                    id: name,
                    order: match ? parseInt(match[1]) : 999,
                    name: match ? match[2] : name,
                    fullName: name
                };
            })
            .sort((a, b) => a.order - b.order);

        res.json({ superCategories: folders });
    } catch (error) {
        console.error('Error reading super-categories:', error);
        res.status(500).json({ error: 'Failed to load super-categories' });
    }
});

// Get categories for a super-category
app.get('/api/docs/:product/:superCategory/categories', (req, res) => {
    try {
        const { product, superCategory } = req.params;
        const requestedPath = path.join(product, superCategory);

        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized categories access attempt', {
                requestedPath,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if super-category directory exists
        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'Super-category not found' });
        }

        const superCatPath = validation.resolvedPath;

        const categories = fs.readdirSync(superCatPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => !dirent.name.startsWith('.')) // Ignore hidden folders
            .map(dirent => {
                const name = dirent.name;
                const match = name.match(/^(\d+)-(.+)$/);
                const categoryPath = path.join(superCatPath, name);

                // Read all markdown files in category
                const files = fs.readdirSync(categoryPath)
                    .filter(f => f.endsWith('.md'))
                    .map(f => f.replace('.md', ''));

                return {
                    id: name,
                    order: match ? parseInt(match[1]) : 999,
                    name: match ? match[2] : name,
                    files: files
                };
            })
            .sort((a, b) => a.order - b.order);

        res.json({ categories });
    } catch (error) {
        console.error('Error reading categories:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

/**
 * Format a folder/file name into a URL-friendly slug
 * Removes number prefixes like "01-" and converts to lowercase with hyphens
 * @param {string} name - Original folder/file name (e.g., "01-Getting-Started")
 * @returns {string} URL-friendly slug (e.g., "getting-started")
 */
function formatUrlPath(name) {
    // Remove file extension if present (.md or .mdx)
    let cleaned = name.replace(/\.(md|mdx)$/, '');

    // Remove number prefix (e.g., "01-", "02-", etc.)
    cleaned = cleaned.replace(/^\d+-/, '');

    // Convert to lowercase
    cleaned = cleaned.toLowerCase();

    // Replace spaces and underscores with hyphens
    cleaned = cleaned.replace(/[\s_]+/g, '-');

    // Remove any characters that aren't alphanumeric or hyphens
    cleaned = cleaned.replace(/[^a-z0-9-]/g, '');

    // Remove consecutive hyphens
    cleaned = cleaned.replace(/-+/g, '-');

    // Remove leading and trailing hyphens
    cleaned = cleaned.replace(/^-|-$/g, '');

    return cleaned;
}

/**
 * Resolve a formatted URL path back to the actual folder/file name
 * @param {string} parentPath - Absolute path to parent directory
 * @param {string} urlSlug - URL slug to resolve
 * @returns {string|null} Actual folder/file name, or null if not found
 */
function resolveUrlPath(parentPath, urlSlug) {
    try {
        const entries = fs.readdirSync(parentPath, { withFileTypes: true });

        for (const entry of entries) {
            const formatted = formatUrlPath(entry.name);
            if (formatted === urlSlug.toLowerCase()) {
                return entry.name;
            }
        }

        return null;
    } catch (error) {
        console.error(`Error resolving URL path in ${parentPath}:`, error);
        return null;
    }
}

/**
 * Recursively builds a category tree from a directory
 * Supports unlimited nesting depth
 * @param {string} dirPath - Absolute path to directory
 * @param {string} relativePath - Relative path from product root (for URLs)
 * @returns {Array} Array of category/file objects
 */
function buildCategoryTree(dirPath, relativePath = '') {
    const items = [];

    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            // Skip hidden files and folders (e.g., .DS_Store)
            if (entry.name.startsWith('.')) continue;

            const itemPath = path.join(dirPath, entry.name);
            const itemRelativePath = relativePath
                ? `${relativePath}/${entry.name}`
                : entry.name;

            if (entry.isDirectory()) {
                // Extract order number and clean name
                const match = entry.name.match(/^(\d+)-(.+)$/);
                const order = match ? parseInt(match[1], 10) : 999;
                const cleanName = match ? match[2] : entry.name;
                const urlSlug = formatUrlPath(entry.name);

                // Check if this category has an index.md or index.mdx file
                const indexMdPath = path.join(itemPath, 'index.md');
                const indexMdxPath = path.join(itemPath, 'index.mdx');
                const hasIndex = fs.existsSync(indexMdPath) || fs.existsSync(indexMdxPath);

                // Recursively build subtree
                const children = buildCategoryTree(itemPath, itemRelativePath);

                items.push({
                    type: 'category',
                    id: entry.name,
                    name: cleanName,
                    urlSlug: urlSlug,
                    order: order,
                    path: itemRelativePath,
                    children: children,
                    hasFiles: children.some(child => child.type === 'file'),
                    hasSubcategories: children.some(child => child.type === 'category'),
                    hasIndex: hasIndex  // NEW: Indicates if category has index.md
                });

            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
                // Skip index.md/index.mdx files (they're represented by the category itself)
                if (entry.name === 'index.md' || entry.name === 'index.mdx') continue;

                // Markdown or MDX file
                const fileExt = entry.name.endsWith('.mdx') ? '.mdx' : '.md';
                const fileType = entry.name.endsWith('.mdx') ? 'mdx' : 'md';
                const nameWithoutExt = entry.name.replace(/\.(md|mdx)$/, '');
                const match = nameWithoutExt.match(/^(\d+)-(.+)$/);
                const order = match ? parseInt(match[1], 10) : 999;
                const cleanName = match ? match[2] : nameWithoutExt;
                const urlSlug = formatUrlPath(entry.name);

                items.push({
                    type: 'file',
                    id: nameWithoutExt,
                    name: cleanName,
                    urlSlug: urlSlug,
                    order: order,
                    path: itemRelativePath,
                    fileName: entry.name,
                    fileType: fileType  // NEW: Indicates file type (md or mdx)
                });
            }
        }

        // Sort by order number, then by name
        items.sort((a, b) => {
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });

    } catch (error) {
        console.error(`Error building tree for ${dirPath}:`, error);
    }

    return items;
}

// Get complete recursive file tree for a product
app.get('/api/docs/:product/tree', (req, res) => {
    try {
        const productId = req.params.product;

        const validation = validatePath(productId, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized tree access attempt', {
                productId,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if product directory exists
        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Build recursive tree
        const tree = buildCategoryTree(validation.resolvedPath);

        res.json({
            product: productId,
            tree: tree,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error building product tree:', error);
        res.status(500).json({ error: 'Failed to build product tree' });
    }
});

// Get markdown file using URL-formatted nested path (supports URL slugs)
app.get('/api/docs/:product/*', (req, res) => {
    try {
        const productId = req.params.product;
        const urlPath = req.params[0]; // Everything after product ID (URL-formatted)

        // Skip if this looks like an existing endpoint
        if (!urlPath || urlPath === 'tree' || urlPath === 'super-categories') {
            return res.status(404).json({ error: 'File not found' });
        }

        // Split URL path into segments (e.g., "getting-started/installation" -> ["getting-started", "installation"])
        const urlSegments = urlPath.split('/').filter(s => s);

        // Resolve each URL segment to actual folder/file name
        const productValidation = validatePath(productId, 'content');
        if (!productValidation.valid) {
            return res.status(403).json({ error: 'Access denied' });
        }

        let currentPath = productValidation.resolvedPath;
        const resolvedSegments = [];

        for (const segment of urlSegments) {
            const actualName = resolveUrlPath(currentPath, segment);

            if (!actualName) {
                return res.status(404).json({
                    error: 'File not found',
                    details: `Could not resolve: ${segment}`
                });
            }

            resolvedSegments.push(actualName);
            currentPath = path.join(currentPath, actualName);
        }

        // Check if the resolved path is a file or directory
        let fileType = 'md';  // Default to markdown
        if (!fs.existsSync(currentPath)) {
            // Try adding .mdx extension first
            const mdxPath = currentPath + '.mdx';
            if (fs.existsSync(mdxPath)) {
                currentPath = mdxPath;
                resolvedSegments[resolvedSegments.length - 1] += '.mdx';
                fileType = 'mdx';
            } else {
                // Try adding .md extension
                currentPath += '.md';
                resolvedSegments[resolvedSegments.length - 1] += '.md';
                fileType = 'md';
            }
        } else {
            // File exists, detect type from extension
            if (currentPath.endsWith('.mdx')) {
                fileType = 'mdx';
            }
        }

        const stats = fs.statSync(currentPath);

        // If it's a directory, return error
        if (stats.isDirectory()) {
            return res.status(400).json({ error: 'Path is a directory, not a file' });
        }

        // Validate the resolved path
        const filePath = path.join(productId, ...resolvedSegments);
        const validation = validatePath(filePath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file access attempt', {
                urlPath,
                resolvedPath: filePath,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        const content = fs.readFileSync(validation.resolvedPath, 'utf-8');
        const fileStats = fs.statSync(validation.resolvedPath);

        res.json({
            content,
            fileType: fileType,  // NEW: File type indicator (md or mdx)
            path: urlPath,
            resolvedPath: filePath,
            metadata: {
                size: content.length,
                lastModified: fileStats.mtime
            }
        });

    } catch (error) {
        console.error('Error reading markdown file:', error);
        res.status(500).json({ error: 'Failed to load file' });
    }
});

// Get markdown file from super-category structure (legacy - supports flat structure)
app.get('/api/docs/:product/:superCategory/:category/:file', (req, res) => {
    try {
        const { product, superCategory, category, file } = req.params;
        const requestedPath = path.join(product, superCategory, category, `${file}.md`);

        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file access attempt', {
                requestedPath,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if file exists
        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(validation.resolvedPath, 'utf-8');
        const stats = fs.statSync(validation.resolvedPath);

        res.json({
            content,
            category,
            file,
            metadata: {
                size: content.length,
                lastModified: stats.mtime
            }
        });
    } catch (error) {
        console.error('Error reading markdown file:', error);
        res.status(500).json({ error: 'Failed to load file' });
    }
});



// Image upload configuration for editor
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'apps', 'docs', 'images');

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const originalName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-]/g, '_');
        cb(null, `${timestamp}_${originalName}${ext}`);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for images
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image type. Allowed: JPG, PNG, GIF, SVG, WEBP'));
        }
    }
});

// Image upload endpoint for editor
app.post('/api/upload-image', uploadLimiter, imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Validate file type
        const buffer = fs.readFileSync(req.file.path);
        const fileType = await fileTypeFromBuffer(buffer);

        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

        if (!fileType || !allowedMimes.includes(fileType.mime)) {
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid image file type' });
        }

        // Return the URL to the uploaded image
        const imageUrl = `/docs/images/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });

    } catch (error) {
        console.error('Image upload error:', error);

        // Clean up file if it was uploaded
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Image upload failed' });
    }
});

// Document save endpoint for editor
app.post('/api/docs/save', verifyToken, (req, res) => {
    try {
        const { product, superCategory, category, fileName, content } = req.body;

        if (!product || !superCategory || !category || !fileName || content === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate fileName
        if (!/^[a-z0-9-_]+$/.test(fileName)) {
            return res.status(400).json({ error: 'Invalid file name format' });
        }

        // Construct file path
        const requestedPath = path.join(product, superCategory, category, `${fileName}.md`);
        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file write attempt', {
                requestedPath,
                ip: req.ip,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Ensure directory exists
        const dir = path.dirname(validation.resolvedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(validation.resolvedPath, content, 'utf-8');

        res.json({
            success: true,
            message: 'Document saved successfully',
            path: requestedPath
        });

    } catch (error) {
        console.error('Document save error:', error);
        res.status(500).json({ error: 'Failed to save document' });
    }
});

// Search analytics endpoint removed (Task 1.10.6)

// User Management Routes
app.get('/api/users', verifyToken, (req, res) => {
    try {
        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);

        if (!usersData) {
            return res.status(500).json({ error: 'Could not load users data' });
        }

        // Return users without passwords
        const safeUsers = usersData.users.map(user => ({
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        }));

        res.json({ users: safeUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', verifyToken, async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);

        if (!usersData) {
            return res.status(500).json({ error: 'Could not load users data' });
        }

        // Check if user already exists
        if (usersData.users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            username,
            password: hashedPassword,
            role: role || 'user',
            authCode: `qnt_auth_2025_${username}_${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        usersData.users.push(newUser);

        if (writeJsonFile(usersPath, usersData)) {
            res.json({
                success: true,
                user: {
                    username: newUser.username,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                }
            });
        } else {
            res.status(500).json({ error: 'Failed to save user data' });
        }
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/users/:username', verifyToken, async (req, res) => {
    try {
        const { username } = req.params;
        const { role, password } = req.body;

        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);

        if (!usersData) {
            return res.status(500).json({ error: 'Could not load users data' });
        }

        const userIndex = usersData.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update role if provided
        if (role) {
            usersData.users[userIndex].role = role;
        }

        // Update password if provided
        if (password) {
            usersData.users[userIndex].password = await bcrypt.hash(password, 10);
        }

        if (writeJsonFile(usersPath, usersData)) {
            res.json({
                success: true,
                user: {
                    username: usersData.users[userIndex].username,
                    role: usersData.users[userIndex].role,
                    createdAt: usersData.users[userIndex].createdAt
                }
            });
        } else {
            res.status(500).json({ error: 'Failed to save user data' });
        }
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/:username', verifyToken, (req, res) => {
    try {
        const { username } = req.params;

        // Prevent deleting your own account
        if (req.user.username === username) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);

        if (!usersData) {
            return res.status(500).json({ error: 'Could not load users data' });
        }

        const userIndex = usersData.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        usersData.users.splice(userIndex, 1);

        if (writeJsonFile(usersPath, usersData)) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save user data' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const username = req.user.username;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
        const usersData = readJsonFile(usersPath);

        if (!usersData) {
            return res.status(500).json({ error: 'Could not load users data' });
        }

        const userIndex = usersData.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, usersData.users[userIndex].password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        usersData.users[userIndex].password = await bcrypt.hash(newPassword, 10);

        if (writeJsonFile(usersPath, usersData)) {
            res.json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save user data' });
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Config Management Routes
app.get('/api/config/docs', verifyToken, (req, res) => {
    try {
        const configPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'docs-config.json');
        const configData = readJsonFile(configPath);

        if (!configData) {
            return res.status(500).json({ error: 'Could not load config data' });
        }

        res.json(configData);
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/config/docs', verifyToken, (req, res) => {
    try {
        const configData = req.body;
        const configPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'docs-config.json');

        if (writeJsonFile(configPath, configData)) {
            res.json({ success: true, message: 'Config updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save config data' });
        }
    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics routes removed (Task 1.10.6)

// ==================== File Management Routes ====================

// ==================== Editor-Specific Routes (No Product Parameter) ====================

// Get complete file tree (all content folder)
app.get('/api/files/tree', verifyToken, (req, res) => {
    try {
        const contentPath = path.join(__dirname, '..', '..', 'content');

        if (!fs.existsSync(contentPath)) {
            return res.status(404).json({ error: 'Content directory not found' });
        }

        const buildFileTree = (dirPath, relativePath = '') => {
            const items = fs.readdirSync(dirPath, { withFileTypes: true })
                .filter(item => !item.name.startsWith('.')) // Ignore hidden files
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
                        const stats = fs.statSync(itemPath);
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
                // Folders first, then files, then alphabetically
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'folder' ? -1 : 1;
            });
        };

        const tree = buildFileTree(contentPath);

        res.json({ tree });
    } catch (error) {
        console.error('Get file tree error:', error);
        res.status(500).json({ error: 'Failed to load file tree' });
    }
});

// Read file content (without product parameter)
app.get('/api/files/content', verifyToken, (req, res) => {
    try {
        const { filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const validation = validatePath(filePath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file read attempt', {
                filePath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(validation.resolvedPath, 'utf8');
        const stats = fs.statSync(validation.resolvedPath);

        // Detect file type from extension
        const fileType = validation.resolvedPath.endsWith('.mdx') ? 'mdx' :
                        validation.resolvedPath.endsWith('.json') ? 'json' : 'md';

        res.json({
            content,
            fileType: fileType,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
        });
    } catch (error) {
        console.error('Read file error:', error);
        res.status(500).json({ error: 'Failed to load file' });
    }
});

// Save file content
app.post('/api/files/save', verifyToken, (req, res) => {
    try {
        const { path: filePath, content } = req.body;

        if (!filePath || content === undefined) {
            return res.status(400).json({ error: 'File path and content are required' });
        }

        const validation = validatePath(filePath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file save attempt', {
                filePath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        // Ensure directory exists
        const dir = path.dirname(validation.resolvedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(validation.resolvedPath, content, 'utf8');

        res.json({
            success: true,
            message: 'File saved successfully',
            path: filePath
        });
    } catch (error) {
        console.error('Save file error:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Create new file
app.post('/api/files/create', verifyToken, (req, res) => {
    try {
        const { fileName, content, product } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: 'File name is required' });
        }

        // Use provided product or default to 'content' root
        const basePath = product
            ? path.join(__dirname, '..', '..', 'content', product)
            : path.join(__dirname, '..', '..', 'content');

        const filePath = path.join(basePath, fileName);

        // Security check
        if (!filePath.startsWith(path.join(__dirname, '..', '..', 'content'))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (fs.existsSync(filePath)) {
            return res.status(400).json({ error: 'File already exists' });
        }

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, content || '', 'utf8');

        res.json({
            success: true,
            message: 'File created successfully',
            path: fileName
        });
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({ error: 'Failed to create file' });
    }
});

// Upload file
app.post('/api/files/upload', verifyToken, uploadLimiter, async (req, res) => {
    try {
        const uploadPath = path.join(__dirname, '..', '..', 'content');

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Configure multer for memory storage
        const memoryUpload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
                files: 1
            },
            fileFilter: function (req, file, cb) {
                const allowedExts = ['.md', '.mdx', '.json'];
                const ext = path.extname(file.originalname).toLowerCase();

                if (allowedExts.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only .md, .mdx, and .json files are allowed.'));
                }
            }
        }).single('file');

        memoryUpload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            try {
                const fileName = req.file.originalname;
                const fileContent = req.file.buffer.toString('utf8');
                const filePath = path.join(uploadPath, fileName);

                // Write file
                fs.writeFileSync(filePath, fileContent, 'utf8');

                res.json({
                    success: true,
                    message: 'File uploaded successfully',
                    fileName: fileName,
                    path: fileName
                });
            } catch (processingError) {
                console.error('Upload processing error:', processingError);
                return res.status(500).json({ error: 'Failed to process uploaded file' });
            }
        });
    } catch (error) {
        console.error('Upload endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Duplicate file or folder
app.post('/api/files/duplicate', verifyToken, (req, res) => {
    try {
        const { path: itemPath, type } = req.body;

        if (!itemPath) {
            return res.status(400).json({ error: 'Path is required' });
        }

        const validation = validatePath(itemPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized duplicate attempt', {
                itemPath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Generate new name with " - Copy" suffix
        const ext = path.extname(validation.resolvedPath);
        const nameWithoutExt = path.basename(validation.resolvedPath, ext);
        const dir = path.dirname(validation.resolvedPath);

        let copyNumber = 1;
        let newPath;
        do {
            const suffix = copyNumber === 1 ? ' - Copy' : ` - Copy (${copyNumber})`;
            newPath = path.join(dir, `${nameWithoutExt}${suffix}${ext}`);
            copyNumber++;
        } while (fs.existsSync(newPath));

        // Copy file or folder
        if (type === 'folder' || fs.statSync(validation.resolvedPath).isDirectory()) {
            fs.cpSync(validation.resolvedPath, newPath, { recursive: true });
        } else {
            fs.copyFileSync(validation.resolvedPath, newPath);
        }

        const relativePath = path.relative(path.join(__dirname, '..', '..', 'content'), newPath);

        res.json({
            success: true,
            message: 'Duplicated successfully',
            newPath: relativePath
        });
    } catch (error) {
        console.error('Duplicate error:', error);
        res.status(500).json({ error: 'Failed to duplicate item' });
    }
});

// ==================== Product-Specific Routes ====================

// Get file tree for a product
app.get('/api/files/:product/tree', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const productPath = path.join(__dirname, '..', '..', 'content', product);

        if (!fs.existsSync(productPath)) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const buildFileTree = (dirPath, relativePath = '') => {
            const items = fs.readdirSync(dirPath, { withFileTypes: true })
                .filter(item => !item.name.startsWith('.')) // Ignore hidden files
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
                        const stats = fs.statSync(itemPath);
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
                // Folders first, then files, then alphabetically
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'folder' ? -1 : 1;
            });
        };

        const tree = buildFileTree(productPath);

        res.json({ product, tree });
    } catch (error) {
        console.error('Get file tree error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Read file content
app.get('/api/files/:product/content', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const requestedPath = path.join(product, filePath);
        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file read attempt', {
                requestedPath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(validation.resolvedPath, 'utf8');
        const stats = fs.statSync(validation.resolvedPath);

        // Detect file type from extension
        const fileType = validation.resolvedPath.endsWith('.mdx') ? 'mdx' : 'md';

        res.json({
            content,
            fileType: fileType,  // NEW: File type indicator
            path: filePath,
            size: stats.size,
            modified: stats.mtime
        });
    } catch (error) {
        console.error('Read file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new file or folder
app.post('/api/files/:product', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { type, folderPath, name, content } = req.body;

        if (!type || !name) {
            return res.status(400).json({ error: 'Type and name are required' });
        }

        const basePath = path.join(__dirname, '..', '..', 'content', product);
        const targetPath = folderPath
            ? path.join(basePath, folderPath, name)
            : path.join(basePath, name);

        // Security check
        if (!targetPath.startsWith(basePath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (fs.existsSync(targetPath)) {
            return res.status(400).json({ error: 'File or folder already exists' });
        }

        if (type === 'folder') {
            fs.mkdirSync(targetPath, { recursive: true });
        } else if (type === 'file') {
            const dir = path.dirname(targetPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(targetPath, content || '');
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        res.json({
            success: true,
            message: `${type === 'folder' ? 'Folder' : 'File'} created successfully`,
            path: folderPath ? `${folderPath}/${name}` : name
        });
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update file content
app.put('/api/files/:product', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { filePath, content } = req.body;

        if (!filePath || content === undefined) {
            return res.status(400).json({ error: 'File path and content are required' });
        }

        const requestedPath = path.join(product, filePath);
        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file update attempt', {
                requestedPath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.writeFileSync(validation.resolvedPath, content, 'utf8');

        res.json({
            success: true,
            message: 'File updated successfully',
            path: filePath
        });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete file or folder
app.delete('/api/files/:product', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const requestedPath = path.join(product, filePath);
        const validation = validatePath(requestedPath, 'content');

        if (!validation.valid) {
            logSecurityEvent('Unauthorized file deletion attempt', {
                requestedPath,
                ip: req.ip,
                user: req.user?.username,
                error: validation.error
            });
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(validation.resolvedPath)) {
            return res.status(404).json({ error: 'File or folder not found' });
        }

        const stats = fs.statSync(validation.resolvedPath);

        if (stats.isDirectory()) {
            fs.rmSync(validation.resolvedPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(validation.resolvedPath);
        }

        res.json({
            success: true,
            message: 'Deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rename file or folder
app.post('/api/files/:product/rename', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { oldPath, newName } = req.body;

        if (!oldPath || !newName) {
            return res.status(400).json({ error: 'Old path and new name are required' });
        }

        const basePath = path.join(__dirname, '..', '..', 'content', product);
        const oldFullPath = path.join(basePath, oldPath);
        const directory = path.dirname(oldFullPath);
        const newFullPath = path.join(directory, newName);

        // Security check
        if (!oldFullPath.startsWith(basePath) || !newFullPath.startsWith(basePath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(oldFullPath)) {
            return res.status(404).json({ error: 'File or folder not found' });
        }

        if (fs.existsSync(newFullPath)) {
            return res.status(400).json({ error: 'A file or folder with that name already exists' });
        }

        fs.renameSync(oldFullPath, newFullPath);

        const newPath = oldPath.replace(path.basename(oldPath), newName);

        res.json({
            success: true,
            message: 'Renamed successfully',
            newPath
        });
    } catch (error) {
        console.error('Rename file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Move file or folder
app.post('/api/files/:product/move', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const { sourcePath, targetPath } = req.body;

        if (!sourcePath || !targetPath) {
            return res.status(400).json({ error: 'Source and target paths are required' });
        }

        const basePath = path.join(__dirname, '..', '..', 'content', product);
        const sourceFullPath = path.join(basePath, sourcePath);
        const targetFullPath = path.join(basePath, targetPath, path.basename(sourcePath));

        // Security check
        if (!sourceFullPath.startsWith(basePath) || !targetFullPath.startsWith(basePath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(sourceFullPath)) {
            return res.status(404).json({ error: 'Source not found' });
        }

        const targetDir = path.join(basePath, targetPath);
        if (!fs.existsSync(targetDir)) {
            return res.status(404).json({ error: 'Target folder not found' });
        }

        if (fs.existsSync(targetFullPath)) {
            return res.status(400).json({ error: 'A file with that name already exists in target folder' });
        }

        // Move the file/folder
        fs.renameSync(sourceFullPath, targetFullPath);

        const newPath = `${targetPath}/${path.basename(sourcePath)}`.replace(/^\//, '');

        res.json({
            success: true,
            message: 'Moved successfully',
            newPath
        });
    } catch (error) {
        console.error('Move file error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload image file with enhanced security
app.post('/api/files/:product/upload', verifyToken, uploadLimiter, async (req, res) => {
    try {
        const { product } = req.params;
        const uploadPath = path.join(__dirname, '..', '..', 'content', product, 'images');

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Configure multer for temporary storage (memory)
        const memoryUpload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
                files: 1 // Only one file at a time
            },
            fileFilter: function (req, file, cb) {
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];

                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PNG, JPG, GIF, and SVG are allowed.'));
                }
            }
        }).single('file');

        // Handle file upload to memory
        memoryUpload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    console.warn(`Upload rejected: File size exceeds 5MB limit. User: ${req.user.username}, Product: ${product}`);
                    return res.status(400).json({ error: 'File size exceeds 5MB limit' });
                }
                console.warn(`Upload rejected: Multer error. Code: ${err.code}, User: ${req.user.username}`);
                return res.status(400).json({ error: err.message });
            } else if (err) {
                console.warn(`Upload rejected: ${err.message}. User: ${req.user.username}, Product: ${product}`);
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                console.warn(`Upload rejected: No file uploaded. User: ${req.user.username}, Product: ${product}`);
                return res.status(400).json({ error: 'No file uploaded' });
            }

            try {
                const fileBuffer = req.file.buffer;
                const originalFilename = req.file.originalname;
                const declaredMimeType = req.file.mimetype;

                // Step 1: Sanitize and validate filename
                const filenameSanitization = sanitizeFilename(originalFilename);
                if (!filenameSanitization.valid) {
                    console.warn(`Upload rejected: Invalid filename. Original: ${originalFilename}, Error: ${filenameSanitization.error}, User: ${req.user.username}`);
                    return res.status(400).json({ error: `Invalid filename: ${filenameSanitization.error}` });
                }

                // Step 2: Validate file type using magic bytes (skip for SVG as it's text-based)
                if (declaredMimeType !== 'image/svg+xml') {
                    const validation = await validateFileType(fileBuffer, declaredMimeType);
                    if (!validation.valid) {
                        console.error(`Upload rejected: File type validation failed. Original: ${originalFilename}, Declared: ${declaredMimeType}, Detected: ${validation.detectedType}, Error: ${validation.error}, User: ${req.user.username}`);
                        return res.status(400).json({ error: `Security: ${validation.error}` });
                    }
                }

                // Step 3: Generate safe filename with timestamp
                const timestamp = Date.now();
                const ext = path.extname(filenameSanitization.sanitized);
                const nameWithoutExt = path.basename(filenameSanitization.sanitized, ext);
                const finalFilename = `${nameWithoutExt}_${timestamp}${ext}`;
                const filePath = path.join(uploadPath, finalFilename);

                // Step 4: Handle SVG files separately (sanitization required)
                if (declaredMimeType === 'image/svg+xml') {
                    const svgContent = fileBuffer.toString('utf8');
                    const sanitizedSVG = sanitizeSVG(svgContent);

                    // Write sanitized SVG
                    fs.writeFileSync(filePath, sanitizedSVG, 'utf8');
                    console.info(`SVG uploaded and sanitized: ${finalFilename}, User: ${req.user.username}, Product: ${product}, Size: ${Buffer.byteLength(sanitizedSVG)} bytes`);
                } else {
                    // Write binary image file
                    fs.writeFileSync(filePath, fileBuffer);
                    console.info(`Image uploaded: ${finalFilename}, User: ${req.user.username}, Product: ${product}, Type: ${declaredMimeType}, Size: ${fileBuffer.length} bytes`);
                }

                // Return relative path for markdown
                const relativePath = `/docs/content/${product}/images/${finalFilename}`;

                res.json({
                    success: true,
                    filename: finalFilename,
                    path: relativePath,
                    originalName: originalFilename,
                    size: fs.statSync(filePath).size,
                    sanitized: filenameSanitization.sanitized !== originalFilename
                });

            } catch (processingError) {
                console.error(`Upload processing error: ${processingError.message}, User: ${req.user.username}, Product: ${product}`, processingError.stack);
                return res.status(500).json({ error: 'Failed to process uploaded file' });
            }
        });

    } catch (error) {
        console.error(`Upload endpoint error: ${error.message}, User: ${req.user.username || 'unknown'}`, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==================== Clean URL Routes ====================

// Root redirect to main page
app.get('/', (req, res) => {
    res.redirect('/main');
});

// Special settings route (in docs folder but accessed via /settings)
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'apps', 'docs', 'settings.html'));
});

// Editor route (standalone editor application)
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'apps', 'editor', 'index.html'));
});

// Redirect /download to /downloads for backward compatibility
app.get('/download', (req, res) => {
    res.redirect('/downloads');
});

// Dynamic routing for all apps in src/apps directory
const appsPath = path.join(__dirname, '..', 'apps');
const appFolders = fs.readdirSync(appsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Create routes for each app folder
appFolders.forEach(appName => {
    const indexPath = path.join(appsPath, appName, 'index.html');

    // Check if index.html exists in this folder
    if (fs.existsSync(indexPath)) {
        // Main route for the app
        app.get(`/${appName}`, (req, res) => {
            res.sendFile(indexPath);
        });

        // Catch-all route for nested paths (e.g., /docs/*)
        app.get(`/${appName}/*`, (req, res) => {
            res.sendFile(indexPath);
        });
    }
});

// 404 handler for all unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'apps', 'main', '404.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 10MB)' });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`✓ QuantomDocs Server running on http://localhost:${PORT}`);
    console.log(`✓ Network access: http://192.168.178.52:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health`);

    // Check if users.json exists
    const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');
    if (!fs.existsSync(usersPath)) {
        console.log('⚠ users.json not found. Please create users manually.');
    } else {
        console.log('✓ User database loaded');
    }
});