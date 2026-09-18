# MERIDIAN · Data Analyst Template (Public Preview)

> This is the **public mirror** of the private [`dataanalysistemplate`](https://github.com/testdemoqwenai2025-creator/dataanalysistemplate) repository.
> The full source code lives there. This repo exists purely to host a no-NDA public preview on GitHub Pages.

---

## Live Preview

The dashboard is deployed to GitHub Pages at:

```
https://testdemoqwenai2025-creator.github.io/demoanalytics/
```

Open the URL above and click around. No sign-up required. The login button is mock-only &mdash; no credentials are transmitted.

---

## What's inside

A multi-page Next.js dashboard with:

- **Home** &mdash; Marketing landing with hero, Get Started, Live Markets, Login CTAs
- **Dashboard** &mdash; 9 sections of synthetic tick-lakehouse analytics:
  Overview, Datasets, Data Explorer (SQL), Pipelines, Tick Stream (OHLCV), ML Models (drift), Alerts & SLOs (Ack/Resolve), Governance (lineage), Incidents (postmortems)
- **Live Markets** &mdash; Real crypto prices (CoinGecko direct), ECB FX rates (Frankfurter direct), synthetic equities
- **Automation** &mdash; Mock rule builder, scheduled jobs, run history
- **About** &mdash; Architecture, acknowledgements, full GDPR privacy notice
- **Documentation** &mdash; Quick reference for getting started and customization
- **Login** &mdash; Mock auth form (no credentials stored, persists to localStorage)

Global features:

- Light/dark theme toggle (top-right of every page)
- Global search (Cmd/Ctrl+K) across all pages and dashboard sections
- "Return to Home" button in the topbar of every page
- Footer on every page with GDPR notice, contact link to GitHub repo, and navigation
- Fully responsive (mobile drawer sidebar)
- Static-preview mode auto-detection: when API routes are unavailable (GitHub Pages), the dashboard shows synthetic data with a banner explaining the limitation. The Markets page always fetches live data directly from public APIs.

---

## How this repo works

```
┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
│  dataanalysistemplate (PRIVATE)     │  sync   │  demoanalytics (PUBLIC)              │
│  ─────────────────────────────────  │  ────►  │  ─────────────────────────────────  │
│  • Full Next.js source              │         │  • Mirror of the source (no API)    │
│  • Prisma + SQLite                  │         │  • GitHub Actions workflow           │
│  • API routes (live data)           │         │  • Static export (output: 'export') │
│  • Synthetic seeder                 │         │  • Deployed to GitHub Pages         │
└─────────────────────────────────────┘         └─────────────────────────────────────┘
```

The private repo is the source of truth. The `scripts/sync-to-public.sh` script (in the
private repo) mirrors tracked files into this public repo, **excluding**:

- `src/app/api/` &mdash; API routes can't run on GitHub Pages (no Node.js server)
- `prisma/` and `src/lib/db.ts` &mdash; database layer not needed for static export
- `scripts/seed.ts` &mdash; synthetic data seeder (only runs in dev mode)
- `examples/`, `tests/`, `skills/` &mdash; sandbox-only files
- `db/`, `.env`, `dev.log` &mdash; local runtime files

The public repo's GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the
static export and deploys it to GitHub Pages on every push to `main`.

---

## Run it locally

You can also run this public repo locally &mdash; it works as a static Next.js app
(synthetic data only, no live API routes):

```bash
git clone https://github.com/testdemoqwenai2025-creator/demoanalytics.git
cd demoanalytics
bun install        # or: npm install
bun run dev        # start dev server on http://localhost:3000
```

For the full experience with live API routes, real CoinGecko proxying, and the
synthetic data seeder, clone the private `dataanalysistemplate` repo instead.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| State | Zustand (with localStorage persistence for mock auth) |
| Theme | next-themes (light/dark) |
| Live data | CoinGecko (crypto, CORS), Frankfurter (FX, CORS) &mdash; both free, no API key |
| Static fallback | SYNTHETIC_FALLBACK constant in `src/lib/static-fallback.ts` |

---

## Privacy &amp; GDPR

This template **does not**:

- Set any cookies
- Load any third-party analytics
- Send any data to external servers under our control
- Store any user credentials (login is mock-only, persisted to localStorage)

The dashboard fetches live data client-side from these free public APIs:

- [CoinGecko](https://www.coingecko.com/api/documentation) &mdash; crypto market data (CORS-enabled)
- [Frankfurter](https://www.frankfurter.app/) &mdash; ECB daily reference FX rates (CORS-enabled)

Under GDPR (EU 2016/679), this template does not process personal data. If you fork and
extend it to do so, you are responsible for implementing appropriate consent management,
data subject rights, and breach notification procedures per your jurisdiction. See the
About page in the app for the full privacy notice.

---

## Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) handles deployment
automatically. On every push to `main`:

1. Bun installs dependencies
2. Next.js builds a static export with `NEXT_PUBLIC_STATIC_EXPORT=1` and `NEXT_PUBLIC_BASE_PATH=/demoanalytics`
3. The `out/` directory is uploaded as a GitHub Pages artifact
4. The artifact is deployed to `https://testdemoqwenai2025-creator.github.io/demoanalytics/`

To enable GitHub Pages (one-time setup):

1. Go to repo **Settings → Pages**
2. **Source**: GitHub Actions
3. The next push to `main` will trigger the deployment

---

## License

MIT &mdash; see [LICENSE](./LICENSE).

## Contact

Open an issue on [this GitHub repository](https://github.com/testdemoqwenai2025-creator/demoanalytics)
for bugs, feature requests, or security disclosures. The full source code is in the
private `dataanalysistemplate` repo; this public mirror is for preview purposes only.
