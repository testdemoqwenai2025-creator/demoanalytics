'use client'

import * as React from 'react'
import {
  Cloud, Plane, TrendingUp, Newspaper, DollarSign, Database, Shield, Zap, Radio,
  ExternalLink, Key, Check, X, Activity, Building2, Landmark, FileSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionHeading, StatCard } from '@/components/dashboard/primitives'
import { DATA_SOURCES, type DataSource } from '@/lib/data-sources'
import { useApiUsage } from '@/hooks/use-api-usage'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  crypto: TrendingUp,
  fx: DollarSign,
  equities: Activity,
  news: Newspaper,
  rss: Newspaper,
  general: Database,
  economic: Landmark,
  regulatory: FileSearch,
  realtime: Radio,
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: 'border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900',
  fx: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900',
  equities: 'border-sky-300 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900',
  news: 'border-violet-300 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-900',
  rss: 'border-violet-300 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-900',
  general: 'border-muted',
  economic: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900',
  regulatory: 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
  realtime: 'border-pink-300 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900',
}

export function ConnectorsPage() {
  const categories = Array.from(new Set(DATA_SOURCES.map(s => s.category))).sort()

  const counts = categories.reduce((acc, cat) => {
    acc[cat] = DATA_SOURCES.filter(s => s.category === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <SectionHeading
        title="Data Source Connectors"
        description={`${DATA_SOURCES.length} free-tier data providers across ${categories.length} categories. All with documented limits, CORS status, and upgrade paths.`}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Connectors" value={DATA_SOURCES.length} icon={<Database className="h-4 w-4" />} />
        <StatCard label="Real-time (WS)" value={DATA_SOURCES.filter(s => s.realtime).length} icon={<Radio className="h-4 w-4" />} />
        <StatCard label="No API Key" value={DATA_SOURCES.filter(s => !s.requiresApiKey).length} icon={<Check className="h-4 w-4 text-emerald-500" />} />
        <StatCard label="CORS-Enabled" value={DATA_SOURCES.filter(s => s.corsEnabled).length} icon={<Zap className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue={categories[0]}>
        <TabsList className="flex-wrap h-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-xs capitalize">
              {cat} ({counts[cat]})
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DATA_SOURCES.filter(s => s.category === cat).map(source => (
                <ConnectorCard key={source.id} source={source} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* How to add a new connector */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">How to add a new data source connector</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            All connectors are registered in <code className="bg-muted px-1 rounded font-mono text-[10px]">src/lib/data-sources.ts</code>.
            To add a new provider, add an entry to the <code className="bg-muted px-1 rounded font-mono text-[10px]">DATA_SOURCES</code> array:
          </p>
          <pre className="text-[10px] font-mono bg-background p-3 rounded-md overflow-auto">
{`{
  id: 'my-provider',
  name: 'My Provider',
  category: 'equities',        // crypto, fx, equities, news, rss, economic, regulatory, realtime
  description: 'Description of the provider',
  freeTierLimit: '1000 calls/day',
  freeTierRateLimit: '10 calls/min',
  requiresApiKey: true,
  apiKeyUrl: 'https://provider.com/api-key',
  upgradeUrl: 'https://provider.com/pricing',
  upgradeText: 'Pro from $29/mo',
  corsEnabled: true,
  realtime: false,             // set true if WebSocket
  wsUrl: 'wss://...',          // optional, for realtime
  docsUrl: 'https://docs.provider.com',
  active: true,
}`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            The connector auto-appears on this page, in the Pricing page, and in the Settings page.
            No other code changes needed.
          </p>
        </CardContent>
      </Card>
    </>
  )
}

function ConnectorCard({ source }: { source: DataSource }) {
  const usage = useApiUsage(source.id)
  const Icon = CATEGORY_ICONS[source.category] || Database
  const colorClass = CATEGORY_COLORS[source.category] || 'border-muted'

  return (
    <Card className={`border-l-4 border-l-${source.category === 'realtime' ? 'pink' : 'primary'} ${source.active ? '' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">{source.name}</div>
              <Badge variant="outline" className="text-[9px] capitalize">{source.category}</Badge>
            </div>
          </div>
          {source.active ? (
            <Badge variant="outline" className="text-[9px] border-emerald-500 text-emerald-700">Active</Badge>
          ) : (
            <Badge variant="outline" className="text-[9px]">Available</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{source.description}</p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {source.realtime && (
            <Badge variant="outline" className="text-[9px] border-pink-500 text-pink-700 gap-0.5">
              <Radio className="h-2.5 w-2.5" /> Real-time
            </Badge>
          )}
          {source.corsEnabled ? (
            <Badge variant="outline" className="text-[9px] border-emerald-500 text-emerald-700 gap-0.5">
              <Check className="h-2.5 w-2.5" /> CORS
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] gap-0.5">
              <X className="h-2.5 w-2.5" /> No CORS
            </Badge>
          )}
          {source.requiresApiKey ? (
            <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-700 gap-0.5">
              <Key className="h-2.5 w-2.5" /> API Key
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] border-emerald-500 text-emerald-700 gap-0.5">
              <Check className="h-2.5 w-2.5" /> No Key
            </Badge>
          )}
        </div>

        {/* Limits */}
        <div className="space-y-1 text-[10px] text-muted-foreground border-t pt-2">
          <div className="flex justify-between"><span>Free tier:</span><span className="font-mono">{source.freeTierLimit}</span></div>
          <div className="flex justify-between"><span>Rate limit:</span><span className="font-mono">{source.freeTierRateLimit}</span></div>
          {usage.limitPerDay && (
            <div className="flex justify-between"><span>Used today:</span><span className="font-mono">{usage.callsLastDay} / {usage.limitPerDay}</span></div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-3">
          <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1" asChild>
            <a href={source.docsUrl} target="_blank" rel="noopener noreferrer">
              Docs <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
            </a>
          </Button>
          {source.requiresApiKey && source.apiKeyUrl && (
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" asChild>
              <a href={source.apiKeyUrl} target="_blank" rel="noopener noreferrer">
                <Key className="h-3 w-3 mr-0.5" /> Get Key
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
