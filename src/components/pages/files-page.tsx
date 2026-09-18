'use client'

import * as React from 'react'
import {
  Upload, Download, Trash2, FileText, FileJson, FileImage, File as FileIcon,
  Eye, X, FileDown, Database,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionHeading, EmptyState, StatCard } from '@/components/dashboard/primitives'
import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'
import { toast } from 'sonner'

interface StoredFile {
  id: string
  name: string
  size: number
  type: string
  content: string | ArrayBuffer
  uploadedAt: Date
}

export function FilesPage() {
  const [files, setFiles] = React.useState<StoredFile[]>([])
  const [dragOver, setDragOver] = React.useState(false)
  const [previewFile, setPreviewFile] = React.useState<StoredFile | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    Array.from(newFiles).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const stored: StoredFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result || '',
          uploadedAt: new Date(),
        }
        setFiles(prev => [stored, ...prev])
        toast.success(`${file.name} uploaded`, { description: `${formatSize(file.size)} · ${file.type || 'unknown type'}` })
      }
      // Read as text for text-based files, as data URL for images
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (previewFile?.id === id) setPreviewFile(null)
    toast.success('File deleted')
  }

  const downloadFile = (file: StoredFile) => {
    const blob = new Blob([file.content as string], { type: file.type || 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${file.name}`)
  }

  // Export dashboard data as CSV/JSON
  const exportData = (format: 'csv' | 'json', dataset: string) => {
    let data: any[] = []
    let filename = `${dataset}-export-${Date.now()}.${format}`

    if (dataset === 'pipelines') data = SYNTHETIC_FALLBACK.pipelines
    else if (dataset === 'datasets') data = SYNTHETIC_FALLBACK.datasets
    else if (dataset === 'alerts') data = SYNTHETIC_FALLBACK.alerts
    else if (dataset === 'models') data = SYNTHETIC_FALLBACK.mlModels

    let content = ''
    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
    } else {
      if (data.length === 0) return
      const headers = Object.keys(data[0])
      content = headers.join(',') + '\n'
      content += data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${dataset} as ${format.toUpperCase()}`, { description: filename })
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <>
      <SectionHeading
        title="File Management"
        description="Upload, preview, and download data files. All processing is client-side — nothing is uploaded to a server."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Files" value={files.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Total Size" value={formatSize(totalSize)} icon={<Database className="h-4 w-4" />} />
        <StatCard label="Max File Size" value="10 MB" icon={<Upload className="h-4 w-4" />} />
        <StatCard label="Storage" value="In-browser" hint="Not persisted" icon={<FileIcon className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload &amp; Preview</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 space-y-4">
          {/* Upload zone */}
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports CSV, JSON, TXT, images (PNG/JPG/SVG) · Max 10MB per file · Client-side only
              </p>
              <input ref={inputRef} type="file" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
            </CardContent>
          </Card>

          {/* File list */}
          {files.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uploaded Files ({files.length})</CardTitle>
                <CardDescription className="text-xs">Click a file to preview · Files are in-memory (cleared on page refresh)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs text-right">Size</TableHead>
                        <TableHead className="text-xs">Uploaded</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map(f => (
                        <TableRow key={f.id} className="hover:bg-accent/40 cursor-pointer"
                          onClick={() => setPreviewFile(f)}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileIcon(f.type)}
                              <span className="text-xs font-medium truncate max-w-[200px]">{f.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{f.type || 'unknown'}</Badge></TableCell>
                          <TableCell className="text-xs font-mono tabular-nums text-right">{formatSize(f.size)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{f.uploadedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setPreviewFile(f) }}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); downloadFile(f) }}>
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteFile(f.id) }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : null}

          {/* File preview */}
          {previewFile && (
            <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Dashboard Data</CardTitle>
              <CardDescription className="text-xs">Download synthetic dashboard data as CSV or JSON for analysis in external tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'pipelines', name: 'Pipelines', desc: '8 Flink pipeline metrics', icon: '⚙️' },
                  { id: 'datasets', name: 'Datasets', desc: '8 lakehouse tables', icon: '📦' },
                  { id: 'alerts', name: 'Alerts', desc: '8 active alerts', icon: '🔔' },
                  { id: 'models', name: 'ML Models', desc: '4 model registry entries', icon: '🧠' },
                ].map(d => (
                  <div key={d.id} className="rounded-md border p-3 flex items-center gap-3">
                    <span className="text-2xl">{d.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.desc}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => exportData('csv', d.id)}>
                        <FileDown className="h-3 w-3 mr-1" /> CSV
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => exportData('json', d.id)}>
                        <FileDown className="h-3 w-3 mr-1" /> JSON
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function FilePreview({ file, onClose }: { file: StoredFile; onClose: () => void }) {
  const content = file.content as string
  const isImage = file.type.startsWith('image/')
  const isJson = file.type.includes('json') || file.name.endsWith('.json')
  const isCsv = file.type.includes('csv') || file.name.endsWith('.csv')

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            {getFileIcon(file.type)}
            {file.name}
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {formatSize(file.size)} · {file.type || 'unknown'} · uploaded {file.uploadedAt.toLocaleTimeString()}
          </CardDescription>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isImage ? (
          <div className="flex justify-center">
            <img src={content} alt={file.name} className="max-h-96 rounded border" />
          </div>
        ) : isJson ? (
          <pre className="text-xs font-mono bg-muted/40 p-3 rounded-md overflow-auto max-h-96">
            {(() => {
              try { return JSON.stringify(JSON.parse(content), null, 2) } catch { return content }
            })()}
          </pre>
        ) : isCsv ? (
          <CsvPreview content={content} />
        ) : (
          <pre className="text-xs font-mono bg-muted/40 p-3 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">{content}</pre>
        )}
      </CardContent>
    </Card>
  )
}

function CsvPreview({ content }: { content: string }) {
  const rows = content.trim().split('\n').map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"')))
  if (rows.length === 0) return null

  return (
    <ScrollArea className="h-96">
      <Table>
        <TableHeader>
          <TableRow>
            {rows[0].map((h, i) => <TableHead key={i} className="text-xs">{h}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(1, 100).map((row, i) => (
            <TableRow key={i}>
              {row.map((c, j) => <TableCell key={j} className="text-xs font-mono">{c}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > 100 && <p className="text-xs text-muted-foreground text-center p-2">Showing 100 of {rows.length - 1} rows</p>}
    </ScrollArea>
  )
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-violet-500" />
  if (type.includes('json')) return <FileJson className="h-4 w-4 text-amber-500" />
  if (type.includes('csv') || type.includes('text')) return <FileText className="h-4 w-4 text-sky-500" />
  return <FileIcon className="h-4 w-4 text-muted-foreground" />
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
