'use client'

import * as React from 'react'
import { Menu, Sun, Moon, Search, Bell, Github, Home as HomeIcon, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore, type PageId } from '@/lib/store'
import { cn } from '@/lib/utils'

const PAGE_LABELS: Record<PageId, { title: string; subtitle: string }> = {
  home:       { title: 'Home',          subtitle: 'Welcome to MERIDIAN' },
  dashboard:  { title: 'Dashboard',     subtitle: 'Synthetic tick lakehouse &mdash; 9 sections' },
  markets:    { title: 'Live Markets', subtitle: 'Crypto &middot; FX &middot; Equities &mdash; free public APIs' },
  automate:   { title: 'Automation',   subtitle: 'Rules &amp; scheduled jobs' },
  about:      { title: 'About',        subtitle: 'Project, privacy &amp; GDPR' },
  docs:       { title: 'Documentation',subtitle: 'Quick reference' },
  login:      { title: 'Login',        subtitle: 'Mock authentication &mdash; nothing is stored' },
}

const SEARCH_ITEMS: { label: string; page: PageId; description: string }[] = [
  { label: 'Dashboard Overview', page: 'dashboard', description: 'KPIs, recent activity, system health' },
  { label: 'Datasets',          page: 'dashboard', description: 'Lakehouse tables &amp; schemas' },
  { label: 'Data Explorer',     page: 'dashboard', description: 'Saved queries, SQL editor' },
  { label: 'Pipelines',         page: 'dashboard', description: 'Flink jobs, throughput, lag' },
  { label: 'Tick Stream',       page: 'dashboard', description: 'OHLCV charts' },
  { label: 'ML Models',         page: 'dashboard', description: 'Registry, drift, predictions' },
  { label: 'Alerts & SLOs',     page: 'dashboard', description: 'Burn-down, ack/resolve' },
  { label: 'Governance',        page: 'dashboard', description: 'Lineage graph, audit log' },
  { label: 'Incidents',         page: 'dashboard', description: 'Postmortems' },
  { label: 'Live Markets',      page: 'markets',   description: 'Crypto, FX, equities' },
  { label: 'Automation Rules',  page: 'automate',  description: 'Rules & scheduled jobs' },
  { label: 'About',             page: 'about',     description: 'Project & privacy notice' },
  { label: 'Documentation',     page: 'docs',      description: 'Quick reference' },
  { label: 'Login',             page: 'login',     description: 'Mock auth form' },
]

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)
  const activePage = useDashboardStore(s => s.activePage)
  const setActivePage = useDashboardStore(s => s.setActivePage)
  const setActiveSection = useDashboardStore(s => s.setActiveSection)
  const meta = PAGE_LABELS[activePage] ?? PAGE_LABELS.home

  // Search
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const searchRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
    }
  }, [searchOpen])

  // Keyboard shortcut: Cmd/Ctrl + K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchClick = (item: typeof SEARCH_ITEMS[number]) => {
    setActivePage(item.page)
    // If dashboard item, also set section
    const sectionMap: Record<string, string> = {
      'Dashboard Overview': 'overview',
      'Datasets': 'datasets',
      'Data Explorer': 'explorer',
      'Pipelines': 'pipelines',
      'Tick Stream': 'ticks',
      'ML Models': 'models',
      'Alerts & SLOs': 'alerts',
      'Governance': 'governance',
      'Incidents': 'incidents',
    }
    const section = sectionMap[item.label]
    if (section) setActiveSection(section as any)
    setSearchOpen(false)
  }

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

      {/* Home button - always visible */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage('home')}
        className="gap-1.5 px-2"
        aria-label="Return to home"
      >
        <HomeIcon className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Home</span>
      </Button>

      <div className="flex flex-col leading-tight min-w-0">
        <h1 className="text-sm font-semibold truncate">{meta.title}</h1>
        <p
          className="text-[11px] text-muted-foreground truncate"
          dangerouslySetInnerHTML={{ __html: meta.subtitle }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          {searchOpen ? (
            <div className="fixed md:absolute inset-x-0 md:inset-auto top-14 md:top-auto md:right-0 md:w-96 z-50 p-2 md:p-0">
              <div className="rounded-md border bg-popover shadow-lg">
                <div className="flex items-center gap-2 p-2 border-b">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search pages, sections, datasets..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-1">
                  {filteredItems.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No matches found
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <button
                        key={item.label}
                        onClick={() => handleSearchClick(item)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors group"
                      >
                        <div className="text-sm font-medium">{item.label}</div>
                        <div
                          className="text-[10px] text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t px-3 py-1.5 text-[10px] text-muted-foreground flex justify-between">
                  <span>↑↓ navigate</span>
                  <span>esc to close</span>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-xs">Search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-mono bg-muted rounded border">
                ⌘K
              </kbd>
            </Button>
          )}
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
