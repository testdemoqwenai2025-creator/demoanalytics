'use client'

import * as React from 'react'
import { RefreshCw, TrendingUp, TrendingDown, ExternalLink, WifiOff } from 'lucide-react'
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

// Detect if we're in static-export mode (no API server).
// We do this by checking if basePath is set OR by attempting a fetch to /api/stats.
function useStaticMode() {
  const [isStatic, setIsStatic] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    // If basePath is set via env, we're definitely in static mode
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH
    if (basePath) {
      setIsStatic(true)
      return
    }
    // Otherwise probe: try to hit /api/stats; if it 404s, we're static
    fetch('/api/stats', { cache: 'no-store' })
      .then(r => setIsStatic(!r.ok))
      .catch(() => setIsStatic(true))
  }, [])
  return isStatic
}

export function MarketsPage() {
  const isStatic = useStaticMode()

  return (
    <>
      <SectionHeading
        title="Live Markets"
        description="Real-time data from free public APIs. No keys required."
        action={
          <Badge variant="outline" className="text-[10px]">
            CoinGecko &middot; Frankfurter &middot; synthetic
          </Badge>
        }
      />

      {isStatic === true && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 flex items-start gap-3">
          <WifiOff className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <div className="font-medium text-amber-900 dark:text-amber-200 mb-0.5">
              Static preview mode &mdash; live data is fetched directly from public APIs in your browser
            </div>
            <p className="text-amber-700 dark:text-amber-300">
              Crypto prices load from <code className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/40 px-1 rounded">api.coingecko.com</code> and
              FX rates from <code className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/40 px-1 rounded">api.frankfurter.app</code>.
              If a provider is rate-limiting or offline, switch tabs and try again.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="crypto">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="fx">FX Rates</TabsTrigger>
          <TabsTrigger value="equities">Equities</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="mt-4">
          <CryptoMarkets isStatic={isStatic} />
        </TabsContent>
        <TabsContent value="fx" className="mt-4">
          <FxMarkets isStatic={isStatic} />
        </TabsContent>
        <TabsContent value="equities" className="mt-4">
          <EquitiesMarkets />
        </TabsContent>
      </Tabs>
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// Crypto: try server proxy first, fall back to direct CoinGecko
// ──────────────────────────────────────────────────────────────

function CryptoMarkets({ isStatic }: { isStatic: boolean | null }) {
  // Always fetch directly from CoinGecko (CORS-enabled). Skip the server proxy entirely.
  const { data, loading, error, refetch } = useFetch<{ markets: any[] }>(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h',
    { refreshInterval: 60000 }
  )

  // Transform CoinGecko response into our shape
  const markets = React.useMemo(() => {
    if (!data) return []
    // CoinGecko returns an array directly
    const raw = Array.isArray(data) ? data : (data as any).markets
    if (!Array.isArray(raw)) return []
    return raw.map((c: any) => ({
      id: c.id,
      symbol: (c.symbol || '').toUpperCase(),
      name: c.name,
      price: c.current_price ?? 0,
      marketCap: c.market_cap ?? 0,
      volume24h: c.total_volume ?? 0,
      change24h: c.price_change_percentage_24h ?? 0,
    }))
  }, [data])

  const totalMarketCap = markets.reduce((s, m) => s + (m.marketCap || 0), 0)
  const totalVolume = markets.reduce((s, m) => s + (m.volume24h || 0), 0)
  const gainers = markets.filter(m => m.change24h > 0).length
  const losers = markets.filter(m => m.change24h < 0).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Market Cap" value={totalMarketCap ? `$${(totalMarketCap / 1e9).toFixed(2)}B` : '—'} loading={loading} />
        <StatCard label="24h Volume" value={totalVolume ? `$${(totalVolume / 1e9).toFixed(2)}B` : '—'} loading={loading} />
        <StatCard label="Gainers" value={gainers} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} loading={loading} />
        <StatCard label="Losers" value={losers} icon={<TrendingDown className="h-4 w-4 text-red-500" />} loading={loading} />
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Top Cryptocurrencies by Market Cap</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Source: CoinGecko public API &middot; updates every 60s &middot;
              <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 hover:text-foreground">
                coingecko.com <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </CardDescription>
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
                CoinGecko has aggressive rate limits (10-30 calls/min on free tier).
                Wait a minute and try Refresh, or try the FX tab.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !markets.length ? (
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
                  {markets.map((m, i) => (
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
// FX: Frankfurter (ECB rates, CORS-enabled, free)
// ──────────────────────────────────────────────────────────────

function FxMarkets({ isStatic }: { isStatic: boolean | null }) {
  // Fetch directly from Frankfurter (CORS-enabled)
  const { data, loading, error, refetch } = useFetch<any>(
    'https://api.frankfurter.app/latest?from=USD',
    { refreshInterval: 300000 }
  )

  const rates: Record<string, number> = data?.rates || {}
  const currencies = Object.entries(rates).sort(([a], [b]) => a.localeCompare(b))
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
            <CardDescription className="text-xs mt-0.5">
              Source: Frankfurter API &middot; ECB reference rates &middot; daily &middot;
              <a href="https://www.frankfurter.app" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 hover:text-foreground">
                frankfurter.app <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </CardDescription>
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
                  <XAxis dataKey="code" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
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
                        <TableCell className="text-right font-mono tabular-nums text-xs">{(rate as number).toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs text-muted-foreground">
                          {(1 / (rate as number)).toFixed(4)}
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
// Equities: synthetic (Stooq requires JS verification, so we generate)
// ──────────────────────────────────────────────────────────────

const EQUITY_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META']
const EQUITY_BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20, AMZN: 178.90,
  GOOGL: 142.80, META: 487.60,
}

function EquitiesMarkets() {
  const [symbol, setSymbol] = React.useState('AAPL')

  // Generate synthetic bars client-side (no server needed)
  const bars = React.useMemo(() => generateSyntheticBars(symbol), [symbol])
  const latest = bars[bars.length - 1]

  const chartData = bars.map(b => ({ date: b.date, close: b.close, high: b.high, low: b.low }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {EQUITY_SYMBOLS.map(s => (
          <Button
            key={s}
            size="sm"
            variant={s === symbol ? 'default' : 'outline'}
            onClick={() => setSymbol(s)}
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
        <StatCard label="Latest Close" value={`$${latest.close.toFixed(2)}`} />
        <StatCard label="Day High" value={`$${latest.high.toFixed(2)}`} />
        <StatCard label="Day Low" value={`$${latest.low.toFixed(2)}`} />
        <StatCard label="Volume" value={formatLargeNumber(latest.volume)} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{symbol} &middot; Daily OHLC &middot; last 90 days</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Synthetic OHLCV &middot; Stooq requires JS verification so we generate plausible data on the client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => String(v).slice(5)} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
                formatter={(v: any) => [`$${Number(v).toFixed(2)}`, '']}
              />
              <Area type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function generateSyntheticBars(symbol: string) {
  const basePrice = EQUITY_BASE_PRICES[symbol] || 100
  const volatility = symbol === 'TSLA' || symbol === 'NVDA' ? 0.025 : 0.012
  const bars: any[] = []
  let currentPrice = basePrice * 0.92
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const open = currentPrice
    const change = (Math.random() - 0.48) * volatility * currentPrice
    const close = Math.max(currentPrice + change, basePrice * 0.5)
    const high = Math.max(open, close) * (1 + Math.random() * 0.008)
    const low = Math.min(open, close) * (1 - Math.random() * 0.008)
    const volume = Math.floor(5_000_000 + Math.random() * 50_000_000)
    bars.push({
      date: date.toISOString().slice(0, 10),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })
    currentPrice = close
  }
  return bars
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
