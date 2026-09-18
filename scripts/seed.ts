/**
 * Synthetic data seeder for MERIDIAN data analyst template.
 * Generates realistic fintech data: venues, symbols, ticks, OHLCV bars,
 * pipelines, datasets, ML models, predictions, SLOs, alerts, incidents,
 * lineage edges, audit logs.
 *
 * Run with: bun run scripts/seed.ts
 */
import { db } from '../src/lib/db'

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const VENUES = [
  { code: 'CME',    name: 'Chicago Mercantile Exchange', region: 'us-east-1',     timezone: 'America/Chicago' },
  { code: 'NASDAQ', name: 'NASDAQ',                     region: 'us-east-1',     timezone: 'America/New_York' },
  { code: 'LSE',    name: 'London Stock Exchange',       region: 'eu-west-1',     timezone: 'Europe/London' },
  { code: 'EUREX',  name: 'Eurex',                       region: 'eu-west-1',     timezone: 'Europe/Berlin' },
  { code: 'TSE',    name: 'Tokyo Stock Exchange',        region: 'ap-southeast-2',timezone: 'Asia/Tokyo' },
]

const SYMBOLS = [
  { ticker: 'AAPL',  name: 'Apple Inc.',                assetClass: 'equity',   currency: 'USD' },
  { ticker: 'MSFT',  name: 'Microsoft Corp',             assetClass: 'equity',   currency: 'USD' },
  { ticker: 'NVDA',  name: 'NVIDIA Corp',                assetClass: 'equity',   currency: 'USD' },
  { ticker: 'TSLA',  name: 'Tesla Inc',                  assetClass: 'equity',   currency: 'USD' },
  { ticker: 'AMZN',  name: 'Amazon.com Inc',             assetClass: 'equity',   currency: 'USD' },
  { ticker: 'GOOGL', name: 'Alphabet Inc',               assetClass: 'equity',   currency: 'USD' },
  { ticker: 'META',  name: 'Meta Platforms',             assetClass: 'equity',   currency: 'USD' },
  { ticker: 'SPX',   name: 'S&P 500 Index',              assetClass: 'index',    currency: 'USD' },
  { ticker: 'VIX',   name: 'Volatility Index',           assetClass: 'index',    currency: 'USD' },
  { ticker: 'EURUSD',name: 'Euro / US Dollar',           assetClass: 'fx',       currency: 'USD' },
  { ticker: 'GBPUSD',name: 'British Pound / US Dollar',  assetClass: 'fx',       currency: 'USD' },
  { ticker: 'USDJPY',name: 'US Dollar / Japanese Yen',   assetClass: 'fx',       currency: 'JPY' },
  { ticker: 'US10Y', name: 'US 10Y Treasury Yield',      assetClass: 'rate',     currency: 'USD' },
  { ticker: 'DE10Y', name: 'German 10Y Bund Yield',      assetClass: 'rate',     currency: 'EUR' },
  { ticker: 'CL',    name: 'WTI Crude Oil',              assetClass: 'commodity',currency: 'USD' },
  { ticker: 'XAU',   name: 'Gold Spot',                  assetClass: 'commodity',currency: 'USD' },
  { ticker: 'SPX_OPT', name: 'SPX Options Composite',    assetClass: 'option',   currency: 'USD' },
  { ticker: 'AAPL_OPT', name: 'AAPL Options Composite',  assetClass: 'option',   currency: 'USD' },
]

const BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20, AMZN: 178.90,
  GOOGL: 142.80, META: 487.60, SPX: 5165.30, VIX: 14.20,
  EURUSD: 1.0856, GBPUSD: 1.2643, USDJPY: 149.85,
  US10Y: 4.275, DE10Y: 2.391,
  CL: 78.45, XAU: 2158.30,
  SPX_OPT: 28.50, AAPL_OPT: 4.20,
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)]

function gaussian(mean: number, std: number): number {
  // Box-Muller
  const u1 = Math.random() || 0.0001
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

// ──────────────────────────────────────────────────────────────
// Seed functions
// ──────────────────────────────────────────────────────────────

async function seedVenues() {
  console.log('  venues...')
  await db.venue.deleteMany()
  for (const v of VENUES) {
    await db.venue.create({ data: v })
  }
}

async function seedSymbols() {
  console.log('  symbols...')
  await db.symbol.deleteMany()
  for (const s of SYMBOLS) {
    await db.symbol.create({ data: { ...s, isActive: true } })
  }
}

async function seedTicksAndOhlcv() {
  console.log('  ticks + ohlcv (this is the big one)...')
  await db.tick.deleteMany()
  await db.ohlcvBar.deleteMany()

  const venues = await db.venue.findMany()
  const symbols = await db.symbol.findMany()

  // Generate 6 hours of tick data per symbol, sampled at ~1 tick per 30s
  // 6h * 60m * 60s / 30s = 720 ticks per symbol
  // 18 symbols * 720 = 12,960 ticks total - manageable
  const TICKS_PER_SYMBOL = 720
  const SECONDS_BETWEEN_TICKS = 30
  const HOURS_BACK = 6
  const now = Date.now()
  const startTime = now - HOURS_BACK * 60 * 60 * 1000

  // OHLCV bars at 1m and 5m timeframes
  for (const sym of symbols) {
    const basePrice = BASE_PRICES[sym.ticker] || 100
    const venue = venues.find(v => {
      // Match symbol to venue based on asset class
      if (sym.assetClass === 'fx' && (v.code === 'CME' || v.code === 'EUREX')) return true
      if (sym.assetClass === 'rate' && (v.code === 'CME' || v.code === 'EUREX')) return true
      if (sym.assetClass === 'commodity' && v.code === 'CME') return true
      if (sym.assetClass === 'option' && (v.code === 'CME' || v.code === 'NASDAQ')) return true
      if (v.code === 'NASDAQ' && sym.ticker.match(/^(AAPL|MSFT|NVDA|TSLA|AMZN|GOOGL|META)$/)) return true
      if (v.code === 'LSE' && sym.assetClass === 'equity') return Math.random() < 0.2
      return false
    }) || venues[0]

    let currentPrice = basePrice
    const volatility = sym.assetClass === 'option' ? 0.012 :
                       sym.assetClass === 'fx' ? 0.003 :
                       sym.assetClass === 'rate' ? 0.005 :
                       sym.assetClass === 'commodity' ? 0.008 :
                       0.006

    const tickBatch: any[] = []
    for (let i = 0; i < TICKS_PER_SYMBOL; i++) {
      const ts = new Date(startTime + i * SECONDS_BETWEEN_TICKS * 1000)
      // Random walk
      const drift = gaussian(0, volatility * currentPrice)
      currentPrice = Math.max(currentPrice + drift, basePrice * 0.5)
      const size = Math.round(Math.abs(gaussian(500, 200)))
      const side = pick(['bid', 'ask', 'trade'])
      const lag = Math.abs(gaussian(180, 50))

      tickBatch.push({
        venueId: venue.id,
        symbolId: sym.id,
        ts,
        price: parseFloat(currentPrice.toFixed(4)),
        size,
        side,
        feedLagMs: parseFloat(lag.toFixed(2)),
      })
    }
    // Bulk insert in chunks
    for (let i = 0; i < tickBatch.length; i += 500) {
      await db.tick.createMany({ data: tickBatch.slice(i, i + 500) })
    }

    // Build OHLCV bars at 1m and 5m
    for (const timeframe of ['1m', '5m']) {
      const bucketSec = timeframe === '1m' ? 60 : 300
      const buckets = new Map<number, any[]>()
      for (const t of tickBatch) {
        if (t.side !== 'trade') continue
        const bucketTs = Math.floor(t.ts.getTime() / (bucketSec * 1000)) * (bucketSec * 1000)
        if (!buckets.has(bucketTs)) buckets.set(bucketTs, [])
        buckets.get(bucketTs)!.push(t)
      }
      const barBatch: any[] = []
      for (const [bucketTs, ticks] of buckets.entries()) {
        const prices = ticks.map(t => t.price)
        if (prices.length === 0) continue
        barBatch.push({
          symbolId: sym.id,
          venueId: venue.id,
          ts: new Date(bucketTs),
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: ticks.reduce((s, t) => s + t.size, 0),
          timeframe,
        })
      }
      for (let i = 0; i < barBatch.length; i += 500) {
        await db.ohlcvBar.createMany({ data: barBatch.slice(i, i + 500) })
      }
    }
  }
}

async function seedPipelines() {
  console.log('  pipelines...')
  await db.pipeline.deleteMany()

  const pipelines = [
    { name: 'Normalize', stage: 'L3 Processing', description: 'Vendor-specific decode -> canonical NormalizedTick', parallelism: 12, throughputMps: 2100000, lagMs: 145, p99LatencyMs: 187, checkpointMs: 42, status: 'running' },
    { name: 'Enrich', stage: 'L3 Processing', description: 'Join ticks with reference data, add session_id', parallelism: 24, throughputMps: 1850000, lagMs: 220, p99LatencyMs: 235, checkpointMs: 58, status: 'running' },
    { name: 'Aggregate', stage: 'L3 Processing', description: 'OHLCV 1s/10s/1m + session windows', parallelism: 48, throughputMps: 1620000, lagMs: 305, p99LatencyMs: 312, checkpointMs: 71, status: 'degraded' },
    { name: 'AnomalyScore', stage: 'L3 Processing', description: 'ONNX inference for spoofing + latency arb', parallelism: 32, throughputMps: 1480000, lagMs: 198, p99LatencyMs: 218, checkpointMs: 49, status: 'running' },
    { name: 'Iceberg Sink', stage: 'L4 Lakehouse', description: 'Exactly-once Iceberg commit per checkpoint', parallelism: 16, throughputMps: 1420000, lagMs: 312, p99LatencyMs: 380, checkpointMs: 65, status: 'running' },
    { name: 'MM2 Cross-Region', stage: 'L2 Streaming', description: 'Active-active cross-region replication', parallelism: 8, throughputMps: 980000, lagMs: 85, p99LatencyMs: 142, checkpointMs: 28, status: 'running' },
    { name: 'Compaction Service', stage: 'L4 Lakehouse', description: 'Backpressure-aware Iceberg compaction', parallelism: 4, throughputMps: 0, lagMs: 0, p99LatencyMs: 0, checkpointMs: 0, status: 'running' },
    { name: 'Feature Materialize', stage: 'L5 Serving', description: 'Feature store online/offline sync', parallelism: 6, throughputMps: 240000, lagMs: 420, p99LatencyMs: 485, checkpointMs: 35, status: 'running' },
  ]

  for (const p of pipelines) {
    await db.pipeline.create({
      data: {
        ...p,
        lastRestart: new Date(Date.now() - randInt(2, 48) * 60 * 60 * 1000),
      },
    })
  }
}

async function seedDatasets() {
  console.log('  datasets...')
  await db.dataset.deleteMany()

  const datasets = [
    { name: 'ticks.normalized', namespace: 'equities', description: 'Canonical normalized tick stream, all venues', format: 'iceberg', rowCount: 8_400_000_000, sizeBytes: 4_120_000_000_000, partitionKeys: 'day,symbol_bucket(64)', tier: 'hot', schemaJson: JSON.stringify({trade_time:'timestamp',symbol:'string',price:'double',size:'double',side:'string',venue:'string'}) },
    { name: 'ticks.l2', namespace: 'equities', description: 'L2 order book deltas', format: 'iceberg', rowCount: 84_000_000_000, sizeBytes: 28_400_000_000_000, partitionKeys: 'day,symbol_bucket(64)', tier: 'hot', schemaJson: JSON.stringify({ts:'timestamp',symbol:'string',level:'int',price:'double',size:'double',side:'string'}) },
    { name: 'ohlcv.1s', namespace: 'equities', description: '1-second OHLCV bars, post-aggregation', format: 'iceberg', rowCount: 1_200_000_000, sizeBytes: 84_000_000_000, partitionKeys: 'day,symbol_bucket(64)', tier: 'warm', schemaJson: JSON.stringify({ts:'timestamp',symbol:'string',open:'double',high:'double',low:'double',close:'double',volume:'double'}) },
    { name: 'ohlcv.1m', namespace: 'equities', description: '1-minute OHLCV bars', format: 'iceberg', rowCount: 24_000_000, sizeBytes: 1_400_000_000, partitionKeys: 'day,symbol', tier: 'warm', schemaJson: JSON.stringify({ts:'timestamp',symbol:'string',open:'double',high:'double',low:'double',close:'double',volume:'double'}) },
    { name: 'ohlcv.1d', namespace: 'equities', description: 'Daily OHLCV bars, historical', format: 'iceberg', rowCount: 480_000, sizeBytes: 28_000_000, partitionKeys: 'year,symbol', tier: 'cold', schemaJson: JSON.stringify({ts:'timestamp',symbol:'string',open:'double',high:'double',low:'double',close:'double',volume:'double'}) },
    { name: 'trades.executions', namespace: 'equities', description: 'FIX execution reports', format: 'iceberg', rowCount: 240_000_000, sizeBytes: 18_000_000_000, partitionKeys: 'day,desk_id', tier: 'hot', schemaJson: JSON.stringify({exec_id:'string',ts:'timestamp',symbol:'string',qty:'double',price:'double',side:'string'}) },
    { name: 'alerts.spoofing', namespace: 'governance', description: 'Spoofing anomaly alerts from ML inference', format: 'iceberg', rowCount: 12_400, sizeBytes: 84_000_000, partitionKeys: 'day', tier: 'hot', schemaJson: JSON.stringify({ts:'timestamp',symbol:'string',score:'double',label:'string',features:'struct'}) },
    { name: 'audit.lineage', namespace: 'governance', description: 'OpenLineage events, runtime', format: 'iceberg', rowCount: 4_200_000, sizeBytes: 1_200_000_000, partitionKeys: 'day,job_id', tier: 'warm', schemaJson: JSON.stringify({event_time:'timestamp',run_id:'string',job_name:'string',inputs:'array',outputs:'array'}) },
  ]

  for (const d of datasets) {
    await db.dataset.create({ data: d })
  }
}

async function seedMlModels() {
  console.log('  ml models...')
  await db.mlModel.deleteMany()
  await db.featureRow.deleteMany()
  await db.prediction.deleteMany()

  const models = [
    { name: 'spoofing-detector', version: 'v3.4.1', type: 'classifier', framework: 'lightgbm', status: 'production', accuracy: 0.943, p99InferenceMs: 14, driftScore: 0.08, deployedAt: new Date(Date.now() - 47 * 86400000) },
    { name: 'latency-arb-detector', version: 'v2.1.0', type: 'classifier', framework: 'lightgbm', status: 'production', accuracy: 0.918, p99InferenceMs: 11, driftScore: 0.14, deployedAt: new Date(Date.now() - 23 * 86400000) },
    { name: 'order-imbalance-forecaster', version: 'v1.8.2', type: 'regressor', framework: 'onnx', status: 'shadow', accuracy: 0.872, p99InferenceMs: 9, driftScore: 0.21, deployedAt: new Date(Date.now() - 12 * 86400000) },
    { name: 'volatility-regime', version: 'v0.4.0', type: 'classifier', framework: 'pytorch', status: 'shadow', accuracy: 0.803, p99InferenceMs: 22, driftScore: 0.34, deployedAt: new Date(Date.now() - 4 * 86400000) },
    { name: 'spoofing-detector', version: 'v3.5.0-rc', type: 'classifier', framework: 'lightgbm', status: 'shadow', accuracy: 0.951, p99InferenceMs: 13, driftScore: 0.05, deployedAt: new Date(Date.now() - 2 * 86400000) },
    { name: 'trade-flow-classifier', version: 'v1.2.0', type: 'classifier', framework: 'lightgbm', status: 'retired', accuracy: 0.881, p99InferenceMs: 18, driftScore: 0.42, deployedAt: new Date(Date.now() - 180 * 86400000), retiredAt: new Date(Date.now() - 30 * 86400000) },
  ]
  const created = []
  for (const m of models) {
    created.push(await db.mlModel.create({ data: m }))
  }

  // Feature rows for a subset of symbols
  const symbols = await db.symbol.findMany({ take: 6 })
  const featureNames = [
    'rolling_trade_volume_1s', 'order_book_imbalance', 'price_velocity_100ms',
    'trade_to_quote_ratio', 'cross_venue_spread', 'session_id',
  ]
  const now = Date.now()
  for (const sym of symbols) {
    for (const fn of featureNames) {
      for (let i = 0; i < 60; i++) {  // 60 minutes of features
        await db.featureRow.create({
          data: {
            symbolId: sym.id,
            featureName: fn,
            value: parseFloat(gaussian(rand(0.1, 0.9), 0.15).toFixed(4)),
            ts: new Date(now - i * 60_000),
            onlineStore: pick(['dynamodb', 'redis']),
          }
        })
      }
    }
  }

  // Predictions from production model
  const prodModel = created[0]
  for (let i = 0; i < 200; i++) {
    const sym = pick(symbols)
    const score = Math.random()
    const label = score > 0.85 ? 'spoofing' : score > 0.6 ? 'latency_arb' : 'normal'
    await db.prediction.create({
      data: {
        modelId: prodModel.id,
        symbolId: sym.id,
        ts: new Date(now - randInt(0, 3600) * 1000),
        score: parseFloat(score.toFixed(4)),
        label,
        confidence: parseFloat((0.7 + Math.random() * 0.29).toFixed(4)),
        featuresJson: JSON.stringify({ f1: parseFloat(Math.random().toFixed(3)), f2: parseFloat(Math.random().toFixed(3)) }),
      }
    })
  }
}

async function seedSlos() {
  console.log('  slos...')
  await db.slo.deleteMany()

  const slos = [
    { name: 'tier-1-realtime-risk', tier: 'tier-1', availabilityPct: 99.999, p99LatencyMs: 250,  errorBudgetMin: 4.3,   budgetConsumedPct: 38, burnRate1h: 1.2, burnRate6h: 0.8, burnRate24h: 0.6 },
    { name: 'tier-2-posttrade',     tier: 'tier-2', availabilityPct: 99.99,  p99LatencyMs: 5000, errorBudgetMin: 43.2,  budgetConsumedPct: 22, burnRate1h: 0.4, burnRate6h: 0.3, burnRate24h: 0.5 },
    { name: 'tier-3-research',     tier: 'tier-3', availabilityPct: 99.9,   p99LatencyMs: 60000,errorBudgetMin: 432,   budgetConsumedPct: 12, burnRate1h: 0.1, burnRate6h: 0.2, burnRate24h: 0.3 },
  ]
  for (const s of slos) {
    await db.slo.create({ data: s })
  }
}

async function seedAlerts() {
  console.log('  alerts...')
  await db.alert.deleteMany()

  const alerts = [
    { severity: 'critical', source: 'flink', title: 'Aggregate checkpoint duration > 60s', description: 'Job Aggregate checkpoint took 78s, exceeded 60s budget', status: 'firing', tier: 'tier-1', firedAt: new Date(Date.now() - 3 * 60_000) },
    { severity: 'warning', source: 'iceberg', title: 'Manifest lock contention', description: 'Compaction job held manifest tree lock for 4.2s', status: 'firing', tier: 'tier-1', firedAt: new Date(Date.now() - 8 * 60_000) },
    { severity: 'warning', source: 'kafka', title: 'Consumer lag growing on ticks.normalized', description: 'Lag increased from 12s to 18s in 5 min', status: 'acked', tier: 'tier-2', ackedBy: 'sre-oncall', ackedAt: new Date(Date.now() - 12 * 60_000), firedAt: new Date(Date.now() - 22 * 60_000) },
    { severity: 'info', source: 'slo', title: 'Tier-3 burn rate back to normal', description: 'tier-3-research burn rate dropped below 0.3', status: 'resolved', tier: 'tier-3', firedAt: new Date(Date.now() - 60 * 60_000), resolvedAt: new Date(Date.now() - 45 * 60_000) },
    { severity: 'critical', source: 'iceberg', title: 'Schema violation on ticks.l2', description: '1.2% of messages failed Avro decode', status: 'resolved', tier: 'tier-1', firedAt: new Date(Date.now() - 4 * 3600_000), resolvedAt: new Date(Date.now() - 3.5 * 3600_000), ackedBy: 'sde-oncall', ackedAt: new Date(Date.now() - 3.8 * 3600_000) },
    { severity: 'warning', source: 'ml', title: 'spoofing-detector drift score rising', description: 'Drift score 0.08 -> 0.14 in 24h', status: 'acked', tier: 'tier-2', ackedBy: 'ml-eng', ackedAt: new Date(Date.now() - 90 * 60_000), firedAt: new Date(Date.now() - 100 * 60_000) },
    { severity: 'info', source: 'kafka', title: 'MM2 cross-region sync healthy', description: 'us-east-1 <-> eu-west-1 lag < 5s', status: 'resolved', tier: 'tier-2', firedAt: new Date(Date.now() - 2 * 3600_000), resolvedAt: new Date(Date.now() - 110 * 60_000) },
    { severity: 'warning', source: 'slo', title: 'Tier-1 error budget at 38%', description: 'Consumed 38% of 30-day budget in 9 days', status: 'firing', tier: 'tier-1', firedAt: new Date(Date.now() - 15 * 60_000) },
  ]
  for (const a of alerts) {
    await db.alert.create({ data: a })
  }
}

async function seedIncidents() {
  console.log('  incidents...')
  await db.incident.deleteMany()
  const pipelines = await db.pipeline.findMany()
  const aggregate = pipelines.find(p => p.name === 'Aggregate')!

  const incidents = [
    {
      title: 'April 2024 checkpoint storm',
      severity: 'sev1',
      status: 'resolved',
      pipelineId: aggregate.id,
      startedAt: new Date(Date.now() - 14 * 86400000),
      detectedAt: new Date(Date.now() - 14 * 86400000 + 4 * 60_000),
      resolvedAt: new Date(Date.now() - 14 * 86400000 + 18 * 60_000),
      durationMin: 18,
      rootCause: 'Iceberg compaction job held manifest tree write lock during peak write throughput; Flink checkpoints abandoned after 4 retries',
      actionItems: '9 action items: dedicated compaction service, backpressure signal, pause-on-stress, alert threshold lowered, runbook updated',
    },
    {
      title: 'Schema registry brief outage',
      severity: 'sev3',
      status: 'resolved',
      pipelineId: null,
      startedAt: new Date(Date.now() - 7 * 86400000),
      detectedAt: new Date(Date.now() - 7 * 86400000 + 2 * 60_000),
      resolvedAt: new Date(Date.now() - 7 * 86400000 + 14 * 60_000),
      durationMin: 14,
      rootCause: 'Schema registry pod OOM-killed during schema validation burst; existing flows continued, new schema changes blocked',
      actionItems: 'Increase schema registry memory limit; add HPA on CPU > 70%',
    },
    {
      title: 'EURUSD feed byte-order mismatch',
      severity: 'sev2',
      status: 'resolved',
      pipelineId: null,
      startedAt: new Date(Date.now() - 30 * 86400000),
      detectedAt: new Date(Date.now() - 30 * 86400000 + 2 * 3600_000),
      resolvedAt: new Date(Date.now() - 30 * 86400000 + 4 * 3600_000),
      durationMin: 240,
      rootCause: 'EUREX changed byte order on EURUSD sub-feed without schema version bump; prices decoded as huge integers',
      actionItems: 'Add content reasonableness check on every price field; vendor spec asserted per message',
    },
  ]
  for (const inc of incidents) {
    await db.incident.create({ data: inc as any })
  }
}

async function seedLineageAndAudit() {
  console.log('  lineage edges + audit log...')
  await db.lineageEdge.deleteMany()
  await db.auditLog.deleteMany()

  const lineage = [
    { sourceType: 'kafka_topic',  sourceName: 'ticks.raw.cme',    targetType: 'flink_job',     targetName: 'Normalize',        relation: 'consumes' },
    { sourceType: 'flink_job',    sourceName: 'Normalize',        targetType: 'kafka_topic',    targetName: 'ticks.normalized',  relation: 'produces' },
    { sourceType: 'kafka_topic',  sourceName: 'ticks.normalized', targetType: 'flink_job',     targetName: 'Enrich',           relation: 'consumes' },
    { sourceType: 'flink_job',    sourceName: 'Enrich',           targetType: 'flink_job',      targetName: 'Aggregate',        relation: 'transforms' },
    { sourceType: 'flink_job',    sourceName: 'Aggregate',        targetType: 'iceberg_table',  targetName: 'ohlcv.1m',          relation: 'produces' },
    { sourceType: 'flink_job',    sourceName: 'Enrich',           targetType: 'flink_job',      targetName: 'AnomalyScore',     relation: 'transforms' },
    { sourceType: 'flink_job',    sourceName: 'AnomalyScore',     targetType: 'kafka_topic',    targetName: 'alerts.spoofing',  relation: 'produces' },
    { sourceType: 'iceberg_table',sourceName: 'ticks.normalized', targetType: 'trino_catalog',  targetName: 'iceberg',           relation: 'consumes' },
    { sourceType: 'iceberg_table',sourceName: 'ohlcv.1m',         targetType: 'snowflake_external',targetName: 'ohlcv_1m_ext',    relation: 'consumes' },
    { sourceType: 'iceberg_table',sourceName: 'ticks.normalized', targetType: 'flink_job',      targetName: 'Feature Materialize', relation: 'consumes' },
    { sourceType: 'flink_job',   sourceName: 'Feature Materialize', targetType: 'feature_store', targetName: 'rolling_trade_volume_1s', relation: 'produces' },
    { sourceType: 'feature_store', sourceName: 'rolling_trade_volume_1s', targetType: 'ml_model', targetName: 'spoofing-detector', relation: 'consumes' },
    { sourceType: 'kafka_topic', sourceName: 'ticks.normalized', targetType: 'iceberg_table',  targetName: 'ticks.normalized',  relation: 'produces' },
  ]
  for (const l of lineage) {
    await db.lineageEdge.create({ data: l })
  }

  const auditActions = ['read', 'query', 'deploy', 'write']
  const actors = ['analyst.alice', 'analyst.bob', 'sre.carol', 'ml.dave', 'compliance.eve', 'service.flink', 'service.trino']
  const resources = ['ticks.normalized', 'ohlcv.1m', 'ticks.l2', 'alerts.spoofing', 'spoofing-detector', 'ohlcv.1d', 'audit.lineage']
  const tiers = ['tier-1', 'tier-2', 'tier-3']

  for (let i = 0; i < 200; i++) {
    const isAllow = Math.random() > 0.08
    await db.auditLog.create({
      data: {
        actor: pick(actors),
        action: pick(auditActions),
        resource: pick(resources),
        resourceType: pick(['dataset', 'model', 'pipeline']),
        tier: pick(tiers),
        result: isAllow ? 'allow' : 'deny',
        ts: new Date(Date.now() - randInt(0, 6 * 3600) * 1000),
      }
    })
  }
}

async function seedSavedQueries() {
  console.log('  saved queries...')
  await db.savedQuery.deleteMany()
  const datasets = await db.dataset.findMany()

  const queries = [
    { name: 'AAPL last-hour trades', sqlText: 'SELECT ts, price, size, side FROM ticks.normalized WHERE symbol = \'AAPL\' AND ts > NOW() - INTERVAL \'1 HOUR\' ORDER BY ts DESC LIMIT 500', description: 'Recent AAPL trade ticks', createdBy: 'analyst.alice' },
    { name: 'Top volume symbols today', sqlText: 'SELECT symbol, SUM(volume) AS total_vol FROM ohlcv.1m WHERE ts > DATE_TRUNC(\'day\', NOW()) GROUP BY symbol ORDER BY total_vol DESC LIMIT 20', description: 'Daily volume leaderboard', createdBy: 'analyst.bob', isStarred: true },
    { name: 'Cross-venue spread', sqlText: 'SELECT a.ts, a.price AS cme_price, b.price AS eurex_price, ABS(a.price - b.price) AS spread FROM ticks.normalized a JOIN ticks.normalized b ON a.ts = b.ts AND a.symbol = b.symbol WHERE a.venue = \'CME\' AND b.venue = \'EUREX\' AND a.symbol = \'EURUSD\' AND a.ts > NOW() - INTERVAL \'5 MINUTE\'', description: 'EURUSD cross-venue spread monitor', createdBy: 'analyst.alice', isStarred: true },
    { name: 'Spoofing alerts last hour', sqlText: 'SELECT ts, symbol, score, features FROM alerts.spoofing WHERE ts > NOW() - INTERVAL \'1 HOUR\' AND score > 0.85 ORDER BY score DESC', description: 'High-confidence spoofing alerts', createdBy: 'compliance.eve' },
    { name: 'OHLCV 1m for symbol', sqlText: 'SELECT ts, open, high, low, close, volume FROM ohlcv.1m WHERE symbol = :symbol AND ts > :from ORDER BY ts', description: 'Parameterized OHLCV query', createdBy: 'analyst.bob' },
    { name: 'P99 latency by pipeline', sqlText: 'SELECT name, p99_latency_ms, lag_ms, status FROM pipelines WHERE status != \'stopped\' ORDER BY p99_latency_ms DESC', description: 'Pipeline latency ranking', createdBy: 'sre.carol' },
    { name: 'Audit denials last 24h', sqlText: 'SELECT actor, action, resource, tier, ts FROM audit_log WHERE result = \'deny\' AND ts > NOW() - INTERVAL \'24 HOURS\' ORDER BY ts DESC', description: 'Compliance denial log', createdBy: 'compliance.eve', isStarred: true },
  ]

  for (const q of queries) {
    await db.savedQuery.create({
      data: {
        ...q,
        datasetId: pick(datasets).id,
        lastRunMs: randInt(120, 4500),
        lastRunRows: randInt(10, 12000),
        executionCount: randInt(5, 480),
      }
    })
  }
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding MERIDIAN synthetic data...')
  await seedVenues()
  await seedSymbols()
  await seedTicksAndOhlcv()
  await seedPipelines()
  await seedDatasets()
  await seedMlModels()
  await seedSlos()
  await seedAlerts()
  await seedIncidents()
  await seedLineageAndAudit()
  await seedSavedQueries()
  console.log('Done.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
