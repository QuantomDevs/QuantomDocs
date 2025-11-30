# Build Stage
FROM node:lts-slim AS build
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build tools)
RUN npm install

# Copy source code
COPY . .

# Run build script (generates dist/ directory)
RUN npm run build

# Production Stage
FROM node:lts-slim AS production
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Expose application port
EXPOSE 5005

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY --from=build /usr/src/app/package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy ONLY the built dist directory (NOT src!)
# This prevents source code exposure in production
COPY --from=build /usr/src/app/dist ./dist

# Copy content directory
COPY --from=build /usr/src/app/content ./content

# Create data directory (instead of copying)
RUN mkdir -p ./data

# Copy public directory
COPY --from=build /usr/src/app/public ./public

# Set entry point to built server
CMD ["node", "dist/backend/server.js"]
