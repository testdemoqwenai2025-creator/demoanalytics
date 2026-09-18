'use client'

import * as React from 'react'
import { TrendingUp, Crosshair, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { SectionHeading, StatCard } from '@/components/dashboard/primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, ReferenceArea, Legend,
} from 'recharts'
import { toast } from 'sonner'

// Generate synthetic time-series data for multiple symbols
function generateSeriesData() {
  const pipelines = SYNTHETIC_FALLBACK.pipelines
  const baseTime = Date.now() - 60 * 60 * 1000  // 1 hour ago

  return Array.from({ length: 60 }, (_, i) => {
    const point: any = { time: new Date(baseTime + i * 60_000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    pipelines.forEach((p, idx) => {
      const baseLag = p.lagMs
      const noise = (Math.random() - 0.5) * 40
      const trend = i > 40 && p.status === 'degraded' ? (i - 40) * 5 : 0  // degradation after 40 min
      point[p.name] = Math.max(50, Math.round(baseLag + noise + trend))
    })
    return point
  })
}

const ANNOTATIONS = [
  {
    id: 'incident-start',
    time: 40,  // index in the data array
    label: 'Aggregate checkpoint storm',
    color: '#ef4444',
    type: 'line' as const,
  },
  {
    id: 'degradation-window',
    startTime: 40,
    endTime: 55,
    label: 'Degradation window',
    color: '#f59e0b',
    type: 'area' as const,
  },
  {
    id: 'recovery',
    time: 55,
    label: 'Auto-recovery',
    color: '#10b981',
    type: 'line' as const,
  },
]

export function ChartsPage() {
  const [data, setData] = React.useState(generateSeriesData)
  const [crosshairSync, setCrosshairSync] = React.useState(true)
  const [showAnnotations, setShowAnnotations] = React.useState(true)
  const [visibleSeries, setVisibleSeries] = React.useState<Set<string>>(
    new Set(SYNTHETIC_FALLBACK.pipelines.slice(0, 4).map(p => p.name))
  )

  const pipelines = SYNTHETIC_FALLBACK.pipelines.slice(0, 4)
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']

  const toggleSeries = (name: string) => {
    setVisibleSeries(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const refresh = () => {
    setData(generateSeriesData())
    toast.success('Chart data refreshed')
  }

  return (
    <>
      <SectionHeading
        title="Chart Annotations & Crosshair Sync"
        description="Hover any chart to sync the crosshair across all charts. Toggle series visibility and event annotations."
        action={
          <Button size="sm" variant="outline" onClick={refresh}>
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh Data
          </Button>
        }
      />

      {/* Controls */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            <Switch checked={crosshairSync} onCheckedChange={setCrosshairSync} id="crosshair" />
            <Label htmlFor="crosshair" className="text-xs">Crosshair sync</Label>
          </div>
          <div className="flex items-center gap-2">
            {showAnnotations ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} id="annotations" />
            <Label htmlFor="annotations" className="text-xs">Show annotations</Label>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Series:</span>
            {pipelines.map((p, i) => (
              <button
                key={p.name}
                onClick={() => toggleSeries(p.name)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                  visibleSeries.has(p.name) ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
                style={{ borderLeft: `3px solid ${colors[i]}` }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Data Points" value={data.length * pipelines.length} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Visible Series" value={visibleSeries.size} />
        <StatCard label="Annotations" value={showAnnotations ? ANNOTATIONS.length : 0} />
        <StatCard label="Sync Mode" value={crosshairSync ? 'On' : 'Off'} />
      </div>

      {/* Main chart (with annotations) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crosshair className="h-4 w-4" /> Pipeline Lag — Synchronized View
          </CardTitle>
          <CardDescription className="text-xs">
            Hover to see crosshair sync. Annotations mark incident start, degradation window, and recovery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} syncId={crosshairSync ? 'pipeline-charts' : undefined} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Lag (ms)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
                formatter={(v: any) => [`${v} ms`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />

              {showAnnotations && ANNOTATIONS.filter(a => a.type === 'line').map(ann => (
                <ReferenceLine
                  key={ann.id}
                  x={data[ann.time!]?.time}
                  stroke={ann.color}
                  strokeDasharray="4 2"
                  label={{ value: ann.label, fontSize: 9, fill: ann.color, position: 'top' }}
                />
              ))}

              {showAnnotations && ANNOTATIONS.filter(a => a.type === 'area').map(ann => (
                <ReferenceArea
                  key={ann.id}
                  x1={data[ann.startTime!]?.time}
                  x2={data[ann.endTime!]?.time}
                  fill={ann.color}
                  fillOpacity={0.1}
                  label={{ value: ann.label, fontSize: 9, fill: ann.color, position: 'insideTop' }}
                />
              ))}

              {pipelines.map((p, i) => visibleSeries.has(p.name) && (
                <Line
                  key={p.name}
                  type="monotone"
                  dataKey={p.name}
                  stroke={colors[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two smaller synchronized charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Throughput (synced)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} syncId={crosshairSync ? 'pipeline-charts' : undefined} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                {pipelines.map((p, i) => visibleSeries.has(p.name) && (
                  <Line key={p.name} type="monotone" dataKey={p.name} stroke={colors[i]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">p99 Latency (synced)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} syncId={crosshairSync ? 'pipeline-charts' : undefined} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                {showAnnotations && (
                  <ReferenceLine y={250} stroke="#ef4444" strokeDasharray="4 2"
                    label={{ value: 'SLO 250ms', fontSize: 9, fill: '#ef4444', position: 'right' }} />
                )}
                {pipelines.map((p, i) => visibleSeries.has(p.name) && (
                  <Line key={p.name} type="monotone" dataKey={p.name} stroke={colors[i]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Annotations legend */}
      {showAnnotations && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Annotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ANNOTATIONS.map(ann => (
                <div key={ann.id} className="flex items-center gap-3 text-xs">
                  <div className="w-4 h-0.5" style={{ backgroundColor: ann.color }} />
                  <span className="font-medium">{ann.label}</span>
                  <Badge variant="outline" className="text-[9px]">{ann.type}</Badge>
                  <span className="text-muted-foreground">
                    {ann.type === 'line' ? `at ${data[ann.time!]?.time}` : `${data[ann.startTime!]?.time} → ${data[ann.endTime!]?.time}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
