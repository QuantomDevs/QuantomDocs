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
const HOST = '0.0.0.0'; // Bind to all network interfaces
const PORT = 5005;
const JWT_SECRET = 'quantom_secret_key_2025'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Analytics tracking middleware (runs for all requests)
app.use((req, res, next) => {
    // Only track GET requests to actual pages (not assets like CSS, JS, images)
    if (req.method === 'GET' && !req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i)) {
        // Track page visits (exclude API endpoints)
        if (!req.path.startsWith('/api/') && !req.path.startsWith('/shared/') && !req.path.startsWith('/main/') && !req.path.startsWith('/docs/')) {
            // Determine if this is a markdown file request (docs pages)
            const isDocsPage = req.path.startsWith('/docs/') && req.path !== '/docs' && req.path !== '/docs/';

            // Normalize the path
            let trackPath = req.path;
            if (trackPath === '/') trackPath = '/main';

            // Track asynchronously to avoid blocking the request
            setImmediate(() => {
                trackVisit(trackPath, isDocsPage);
            });
        }
    }
    next();
});

// Serve static files from new structure
app.use('/shared', express.static(path.join(__dirname, 'src/shared')));
app.use('/main', express.static(path.join(__dirname, 'src/main')));
app.use('/docs', express.static(path.join(__dirname, 'src/docs')));
app.use('/legal', express.static(path.join(__dirname, 'src/legal')));

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

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'src', 'main', 'downloads');

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = {
            'download-file': ['.jar', '.zip', '.tar.gz', '.exe', '.dmg']
        };

        const uploadType = req.body.uploadType || 'download-file';
        const fileExt = path.extname(file.originalname).toLowerCase();

        if (allowedTypes[uploadType]?.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${uploadType}`));
        }
    }
});

// Helper functions
const readJsonFile = (filePath) => {
    try {
        // Resolve path relative to src/main/config for main config files
        const fullPath = filePath.startsWith('config/')
            ? path.join(__dirname, 'src', 'main', filePath)
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
        // Resolve path relative to src/main/config for main config files
        const fullPath = filePath.startsWith('config/')
            ? path.join(__dirname, 'src', 'main', filePath)
            : filePath;
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// Analytics helper functions
const analyticsPath = path.join(__dirname, 'src', 'docs', 'config', 'analytics.json');

const readAnalytics = () => {
    try {
        if (fs.existsSync(analyticsPath)) {
            const data = fs.readFileSync(analyticsPath, 'utf8');
            return JSON.parse(data);
        }
        // Return default structure if file doesn't exist
        return {
            months: {},
            allTime: {
                totalVisits: 0,
                totalPages: 0,
                totalMarkdownFiles: 0,
                firstVisit: null,
                lastVisit: null
            }
        };
    } catch (error) {
        console.error('Error reading analytics:', error);
        return null;
    }
};

const writeAnalytics = (data) => {
    try {
        fs.writeFileSync(analyticsPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing analytics:', error);
        return false;
    }
};

const trackVisit = (urlPath, isMarkdownFile = false) => {
    try {
        const analytics = readAnalytics();
        if (!analytics) return;

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = now.toISOString();

        // Initialize month if it doesn't exist
        if (!analytics.months[monthKey]) {
            analytics.months[monthKey] = {
                totalVisits: 0,
                pages: {},
                markdownFiles: {}
            };
        }

        const monthData = analytics.months[monthKey];

        // Track the visit
        monthData.totalVisits++;

        if (isMarkdownFile) {
            // Track markdown file visit
            if (!monthData.markdownFiles[urlPath]) {
                monthData.markdownFiles[urlPath] = 0;
            }
            monthData.markdownFiles[urlPath]++;

            // Update all-time markdown files count
            analytics.allTime.totalMarkdownFiles = Object.keys(
                Object.values(analytics.months).reduce((acc, month) => {
                    Object.keys(month.markdownFiles).forEach(file => acc[file] = true);
                    return acc;
                }, {})
            ).length;
        } else {
            // Track page visit
            if (!monthData.pages[urlPath]) {
                monthData.pages[urlPath] = 0;
            }
            monthData.pages[urlPath]++;

            // Update all-time pages count
            analytics.allTime.totalPages = Object.keys(
                Object.values(analytics.months).reduce((acc, month) => {
                    Object.keys(month.pages).forEach(page => acc[page] = true);
                    return acc;
                }, {})
            ).length;
        }

        // Update all-time statistics
        analytics.allTime.totalVisits++;
        if (!analytics.allTime.firstVisit) {
            analytics.allTime.firstVisit = timestamp;
        }
        analytics.allTime.lastVisit = timestamp;

        // Write back to file
        writeAnalytics(analytics);
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
};

// Token blacklist helper functions
const tokenBlacklistPath = path.join(__dirname, 'src', 'docs', 'config', 'token-blacklist.json');

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

        // Load users (now from docs/config)
        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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

// Downloads Management Routes
app.get('/api/downloads', (req, res) => {
    const downloadsData = readJsonFile('config/downloads.json');
    if (!downloadsData) {
        return res.status(500).json({ error: 'Could not load downloads data' });
    }
    res.json(downloadsData);
});

app.post('/api/downloads', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { type, category, projectName, description, tags, status, version, changelogs, downloadLink } = req.body;

        const downloadsData = readJsonFile('config/downloads.json');
        if (!downloadsData) {
            return res.status(500).json({ error: 'Could not load downloads data' });
        }

        if (type === 'new-project') {
            // Check if project name already exists
            const existingProject = downloadsData.categories
                .flatMap(cat => cat.projects)
                .find(proj => proj.name.toLowerCase() === projectName.toLowerCase());

            if (existingProject) {
                return res.status(400).json({ error: 'Project name already exists' });
            }

            // Find or create category
            let targetCategory = downloadsData.categories.find(cat => cat.id === category);
            if (!targetCategory) {
                return res.status(400).json({ error: 'Invalid category' });
            }

            // Create new project
            const newProject = {
                id: projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: projectName,
                description: description,
                icon: "fas fa-cube", // Default icon
                category: category,
                maintained: status === 'active',
                downloads: 0,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                changelogs: []
            };

            targetCategory.projects.push(newProject);

        } else if (type === 'add-download') {
            // Find target project
            const targetCategory = downloadsData.categories.find(cat => cat.id === category);
            if (!targetCategory) {
                return res.status(400).json({ error: 'Invalid category' });
            }

            const targetProject = targetCategory.projects.find(proj => proj.name === projectName);
            if (!targetProject) {
                return res.status(400).json({ error: 'Project not found' });
            }

            // Determine download path
            let downloadPath = downloadLink;
            if (req.file) {
                downloadPath = `downloads/${req.file.filename}`;
            }

            // Parse changelogs
            let changelogMessages = [];
            try {
                changelogMessages = changelogs ? JSON.parse(changelogs) : [];
            } catch (error) {
                changelogMessages = [{ message: changelogs || 'Version update' }];
            }

            // Add new changelog entry
            const newChangelog = {
                buildNumber: (targetProject.changelogs.length + 1),
                version: version,
                commits: changelogMessages.map(msg => ({
                    message: typeof msg === 'string' ? msg : msg.message
                })),
                timestamp: new Date().toISOString(),
                downloadPath: downloadPath
            };

            targetProject.changelogs.unshift(newChangelog); // Add to beginning
        }

        // Save updated data
        if (writeJsonFile('config/downloads.json', downloadsData)) {
            res.json({ success: true, message: 'Download updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save downloads data' });
        }

    } catch (error) {
        console.error('Downloads update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/downloads/:id', verifyToken, (req, res) => {
    try {
        const projectId = req.params.id;
        const updateData = req.body;

        const downloadsData = readJsonFile('config/downloads.json');
        if (!downloadsData) {
            return res.status(500).json({ error: 'Could not load downloads data' });
        }

        // Find and update project
        let projectFound = false;
        downloadsData.categories.forEach(category => {
            const projectIndex = category.projects.findIndex(proj => proj.id === projectId);
            if (projectIndex !== -1) {
                // Update project data
                Object.assign(category.projects[projectIndex], updateData);
                projectFound = true;
            }
        });

        if (!projectFound) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (writeJsonFile('config/downloads.json', downloadsData)) {
            res.json({ success: true, message: 'Project updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save downloads data' });
        }

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/downloads/:id', verifyToken, (req, res) => {
    try {
        const projectId = req.params.id;

        const downloadsData = readJsonFile('config/downloads.json');
        if (!downloadsData) {
            return res.status(500).json({ error: 'Could not load downloads data' });
        }

        // Find and remove project
        let projectFound = false;
        downloadsData.categories.forEach(category => {
            const projectIndex = category.projects.findIndex(proj => proj.id === projectId);
            if (projectIndex !== -1) {
                category.projects.splice(projectIndex, 1);
                projectFound = true;
            }
        });

        if (!projectFound) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (writeJsonFile('config/downloads.json', downloadsData)) {
            res.json({ success: true, message: 'Project deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save downloads data' });
        }

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// File Upload Route
app.post('/api/upload', verifyToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            success: true,
            filename: req.file.filename,
            path: req.file.path,
            originalName: req.file.originalname
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Product structure discovery endpoint
app.get('/api/docs/products/:productId/structure', (req, res) => {
    try {
        const { productId } = req.params;
        const productPath = path.join(__dirname, 'src', 'docs', 'content', productId);

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

// User Management Routes
app.get('/api/users', verifyToken, (req, res) => {
    try {
        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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

        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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

        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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

        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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

        const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
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
        const configPath = path.join(__dirname, 'src', 'docs', 'config', 'docs-config.json');
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
        const configPath = path.join(__dirname, 'src', 'docs', 'config', 'docs-config.json');

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

// Analytics Routes
app.get('/api/analytics', verifyToken, (req, res) => {
    try {
        const analytics = readAnalytics();

        if (!analytics) {
            return res.status(500).json({ error: 'Could not load analytics data' });
        }

        // Calculate additional statistics for response
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const currentMonthData = analytics.months[currentMonth] || {
            totalVisits: 0,
            pages: {},
            markdownFiles: {}
        };

        // Get top 10 most visited markdown files across all months
        const allMarkdownFiles = {};
        Object.values(analytics.months).forEach(month => {
            Object.entries(month.markdownFiles).forEach(([file, count]) => {
                allMarkdownFiles[file] = (allMarkdownFiles[file] || 0) + count;
            });
        });

        const topMarkdownFiles = Object.entries(allMarkdownFiles)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([path, visits]) => ({ path, visits }));

        res.json({
            allTime: analytics.allTime,
            currentMonth: {
                key: currentMonth,
                ...currentMonthData
            },
            months: analytics.months,
            topMarkdownFiles
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track markdown file view (called from client-side)
app.post('/api/analytics/track', (req, res) => {
    try {
        const { path: filePath, type } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: 'Path is required' });
        }

        // Track the visit
        const isMarkdownFile = type === 'markdown' || filePath.includes('/docs/');
        trackVisit(filePath, isMarkdownFile);

        res.json({ success: true });
    } catch (error) {
        console.error('Track analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== File Management Routes ====================

// Get file tree for a product
app.get('/api/files/:product/tree', verifyToken, (req, res) => {
    try {
        const { product } = req.params;
        const productPath = path.join(__dirname, 'src', 'docs', 'content', product);

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

        const fullPath = path.join(__dirname, 'src', 'docs', 'content', product, filePath);

        // Security check: ensure path is within product directory
        const productPath = path.join(__dirname, 'src', 'docs', 'content', product);
        if (!fullPath.startsWith(productPath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const stats = fs.statSync(fullPath);

        res.json({
            content,
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

        const basePath = path.join(__dirname, 'src', 'docs', 'content', product);
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

        const fullPath = path.join(__dirname, 'src', 'docs', 'content', product, filePath);
        const productPath = path.join(__dirname, 'src', 'docs', 'content', product);

        // Security check
        if (!fullPath.startsWith(productPath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.writeFileSync(fullPath, content, 'utf8');

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

        const fullPath = path.join(__dirname, 'src', 'docs', 'content', product, filePath);
        const productPath = path.join(__dirname, 'src', 'docs', 'content', product);

        // Security check
        if (!fullPath.startsWith(productPath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File or folder not found' });
        }

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
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

        const basePath = path.join(__dirname, 'src', 'docs', 'content', product);
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

        const basePath = path.join(__dirname, 'src', 'docs', 'content', product);
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
        const uploadPath = path.join(__dirname, 'src', 'docs', 'content', product, 'images');

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

// Main section routes (without .html extension)
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'main', 'index.html'));
});

app.get('/downloads', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'main', 'downloads.html'));
});

// Download page - dynamic route for individual download pages (e.g., /download/quantom-core)
// The download.html handles loading project data based on the ID in the URL
app.get('/download/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'main', 'download.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'docs', 'settings.html'));
});

// Legal section - main entry point
app.get('/legal', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'legal', 'index.html'));
});

// Legal section - all nested routes (e.g., /legal/terms-of-service, /legal/privacy-policy)
// The legal/index.html handles client-side routing based on the URL path
app.get('/legal/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'legal', 'index.html'));
});

// Docs section - main entry point
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'docs', 'index.html'));
});

// Docs section - all nested routes (e.g., /docs/quantom/getting-started/installation)
// The docs/index.html handles client-side routing based on the URL path
app.get('/docs/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'docs', 'index.html'));
});

// 404 handler for all unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', 'main', '404.html'));
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
    const usersPath = path.join(__dirname, 'src', 'docs', 'config', 'users.json');
    if (!fs.existsSync(usersPath)) {
        console.log('⚠ users.json not found. Run: node hash_password.js');
    } else {
        console.log('✓ User database loaded');
    }
});