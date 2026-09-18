'use client'

import * as React from 'react'
import { BarChart3, CandlestickChart, Grid3x3, PieChart, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionHeading, StatCard } from '@/components/dashboard/primitives'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, Treemap, PieChart as RechartsPieChart, Pie, Legend, ReferenceLine,
} from 'recharts'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'

// Generate candlestick data from pipeline latencies
function generateCandlestickData() {
  return SYNTHETIC_FALLBACK.pipelines.slice(0, 8).map(p => {
    const base = p.p99LatencyMs
    const variance = base * 0.15
    return {
      name: p.name,
      open: Math.round(base - variance * 0.5),
      high: Math.round(base + variance),
      low: Math.round(base - variance),
      close: Math.round(base + variance * 0.3),
    }
  })
}

// Heatmap data: pipeline x metric
function generateHeatmapData() {
  const metrics = ['Lag', 'p99', 'Checkpoint', 'Throughput']
  const maxValues = [400, 500, 100, 2200000]
  return SYNTHETIC_FALLBACK.pipelines.slice(0, 5).map(p => ({
    name: p.name,
    cells: metrics.map((m, i) => ({
      metric: m,
      value: i === 3 ? p.throughputMps / maxValues[i] : [p.lagMs, p.p99LatencyMs, p.checkpointMs][i] / maxValues[i],
      raw: i === 3 ? `${(p.throughputMps / 1e6).toFixed(1)}M` : `${[p.lagMs, p.p99LatencyMs, p.checkpointMs][i].toFixed(0)}ms`,
    })),
  }))
}

// Treemap data: dataset sizes
function generateTreemapData() {
  return SYNTHETIC_FALLBACK.datasets.slice(0, 8).map(d => ({
    name: d.name.split('.')[0],
    size: d.sizeBytes,
    tier: d.tier,
  }))
}

// Pie data: alert severity distribution
function generatePieData() {
  const counts = SYNTHETIC_FALLBACK.alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

const HEAT_COLORS = ['#10b981', '#84cc16', '#f59e0b', '#ef4444']

function getHeatColor(value: number): string {
  if (value < 0.25) return HEAT_COLORS[0]
  if (value < 0.5) return HEAT_COLORS[1]
  if (value < 0.75) return HEAT_COLORS[2]
  return HEAT_COLORS[3]
}

export function ChartsAdvancedPage() {
  const [chartType, setChartType] = React.useState<'candlestick' | 'heatmap' | 'treemap' | 'pie'>('candlestick')
  const candleData = React.useMemo(() => generateCandlestickData(), [])
  const heatmapData = React.useMemo(() => generateHeatmapData(), [])
  const treemapData = React.useMemo(() => generateTreemapData(), [])
  const pieData = React.useMemo(() => generatePieData(), [])

  return (
    <>
      <SectionHeading
        title="Advanced Charts"
        description="Candlestick, heatmap, treemap, and donut charts — beyond the standard line/bar/area charts."
      />

      {/* Chart type selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chart type selector">
        {([
          { id: 'candlestick', label: 'Candlestick', icon: CandlestickChart },
          { id: 'heatmap', label: 'Heatmap', icon: Grid3x3 },
          { id: 'treemap', label: 'Treemap', icon: BarChart3 },
          { id: 'pie', label: 'Donut', icon: PieChart },
        ] as const).map(ct => {
          const Icon = ct.icon
          return (
            <Button
              key={ct.id}
              size="sm"
              variant={chartType === ct.id ? 'default' : 'outline'}
              onClick={() => setChartType(ct.id)}
              role="tab"
              aria-selected={chartType === ct.id}
              aria-label={`${ct.label} chart`}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">{ct.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Candlestick chart */}
      {chartType === 'candlestick' && (
        <Card role="img" aria-label="Candlestick chart showing pipeline latency OHLC">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline Latency — Candlestick (OHLC)</CardTitle>
            <CardDescription className="text-xs">
              Open/High/Low/Close bars. Green = close above open (improving), Red = close below open (degrading).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={candleData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                {/* High-Low bars */}
                <Bar dataKey="high" fill="transparent" stackId="ohlc" />
                <Bar dataKey="low" fill="transparent" stackId="ohlc" />
                {/* Open-Close bars (colored) */}
                {candleData.map((d, i) => (
                  <ReferenceLine
                    key={i}
                    x={d.name}
                    stroke={d.close >= d.open ? '#10b981' : '#ef4444'}
                    strokeWidth={6}
                    segment={[{ x: d.name, y: d.open }, { x: d.name, y: d.close }]}
                  />
                ))}
                <Line type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Close" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Heatmap */}
      {chartType === 'heatmap' && (
        <Card role="img" aria-label="Heatmap showing pipeline metrics by severity">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline Metrics Heatmap</CardTitle>
            <CardDescription className="text-xs">
              Each cell shows a metric value normalized 0-1. Color: green (good) → yellow → orange → red (critical).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" aria-label="Pipeline metrics heatmap">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium">Pipeline</th>
                    {['Lag', 'p99 Latency', 'Checkpoint', 'Throughput'].map(m => (
                      <th key={m} className="text-center p-2 font-medium">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map(row => (
                    <tr key={row.name}>
                      <td className="p-2 font-mono text-xs font-medium">{row.name}</td>
                      {row.cells.map((cell, i) => (
                        <td key={i} className="p-1">
                          <div
                            className="rounded-md p-2 text-center text-[10px] font-mono font-bold text-white"
                            style={{ backgroundColor: getHeatColor(cell.value) }}
                            title={`${cell.metric}: ${cell.raw}`}
                            aria-label={`${row.name} ${cell.metric}: ${cell.raw}`}
                          >
                            {cell.raw}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground" aria-label="Heatmap legend">
              <span>Low</span>
              {HEAT_COLORS.map((c, i) => (
                <div key={i} className="h-3 w-8 rounded" style={{ backgroundColor: c }} />
              ))}
              <span>High</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treemap */}
      {chartType === 'treemap' && (
        <Card role="img" aria-label="Treemap showing dataset sizes">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dataset Size Treemap</CardTitle>
            <CardDescription className="text-xs">
              Rectangle area = dataset size. Color = storage tier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#fff"
                content={<TreemapCell />}
              />
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-3 mt-3 text-[10px]" aria-label="Treemap legend">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-400" /> Hot</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400" /> Warm</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-400" /> Cold</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> Archive</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donut */}
      {chartType === 'pie' && (
        <Card role="img" aria-label="Donut chart showing alert severity distribution">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alert Severity Distribution (Donut)</CardTitle>
            <CardDescription className="text-xs">
              Proportion of alerts by severity level. Inner label shows total count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444', '#f59e0b', '#0ea5e9'][i % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Accessibility note */}
      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Accessibility:</strong> All charts have ARIA labels
          (<code className="bg-muted px-1 rounded font-mono text-[10px]">role="img"</code> +
          <code className="bg-muted px-1 rounded font-mono text-[10px]">aria-label</code>). The heatmap
          uses a proper table structure for screen readers. Chart type buttons have
          <code className="bg-muted px-1 rounded font-mono text-[10px]">role="tab"</code> and
          <code className="bg-muted px-1 rounded font-mono text-[10px]">aria-selected</code>.
          Color is never the sole indicator — values are shown in each cell.
        </CardContent>
      </Card>
    </>
  )
}

// Custom treemap cell
function TreemapCell(props: any) {
  const { x, y, width, height, name, tier } = props
  if (width < 30 || height < 20) return null

  const tierColors: Record<string, string> = {
    hot: '#fb923c',
    warm: '#fbbf24',
    cold: '#38bdf8',
    archive: '#94a3b8',
  }
  const fill = tierColors[tier] || '#94a3b8'

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.8} stroke="#fff" strokeWidth={2} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight="bold" fill="#fff">
          {String(name).slice(0, 12)}
        </text>
      )}
    </g>
  )
}
