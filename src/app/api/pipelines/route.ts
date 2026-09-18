import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const pipelines = await db.pipeline.findMany({
    include: { _count: { select: { incidents: true } } },
    orderBy: { stage: 'asc' },
  })

  return NextResponse.json({
    pipelines: pipelines.map(p => ({
      id: p.id,
      name: p.name,
      stage: p.stage,
      description: p.description,
      status: p.status,
      parallelism: p.parallelism,
      throughputMps: p.throughputMps,
      throughputHuman: formatNumber(p.throughputMps) + ' msg/s',
      lagMs: p.lagMs,
      p99LatencyMs: p.p99LatencyMs,
      checkpointMs: p.checkpointMs,
      lastRestart: p.lastRestart,
      lastRestartHuman: timeAgo(p.lastRestart),
      incidentCount: (p as any)._count.incidents,
    })),
  })
}

function formatNumber(n: number): string {
  if (n === 0) return '0'
  const k = 1000
  const sizes = ['', 'K', 'M', 'B']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(2)}${sizes[i]}`
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
