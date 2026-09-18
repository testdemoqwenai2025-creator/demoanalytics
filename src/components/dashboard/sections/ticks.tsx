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
import { SectionHeading, StatusPill, EmptyState } from '../primitives'
import { PriceChart, VolumeChart } from '../charts'

export function TicksSection() {
  const [symbol, setSymbol] = React.useState('AAPL')
  const [timeframe, setTimeframe] = React.useState('1m')

  const { data: symData } = useFetch<{ symbols: any[] }>('/api/symbols')
  const { data: tickData, loading: tickLoading } = useFetch<{ ticks: any[] }>(
    `/api/ticks?symbol=${symbol}&limit=100`
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
