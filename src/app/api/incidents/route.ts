import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const incidents = await db.incident.findMany({
    include: { pipeline: true },
    orderBy: { startedAt: 'desc' },
  })

  return NextResponse.json({
    incidents: incidents.map(i => ({
      ...i,
      pipelineName: i.pipeline?.name,
      durationHuman: i.durationMin ? `${i.durationMin}m` : null,
    })),
  })
}
