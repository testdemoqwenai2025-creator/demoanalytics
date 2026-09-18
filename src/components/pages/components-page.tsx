'use client'

import * as React from 'react'
import { Filter, Star, Sliders, Code2, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/primitives'
import { LiveFilter, FeedbackWidget, RangeSlider } from '@/components/ui-primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'idle' | 'offline'
  lastSeen: string
}

const DEMO_USERS: DemoUser[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice@meridian.template', role: 'admin', status: 'active', lastSeen: '2m ago' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@meridian.template', role: 'demo', status: 'idle', lastSeen: '15m ago' },
  { id: 'u3', name: 'Carol Jones', email: 'carol@meridian.template', role: 'admin', status: 'active', lastSeen: 'now' },
  { id: 'u4', name: 'Dave Wilson', email: 'dave@meridian.template', role: 'demo', status: 'offline', lastSeen: '2h ago' },
  { id: 'u5', name: 'Eve Brown', email: 'eve@meridian.template', role: 'enterprise', status: 'active', lastSeen: '5m ago' },
  { id: 'u6', name: 'Frank Liu', email: 'frank@meridian.template', role: 'admin', status: 'idle', lastSeen: '30m ago' },
  { id: 'u7', name: 'Grace Kim', email: 'grace@meridian.template', role: 'demo', status: 'active', lastSeen: '1m ago' },
  { id: 'u8', name: 'Henry Park', email: 'henry@meridian.template', role: 'enterprise', status: 'offline', lastSeen: '1d ago' },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-amber-500',
  offline: 'bg-muted-foreground',
}

const ROLE_COLORS: Record<string, string> = {
  demo: 'border-muted text-muted-foreground',
  admin: 'border-primary text-primary',
  enterprise: 'border-violet-500 text-violet-700',
}

export function ComponentsPage() {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([50, 500])
  const [latencyRange, setLatencyRange] = React.useState<[number, number]>([100, 400])

  return (
    <>
      <SectionHeading
        title="Reusable UI Components"
        description="Building blocks that any page or plugin can use. Drop them into any component with a single import."
      />

      {/* LiveFilter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> LiveFilter
          </CardTitle>
          <CardDescription className="text-xs">
            Filter-as-you-type with debouncing. Searches multiple fields. Shows result count.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LiveFilter
            items={DEMO_USERS}
            searchKeys={['name', 'email', 'role']}
            placeholder="Filter users by name, email, or role..."
          >
            {(filtered) => (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {filtered.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-md border bg-card/50 hover:bg-accent/40 transition-colors">
                    <div className="relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {user.name[0]}
                      </div>
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${STATUS_COLORS[user.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${ROLE_COLORS[user.role]}`}>{user.role}</Badge>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{user.lastSeen}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground">No users match your filter.</div>
                )}
              </div>
            )}
          </LiveFilter>

          <pre className="text-[10px] font-mono bg-muted/40 p-2 rounded mt-3 overflow-auto">
{`<LiveFilter items={users} searchKeys={['name', 'email', 'role']} placeholder="Filter users...">
  {(filtered) => filtered.map(u => <UserCard key={u.id} user={u} />)}
</LiveFilter>`}
          </pre>
        </CardContent>
      </Card>

      {/* RangeSlider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sliders className="h-4 w-4" /> RangeSlider
          </CardTitle>
          <CardDescription className="text-xs">
            Dual-handle range slider for filtering numeric data. Drag either handle. Accessible with ARIA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RangeSlider
            min={0}
            max={1000}
            step={10}
            label="Price Range"
            unit="$"
            value={priceRange}
            onChange={setPriceRange}
          />
          <RangeSlider
            min={0}
            max={1000}
            step={5}
            label="Latency Range"
            unit=""
            formatValue={(v) => `${v}ms`}
            value={latencyRange}
            onChange={setLatencyRange}
          />
          <RangeSlider
            min={0}
            max={100}
            step={1}
            label="Volume Percentile"
            formatValue={(v) => `${v}%`}
            defaultValue={[25, 75]}
          />

          <pre className="text-[10px] font-mono bg-muted/40 p-2 rounded overflow-auto">
{`<RangeSlider min={0} max={1000} step={10} label="Price" unit="$"
  value={range} onChange={setRange} />`}
          </pre>
        </CardContent>
      </Card>

      {/* FeedbackWidget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" /> FeedbackWidget
          </CardTitle>
          <CardDescription className="text-xs">
            Star rating + type (good/issue/idea) + comment. Floating or inline variant. Stored in localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackWidget variant="inline" context="components-showcase" />
          <pre className="text-[10px] font-mono bg-muted/40 p-2 rounded mt-3 overflow-auto">
{`// Floating (appears as a button in bottom-left)
<FeedbackWidget variant="floating" context="dashboard" />

// Inline (embeds in the page)
<FeedbackWidget variant="inline" context="pricing" />`}
          </pre>
        </CardContent>
      </Card>

      {/* Usage guide */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Code2 className="h-4 w-4" /> How to use these in your pages or plugins
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            All three components are in <code className="bg-muted px-1 rounded font-mono text-[10px]">src/components/ui-primitives/</code>.
            Import them with:
          </p>
          <pre className="text-[10px] font-mono bg-background p-2 rounded">
{`import { LiveFilter, FeedbackWidget, RangeSlider } from '@/components/ui-primitives'`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            These are generic, reusable components — not tied to any specific data source or domain.
            Use them in any page, plugin, or custom dashboard section.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
