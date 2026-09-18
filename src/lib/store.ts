import { create } from 'zustand'

export type DashboardSectionId =
  | 'overview' | 'datasets' | 'explorer' | 'pipelines' | 'ticks'
  | 'models' | 'alerts' | 'governance' | 'incidents'

interface ApiKeyStore {
  coingecko: string
  alphavantage: string
  finnhub: string
  newsapi: string
  rss2json: string
}

interface ApiUsageEntry {
  provider: string
  timestamp: number
}

interface DashboardState {
  // Dashboard sub-section (tabs within /dashboard)
  activeSection: DashboardSectionId
  setActiveSection: (s: DashboardSectionId) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Mock auth with roles (persisted to localStorage)
  isAuthenticated: boolean
  userEmail: string | null
  userRole: 'demo' | 'admin' | 'enterprise' | null
  login: (email: string, role: 'demo' | 'admin' | 'enterprise') => void
  logout: () => void

  // API keys (persisted to localStorage, never transmitted except to provider)
  apiKeys: ApiKeyStore
  setApiKey: (provider: keyof ApiKeyStore, key: string) => void

  // API usage tracking (per-provider call counter)
  usageLog: ApiUsageEntry[]
  recordApiCall: (provider: string) => void
  getUsage: (provider: string, windowMs: number) => number
  clearUsage: () => void

  // Refresh signal
  refreshKey: number
  triggerRefresh: () => void
}

// ──────────────────────────────────────────────────────────────
// localStorage persistence helpers
// ──────────────────────────────────────────────────────────────

const AUTH_KEY = 'meridian-mock-auth'
const API_KEYS_KEY = 'meridian-api-keys'
const USAGE_KEY = 'meridian-api-usage'

function loadAuth(): { isAuthenticated: boolean; userEmail: string | null; userRole: 'demo' | 'admin' | 'enterprise' | null } {
  if (typeof window === 'undefined') return { isAuthenticated: false, userEmail: null, userRole: null }
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return { isAuthenticated: false, userEmail: null, userRole: null }
    const parsed = JSON.parse(raw)
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      userEmail: parsed.userEmail || null,
      userRole: parsed.userRole || null,
    }
  } catch { return { isAuthenticated: false, userEmail: null, userRole: null } }
}

function saveAuth(isAuthenticated: boolean, userEmail: string | null, userRole: 'demo' | 'admin' | 'enterprise' | null) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated, userEmail, userRole })) } catch {}
}

function loadApiKeys(): ApiKeyStore {
  if (typeof window === 'undefined') return { coingecko: '', alphavantage: '', finnhub: '', newsapi: '', rss2json: '' }
  try {
    const raw = window.localStorage.getItem(API_KEYS_KEY)
    if (!raw) return { coingecko: '', alphavantage: '', finnhub: '', newsapi: '', rss2json: '' }
    return JSON.parse(raw)
  } catch { return { coingecko: '', alphavantage: '', finnhub: '', newsapi: '', rss2json: '' } }
}

function saveApiKeys(keys: ApiKeyStore) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys)) } catch {}
}

function loadUsage(): ApiUsageEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(USAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

function saveUsage(log: ApiUsageEntry[]) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(USAGE_KEY, JSON.stringify(log.slice(-1000))) } catch {}
}

const initialAuth = loadAuth()
const initialApiKeys = loadApiKeys()
const initialUsage = loadUsage()

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeSection: 'overview',
  setActiveSection: (s) => set({ activeSection: s }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  isAuthenticated: initialAuth.isAuthenticated,
  userEmail: initialAuth.userEmail,
  userRole: initialAuth.userRole,
  login: (email, role) => {
    saveAuth(true, email, role)
    set({ isAuthenticated: true, userEmail: email, userRole: role })
  },
  logout: () => {
    saveAuth(false, null, null)
    set({ isAuthenticated: false, userEmail: null, userRole: null })
  },

  apiKeys: initialApiKeys,
  setApiKey: (provider, key) => {
    const newKeys = { ...get().apiKeys, [provider]: key }
    saveApiKeys(newKeys)
    set({ apiKeys: newKeys })
  },

  usageLog: initialUsage,
  recordApiCall: (provider) => {
    const entry = { provider, timestamp: Date.now() }
    const newLog = [...get().usageLog, entry]
    saveUsage(newLog)
    set({ usageLog: newLog })
  },
  getUsage: (provider, windowMs) => {
    const now = Date.now()
    return get().usageLog.filter(
      e => e.provider === provider && now - e.timestamp < windowMs
    ).length
  },
  clearUsage: () => {
    saveUsage([])
    set({ usageLog: [] })
  },

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
