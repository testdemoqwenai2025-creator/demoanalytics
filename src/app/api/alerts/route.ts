import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')

  const where: any = {}
  if (status) where.status = status
  if (severity) where.severity = severity

  const alerts = await db.alert.findMany({
    where,
    orderBy: { firedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    alerts: alerts.map(a => ({
      ...a,
      firedAtHuman: a.firedAt.toISOString(),
      ageMin: Math.floor((Date.now() - a.firedAt.getTime()) / 60000),
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, action, ackedBy } = body

  if (action === 'ack') {
    const updated = await db.alert.update({
      where: { id },
      data: { status: 'acked', ackedBy, ackedAt: new Date() },
    })
    return NextResponse.json({ alert: updated })
  }
  if (action === 'resolve') {
    const updated = await db.alert.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() },
    })
    return NextResponse.json({ alert: updated })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
