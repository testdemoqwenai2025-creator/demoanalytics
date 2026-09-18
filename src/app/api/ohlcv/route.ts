import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const timeframe = searchParams.get('timeframe') || '1m'
  const limit = parseInt(searchParams.get('limit') || '120')

  const sym = await db.symbol.findFirst({ where: { ticker: symbol } })
  if (!sym) return NextResponse.json({ bars: [], symbol: null }, { status: 404 })

  const bars = await db.ohlcvBar.findMany({
    where: { symbolId: sym.id, timeframe },
    orderBy: { ts: 'asc' },
    take: Math.min(limit, 500),
  })

  return NextResponse.json({
    symbol,
    timeframe,
    bars: bars.map(b => ({
      ts: b.ts,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    })),
    count: bars.length,
  })
}
