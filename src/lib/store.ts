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

  // Mock auth (persisted to localStorage so it survives page reloads)
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string) => void
  logout: () => void

  // Refresh signal
  refreshKey: number
  triggerRefresh: () => void
}

// Hydrate auth from localStorage (so static export can persist across reloads)
const STORAGE_KEY = 'meridian-mock-auth'
function loadAuth(): { isAuthenticated: boolean; userEmail: string | null } {
  if (typeof window === 'undefined') return { isAuthenticated: false, userEmail: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { isAuthenticated: false, userEmail: null }
    const parsed = JSON.parse(raw)
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      userEmail: parsed.userEmail || null,
    }
  } catch {
    return { isAuthenticated: false, userEmail: null }
  }
}

function saveAuth(isAuthenticated: boolean, userEmail: string | null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated, userEmail }))
  } catch {
    // localStorage might be unavailable in some browsers / sandboxed iframes
  }
}

const initialAuth = loadAuth()

export const useDashboardStore = create<DashboardState>((set) => ({
  activePage: 'home',
  setActivePage: (p) => set({ activePage: p, sidebarOpen: false }),

  activeSection: 'overview',
  setActiveSection: (s) => set({ activeSection: s }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  isAuthenticated: initialAuth.isAuthenticated,
  userEmail: initialAuth.userEmail,
  login: (email) => {
    saveAuth(true, email)
    set({ isAuthenticated: true, userEmail: email })
  },
  logout: () => {
    saveAuth(false, null)
    set({ isAuthenticated: false, userEmail: null, activePage: 'home' })
  },

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
