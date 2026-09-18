import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const models = await db.mlModel.findMany({
    include: { _count: { select: { predictions: true } } },
    orderBy: [{ status: 'asc' }, { deployedAt: 'desc' }],
  })

  return NextResponse.json({
    models: models.map(m => ({
      id: m.id,
      name: m.name,
      version: m.version,
      type: m.type,
      framework: m.framework,
      status: m.status,
      accuracy: m.accuracy,
      p99InferenceMs: m.p99InferenceMs,
      driftScore: m.driftScore,
      deployedAt: m.deployedAt,
      retiredAt: m.retiredAt,
      predictionCount: (m as any)._count.predictions,
      driftStatus: m.driftScore > 0.3 ? 'critical' :
                   m.driftScore > 0.15 ? 'warning' : 'healthy',
    })),
  })
}
