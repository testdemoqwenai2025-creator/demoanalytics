'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Activity, Database, Workflow, Brain, ShieldAlert, GitBranch,
  Code2, Bell, Home, Settings, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'

const NAV = [
  { id: 'overview',    label: 'Overview',       icon: Home,         description: 'KPIs, recent activity, system health' },
  { id: 'datasets',    label: 'Datasets',       icon: Database,     description: 'Browse lakehouse tables & schemas' },
  { id: 'explorer',    label: 'Data Explorer',  icon: Code2,        description: 'Saved queries, SQL editor, results' },
  { id: 'pipelines',   label: 'Pipelines',      icon: Workflow,     description: 'Flink jobs, throughput, lag, checkpoints' },
  { id: 'ticks',       label: 'Tick Stream',    icon: Activity,     description: 'Live tick feed, OHLCV charts' },
  { id: 'models',      label: 'ML Models',      icon: Brain,        description: 'Model registry, drift, predictions' },
  { id: 'alerts',      label: 'Alerts & SLOs',   icon: Bell,         description: 'SLO burn-down, recent alerts, ack flow' },
  { id: 'governance',  label: 'Governance',     icon: ShieldAlert,  description: 'Lineage graph, audit log, policies' },
  { id: 'incidents',   label: 'Incidents',      icon: GitBranch,    description: 'Postmortems, action items, timeline' },
] as const

export function Sidebar() {
  const active = useDashboardStore(s => s.activeSection)
  const setActive = useDashboardStore(s => s.setActiveSection)
  const sidebarOpen = useDashboardStore(s => s.sidebarOpen)
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground',
          'transition-transform duration-200 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
            M
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">MERIDIAN</span>
            <span className="text-[10px] text-muted-foreground">Data Analyst Template</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-2 overflow-y-auto h-[calc(100vh-3.5rem-3rem)]">
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  'group flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/60'
                )}
              >
                <Icon className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium leading-tight">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                </div>
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
              </button>
            )
          })}
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-3.5 w-3.5" />
            <span>v1.0 · synthetic data</span>
          </div>
        </div>
      </aside>
    </>
  )
}
