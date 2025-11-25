# Build Stage
FROM node:lts-slim AS build
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

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

# Copy application files from build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/content ./content
COPY --from=build /usr/src/app/data ./data

# Install production dependencies only
RUN npm install --omit=dev

# Start the application (NEW PATH)
CMD ["node", "src/backend/server.js"]
