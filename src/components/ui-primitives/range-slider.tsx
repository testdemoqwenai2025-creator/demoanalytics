'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  defaultValue?: [number, number]
  value?: [number, number]
  onChange?: (value: [number, number]) => void
  // Labels
  label?: string
  unit?: string
  // Show values
  showValues?: boolean
  // Formatting function for the values
  formatValue?: (value: number) => string
  className?: string
}

/**
 * RangeSlider — a dual-handle range slider component.
 * Allows users to select a min and max value from a range.
 *
 * Usage:
 *   <RangeSlider min={0} max={1000} step={10} label="Price range" unit="$"
 *     onChange={(range) => console.log(range)} />
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  defaultValue,
  value: controlledValue,
  onChange,
  label,
  unit,
  showValues = true,
  formatValue,
  className,
}: RangeSliderProps) {
  const [internalValue, setInternalValue] = React.useState<[number, number]>(
    controlledValue || defaultValue || [min, max]
  )
  const value = controlledValue || internalValue
  const [activeHandle, setActiveHandle] = React.useState<'min' | 'max' | null>(null)

  const percentage = (val: number) => ((val - min) / (max - min)) * 100

  const handleChange = (handle: 'min' | 'max', newValue: number) => {
    // Clamp to step
    const stepped = Math.round(newValue / step) * step

    if (handle === 'min') {
      const clamped = Math.min(stepped, value[1] - step)
      const newVal: [number, number] = [Math.max(clamped, min), value[1]]
      if (!controlledValue) setInternalValue(newVal)
      onChange?.(newVal)
    } else {
      const clamped = Math.max(stepped, value[0] + step)
      const newVal: [number, number] = [value[0], Math.min(clamped, max)]
      if (!controlledValue) setInternalValue(newVal)
      onChange?.(newVal)
    }
  }

  const fmt = (v: number) => {
    if (formatValue) return formatValue(v)
    if (unit) return `${unit}${v.toLocaleString()}`
    return v.toLocaleString()
  }

  const sliderRef = React.useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const raw = min + pct * (max - min)
    handleChange(activeHandle, raw)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">{label}</label>
          {showValues && (
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {fmt(value[0])} — {fmt(value[1])}
            </span>
          )}
        </div>
      )}

      <div
        ref={sliderRef}
        className="relative h-6 flex items-center"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setActiveHandle(null)}
        onPointerLeave={() => setActiveHandle(null)}
      >
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-muted rounded-full" />

        {/* Selected range */}
        <div
          className="absolute h-1.5 bg-primary rounded-full"
          style={{
            left: `${percentage(value[0])}%`,
            width: `${percentage(value[1]) - percentage(value[0])}%`,
          }}
        />

        {/* Min handle */}
        <div
          className={cn(
            'absolute h-4 w-4 rounded-full bg-background border-2 border-primary shadow-sm transition-transform cursor-grab',
            activeHandle === 'min' && 'scale-125 cursor-grabbing'
          )}
          style={{ left: `calc(${percentage(value[0])}% - 8px)` }}
          onPointerDown={(e) => {
            e.preventDefault()
            setActiveHandle('min')
          }}
          role="slider"
          aria-label="Minimum value"
          aria-valuenow={value[0]}
          aria-valuemin={min}
          aria-valuemax={value[1]}
        />

        {/* Max handle */}
        <div
          className={cn(
            'absolute h-4 w-4 rounded-full bg-background border-2 border-primary shadow-sm transition-transform cursor-grab',
            activeHandle === 'max' && 'scale-125 cursor-grabbing'
          )}
          style={{ left: `calc(${percentage(value[1])}% - 8px)` }}
          onPointerDown={(e) => {
            e.preventDefault()
            setActiveHandle('max')
          }}
          role="slider"
          aria-label="Maximum value"
          aria-valuenow={value[1]}
          aria-valuemin={value[0]}
          aria-valuemax={max}
        />
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}
