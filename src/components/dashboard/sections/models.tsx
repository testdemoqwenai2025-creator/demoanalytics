'use client'

import * as React from 'react'
import { Brain, TrendingUp, AlertCircle, Boxes } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, StatusPill, StatCard, EmptyState } from '../primitives'
import { ModelDriftChart } from '../charts'

export function ModelsSection() {
  const { data, loading } = useFetch<{ models: any[] }>('/api/ml-models', { refreshInterval: 30000 })
  const { data: predData, loading: predLoading } = useFetch<{ predictions: any[] }>('/api/predictions?limit=50')

  const production = data?.models.filter(m => m.status === 'production').length ?? 0
  const shadow = data?.models.filter(m => m.status === 'shadow').length ?? 0
  const driftCritical = data?.models.filter(m => m.driftScore > 0.3).length ?? 0

  return (
    <>
      <SectionHeading
        title="ML Model Registry"
        description="Production and shadow models, drift monitoring, recent predictions."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Production" value={production} icon={<Brain className="h-4 w-4" />} loading={loading} />
        <StatCard label="Shadow" value={shadow} icon={<Boxes className="h-4 w-4" />} loading={loading} />
        <StatCard label="Drift Critical" value={driftCritical} icon={<AlertCircle className="h-4 w-4" />} loading={loading} />
        <StatCard label="Total Predictions" value={predData?.predictions.length ?? 0} icon={<TrendingUp className="h-4 w-4" />} loading={predLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Model Drift Score</CardTitle>
            <CardDescription className="text-xs">Threshold: warning 0.15, critical 0.30</CardDescription>
          </CardHeader>
          <CardContent>
            <ModelDriftChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Predictions</CardTitle>
            <CardDescription className="text-xs">Last 50 model outputs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[256px]">
              {predLoading ? (
                <div className="space-y-1">{[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}</div>
              ) : !predData?.predictions?.length ? (
                <EmptyState title="No predictions" />
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="text-[10px]">Time</TableHead>
                      <TableHead className="text-[10px]">Model</TableHead>
                      <TableHead className="text-[10px]">Symbol</TableHead>
                      <TableHead className="text-[10px] text-right">Score</TableHead>
                      <TableHead className="text-[10px]">Label</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predData.predictions.map(p => (
                      <TableRow key={p.id} className="hover:bg-accent/40">
                        <TableCell className="text-[10px] font-mono tabular-nums">
                          {new Date(p.ts).toLocaleTimeString('en-US', { hour12: false })}
                        </TableCell>
                        <TableCell className="text-[10px] truncate max-w-[120px]">{p.model}</TableCell>
                        <TableCell className="text-[10px] font-mono">{p.symbol || '—'}</TableCell>
                        <TableCell className="text-[10px] font-mono tabular-nums text-right">
                          {p.score.toFixed(3)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] ${
                            p.label === 'spoofing' ? 'border-red-500 text-red-700' :
                            p.label === 'latency_arb' ? 'border-amber-500 text-amber-700' :
                            'border-emerald-500 text-emerald-700'
                          }`}>
                            {p.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">All Models</CardTitle>
          <CardDescription className="text-xs">Full registry including retired</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="text-[11px]">Name</TableHead>
                  <TableHead className="text-[11px]">Version</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Framework</TableHead>
                  <TableHead className="text-[11px] text-right">Accuracy</TableHead>
                  <TableHead className="text-[11px] text-right">p99 (ms)</TableHead>
                  <TableHead className="text-[11px] text-right">Drift</TableHead>
                  <TableHead className="text-[11px] text-right">Predictions</TableHead>
                  <TableHead className="text-[11px]">Deployed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9}><EmptyState title="Loading..." /></TableCell></TableRow>
                ) : data?.models.map(m => (
                  <TableRow key={m.id} className="hover:bg-accent/40">
                    <TableCell className="text-xs font-medium">{m.name}</TableCell>
                    <TableCell className="text-xs font-mono">{m.version}</TableCell>
                    <TableCell><StatusPill status={m.status} /></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{m.framework}</Badge></TableCell>
                    <TableCell className="text-xs font-mono tabular-nums text-right">
                      {m.accuracy ? (m.accuracy * 100).toFixed(1) + '%' : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums text-right">{m.p99InferenceMs}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={m.driftScore * 100 / 0.5}
                          className="h-1.5 w-16"
                        />
                        <span className={`text-xs font-mono tabular-nums ${
                          m.driftScore > 0.3 ? 'text-red-600' :
                          m.driftScore > 0.15 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {m.driftScore.toFixed(3)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums text-right">{m.predictionCount}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {new Date(m.deployedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
