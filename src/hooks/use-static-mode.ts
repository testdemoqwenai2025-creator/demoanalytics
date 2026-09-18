'use client'

import * as React from 'react'

// Detect if we're in static-export mode (no API server).
// We probe /api/stats once on mount. If it returns non-200 or fails,
// we're in static mode (e.g., GitHub Pages).
export function useStaticMode() {
  const [isStatic, setIsStatic] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    // Quick check: if basePath is set via env, we're definitely static
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH
    if (basePath) {
      setIsStatic(true)
      return
    }
    // Probe: try to hit /api/stats; if it 404s or errors, we're static
    fetch('/api/stats', { cache: 'no-store' })
      .then(r => setIsStatic(!r.ok))
      .catch(() => setIsStatic(true))
  }, [])

  return isStatic
}
