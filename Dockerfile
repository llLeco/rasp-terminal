# Build stage for client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --include=dev
COPY client/ ./
RUN npm run build

# Build stage for server (needs python/make/g++ for node-pty)
# This stage builds EVERYTHING including native modules
FROM node:20-alpine AS server-builder
RUN apk add --no-cache python3 make g++
WORKDIR /app/server
COPY server/package*.json ./
# Install ALL dependencies and build native modules here
RUN npm ci --include=dev
COPY server/ ./
RUN npm run build
# Now install production deps with native modules already compiled
RUN rm -rf node_modules && npm ci --omit=dev

# Production stage - minimal, no gcc needed
FROM node:20-alpine AS production

# Only need bash for terminal, node-pty is pre-compiled
RUN apk add --no-cache bash

WORKDIR /app

# Copy pre-built server with compiled node-pty
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/package*.json ./

# Copy client build
COPY --from=client-builder /app/client/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
