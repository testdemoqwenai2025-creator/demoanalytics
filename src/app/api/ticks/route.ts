import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const venue = searchParams.get('venue')
  const limit = parseInt(searchParams.get('limit') || '200')
  const side = searchParams.get('side')

  const where: any = {}
  if (symbol) {
    const sym = await db.symbol.findFirst({ where: { ticker: symbol } })
    if (sym) where.symbolId = sym.id
  }
  if (venue) {
    const v = await db.venue.findFirst({ where: { code: venue } })
    if (v) where.venueId = v.id
  }
  if (side) where.side = side

  const ticks = await db.tick.findMany({
    where,
    orderBy: { ts: 'desc' },
    take: Math.min(limit, 1000),
    include: { symbol: true, venue: true },
  })

  return NextResponse.json({
    ticks: ticks.map(t => ({
      id: t.id,
      ts: t.ts,
      symbol: t.symbol.ticker,
      venue: t.venue.code,
      price: t.price,
      size: t.size,
      side: t.side,
      feedLagMs: t.feedLagMs,
    })),
    count: ticks.length,
  })
}
