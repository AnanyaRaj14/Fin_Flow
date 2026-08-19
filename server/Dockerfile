# ─────────────────────────────────────────────
# FinFlow — Express API Server
# ─────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma Client for the current platform
RUN npx prisma generate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 expressjs && \
    chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 5000

# Entrypoint runs migrations then starts the server
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
