/**
 * MERIDIAN Tick Service — WebSocket mini-service for live tick streaming.
 *
 * Run: cd mini-services/tick-service && bun install && bun run dev
 *
 * This service:
 * 1. Listens on port 3003
 * 2. Emits synthetic tick data every 2 seconds
 * 3. Supports client subscriptions via socket.io
 *
 * In production, this would proxy real exchange feeds (Binance WS, etc.)
 * and fan out to connected clients.
 *
 * Frontend connects via:
 *   import { io } from 'socket.io-client'
 *   const socket = io('/?XTransformPort=3003')
 *   socket.on('tick', (data) => console.log(data))
 */

import { Server } from 'socket.io'
import { createServer } from 'http'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/',
})

// Synthetic tick generator
const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPX']
const BASE_PRICES: Record<string, number> = {
  AAPL: 178.50, MSFT: 412.30, NVDA: 875.40, TSLA: 198.20,
  AMZN: 178.90, GOOGL: 142.80, META: 487.60, SPX: 5165.30,
}

const currentPrices: Record<string, number> = { ...BASE_PRICES }

function generateTick() {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const basePrice = currentPrices[symbol]
  const change = (Math.random() - 0.5) * basePrice * 0.002  // 0.2% volatility
  const newPrice = Math.max(basePrice + change, basePrice * 0.5)
  currentPrices[symbol] = newPrice

  return {
    symbol,
    price: Number(newPrice.toFixed(4)),
    change: Number(change.toFixed(4)),
    changePct: Number((change / basePrice * 100).toFixed(4)),
    volume: Math.floor(100 + Math.random() * 900),
    timestamp: Date.now(),
  }
}

// Emit ticks every 2 seconds
setInterval(() => {
  const tick = generateTick()
  io.emit('tick', tick)
  // Also emit a batch every 10 seconds
  if (Math.random() < 0.1) {
    const batch = Array.from({ length: 5 }, generateTick)
    io.emit('tickBatch', batch)
  }
}, 2000)

io.on('connection', (socket) => {
  console.log(`[tick-service] Client connected: ${socket.id}`)

  // Send current state on connect
  socket.emit('state', {
    symbols: SYMBOLS,
    prices: currentPrices,
    timestamp: Date.now(),
  })

  socket.on('subscribe', (symbol: string) => {
    console.log(`[tick-service] ${socket.id} subscribed to ${symbol}`)
    socket.join(`symbol-${symbol}`)
  })

  socket.on('unsubscribe', (symbol: string) => {
    socket.leave(`symbol-${symbol}`)
  })

  socket.on('disconnect', () => {
    console.log(`[tick-service] Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`[tick-service] WebSocket server running on http://localhost:${PORT}`)
  console.log(`[tick-service] Connect from frontend: io('/?XTransformPort=${PORT}')`)
})
