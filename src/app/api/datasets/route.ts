import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier')
  const namespace = searchParams.get('namespace')

  const where: any = {}
  if (tier) where.tier = tier
  if (namespace) where.namespace = namespace

  const datasets = await db.dataset.findMany({
    where,
    orderBy: { rowCount: 'desc' },
    include: { _count: { select: { queries: true } } },
  })

  return NextResponse.json({
    datasets: datasets.map(d => ({
      ...d,
      sizeHuman: formatBytes(d.sizeBytes),
      rowCountHuman: formatNumber(d.rowCount),
      queryCount: (d as any)._count.queries,
    })),
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatNumber(n: number): string {
  if (n === 0) return '0'
  const k = 1000
  const sizes = ['', 'K', 'M', 'B', 'T']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(2)}${sizes[i]}`
}
