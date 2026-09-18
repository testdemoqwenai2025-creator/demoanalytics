'use client'

import * as React from 'react'
import { Download, Upload, Database, RotateCcw, Check, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading, StatCard } from '@/components/dashboard/primitives'
import { toast } from 'sonner'

const BACKUP_KEYS = [
  'meridian-mock-auth',
  'meridian-api-keys',
  'meridian-api-usage',
  'meridian-feedback',
  'meridian-dashboard-layouts',
  'meridian-notification-channels',
  'meridian-notification-log',
  'theme',
]

interface BackupData {
  version: string
  exportedAt: string
  keys: Record<string, string>
}

export function BackupPage() {
  const [backupInfo, setBackupInfo] = React.useState<{ keys: number; size: number }>({ keys: 0, size: 0 })
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const info = { keys: 0, size: 0 }
    for (const key of BACKUP_KEYS) {
      const value = localStorage.getItem(key)
      if (value) {
        info.keys++
        info.size += value.length
      }
    }
    setBackupInfo(info)
  }, [])

  const handleBackup = () => {
    const data: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      keys: {},
    }

    for (const key of BACKUP_KEYS) {
      const value = localStorage.getItem(key)
      if (value) data.keys[key] = value
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meridian-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Backup exported', {
      description: `${Object.keys(data.keys).length} items, ${(json.length / 1024).toFixed(1)} KB`,
    })
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data: BackupData = JSON.parse(event.target?.result as string)
        if (!data.version || !data.keys) {
          throw new Error('Invalid backup file')
        }

        let restored = 0
        for (const [key, value] of Object.entries(data.keys)) {
          if (BACKUP_KEYS.includes(key)) {
            localStorage.setItem(key, value)
            restored++
          }
        }

        toast.success(`Restored ${restored} items from backup`, {
          description: `Backup was created on ${new Date(data.exportedAt).toLocaleString()}. Reload the page to see changes.`,
        })
        setTimeout(() => window.location.reload(), 2000)
      } catch (err: any) {
        toast.error('Restore failed', { description: err.message })
      }
    }
    reader.readAsText(file)
    e.target.value = '' // reset for re-import
  }

  const handleClearAll = () => {
    if (!confirm('This will delete ALL local data (auth, API keys, layouts, feedback, usage). Continue?')) return
    for (const key of BACKUP_KEYS) {
      localStorage.removeItem(key)
    }
    toast.success('All local data cleared')
    setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <>
      <SectionHeading
        title="Data Backup & Restore"
        description="Export all your local data (settings, API keys, layouts, feedback) to a JSON file. Restore on another browser or device."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Data Items" value={backupInfo.keys} icon={<Database className="h-4 w-4" />} />
        <StatCard label="Total Size" value={`${(backupInfo.size / 1024).toFixed(1)} KB`} />
        <StatCard label="Storage" value="localStorage" hint="Browser-local" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-500" /> Export Backup
            </CardTitle>
            <CardDescription className="text-xs">
              Download all local data as a JSON file. Includes auth state, API keys, usage tracking,
              saved layouts, feedback, and notification channels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup} className="w-full">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Backup
            </Button>
            <div className="mt-3 text-[10px] text-muted-foreground">
              <p>What's included:</p>
              <ul className="mt-1 space-y-0.5 ml-3">
                <li>• Auth state (email, role)</li>
                <li>• API keys (5 providers)</li>
                <li>• Usage tracking log</li>
                <li>• Saved dashboard layouts</li>
                <li>• Feedback entries</li>
                <li>• Notification channels + log</li>
                <li>• Theme preference</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-sky-500" /> Import Backup
            </CardTitle>
            <CardDescription className="text-xs">
              Upload a previously exported backup file. This overwrites your current local data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleRestore}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Select Backup File
            </Button>
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-2 text-[10px] text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              This will overwrite your current data. Export a backup first if you want to keep it.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            <RotateCcw className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Permanently delete all local data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearAll}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Clear All Local Data
          </Button>
        </CardContent>
      </Card>

      {/* Privacy note */}
      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Privacy:</strong> Your data never leaves your browser.
          The backup file is generated client-side and downloaded directly. No server is involved.
          The backup file contains your API keys in plain text — store it securely and don't share it.
        </CardContent>
      </Card>
    </>
  )
}
