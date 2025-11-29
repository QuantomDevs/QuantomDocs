/**
 * QuantomDocs Server
 * HTTP server entry point
 */

const app = require('./app');
const config = require('./config');
const searchService = require('./services/searchService');

const HOST = config.server.host;
const PORT = config.server.port;

// Initialize search index on startup
async function initializeSearchIndex() {
    try {
        console.log('[Server] Building search index...');
        const count = await searchService.buildIndex();
        if (count === 0) {
            console.log('[Server] ℹ Search index ready (no documents found - add .md files to /content)');
        } else {
            console.log(`[Server] ✓ Search index ready: ${count} document(s) indexed`);
        }
    } catch (error) {
        console.error('[Server] ✗ Failed to build search index:', error.message);
        console.error('[Server] Server will start but search functionality may be limited');
    }
}

// Start server
async function start() {
    try {
        // Initialize search index (non-blocking)
        initializeSearchIndex();

        // Start HTTP server
        const server = app.listen(PORT, HOST, () => {
            console.log('==========================================');
            console.log('   QuantomDocs Server');
            console.log('==========================================');
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Network access: http://${HOST}:${PORT}`);
            console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('==========================================');

            // Check if users.json exists
            const path = require('path');
            const fs = require('fs');
            const usersPath = path.join(__dirname, '..', 'apps', 'docs', 'config', 'users.json');

            if (!fs.existsSync(usersPath)) {
                console.log('⚠ Warning: users.json not found. Please create users manually.');
            } else {
                console.log('✓ User database loaded');
            }

            console.log('==========================================');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('[Server] SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('[Server] Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('[Server] SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('[Server] Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
}

// Start the server
start();
