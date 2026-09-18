'use client'

import * as React from 'react'
import { Key, Trash2, Eye, EyeOff, Save, RotateCcw, ExternalLink, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SectionHeading } from '@/components/dashboard/primitives'
import { useDashboardStore } from '@/lib/store'
import { DATA_SOURCES } from '@/lib/data-sources'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export function SettingsPage() {
  const apiKeys = useDashboardStore(s => s.apiKeys)
  const setApiKey = useDashboardStore(s => s.setApiKey)
  const clearUsage = useDashboardStore(s => s.clearUsage)
  const usageLog = useDashboardStore(s => s.usageLog)
  const { theme, setTheme } = useTheme()

  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})

  const handleSaveKey = (provider: string, value: string) => {
    setApiKey(provider as any, value)
    toast.success(`${provider} API key saved`, { description: 'Stored in browser localStorage. Never sent to any server except the provider.' })
  }

  const handleClearUsage = () => {
    clearUsage()
    toast.success('API usage tracking cleared')
  }

  return (
    <>
      <SectionHeading
        title="Settings"
        description="Manage API keys, data sources, and preferences. All stored in your browser — nothing is transmitted to our servers."
      />

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" /> API Keys
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your free API keys to unlock higher rate limits. Keys are stored in localStorage and only sent to the respective provider's API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DATA_SOURCES.filter(s => s.requiresApiKey).map(source => (
            <ApiKeyInput
              key={source.id}
              source={source}
              value={apiKeys[source.id as keyof typeof apiKeys] || ''}
              show={showKeys[source.id] || false}
              onToggleShow={() => setShowKeys(prev => ({ ...prev, [source.id]: !prev[source.id] }))}
              onSave={(v) => handleSaveKey(source.id, v)}
            />
          ))}
          {DATA_SOURCES.filter(s => !s.requiresApiKey).length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="text-xs font-medium mb-1">No key required:</div>
              <div className="flex flex-wrap gap-1.5">
                {DATA_SOURCES.filter(s => !s.requiresApiKey).map(s => (
                  <Badge key={s.id} variant="outline" className="text-[10px]">{s.name}</Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">These providers work without any API key.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Theme</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark mode</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                Light
              </Button>
              <Button size="sm" variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                Dark
              </Button>
              <Button size="sm" variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">API Usage Tracking</CardTitle>
          <CardDescription className="text-xs">
            Total API calls tracked in this browser session. Used to enforce free-tier limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <UsageStat label="Total calls" value={usageLog.length} />
            {DATA_SOURCES.filter(s => s.active).map(s => {
              const count = usageLog.filter(e => e.provider === s.id).length
              return <UsageStat key={s.id} label={s.name} value={count} />
            })}
          </div>
          <Button size="sm" variant="outline" onClick={handleClearUsage}>
            <RotateCcw className="h-3 w-3 mr-1" /> Clear usage tracking
          </Button>
        </CardContent>
      </Card>

      {/* Data sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Sources</CardTitle>
          <CardDescription className="text-xs">Configure which data providers are active in the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DATA_SOURCES.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-md border p-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <Badge variant="outline" className="text-[9px]">{s.category}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a href={s.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
                    docs <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <Switch checked={s.active} disabled />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">Privacy &amp; Data Storage</h3>
          <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <li>• API keys are stored in your browser's <code className="text-[10px] bg-muted px-1 rounded font-mono">localStorage</code> — never in cookies, never sent to any server except the respective API provider</li>
            <li>• Usage tracking is stored in <code className="text-[10px] bg-muted px-1 rounded font-mono">localStorage</code> — only the last 1,000 calls are retained</li>
            <li>• Login state is stored in <code className="text-[10px] bg-muted px-1 rounded font-mono">localStorage</code> — mock only, no real credentials</li>
            <li>• Clearing your browser data will reset all settings, API keys, and usage tracking</li>
            <li>• No data is ever sent to a server controlled by this template — all API calls go directly from your browser to the provider</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}

function ApiKeyInput({ source, value, show, onToggleShow, onSave }: {
  source: typeof DATA_SOURCES[number]
  value: string
  show: boolean
  onToggleShow: () => void
  onSave: (v: string) => void
}) {
  const [localValue, setLocalValue] = React.useState(value)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => { setLocalValue(value) }, [value])

  const handleSave = () => {
    onSave(localValue)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-sm font-medium">{source.name}</Label>
          <p className="text-[10px] text-muted-foreground">{source.description}</p>
        </div>
        {source.apiKeyUrl && (
          <a href={source.apiKeyUrl} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
            Get key <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? 'text' : 'password'}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            placeholder={`Enter ${source.name} API key...`}
            className="h-8 text-xs pr-9"
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={localValue === value && !saved}>
          {saved ? <><Check className="h-3 w-3 mr-1" /> Saved</> : <><Save className="h-3 w-3 mr-1" /> Save</>}
        </Button>
        {value && (
          <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" onClick={() => { onSave(''); setLocalValue('') }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span>Free: {source.freeTierLimit} ({source.freeTierRateLimit})</span>
        <span>{value ? '✓ Key set' : 'No key set'}</span>
      </div>
    </div>
  )
}

function UsageStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2">
      <div className="text-[10px] text-muted-foreground truncate">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  )
}
