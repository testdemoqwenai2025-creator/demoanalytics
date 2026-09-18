'use client'

import * as React from 'react'
import { Book, Code2, Database, Workflow, Brain, Shield, Terminal, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/dashboard/primitives'

export function DocsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SectionHeading
        title="Documentation"
        description="Quick reference for getting started, architecture, and customization."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Quick start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/40 p-3 rounded-md overflow-x-auto">
{`# 1. Install dependencies
bun install    # or: npm install

# 2. Push Prisma schema to SQLite + generate client
bun run db:push

# 3. Seed synthetic data
bun run scripts/seed.ts

# 4. Start dev server
bun run dev

# 5. Open http://localhost:3000`}
          </pre>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Add a new page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              <li>Create <code className="text-xs bg-muted/40 px-1 rounded">src/components/pages/&lt;name&gt;.tsx</code></li>
              <li>Export a <code className="text-xs bg-muted/40 px-1 rounded">&lt;Name&gt;Page</code> component</li>
              <li>Add it to <code className="text-xs bg-muted/40 px-1 rounded">PAGES</code> map in <code className="text-xs bg-muted/40 px-1 rounded">src/app/page.tsx</code></li>
              <li>Add nav entry to <code className="text-xs bg-muted/40 px-1 rounded">NAV</code> in <code className="text-xs bg-muted/40 px-1 rounded">src/components/layout/sidebar.tsx</code></li>
              <li>Add label to <code className="text-xs bg-muted/40 px-1 rounded">PAGE_LABELS</code> in <code className="text-xs bg-muted/40 px-1 rounded">src/components/layout/topbar.tsx</code></li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> Add a new Prisma model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              <li>Edit <code className="text-xs bg-muted/40 px-1 rounded">prisma/schema.prisma</code></li>
              <li>Run <code className="text-xs bg-muted/40 px-1 rounded">bun run db:push</code></li>
              <li>Add API route at <code className="text-xs bg-muted/40 px-1 rounded">src/app/api/&lt;model&gt;/route.ts</code></li>
              <li>Add seed logic in <code className="text-xs bg-muted/40 px-1 rounded">scripts/seed.ts</code></li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Workflow className="h-4 w-4" /> Add a dashboard section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              <li>Create <code className="text-xs bg-muted/40 px-1 rounded">src/components/dashboard/sections/&lt;name&gt;.tsx</code></li>
              <li>Export a <code className="text-xs bg-muted/40 px-1 rounded">&lt;Name&gt;Section</code> component</li>
              <li>Add to <code className="text-xs bg-muted/40 px-1 rounded">SECTIONS</code> map in <code className="text-xs bg-muted/40 px-1 rounded">dashboard-shell.tsx</code></li>
              <li>Add to <code className="text-xs bg-muted/40 px-1 rounded">NAV</code> in <code className="text-xs bg-muted/40 px-1 rounded">sidebar.tsx</code></li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" /> Swap SQLite → PostgreSQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              <li>Change <code className="text-xs bg-muted/40 px-1 rounded">provider = "sqlite"</code> to <code className="text-xs bg-muted/40 px-1 rounded">"postgresql"</code></li>
              <li>Set <code className="text-xs bg-muted/40 px-1 rounded">DATABASE_URL</code> in <code className="text-xs bg-muted/40 px-1 rounded">.env</code></li>
              <li>Run <code className="text-xs bg-muted/40 px-1 rounded">bun run db:push</code></li>
              <li>Re-seed with <code className="text-xs bg-muted/40 px-1 rounded">bun run scripts/seed.ts</code></li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Public data APIs used
          </CardTitle>
          <CardDescription>All free, no API keys required</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ApiRow
              name="CoinGecko"
              url="https://www.coingecko.com/api/documentation"
              desc="Crypto market data, prices, market caps. Free tier: ~10-30 calls/min."
              scope="/api/markets?type=crypto"
            />
            <ApiRow
              name="Frankfurter"
              url="https://www.frankfurter.app/docs/"
              desc="ECB daily reference FX rates. Free, no key, no rate limit."
              scope="/api/markets?type=fx"
            />
            <ApiRow
              name="Stooq"
              url="https://stooq.com"
              desc="Historical equity OHLCV as CSV. Free, no key."
              scope="/api/markets?type=equity"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Book className="h-4 w-4" /> Deployment to GitHub Pages
          </CardTitle>
          <CardDescription>How the public preview is hosted</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/40 p-3 rounded-md overflow-x-auto">
{`# next.config.ts is configured with:
#   output: 'export'
#   basePath: process.env.NEXT_PUBLIC_BASE_PATH || ''
#   images: { unoptimized: true }

# 1. Build static export
bun run build

# 2. The .next/ directory contains the static site.
#    Push the public repo (demoanalytics) to GitHub.

# 3. In repo Settings → Pages:
#    - Source: GitHub Actions
#    - The included workflow builds and deploys on push to main.

# 4. Your preview will be live at:
#    https://<your-username>.github.io/demoanalytics/`}
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            Note: the static export only includes the synthetic data dashboard. API routes
            requiring a server (Prisma, live API proxying) work only in <code className="text-xs bg-muted/40 px-1 rounded">bun run dev</code> mode.
            For the public preview, the markets page falls back to synthetic data when the proxy is unavailable.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ApiRow({ name, url, desc, scope }: { name: string; url: string; desc: string; scope: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <Badge variant="outline" className="text-[10px] font-mono shrink-0 mt-0.5">{name}</Badge>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{desc}</p>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span className="font-mono">{scope}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-0.5">
            docs <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
