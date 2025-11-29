/**
 * Custom Error Classes for QuantomDocs
 * Provides specific error types for better error handling
 */

class ResourceNotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'ResourceNotFoundError';
        this.statusCode = 404;
    }
}

class ValidationError extends Error {
    constructor(message = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

class AuthenticationError extends Error {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

class AuthorizationError extends Error {
    constructor(message = 'Authorization failed') {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 403;
    }
}

class PathTraversalError extends Error {
    constructor(message = 'Path traversal attempt detected') {
        super(message);
        this.name = 'PathTraversalError';
        this.statusCode = 403;
    }
}

module.exports = {
    ResourceNotFoundError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    PathTraversalError
};
