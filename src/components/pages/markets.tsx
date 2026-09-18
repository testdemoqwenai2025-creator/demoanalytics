'use client'

import * as React from 'react'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, StatCard, StatusPill, EmptyState } from '@/components/dashboard/primitives'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts'

export function MarketsPage() {
  return (
    <>
      <SectionHeading
        title="Live Markets"
        description="Real-time data from free public APIs. No keys required."
        action={
          <Badge variant="outline" className="text-[10px]">
            CoinGecko &middot; Frankfurter &middot; Stooq
          </Badge>
        }
      />

      <Tabs defaultValue="crypto">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="fx">FX Rates</TabsTrigger>
          <TabsTrigger value="equities">Equities</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="mt-4">
          <CryptoMarkets />
        </TabsContent>
        <TabsContent value="fx" className="mt-4">
          <FxMarkets />
        </TabsContent>
        <TabsContent value="equities" className="mt-4">
          <EquitiesMarkets />
        </TabsContent>
      </Tabs>
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// Crypto via CoinGecko (free, no key)
// ──────────────────────────────────────────────────────────────

function CryptoMarkets() {
  const { data, loading, error, refetch } = useFetch<{ markets: any[] }>('/api/markets?type=crypto', {
    refreshInterval: 60000,
  })

  const totalMarketCap = data?.markets?.reduce((s, m) => s + (m.marketCap || 0), 0) || 0
  const totalVolume = data?.markets?.reduce((s, m) => s + (m.volume24h || 0), 0) || 0
  const gainers = data?.markets?.filter(m => m.change24h > 0).length || 0
  const losers = data?.markets?.filter(m => m.change24h < 0).length || 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Market Cap"
          value={totalMarketCap ? `$${(totalMarketCap / 1e9).toFixed(2)}B` : '—'}
          loading={loading}
        />
        <StatCard
          label="24h Volume"
          value={totalVolume ? `$${(totalVolume / 1e9).toFixed(2)}B` : '—'}
          loading={loading}
        />
        <StatCard label="Gainers" value={gainers} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} loading={loading} />
        <StatCard label="Losers" value={losers} icon={<TrendingDown className="h-4 w-4 text-red-500" />} loading={loading} />
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Top Cryptocurrencies by Market Cap</CardTitle>
            <CardDescription className="text-xs mt-0.5">Source: CoinGecko API &middot; updates every 60s</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive p-4">
              Failed to load crypto data: {error}
              <p className="text-xs text-muted-foreground mt-2">
                CoinGecko has aggressive rate limits. Try again in a minute, or check the FX/Equities tabs.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !data?.markets?.length ? (
            <EmptyState title="No crypto data" description="API may be rate-limited" />
          ) : (
            <ScrollArea className="h-[480px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">24h %</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                    <TableHead className="text-right hidden md:table-cell">24h Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.markets.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                            {m.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase">{m.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        ${formatPrice(m.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-mono tabular-nums ${
                          m.change24h > 0 ? 'text-emerald-600' : m.change24h < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {m.change24h > 0 ? <TrendingUp className="h-3 w-3" /> : m.change24h < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {m.change24h > 0 ? '+' : ''}{m.change24h?.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-xs hidden md:table-cell">
                        ${formatLargeNumber(m.marketCap)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-xs hidden md:table-cell">
                        ${formatLargeNumber(m.volume24h)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// FX via Frankfurter (ECB data, free, no key)
// ──────────────────────────────────────────────────────────────

function FxMarkets() {
  const { data, loading, error, refetch } = useFetch<{ rates: Record<string, number>; base: string; date: string }>(
    '/api/markets?type=fx',
    { refreshInterval: 300000 }
  )

  const currencies = data ? Object.entries(data.rates).sort(([a], [b]) => a.localeCompare(b)) : []
  const chartData = currencies.map(([code, rate]) => ({ code, rate: Number(rate.toFixed(4)) }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Base Currency" value={data?.base || '—'} loading={loading} />
        <StatCard label="Currencies Tracked" value={currencies.length} loading={loading} />
        <StatCard label="Reference Date" value={data?.date || '—'} loading={loading} />
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Exchange Rates</CardTitle>
            <CardDescription className="text-xs mt-0.5">Source: Frankfurter API &middot; ECB reference rates &middot; daily</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive p-4">Failed to load FX data: {error}</div>
          ) : loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 6 }}
                    formatter={(v: any) => [Number(v).toFixed(4), 'rate']}
                  />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.rate > 1 ? '#0ea5e9' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <ScrollArea className="h-[320px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="text-xs">Currency</TableHead>
                      <TableHead className="text-xs text-right">Rate</TableHead>
                      <TableHead className="text-xs text-right">Inverse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map(([code, rate]) => (
                      <TableRow key={code}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px]">{code}</Badge>
                            <span className="text-xs text-muted-foreground">{currencyName(code)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs">{rate.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs text-muted-foreground">
                          {(1 / rate).toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Equities via Stooq (free CSV, no key)
// ──────────────────────────────────────────────────────────────

const EQUITY_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META']

function EquitiesMarkets() {
  const [symbol, setSymbol] = React.useState('AAPL')
  return (
    <EquityDetail symbol={symbol} symbols={EQUITY_SYMBOLS} onSymbolChange={setSymbol} />
  )
}

function EquityDetail({ symbol, symbols, onSymbolChange }: {
  symbol: string
  symbols: string[]
  onSymbolChange: (s: string) => void
}) {
  const { data, loading, error, refetch } = useFetch<{ symbol: string; bars: any[]; latest: any }>(
    `/api/markets?type=equity&symbol=${symbol}`,
    { refreshInterval: 0 }
  )

  const bars = data?.bars || []
  const chartData = bars.map(b => ({
    date: b.date,
    close: b.close,
    high: b.high,
    low: b.low,
  }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {symbols.map(s => (
          <Button
            key={s}
            size="sm"
            variant={s === symbol ? 'default' : 'outline'}
            onClick={() => onSymbolChange(s)}
            className="font-mono text-xs"
          >
            {s}
          </Button>
        ))}
        <Badge variant="outline" className="ml-auto text-[10px] gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          synthetic
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Latest Close" value={data?.latest?.close ? `$${data.latest.close.toFixed(2)}` : '—'} loading={loading} />
        <StatCard label="Day High" value={data?.latest?.high ? `$${data.latest.high.toFixed(2)}` : '—'} loading={loading} />
        <StatCard label="Day Low" value={data?.latest?.low ? `$${data.latest.low.toFixed(2)}` : '—'} loading={loading} />
        <StatCard label="Volume" value={data?.latest?.volume ? formatLargeNumber(data.latest.volume) : '—'} loading={loading} />
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">{symbol} &middot; Daily OHLC &middot; last 90 days</CardTitle>
            <CardDescription className="text-xs mt-0.5">Synthetic OHLCV &middot; last 90 days &middot; Stooq requires JS verification so we generate plausible data</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive p-4">Failed to load equity data: {error}</div>
          ) : loading ? (
            <Skeleton className="h-72 w-full" />
          ) : !chartData.length ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) => String(v).slice(5)}
                />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#equityGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function formatPrice(p: number): string {
  if (!p) return '—'
  if (p < 0.01) return p.toFixed(6)
  if (p < 1) return p.toFixed(4)
  if (p < 100) return p.toFixed(2)
  return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatLargeNumber(n: number): string {
  if (!n) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(0)
}

function currencyName(code: string): string {
  const names: Record<string, string> = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    CHF: 'Swiss Franc', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
    NZD: 'New Zealand Dollar', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
    DKK: 'Danish Krone', CNY: 'Chinese Yuan', HKD: 'Hong Kong Dollar',
    SGD: 'Singapore Dollar', INR: 'Indian Rupee', KRW: 'South Korean Won',
    MXN: 'Mexican Peso', BRL: 'Brazilian Real', ZAR: 'South African Rand',
    TRY: 'Turkish Lira', RUB: 'Russian Ruble', PLN: 'Polish Zloty',
    CZK: 'Czech Koruna', HUF: 'Hungarian Forint', RON: 'Romanian Leu',
    BGN: 'Bulgarian Lev', ISK: 'Icelandic Krona', HRK: 'Croatian Kuna',
  }
  return names[code] || code
}
