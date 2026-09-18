# Database Migration Guide: SQLite → PostgreSQL (Neon free tier)

This guide shows how to migrate the MERIDIAN template from SQLite to PostgreSQL
using Neon's free tier (3GB storage, no credit card required).

## Why migrate?

SQLite is great for local development and the static GitHub Pages preview.
For production with multiple users, you want PostgreSQL because:

- Concurrent writes (SQLite locks the entire database on write)
- Real multi-tenancy (per-user data isolation at the database level)
- Full-text search (SQLite FTS is limited)
- JSON column types (Postgres has native JSONB)
- Row-level security (Postgres supports RLS policies)

## Step 1: Create a Neon database (free, 2 minutes)

1. Go to https://neon.tech and sign up (GitHub OAuth)
2. Click "New Project" → name it "meridian"
3. Select region closest to your users
4. Copy the connection string (looks like):
   ```
   postgresql://meridian:password@ep-xxx.us-east-2.aws.neon.tech/meridian?sslmode=require
   ```

## Step 2: Update Prisma schema

Edit `prisma/schema.prisma` and change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was: "sqlite"
  url      = env("DATABASE_URL")
}
```

That's the only schema change needed — all models work with both providers.

## Step 3: Update .env

```bash
# Replace the SQLite URL with your Neon connection string
DATABASE_URL="postgresql://meridian:password@ep-xxx.us-east-2.aws.neon.tech/meridian?sslmode=require"
```

## Step 4: Push schema + seed

```bash
bun run db:push     # creates all tables in Postgres
bun run scripts/seed.ts  # populates synthetic data
```

## Step 5: Deploy

For the public preview to use the real database, deploy the private repo to
a host that supports Node.js:

- **Vercel** (free tier): `vercel --prod` — set DATABASE_URL in project settings
- **Render** (free tier): connect GitHub repo, set DATABASE_URL
- **Fly.io** (free tier): `flyctl deploy` — set DATABASE_URL as a secret

The GitHub Pages static export will continue to use synthetic fallback data.
The deployed version (on Vercel/Render/Fly) will use the real database.

## Step 6: (Optional) Enable connection pooling

Neon provides a pooled connection string (port 5432 → 6543). Use it for
serverless deployments (Vercel functions) to avoid connection exhaustion:

```
postgresql://meridian:password@ep-xxx-pooler.us-east-2.aws.neon.tech/meridian?sslmode=require
```

## Verifying the migration

```bash
bun -e "import {db} from './src/lib/db'; db.venue.count().then(c => console.log('venues:', c))"
# Should print: venues: 5
```

## Rollback

To revert to SQLite:
1. Change `provider = "postgresql"` back to `"sqlite"` in schema.prisma
2. Set `DATABASE_URL=file:./db/custom.db` in .env
3. Run `bun run db:push && bun run scripts/seed.ts`
