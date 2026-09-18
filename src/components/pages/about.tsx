'use client'

import * as React from 'react'
import { Github, ExternalLink, Book, Code2, Database, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/dashboard/primitives'

export function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SectionHeading
        title="About MERIDIAN Data Analyst Template"
        description="A full-stack reference architecture for capital-markets-scale analytics, published as an open template."
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">What this is</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MERIDIAN is a synthetic, full-stack data analyst dashboard template built around the
            patterns used in production capital-markets data platforms. It models the entire
            lifecycle of a market tick &mdash; ingestion from exchange feeds, stream processing,
            lakehouse persistence, ML inference, and regulator-grade lineage &mdash; in a single
            deployable Next.js application. All data is synthetic; no real client data is used.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The repository serves two purposes: (1) a working template you can clone and extend
            for your own analytics use case, and (2) a reference architecture documenting the
            trade-offs made at each layer of a hyperscale data platform.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Technology Stack
            </CardTitle>
            <CardDescription>The full stack used to build this template</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1.5">
              <li><span className="font-mono text-xs text-muted-foreground">framework</span> &nbsp; Next.js 16 (App Router)</li>
              <li><span className="font-mono text-xs text-muted-foreground">language</span> &nbsp; TypeScript 5</li>
              <li><span className="font-mono text-xs text-muted-foreground">styling</span> &nbsp; Tailwind CSS 4 + shadcn/ui</li>
              <li><span className="font-mono text-xs text-muted-foreground">charts</span> &nbsp; Recharts</li>
              <li><span className="font-mono text-xs text-muted-foreground">database</span> &nbsp; Prisma + SQLite (synthetic seed)</li>
              <li><span className="font-mono text-xs text-muted-foreground">state</span> &nbsp; Zustand</li>
              <li><span className="font-mono text-xs text-muted-foreground">theme</span> &nbsp; next-themes (light/dark)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> Data Sources
            </CardTitle>
            <CardDescription>Live and synthetic sources used</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1.5">
              <li><Badge variant="outline" className="text-[10px] mr-2">synthetic</Badge> Ticks, OHLCV bars, pipelines, datasets, ML models, alerts, incidents</li>
              <li><Badge variant="outline" className="text-[10px] mr-2">live</Badge> Crypto prices via CoinGecko (free, no key)</li>
              <li><Badge variant="outline" className="text-[10px] mr-2">live</Badge> FX rates via Frankfurter (ECB data, free)</li>
              <li><Badge variant="outline" className="text-[10px] mr-2">live</Badge> Historical equities via Stooq (free CSV)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              No paid services. No external dependencies beyond public APIs.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Privacy &amp; GDPR
          </CardTitle>
          <CardDescription>How this template handles your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="font-medium mb-1">No tracking, no cookies, no analytics</div>
              <p className="text-xs text-muted-foreground">
                This template does not set any cookies, does not load any third-party analytics,
                and does not send any data to external servers. All dashboard data is fetched
                client-side from public APIs (CoinGecko, Frankfurter, Stooq) or generated
                synthetically in your browser session.
              </p>
            </div>

            <div className="rounded-md border bg-muted/40 p-3">
              <div className="font-medium mb-1">Login is mock only</div>
              <p className="text-xs text-muted-foreground">
                The login form does not transmit credentials anywhere. Authentication state is
                held in client-side memory (Zustand store) and cleared when the page is closed.
                No password is ever stored or compared.
              </p>
            </div>

            <div className="rounded-md border bg-muted/40 p-3">
              <div className="font-medium mb-1">No personal data collected</div>
              <p className="text-xs text-muted-foreground">
                Under GDPR (EU 2016/679), this template does not process personal data. If you
                extend it to do so, you are responsible for implementing appropriate consent
                management, data subject rights, and breach notification procedures per your
                jurisdiction.
              </p>
            </div>

            <div className="rounded-md border bg-muted/40 p-3">
              <div className="font-medium mb-1">Right to be forgotten</div>
              <p className="text-xs text-muted-foreground">
                Because we collect no data, there is nothing to erase. If you deploy this template
                and add user accounts, you must implement deletion workflows per GDPR Article 17.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repository &amp; License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This template is open-sourced under the MIT license. The full source code is available
            on GitHub. Please open issues there for any bugs, feature requests, or security
            disclosures.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5 mr-1.5" />
                GitHub Repository
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Book className="h-3.5 w-3.5 mr-1.5" />
                Documentation
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acknowledgements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Architecture inspired by publicly documented patterns from the SRE Book (Google),
            Apache Iceberg design docs, the Flink forward conference talks, and the OpenLineage
            specification. Synthetic venue and symbol names (CME, NASDAQ, LSE, EUREX, TSE, AAPL,
            etc.) are used for realism only and do not represent any real client, regulator, or
            trading desk. Any resemblance to actual firms or events is coincidental.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
