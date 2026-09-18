'use client'

import * as React from 'react'
import { useDashboardStore } from '@/lib/store'
import { OverviewSection } from '@/components/dashboard/sections/overview'
import { DatasetsSection } from '@/components/dashboard/sections/datasets'
import { ExplorerSection } from '@/components/dashboard/sections/explorer'
import { PipelinesSection } from '@/components/dashboard/sections/pipelines'
import { TicksSection } from '@/components/dashboard/sections/ticks'
import { ModelsSection } from '@/components/dashboard/sections/models'
import { AlertsSection } from '@/components/dashboard/sections/alerts'
import { GovernanceSection } from '@/components/dashboard/sections/governance'
import { IncidentsSection } from '@/components/dashboard/sections/incidents'

const SECTIONS = {
  overview: OverviewSection,
  datasets: DatasetsSection,
  explorer: ExplorerSection,
  pipelines: PipelinesSection,
  ticks: TicksSection,
  models: ModelsSection,
  alerts: AlertsSection,
  governance: GovernanceSection,
  incidents: IncidentsSection,
} as const

export function DashboardShell() {
  const active = useDashboardStore(s => s.activeSection)
  const Section = SECTIONS[active] ?? OverviewSection

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <Section />
    </div>
  )
}
