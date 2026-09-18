import { create } from 'zustand'

export type PageId =
  | 'home' | 'dashboard' | 'markets' | 'automate'
  | 'about' | 'docs' | 'login'

export type DashboardSectionId =
  | 'overview' | 'datasets' | 'explorer' | 'pipelines' | 'ticks'
  | 'models' | 'alerts' | 'governance' | 'incidents'

interface DashboardState {
  // Top-level page routing
  activePage: PageId
  setActivePage: (p: PageId) => void

  // Dashboard section (within dashboard page)
  activeSection: DashboardSectionId
  setActiveSection: (s: DashboardSectionId) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Mock auth
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string) => void
  logout: () => void

  // Refresh signal
  refreshKey: number
  triggerRefresh: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activePage: 'home',
  setActivePage: (p) => set({ activePage: p, sidebarOpen: false }),

  activeSection: 'overview',
  setActiveSection: (s) => set({ activeSection: s }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  isAuthenticated: false,
  userEmail: null,
  login: (email) => set({ isAuthenticated: true, userEmail: email }),
  logout: () => set({ isAuthenticated: false, userEmail: null, activePage: 'home' }),

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
