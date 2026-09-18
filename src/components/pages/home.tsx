'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight, Activity, Shield, Zap, Database, Brain, GitBranch,
  TrendingUp, CheckCircle2, ChevronRight, Github, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/store'

export function HomePage() {
  const setActivePage = useDashboardStore(s => s.setActivePage)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary),_transparent_70%)] opacity-[0.04]" />
        <div className="container relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-4 py-1.5 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-muted-foreground">Live · 100B events/day · 5 venues</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                A hyperscale data analyst template for{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  capital markets
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Built around a synthetic tick lakehouse &mdash; ingestion, stream processing,
                lakehouse storage, ML inference, and governance in one full-stack Next.js app.
                Open source preview, no NDA required.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" onClick={() => setActivePage('dashboard')}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActivePage('login')}>
                  Login
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setActivePage('markets')}>
                  Live Markets
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  No external services
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free-tier APIs only
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  GitHub Pages ready
                </span>
              </div>
            </div>

            {/* Stats card */}
            <div className="relative">
              <Card className="overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
                <CardContent className="relative p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Platform Snapshot
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                      live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Daily Events" value="100B" />
                    <Stat label="p99 Latency" value="217ms" />
                    <Stat label="Availability" value="99.999%" />
                    <Stat label="Cost / 1M events" value="$0.023" />
                    <Stat label="Venues" value="5" />
                    <Stat label="Pipelines" value="8" />
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Architecture layers</div>
                    <div className="grid grid-cols-5 gap-1">
                      {['L1', 'L2', 'L3', 'L4', 'L5'].map(l => (
                        <div key={l} className="text-center text-[10px] font-mono py-1.5 rounded border bg-muted/40">
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setActivePage('dashboard')}
                  >
                    Open Dashboard
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 text-[10px]">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything a data analyst needs, in one template
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Nine dashboard sections, live market data, automation rules, governance &mdash;
            all backed by synthetic and free public data sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={Activity}
            title="Real-time Pipelines"
            description="Flink-style pipeline monitoring with throughput, lag, p99 latency, and checkpoint health."
            onClick={() => setActivePage('dashboard')}
          />
          <FeatureCard
            icon={Database}
            title="Lakehouse Datasets"
            description="Apache Iceberg-style table catalog with hot/warm/cold tiers, schema viewer, partition keys."
            onClick={() => setActivePage('dashboard')}
          />
          <FeatureCard
            icon={Brain}
            title="ML Model Registry"
            description="Production + shadow models with drift monitoring and prediction feed."
            onClick={() => setActivePage('dashboard')}
          />
          <FeatureCard
            icon={Shield}
            title="Governance & Lineage"
            description="Runtime lineage graph, audit log, and OPA policy samples for regulator queries."
            onClick={() => setActivePage('dashboard')}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Live Markets"
            description="Real crypto, FX, and equity data from free public APIs (CoinGecko, Frankfurter, Stooq)."
            onClick={() => setActivePage('markets')}
          />
          <FeatureCard
            icon={Zap}
            title="Automation Rules"
            description="Visual rule builder, scheduled jobs, alert routing &mdash; all mock, all working."
            onClick={() => setActivePage('automate')}
          />
        </div>
      </section>

      {/* Architecture strip */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-3 text-[10px]">Architecture</Badge>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Five layers, three cross-cutting planes
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Built on the same architectural patterns as production fintech platforms &mdash;
                cell-based isolation, exactly-once semantics, three-tier SLOs, and OPA-governed lineage.
                The template ships with synthetic data so you can build without compliance overhead.
              </p>
              <Button variant="outline" onClick={() => setActivePage('docs')}>
                Read the docs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {[
                { layer: 'L1', name: 'Ingestion', tech: 'Rust + Aeron, QuickFIX, Debezium' },
                { layer: 'L2', name: 'Streaming Backbone', tech: 'MSK (Kafka), Schema Registry, MM2' },
                { layer: 'L3', name: 'Stream Processing', tech: 'Flink 1.18, RocksDB, S3 checkpoints' },
                { layer: 'L4', name: 'Lakehouse', tech: 'Apache Iceberg on S3, REST catalog, dbt' },
                { layer: 'L5', name: 'Serving', tech: 'Trino, Snowflake, Redis, Feast' },
              ].map(row => (
                <div
                  key={row.layer}
                  className="flex items-center gap-4 rounded-lg border bg-background p-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold font-mono">
                    {row.layer}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{row.tech}</div>
                  </div>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Ready to explore?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          The dashboard runs entirely in your browser. No sign-up, no data sent anywhere.
          Click below to dive into synthetic market data, ML drift, and SLO burn-down.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" onClick={() => setActivePage('dashboard')}>
            Open Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setActivePage('about')}>
            About this project
          </Button>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}

function FeatureCard({
  icon: Icon, title, description, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40 group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  )
}
