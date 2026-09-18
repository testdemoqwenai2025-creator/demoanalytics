import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [
    venueCount, symbolCount, tickCount, ohlcvCount,
    pipelineCount, datasetCount, modelCount, predictionCount,
    alertCount, activeIncidents, auditCount, savedQueryCount,
    firingAlerts, ackedAlerts,
  ] = await Promise.all([
    db.venue.count(),
    db.symbol.count(),
    db.tick.count(),
    db.ohlcvBar.count(),
    db.pipeline.count(),
    db.dataset.count(),
    db.mlModel.count(),
    db.prediction.count(),
    db.alert.count(),
    db.incident.count({ where: { status: { not: 'resolved' } } }),
    db.auditLog.count(),
    db.savedQuery.count(),
    db.alert.count({ where: { status: 'firing' } }),
    db.alert.count({ where: { status: 'acked' } }),
  ])

  const datasets = await db.dataset.findMany({ select: { sizeBytes: true, rowCount: true } })
  const totalSizeBytes = datasets.reduce((s, d) => s + d.sizeBytes, 0)
  const totalRows = datasets.reduce((s, d) => s + d.rowCount, 0)

  const pipelines = await db.pipeline.findMany()
  const runningPipelines = pipelines.filter(p => p.status === 'running').length
  const degradedPipelines = pipelines.filter(p => p.status === 'degraded').length
  const avgLagMs = pipelines.length > 0
    ? pipelines.reduce((s, p) => s + p.lagMs, 0) / pipelines.length
    : 0
  const totalThroughputMps = pipelines.reduce((s, p) => s + p.throughputMps, 0)

  return NextResponse.json({
    counts: {
      venues: venueCount, symbols: symbolCount, ticks: tickCount, ohlcvBars: ohlcvCount,
      pipelines: pipelineCount, datasets: datasetCount, mlModels: modelCount,
      predictions: predictionCount, alerts: alertCount, activeIncidents,
      auditLogs: auditCount, savedQueries: savedQueryCount,
    },
    storage: {
      totalSizeBytes, totalRows,
      totalSizeHuman: formatBytes(totalSizeBytes),
      totalRowsHuman: formatNumber(totalRows),
    },
    pipelines: {
      total: pipelineCount, running: runningPipelines, degraded: degradedPipelines,
      stopped: pipelineCount - runningPipelines - degradedPipelines,
      avgLagMs: Math.round(avgLagMs * 10) / 10,
      totalThroughputMps: Math.round(totalThroughputMps),
    },
    alerts: { firing: firingAlerts, acked: ackedAlerts },
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
