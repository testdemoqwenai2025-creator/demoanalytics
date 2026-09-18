'use client'

import * as React from 'react'
import { Plane, RefreshCw, Plane as PlaneIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionHeading, StatCard, EmptyState } from '@/components/dashboard/primitives'

// OpenSky Network is a free flight tracking API (no key for basic use, CORS via proxy)
// Docs: https://openskynetwork.github.io/opensky-api/

interface FlightState {
  icao24: string
  callsign: string
  origin: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
  heading: number
}

// Generate synthetic flight data (OpenSky requires auth for production use)
function generateSyntheticFlights(): FlightState[] {
  const airlines = ['UAL', 'DAL', 'AAL', 'SWA', 'BAW', 'AFR', 'DLH', 'JAL', 'QFA', 'SIA']
  const origins = ['JFK', 'LHR', 'CDG', 'FRA', 'NRT', 'SYD', 'DXB', 'SIN', 'LAX', 'ORD']
  return Array.from({ length: 25 }, (_, i) => ({
    icao24: Math.random().toString(16).slice(2, 8),
    callsign: `${airlines[i % airlines.length]}${100 + Math.floor(Math.random() * 900)}`,
    origin: origins[i % origins.length],
    longitude: -180 + Math.random() * 360,
    latitude: -85 + Math.random() * 170,
    altitude: Math.floor(30000 + Math.random() * 12000),
    velocity: Math.floor(700 + Math.random() * 200),
    heading: Math.floor(Math.random() * 360),
  }))
}

export default function FlightsPage() {
  const [flights, setFlights] = React.useState<FlightState[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchFlights = React.useCallback(async () => {
    setLoading(true)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600))
    setFlights(generateSyntheticFlights())
    setLoading(false)
  }, [])

  React.useEffect(() => { fetchFlights() }, [fetchFlights])

  return (
    <>
      <SectionHeading
        title="Live Flights Plugin"
        description="Sample plugin using OpenSky Network API (free for non-commercial use). Demonstrates plugin system."
        action={
          <Badge variant="outline" className="text-[10px] gap-1">
            <Plane className="h-3 w-3" /> Plugin v1.0
          </Badge>
        }
      />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={fetchFlights} disabled={loading}>
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <Badge variant="outline" className="text-[10px] gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          synthetic data
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Flights" value={flights.length} icon={<PlaneIcon className="h-4 w-4" />} loading={loading} />
        <StatCard label="Avg Altitude" value={flights.length ? `${Math.round(flights.reduce((s, f) => s + f.altitude, 0) / flights.length).toLocaleString()} ft` : '—'} loading={loading} />
        <StatCard label="Avg Velocity" value={flights.length ? `${Math.round(flights.reduce((s, f) => s + f.velocity, 0) / flights.length)} km/h` : '—'} loading={loading} />
        <StatCard label="Unique Origins" value={new Set(flights.map(f => f.origin)).size} loading={loading} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Flight States</CardTitle>
          <CardDescription className="text-xs">
            Live aircraft positions (synthetic data — OpenSky requires auth for production)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-3 space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8" />)}</div>
          ) : flights.length === 0 ? (
            <EmptyState title="No flights" />
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="text-xs">Callsign</TableHead>
                    <TableHead className="text-xs">ICAO24</TableHead>
                    <TableHead className="text-xs">Origin</TableHead>
                    <TableHead className="text-xs text-right">Altitude</TableHead>
                    <TableHead className="text-xs text-right">Velocity</TableHead>
                    <TableHead className="text-xs text-right">Heading</TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flights.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono font-medium">{f.callsign}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{f.icao24}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] font-mono">{f.origin}</Badge></TableCell>
                      <TableCell className="text-xs font-mono tabular-nums text-right">{f.altitude.toLocaleString()} ft</TableCell>
                      <TableCell className="text-xs font-mono tabular-nums text-right">{f.velocity} km/h</TableCell>
                      <TableCell className="text-xs font-mono tabular-nums text-right">{f.heading}°</TableCell>
                      <TableCell className="text-xs font-mono text-right hidden md:table-cell text-muted-foreground">
                        {f.latitude.toFixed(2)}, {f.longitude.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Plugin info:</strong> This sample plugin shows how the
          plugin system works. Add new plugins by creating a folder in{' '}
          <code className="bg-muted px-1 rounded font-mono">src/plugins/&lt;name&gt;/</code> with a{' '}
          <code className="bg-muted px-1 rounded font-mono">plugin.json</code> and{' '}
          <code className="bg-muted px-1 rounded font-mono">page.tsx</code>. The sidebar, search, and
          routes auto-discover it.
          <br /><br />
          <strong className="text-foreground">Data source:</strong>{' '}
          <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            OpenSky Network
          </a>{' '}
          — free for non-commercial use with rate limits (400 req/day anonymous, 4000 with account).
        </CardContent>
      </Card>
    </>
  )
}
