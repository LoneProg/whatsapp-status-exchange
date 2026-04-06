# 📱 WhatsApp Status Views Exchange System

A full-stack web application that collects contact submissions from the public
and enables an admin to export them as a `.vcf` file for WhatsApp group import.

---

## 🏗 Architecture

```
whatsapp-status-exchange/
├── backend/                   # Express.js + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema (User, Contact)
│   │   └── seed.ts            # Seeds the admin user
│   ├── src/
│   │   ├── controllers/       # HTTP handlers (thin layer)
│   │   │   ├── auth.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── contact.service.ts
│   │   │   └── vcf.service.ts
│   │   ├── routes/            # Route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── contact.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT guard
│   │   │   └── errorHandler.ts      # Global error handler
│   │   ├── utils/
│   │   │   ├── prisma.ts            # PrismaClient singleton
│   │   │   ├── jwt.utils.ts         # Sign/verify JWT
│   │   │   └── phone.utils.ts       # E.164 normalisation
│   │   └── index.ts                 # App entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Vue 3 + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── api/index.ts       # Axios client + all API calls
│   │   ├── assets/main.css    # Tailwind base + custom utilities
│   │   ├── components/
│   │   │   ├── BaseInput.vue
│   │   │   ├── ToastNotif.vue
│   │   │   └── SpinnerIcon.vue
│   │   ├── pages/
│   │   │   ├── HomePage.vue         # Public submission form
│   │   │   ├── AdminLogin.vue       # Admin login
│   │   │   └── AdminDashboard.vue   # Admin panel
│   │   ├── router/index.ts    # Vue Router + navigation guards
│   │   ├── stores/auth.store.ts     # Pinia auth + admin data
│   │   ├── types/index.ts     # Shared TypeScript interfaces
│   │   ├── App.vue
│   │   └── main.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start — Local Development

### Prerequisites
- Node.js ≥ 20
- PostgreSQL 14+ running locally
- npm

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASS@localhost:5432/wa_exchange"
JWT_SECRET="generate-with-openssl-rand-hex-64"
JWT_EXPIRES_IN="8h"
PORT=4000
ALLOWED_ORIGIN="http://localhost:5173"
```

### 3. Set up the database

```bash
cd backend

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed admin user (creates admin@waexchange.local / Admin@12345!)
npm run db:seed
```

### 4. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 🐳 Docker Deployment

```bash
# Start all services (PostgreSQL + backend + frontend)
docker-compose up -d

# Run migrations + seed inside the container
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed

# View logs
docker-compose logs -f backend
```

**Default ports:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

---

## 🔌 API Reference

### Public Endpoints

#### `POST /api/contacts` — Submit a contact
```json
// Request body
{
  "name": "Emeka Okafor",
  "phone": "+2348012345678"
}

// Success 201
{
  "success": true,
  "message": "Contact submitted successfully!",
  "data": { "id": "...", "name": "Emeka Okafor", "phone": "+2348012345678" }
}

// Duplicate 409
{ "success": false, "message": "This phone number is already registered." }
```

#### `POST /api/auth/login` — Admin login
```json
// Request body
{ "email": "admin@waexchange.local", "password": "Admin@12345!" }

// Success 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": { "id": "...", "email": "admin@waexchange.local" }
  }
}
```

### Admin Endpoints (Bearer JWT required)

#### `GET /api/admin/stats`
```json
{ "success": true, "data": { "totalContacts": 142 } }
```

#### `GET /api/admin/contacts`
```json
{
  "success": true,
  "data": {
    "total": 2,
    "contacts": [
      { "id": "...", "name": "Emeka Okafor", "phone": "+2348012345678", "createdAt": "..." }
    ]
  }
}
```

#### `GET /api/admin/export` — Downloads `wa-exchange-contacts-YYYY-MM-DD.vcf`
```
Content-Type: text/vcard; charset=utf-8
Content-Disposition: attachment; filename="wa-exchange-contacts-2024-01-15.vcf"

BEGIN:VCARD
VERSION:3.0
FN:Emeka Okafor
TEL;TYPE=CELL:+2348012345678
END:VCARD
```

#### `DELETE /api/admin/contacts/:id`
```json
{ "success": true, "message": "Contact deleted successfully." }
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs, cost factor 12 |
| Authentication | JWT (HS256), 8h expiry |
| Route protection | `requireAdmin` middleware on all `/api/admin/*` |
| Input validation | Zod schemas on all endpoints |
| Phone normalisation | libphonenumber-js → E.164 format |
| Duplicate prevention | `UNIQUE` constraint on `contacts.phone` |
| Rate limiting | 5 submissions per IP per 15 min on `POST /api/contacts` |
| Security headers | Helmet.js |
| CORS | Configured to allowed origin only |

---

## 📇 VCF File Format

Each exported vCard follows RFC 2426 vCard 3.0:

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL;TYPE=CELL:+2348012345678
END:VCARD
```

The file is:
- UTF-8 encoded
- Uses CRLF line endings (RFC compliant)
- Compatible with WhatsApp's contact import feature
- Named `wa-exchange-contacts-YYYY-MM-DD.vcf`

---

## 🚀 Production Checklist

- [ ] Change `JWT_SECRET` to a 64-char random hex string (`openssl rand -hex 64`)
- [ ] Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars before seeding
- [ ] Set `NODE_ENV=production`
- [ ] Set correct `ALLOWED_ORIGIN` (your production domain)
- [ ] Use SSL/TLS (reverse proxy: Nginx/Caddy/Cloudflare)
- [ ] Set up database backups
- [ ] Configure proper PostgreSQL credentials (not defaults)
- [ ] Review and tune rate limits for your expected traffic

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite, TypeScript, TailwindCSS, Pinia, Vue Router |
| Backend | Express.js, TypeScript, Zod |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Phone validation | libphonenumber-js |
| Container | Docker, Docker Compose, Nginx |
