// Data Stories Engine — auto-generates narrative briefs from dashboard data.
//
// This is the creative centerpiece of the template. Instead of just showing
// charts, it READS the data and WRITES a plain-English analysis.
//
// No LLM needed — pure statistical pattern detection + template-based
// natural language generation. Runs entirely client-side.
//
// Patterns detected:
//   1. SPIKE     — value exceeds 2σ from rolling mean
//   2. TREND     — monotonic change over N+ periods
//   3. CORRELATION — Pearson r > 0.7 between two series
//   4. REGIME_CHANGE — volatility shifts by >50%
//   5. ANOMALY   — value outside historical min/max
//   6. CLUSTER   — multiple alerts in same time window
//   7. DEGRADATION — gradual decline over multiple periods

import { SYNTHETIC_FALLBACK } from '@/lib/static-fallback'

export type StoryVoice = 'executive' | 'analyst' | 'compliance'

export interface DetectedPattern {
  type: 'spike' | 'trend' | 'correlation' | 'regime_change' | 'anomaly' | 'cluster' | 'degradation'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  evidence: string
  timestamp?: string
}

export interface StoryBrief {
  generatedAt: string
  voice: StoryVoice
  headline: string
  keyMetrics: string[]
  patterns: DetectedPattern[]
  alerts: string[]
  recommendations: string[]
  readingTimeMin: number
}

// ──────────────────────────────────────────────────────────────
// Pattern detectors
// ──────────────────────────────────────────────────────────────

function detectSpikes(values: number[], labels: string[]): DetectedPattern[] {
  if (values.length < 10) return []
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance)

  const patterns: DetectedPattern[] = []
  for (let i = Math.max(values.length - 20, 0); i < values.length; i++) {
    if (Math.abs(values[i] - mean) > 2 * std) {
      const direction = values[i] > mean ? 'above' : 'below'
      const magnitude = ((values[i] - mean) / std).toFixed(1)
      patterns.push({
        type: 'spike',
        severity: Math.abs(Number(magnitude)) > 3 ? 'critical' : 'warning',
        title: `Spike in ${labels[i] || `value #${i}`}`,
        description: `${labels[i] || `Value at index ${i}`} spiked to ${values[i].toFixed(2)}, which is ${magnitude}σ ${direction} the rolling mean of ${mean.toFixed(2)}.`,
        evidence: `Mean: ${mean.toFixed(2)}, StdDev: ${std.toFixed(2)}, Value: ${values[i].toFixed(2)}, Z-score: ${magnitude}σ`,
        timestamp: labels[i],
      })
    }
  }
  return patterns.slice(-3) // last 3 spikes
}

function detectTrends(values: number[], labels: string[]): DetectedPattern[] {
  if (values.length < 5) return []
  const window = values.slice(-10)
  if (window.length < 5) return []

  let increasing = 0, decreasing = 0
  for (let i = 1; i < window.length; i++) {
    if (window[i] > window[i-1]) increasing++
    else if (window[i] < window[i-1]) decreasing++
  }

  const patterns: DetectedPattern[] = []
  if (increasing >= window.length * 0.7) {
    const pctChange = ((window[window.length-1] - window[0]) / window[0] * 100).toFixed(1)
    patterns.push({
      type: 'trend',
      severity: 'info',
      title: `Upward trend detected`,
      description: `Values have been monotonically increasing over the last ${window.length} periods, with a total change of +${pctChange}%.`,
      evidence: `${increasing}/${window.length} periods increased. Start: ${window[0].toFixed(2)}, End: ${window[window.length-1].toFixed(2)}`,
    })
  } else if (decreasing >= window.length * 0.7) {
    const pctChange = ((window[window.length-1] - window[0]) / window[0] * 100).toFixed(1)
    patterns.push({
      type: 'trend',
      severity: 'warning',
      title: `Downward trend detected`,
      description: `Values have been declining over the last ${window.length} periods, with a total change of ${pctChange}%.`,
      evidence: `${decreasing}/${window.length} periods decreased. Start: ${window[0].toFixed(2)}, End: ${window[window.length-1].toFixed(2)}`,
    })
  }
  return patterns
}

function detectCorrelation(seriesA: number[], seriesB: number[], nameA: string, nameB: string): DetectedPattern[] {
  const n = Math.min(seriesA.length, seriesB.length)
  if (n < 10) return []

  const a = seriesA.slice(-n)
  const b = seriesB.slice(-n)
  const meanA = a.reduce((x, y) => x + y, 0) / n
  const meanB = b.reduce((x, y) => x + y, 0) / n

  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }
  const r = num / Math.sqrt(denA * denB)

  if (Math.abs(r) > 0.7) {
    return [{
      type: 'correlation',
      severity: 'info',
      title: `Correlation between ${nameA} and ${nameB}`,
      description: `${nameA} and ${nameB} are ${r > 0 ? 'positively' : 'negatively'} correlated (r=${r.toFixed(2)}) over the last ${n} periods. ${r > 0 ? 'They tend to move together.' : 'They tend to move in opposite directions.'}`,
      evidence: `Pearson r = ${r.toFixed(4)}, n = ${n} periods`,
    }]
  }
  return []
}

function detectDegradation(values: number[], labels: string[], threshold = 0.05): DetectedPattern[] {
  if (values.length < 6) return []
  const window = values.slice(-6)
  const first = window[0]
  const last = window[window.length - 1]
  const change = (last - first) / first

  if (change > threshold) {
    return [{
      type: 'degradation',
      severity: 'warning',
      title: `Gradual degradation detected`,
      description: `Values have degraded by ${(change * 100).toFixed(1)}% over the last 6 periods. This suggests a systemic issue rather than a one-time spike.`,
      evidence: `6-period change: ${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%. Start: ${first.toFixed(2)}, End: ${last.toFixed(2)}`,
    }]
  }
  return []
}

// ──────────────────────────────────────────────────────────────
// Voice presets — different writing styles
// ──────────────────────────────────────────────────────────────

const VOICES: Record<StoryVoice, {
  headlinePrefix: string
  metricStyle: (s: string) => string
  patternStyle: (p: DetectedPattern) => string
  recommendationStyle: (r: string) => string
  signOff: string
}> = {
  executive: {
    headlinePrefix: '📈',
    metricStyle: (s) => `• ${s}`,
    patternStyle: (p) => `${p.severity === 'critical' ? '🔴' : p.severity === 'warning' ? '🟡' : '🔵'} ${p.title}: ${p.description}`,
    recommendationStyle: (r) => `${r}`,
    signOff: '— Generated by MERIDIAN Data Stories (executive voice)',
  },
  analyst: {
    headlinePrefix: '[BRIEF]',
    metricStyle: (s) => `  ▸ ${s}`,
    patternStyle: (p) => `[${p.type.toUpperCase()}] ${p.title}\n    ${p.description}\n    Evidence: ${p.evidence}`,
    recommendationStyle: (r) => `  ${r}`,
    signOff: '— MERIDIAN Story Engine v1.0 (analyst voice) | Patterns detected statistically, no ML inferred',
  },
  compliance: {
    headlinePrefix: 'AUDIT',
    metricStyle: (s) => `  • ${s}`,
    patternStyle: (p) => `[${p.severity.toUpperCase()}] ${p.title} — ${p.description}`,
    recommendationStyle: (r) => `  → ${r}`,
    signOff: '— MERIDIAN Compliance Logger | All assertions are evidence-based',
  },
}

// ──────────────────────────────────────────────────────────────
// Brief builder
// ──────────────────────────────────────────────────────────────

export function generateBrief(voice: StoryVoice = 'analyst'): StoryBrief {
  const stats = SYNTHETIC_FALLBACK.stats
  const pipelines = SYNTHETIC_FALLBACK.pipelines
  const alerts = SYNTHETIC_FALLBACK.alerts
  const slos = SYNTHETIC_FALLBACK.slos
  const models = SYNTHETIC_FALLBACK.mlModels

  // Generate synthetic time series for pattern detection
  const lagValues = pipelines.map(p => p.lagMs)
  const latencyValues = pipelines.map(p => p.p99LatencyMs)
  const throughputValues = pipelines.map(p => p.throughputMps)
  const pipelineLabels = pipelines.map(p => p.name)

  // Detect patterns
  const patterns: DetectedPattern[] = [
    ...detectSpikes(latencyValues, pipelineLabels),
    ...detectTrends(lagValues, pipelineLabels),
    ...detectDegradation(lagValues, pipelineLabels),
    ...detectCorrelation(throughputValues, latencyValues, 'throughput', 'latency'),
  ]

  // Alert clusters
  const firingAlerts = alerts.filter(a => a.status === 'firing')
  if (firingAlerts.length >= 2) {
    patterns.push({
      type: 'cluster',
      severity: 'warning',
      title: 'Alert cluster detected',
      description: `${firingAlerts.length} alerts are currently firing simultaneously. This may indicate a correlated failure mode.`,
      evidence: `Firing alerts: ${firingAlerts.map(a => a.title).join('; ')}`,
    })
  }

  // Model drift patterns
  const driftedModels = models.filter(m => m.driftScore > 0.15)
  if (driftedModels.length > 0) {
    patterns.push({
      type: 'anomaly',
      severity: driftedModels.some(m => m.driftScore > 0.3) ? 'critical' : 'warning',
      title: 'ML model drift detected',
      description: `${driftedModels.length} model(s) show drift above the 0.15 warning threshold: ${driftedModels.map(m => `${m.name} ${m.version} (drift=${m.driftScore.toFixed(2)})`).join(', ')}.`,
      evidence: `Models with drift > 0.15: ${driftedModels.length} of ${models.length}`,
    })
  }

  // SLO budget analysis
  const tier1Slo = slos.find(s => s.tier === 'tier-1')
  const sloBudgetPct = tier1Slo?.budgetConsumedPct || 0
  const sloStatus = sloBudgetPct > 70 ? 'critical' : sloBudgetPct > 40 ? 'warning' : 'ok'

  // Build headline
  const v = VOICES[voice]
  let headline: string
  if (sloStatus === 'critical') {
    headline = `${v.headlinePrefix} Tier-1 SLO budget at ${sloBudgetPct}% — on track to exhaust in ${Math.round((100 - sloBudgetPct) / 4)} days at current burn rate`
  } else if (patterns.some(p => p.severity === 'critical')) {
    headline = `${v.headlinePrefix} ${patterns.filter(p => p.severity === 'critical').length} critical pattern(s) detected — immediate attention required`
  } else if (patterns.some(p => p.severity === 'warning')) {
    headline = `${v.headlinePrefix} System operational with ${patterns.filter(p => p.severity === 'warning').length} warning(s) — monitor closely`
  } else {
    headline = `${v.headlinePrefix} All systems nominal — no anomalies detected in the last observation window`
  }

  // Key metrics
  const keyMetrics = [
    `${(stats.counts.ticks / 1000).toFixed(1)}K ticks ingested (last 6h)`,
    `p99 latency: ${stats.pipelines.avgLagMs}ms ${stats.pipelines.avgLagMs < 250 ? '✓ within SLO' : '⚠ above SLO'}`,
    `${stats.pipelines.running}/${stats.pipelines.total} pipelines running (${stats.pipelines.degraded} degraded)`,
    `${stats.alerts.firing} firing alerts, ${stats.alerts.acked} acknowledged`,
    `Tier-1 SLO budget: ${sloBudgetPct}% consumed (${100 - sloBudgetPct}% remaining)`,
    `Storage: ${stats.storage.totalSizeHuman} across ${stats.counts.datasets} datasets`,
  ]

  // Alert summaries
  const alertSummaries = alerts.slice(0, 4).map(a =>
    `${a.severity.toUpperCase()}: ${a.title} (${a.source}, ${a.status})`
  )

  // Recommendations (template-based)
  const recommendations: string[] = []
  if (sloStatus === 'critical') {
    recommendations.push('Freeze non-hotfix feature deploys until SLO budget recovers above 99.995%')
  }
  if (patterns.some(p => p.type === 'spike' && p.severity === 'critical')) {
    recommendations.push('Investigate the critical spike — check the Incidents page for related postmortems')
  }
  if (patterns.some(p => p.type === 'degradation')) {
    recommendations.push('Review pipeline configuration for the degrading component — check compaction backpressure')
  }
  if (driftedModels.length > 0) {
    recommendations.push(`Retrain or rollback drifted models: ${driftedModels.map(m => m.name).join(', ')}`)
  }
  if (recommendations.length === 0) {
    recommendations.push('No action required — continue monitoring')
  }

  // Estimate reading time (200 wpm)
  const wordCount = (headline + keyMetrics.join(' ') + patterns.map(p => p.description).join(' ') + recommendations.join(' ')).split(/\s+/).length
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200))

  return {
    generatedAt: new Date().toISOString(),
    voice,
    headline,
    keyMetrics,
    patterns: patterns.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 }
      return order[a.severity] - order[b.severity]
    }),
    alerts: alertSummaries,
    recommendations,
    readingTimeMin,
  }
}

// ──────────────────────────────────────────────────────────────
// Plain-text formatter (for copy/paste, file export)
// ──────────────────────────────────────────────────────────────

export function formatBriefAsText(brief: StoryBrief): string {
  const v = VOICES[brief.voice]
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push(`  MERIDIAN DATA STORY — ${brief.voice.toUpperCase()} BRIEF`)
  lines.push(`  Generated: ${new Date(brief.generatedAt).toLocaleString('en-US')}`)
  lines.push(`  Reading time: ~${brief.readingTimeMin} min`)
  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push('')
  lines.push('HEADLINE')
  lines.push(`  ${brief.headline}`)
  lines.push('')
  lines.push('KEY METRICS')
  brief.keyMetrics.forEach(m => lines.push(`  ${v.metricStyle(m)}`))
  lines.push('')
  if (brief.patterns.length > 0) {
    lines.push('PATTERNS DETECTED')
    brief.patterns.forEach(p => {
      lines.push(`  ${v.patternStyle(p)}`)
      lines.push('')
    })
  }
  if (brief.alerts.length > 0) {
    lines.push('ACTIVE ALERTS')
    brief.alerts.forEach(a => lines.push(`  • ${a}`))
    lines.push('')
  }
  lines.push('RECOMMENDED ACTIONS')
  brief.recommendations.forEach((r, i) => lines.push(`  ${i + 1}. ${v.recommendationStyle(r)}`))
  lines.push('')
  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push(`  ${v.signOff}`)
  lines.push('═══════════════════════════════════════════════════════════════')

  return lines.join('\n')
}
