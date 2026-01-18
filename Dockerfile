# ===========================================
# Bot Discord - Node.js TypeScript
# ===========================================

# Build stage: compile TypeScript + native modules
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies for compiling better-sqlite3 (native module using node-gyp)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# ===========================================
# Production stage: lightweight runtime image
# ===========================================
FROM node:20-alpine

WORKDIR /app

# Dependencies for compiling better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Install production deps, then clean up build tools
RUN npm ci --omit=dev \
    && apk del python3 make g++ \
    && rm -rf /root/.npm /tmp/*

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/reminders.db

CMD ["node", "dist/index.js"]
