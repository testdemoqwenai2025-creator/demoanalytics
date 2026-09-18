'use client'

import * as React from 'react'
import { AlertOctagon, CheckCircle2, Clock, GitBranch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFetch } from '@/hooks/use-fetch'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { SectionHeading, StatusPill, EmptyState } from '../primitives'

export function IncidentsSection() {
  const { data, loading } = useFetch<{ incidents: any[] }>(
    '/api/incidents',
    { staticFallback: () => ({ incidents: SYNTHETIC_FALLBACK.incidents }) }
  )

  return (
    <>
      <SectionHeading
        title="Incidents & Postmortems"
        description="Sev1/2/3 incidents with root cause and action items. Blameless, structured, 14-day SLA."
      />

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => (
            <Card key={i}>
              <CardContent className="p-4 h-48 bg-muted animate-pulse rounded" />
            </Card>
          ))
        ) : !data?.incidents?.length ? (
          <EmptyState title="No incidents on record" description="All clear." />
        ) : data.incidents.map(inc => (
          <Card key={inc.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="mt-1">
                  {inc.severity === 'sev1' ? <AlertOctagon className="h-5 w-5 text-red-500" /> :
                   inc.severity === 'sev2' ? <AlertOctagon className="h-5 w-5 text-amber-500" /> :
                   <GitBranch className="h-5 w-5 text-sky-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold">{inc.title}</h3>
                    <Badge variant="outline" className="text-[10px] uppercase">{inc.severity}</Badge>
                    <StatusPill status={inc.status} />
                    {inc.pipelineName && (
                      <Badge variant="outline" className="text-[10px]">{inc.pipelineName}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Started {new Date(inc.startedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {inc.resolvedAt && (
                      <span>Resolved {new Date(inc.resolvedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    )}
                    {inc.durationHuman && (
                      <Badge variant="outline" className="text-[10px]">{inc.durationHuman} duration</Badge>
                    )}
                  </div>
                </div>
              </div>

              {inc.rootCause && (
                <div className="rounded-md border bg-muted/40 p-3 mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Root cause</div>
                  <p className="text-xs leading-relaxed">{inc.rootCause}</p>
                </div>
              )}

              {inc.actionItems && (
                <div className="rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Action items
                  </div>
                  <p className="text-xs leading-relaxed">{inc.actionItems}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
