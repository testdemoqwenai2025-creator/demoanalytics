'use client'

import * as React from 'react'
import { Zap, Plus, Clock, Bell, GitBranch, Play, Pause, Settings2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDashboardStore } from '@/lib/store'
import { SectionHeading, StatusPill, StatCard, EmptyState } from '@/components/dashboard/primitives'
import { toast } from 'sonner'

interface Rule {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  lastFired: string
  firedCount: number
}

const SEED_RULES: Rule[] = [
  {
    id: 'r1', name: 'Tier-1 SLO breach → page on-call',
    trigger: 'When slo.tier-1.burn_rate_1h > 2',
    action: 'Send PagerDuty + open incident',
    enabled: true, lastFired: '3h ago', firedCount: 2,
  },
  {
    id: 'r2', name: 'Flink checkpoint storm → pause compaction',
    trigger: 'When flink.checkpoint.duration > 40s',
    action: 'Pause iceberg.compaction job + ack alert',
    enabled: true, lastFired: '14d ago', firedCount: 1,
  },
  {
    id: 'r3', name: 'Spoofing score > 0.9 → notify compliance',
    trigger: 'When ml.spoofing.score > 0.9',
    action: 'Email compliance@ + create audit entry',
    enabled: true, lastFired: '47m ago', firedCount: 8,
  },
  {
    id: 'r4', name: 'Kafka consumer lag growing → scale up',
    trigger: 'When kafka.consumer.lag > 30s for 5m',
    action: 'Increase consumer parallelism by 2',
    enabled: true, lastFired: '2d ago', firedCount: 5,
  },
  {
    id: 'r5', name: 'Schema violation > 0.5% → freeze feature deploys',
    trigger: 'When schema_registry.violation_rate > 0.5%',
    action: 'Block CI merges + page platform owner',
    enabled: true, lastFired: '8d ago', firedCount: 1,
  },
  {
    id: 'r6', name: 'Cross-region lag > 5s → reroute reads',
    trigger: 'When mm2.cross_region.lag > 5s',
    action: 'Switch serving to standby region',
    enabled: false, lastFired: 'never', firedCount: 0,
  },
]

interface ScheduledJob {
  id: string
  name: string
  schedule: string
  nextRun: string
  lastStatus: 'success' | 'failed' | 'running' | 'pending'
  durationMs: number
}

const SEED_JOBS: ScheduledJob[] = [
  { id: 'j1', name: 'Nightly reconciliation (kdb+ vs MERIDIAN)', schedule: '0 02 * * *', nextRun: 'in 8h 12m', lastStatus: 'success', durationMs: 482_000 },
  { id: 'j2', name: 'Iceberg compaction (ticks.normalized)', schedule: '*/5 * * * *', nextRun: 'in 2m 41s', lastStatus: 'success', durationMs: 12_400 },
  { id: 'j3', name: 'ML drift report', schedule: '0 9 * * MON', nextRun: 'in 3d 14h', lastStatus: 'success', durationMs: 8_200 },
  { id: 'j4', name: 'Audit log archive to Glacier', schedule: '0 4 * * SUN', nextRun: 'in 5d 22h', lastStatus: 'success', durationMs: 142_000 },
  { id: 'j5', name: 'Regulator lineage export (MiFID II)', schedule: '0 0 1 * *', nextRun: 'in 12d 8h', lastStatus: 'success', durationMs: 1_240_000 },
  { id: 'j6', name: 'Cost & FinOps daily report', schedule: '30 6 * * *', nextRun: 'in 18h 2m', lastStatus: 'failed', durationMs: 0 },
  { id: 'j7', name: 'Feature materialization (online store)', schedule: '*/1 * * * *', nextRun: 'in 38s', lastStatus: 'running', durationMs: 0 },
]

export function AutomatePage() {
  const [rules, setRules] = React.useState<Rule[]>(SEED_RULES)
  const [jobs] = React.useState<ScheduledJob[]>(SEED_JOBS)

  const toggleRule = (id: string) => {
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    const r = rules.find(x => x.id === id)
    if (r) toast.success(`Rule ${r.enabled ? 'disabled' : 'enabled'}`, { description: r.name })
  }
  const deleteRule = (id: string) => {
    setRules(rs => rs.filter(r => r.id !== id))
    toast.success('Rule deleted')
  }

  const enabledCount = rules.filter(r => r.enabled).length
  const jobSuccess = jobs.filter(j => j.lastStatus === 'success').length
  const jobFailed = jobs.filter(j => j.lastStatus === 'failed').length

  return (
    <>
      <SectionHeading
        title="Automation Rules & Scheduled Jobs"
        description="Visual rule builder, scheduled jobs, alert routing. All mock &mdash; no actions are actually executed."
        action={
          <Button size="sm" onClick={() => toast.info('Rule builder is a stub in the mock template.')}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Rule
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Rules" value={`${enabledCount}/${rules.length}`} icon={<Zap className="h-4 w-4" />} />
        <StatCard label="Scheduled Jobs" value={jobs.length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Successful (last run)" value={jobSuccess} icon={<GitBranch className="h-4 w-4" />} />
        <StatCard label="Failed (last run)" value={jobFailed} icon={<Bell className="h-4 w-4 text-red-500" />} />
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="jobs">Scheduled Jobs</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {rules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium">{rule.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-mono">{rule.trigger}</span>
                      </p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                      aria-label="Toggle rule"
                    />
                  </div>

                  <div className="rounded-md bg-muted/40 p-2 text-xs">
                    <span className="text-muted-foreground">Action:</span>{' '}
                    <span className="font-medium">{rule.action}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                    <span>Last fired: {rule.lastFired}</span>
                    <span>Fired count: <span className="font-mono tabular-nums">{rule.firedCount}</span></span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteRule(rule.id)}
                      aria-label="Delete rule"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="text-xs">Job</TableHead>
                      <TableHead className="text-xs">Schedule</TableHead>
                      <TableHead className="text-xs">Next run</TableHead>
                      <TableHead className="text-xs">Last status</TableHead>
                      <TableHead className="text-xs text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map(job => (
                      <TableRow key={job.id}>
                        <TableCell className="text-xs font-medium">{job.name}</TableCell>
                        <TableCell>
                          <code className="text-[10px] bg-muted/40 px-1.5 py-0.5 rounded">{job.schedule}</code>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">{job.nextRun}</TableCell>
                        <TableCell><StatusPill status={job.lastStatus} /></TableCell>
                        <TableCell className="text-xs font-mono tabular-nums text-right">
                          {job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent rule firings</CardTitle>
              <CardDescription className="text-xs">Last 24 hours of automation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No firings in the last 24h"
                description="Rules will appear here as they trigger."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
