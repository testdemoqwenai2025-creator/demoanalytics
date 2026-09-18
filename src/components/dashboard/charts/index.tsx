'use client'

import * as React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Area, AreaChart, ReferenceLine, Cell,
} from 'recharts'
import { useFetch } from '@/hooks/use-fetch'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '../primitives'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function ThroughputChart() {
  const { data, loading } = useFetch<{ pipelines: any[] }>('/api/pipelines', {
    refreshInterval: 15000,
    staticFallback: () => ({ pipelines: SYNTHETIC_FALLBACK.pipelines }),
  })

  if (loading || !data) {
    return <Skeleton className="h-48 w-full" />
  }

  const top = [...data.pipelines]
    .filter(p => p.throughputMps > 0)
    .sort((a, b) => b.throughputMps - a.throughputMps)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      throughput: Math.round(p.throughputMps / 1000),
    }))

  return (
    <ResponsiveContainer width="100%" height={192}>
      <BarChart data={top} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px',
          }}
          formatter={(v: any) => [`${v}K msg/s`, 'throughput']}
        />
        <Bar dataKey="throughput" radius={[3, 3, 0, 0]}>
          {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LatencyChart() {
  const { data, loading } = useFetch<{ pipelines: any[] }>('/api/pipelines', {
    refreshInterval: 15000,
    staticFallback: () => ({ pipelines: SYNTHETIC_FALLBACK.pipelines }),
  })

  if (loading || !data) {
    return <Skeleton className="h-48 w-full" />
  }

  const chartData = data.pipelines
    .filter(p => p.p99LatencyMs > 0)
    .map(p => ({
      name: p.name,
      p99: Math.round(p.p99LatencyMs),
      lag: Math.round(p.lagMs),
      checkpoint: Math.round(p.checkpointMs),
    }))

  return (
    <ResponsiveContainer width="100%" height={192}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        />
        <ReferenceLine y={250} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'SLO 250ms', fontSize: 9, fill: '#ef4444', position: 'right' }} />
        <Bar dataKey="p99" fill="#0ea5e9" radius={[3, 3, 0, 0]} name="p99 latency" />
        <Bar dataKey="lag" fill="#94a3b8" radius={[3, 3, 0, 0]} name="lag" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PriceChart({ symbol, timeframe = '1m' }: { symbol: string; timeframe?: string }) {
  const { data, loading } = useFetch<{ bars: any[] }>(
    `/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=120`,
    { staticFallback: () => ({ bars: generateStaticBars(symbol) }) }
  )

  if (loading || !data) {
    return <Skeleton className="h-72 w-full" />
  }
  if (!data.bars.length) {
    return <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No OHLCV data for {symbol}</div>
  }

  const chartData = data.bars.map(b => ({
    ts: new Date(b.ts).getTime(),
    open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
  }))

  const min = Math.min(...chartData.map(d => d.low))
  const max = Math.max(...chartData.map(d => d.high))
  const pad = (max - min) * 0.05

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="ts"
          tickFormatter={(v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          domain={[min - pad, max + pad]}
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(v) => v.toFixed(2)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px',
          }}
          labelFormatter={(v) => new Date(v as number).toLocaleString('en-US')}
          formatter={(v: any, name) => [Number(v).toFixed(4), name]}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="high"
          stroke="#10b981"
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 4"
          opacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="low"
          stroke="#ef4444"
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 4"
          opacity={0.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function VolumeChart({ symbol, timeframe = '1m' }: { symbol: string; timeframe?: string }) {
  const { data, loading } = useFetch<{ bars: any[] }>(
    `/api/ohlcv?symbol=${symbol}&timeframe=${timeframe}&limit=120`,
    { staticFallback: () => ({ bars: generateStaticBars(symbol) }) }
  )

  if (loading || !data) return <Skeleton className="h-32 w-full" />
  if (!data.bars.length) return <div className="h-32" />

  const chartData = data.bars.map(b => ({
    ts: new Date(b.ts).getTime(),
    volume: b.volume,
  }))

  return (
    <ResponsiveContainer width="100%" height={128}>
      <BarChart data={chartData} margin={{ top: 0, right: 16, left: -8, bottom: 0 }}>
        <XAxis
          dataKey="ts"
          tickFormatter={(v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px',
          }}
          formatter={(v: any) => [v.toLocaleString(), 'volume']}
        />
        <Bar dataKey="volume" fill="#94a3b8" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ModelDriftChart() {
  const { data, loading } = useFetch<{ models: any[] }>('/api/ml-models', {
    refreshInterval: 30000,
    staticFallback: () => ({ models: SYNTHETIC_FALLBACK.mlModels }),
  })

  if (loading || !data) return <Skeleton className="h-64 w-full" />

  const chartData = data.models
    .filter(m => m.status !== 'retired')
    .map(m => ({
      name: `${m.name} ${m.version}`,
      drift: Number(m.driftScore.toFixed(3)),
      accuracy: Number((m.accuracy || 0).toFixed(3)),
    }))

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
        <XAxis type="number" domain={[0, 0.5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={160} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        />
        <ReferenceLine x={0.15} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'warning', fontSize: 9, fill: '#f59e0b' }} />
        <ReferenceLine x={0.3} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'critical', fontSize: 9, fill: '#ef4444' }} />
        <Bar dataKey="drift" radius={[0, 3, 3, 0]} name="drift score">
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.drift > 0.3 ? '#ef4444' : d.drift > 0.15 ? '#f59e0b' : '#10b981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RecentActivityFeed() {
  const { data: alertsData, loading: alertsLoading } = useFetch<{ alerts: any[] }>(
    '/api/alerts?limit=8',
    {
      refreshInterval: 20000,
      staticFallback: () => ({ alerts: SYNTHETIC_FALLBACK.alerts }),
    }
  )
  const { data: auditData, loading: auditLoading } = useFetch<{ logs: any[] }>(
    '/api/audit?limit=8',
    {
      refreshInterval: 25000,
      staticFallback: () => ({ logs: SYNTHETIC_FALLBACK.audit }),
    }
  )

  const items: any[] = []

  if (alertsData?.alerts) {
    for (const a of alertsData.alerts) {
      items.push({
        id: `alert-${a.id}`,
        ts: new Date(a.firedAt),
        type: 'alert',
        severity: a.severity,
        title: a.title,
        description: a.description,
        status: a.status,
      })
    }
  }
  if (auditData?.logs) {
    for (const l of auditData.logs) {
      items.push({
        id: `audit-${l.id}`,
        ts: new Date(l.ts),
        type: 'audit',
        title: `${l.actor} ${l.action} ${l.resource}`,
        description: `tier ${l.tier} · ${l.result}`,
        result: l.result,
      })
    }
  }

  items.sort((a, b) => b.ts.getTime() - a.ts.getTime())
  const top = items.slice(0, 20)

  if (alertsLoading && auditLoading) {
    return <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
  }

  if (!top.length) {
    return <div className="text-xs text-muted-foreground py-8 text-center">No recent activity</div>
  }

  return (
    <ScrollArea className="h-72">
      <div className="space-y-1.5">
        {top.map(item => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-md border bg-card/50 p-2.5 text-xs hover:bg-accent/40 transition-colors"
          >
            <div className="mt-0.5">
              {item.type === 'alert' ? (
                <span className={`inline-block h-2 w-2 rounded-full ${
                  item.severity === 'critical' ? 'bg-red-500' :
                  item.severity === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                }`} />
              ) : (
                <span className={`inline-block h-2 w-2 rounded-full ${
                  item.result === 'allow' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight truncate">{item.title}</p>
              <p className="text-muted-foreground line-clamp-1 text-[10px] mt-0.5">{item.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {item.ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {item.status && <StatusPill status={item.status} />}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// ──────────────────────────────────────────────────────────────
// Static fallback: synthetic OHLCV bars for GitHub Pages mode
// ──────────────────────────────────────────────────────────────

const STATIC_OHLCV_BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20, AMZN: 178.90,
  GOOGL: 142.80, META: 487.60, SPX: 5165.30, EURUSD: 1.0856, GBPUSD: 1.2643,
  USDJPY: 149.85, US10Y: 4.275, CL: 78.45, XAU: 2158.30,
}

function generateStaticBars(symbol: string) {
  const base = STATIC_OHLCV_BASE_PRICES[symbol] || 100
  const volatility = symbol === 'TSLA' || symbol === 'NVDA' ? 0.025 : 0.012
  const bars: any[] = []
  let currentPrice = base * 0.92
  const now = Date.now()
  for (let i = 119; i >= 0; i--) {
    const ts = new Date(now - i * 60000) // 1m bars
    const open = currentPrice
    const change = (Math.random() - 0.48) * volatility * currentPrice
    const close = Math.max(currentPrice + change, base * 0.5)
    const high = Math.max(open, close) * (1 + Math.random() * 0.008)
    const low = Math.min(open, close) * (1 - Math.random() * 0.008)
    const volume = Math.floor(5000 + Math.random() * 50000)
    bars.push({
      ts: ts.toISOString(),
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume,
    })
    currentPrice = close
  }
  return bars
}
