import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const slos = await db.slo.findMany({ orderBy: { tier: 'asc' } })
  return NextResponse.json({
    slos: slos.map(s => ({
      ...s,
      budgetRemainingPct: Math.round((100 - s.budgetConsumedPct) * 10) / 10,
      healthStatus: s.burnRate1h > 2 ? 'critical' :
                    s.burnRate1h > 1 ? 'warning' :
                    s.budgetConsumedPct > 70 ? 'warning' : 'healthy',
    })),
  })
}
