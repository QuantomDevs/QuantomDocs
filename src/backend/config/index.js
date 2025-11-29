/**
 * Central Configuration for QuantomDocs Backend
 */

const path = require('path');

module.exports = {
    // Server configuration
    server: {
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || 5005
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'quantom_secret_key_2025',
        expiresIn: '24h'
    },

    // Directory paths
    paths: {
        content: path.join(__dirname, '..', '..', '..', 'content'),
        uploads: path.join(__dirname, '..', '..', 'apps', 'main', 'downloads'),
        data: path.join(__dirname, '..', '..', '..', 'data'),
        images: path.join(__dirname, '..', '..', 'apps', 'docs', 'images'),
        config: path.join(__dirname, '..', '..', 'apps', 'docs', 'config')
    },

    // File upload limits
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'],
        allowedDocTypes: ['.md', '.mdx', '.json']
    },

    // Rate limiting
    rateLimit: {
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5
        },
        upload: {
            windowMs: 60 * 1000, // 1 minute
            max: 5
        }
    },

    // Cache configuration
    cache: {
        stdTTL: 600, // 10 minutes
        checkperiod: 120 // 2 minutes
    },

    // Security
    security: {
        bcryptRounds: 10
    }
};
