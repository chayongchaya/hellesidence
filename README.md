# Hellesidence — Dormitory Management System

**Course:** CPE241 — Database Systems
**Repository:** https://github.com/chayongchaya/hellesidence

A full-stack web application for managing a hostel/dormitory. The system covers rooms, tenants, rental contracts, monthly billing, payment receipts, maintenance tickets, room inspections, expenses, staff, suppliers, and management reports — all backed by a relational PostgreSQL database.

---

## Team Members

| Name                               |   Student ID   |
|------------------------------------|----------------|
| Kulchaya Paipinij                  | 67070503406    |
| Chayanit Kuntanarumitkul           | 67070503408    |
| Thanaphon Rachatakulpong           | 67070503417    |
| Tana Udompornkul                   | 67070503418    |
| Pattarawadee Thanapoomthakul       | 67070503435    |
| Siripitch Chaiyabutra              | 67070503440    |


---

## Technology Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | React 18 + Vite + React Router v6 + React Hook Form + Zod |
| Backend  | Node.js 18 + Express 4 (ES Modules) + Winston logging |
| Database | PostgreSQL 16                                     |
| Deployment | Docker Compose — 3 containers (db, server, client) |

---

## Project Structure

```
HelleResidence/
├── client/                   ← React frontend (served via nginx)
│   ├── src/
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── server/                   ← Express REST API
│   └── src/
│       ├── app.js            ← entry point, route registration
│       ├── routes/           ← 15 route modules
│       ├── controllers/      ← request/response handlers
│       ├── services/         ← business logic & SQL queries
│       ├── models/
│       ├── db/               ← pg connection pool
│       └── utils/            ← logger, response helpers
├── database/
│   ├── init/
│   │   ├── 01_schema.sql     ← all tables + stored report functions
│   │   ├── 02_seed_csv.sql   ← data seeded from CSV files
│   │   └── 03_fix_sequences.sql
│   └── csv_data/             ← original CSV source data
├── docker-compose.yml
└── README.md
```

---

## Database Schema

The database contains **19 tables** covering the full lifecycle of dormitory management:

| Domain | Tables |
|--------|--------|
| Property | `hostel_info`, `room_type`, `room`, `furniture` |
| People | `tenant`, `staff`, `supplier` |
| Contracts & Billing | `rental_contract`, `contract_item`, `monthly_billing`, `monthly_bill_line`, `payment_receipt`, `payments_item` |
| Operations | `maintenance_ticket`, `inspection`, `inspection_line`, `expense`, `expense_line` |
| Reference | `product_code` |

Pre-seeded data includes **16 rooms** across 4 floors (Standard, Deluxe, Suite), **15 active tenants**, **5 staff members**, and full billing/payment/maintenance history.

---

## API Endpoints

The REST API is served at `http://localhost:4000/api/v1/`.

| Resource | Base Path |
|----------|-----------|
| Hostel info | `/hostel` |
| Room types | `/room-types` |
| Rooms | `/rooms` |
| Tenants | `/tenants` |
| Staff | `/staff` |
| Suppliers | `/suppliers` |
| Furniture | `/furniture` |
| Product codes | `/product-codes` |
| Rental contracts | `/contracts` |
| Monthly billing | `/monthly-bills` |
| Payment receipts | `/payment-receipts` |
| Maintenance tickets | `/maintenance-tickets` |
| Room inspections | `/room-inspections` |
| Expenses | `/expenses` |
| Reports | `/reports` |

### Report Functions (`/api/v1/reports`)

Six analytical report functions are implemented as PostgreSQL stored functions and exposed via the API:

- `report_rental_income` — revenue by room type and date range
- `report_occupancy_rate` — current occupancy snapshot
- `report_maintenance_cost` — maintenance spend by issue type
- `report_charges_by_type` — billing breakdown by product type
- `report_payments_by_method` — payment analysis by method
- `report_expenses_by_category` — expense breakdown by category and supplier

---

## How to Run (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Submission

This project is submitted as part of CPE241 — Database Systems
Semester 2/2025 · King Mongkut's University of Technology Thonburi (KMUTT)

### 1. Unzip and enter the project folder

```
HelleResidence/
├── client/
├── server/
├── database/
├── docker-compose.yml
└── README.md
```

### 2. Start all containers

```bash
cd HelleResidence
docker compose up --build
```

Docker will automatically:
1. Start PostgreSQL and run `01_schema.sql` (tables + report functions), then `02_seed_csv.sql` (CSV data)
2. Build and start the Express API server on port 4000
3. Build and start the React frontend via nginx on port 5173

### 3. Open the app

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API      | http://localhost:4000/api/v1 |
| Database | `localhost:15433` — user: `root` / password: `root` / db: `hellesidence_db` |

### 4. Stop

```bash
docker compose down          # stop containers (keeps database data)
docker compose down -v       # stop and wipe database (fresh start)
```

---

## How to Run (Local Development — without Docker)

### Requirements
- Node.js 18+
- PostgreSQL 16 running locally

### 1. Database setup

```bash
createdb hellesidence_db
psql -d hellesidence_db -f database/init/01_schema.sql
psql -d hellesidence_db -f database/init/02_seed_csv.sql
psql -d hellesidence_db -f database/init/03_fix_sequences.sql
```

### 2. Backend server

```bash
cd server
npm install
cp .env.example .env        # edit DATABASE_URL if needed
npm run dev                 # runs on http://localhost:4000
```

### 3. Frontend client

```bash
cd client
npm install
cp .env.example .env        # set VITE_API_BASE=http://localhost:4000
npm run dev                 # runs on http://localhost:5173
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Edit `docker-compose.yml` and change the host port (left side of `:`) for the conflicting service |
| Database not seeding | Run `docker compose down -v` to wipe the volume, then `docker compose up --build` again |
| API connection error from client | Check that `CORS_ORIGIN` in the server environment matches your client URL |
| `pg_isready` fails on startup | The server waits for a health check on the database — wait a few seconds and retry |
