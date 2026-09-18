'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LiveFilterProps<T> {
  items: T[]
  searchKeys: (keyof T | string)[]
  placeholder?: string
  onFilter?: (filtered: T[]) => void
  children?: (filtered: T[]) => React.ReactNode
  className?: string
  // Show result count
  showCount?: boolean
  // Debounce in ms
  debounceMs?: number
}

/**
 * LiveFilter — a reusable component that filters items as you type.
 * Searches across multiple keys, with debouncing and result count.
 *
 * Usage:
 *   <LiveFilter items={users} searchKeys={['name', 'email']} placeholder="Filter users...">
 *     {(filtered) => filtered.map(u => <UserCard key={u.id} user={u} />)}
 *   </LiveFilter>
 */
export function LiveFilter<T extends Record<string, any>>({
  items,
  searchKeys,
  placeholder = 'Filter...',
  onFilter,
  children,
  className,
  showCount = true,
  debounceMs = 150,
}: LiveFilterProps<T>) {
  const [query, setQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  // Debounce the query
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs])

  const filtered = React.useMemo(() => {
    if (!debouncedQuery.trim()) return items
    const q = debouncedQuery.toLowerCase()
    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key]
        return value != null && String(value).toLowerCase().includes(q)
      })
    )
  }, [items, debouncedQuery, searchKeys])

  React.useEffect(() => {
    onFilter?.(filtered)
  }, [filtered, onFilter])

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-8 pr-8 h-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {showCount && (
          <Badge variant="outline" className="text-[10px] whitespace-nowrap">
            {filtered.length} / {items.length}
          </Badge>
        )}
      </div>
      {children && children(filtered)}
    </div>
  )
}
