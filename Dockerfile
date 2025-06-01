# Dockerfile para Smartway Project Management
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application (standalone se activa automáticamente en Linux)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# En Linux: usar standalone si está disponible, sino usar build completo
# Verificar si existe standalone build
RUN if [ -d "/app/.next/standalone" ]; then \
    echo "Using standalone build"; \
    else \
    echo "Using full build"; \
    fi

# Copy standalone build si existe (Linux), sino copy build completo
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone* ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Si no hay standalone, copiar node_modules y .next completo
RUN if [ ! -f "./server.js" ]; then \
    echo "Copying full build for non-Linux platform"; \
    fi

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create data directory for database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Ejecutar standalone si existe, sino usar npm start
CMD if [ -f "./server.js" ]; then \
      echo "Starting with standalone server"; \
      node server.js; \
    else \
      echo "Starting with npm"; \
      npm start; \
    fi 