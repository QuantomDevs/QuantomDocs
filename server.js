const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const HOST = '0.0.0.0'; // Bind to all network interfaces
const PORT = 5005;
const JWT_SECRET = 'quantom_secret_key_2025'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from new structure
app.use('/shared', express.static(path.join(__dirname, 'src/shared')));
app.use('/main', express.static(path.join(__dirname, 'src/main')));
app.use('/docs', express.static(path.join(__dirname, 'src/docs')));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: 'Too many login attempts, please try again later' }
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

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
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

        // Load users
        const usersData = readJsonFile('config/users.json');
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

        // Create JWT token
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
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

app.post('/api/logout', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
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
        const formatName = (name) => {
            return name.replace(/-/g, ' ');
        };

        // Read all category folders
        const categories = fs.readdirSync(productPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
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
                    files: files
                };
            });

        res.json({ categories });
    } catch (error) {
        console.error('Error reading product structure:', error);
        res.status(500).json({ error: 'Failed to read product structure' });
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

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'main', 'login.html'));
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
    const usersPath = path.join(__dirname, 'src', 'main', 'config', 'users.json');
    if (!fs.existsSync(usersPath)) {
        console.log('⚠ users.json not found. Run: node hash_password.js');
    } else {
        console.log('✓ User database loaded');
    }
});