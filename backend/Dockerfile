# ── Build stage ─────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

WORKDIR /app

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y nodejs npm
RUN apt-get install -y openssl
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
# RUN npm run prisma:migrate
# RUN npm run prisma:seed

# Koyeb uses dynamic port
ENV PORT=4000
EXPOSE 4000

# Run migrations + start server
CMD ["sh", "-c", "node dist/index.js", "npm run prisma:migrate", "npm run prisma:seed"]