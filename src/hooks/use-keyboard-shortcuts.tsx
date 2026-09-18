'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/store'

// Keyboard shortcuts:
//   g d → /dashboard
//   g m → /markets
//   g n → /news
//   g f → /files
//   g s → /stories
//   g l → /live
//   g e → /exports
//   g q → /query-builder
//   g c → /charts
//   g p → /pricing
//   g t → /settings (settings)
//   g a → /automate
//   g h → / (home)
//   g o → /connectors
//   g w → /notifications
//   ? → toggle shortcuts help
//   Escape → close any overlay

const SHORTCUTS: { key: string; label: string; href: string }[] = [
  { key: 'g d', label: 'Dashboard', href: '/dashboard' },
  { key: 'g m', label: 'Markets', href: '/markets' },
  { key: 'g n', label: 'News', href: '/news' },
  { key: 'g f', label: 'Files', href: '/files' },
  { key: 'g s', label: 'Stories', href: '/stories' },
  { key: 'g l', label: 'Live', href: '/live' },
  { key: 'g e', label: 'Exports', href: '/exports' },
  { key: 'g q', label: 'Query Builder', href: '/query-builder' },
  { key: 'g c', label: 'Charts', href: '/charts' },
  { key: 'g p', label: 'Pricing', href: '/pricing' },
  { key: 'g t', label: 'Settings', href: '/settings' },
  { key: 'g a', label: 'Automation', href: '/automate' },
  { key: 'g h', label: 'Home', href: '/' },
  { key: 'g o', label: 'Connectors', href: '/connectors' },
  { key: 'g w', label: 'Notifications', href: '/notifications' },
]

export function useKeyboardShortcuts() {
  const router = useRouter()
  const setSidebarOpen = useDashboardStore(s => s.setSidebarOpen)
  const [showHelp, setShowHelp] = React.useState(false)
  const lastKeyRef = React.useRef<string>('')
  const lastKeyTimeRef = React.useRef<number>(0)

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Escape closes everything
      if (e.key === 'Escape') {
        setShowHelp(false)
        setSidebarOpen(false)
        lastKeyRef.current = ''
        return
      }

      // ? shows help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowHelp(prev => !prev)
        return
      }

      // Two-key sequences (g + letter)
      const now = Date.now()
      if (lastKeyRef.current === 'g' && now - lastKeyTimeRef.current < 1000) {
        const shortcut = SHORTCUTS.find(s => s.key === `g ${e.key}`)
        if (shortcut) {
          e.preventDefault()
          router.push(shortcut.href)
          lastKeyRef.current = ''
          setShowHelp(false)
          return
        }
      }

      // Record first key
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        lastKeyRef.current = 'g'
        lastKeyTimeRef.current = now
      } else {
        lastKeyRef.current = ''
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router, setSidebarOpen])

  return { showHelp, setShowHelp, shortcuts: SHORTCUTS }
}

// Help overlay component
export function ShortcutsHelp({ show, onClose, shortcuts }: {
  show: boolean
  onClose: () => void
  shortcuts: typeof SHORTCUTS
}) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg border shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">
            Esc
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between p-1.5 rounded hover:bg-accent/40">
              <span className="text-muted-foreground">{s.label}</span>
              <kbd className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border">
                {s.key.split(' ').map((k, i) => (
                  <span key={i}>{i > 0 && ' + '}{k}</span>
                ))}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t text-[10px] text-muted-foreground">
          Press <kbd className="font-mono bg-muted px-1 rounded">?</kbd> anytime to toggle this help.
          Sequences work by pressing <kbd className="font-mono bg-muted px-1 rounded">g</kbd> then the letter within 1 second.
        </div>
      </div>
    </div>
  )
}
