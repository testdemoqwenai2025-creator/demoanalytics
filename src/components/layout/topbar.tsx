'use client'

import * as React from 'react'
import { Menu, Sun, Moon, Search, RefreshCw, Bell, Github } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/store'

const SECTION_LABELS: Record<string, { title: string; subtitle: string }> = {
  overview:   { title: 'Overview',           subtitle: 'KPIs, recent activity, system health' },
  datasets:   { title: 'Datasets',           subtitle: 'Lakehouse tables & schemas' },
  explorer:   { title: 'Data Explorer',      subtitle: 'Saved queries, SQL editor, results' },
  pipelines:  { title: 'Pipelines',          subtitle: 'Flink jobs, throughput, lag, checkpoints' },
  ticks:      { title: 'Tick Stream',        subtitle: 'Live tick feed and OHLCV charts' },
  models:     { title: 'ML Models',          subtitle: 'Model registry, drift, predictions' },
  alerts:     { title: 'Alerts & SLOs',       subtitle: 'SLO burn-down, recent alerts, ack flow' },
  governance: { title: 'Governance',         subtitle: 'Lineage graph, audit log, policies' },
  incidents:  { title: 'Incidents',          subtitle: 'Postmortems, action items, timeline' },
}

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)
  const active = useDashboardStore(s => s.activeSection)
  const meta = SECTION_LABELS[active] ?? SECTION_LABELS.overview

  React.useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-col leading-tight min-w-0">
        <h1 className="text-sm font-semibold truncate">{meta.title}</h1>
        <p className="text-[11px] text-muted-foreground truncate">{meta.subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search symbols, datasets, queries..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Badge variant="outline" className="hidden md:inline-flex text-[10px] gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          live
        </Badge>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex"
        >
          <Button variant="ghost" size="icon" aria-label="Repository">
            <Github className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </header>
  )
}
