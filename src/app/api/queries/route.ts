import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const queries = await db.savedQuery.findMany({
    include: { dataset: true },
    orderBy: [{ isStarred: 'desc' }, { executionCount: 'desc' }],
  })
  return NextResponse.json({
    queries: queries.map(q => ({
      ...q,
      datasetName: q.dataset?.name,
    })),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, sqlText, description, datasetId, createdBy } = body
  if (!name || !sqlText) {
    return NextResponse.json({ error: 'name and sqlText required' }, { status: 400 })
  }
  const q = await db.savedQuery.create({
    data: { name, sqlText, description, datasetId, createdBy: createdBy || 'anonymous' },
  })
  return NextResponse.json({ query: q })
}
