'use client'

import * as React from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { SectionHeading, StatusPill, EmptyState } from '../primitives'
import { PriceChart, VolumeChart } from '../charts'

const STATIC_SYMBOLS = [
  { id: 'sym1', ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'equity', currency: 'USD' },
  { id: 'sym2', ticker: 'MSFT', name: 'Microsoft Corp', assetClass: 'equity', currency: 'USD' },
  { id: 'sym3', ticker: 'NVDA', name: 'NVIDIA Corp', assetClass: 'equity', currency: 'USD' },
  { id: 'sym4', ticker: 'TSLA', name: 'Tesla Inc', assetClass: 'equity', currency: 'USD' },
  { id: 'sym5', ticker: 'AMZN', name: 'Amazon.com Inc', assetClass: 'equity', currency: 'USD' },
  { id: 'sym6', ticker: 'GOOGL', name: 'Alphabet Inc', assetClass: 'equity', currency: 'USD' },
  { id: 'sym7', ticker: 'META', name: 'Meta Platforms', assetClass: 'equity', currency: 'USD' },
  { id: 'sym8', ticker: 'SPX', name: 'S&P 500 Index', assetClass: 'index', currency: 'USD' },
  { id: 'sym9', ticker: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'fx', currency: 'USD' },
  { id: 'sym10', ticker: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'fx', currency: 'USD' },
  { id: 'sym11', ticker: 'USDJPY', name: 'US Dollar / Japanese Yen', assetClass: 'fx', currency: 'JPY' },
  { id: 'sym12', ticker: 'US10Y', name: 'US 10Y Treasury Yield', assetClass: 'rate', currency: 'USD' },
  { id: 'sym13', ticker: 'CL', name: 'WTI Crude Oil', assetClass: 'commodity', currency: 'USD' },
  { id: 'sym14', ticker: 'XAU', name: 'Gold Spot', assetClass: 'commodity', currency: 'USD' },
]

const STATIC_VENUES = [
  { id: 'v1', code: 'CME', name: 'Chicago Mercantile Exchange', region: 'us-east-1', timezone: 'America/Chicago' },
  { id: 'v2', code: 'NASDAQ', name: 'NASDAQ', region: 'us-east-1', timezone: 'America/New_York' },
  { id: 'v3', code: 'LSE', name: 'London Stock Exchange', region: 'eu-west-1', timezone: 'Europe/London' },
  { id: 'v4', code: 'EUREX', name: 'Eurex', region: 'eu-west-1', timezone: 'Europe/Berlin' },
  { id: 'v5', code: 'TSE', name: 'Tokyo Stock Exchange', region: 'ap-southeast-2', timezone: 'Asia/Tokyo' },
]

const STATIC_TICK_BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20, AMZN: 178.90,
  GOOGL: 142.80, META: 487.60, SPX: 5165.30, EURUSD: 1.0856, GBPUSD: 1.2643,
  USDJPY: 149.85, US10Y: 4.275, CL: 78.45, XAU: 2158.30,
}

function generateStaticTicks(symbol: string) {
  const base = STATIC_TICK_BASE_PRICES[symbol] || 100
  return Array.from({ length: 100 }, (_, i) => ({
    id: `tick-${i}`,
    ts: new Date(Date.now() - i * 30000).toISOString(),
    symbol,
    venue: STATIC_VENUES[i % STATIC_VENUES.length].code,
    price: base + (Math.random() - 0.5) * base * 0.01,
    size: Math.floor(100 + Math.random() * 900),
    side: ['bid', 'ask', 'trade'][i % 3],
    feedLagMs: 100 + Math.random() * 200,
  }))
}

export function TicksSection() {
  const [symbol, setSymbol] = React.useState('AAPL')
  const [timeframe, setTimeframe] = React.useState('1m')

  const { data: symData } = useFetch<{ symbols: any[] }>('/api/symbols', {
    staticFallback: () => ({ symbols: STATIC_SYMBOLS, venues: STATIC_VENUES }),
  })
  const { data: tickData, loading: tickLoading } = useFetch<{ ticks: any[] }>(
    `/api/ticks?symbol=${symbol}&limit=100`,
    { staticFallback: () => ({ ticks: generateStaticTicks(symbol) }) }
  )

  return (
    <>
      <SectionHeading
        title="Tick Stream & OHLCV"
        description="Live tick feed and historical OHLCV bars from synthetic market data."
        action={
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            streaming (15s refresh)
          </Badge>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            {symData?.symbols.map(s => (
              <SelectItem key={s.id} value={s.ticker}>
                {s.ticker} <span className="text-muted-foreground text-[10px] ml-1">{s.assetClass}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 minute</SelectItem>
            <SelectItem value="5m">5 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{symbol} · OHLCV · {timeframe}</span>
              <Badge variant="outline" className="text-[10px]">close + high/low band</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Last 120 bars, area chart with high/low envelope.</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceChart symbol={symbol} timeframe={timeframe} />
            <div className="mt-3 pt-3 border-t">
              <div className="text-[10px] text-muted-foreground mb-1">Volume</div>
              <VolumeChart symbol={symbol} timeframe={timeframe} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Ticks · {symbol}</CardTitle>
            <CardDescription className="text-xs">Last 100 trade prints</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[460px]">
              {tickLoading ? (
                <div className="space-y-1">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-7 bg-muted animate-pulse rounded" />)}</div>
              ) : !tickData?.ticks?.length ? (
                <EmptyState title="No ticks" />
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="text-[10px]">Time</TableHead>
                      <TableHead className="text-[10px] text-right">Price</TableHead>
                      <TableHead className="text-[10px] text-right">Size</TableHead>
                      <TableHead className="text-[10px]">Side</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickData.ticks.map(t => (
                      <TableRow key={t.id} className="hover:bg-accent/40">
                        <TableCell className="text-[10px] font-mono tabular-nums">
                          {new Date(t.ts).toLocaleTimeString('en-US', { hour12: false })}
                        </TableCell>
                        <TableCell className={`text-[10px] font-mono tabular-nums text-right ${
                          t.side === 'trade' ? 'font-semibold' : 'text-muted-foreground'
                        }`}>
                          {t.price.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-[10px] font-mono tabular-nums text-right">
                          {t.size.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              t.side === 'trade' ? 'border-emerald-500 text-emerald-700' :
                              t.side === 'bid' ? 'border-sky-500 text-sky-700' :
                              'border-amber-500 text-amber-700'
                            }`}
                          >
                            {t.side}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
