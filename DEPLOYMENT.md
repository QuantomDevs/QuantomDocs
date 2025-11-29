# QuantomDocs Deployment Guide

This guide covers deploying QuantomDocs in production using Docker.

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Security Features](#security-features)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning the repository)
- A secure JWT secret key

### Production Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/QuantomDevs/QuantomDocs.git
   cd QuantomDocs
   ```

2. **Set environment variables:**
   ```bash
   # Generate a secure JWT secret
   export JWT_SECRET=$(openssl rand -base64 32)

   # Or create a .env file
   cp .env.example .env
   # Edit .env and set JWT_SECRET
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Open http://localhost:5005 in your browser
   - The application is now running in production mode

---

## Architecture Overview

### Multi-Stage Docker Build

The Dockerfile uses a multi-stage build process for optimal security and size:

```
┌─────────────────────────────────────────┐
│          BUILD STAGE                    │
│  - Installs ALL dependencies            │
│  - Copies source code                   │
│  - Runs npm run build                   │
│  - Generates dist/ directory            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       PRODUCTION STAGE                  │
│  - Installs production dependencies     │
│  - Copies ONLY dist/ directory          │
│  - Does NOT include src/ directory      │
│  - Minimal attack surface               │
└─────────────────────────────────────────┘
```

### Build Process

The `build.js` script:
- Minifies all JavaScript files (reduces size by ~40-50%)
- Minifies all CSS files (reduces size by ~30-40%)
- Copies static assets (HTML, images, fonts)
- Outputs to `dist/` directory

**Key Security Feature:** The production Docker image contains **ONLY** the `dist/` directory, not the source code. This prevents source code exposure in production.

---

## Security Features

### 1. Source Code Protection
- **Problem:** Original Dockerfile copied entire `src/` directory to production
- **Solution:** Multi-stage build copies only `dist/` directory
- **Impact:** Source code is never exposed in production containers

### 2. Secure Volume Mounts
- **Problem:** Original docker-compose.yml mounted source directories
- **Solution:** Production compose file mounts only `content/` and `data/` directories
- **Impact:** No source code accessible via volume mounts

### 3. Environment Variables
- **Required:** `JWT_SECRET` must be set for authentication
- **Best Practice:** Use strong, randomly generated secrets (32+ characters)
- **Security:** Never commit `.env` file to version control

### 4. Minimal Dependencies
- **Production Image:** Uses `--omit=dev` to exclude development dependencies
- **Impact:** Smaller image size, fewer potential vulnerabilities

---

## Production Deployment

### Using Docker Compose (Recommended)

**File:** `docker-compose.yml`

```yaml
services:
  quantomdocs:
    container_name: quantomdocs
    image: ghcr.io/quantomdevs/quantomdocs:latest
    ports:
      - 5005:5005
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - PORT=5005
      - HOST=0.0.0.0
    volumes:
      # ONLY essential mounts
      - ./content:/app/content
      - ./data:/app/data
    restart: unless-stopped
```

**To deploy:**
```bash
# Set JWT_SECRET
export JWT_SECRET=your-secure-secret-here

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Using Docker Run

```bash
docker run -d \
  --name quantomdocs \
  -p 5005:5005 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secure-secret-here \
  -v $(pwd)/content:/app/content \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  ghcr.io/quantomdevs/quantomdocs:latest
```

### Platform-Specific Deployment

#### Railway
1. Connect your GitHub repository
2. Set environment variable: `JWT_SECRET`
3. Railway will automatically build and deploy using the Dockerfile

#### Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your-secure-secret-here
git push heroku main
```

#### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Set environment variable: `JWT_SECRET`
3. DigitalOcean will build using the Dockerfile

---

## Development Setup

For local development with source code hot-reloading:

**File:** `docker-compose.dev.yml`

```bash
# Run with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This setup:
- Mounts source code for live editing
- Mounts config files for testing
- Uses `NODE_ENV=development`
- Can optionally use nodemon for auto-restart

**⚠️ WARNING:** Never use `docker-compose.dev.yml` in production! It exposes source code.

---

## Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT authentication | `your-secure-random-key` | **Yes** |
| `NODE_ENV` | Node environment | `production` | **Yes** |
| `PORT` | Server port | `5005` | Yes |
| `HOST` | Server host | `0.0.0.0` | Yes |

### Optional Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | `info` | No |
| `SESSION_TIMEOUT` | Session timeout in seconds | `3600` | No |
| `MAX_UPLOAD_SIZE` | Maximum file upload size in MB | `10` | No |

### Setting Environment Variables

**Option 1: .env file**
```bash
cp .env.example .env
# Edit .env and set your values
```

**Option 2: Export in shell**
```bash
export JWT_SECRET=your-secure-secret-here
export NODE_ENV=production
```

**Option 3: Docker Compose environment section**
```yaml
environment:
  - JWT_SECRET=your-secure-secret-here
  - NODE_ENV=production
```

### Generating Secure Secrets

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

**Online:**
Use a password generator to create 32+ character random string

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

The workflow automatically:
1. Triggers on push to `main` branch
2. Checks package.json version
3. Builds Docker image using multi-stage Dockerfile
4. Pushes to GitHub Container Registry (GHCR)
5. Tags with version and `latest`
6. Creates GitHub Release (if version changed)
7. Uploads docker-compose.yml to release

**Build Process:**
- The Dockerfile handles all build steps internally
- No separate `npm run build` step needed in CI/CD
- Build stage runs `npm install` and `npm run build`
- Production stage contains only the built `dist/` directory

**Image Tags:**
- `ghcr.io/quantomdevs/quantomdocs:latest` - Latest version
- `ghcr.io/quantomdevs/quantomdocs:v1.0.0` - Specific version

### Manual Build

To build the Docker image locally:

```bash
# Build the image
docker build -t quantomdocs:local .

# Run the image
docker run -d \
  -p 5005:5005 \
  -e JWT_SECRET=your-secret \
  quantomdocs:local
```

---

## Troubleshooting

### Build Fails During `npm run build`

**Problem:** Build script encounters errors

**Solution:**
1. Check that all source files are valid JavaScript
2. Review build.js output for specific file errors
3. Ensure all dependencies are installed

```bash
# Test build locally
npm install
npm run build
```

### Container Starts But Can't Access Application

**Problem:** Port mapping or network issues

**Solution:**
1. Check if port 5005 is available:
   ```bash
   lsof -i :5005
   ```
2. Verify container is running:
   ```bash
   docker ps
   ```
3. Check container logs:
   ```bash
   docker logs quantomdocs
   ```

### Authentication Fails

**Problem:** JWT_SECRET not set or incorrect

**Solution:**
1. Verify JWT_SECRET is set:
   ```bash
   docker exec quantomdocs env | grep JWT_SECRET
   ```
2. Restart container after setting JWT_SECRET:
   ```bash
   docker-compose restart
   ```

### Source Code Visible in Production

**Problem:** Old Docker image still has src/ directory

**Solution:**
1. Rebuild image with new Dockerfile:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```
2. Or pull latest image:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Volume Mount Issues

**Problem:** Content or data not persisting

**Solution:**
1. Check volume mounts:
   ```bash
   docker inspect quantomdocs | grep -A 10 Mounts
   ```
2. Ensure directories exist:
   ```bash
   mkdir -p content data
   ```
3. Check permissions:
   ```bash
   ls -la content data
   ```

---

## Best Practices

### Production Checklist

- [ ] Set strong, unique `JWT_SECRET`
- [ ] Use `NODE_ENV=production`
- [ ] Never commit `.env` file to Git
- [ ] Use `docker-compose.yml` (not `docker-compose.dev.yml`)
- [ ] Enable HTTPS (use reverse proxy like nginx or Caddy)
- [ ] Set up regular backups of `content/` and `data/` directories
- [ ] Monitor logs for errors and security issues
- [ ] Keep Docker image updated (pull latest regularly)

### Security Checklist

- [ ] Source code not exposed in container
- [ ] No source code volume mounts in production
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables not hardcoded
- [ ] Container runs with least privileges
- [ ] Regular security updates applied

### Performance Checklist

- [ ] Multi-stage build reduces image size
- [ ] Only production dependencies installed
- [ ] JavaScript and CSS minified
- [ ] Static assets cached properly
- [ ] Database/cache configured if needed

---

## Additional Resources

- **GitHub Repository:** https://github.com/QuantomDevs/QuantomDocs
- **Docker Hub:** https://github.com/QuantomDevs/QuantomDocs/pkgs/container/quantomdocs
- **Documentation:** See `/docs` directory in repository

---

## Support

For issues or questions:
1. Check this deployment guide
2. Review the [Troubleshooting](#troubleshooting) section
3. Check GitHub Issues
4. Contact the development team

---

**Last Updated:** 2025-11-29
**Version:** 1.0.0
