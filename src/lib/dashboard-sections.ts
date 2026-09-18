// Dashboard section definitions — used by sidebar, layouts, and the dashboard shell.

export interface DashboardSection {
  id: string
  label: string
  description: string
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: 'overview',   label: 'Overview',      description: 'KPIs and charts' },
  { id: 'datasets',   label: 'Datasets',      description: 'Lakehouse tables' },
  { id: 'explorer',   label: 'Data Explorer', description: 'SQL editor' },
  { id: 'pipelines',  label: 'Pipelines',    description: 'Flink jobs' },
  { id: 'ticks',      label: 'Tick Stream',  description: 'OHLCV charts' },
  { id: 'models',     label: 'ML Models',    description: 'Registry + drift' },
  { id: 'alerts',     label: 'Alerts & SLOs', description: 'Burn-down + ack' },
  { id: 'governance', label: 'Governance',   description: 'Lineage + audit' },
  { id: 'incidents',  label: 'Incidents',    description: 'Postmortems' },
]
