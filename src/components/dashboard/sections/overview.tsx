'use client'

import * as React from 'react'
import {
  Activity, Database, Workflow, Brain, Bell, HardDrive, Zap, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { StatCard, SectionHeading, StatusPill } from '../primitives'
import { ThroughputChart, LatencyChart, RecentActivityFeed } from '../charts'

interface StatsResponse {
  counts: Record<string, number>
  storage: { totalSizeBytes: number; totalRows: number; totalSizeHuman: string; totalRowsHuman: string }
  pipelines: { total: number; running: number; degraded: number; stopped: number; avgLagMs: number; totalThroughputMps: number }
  alerts: { firing: number; acked: number }
}

export function OverviewSection() {
  const { data, loading } = useFetch<StatsResponse>('/api/stats', { refreshInterval: 15000 })

  return (
    <>
      <SectionHeading
        title="Platform Overview"
        description="Real-time view of ingestion, processing, lakehouse, and serving layers."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          label="Daily Events"
          value="100B"
          icon={<Activity className="h-4 w-4" />}
          delta={{ value: '+8% vs 7d avg', positive: true }}
          hint="across 5 venues"
          loading={loading}
        />
        <StatCard
          label="Total Ticks Stored"
          value={data ? formatNumber(data.counts.ticks) : '—'}
          icon={<Zap className="h-4 w-4" />}
          hint="last 6 hours"
          loading={loading}
        />
        <StatCard
          label="Lakehouse Size"
          value={data?.storage.totalSizeHuman || '—'}
          icon={<HardDrive className="h-4 w-4" />}
          hint={`${data?.storage.totalRowsHuman || '—'} rows`}
          loading={loading}
        />
        <StatCard
          label="Pipelines Running"
          value={data ? `${data.pipelines.running}/${data.pipelines.total}` : '—'}
          icon={<Workflow className="h-4 w-4" />}
          hint={data?.pipelines.degraded ? `${data.pipelines.degraded} degraded` : 'all healthy'}
          loading={loading}
        />
        <StatCard
          label="Avg Lag"
          value={data ? `${data.pipelines.avgLagMs}ms` : '—'}
          icon={<TrendingUp className="h-4 w-4" />}
          delta={{ value: 'p99 < 250ms', positive: true }}
          loading={loading}
        />
        <StatCard
          label="ML Predictions"
          value={data ? formatNumber(data.counts.predictions) : '—'}
          icon={<Brain className="h-4 w-4" />}
          hint="last 24h"
          loading={loading}
        />
        <StatCard
          label="Firing Alerts"
          value={data?.alerts.firing ?? '—'}
          icon={<Bell className="h-4 w-4" />}
          delta={data?.alerts.firing ? { value: 'requires attention', positive: false } : null}
          loading={loading}
        />
        <StatCard
          label="Active Incidents"
          value={data?.counts.activeIncidents ?? '—'}
          icon={<AlertTriangle className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Throughput by Pipeline</span>
              <Badge variant="outline" className="text-[10px]">msg/s</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Top 5 Flink jobs by current throughput</CardDescription>
          </CardHeader>
          <CardContent>
            <ThroughputChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Latency vs SLO budget</span>
              <Badge variant="outline" className="text-[10px]">ms · p99</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Per-pipeline p99 latency against the 250ms SLO ceiling</CardDescription>
          </CardHeader>
          <CardContent>
            <LatencyChart />
          </CardContent>
        </Card>
      </div>

      {/* Storage breakdown + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLO Burn-Down</CardTitle>
            <CardDescription className="text-xs">30-day error budget consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <SloBurnDown />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Live feed of alerts, audit events, and pipeline state changes</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function formatNumber(n: number): string {
  if (!n) return '0'
  const k = 1000
  const sizes = ['', 'K', 'M', 'B', 'T']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(2)}${sizes[i]}`
}

function SloBurnDown() {
  const { data, loading } = useFetch<{ slos: any[] }>('/api/slos', { refreshInterval: 30000 })

  if (loading || !data) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-3">
      {data.slos.map(slo => {
        const pct = Math.round(slo.budgetConsumedPct)
        const status = pct > 70 ? 'destructive' : pct > 40 ? 'warning' : 'success'
        const barColor = pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
        return (
          <div key={slo.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{slo.name}</span>
              <span className="text-muted-foreground tabular-nums">{pct}% / 100%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1h burn: {slo.burnRate1h.toFixed(2)}x</span>
              <span>budget left: {Math.round(100 - pct)}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
