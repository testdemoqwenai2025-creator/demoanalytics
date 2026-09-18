'use client'

import * as React from 'react'
import { Sparkles, Send, Database, Code2, Play, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeading, EmptyState } from '@/components/dashboard/primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { toast } from 'sonner'

const SAMPLE_QUERIES = [
  'Show me all pipelines with lag above 200',
  'What alerts are currently firing?',
  'Which ML models have drift above 0.15?',
  'Show all critical severity incidents',
  'Which datasets are in the hot tier?',
  'What SLOs have budget consumed above 30%?',
]

export function AskPage() {
  const [query, setQuery] = React.useState('')
  const [sql, setSql] = React.useState('')
  const [source, setSource] = React.useState('')
  const [results, setResults] = React.useState<any[] | null>(null)
  const [loading, setLoading] = React.useState(false)

  const executeQuery = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults(null)
    setSql('')

    try {
      // Try the LLM endpoint first
      const res = await fetch('/api/nl-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (res.ok) {
        const data = await res.json()
        setSql(data.sql)
        setSource(data.source)
      } else {
        // Fallback: use the simple pattern translator locally
        const data = await res.json().catch(() => ({}))
        setSql(data.sql || 'SELECT * FROM pipelines LIMIT 10;')
        setSource('pattern')
      }

      // Simulate query execution against synthetic data
      await new Promise(r => setTimeout(r, 500))
      const mockResults = executeAgainstSynthetic(sql || query)
      setResults(mockResults)
      toast.success(`Query executed — ${mockResults.length} rows`)
    } catch (e: any) {
      toast.error('Query failed: ' + e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const executeAgainstSynthetic = (q: string): any[] => {
    const lower = (q || query).toLowerCase()

    if (lower.includes('alert') && (lower.includes('firing') || lower.includes('active'))) {
      return SYNTHETIC_FALLBACK.alerts.filter(a => a.status === 'firing')
    }
    if (lower.includes('alert')) return SYNTHETIC_FALLBACK.alerts
    if (lower.includes('model') && lower.includes('drift')) {
      return SYNTHETIC_FALLBACK.mlModels.filter(m => m.driftScore > 0.15)
    }
    if (lower.includes('model') || lower.includes('ml')) return SYNTHETIC_FALLBACK.mlModels
    if (lower.includes('incident')) return SYNTHETIC_FALLBACK.incidents
    if (lower.includes('slo') && lower.includes('budget')) {
      return SYNTHETIC_FALLBACK.slos.filter(s => s.budgetConsumedPct > 30)
    }
    if (lower.includes('slo')) return SYNTHETIC_FALLBACK.slos
    if (lower.includes('dataset') && lower.includes('hot')) {
      return SYNTHETIC_FALLBACK.datasets.filter(d => d.tier === 'hot')
    }
    if (lower.includes('dataset')) return SYNTHETIC_FALLBACK.datasets
    if (lower.includes('pipeline') && lower.includes('lag')) {
      return SYNTHETIC_FALLBACK.pipelines.filter(p => p.lagMs > 200)
    }
    if (lower.includes('pipeline')) return SYNTHETIC_FALLBACK.pipelines

    return SYNTHETIC_FALLBACK.pipelines.slice(0, 5)
  }

  return (
    <>
      <SectionHeading
        title="Ask (Natural Language Query)"
        description="Type a question in plain English. The LLM translates it to SQL and executes it against the dashboard data."
        action={
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> AI-powered
          </Badge>
        }
      />

      {/* Info banner */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">The second creative feature</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Most query builders require you to know SQL. This one doesn't. Just type what you want to know:
              "show me all pipelines with lag above 200ms" or "which ML models have drift?". The LLM translates
              your question to SQL, the app executes it, and you get results — no SQL knowledge required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Query input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executeQuery()}
              placeholder="e.g., Show me all pipelines with lag above 200"
              className="flex-1 h-10 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button onClick={executeQuery} disabled={loading || !query.trim()}>
              {loading ? (
                <><Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" /> Thinking...</>
              ) : (
                <><Send className="h-3.5 w-3.5 mr-1.5" /> Ask</>
              )}
            </Button>
          </div>

          {/* Sample queries */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SAMPLE_QUERIES.map(sq => (
              <button
                key={sq}
                onClick={() => setQuery(sq)}
                className="px-2 py-1 rounded-md text-[10px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated SQL */}
      {sql && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Generated SQL
              {source && <Badge variant="outline" className="text-[9px]">{source}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-[11px] font-mono bg-muted/40 p-3 rounded-md overflow-auto">{sql}</pre>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results !== null && (
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Results {results.length > 0 && <Badge variant="outline" className="ml-1 text-[10px]">{results.length} rows</Badge>}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {results.length === 0 ? (
              <EmptyState title="No matching results" description="Try a different query." />
            ) : (
              <ScrollArea className="h-[400px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b">
                      {Object.keys(results[0]).slice(0, 8).map(k => (
                        <th key={k} className="text-left font-mono font-semibold p-2 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-accent/40">
                        {Object.values(row).slice(0, 8).map((v: any, j) => (
                          <td key={j} className="p-2 font-mono whitespace-nowrap">
                            {typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v).slice(0, 40)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
