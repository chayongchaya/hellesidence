# Helle Residence — Dormitory Management System

A full-stack web application for managing a hostel/dormitory: rooms, tenants, billing, contracts, maintenance, expenses, inspections, and reports.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite + React Router      |
| Backend  | Node.js + Express (ES Modules)      |
| Database | PostgreSQL 16                       |
| Deploy   | Docker Compose (3 containers)       |

---

## Quick Start (Docker — recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1 — Unzip and enter the project folder

```
HelleResidence/
├── client/          ← React frontend
├── server/          ← Express API
├── database/
│   ├── init/
│   │   ├── 01_schema.sql    ← tables + analysis functions
│   │   └── 02_seed_csv.sql  ← all CSV data pre-loaded
│   └── csv_data/            ← original CSV files (for reference)
├── docker-compose.yml
└── README.md
```

### 2 — Start everything

```bash
cd HelleResidence
docker compose up --build
```

Docker will automatically:
1. Start PostgreSQL and run `01_schema.sql` (tables + built-in seed) then `02_seed_csv.sql` (CSV data)
2. Build and start the Express API server on port 4000
3. Build and start the React frontend via nginx on port 5173

### 3 — Open the app

| Service  | URL                                                        |
|----------|------------------------------------------------------------|
| Frontend | http://localhost:5173                                       |
| API      | http://localhost:4000                                       |
| Database | localhost:15433 (user: root / password: root / db: hellesidence_db) |

### Stop
```bash
docker compose down          # stop containers (keeps data)
docker compose down -v       # stop + wipe database (fresh start)
```

---

## Local Development (without Docker)

### Requirements
- Node.js 18+
- PostgreSQL 16 running locally

### 1. Database Setup

```bash
createdb hellesidence_db
psql -d hellesidence_db -f database/init/01_schema.sql
psql -d hellesidence_db -f database/init/02_seed_csv.sql
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env        # edit DATABASE_URL if needed
npm run dev                 # http://localhost:4000
```

### 3. Client

```bash
cd client
npm install
cp .env.example .env        # VITE_API_BASE=http://localhost:4000
npm run dev                 # http://localhost:5173
```

---

## Data Overview

- **16 rooms** across 4 floors (Standard, Deluxe, Suite)
- **15 tenants** with active lease contracts
- **5 staff** members
- Monthly billing, payments, maintenance tickets, inspections, expenses all pre-seeded

## Report Functions

Callable via `/api/v1/reports`:

- `report_rental_income` — revenue by room type and date range
- `report_occupancy_rate` — current occupancy snapshot
- `report_maintenance_cost` — maintenance spend by issue type
- `report_charges_by_type` — billing breakdown by product type
- `report_payments_by_method` — payment analysis by method
- `report_expenses_by_category` — expense breakdown by category / supplier

---

## Troubleshooting

**Port conflict**: Edit `docker-compose.yml` and change host ports (left side of `:`).

**Database not seeding**: Run `docker compose down -v` to wipe the volume, then `docker compose up --build` again.

**API connection error from client**: Ensure `CORS_ORIGIN` in the server env matches your client URL.
