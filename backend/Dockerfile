# ── Build stage ─────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

WORKDIR /app

# Install image dependencies
RUN apt update -y
RUN apt install -y nodejs npm
RUN apt install -y openssl

# Install npm dependencies
COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build app
RUN npm run build


# ── Production stage ─────────────────────────────────────────
FROM ubuntu:22.04 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build + Prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Koyeb uses dynamic port
ENV PORT=4000
EXPOSE 4000

# Run migrations + start server
CMD ["sh", "-c", "npm run prisma:migrate", "npm run prisma:seed", "node dist/index.js"]