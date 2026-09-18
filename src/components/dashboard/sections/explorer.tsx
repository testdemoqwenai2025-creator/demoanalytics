'use client'

import * as React from 'react'
import { Play, Save, Star, Clock, Database, Code2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFetch } from '@/hooks/use-fetch'
import { SectionHeading, EmptyState } from '../primitives'

export function ExplorerSection() {
  const [sql, setSql] = React.useState(`SELECT ts, price, size, side
FROM ticks.normalized
WHERE symbol = 'AAPL'
  AND ts > NOW() - INTERVAL '1 HOUR'
ORDER BY ts DESC
LIMIT 500`)
  const [running, setRunning] = React.useState(false)
  const [results, setResults] = React.useState<any[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = React.useState<number | null>(null)

  const { data: queriesData, loading: queriesLoading } = useFetch<{ queries: any[] }>('/api/queries')

  const runQuery = async () => {
    setRunning(true)
    setError(null)
    setResults(null)
    const start = performance.now()

    // Simulated query execution — in a real system this would hit Trino/Snowflake
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

    // Synthesize a result set from the SQL by looking for table hints
    const lower = sql.toLowerCase()
    let sample: any[] = []
    if (lower.includes('ticks.normalized')) {
      const { data: tickData } = await fetch('/api/ticks?limit=20').then(r => r.json())
      sample = tickData.ticks || []
    } else if (lower.includes('ohlcv')) {
      const sym = (sql.match(/symbol\s*=\s*'(\w+)'/i) || [])[1] || 'AAPL'
      const { data: ohlcvData } = await fetch(`/api/ohlcv?symbol=${sym}&limit=20`).then(r => r.json())
      sample = ohlcvData.bars || []
    } else if (lower.includes('pipelines')) {
      const { data: pData } = await fetch('/api/pipelines').then(r => r.json())
      sample = pData.pipelines || []
    } else if (lower.includes('alerts')) {
      const { data: aData } = await fetch('/api/alerts?limit=20').then(r => r.json())
      sample = aData.alerts || []
    } else {
      sample = Array.from({ length: 5 }, (_, i) => ({
        col1: `value_${i}`,
        col2: Math.random() * 100,
        col3: new Date(Date.now() - i * 60000).toISOString(),
      }))
    }

    const elapsed = performance.now() - start
    setElapsedMs(Math.round(elapsed))
    setResults(sample)
    setRunning(false)
  }

  return (
    <>
      <SectionHeading
        title="Data Explorer"
        description="Saved queries and ad-hoc SQL execution. Results powered by synthetic data API."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Saved queries sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" /> Saved Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[460px]">
              {queriesLoading ? (
                <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div>
              ) : !queriesData?.queries?.length ? (
                <EmptyState title="No saved queries" />
              ) : (
                <div className="space-y-1.5">
                  {queriesData.queries.map(q => (
                    <button
                      key={q.id}
                      onClick={() => setSql(q.sqlText)}
                      className="w-full text-left rounded-md border p-2.5 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        {q.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                        <span className="text-xs font-medium truncate flex-1">{q.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{q.description || q.sqlText.slice(0, 60) + '...'}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{q.lastRunMs}ms</span>
                        <span className="flex items-center gap-0.5"><Code2 className="h-2.5 w-2.5" />{q.executionCount} runs</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor + Results */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" /> SQL Editor</span>
                <div className="flex items-center gap-2">
                  {elapsedMs !== null && (
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                      {elapsedMs}ms · {results?.length || 0} rows
                    </Badge>
                  )}
                  <Button size="sm" onClick={runQuery} disabled={running} className="h-7 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    {running ? 'Running...' : 'Run'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sql}
                onChange={e => setSql(e.target.value)}
                className="font-mono text-xs min-h-[160px] resize-y"
                placeholder="Enter SQL..."
              />
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-3 text-xs text-destructive">{error}</CardContent>
            </Card>
          )}

          {results !== null && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  {results.length === 0 ? (
                    <EmptyState title="No rows returned" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-card">
                          <tr className="border-b">
                            {Object.keys(results[0]).map(k => (
                              <th key={k} className="text-left font-mono font-semibold p-2 whitespace-nowrap">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-accent/40">
                              {Object.values(row).map((v: any, j) => (
                                <td key={j} className="p-2 font-mono whitespace-nowrap">
                                  {typeof v === 'number' ? v.toLocaleString() :
                                   v instanceof Date ? v.toISOString() :
                                   String(v)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
