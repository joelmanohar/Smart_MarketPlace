# SmartMarket — Buy & Sell Marketplace

A full-stack marketplace (OLX / Amazon / Flipkart style) where anyone can **browse, search, buy and sell** products — laptops, mobiles, tablets, watches, audio, accessories and more. Built with **React + TypeScript** on the frontend and **Spring Boot + PostgreSQL** on the backend.

> Session scope: catalogue ingestion + exact baseline search with transparent performance metrics (records scanned, comparisons, block reads, cost models). The UI works standalone with a built-in catalogue and connects to the API automatically when the backend is running.

## Features

- **Marketplace home** — hero offers, deal countdown, promo cards, category navigation
- **Search & filters** — text search, category, max price, condition, in-stock only, 5 sort modes
- **Product detail** — gallery, ratings, stock, delivery info, quantity, Add to Cart / Buy Now
- **Sell flow** — publish a listing in 60 seconds (title, category, price, stock, location, photo)
- **Cart & checkout** — quantity controls, savings summary, free delivery above ₹499, order confirmation
- **Wishlist** — heart any product, persisted locally
- **Transparent search performance** — every search shows records scanned, comparisons, blocks read, response time, and RAM / external-memory / PRAM / work-span cost comparison
- **Analytics events** — anonymous search / view / purchase logging with response-time percentiles (p50/p95/p99)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Spring Boot 2.7 (Java 11) + Spring Data JPA |
| Database | PostgreSQL 15 (Docker) |
| API | REST `/api/products`, `/api/search`, `/api/analytics` |

## Quick start

### 1. Database (PostgreSQL via Docker)

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` (db `smartmarket`, user/pass `smartmarket`). The backend creates tables automatically and seeds the 20-product catalogue from `backend/src/main/resources/data.sql`.

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

API runs on `http://localhost:8080`. Verify:

```bash
curl http://localhost:8080/api/products
curl "http://localhost:8080/api/search?category=LAPTOP&maxPrice=60000&inStockOnly=true"
```

### 3. Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173` and proxies `/api` to the backend. **If the backend is offline, the UI automatically falls back to the built-in catalogue** with the identical search engine — so the marketplace is fully usable either way.

## Project structure

```
smartmarket/
├── docker-compose.yml          # PostgreSQL
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/smartmarket/
│       ├── model/              # Product, EventLog, Category
│       ├── repository/         # Spring Data JPA
│       ├── service/            # BaselineSearchService (linear scan + cost models), ProductService
│       ├── controller/         # Product, Search, Analytics REST APIs
│       └── config/             # CORS
│   └── src/main/resources/
│       ├── application.yml
│       └── data.sql            # 20-product seed catalogue
└── frontend/
    ├── src/
    │   ├── api/client.ts       # API client + TypeScript baseline search (mirrors backend)
    │   ├── data/products.ts    # Seed catalogue (mirrors data.sql)
    │   ├── components/         # Header, Hero, Filters, ProductCard, PerfPanel, Modals, Footer
    │   └── App.tsx
    └── vite.config.ts          # /api proxy to :8080
```

## How search works (baseline engine)

Every search performs an **exact linear scan** over the catalogue:

1. For each product, apply filters in order: **category → stock → price → condition → text**
2. Count **comparisons** (one per check) and simulate **block reads** for sequential layout (`B = 4` records/block → `⌈N/B⌉` blocks)
3. Report **elapsed time** and the **cost-model comparison**:
   - RAM model: `3N` comparisons
   - External-memory: `⌈N/B⌉` blocks sequential vs `N` scattered
   - PRAM: `⌈N/p⌉` steps (`p = 8`)
   - Work–span: Work `N`, Span `⌈N/p⌉`

The same logic exists in both `BaselineSearchService.java` (backend) and `baselineSearch()` in `client.ts` (frontend), so results and metrics always agree.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Product detail |
| POST | `/api/products` | Publish a new listing (sell) |
| PATCH | `/api/products/{id}/stock` | Update stock (manager) |
| POST | `/api/products/{id}/purchase` | Buy (decrements stock) |
| GET | `/api/search?q=&category=&maxPrice=&inStockOnly=` | Baseline search + metrics |
| GET | `/api/search/cost-model?n=20` | Cost model for N records |
| GET | `/api/search/oracle-check` | Correctness check vs hand-checked list |
| GET | `/api/analytics/summary` | Totals + p50/p95/p99 response times |

## Configuration

Backend reads these environment variables (defaults shown):

- `DB_URL` — `jdbc:postgresql://localhost:5432/smartmarket`
- `DB_USERNAME` — `smartmarket`
- `DB_PASSWORD` — `smartmarket`

## Production notes

- Replace the in-memory fallback catalogue with the API once deployed (already wired via Vite proxy / reverse proxy).
- Add authentication, image upload (S3), and payment gateway before going live — checkout is currently a mock flow.
- Scale path: 20 hand-trace records → 1,000-product catalogue → indexed search (the baseline metrics panel makes the improvement measurable).
