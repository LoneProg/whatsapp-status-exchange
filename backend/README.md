# WhatsApp Status Exchange — Backend

Express.js + TypeScript + PostgreSQL + Prisma

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, etc.
```

### 3. Set up database
```bash
# Create the database in PostgreSQL first:
#   createdb wa_exchange
# Then run migrations:
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed the admin user
npm run db:seed
```

### 4. Start development server
```bash
npm run dev
```

Server starts at: `http://localhost:4000`

---

## API Reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contacts` | Submit a new contact |
| POST | `/api/auth/login` | Admin login |

### Admin (Bearer JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/contacts` | List all contacts |
| GET | `/api/admin/export` | Download .vcf file |
| DELETE | `/api/admin/contacts/:id` | Delete a contact |

---

## Default Admin Credentials (dev seed)
- Email: `admin@waexchange.local`
- Password: `Admin@12345!`

> ⚠️ Change these immediately in production via `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars before seeding.
