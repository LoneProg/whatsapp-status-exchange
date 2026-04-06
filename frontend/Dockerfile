# ── Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set production API base URL (Nginx will proxy /api → backend:4000)
ENV VITE_API_BASE_URL=/api

RUN npm run build

# ── Production stage (Nginx) ─────────────────────────────────
FROM nginx:stable-alpine AS runner

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config for SPA routing + API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
