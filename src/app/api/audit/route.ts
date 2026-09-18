import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  const result = searchParams.get('result')

  const where: any = {}
  if (result) where.result = result

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { ts: 'desc' },
    take: Math.min(limit, 500),
  })

  return NextResponse.json({
    logs: logs.map(l => ({ ...l, tsHuman: l.ts.toISOString() })),
    count: logs.length,
  })
}
