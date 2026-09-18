'use client'

import * as React from 'react'
import { Workflow, Activity, Clock, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, StatusPill, StatCard } from '../primitives'

export function PipelinesSection() {
  const { data, loading } = useFetch<{ pipelines: any[] }>('/api/pipelines', { refreshInterval: 15000 })

  const running = data?.pipelines.filter(p => p.status === 'running').length ?? 0
  const degraded = data?.pipelines.filter(p => p.status === 'degraded').length ?? 0
  const avgLag = data ? Math.round(data.pipelines.reduce((s, p) => s + p.lagMs, 0) / data.pipelines.length) : 0
  const totalThroughput = data ? data.pipelines.reduce((s, p) => s + p.throughputMps, 0) : 0

  return (
    <>
      <SectionHeading
        title="Stream Processing Pipelines"
        description="Flink jobs across L2/L3/L4 layers. Status, throughput, lag, checkpoint health."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Running" value={running} icon={<Workflow className="h-4 w-4" />} loading={loading} />
        <StatCard label="Degraded" value={degraded} icon={<Activity className="h-4 w-4" />} loading={loading} />
        <StatCard label="Avg Lag" value={`${avgLag}ms`} icon={<Clock className="h-4 w-4" />} loading={loading} />
        <StatCard
          label="Total Throughput"
          value={`${(totalThroughput / 1_000_000).toFixed(2)}M`}
          unit="msg/s"
          icon={<Cpu className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4 h-40 bg-muted animate-pulse rounded" />
            </Card>
          ))
        ) : data?.pipelines.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{p.name}</span>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{p.stage}</Badge>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">Parallelism</div>
                  <div className="text-lg font-bold tabular-nums">{p.parallelism}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <Metric label="Throughput" value={`${(p.throughputMps / 1000).toFixed(0)}K`} unit="msg/s" />
                <Metric label="Lag" value={p.lagMs.toFixed(0)} unit="ms" />
                <Metric label="p99" value={p.p99LatencyMs.toFixed(0)} unit="ms" />
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Checkpoint duration</span>
                  <span className="tabular-nums">{p.checkpointMs.toFixed(0)}ms / 60s budget</span>
                </div>
                <Progress value={(p.checkpointMs / 60000) * 100} className="h-1.5" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Last restart: {p.lastRestartHuman}</span>
                <span>{p.incidentCount} incident{p.incidentCount === 1 ? '' : 's'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold tabular-nums">
        {value}<span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
      </div>
    </div>
  )
}
