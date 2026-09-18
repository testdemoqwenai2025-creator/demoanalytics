import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const label = searchParams.get('label')

  const where: any = {}
  if (label) where.label = label

  const preds = await db.prediction.findMany({
    where,
    orderBy: { ts: 'desc' },
    take: Math.min(limit, 200),
    include: { model: true, symbol: true },
  })

  return NextResponse.json({
    predictions: preds.map(p => ({
      id: p.id,
      ts: p.ts,
      model: p.model.name + ' ' + p.model.version,
      symbol: p.symbol?.ticker,
      score: p.score,
      label: p.label,
      confidence: p.confidence,
    })),
  })
}
