# Military Asset Management System (MAMS)

A full-stack role-based web application for tracking, assigning, transferring, and expending military assets across multiple bases.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, TanStack Query, Recharts, Axios |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Project Structure

```
militry-asset/
├── src/                    # React frontend (CRA)
│   ├── api/                # Axios instance + endpoint helpers
│   ├── components/         # Layout + UI components
│   ├── context/            # AuthContext (JWT state)
│   └── pages/              # Dashboard, Purchases, Transfers, Assignments, Expenditures, AuditLogs, Users
├── backend/                # Express + TypeScript API
│   ├── prisma/             # schema.prisma
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── middleware/     # auth.ts, rbac.ts, auditLogger.ts
│       ├── routes/         # Express routers
│       ├── services/       # (extend as needed)
│       └── lib/            # Prisma client, Winston logger
└── public/                 # CRA public assets
```

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (running locally or via Docker)
- npm

---

## Quick Start

### 1. Database

Create a PostgreSQL database:
```bash
psql -U postgres -c "CREATE DATABASE mams_db;"
```

### 2. Backend

```bash
cd backend

# Copy and edit environment variables
cp .env.example .env
# Edit DATABASE_URL in .env to match your Postgres credentials

# Install dependencies (already done if node_modules exists)
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npm run prisma:seed

# Start the API server (http://localhost:5000)
npm run dev
```

### 3. Frontend

From the project root:
```bash
# Install dependencies (already done)
npm install

# Start React app (http://localhost:3000)
npm start
```

---

## Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin@mams.mil` | `Admin@12345` |
| Base Commander (Alpha) | `commander.alpha@mams.mil` | `Commander@123` |
| Base Commander (Bravo) | `commander.bravo@mams.mil` | `Commander@123` |
| Logistics Officer | `logistics.officer@mams.mil` | `Logistics@123` |

---

## API Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/auth/login` | All | Authenticate, return JWT |
| GET | `/api/auth/me` | All | Get current user |
| GET | `/api/dashboard/metrics` | All (scoped) | Opening/Closing balance, Net Movement |
| GET | `/api/dashboard/net-movement/:baseId` | All (scoped) | Equipment breakdown per base |
| GET/POST | `/api/purchases` | All / Admin+Logistics | List or create purchases |
| GET/POST | `/api/transfers` | All / Admin+Logistics | List or initiate transfers |
| PATCH | `/api/transfers/:id/complete` | Admin+Logistics | Mark transfer completed |
| PATCH | `/api/transfers/:id/cancel` | Admin+Logistics | Cancel transfer |
| GET/POST | `/api/assignments` | Admin+Commander | List or create assignments |
| PATCH | `/api/assignments/:id/status` | Admin+Commander | Update assignment status |
| GET/POST | `/api/expenditures` | Admin+Commander | List or record expenditures |
| GET | `/api/audit-logs` | Admin only | System-wide audit trail |
| GET/POST/PUT/DELETE | `/api/users` | Admin only | User management |
| GET/POST/PUT/DELETE | `/api/bases` | Admin / All read | Base management |
| GET/POST/PUT | `/api/equipment-types` | Admin / All read | Equipment type management |

---

## RBAC Summary

| Role | Purchases | Transfers | Assignments | Expenditures | Audit Logs | Users |
|------|-----------|-----------|-------------|--------------|------------|-------|
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Read | ✅ Full |
| Base Commander | 👁 View own | 👁 View own | ✅ Own base | ✅ Own base | ❌ | ❌ |
| Logistics Officer | ✅ Create/View | ✅ Create/View | ❌ | ❌ | ❌ | ❌ |

---

## Net Movement Formula

```
Net Movement = Purchases + Transfers In − Transfers Out
Closing Balance = Opening Balance + Net Movement − Expenditures
```
