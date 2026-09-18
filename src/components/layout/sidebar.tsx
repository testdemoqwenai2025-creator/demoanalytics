'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, LayoutDashboard, TrendingUp, Zap, Book, Info, LogIn,
  ChevronRight, Database, Workflow, Activity, Brain, Bell, ShieldAlert, GitBranch,
  FileText, DollarSign, Settings, Newspaper, FolderOpen, Sparkles, Puzzle,
  Radio, FileSpreadsheet, Layout, Filter, MessageSquare, BarChart3, Code2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore, type DashboardSectionId } from '@/lib/store'
import { getPluginsForRole, getPluginIcon } from '@/lib/plugins'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const TOP_NAV: NavItem[] = [
  { href: '/',              label: 'Home',          icon: Home,            description: 'Landing page' },
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, description: 'Synthetic tick lakehouse' },
  { href: '/layouts',      label: 'Saved Layouts', icon: Layout,          description: 'Custom dashboard layouts' },
  { href: '/markets',       label: 'Live Markets',  icon: TrendingUp,      description: 'Crypto, FX, equities' },
  { href: '/live',          label: 'Live Updates',  icon: Radio,           description: 'WebSocket tick stream' },
  { href: '/news',          label: 'News Feeds',    icon: Newspaper,       description: 'RSS from 10 sources' },
  { href: '/files',         label: 'Files',         icon: FolderOpen,      description: 'Upload, preview, download' },
  { href: '/exports',       label: 'Data Export',   icon: FileSpreadsheet,description: 'Excel, PDF, CSV, JSON' },
  { href: '/query-builder', label: 'Query Builder', icon: Filter,          description: 'Visual no-SQL explorer' },
  { href: '/charts',        label: 'Chart Sync',    icon: BarChart3,       description: 'Crosshair + annotations' },
  { href: '/charts-advanced', label: 'Advanced Charts', icon: BarChart3, description: 'Candlestick, heatmap, treemap' },
  { href: '/stories',       label: 'Data Stories',  icon: Sparkles,        description: 'Auto-generated briefs' },
  { href: '/ask',           label: 'Ask (NL Query)', icon: Sparkles,      description: 'Natural language → SQL' },
  { href: '/automate',      label: 'Automation',    icon: Zap,             description: 'Rules & scheduled jobs' },
  { href: '/notifications', label: 'Notifications', icon: MessageSquare,   description: 'Email + webhooks' },
  { href: '/pricing',       label: 'Pricing & Limits', icon: DollarSign,   description: 'Free tier + upgrade' },
  { href: '/connectors',    label: 'Connectors',     icon: Database,        description: '18 data source providers' },
  { href: '/components',    label: 'UI Components',  icon: Code2,           description: 'Reusable building blocks' },
  { href: '/settings',      label: 'Settings',      icon: Settings,        description: 'API keys & preferences' },
  { href: '/backup',        label: 'Backup & Restore', icon: Settings,     description: 'Export/import local data' },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/docs',  label: 'Documentation', icon: Book, description: 'Quick reference' },
  { href: '/about', label: 'About',         icon: Info, description: 'Project & privacy' },
  { href: '/login', label: 'Login',         icon: LogIn, description: 'Mock auth form' },
]

// Dashboard sub-section nav (visible when on /dashboard)
const DASHBOARD_SECTIONS: { id: DashboardSectionId; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'overview',   label: 'Overview',      icon: Activity,    description: 'KPIs and charts' },
  { id: 'datasets',   label: 'Datasets',      icon: Database,    description: 'Lakehouse tables' },
  { id: 'explorer',   label: 'Data Explorer', icon: Book,        description: 'SQL editor' },
  { id: 'pipelines',  label: 'Pipelines',    icon: Workflow,     description: 'Flink jobs' },
  { id: 'ticks',      label: 'Tick Stream',  icon: Activity,     description: 'OHLCV charts' },
  { id: 'models',     label: 'ML Models',    icon: Brain,        description: 'Registry + drift' },
  { id: 'alerts',     label: 'Alerts & SLOs', icon: Bell,        description: 'Burn-down + ack' },
  { id: 'governance', label: 'Governance',   icon: ShieldAlert,  description: 'Lineage + audit' },
  { id: 'incidents',  label: 'Incidents',    icon: GitBranch,    description: 'Postmortems' },
]

export function Sidebar() {
  const pathname = usePathname()
  const activeSection = useDashboardStore(s => s.activeSection)
  const setActiveSection = useDashboardStore(s => s.setActiveSection)
  const sidebarOpen = useDashboardStore(s => s.sidebarOpen)
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)
  const isAuthenticated = useDashboardStore(s => s.isAuthenticated)
  const userEmail = useDashboardStore(s => s.userEmail)
  const userRole = useDashboardStore(s => s.userRole)
  const logout = useDashboardStore(s => s.logout)

  const roleLabel = userRole === 'enterprise' ? '🏢 Enterprise' : userRole === 'admin' ? '🛡 Admin access' : '👁 Demo (read-only)'
  const roleColor = userRole === 'enterprise' ? 'bg-violet-500' : userRole === 'admin' ? 'bg-primary' : 'bg-emerald-500'

  const isOnDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

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
          'transition-transform duration-200 md:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b px-4 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
              M
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">MERIDIAN</span>
              <span className="text-[10px] text-muted-foreground">Data Analyst Template</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {TOP_NAV.map(item => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
              onClick={() => setSidebarOpen(false)}
            />
          ))}

          {/* Dashboard sub-section expandable */}
          {isOnDashboard && (
            <div className="ml-2 mt-2 space-y-0.5 border-l pl-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
                Sections
              </div>
              {DASHBOARD_SECTIONS.map(s => {
                const Icon = s.icon
                const isActive = activeSection === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'group flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors w-full',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/40 text-muted-foreground'
                    )}
                  >
                    <Icon className={cn('h-3 w-3 shrink-0', isActive && 'text-primary')} />
                    <span className="text-xs">{s.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Plugins (auto-discovered) */}
          {getPluginsForRole(userRole).length > 0 && (
            <div className="pt-2 mt-2 border-t">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-1 flex items-center gap-1">
                <Puzzle className="h-3 w-3" /> Plugins
              </div>
              {getPluginsForRole(userRole).map(plugin => {
                const Icon = getPluginIcon(plugin.icon)
                const href = `/plugins/${plugin.name}`
                const isActive = pathname === href
                return (
                  <Link
                    key={plugin.name}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors w-full',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/60'
                    )}
                  >
                    <Icon className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium leading-tight">{plugin.title}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">{plugin.description}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="pt-2 mt-2 border-t">
            {BOTTOM_NAV.map(item => (
              <NavItem
                key={item.href}
                item={item}
                active={pathname === item.href}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </div>
        </nav>

        {/* Auth status */}
        <div className="border-t p-3 shrink-0">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold ${roleColor}`}>
                  {userEmail?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{userEmail}</div>
                  <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
                </div>
                <button onClick={logout} className="text-[10px] text-muted-foreground hover:text-foreground">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" onClick={() => setSidebarOpen(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
              <LogIn className="h-3 w-3" />
              Not signed in (mock)
            </Link>
          )}
          <div className="mt-2 text-[10px] text-muted-foreground">v1.2 · 3 roles + plugins</div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ item, active, onClick }: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors w-full',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/60'
      )}
    >
      <Icon className={cn(
        'mt-0.5 h-4 w-4 shrink-0',
        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
      )} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium leading-tight">{item.label}</span>
        <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
      </div>
      {active && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
    </Link>
  )
}
