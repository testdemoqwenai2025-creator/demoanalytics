'use client'

import * as React from 'react'
import { Sparkles, RefreshCw, Copy, Download, FileText, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeading } from '@/components/dashboard/primitives'
import { generateBrief, formatBriefAsText, type StoryBrief, type StoryVoice, type DetectedPattern } from '@/lib/story-engine'
import { toast } from 'sonner'

export function StoriesPage() {
  const [voice, setVoice] = React.useState<StoryVoice>('analyst')
  const [brief, setBrief] = React.useState<StoryBrief | null>(null)
  const [loading, setLoading] = React.useState(true)

  const regenerate = React.useCallback((v: StoryVoice) => {
    setLoading(true)
    // Simulate "analysis" delay for UX
    setTimeout(() => {
      setBrief(generateBrief(v))
      setLoading(false)
    }, 800)
  }, [])

  React.useEffect(() => {
    regenerate(voice)
  }, [voice, regenerate])

  const handleCopy = () => {
    if (!brief) return
    navigator.clipboard.writeText(formatBriefAsText(brief))
    toast.success('Brief copied to clipboard')
  }

  const handleDownload = () => {
    if (!brief) return
    const text = formatBriefAsText(brief)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meridian-brief-${brief.voice}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Brief downloaded')
  }

  return (
    <>
      <SectionHeading
        title="Data Stories"
        description="Auto-generated narrative briefs that read the dashboard and explain what's happening — no LLM, pure statistical pattern detection."
        action={
          <Button size="sm" variant="outline" onClick={() => regenerate(voice)} disabled={loading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        }
      />

      {/* What is this? */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">The first dashboard that explains itself</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Most dashboards show you data and expect you to interpret it. Data Stories reads the
              data for you and writes a plain-English analysis. It detects spikes, trends, correlations,
              degradations, and alert clusters — then renders them as a narrative brief in your
              chosen voice. No API calls, no latency, no cost. Runs entirely in your browser.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-[10px]">7 pattern types</Badge>
              <Badge variant="outline" className="text-[10px]">3 voice presets</Badge>
              <Badge variant="outline" className="text-[10px]">~{brief?.readingTimeMin || 1} min read</Badge>
              <Badge variant="outline" className="text-[10px]">zero API calls</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice selector */}
      <Tabs value={voice} onValueChange={(v) => setVoice(v as StoryVoice)}>
        <TabsList>
          <TabsTrigger value="executive">📈 Executive</TabsTrigger>
          <TabsTrigger value="analyst">🔬 Analyst</TabsTrigger>
          <TabsTrigger value="compliance">🛡 Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value={voice} className="mt-4">
          {loading || !brief ? (
            <Card>
              <CardContent className="p-8 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <p className="text-xs text-muted-foreground mt-4">Analyzing dashboard data...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Headline */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Headline
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{brief.headline}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>Generated: {new Date(brief.generatedAt).toLocaleTimeString('en-US')}</span>
                    <span>·</span>
                    <span>Voice: {brief.voice}</span>
                    <span>·</span>
                    <span>~{brief.readingTimeMin} min read</span>
                  </div>
                </CardContent>
              </Card>

              {/* Key metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1.5">
                    {brief.keyMetrics.map((m, i) => (
                      <li key={i} className="font-mono leading-relaxed">{m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Patterns */}
              {brief.patterns.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Patterns Detected ({brief.patterns.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Statistical anomalies and notable events in the current data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {brief.patterns.map((p, i) => (
                        <PatternCard key={i} pattern={p} voice={brief.voice} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {brief.alerts.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1.5">
                      {brief.alerts.map((a, i) => (
                        <li key={i} className="font-mono leading-relaxed p-2 rounded bg-muted/40">• {a}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="border-l-4 border-l-amber-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Recommended Actions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Template-based suggestions derived from detected patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="text-xs space-y-2">
                    {brief.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-1" /> Copy as text
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-3 w-3 mr-1" /> Download .txt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => regenerate(voice)}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                </Button>
              </div>

              {/* Plain text preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Plain Text Preview
                  </CardTitle>
                  <CardDescription className="text-xs">What the brief looks like as copy-pasted text</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-[10px] font-mono bg-muted/40 p-3 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                    {formatBriefAsText(brief)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

function PatternCard({ pattern, voice }: { pattern: DetectedPattern; voice: StoryVoice }) {
  const severityColors = {
    critical: 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
    warning: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900',
    info: 'border-sky-300 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900',
  }

  const typeIcons: Record<string, string> = {
    spike: '📈', trend: '📉', correlation: '🔗', regime_change: '🔄',
    anomaly: '⚠️', cluster: '🔥', degradation: '🔻',
  }

  return (
    <div className={`rounded-md border p-3 ${severityColors[pattern.severity]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{typeIcons[pattern.type] || '•'}</span>
        <span className="text-sm font-medium">{pattern.title}</span>
        <Badge variant="outline" className="text-[9px] ml-auto uppercase">{pattern.severity}</Badge>
      </div>
      <p className="text-xs leading-relaxed mb-2">{pattern.description}</p>
      {voice === 'analyst' && (
        <p className="text-[10px] font-mono text-muted-foreground p-1.5 rounded bg-background/60">
          {pattern.evidence}
        </p>
      )}
    </div>
  )
}
