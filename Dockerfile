# ===========================================
# Bot Discord - Node.js TypeScript
# ===========================================

# Build stage: compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

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

COPY package*.json ./

# Install production deps
RUN npm ci --omit=dev \
    && rm -rf /root/.npm /tmp/*

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
