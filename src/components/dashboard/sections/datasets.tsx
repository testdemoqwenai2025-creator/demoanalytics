'use client'

import * as React from 'react'
import { Database, Search, HardDrive, Rows3, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFetch } from '@/hooks/use-fetch'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { SectionHeading, StatusPill, EmptyState } from '../primitives'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DatasetsSection() {
  const [tierFilter, setTierFilter] = React.useState<string>('all')
  const [search, setSearch] = React.useState('')
  const { data, loading } = useFetch<{ datasets: any[] }>('/api/datasets', {
    refreshInterval: 60000,
    staticFallback: () => ({ datasets: SYNTHETIC_FALLBACK.datasets }),
  })

  const filtered = React.useMemo(() => {
    if (!data?.datasets) return []
    return data.datasets.filter(d => {
      if (tierFilter !== 'all' && d.tier !== tierFilter) return false
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
          !d.namespace.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data, tierFilter, search])

  return (
    <>
      <SectionHeading
        title="Lakehouse Datasets"
        description="Apache Iceberg tables across hot / warm / cold / archive tiers."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter by name or namespace..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="archive">Archive</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[11px]">
          {filtered.length} of {data?.datasets.length || 0}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No datasets match filters" />
          ) : (
            <ScrollArea className="h-[calc(100vh-260px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Dataset</TableHead>
                    <TableHead className="w-[100px]">Tier</TableHead>
                    <TableHead className="w-[100px]">Format</TableHead>
                    <TableHead className="w-[140px]">Rows</TableHead>
                    <TableHead className="w-[120px]">Size</TableHead>
                    <TableHead>Partition Keys</TableHead>
                    <TableHead className="w-[80px] text-right">Queries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id} className="hover:bg-accent/40">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-medium">{d.name}</span>
                          <span className="text-[10px] text-muted-foreground">{d.namespace}</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusPill status={d.tier} /></TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{d.format}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{d.rowCountHuman}</TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{d.sizeHuman}</TableCell>
                      <TableCell>
                        <code className="text-[10px] text-muted-foreground">{d.partitionKeys}</code>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">{d.queryCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Schema preview */}
      {filtered.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Schema: <span className="font-mono">{filtered[0].name}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-[11px] font-mono bg-muted/40 p-3 rounded-md overflow-x-auto">
{`table:    ${filtered[0].name}
format:    ${filtered[0].format}
partition: ${filtered[0].partitionKeys}
rows:      ${filtered[0].rowCountHuman}
size:      ${filtered[0].sizeHuman}

schema:
${formatSchema(filtered[0].schemaJson)}`}
            </pre>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function formatSchema(json: string): string {
  try {
    const obj = JSON.parse(json)
    return Object.entries(obj).map(([k, v]) => `  ${k.padEnd(16)} ${v}`).join('\n')
  } catch {
    return json
  }
}
