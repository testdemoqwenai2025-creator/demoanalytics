'use client'

import * as React from 'react'
import { create } from 'zustand'
import { DASHBOARD_SECTIONS } from '@/lib/dashboard-sections'

export interface SavedLayout {
  id: string
  name: string
  sectionIds: string[]  // ordered list of section IDs to show
  createdAt: string
  isDefault?: boolean
}

interface LayoutState {
  layouts: SavedLayout[]
  activeLayoutId: string | null
  setActiveLayout: (id: string) => void
  saveLayout: (name: string, sectionIds: string[]) => void
  deleteLayout: (id: string) => void
  reorderSections: (sectionIds: string[]) => void
}

const STORAGE_KEY = 'meridian-dashboard-layouts'

function loadLayouts(): { layouts: SavedLayout[]; activeLayoutId: string | null } {
  if (typeof window === 'undefined') return { layouts: [], activeLayoutId: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Default layout: all sections in default order
      const defaultLayout: SavedLayout = {
        id: 'default',
        name: 'Default',
        sectionIds: DASHBOARD_SECTIONS.map(s => s.id),
        createdAt: new Date().toISOString(),
        isDefault: true,
      }
      return { layouts: [defaultLayout], activeLayoutId: 'default' }
    }
    const parsed = JSON.parse(raw)
    return {
      layouts: parsed.layouts || [],
      activeLayoutId: parsed.activeLayoutId || null,
    }
  } catch {
    return { layouts: [], activeLayoutId: null }
  }
}

function saveLayouts(layouts: SavedLayout[], activeLayoutId: string | null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ layouts, activeLayoutId }))
  } catch {}
}

const initial = loadLayouts()

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layouts: initial.layouts,
  activeLayoutId: initial.activeLayoutId,

  setActiveLayout: (id) => {
    saveLayouts(get().layouts, id)
    set({ activeLayoutId: id })
  },

  saveLayout: (name, sectionIds) => {
    const newLayout: SavedLayout = {
      id: `layout-${Date.now()}`,
      name,
      sectionIds,
      createdAt: new Date().toISOString(),
    }
    const layouts = [...get().layouts, newLayout]
    saveLayouts(layouts, newLayout.id)
    set({ layouts, activeLayoutId: newLayout.id })
  },

  deleteLayout: (id) => {
    if (id === 'default') return  // can't delete default
    const layouts = get().layouts.filter(l => l.id !== id)
    const activeLayoutId = get().activeLayoutId === id ? 'default' : get().activeLayoutId
    saveLayouts(layouts, activeLayoutId)
    set({ layouts, activeLayoutId })
  },

  reorderSections: (sectionIds) => {
    const activeId = get().activeLayoutId
    const layouts = get().layouts.map(l =>
      l.id === activeId ? { ...l, sectionIds } : l
    )
    saveLayouts(layouts, activeId)
    set({ layouts })
  },
}))
