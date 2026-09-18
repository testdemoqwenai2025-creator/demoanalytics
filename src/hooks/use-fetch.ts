'use client'

import * as React from 'react'

interface UseFetchOptions {
  refreshInterval?: number
}

export function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(!!url)

  const fetchData = React.useCallback(async () => {
    if (!url) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => {
    fetchData()
    if (options.refreshInterval) {
      const id = setInterval(fetchData, options.refreshInterval)
      return () => clearInterval(id)
    }
  }, [fetchData, options.refreshInterval])

  return { data, error, loading, refetch: fetchData }
}
