import { NextRequest, NextResponse } from 'next/server'

// MERIDIAN markets route — proxies free public APIs (CoinGecko, Frankfurter, Stooq)
// All requests server-side to avoid CORS and to cache.

const CACHE_TTL = 60_000 // 1 min for crypto, longer for FX/equity via per-type override
const cache = new Map<string, { ts: number; data: any }>()

function getCached<T>(key: string): T | null {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data as T
  return null
}

function setCached(key: string, data: any) {
  cache.set(key, { ts: Date.now(), data })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'crypto'
  const symbol = searchParams.get('symbol') || 'AAPL'

  try {
    if (type === 'crypto') return await fetchCrypto()
    if (type === 'fx') return await fetchFx()
    if (type === 'equity') return await fetchEquity(symbol)
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (e: any) {
    console.error('[markets] error:', e.message)
    return NextResponse.json(
      { error: e.message || 'Upstream API failed' },
      { status: 502 }
    )
  }
}

// ──────────────────────────────────────────────────────────────
// Crypto: CoinGecko free tier (no key required, ~10-30 calls/min)
// ──────────────────────────────────────────────────────────────
async function fetchCrypto() {
  const cacheKey = 'crypto:top15'
  const cached = getCached<any>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const url = 'https://api.coingecko.com/api/v3/coins/markets' +
    '?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h'

  const res = await fetch(url, {
    headers: { 'accept': 'application/json' },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    return NextResponse.json(
      { error: `CoinGecko responded ${res.status}` },
      { status: 502 }
    )
  }
  const raw = await res.json()
  const markets = (raw as any[]).map((c) => ({
    id: c.id,
    symbol: c.symbol?.toUpperCase() || '',
    name: c.name,
    price: c.current_price ?? 0,
    marketCap: c.market_cap ?? 0,
    volume24h: c.total_volume ?? 0,
    change24h: c.price_change_percentage_24h ?? 0,
    high24h: c.high_24h ?? 0,
    low24h: c.low_24h ?? 0,
    image: c.image,
  }))

  const payload = { markets, source: 'CoinGecko', fetchedAt: new Date().toISOString() }
  setCached(cacheKey, payload)
  return NextResponse.json(payload)
}

// ──────────────────────────────────────────────────────────────
// FX: Frankfurter (ECB daily reference rates, no key)
// ──────────────────────────────────────────────────────────────
async function fetchFx() {
  const cacheKey = 'fx:latest'
  const cached = getCached<any>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const url = 'https://api.frankfurter.app/latest?from=USD'
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    return NextResponse.json({ error: `Frankfurter responded ${res.status}` }, { status: 502 })
  }
  const raw = await res.json()
  const payload = {
    base: raw.base,
    date: raw.date,
    rates: raw.rates,
    source: 'Frankfurter (ECB)',
    fetchedAt: new Date().toISOString(),
  }
  setCached(cacheKey, payload)
  return NextResponse.json(payload)
}

// ──────────────────────────────────────────────────────────────
// Equities: synthetic fallback (Stooq requires JS verification)
// We generate plausible-looking daily OHLCV bars for demo purposes.
// ──────────────────────────────────────────────────────────────
const EQUITY_BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20, AMZN: 178.90,
  GOOGL: 142.80, META: 487.60,
}

async function fetchEquity(symbol: string) {
  const sym = symbol.toUpperCase().trim()
  if (!EQUITY_BASE_PRICES[sym]) {
    return NextResponse.json(
      { error: `Symbol ${sym} not supported. Try: ${Object.keys(EQUITY_BASE_PRICES).join(', ')}` },
      { status: 404 }
    )
  }

  const cacheKey = `equity:${sym}`
  const cached = getCached<any>(cacheKey)
  if (cached) return NextResponse.json(cached)

  // Generate 90 days of synthetic OHLCV bars
  const basePrice = EQUITY_BASE_PRICES[sym]
  const volatility = sym === 'TSLA' || sym === 'NVDA' ? 0.025 : 0.012
  const bars: any[] = []
  let currentPrice = basePrice * 0.92 // start 8% below current
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    // Skip weekends
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

  const latest = bars[bars.length - 1]
  const payload = {
    symbol: sym,
    bars,
    latest,
    source: 'synthetic (Stooq requires JS verification)',
    fetchedAt: new Date().toISOString(),
    note: 'Equity data is synthetic. CoinGecko (crypto) and Frankfurter (FX) are real.',
  }
  setCached(cacheKey, payload)
  return NextResponse.json(payload)
}
