'use client'

import * as React from 'react'
import { useDashboardStore } from '@/lib/store'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { SectionHeading } from '@/components/dashboard/primitives'

export default function DashboardPage() {
  const refreshKey = useDashboardStore(s => s.refreshKey)
  return (
    <div className="space-y-6">
      <SectionHeading
        title="MERIDIAN Dashboard"
        description="Synthetic tick lakehouse. 9 sections, ~13K ticks, ~5K OHLCV bars, 8 pipelines, 6 ML models."
      />
      <div key={refreshKey}>
        <DashboardShell />
      </div>
    </div>
  )
}
