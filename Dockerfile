# Build stage for client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
# Force install all deps including devDependencies (ignore NODE_ENV)
RUN npm ci --include=dev
COPY client/ ./
RUN npm run build

# Build stage for server (needs python/make/g++ for node-pty)
FROM node:20-alpine AS server-builder
RUN apk add --no-cache python3 make g++
WORKDIR /app/server
COPY server/package*.json ./
# Force install all deps including devDependencies (ignore NODE_ENV)
RUN npm ci --include=dev
COPY server/ ./
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dependencies for node-pty runtime
RUN apk add --no-cache python3 make g++ bash

WORKDIR /app

# Copy server files
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Rebuild node-pty for the target platform
RUN npm rebuild node-pty

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
