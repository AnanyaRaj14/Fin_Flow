# ─────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────
# Stage 2 — Build Next.js application
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build-time API URL (can be overridden at build)
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — Production runtime (tiny image)
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only what standalone output needs
COPY --from=builder /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3000

# standalone output generates server.js at project root
CMD ["node", "server.js"]
