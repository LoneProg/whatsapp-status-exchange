# ── Build stage ─────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install image dependencies
RUN apt-get update -y && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
COPY package*.json ./
RUN npm ci

COPY . .

#Add dummmy env file to avoid prisma client generation failure
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npm run prisma:generate

# Build app
RUN npm run build


# ── Production stage ─────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

# Install image dependencies
RUN apt-get update -y && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build + Prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Koyeb uses dynamic port
ENV PORT=4000
EXPOSE 4000

# Run migrations + start server
CMD ["sh", "-c", "npm run prisma:migrate && node dist/index.js"]