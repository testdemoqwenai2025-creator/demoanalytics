'use client'

import * as React from 'react'
import { Check, X, ExternalLink, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeading, StatusPill } from '@/components/dashboard/primitives'
import { DATA_SOURCES } from '@/lib/data-sources'
import { useApiUsage } from '@/hooks/use-api-usage'

export function PricingPage() {
  return (
    <>
      <SectionHeading
        title="Pricing & API Limits"
        description="Free-tier usage tracking across all data providers. Upgrade prompts appear when limits are approached."
      />

      {/* Active providers with usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DATA_SOURCES.map(source => (
          <ProviderCard key={source.id} source={source} />
        ))}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Provider Comparison</CardTitle>
          <CardDescription className="text-xs">All providers are free-tier or open source. No paid subscriptions required for basic usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold">Provider</th>
                  <th className="text-left py-2 px-2 font-semibold">Category</th>
                  <th className="text-left py-2 px-2 font-semibold">Free Limit</th>
                  <th className="text-left py-2 px-2 font-semibold">Rate Limit</th>
                  <th className="text-center py-2 px-2 font-semibold">API Key?</th>
                  <th className="text-center py-2 px-2 font-semibold">CORS?</th>
                  <th className="text-center py-2 px-2 font-semibold">Active?</th>
                  <th className="text-right py-2 px-2 font-semibold">Upgrade</th>
                </tr>
              </thead>
              <tbody>
                {DATA_SOURCES.map(s => (
                  <tr key={s.id} className="border-b hover:bg-accent/40">
                    <td className="py-2 px-2 font-medium">{s.name}</td>
                    <td className="py-2 px-2"><Badge variant="outline" className="text-[9px]">{s.category}</Badge></td>
                    <td className="py-2 px-2 font-mono text-muted-foreground">{s.freeTierLimit}</td>
                    <td className="py-2 px-2 font-mono text-muted-foreground">{s.freeTierRateLimit}</td>
                    <td className="py-2 px-2 text-center">{s.requiresApiKey ? <X className="h-3 w-3 text-amber-500 mx-auto" /> : <Check className="h-3 w-3 text-emerald-500 mx-auto" />}</td>
                    <td className="py-2 px-2 text-center">{s.corsEnabled ? <Check className="h-3 w-3 text-emerald-500 mx-auto" /> : <X className="h-3 w-3 text-muted-foreground mx-auto" />}</td>
                    <td className="py-2 px-2 text-center"><StatusPill status={s.active ? 'running' : 'stopped'} /></td>
                    <td className="py-2 px-2 text-right">
                      <a href={s.upgradeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline text-[11px]">
                        Pricing <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* How limits work */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            How free-tier limits work in this template
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li>• Each API call is tracked in your browser's localStorage (per-provider counter)</li>
            <li>• When you reach 80% of a limit, a <span className="text-amber-600 font-medium">yellow warning banner</span> appears on the relevant page</li>
            <li>• When you reach 100%, the page shows a <span className="text-red-600 font-medium">red upgrade prompt</span> linking to the provider's pricing page</li>
            <li>• Usage resets automatically based on the provider's rate window (per minute, per day, or per month)</li>
            <li>• For providers that support API keys (Alpha Vantage, Finnhub, NewsAPI), enter your key in <a href="/settings" className="underline">Settings</a> to unlock higher limits</li>
            <li>• None of this data is sent to any server — all tracking is client-side</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}

function ProviderCard({ source }: { source: typeof DATA_SOURCES[number] }) {
  const usage = useApiUsage(source.id)

  const percentUsed = usage.percentUsed
  const barColor = percentUsed > 80 ? 'bg-red-500' : percentUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <Card className={usage.status === 'limit-reached' ? 'border-red-300' : usage.status === 'warning' ? 'border-amber-300' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">{source.name}</h3>
            <Badge variant="outline" className="text-[9px] mt-1">{source.category}</Badge>
          </div>
          {usage.status === 'limit-reached' ? (
            <Badge variant="outline" className="text-[10px] border-red-500 text-red-700">Limit reached</Badge>
          ) : usage.status === 'warning' ? (
            <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-700">Near limit</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-700">OK</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{source.description}</p>

        {/* Usage bars */}
        <div className="space-y-2">
          {usage.limitPerMin && (
            <UsageBar label="This minute" used={usage.callsLastMin} limit={usage.limitPerMin} barColor={barColor} />
          )}
          {usage.limitPerDay && (
            <UsageBar label="Today" used={usage.callsLastDay} limit={usage.limitPerDay} barColor={barColor} />
          )}
          {usage.limitPerMonth && (
            <UsageBar label="This month" used={usage.callsLastMonth} limit={usage.limitPerMonth} barColor={barColor} />
          )}
          {!usage.limitPerMin && !usage.limitPerDay && !usage.limitPerMonth && (
            <p className="text-xs text-muted-foreground italic">No rate limits on free tier</p>
          )}
        </div>

        {/* Limits + upgrade */}
        <div className="mt-3 pt-3 border-t space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Free tier:</span>
            <span className="font-mono">{source.freeTierLimit}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Rate limit:</span>
            <span className="font-mono">{source.freeTierRateLimit}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>API key:</span>
            <span>{source.requiresApiKey ? 'Required' : 'Not needed'}</span>
          </div>
        </div>

        {/* Upgrade CTA */}
        <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-[11px]" asChild>
          <a href={source.upgradeUrl} target="_blank" rel="noopener noreferrer">
            <TrendingUp className="h-3 w-3 mr-1" />
            {source.upgradeText}
            <ExternalLink className="h-2.5 w-2.5 ml-1" />
          </a>
        </Button>

        {source.requiresApiKey && source.apiKeyUrl && (
          <Button size="sm" variant="ghost" className="w-full mt-1 h-7 text-[11px]" asChild>
            <a href={source.apiKeyUrl} target="_blank" rel="noopener noreferrer">
              Get free API key <ExternalLink className="h-2.5 w-2.5 ml-1" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function UsageBar({ label, used, limit, barColor }: { label: string; used: number; limit: number; barColor: string }) {
  const pct = Math.min((used / limit) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{used} / {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
