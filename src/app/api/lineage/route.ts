import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const edges = await db.lineageEdge.findMany({ orderBy: { sourceName: 'asc' } })

  // Build nodes and edges for graph rendering
  const nodeSet = new Map<string, { id: string; type: string; name: string }>()
  for (const e of edges) {
    const srcId = `${e.sourceType}:${e.sourceName}`
    const tgtId = `${e.targetType}:${e.targetName}`
    if (!nodeSet.has(srcId)) nodeSet.set(srcId, { id: srcId, type: e.sourceType, name: e.sourceName })
    if (!nodeSet.has(tgtId)) nodeSet.set(tgtId, { id: tgtId, type: e.targetType, name: e.targetName })
  }

  return NextResponse.json({
    nodes: Array.from(nodeSet.values()),
    edges: edges.map(e => ({
      source: `${e.sourceType}:${e.sourceName}`,
      target: `${e.targetType}:${e.targetName}`,
      relation: e.relation,
    })),
    rawEdges: edges,
  })
}
