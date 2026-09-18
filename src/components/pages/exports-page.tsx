'use client'

import * as React from 'react'
import {
  FileSpreadsheet, FileText, FileBox, Download, Database, FileJson, Table,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionHeading } from '@/components/dashboard/primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

type Dataset = 'pipelines' | 'datasets' | 'alerts' | 'models' | 'slos' | 'incidents'

const DATASETS: { id: Dataset; name: string; desc: string; icon: string }[] = [
  { id: 'pipelines', name: 'Pipelines', desc: '8 Flink pipeline metrics', icon: '⚙️' },
  { id: 'datasets', name: 'Datasets', desc: '8 lakehouse tables', icon: '📦' },
  { id: 'alerts', name: 'Alerts', desc: '8 active alerts', icon: '🔔' },
  { id: 'models', name: 'ML Models', desc: '4 model registry entries', icon: '🧠' },
  { id: 'slos', name: 'SLOs', desc: '3 service level objectives', icon: '📊' },
  { id: 'incidents', name: 'Incidents', desc: '2 postmortem records', icon: '🚨' },
]

function getData(id: Dataset): any[] {
  switch (id) {
    case 'pipelines': return SYNTHETIC_FALLBACK.pipelines
    case 'datasets': return SYNTHETIC_FALLBACK.datasets
    case 'alerts': return SYNTHETIC_FALLBACK.alerts
    case 'models': return SYNTHETIC_FALLBACK.mlModels
    case 'slos': return SYNTHETIC_FALLBACK.slos
    case 'incidents': return SYNTHETIC_FALLBACK.incidents
  }
}

export function ExportsPage() {
  return (
    <>
      <SectionHeading
        title="Data Export"
        description="Export dashboard data in multiple formats: Excel (.xlsx), PDF reports, CSV, JSON, and Parquet-ready."
      />

      <Tabs defaultValue="excel">
        <TabsList>
          <TabsTrigger value="excel"><FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel</TabsTrigger>
          <TabsTrigger value="pdf"><FileText className="h-3.5 w-3.5 mr-1.5" /> PDF</TabsTrigger>
          <TabsTrigger value="csv"><Table className="h-3.5 w-3.5 mr-1.5" /> CSV</TabsTrigger>
          <TabsTrigger value="json"><FileJson className="h-3.5 w-3.5 mr-1.5" /> JSON</TabsTrigger>
          <TabsTrigger value="parquet"><FileBox className="h-3.5 w-3.5 mr-1.5" /> Parquet</TabsTrigger>
        </TabsList>

        <TabsContent value="excel" className="mt-4">
          <ExportCard
            format="xlsx"
            icon={FileSpreadsheet}
            title="Excel Workbook (.xlsx)"
            description="Multi-sheet Excel workbook with formatted headers. Each dataset gets its own tab."
            onExport={(dataset) => exportExcel(dataset)}
          />
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <ExportCard
            format="pdf"
            icon={FileText}
            title="PDF Report"
            description="Formatted PDF report with title, timestamp, and tabular data. Suitable for compliance archives."
            onExport={(dataset) => exportPdf(dataset)}
          />
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <ExportCard
            format="csv"
            icon={Table}
            title="CSV (Comma-Separated Values)"
            description="Plain CSV file. Opens in Excel, Google Sheets, or any text editor."
            onExport={(dataset) => exportCsv(dataset)}
          />
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <ExportCard
            format="json"
            icon={FileJson}
            title="JSON"
            description="Pretty-printed JSON. Suitable for API integration or programmatic consumption."
            onExport={(dataset) => exportJson(dataset)}
          />
        </TabsContent>

        <TabsContent value="parquet" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileBox className="h-4 w-4" /> Parquet (Apache Arrow)
              </CardTitle>
              <CardDescription className="text-xs">
                Columnar format for big data pipelines (Spark, Pandas, DuckDB).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/30 p-4 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Parquet export requires a server-side runtime</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  The browser cannot generate Parquet files directly. Deploy the private repo to
                  Vercel/Render with a real backend, then this tab will produce real Parquet files
                  via the <code className="bg-muted px-1 rounded font-mono">/api/export/parquet</code> endpoint.
                </p>
                <Badge variant="outline" className="text-[10px]">Requires backend deployment</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function ExportCard({ format, icon: Icon, title, description, onExport }: {
  format: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onExport: (dataset: Dataset) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATASETS.map(d => (
            <div key={d.id} className="rounded-md border p-3 flex items-center gap-3">
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.desc}</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px]"
                onClick={() => onExport(d.id)}>
                <Download className="h-3 w-3 mr-1" /> .{format}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Export functions
// ──────────────────────────────────────────────────────────────

function exportCsv(dataset: Dataset) {
  const data = getData(dataset)
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  downloadFile(csv, `meridian-${dataset}-${Date.now()}.csv`, 'text/csv')
  toast.success(`Exported ${dataset} as CSV`)
}

function exportJson(dataset: Dataset) {
  const data = getData(dataset)
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `meridian-${dataset}-${Date.now()}.json`, 'application/json')
  toast.success(`Exported ${dataset} as JSON`)
}

function exportExcel(dataset: Dataset) {
  const data = getData(dataset)
  if (!data.length) return

  // Create a workbook with a single sheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, dataset.charAt(0).toUpperCase() + dataset.slice(1))

  // Also add a summary sheet with all datasets
  const summaryData = DATASETS.map(d => ({
    Dataset: d.name,
    Description: d.desc,
    RecordCount: getData(d.id).length,
  }))
  const summaryWs = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  // Write the file
  XLSX.writeFile(wb, `meridian-${dataset}-${Date.now()}.xlsx`)
  toast.success(`Exported ${dataset} as Excel`, { description: 'Multi-sheet workbook with summary tab' })
}

function exportPdf(dataset: Dataset) {
  const data = getData(dataset)
  if (!data.length) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`MERIDIAN ${dataset.charAt(0).toUpperCase() + dataset.slice(1)} Report`, 40, 40)

  // Subtitle
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 40, 58)
  doc.text(`Records: ${data.length}`, 40, 72)

  // Table headers
  const headers = Object.keys(data[0]).slice(0, 8)  // limit to 8 columns for landscape
  const colWidth = (pageWidth - 80) / headers.length

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  let y = 95
  headers.forEach((h, i) => {
    doc.text(h, 40 + i * colWidth, y)
  })

  // Horizontal line
  doc.setLineWidth(0.5)
  doc.line(40, y + 5, pageWidth - 40, y + 5)

  // Table rows
  doc.setFont('helvetica', 'normal')
  y += 18
  data.slice(0, 25).forEach((row, idx) => {  // limit to 25 rows per page
    if (y > pageHeight - 40) {
      doc.addPage()
      y = 40
    }
    headers.forEach((h, i) => {
      const value = String(row[h] ?? '').slice(0, 30)
      doc.text(value, 40 + i * colWidth, y)
    })
    y += 14
  })

  // Footer
  doc.setFontSize(8)
  doc.text(`Page ${doc.getNumberOfPages()} | MERIDIAN Data Analyst Template | MIT License`, 40, pageHeight - 20)

  doc.save(`meridian-${dataset}-${Date.now()}.pdf`)
  toast.success(`Exported ${dataset} as PDF`, { description: `${data.length} records, ${headers.length} columns` })
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
