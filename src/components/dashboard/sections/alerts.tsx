'use client'

import * as React from 'react'
import { Check, Bell, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, StatusPill, EmptyState } from '../primitives'
import { toast } from 'sonner'

export function AlertsSection() {
  const { data: sloData, loading: sloLoading } = useFetch<{ slos: any[] }>('/api/slos', { refreshInterval: 30000 })
  const { data: alertData, loading: alertLoading } = useFetch<{ alerts: any[] }>('/api/alerts', { refreshInterval: 15000 })

  const ackAlert = async (id: string) => {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'ack', ackedBy: 'analyst.template@meridian' }),
    })
    if (res.ok) toast.success('Alert acknowledged')
  }
  const resolveAlert = async (id: string) => {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'resolve' }),
    })
    if (res.ok) toast.success('Alert resolved')
  }

  return (
    <>
      <SectionHeading
        title="Alerts & SLO Burn-Down"
        description="Error budget consumption, live alert feed, ack/resolve workflow."
      />

      {/* SLO cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sloLoading ? (
          [1,2,3].map(i => (
            <Card key={i}>
              <CardContent className="p-4 h-32 bg-muted animate-pulse rounded" />
            </Card>
          ))
        ) : (sloData?.slos || []).map(slo => {
          const pct = Math.round(slo.budgetConsumedPct)
          const barColor = pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
          return (
            <Card key={slo.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">{slo.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{slo.tier}</p>
                  </div>
                  <StatusPill status={slo.healthStatus} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-mono tabular-nums font-semibold">{slo.availabilityPct}%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">p99 latency</span>
                    <span className="font-mono tabular-nums">{slo.p99LatencyMs}ms</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Error budget (30d)</span>
                    <span className="font-mono tabular-nums">{slo.errorBudgetMin} min</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Budget consumed</span>
                    <span className="font-mono tabular-nums font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>1h burn: {slo.burnRate1h.toFixed(2)}x</span>
                    <span>24h burn: {slo.burnRate24h.toFixed(2)}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Live Alert Feed</CardTitle>
          <CardDescription className="text-xs">Sorted by fired-at, most recent first</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-3 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="firing" className="text-xs">Firing</TabsTrigger>
              <TabsTrigger value="acked" className="text-xs">Acked</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
            </TabsList>

            {['all', 'firing', 'acked', 'resolved'].map(tab => {
              const alerts = (alertData?.alerts || []).filter(a => tab === 'all' || a.status === tab)
              return (
                <TabsContent key={tab} value={tab}>
                  <ScrollArea className="h-[400px]">
                    {alertLoading ? (
                      <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div>
                    ) : alerts.length === 0 ? (
                      <EmptyState title={`No ${tab} alerts`} />
                    ) : (
                      <div className="space-y-2">
                        {alerts.map(a => (
                          <div key={a.id} className="rounded-md border p-3 hover:bg-accent/40 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {a.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                                 a.severity === 'warning' ? <Bell className="h-4 w-4 text-amber-500" /> :
                                 <ShieldCheck className="h-4 w-4 text-sky-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">{a.title}</span>
                                  <StatusPill status={a.status} />
                                  <Badge variant="outline" className="text-[9px]">{a.tier}</Badge>
                                  <Badge variant="outline" className="text-[9px]">{a.source}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                  <span>fired {a.ageMin}m ago</span>
                                  {a.ackedBy && <span>acked by {a.ackedBy}</span>}
                                </div>
                              </div>
                              {a.status === 'firing' && (
                                <div className="flex flex-col gap-1 shrink-0">
                                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => ackAlert(a.id)}>
                                    <Check className="h-3 w-3 mr-1" /> Ack
                                  </Button>
                                </div>
                              )}
                              {a.status === 'acked' && (
                                <Button size="sm" variant="outline" className="h-7 text-[11px] shrink-0" onClick={() => resolveAlert(a.id)}>
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
