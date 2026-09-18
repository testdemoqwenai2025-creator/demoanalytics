import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [symbols, venues] = await Promise.all([
    db.symbol.findMany({ orderBy: { ticker: 'asc' } }),
    db.venue.findMany({ orderBy: { code: 'asc' } }),
  ])
  return NextResponse.json({ symbols, venues })
}
