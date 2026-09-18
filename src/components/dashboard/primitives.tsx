'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: { value: string; positive?: boolean } | null
  icon?: React.ReactNode
  hint?: string
  loading?: boolean
}

export function StatCard({ label, value, unit, delta, icon, hint, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            {hint && <span className="text-[10px] text-muted-foreground mt-0.5">{hint}</span>}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {delta && (
          <div className={cn(
            'mt-2 text-[11px] font-medium flex items-center gap-1',
            delta.positive === false ? 'text-destructive' : 'text-emerald-600'
          )}>
            {delta.positive === false ? '↓' : '↑'} {delta.value}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SectionHeadingProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeading({ title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface StatusPillProps {
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  degraded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  stopped: 'bg-muted text-muted-foreground',
  production: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  shadow: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  retired: 'bg-muted text-muted-foreground',
  firing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  acked: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  mitigated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  allow: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  deny: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  hot: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  warm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cold: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  archive: 'bg-muted text-muted-foreground',
}

export function StatusPill({ status }: StatusPillProps) {
  const cls = STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide',
      cls
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}
