'use client'

import * as React from 'react'
import { GitBranch, ShieldAlert, FileText, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, StatusPill, EmptyState } from '../primitives'

export function GovernanceSection() {
  const { data: lineage, loading: linLoading } = useFetch<{ nodes: any[]; edges: any[] }>('/api/lineage')
  const { data: audit, loading: audLoading } = useFetch<{ logs: any[] }>('/api/audit?limit=100')

  return (
    <>
      <SectionHeading
        title="Governance & Lineage"
        description="Runtime lineage graph (OpenLineage + Marquez) and audit log (OPA policy decisions)."
      />

      <Tabs defaultValue="lineage">
        <TabsList className="mb-4">
          <TabsTrigger value="lineage" className="text-xs"><GitBranch className="h-3.5 w-3.5 mr-1.5" />Lineage Graph</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs"><ShieldAlert className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="lineage">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lineage Graph</CardTitle>
              <CardDescription className="text-xs">
                {lineage?.nodes?.length || 0} nodes, {lineage?.edges?.length || 0} edges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineageGraph nodes={lineage?.nodes || []} edges={lineage?.edges || []} loading={linLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Audit Log</CardTitle>
              <CardDescription className="text-xs">
                Access decisions (allow/deny) for the last 24h
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {audLoading ? (
                  <div className="p-3 space-y-1">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}</div>
                ) : !audit?.logs?.length ? (
                  <EmptyState title="No audit entries" />
                ) : (
                  <div className="divide-y">
                    {audit.logs.map(l => (
                      <div key={l.id} className="flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors">
                        <div className="flex-shrink-0">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            l.result === 'allow' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase">Time</div>
                            <div className="font-mono tabular-nums">
                              {new Date(l.ts).toLocaleTimeString('en-US', { hour12: false })}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase">Actor</div>
                            <div className="font-mono truncate">{l.actor}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase">Action</div>
                            <div className="font-mono">{l.action}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase">Resource</div>
                            <div className="font-mono truncate">{l.resource}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase">Tier</div>
                            <div className="font-mono">{l.tier}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${
                          l.result === 'allow' ? 'border-emerald-500 text-emerald-700' : 'border-red-500 text-red-700'
                        }`}>
                          {l.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OPA Policy Samples</CardTitle>
              <CardDescription className="text-xs">Open Policy Agent rules enforcing lineage-gated access</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-[11px] font-mono bg-muted/40 p-4 rounded-md overflow-x-auto">
{`# regulator.read.ticks
allow if {
  input.subject.role == "regulator_audit"
  input.resource == "iceberg:ticks.*"
}

# desk.read.ticks (filtered by desk_id)
allow if {
  input.subject.role == "desk:" + input.subject.desk
  input.resource == "iceberg:ticks.*"
  input.row_filter == "desk_id:" + input.subject.desk
}

# desk.write.ticks (always deny — desks are read-only)
deny if {
  input.subject.role == "desk:" + input.subject.desk
  input.action == "write"
  input.resource == "iceberg:ticks.*"
}

# research.read.cold (allowed for data > 30 days old)
allow if {
  input.subject.role == "research"
  input.resource == "iceberg:ticks.*"
  input.age_days > 30
}

# research.read.hot (deny — insider trading window)
deny if {
  input.subject.role == "research"
  input.resource == "iceberg:ticks.*"
  input.age_days <= 30
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function LineageGraph({ nodes, edges, loading }: { nodes: any[]; edges: any[]; loading: boolean }) {
  if (loading) return <div className="h-96 bg-muted animate-pulse rounded" />

  // Group nodes by type for column layout
  const types = ['kafka_topic', 'flink_job', 'iceberg_table', 'trino_catalog', 'snowflake_external', 'feature_store', 'ml_model']
  const columns: Record<string, any[]> = {}
  for (const t of types) columns[t] = []
  for (const n of nodes) {
    if (!columns[n.type]) columns[n.type] = []
    columns[n.type].push(n)
  }

  const typeLabels: Record<string, string> = {
    kafka_topic: 'Kafka Topic',
    flink_job: 'Flink Job',
    iceberg_table: 'Iceberg Table',
    trino_catalog: 'Trino Catalog',
    snowflake_external: 'Snowflake',
    feature_store: 'Feature Store',
    ml_model: 'ML Model',
  }

  const typeColors: Record<string, string> = {
    kafka_topic: 'border-sky-300 bg-sky-50 dark:bg-sky-950/30',
    flink_job: 'border-violet-300 bg-violet-50 dark:bg-violet-950/30',
    iceberg_table: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
    trino_catalog: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
    snowflake_external: 'border-cyan-300 bg-cyan-50 dark:bg-cyan-950/30',
    feature_store: 'border-pink-300 bg-pink-50 dark:bg-pink-950/30',
    ml_model: 'border-orange-300 bg-orange-50 dark:bg-orange-950/30',
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-[800px]">
        {types.filter(t => columns[t]?.length).map(t => (
          <div key={t} className="flex-1 min-w-[140px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 pb-1 border-b">
              {typeLabels[t]} <span className="text-muted-foreground/60">({columns[t].length})</span>
            </div>
            <div className="space-y-1.5">
              {columns[t].map(n => {
                const inCount = edges.filter(e => e.target === n.id).length
                const outCount = edges.filter(e => e.source === n.id).length
                return (
                  <div
                    key={n.id}
                    className={`rounded-md border p-2 text-[11px] ${typeColors[n.type] || 'border-border bg-muted/40'}`}
                  >
                    <div className="font-mono font-medium leading-tight">{n.name}</div>
                    <div className="flex gap-2 mt-1 text-[9px] text-muted-foreground">
                      <span>↓ {inCount} in</span>
                      <span>↑ {outCount} out</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
