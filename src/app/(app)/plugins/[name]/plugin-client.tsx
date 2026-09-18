'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Puzzle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PLUGINS } from '@/lib/plugins'
import WeatherPage from '@/plugins/weather/page'
import FlightsPage from '@/plugins/flights/page'

export default function PluginClient({ name }: { name: string }) {
  const plugin = PLUGINS.find(p => p.name === name)
  if (!plugin) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <span>/</span>
        <span className="inline-flex items-center gap-1">
          <Puzzle className="h-3 w-3" /> Plugin
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">{plugin.title}</span>
        <Badge variant="outline" className="ml-2 text-[9px]">{plugin.category}</Badge>
      </div>

      {/* Render the plugin page */}
      {name === 'weather' && <WeatherPage />}
      {name === 'flights' && <FlightsPage />}
      {!['weather', 'flights'].includes(name) && (
        <div className="p-4">
          <h1 className="text-lg font-semibold">Plugin page not implemented</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The plugin "{plugin.name}" is registered but its page component is not available.
          </p>
        </div>
      )}
    </div>
  )
}
