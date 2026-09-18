'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sun, Moon, Search, Bell, Github, Home as HomeIcon, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const PAGE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Home',          subtitle: 'Welcome to MERIDIAN' },
  '/dashboard':     { title: 'Dashboard',     subtitle: 'Synthetic tick lakehouse — 9 sections' },
  '/layouts':      { title: 'Saved Layouts', subtitle: 'Custom dashboard layouts' },
  '/markets':       { title: 'Live Markets',  subtitle: 'Crypto · FX · Equities — free public APIs' },
  '/live':           { title: 'Live Updates',  subtitle: 'WebSocket tick streaming' },
  '/news':          { title: 'News Feeds',    subtitle: 'RSS from 10 financial + tech sources' },
  '/files':         { title: 'Files',          subtitle: 'Upload, preview, and download data' },
  '/exports':       { title: 'Data Export',   subtitle: 'Excel, PDF, CSV, JSON export' },
  '/query-builder': { title: 'Query Builder', subtitle: 'Visual no-SQL query builder' },
  '/charts':        { title: 'Chart Sync',    subtitle: 'Crosshair sync + annotations' },
  '/stories':        { title: 'Data Stories',  subtitle: 'Auto-generated narrative briefs' },
  '/automate':       { title: 'Automation',    subtitle: 'Rules & scheduled jobs' },
  '/notifications': { title: 'Notifications', subtitle: 'Email + webhook channels' },
  '/pricing':        { title: 'Pricing & Limits', subtitle: 'Free tier usage and upgrade paths' },
  '/connectors':     { title: 'Connectors',      subtitle: '18 free-tier data source providers' },
  '/components':     { title: 'UI Components',   subtitle: 'Reusable building blocks' },
  '/settings':       { title: 'Settings',        subtitle: 'API keys, data sources, preferences' },
  '/about':          { title: 'About',         subtitle: 'Project, privacy & GDPR' },
  '/docs':           { title: 'Documentation',  subtitle: 'Quick reference' },
  '/login':          { title: 'Login',         subtitle: 'Mock authentication — nothing is stored' },
  '/plugins':       { title: 'Plugin',         subtitle: 'Auto-discovered plugin page' },
}

const SEARCH_ITEMS: { label: string; href: string; description: string }[] = [
  { label: 'Home',               href: '/',              description: 'Landing page' },
  { label: 'Dashboard',         href: '/dashboard',      description: 'Synthetic tick lakehouse &mdash; 9 sections' },
  { label: 'Saved Layouts',      href: '/layouts',       description: 'Custom dashboard layouts' },
  { label: 'Live Markets',      href: '/markets',        description: 'Crypto, FX, equities from free APIs' },
  { label: 'Live Updates',       href: '/live',           description: 'WebSocket tick streaming' },
  { label: 'News Feeds',        href: '/news',           description: 'RSS from 10 financial + tech sources' },
  { label: 'Files',              href: '/files',          description: 'Upload, preview, download data' },
  { label: 'Data Export',       href: '/exports',        description: 'Excel, PDF, CSV, JSON export' },
  { label: 'Query Builder',     href: '/query-builder',  description: 'Visual no-SQL query builder' },
  { label: 'Chart Sync',        href: '/charts',         description: 'Crosshair sync + annotations' },
  { label: 'Data Stories',      href: '/stories',        description: 'Auto-generated narrative briefs' },
  { label: 'Automation Rules',   href: '/automate',       description: 'Rules & scheduled jobs' },
  { label: 'Notifications',     href: '/notifications',   description: 'Email + webhook channels' },
  { label: 'Pricing & Limits',  href: '/pricing',        description: 'Free tier usage and upgrade paths' },
  { label: 'Connectors',        href: '/connectors',      description: '18 free-tier data source providers' },
  { label: 'UI Components',     href: '/components',      description: 'Reusable building blocks (LiveFilter, RangeSlider, FeedbackWidget)' },
  { label: 'Settings',          href: '/settings',       description: 'API keys, data sources' },
  { label: 'About',              href: '/about',          description: 'Project & privacy notice' },
  { label: 'Documentation',     href: '/docs',            description: 'Quick reference' },
  { label: 'Login',              href: '/login',          description: 'Mock auth form (demo/admin/enterprise)' },
  { label: 'Weather Plugin',    href: '/plugins/weather',  description: 'NOAA + OpenWeather sample plugin' },
  { label: 'Flights Plugin',    href: '/plugins/flights',  description: 'OpenSky flight tracking sample plugin' },
]

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)
  const pathname = usePathname()

  // Find the matching page label (handle dynamic routes by checking prefixes)
  const meta = React.useMemo(() => {
    // Try exact match first
    if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
    // Try prefix match for nested routes
    for (const key of Object.keys(PAGE_LABELS)) {
      if (key !== '/' && pathname.startsWith(key)) return PAGE_LABELS[key]
    }
    return PAGE_LABELS['/']
  }, [pathname])

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
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50)
    else setSearchQuery('')
  }, [searchOpen])

  // Keyboard shortcut: Cmd/Ctrl + K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Home button — always visible */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-1.5 px-2"
      >
        <Link href="/" aria-label="Return to home">
          <HomeIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Home</span>
        </Link>
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
                    placeholder="Search pages..."
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
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">No matches found</div>
                  ) : (
                    filteredItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSearchOpen(false)}
                        className="block px-3 py-2 rounded hover:bg-accent transition-colors"
                      >
                        <div className="text-sm font-medium">{item.label}</div>
                        <div
                          className="text-[10px] text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </Link>
                    ))
                  )}
                </div>
                <div className="border-t px-3 py-1.5 text-[10px] text-muted-foreground flex justify-between">
                  <span>esc to close</span>
                  <span>⌘K to open</span>
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
          href="https://github.com/testdemoqwenai2025-creator/demoanalytics"
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
