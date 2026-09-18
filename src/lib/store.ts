import { create } from 'zustand'

export type SectionId =
  | 'overview' | 'datasets' | 'explorer' | 'pipelines' | 'ticks'
  | 'models' | 'alerts' | 'governance' | 'incidents'

interface DashboardState {
  activeSection: SectionId
  sidebarOpen: boolean
  setActiveSection: (s: SectionId) => void
  setSidebarOpen: (open: boolean) => void
  refreshKey: number
  triggerRefresh: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSection: 'overview',
  sidebarOpen: false,
  setActiveSection: (s) => set({ activeSection: s }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
