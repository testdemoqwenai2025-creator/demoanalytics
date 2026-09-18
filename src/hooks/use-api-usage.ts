'use client'

import * as React from 'react'
import { useDashboardStore } from '@/lib/store'
import { getDataSource } from '@/lib/data-sources'

// Rate limit windows (in milliseconds)
export const WINDOW_MINUTE = 60_000
export const WINDOW_HOUR = 3_600_000
export const WINDOW_DAY = 86_400_000
export const WINDOW_MONTH = 2_592_000_000

interface UsageInfo {
  callsLastMin: number
  callsLastHour: number
  callsLastDay: number
  callsLastMonth: number
  // Free tier limits (parsed from data-sources.ts descriptions)
  limitPerMin: number | null
  limitPerDay: number | null
  limitPerMonth: number | null
  // Whether we're approaching or at the limit
  status: 'ok' | 'warning' | 'limit-reached'
  percentUsed: number  // 0-100, based on the most restrictive limit
}

const PARSED_LIMITS: Record<string, { perMin: number | null; perDay: number | null; perMonth: number | null }> = {
  coingecko:   { perMin: 30,  perDay: null,  perMonth: 10000 },
  frankfurter: { perMin: null, perDay: null,  perMonth: null },
  rss2json:    { perMin: 5,   perDay: 10000, perMonth: null },
  alphavantage:{ perMin: 5,   perDay: 25,    perMonth: null },
  finnhub:     { perMin: 60,  perDay: null,  perMonth: null },
  newsapi:     { perMin: null, perDay: 100,  perMonth: null },
  stooq:       { perMin: null, perDay: null,  perMonth: null },
}

export function useApiUsage(provider: string): UsageInfo {
  const usageLog = useDashboardStore(s => s.usageLog)
  const getUsage = useDashboardStore(s => s.getUsage)

  const limits = PARSED_LIMITS[provider] || { perMin: null, perDay: null, perMonth: null }

  const callsLastMin = React.useMemo(() => getUsage(provider, WINDOW_MINUTE), [usageLog, provider, getUsage])
  const callsLastHour = React.useMemo(() => getUsage(provider, WINDOW_HOUR), [usageLog, provider, getUsage])
  const callsLastDay = React.useMemo(() => getUsage(provider, WINDOW_DAY), [usageLog, provider, getUsage])
  const callsLastMonth = React.useMemo(() => getUsage(provider, WINDOW_MONTH), [usageLog, provider, getUsage])

  // Calculate percent used based on the most restrictive limit
  let percentUsed = 0
  let status: 'ok' | 'warning' | 'limit-reached' = 'ok'

  if (limits.perMin) {
    const pct = (callsLastMin / limits.perMin) * 100
    if (pct > percentUsed) percentUsed = pct
  }
  if (limits.perDay) {
    const pct = (callsLastDay / limits.perDay) * 100
    if (pct > percentUsed) percentUsed = pct
  }
  if (limits.perMonth) {
    const pct = (callsLastMonth / limits.perMonth) * 100
    if (pct > percentUsed) percentUsed = pct
  }

  percentUsed = Math.min(Math.round(percentUsed), 100)

  if (percentUsed >= 100) status = 'limit-reached'
  else if (percentUsed >= 80) status = 'warning'

  return {
    callsLastMin,
    callsLastHour,
    callsLastDay,
    callsLastMonth,
    limitPerMin: limits.perMin,
    limitPerDay: limits.perDay,
    limitPerMonth: limits.perMonth,
    status,
    percentUsed,
  }
}

// Hook to check if an API call should be allowed
export function useApiGuard(provider: string) {
  const usage = useApiUsage(provider)
  const recordApiCall = useDashboardStore(s => s.recordApiCall)

  const canCall = usage.status !== 'limit-reached'
  const track = React.useCallback(() => {
    recordApiCall(provider)
  }, [provider, recordApiCall])

  return { canCall, track, usage }
}
