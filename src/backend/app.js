/**
 * Express Application Configuration
 * Initializes and configures the Express app with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const customErrors = require('./utils/customErrors');

// Initialize Express app
const app = express();

// ==================== Global Middleware ====================

// CORS
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Static File Serving ====================

// Serve static files from component and apps directories
app.use('/components', express.static(path.join(__dirname, '..', 'components')));
app.use('/shared', express.static(path.join(__dirname, '..', 'components'))); // Backward compatibility
app.use('/main', express.static(path.join(__dirname, '..', 'apps', 'main')));
app.use('/docs', express.static(path.join(__dirname, '..', 'apps', 'docs')));
app.use('/editor', express.static(path.join(__dirname, '..', 'apps', 'editor')));
app.use('/downloads', express.static(path.join(__dirname, '..', 'apps', 'downloads')));

// Serve public directory (images, etc.)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// ==================== API Routes ====================

// Import routes
const authRoutes = require('./routes/auth');
const docsRoutes = require('./routes/docs');
const searchRoutes = require('./routes/search');
const filesRoutes = require('./routes/files');

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', filesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Config management endpoints (kept from original server.js)
const configManager = require('./utils/configManager');
const { verifyToken } = require('./middleware/auth');

app.get('/api/config/docs', verifyToken, (req, res, next) => {
    try {
        const configData = configManager.readConfig('docs');
        res.json(configData);
    } catch (error) {
        next(error);
    }
});

app.put('/api/config/docs', verifyToken, (req, res, next) => {
    try {
        const configData = req.body;
        if (configManager.writeConfig('docs', configData)) {
            res.json({ success: true, message: 'Config updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save config data' });
        }
    } catch (error) {
        next(error);
    }
});

// ==================== HTML Routes ====================

// Root redirect to main page
app.get('/', (req, res) => {
    res.redirect('/main');
});

// Special settings route
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'apps', 'docs', 'settings.html'));
});

// Editor route
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'apps', 'editor', 'index.html'));
});

// Redirect /download to /downloads for backward compatibility
app.get('/download', (req, res) => {
    res.redirect('/downloads');
});

// Dynamic routing for all apps in src/apps directory
const fs = require('fs');
const appsPath = path.join(__dirname, '..', 'apps');
const appFolders = fs.readdirSync(appsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Create routes for each app folder
appFolders.forEach(appName => {
    const indexPath = path.join(appsPath, appName, 'index.html');

    if (fs.existsSync(indexPath)) {
        // Main route for the app
        app.get(`/${appName}`, (req, res) => {
            res.sendFile(indexPath);
        });

        // Catch-all route for nested paths
        app.get(`/${appName}/*`, (req, res) => {
            res.sendFile(indexPath);
        });
    }
});

// ==================== Error Handling ====================

// 404 handler for unmatched routes
app.use((req, res, next) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Serve 404 page for other requests
    res.status(404).sendFile(path.join(__dirname, '..', 'apps', 'main', '404.html'));
});

// Global error handling middleware
app.use((error, req, res, next) => {
    // Log error
    console.error('Error:', error);

    // Handle custom errors
    if (error instanceof customErrors.ResourceNotFoundError) {
        return res.status(404).json({ error: error.message });
    }

    if (error instanceof customErrors.ValidationError) {
        return res.status(400).json({ error: error.message });
    }

    if (error instanceof customErrors.AuthenticationError) {
        return res.status(401).json({ error: error.message });
    }

    if (error instanceof customErrors.AuthorizationError) {
        return res.status(403).json({ error: error.message });
    }

    if (error instanceof customErrors.PathTraversalError) {
        return res.status(403).json({ error: error.message });
    }

    // Handle Multer errors
    const multer = require('multer');
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 5MB)' });
        }
        return res.status(400).json({ error: error.message });
    }

    // Default server error
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message
    });
});

module.exports = app;
