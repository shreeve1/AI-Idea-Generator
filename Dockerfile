# Multi-stage Dockerfile for AI Idea Generator Application

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Copy frontend source code
COPY client/ .

# Clear npm cache and reinstall dependencies to fix Rollup native issues
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install && \
    npm run build

# Stage 2: Setup the Node.js backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY src/ ./src/

# Stage 3: Final production image
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend files from builder stage
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=backend-builder --chown=nodejs:nodejs /app/src ./src

# Copy built frontend from builder stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/client/dist ./client/dist

# Create directory for static files
RUN mkdir -p ./public && chown nodejs:nodejs ./public

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3025

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3025/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"] 