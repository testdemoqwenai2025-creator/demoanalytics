'use client'

import * as React from 'react'
import { Database, Plus, Trash2, Play, Filter, ArrowDownUp, Download, Code2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeading, EmptyState } from '@/components/dashboard/primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { toast } from 'sonner'

interface FilterRule {
  id: string
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
  value: string
}

interface QueryBuilder {
  table: string
  columns: string[]
  filters: FilterRule[]
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
  limit: number
}

const TABLES: Record<string, any[]> = {
  pipelines: SYNTHETIC_FALLBACK.pipelines,
  datasets: SYNTHETIC_FALLBACK.datasets,
  alerts: SYNTHETIC_FALLBACK.alerts,
  models: SYNTHETIC_FALLBACK.mlModels,
  slos: SYNTHETIC_FALLBACK.slos,
  incidents: SYNTHETIC_FALLBACK.incidents,
}

const OPERATORS: { value: FilterRule['operator']; label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
  { value: 'contains', label: 'contains' },
]

export function QueryBuilderPage() {
  const [query, setQuery] = React.useState<QueryBuilder>({
    table: 'pipelines',
    columns: [],
    filters: [],
    sortColumn: null,
    sortDirection: 'asc',
    limit: 50,
  })
  const [results, setResults] = React.useState<any[] | null>(null)
  const [loading, setLoading] = React.useState(false)

  const tableData = TABLES[query.table] || []
  const allColumns = tableData.length > 0 ? Object.keys(tableData[0]) : []

  const addFilter = () => {
    if (allColumns.length === 0) return
    setQuery(q => ({
      ...q,
      filters: [...q.filters, {
        id: `filter-${Date.now()}`,
        column: allColumns[0],
        operator: 'eq',
        value: '',
      }]
    }))
  }

  const updateFilter = (id: string, field: keyof FilterRule, value: string) => {
    setQuery(q => ({
      ...q,
      filters: q.filters.map(f => f.id === id ? { ...f, [field]: value } : f)
    }))
  }

  const removeFilter = (id: string) => {
    setQuery(q => ({ ...q, filters: q.filters.filter(f => f.id !== id) }))
  }

  const toggleColumn = (col: string) => {
    setQuery(q => ({
      ...q,
      columns: q.columns.includes(col)
        ? q.columns.filter(c => c !== col)
        : [...q.columns, col]
    }))
  }

  const executeQuery = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    let result = [...tableData]

    // Apply filters
    for (const filter of query.filters) {
      result = result.filter(row => {
        const val = row[filter.column]
        const filterVal = filter.value
        switch (filter.operator) {
          case 'eq': return String(val) === filterVal
          case 'neq': return String(val) !== filterVal
          case 'gt': return Number(val) > Number(filterVal)
          case 'lt': return Number(val) < Number(filterVal)
          case 'gte': return Number(val) >= Number(filterVal)
          case 'lte': return Number(val) <= Number(filterVal)
          case 'contains': return String(val).toLowerCase().includes(filterVal.toLowerCase())
          default: return true
        }
      })
    }

    // Apply sort
    if (query.sortColumn) {
      result.sort((a, b) => {
        const aVal = a[query.sortColumn!]
        const bVal = b[query.sortColumn!]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return query.sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        return query.sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      })
    }

    // Apply limit
    result = result.slice(0, query.limit)

    // Select columns
    if (query.columns.length > 0) {
      result = result.map(row => {
        const selected: any = {}
        query.columns.forEach(col => { selected[col] = row[col] })
        return selected
      })
    }

    setResults(result)
    setLoading(false)
    toast.success(`Query executed: ${result.length} rows returned`)
  }

  const exportResults = (format: 'csv' | 'json') => {
    if (!results || results.length === 0) return
    let content = ''
    if (format === 'json') {
      content = JSON.stringify(results, null, 2)
    } else {
      const headers = Object.keys(results[0])
      content = headers.join(',') + '\n'
      content += results.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-result-${Date.now()}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const generateSql = () => {
    const cols = query.columns.length > 0 ? query.columns.join(', ') : '*'
    const where = query.filters.length > 0
      ? '\nWHERE ' + query.filters.map(f => {
          const op = OPERATORS.find(o => o.value === f.operator)?.label || '='
          return `${f.column} ${op} '${f.value}'`
        }).join('\n  AND ')
      : ''
    const orderBy = query.sortColumn ? `\nORDER BY ${query.sortColumn} ${query.sortDirection.toUpperCase()}` : ''
    const limit = `\nLIMIT ${query.limit}`
    return `SELECT ${cols}\nFROM ${query.table}${where}${orderBy}${limit};`
  }

  return (
    <>
      <SectionHeading
        title="Visual Query Builder"
        description="Build queries without SQL. Select table, columns, filters, and sort — then execute or export the SQL."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Query builder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" /> Query Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table selection */}
            <div>
              <label className="text-xs font-medium">Table</label>
              <Select value={query.table} onValueChange={(v) => setQuery(q => ({ ...q, table: v, columns: [], filters: [] }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(TABLES).map(t => (
                    <SelectItem key={t} value={t}>{t} ({TABLES[t].length} rows)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Column selection */}
            <div>
              <label className="text-xs font-medium">Columns (click to toggle)</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  onClick={() => setQuery(q => ({ ...q, columns: [] }))}
                  className={`px-2 py-1 rounded text-[10px] font-medium ${
                    query.columns.length === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  All columns
                </button>
                {allColumns.map(col => (
                  <button
                    key={col}
                    onClick={() => toggleColumn(col)}
                    className={`px-2 py-1 rounded text-[10px] font-medium font-mono ${
                      query.columns.includes(col) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium flex items-center gap-1"><Filter className="h-3 w-3" /> Filters</label>
                <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={addFilter}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {query.filters.map(filter => (
                  <div key={filter.id} className="flex gap-1.5 items-center">
                    <Select value={filter.column} onValueChange={(v) => updateFilter(filter.id, 'column', v)}>
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allColumns.map(col => <SelectItem key={col} value={col} className="text-xs font-mono">{col}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filter.operator} onValueChange={(v: any) => updateFilter(filter.id, 'operator', v)}>
                      <SelectTrigger className="h-8 text-xs w-16"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map(op => <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={e => updateFilter(filter.id, 'value', e.target.value)}
                      placeholder="value"
                      className="h-8 text-xs flex-1"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeFilter(filter.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {query.filters.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">No filters — all rows will be returned.</p>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Sort by</label>
                <Select value={query.sortColumn || 'none'} onValueChange={(v) => setQuery(q => ({ ...q, sortColumn: v === 'none' ? null : v }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    {allColumns.map(col => <SelectItem key={col} value={col} className="text-xs font-mono">{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Direction</label>
                <Select value={query.sortDirection} onValueChange={(v: any) => setQuery(q => ({ ...q, sortDirection: v }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc" className="text-xs">Ascending ↑</SelectItem>
                    <SelectItem value="desc" className="text-xs">Descending ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="text-xs font-medium">Limit</label>
              <Input
                type="number"
                value={query.limit}
                onChange={e => setQuery(q => ({ ...q, limit: Number(e.target.value) || 50 }))}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <Button onClick={executeQuery} disabled={loading} className="w-full">
              <Play className="h-3.5 w-3.5 mr-1.5" /> {loading ? 'Executing...' : 'Execute Query'}
            </Button>
          </CardContent>
        </Card>

        {/* Results + SQL */}
        <div className="space-y-4">
          {/* Generated SQL */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4" /> Generated SQL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-[10px] font-mono bg-muted/40 p-3 rounded-md overflow-auto">{generateSql()}</pre>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm">Results {results && <Badge variant="outline" className="ml-1 text-[10px]">{results.length} rows</Badge>}</CardTitle>
              </div>
              {results && results.length > 0 && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => exportResults('csv')}>
                    <Download className="h-3 w-3 mr-1" /> CSV
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => exportResults('json')}>
                    <Download className="h-3 w-3 mr-1" /> JSON
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {!results ? (
                <div className="p-8"><EmptyState title="No results yet" description="Build a query and click Execute." /></div>
              ) : results.length === 0 ? (
                <div className="p-8"><EmptyState title="No matching rows" /></div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b">
                        {Object.keys(results[0]).map(k => (
                          <th key={k} className="text-left font-mono font-semibold p-2 whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-accent/40">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="p-2 font-mono whitespace-nowrap">
                              {typeof v === 'object' ? JSON.stringify(v).slice(0, 50) : String(v).slice(0, 50)}
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
        </div>
      </div>
    </>
  )
}
