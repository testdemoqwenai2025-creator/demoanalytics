'use client'

import * as React from 'react'
import { Radio, Zap, Pause, Play, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeading, StatCard, EmptyState } from '@/components/dashboard/primitives'
import { toast } from 'sonner'

interface Tick {
  symbol: string
  price: number
  change: number
  changePct: number
  volume: number
  timestamp: number
}

// Generate synthetic ticks client-side (when WebSocket service isn't running)
function generateSyntheticTick(): Tick {
  const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPX']
  const BASE_PRICES: Record<string, number> = {
    AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20,
    AMZN: 178.90, GOOGL: 142.80, META: 487.60, SPX: 5165.30,
  }
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const basePrice = BASE_PRICES[symbol]
  const change = (Math.random() - 0.5) * basePrice * 0.002
  return {
    symbol,
    price: Number((basePrice + change).toFixed(4)),
    change: Number(change.toFixed(4)),
    changePct: Number((change / basePrice * 100).toFixed(4)),
    volume: Math.floor(100 + Math.random() * 900),
    timestamp: Date.now(),
  }
}

export function LiveUpdatesPage() {
  const [ticks, setTicks] = React.useState<Tick[]>([])
  const [latestPrices, setLatestPrices] = React.useState<Record<string, Tick>>({})
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'fallback'>('disconnected')
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const startStreaming = async () => {
    setIsStreaming(true)
    setConnectionStatus('connecting')

    // Try to connect to the WebSocket service first
    try {
      const { io } = await import('socket.io-client')
      const socket = io('/?XTransformPort=3003', { timeout: 3000 })

      socket.on('connect', () => {
        setConnectionStatus('connected')
        toast.success('Connected to live tick service')
      })

      socket.on('tick', (tick: Tick) => {
        setTicks(prev => [tick, ...prev].slice(0, 100))
        setLatestPrices(prev => ({ ...prev, [tick.symbol]: tick }))
      })

      socket.on('connect_error', () => {
        setConnectionStatus('fallback')
        toast.info('WebSocket service not running — using client-side simulation')
        startFallback()
      })

      // Store socket for cleanup
      socketRef.current = socket
    } catch {
      setConnectionStatus('fallback')
      startFallback()
    }
  }

  const socketRef = React.useRef<any>(null)

  const startFallback = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      const tick = generateSyntheticTick()
      setTicks(prev => [tick, ...prev].slice(0, 100))
      setLatestPrices(prev => ({ ...prev, [tick.symbol]: tick }))
    }, 1500)
  }

  const stopStreaming = () => {
    setIsStreaming(false)
    setConnectionStatus('disconnected')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  const totalTicks = ticks.length
  const gainers = Object.values(latestPrices).filter(t => t.changePct > 0).length
  const losers = Object.values(latestPrices).filter(t => t.changePct < 0).length

  return (
    <>
      <SectionHeading
        title="Live Updates (WebSocket)"
        description="Real-time tick streaming. Connects to the tick-service mini-service, or falls back to client-side simulation."
        action={
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'fallback' ? 'bg-amber-500' :
              connectionStatus === 'connecting' ? 'bg-sky-500 animate-pulse' : 'bg-muted-foreground'
            }`} />
            {connectionStatus}
          </Badge>
        }
      />

      {/* Controls */}
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Button size="sm" onClick={isStreaming ? stopStreaming : startStreaming}>
            {isStreaming ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause Stream</> : <><Play className="h-3.5 w-3.5 mr-1" /> Start Stream</>}
          </Button>
          <div className="text-xs text-muted-foreground">
            {connectionStatus === 'connected' && 'Connected to ws://localhost:3003 — real WebSocket service'}
            {connectionStatus === 'fallback' && 'WebSocket service not running — using client-side simulation (1.5s interval)'}
            {connectionStatus === 'connecting' && 'Connecting to tick-service...'}
            {connectionStatus === 'disconnected' && 'Stream stopped'}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Ticks Received" value={totalTicks} icon={<Zap className="h-4 w-4" />} />
        <StatCard label="Active Symbols" value={Object.keys(latestPrices).length} icon={<Radio className="h-4 w-4" />} />
        <StatCard label="Gainers" value={gainers} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <StatCard label="Losers" value={losers} icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Latest prices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latest Prices</CardTitle>
            <CardDescription className="text-xs">Most recent tick per symbol</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(latestPrices).length === 0 ? (
              <EmptyState title="No ticks yet" description="Start the stream to see live prices." />
            ) : (
              <div className="space-y-1.5">
                {Object.values(latestPrices).map(tick => (
                  <div key={tick.symbol} className="flex items-center justify-between p-2 rounded-md border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">{tick.symbol}</Badge>
                      <span className="text-sm font-mono tabular-nums">${tick.price.toFixed(2)}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-mono tabular-nums ${
                      tick.changePct > 0 ? 'text-emerald-600' : tick.changePct < 0 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {tick.changePct > 0 ? <TrendingUp className="h-3 w-3" /> : tick.changePct < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                      {tick.changePct > 0 ? '+' : ''}{tick.changePct.toFixed(3)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tick stream */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tick Stream (live)</CardTitle>
            <CardDescription className="text-xs">Most recent 100 ticks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {ticks.length === 0 ? (
                <EmptyState title="No ticks yet" />
              ) : (
                <div className="divide-y">
                  {ticks.map((tick, i) => (
                    <div key={i} className="p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {new Date(tick.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px]">{tick.symbol}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums">${tick.price.toFixed(2)}</span>
                        <span className={`font-mono tabular-nums w-16 text-right ${
                          tick.changePct > 0 ? 'text-emerald-600' : tick.changePct < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {tick.changePct > 0 ? '+' : ''}{tick.changePct.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums w-16 text-right">
                          {tick.volume.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Setup instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground space-y-2">
          <div className="font-medium text-foreground">WebSocket setup:</div>
          <div>To run the real WebSocket service (instead of client-side simulation):</div>
          <pre className="bg-muted p-2 rounded font-mono text-[10px] mt-1">
{`# Terminal 1: Start the tick service
cd mini-services/tick-service
bun install
bun run dev

# Terminal 2: Start the Next.js dev server
cd /home/z/my-project
bun run dev

# Then visit this page and click "Start Stream"
# The page will auto-detect the WebSocket service`}
          </pre>
          <div className="mt-2 pt-2 border-t">
            In production, deploy the tick-service to a separate host (Render, Fly.io, Railway)
            and update the XTransformPort in the io() call to point to it.
          </div>
        </CardContent>
      </Card>
    </>
  )
}
