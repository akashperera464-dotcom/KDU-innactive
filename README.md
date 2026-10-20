# 🍃 KDU GROUP — Field Extension Officer & Admin Portal

Offline-capable, mobile-first web application for KDU GROUP Ceylon Tea smallholder
operations. Dual experience: a **field officer portal** (quiz-slide data capture with
GPS, offline queue, Rainforest Alliance checklist) and a **desktop admin dashboard**
(analytics, charts, Excel/CSV export, supplier directory, pruning reminders).

Built with **Next.js (App Router) + MongoDB Atlas + Tailwind CSS**.

---

## ✨ Features

- **Collector Portal (mobile-first)**
  - 6-step quiz-slide "Inactive Suppliers" form with progress dock & step dots
  - Extension Visit / Rainforest Alliance (RA) 6-point sustainability checklist
  - Auto GPS capture at submit (`precise` / `fallback` accuracy stamping)
  - Offline-first: entries queue in `localStorage` and sync when online
  - Supplier auto-fill from the admin directory (scoped by Factory + Route)
- **Admin Dashboard**
  - KPI cards, donut & bar charts, filters (All / Today / 7 Days / Month)
  - **Excel / CSV bulk import** of the office inactive-supplier list
  - Coverage analysis: admin inactive list VS field-submitted data
  - **Pruning reminder engine** (90-day recovery window → urgent alerts)
  - User, supplier, route, reason and dynamic-question master settings
- **Auth**: role-based login (Super Admin / Field Collector), session persistence

## 🚀 Getting Started

```bash
npm install
cp .env.example .env     # then paste your MongoDB Atlas URI
npm run dev              # http://localhost:3000
```

The Atlas database **auto-seeds on first boot** (routes, reasons, users, suppliers,
sample entries) — no manual migration step needed.

### Environment variables

| Variable      | Required | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `MONGODB_URI` | ✅       | MongoDB Atlas connection string              |
| `DATABASE_URL`| —        | Only for optional local PG seed scripts      |

### Default accounts (seeded)

| Role        | Username               | Password     |
| ----------- | ---------------------- | ------------ |
| Super Admin | `akashperera@kdu.com`  | *(set by owner)* |
| Collector   | `Nandima`              | `123`        |
| Collector   | `Collector_1`          | `123`        |

## 📦 Deploying to Vercel

1. Push this repo to GitHub.
2. Vercel → **Add New… → Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add env var `MONGODB_URI` (Project → Settings → Environment Variables), for
   Production, Preview **and** Development.
5. Deploy. MongoDB Atlas network access must allow the deployment
   (`0.0.0.0/0` for serverless functions).

## 🗂 Project structure

```
src/
├── app/            # Next.js App Router pages + API routes (MongoDB-backed)
│   └── api/        # auth, bootstrap, entries, suppliers, users, routes,
│                   # reasons, questions, health
├── components/     # auth flow, header, collector portal, admin dashboard
├── db/
│   ├── mongo.ts        # Atlas client (lazy, pooled, indexed)
│   ├── mongoSeed.ts    # first-boot auto-seed (users, routes, suppliers…)
│   ├── factoryRoutes.ts# factory → route master mapping (driver-free)
│   └── seed.ts         # optional legacy PostgreSQL seed script
├── lib/            # export utils (CSV/XLSX), offline storage, reminders
└── types/          # shared TypeScript models
```

## 🛠 Scripts

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `npm run dev`         | Local dev server                 |
| `npm run build`       | Production build                 |
| `npm run start`       | Serve production build           |
| `npm run typecheck`   | TypeScript check                 |
