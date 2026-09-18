'use client'

import * as React from 'react'
import { useStaticMode } from '@/hooks/use-static-mode'

interface UseFetchOptions {
  refreshInterval?: number
  // If provided, returns this synthetic data when in static-preview mode
  // (instead of attempting the fetch and failing)
  staticFallback?: () => any
}

/**
 * SWR-style fetch hook with refresh interval and static-preview fallback.
 *
 * In static-preview mode (GitHub Pages), API routes don't run. If `staticFallback`
 * is provided, it's used directly instead of fetching. Otherwise, the hook attempts
 * the fetch and surfaces the error.
 *
 * IMPORTANT: We destructure `refreshInterval` and `staticFallback` from options
 * so the effect dependencies are stable (not the options object itself, which
 * would create a new reference every render and cause infinite loops).
 */
export function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const { refreshInterval, staticFallback } = options
  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(!!url)
  const isStatic = useStaticMode()

  // Stable ref for the fallback function so the effect doesn't re-run when the
  // caller passes a new function literal each render
  const fallbackRef = React.useRef(staticFallback)
  React.useEffect(() => {
    fallbackRef.current = staticFallback
  }, [staticFallback])

  const fetchData = React.useCallback(async () => {
    if (!url) { setLoading(false); return }

    // If we're in static mode and a fallback is provided, use it directly
    if (isStatic === true && fallbackRef.current) {
      setData(fallbackRef.current() as T)
      setError(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      // If fetch failed and we have a fallback, use it
      if (fallbackRef.current) {
        setData(fallbackRef.current() as T)
        setError(null)
      } else {
        setError(e.message || 'Failed to fetch')
      }
    } finally {
      setLoading(false)
    }
  }, [url, isStatic])

  React.useEffect(() => {
    fetchData()
    if (refreshInterval && isStatic !== true) {
      const id = setInterval(fetchData, refreshInterval)
      return () => clearInterval(id)
    }
  }, [fetchData, refreshInterval, isStatic])

  return { data, error, loading, refetch: fetchData }
}
