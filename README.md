# MERIDIAN · Data Analyst Template

> **Private repository** — full source code. A public mirror lives at [`demoanalytics`](https://github.com/) for preview purposes.

A production-grade, full-stack data analyst dashboard template for capital-markets-scale analytics. Built around a synthetic tick lakehouse (the kind of platform that ingests 100B+ events/day from exchange feeds and serves real-time risk, post-trade, and research workloads simultaneously).

This repository is both:

1. **A working template** — clone, run, and you have a real data analyst dashboard with synthetic data, real API routes, charts, tables, SQL editor, lineage graph, and SLO monitoring.
2. **A reference architecture** — every component mirrors a real production pattern (cell-based isolation, exactly-once semantics, three-tier SLOs, OPA-governed lineage).

---

## Dual-repo setup

This template uses a **private/public mirror** pattern:

| Repository | Visibility | Purpose |
|-----------|-----------|---------|
| **`dataanalysistemplate`** (this repo) | **Private** | Full source code with backend, Prisma, API routes, synthetic seeder, tests |
| **`demoanalytics`** | **Public** | Mirror of the source, deployed to GitHub Pages for no-NDA preview |

The public repo contains the same code plus a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds a static export and deploys it to GitHub Pages on every push to `main`.

To sync from private → public:

```bash
# First time: clone the public repo as a sibling directory
cd ..
git clone git@github.com:<you>/demoanalytics.git
cd dataanalysistemplate

# Sync (copies tracked files, commits, and pushes)
./scripts/sync-to-public.sh ../demoanalytics
```

The sync script:
- Uses `git archive` to export only tracked files (respects `.gitignore`)
- Skips `.git`, `node_modules`, `.next`, `dev.log`, `db/`, `.env`, `skills/`, `tests/`
- Commits with a message referencing the source commit hash
- Pushes to `origin main` on the public repo

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + **shadcn/ui** (New York) |
| Charts | **Recharts** |
| Tables | TanStack Table patterns (custom render) |
| Database | **Prisma ORM** + SQLite (synthetic seed) |
| State | **Zustand** (client), TanStack Query patterns (server) |
| Theme | next-themes (light/dark) |
| Icons | Lucide |
| Notifications | sonner |

---

## What's inside

### 9 dashboard sections (single-page app, all under `/`)

1. **Overview** — KPI cards, throughput chart, latency-vs-SLO chart, SLO burn-down, recent activity feed (alerts + audit log merged)
2. **Datasets** — Lakehouse table browser with tier/format filters, schema viewer, partition keys
3. **Data Explorer** — SQL editor with saved-queries sidebar, simulated execution, results table
4. **Pipelines** — Per-pipeline cards: throughput, lag, p99, checkpoint health, last restart
5. **Tick Stream** — OHLCV area chart with high/low envelope, volume bar chart, recent tick table
6. **ML Models** — Model registry, drift score chart (with warning/critical thresholds), prediction feed
7. **Alerts & SLOs** — Three-tier SLO cards with budget consumption, live alert feed with Ack/Resolve workflow
8. **Governance** — Lineage graph (column layout by node type: Kafka → Flink → Iceberg → Serving), audit log, OPA policy samples
9. **Incidents** — Postmortem cards with severity, root cause, action items

### 11 API routes (all under `/api/*`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stats` | GET | Aggregate counts (venues, symbols, ticks, pipelines, datasets, models, predictions, alerts, incidents, audit logs) + storage totals + pipeline health |
| `/api/datasets` | GET | List datasets with optional `tier` / `namespace` filters |
| `/api/pipelines` | GET | All Flink-style pipelines with incident counts |
| `/api/ticks` | GET | Tick stream with `symbol`, `venue`, `side`, `limit` filters |
| `/api/ohlcv` | GET | OHLCV bars by `symbol` + `timeframe` |
| `/api/ml-models` | GET | Model registry with prediction counts + drift status |
| `/api/predictions` | GET | Recent ML predictions with `label` filter |
| `/api/slos` | GET | Three-tier SLO with burn-rate + health status |
| `/api/alerts` | GET, PATCH | Alert feed + Ack/Resolve mutations |
| `/api/incidents` | GET | Postmortem cards with pipeline join |
| `/api/lineage` | GET | Lineage graph nodes + edges |
| `/api/audit` | GET | Audit log with `result` filter |
| `/api/queries` | GET, POST | Saved queries CRUD |
| `/api/symbols` | GET | Venues + symbols reference data |

### Prisma schema — 15 models

`Venue`, `Symbol`, `Tick`, `OhlcvBar`, `Pipeline`, `Dataset`, `SavedQuery`, `MlModel`, `FeatureRow`, `Prediction`, `Slo`, `Alert`, `Incident`, `LineageEdge`, `AuditLog`

### Synthetic seed data

Running `bun run scripts/seed.ts` populates the database with:

- 5 venues (CME, NASDAQ, LSE, EUREX, TSE)
- 18 symbols across 6 asset classes (equity, index, fx, rate, commodity, option)
- ~12,960 ticks (random-walk price simulation, 6 hours per symbol)
- ~4,946 OHLCV bars (1m and 5m timeframes)
- 8 pipelines (Normalize / Enrich / Aggregate / AnomalyScore / Iceberg Sink / MM2 / Compaction / Feature Materialize)
- 8 lakehouse datasets (8.4B+ rows, 4.1TB+ synthetic size)
- 6 ML models (production + shadow + retired)
- 2,160 feature rows, 200 predictions
- 3 SLO tiers, 8 alerts, 3 incidents (incl. April 2024 checkpoint storm)
- 13 lineage edges, 200 audit log entries, 7 saved queries

---

## Getting started

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh) 1.1+)
- A package manager: `bun`, `npm`, `pnpm`, or `yarn`

### Install & run

```bash
# Install dependencies
bun install    # or: npm install

# Push Prisma schema to SQLite and generate client
bun run db:push

# Seed the database with synthetic data
bun run scripts/seed.ts

# Start the dev server
bun run dev
```

Open `http://localhost:3000` in your browser.

### Useful scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run lint` | ESLint |
| `bun run db:push` | Push Prisma schema → SQLite |
| `bun run db:reset` | Reset database (re-seed after this) |
| `bun run scripts/seed.ts` | (Re)populate synthetic data |

---

## Project layout

```
.
├── prisma/
│   └── schema.prisma              # 15-model schema
├── scripts/
│   └── seed.ts                   # Synthetic data seeder
├── src/
│   ├── app/
│   │   ├── api/                  # 11 API routes (see above)
│   │   ├── globals.css
│   │   ├── layout.tsx            # Root layout w/ ThemeProvider
│   │   └── page.tsx              # Single-route dashboard shell
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # 9-section nav
│   │   │   └── topbar.tsx        # Search, theme toggle, notifications
│   │   ├── dashboard/
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── primitives.tsx    # StatCard, StatusPill, SectionHeading, EmptyState
│   │   │   ├── charts/
│   │   │   │   └── index.tsx     # Throughput, Latency, Price, Volume, Drift, Activity feed
│   │   │   └── sections/
│   │   │       ├── overview.tsx
│   │   │       ├── datasets.tsx
│   │   │       ├── explorer.tsx
│   │   │       ├── pipelines.tsx
│   │   │       ├── ticks.tsx
│   │   │       ├── models.tsx
│   │   │       ├── alerts.tsx
│   │   │       ├── governance.tsx
│   │   │       └── incidents.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui/                   # shadcn/ui components (50+)
│   ├── hooks/
│   │   ├── use-fetch.ts          # SWR-style fetch hook w/ refresh interval
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts                 # Prisma client singleton
│       ├── store.ts              # Zustand store (active section, sidebar, refresh)
│       └── utils.ts              # cn() helper
├── prisma/schema.prisma
├── components.json               # shadcn/ui config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Design decisions worth noting

### Why a single `/` route?

The dashboard ships as a single-route SPA with client-side section switching. This keeps the template deployable to any static host and avoids Next.js's app-router overhead for what is fundamentally an interactive console.

### Why synthetic data?

Real capital-markets data is regulated. A template that ships with synthetic data lets you build, demo, and iterate without compliance overhead. The seeder (`scripts/seed.ts`) uses a random-walk price model with per-asset-class volatility, so the OHLCV charts look plausible and the alert thresholds actually fire.

### Why Prisma + SQLite?

The template targets local development and small-team demos. SQLite keeps the dependency footprint zero. The schema is portable to PostgreSQL by changing one line in `prisma/schema.prisma` (`provider = "postgresql"`) and re-running `db:push`.

### Why Zustand over Redux?

For a dashboard of this scope, Redux's ceremony is overkill. Zustand gives us a typed, hook-based store with no boilerplate — see `src/lib/store.ts` (40 lines total).

### Why Recharts over Visx / Nivo?

Recharts is the most approachable for a template: declarative React components, good defaults, and SVG output that prints well. For production performance-critical visualisations, swap to Visx or D3 directly.

---

## Pushing to your own GitHub

This repo is initialized locally but **not pushed to a remote**. To publish:

```bash
# 1. Create an empty repo on GitHub (do not add README/license)
#    e.g. https://github.com/<you>/dataanalysistemplate

# 2. Set the remote
git remote add origin git@github.com:<you>/dataanalysistemplate.git
#   or:  git remote add origin https://github.com/<you>/dataanalysistemplate.git

# 3. Push
git push -u origin main
```

If you want to use the GitHub CLI:

```bash
gh repo create dataanalysistemplate --public --source=. --remote=origin --push
```

---

## Customization guide

### Add a new dashboard section

1. Create `src/components/dashboard/sections/<name>.tsx` exporting a `<NameSection />` component
2. Add it to `SECTIONS` map in `src/components/dashboard/dashboard-shell.tsx`
3. Add the nav entry to `NAV` array in `src/components/layout/sidebar.tsx`
4. Add a label to `SECTION_LABELS` in `src/components/layout/topbar.tsx`

### Add a new Prisma model

1. Edit `prisma/schema.prisma`
2. `bun run db:push` (accept data loss if prompted)
3. Add a corresponding API route in `src/app/api/<model>/route.ts`
4. (Optional) Add seed logic in `scripts/seed.ts`

### Swap the database to PostgreSQL

1. Change `provider = "sqlite"` → `provider = "postgresql"` in `prisma/schema.prisma`
2. Update `DATABASE_URL` in `.env` to your Postgres connection string
3. `bun run db:push`
4. `bun run scripts/seed.ts`

### Theme customization

Edit CSS variables in `src/app/globals.css` (`:root` and `.dark`). The cascade palette is intentionally neutral so brand colors can be layered in.

---

## License

MIT — see `LICENSE` file (or add one before publishing).

---

## Acknowledgements

Architecture inspired by the [MERIDIAN whitepaper](https://example.com) — a hyperscale real-time tick lakehouse for capital markets. Synthetic data is fictional; any resemblance to real venues, symbols, or trading desks is intentional for realism but does not represent any real client or regulatory finding.
