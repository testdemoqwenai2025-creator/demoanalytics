'use client'

import * as React from 'react'
import { Cloud, RefreshCw, Droplets, Wind, Thermometer, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeading, StatCard } from '@/components/dashboard/primitives'

// Open-Meteo is a free weather API (no key required, CORS-enabled)
// Docs: https://open-meteo.com/en/docs

interface WeatherData {
  temperature: number
  windspeed: number
  winddirection: number
  weathercode: number
  relativehumidity: number
  apparent_temperature: number
  precipitation: number
  cloudcover: number
  visibility: number
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Severe thunderstorm',
}

const CITIES = [
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69 },
  { name: 'Sydney', lat: -33.87, lon: 151.21 },
  { name: 'Dubai', lat: 25.20, lon: 55.27 },
]

export default function WeatherPage() {
  const [city, setCity] = React.useState(CITIES[0])
  const [data, setData] = React.useState<WeatherData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchWeather = React.useCallback(async (c: typeof CITIES[0]) => {
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,visibility`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const c_data = json.current
      setData({
        temperature: c_data.temperature_2m,
        windspeed: c_data.wind_speed_10m,
        winddirection: c_data.wind_direction_10m,
        weathercode: c_data.weather_code,
        relativehumidity: c_data.relative_humidity_2m,
        apparent_temperature: c_data.apparent_temperature,
        precipitation: c_data.precipitation,
        cloudcover: c_data.cloud_cover,
        visibility: c_data.visibility || 10000,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchWeather(city) }, [city, fetchWeather])

  return (
    <>
      <SectionHeading
        title="Weather Plugin"
        description="Sample plugin using Open-Meteo API (free, no key, CORS-enabled). Demonstrates the plugin system."
        action={<Badge variant="outline" className="text-[10px]">Plugin v1.0</Badge>}
      />

      <div className="flex flex-wrap items-center gap-2">
        {CITIES.map(c => (
          <Button key={c.name} size="sm" variant={c.name === city.name ? 'default' : 'outline'}
            onClick={() => setCity(c)} className="text-xs">
            {c.name}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => fetchWeather(city)} disabled={loading} className="ml-auto">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {error ? (
        <Card><CardContent className="p-4 text-sm text-destructive">Failed to load: {error}</CardContent></Card>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : data ? (
        <>
          <Card className="border-l-4 border-l-sky-400">
            <CardContent className="p-4 flex items-center gap-4">
              <Cloud className="h-12 w-12 text-sky-500" />
              <div>
                <div className="text-3xl font-bold">{data.temperature.toFixed(1)}°C</div>
                <div className="text-sm text-muted-foreground">
                  {WEATHER_CODES[data.weathercode] || 'Unknown'} in {city.name}
                </div>
                <div className="text-xs text-muted-foreground">Feels like {data.apparent_temperature.toFixed(1)}°C</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Humidity" value={`${data.relativehumidity}%`} icon={<Droplets className="h-4 w-4" />} />
            <StatCard label="Wind" value={`${data.windspeed} km/h`} icon={<Wind className="h-4 w-4" />} />
            <StatCard label="Cloud Cover" value={`${data.cloudcover}%`} icon={<Eye className="h-4 w-4" />} />
            <StatCard label="Precipitation" value={`${data.precipitation} mm`} icon={<Thermometer className="h-4 w-4" />} />
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Plugin info:</strong> This is a sample plugin demonstrating
              the auto-discovery system. It was added by creating{' '}
              <code className="bg-muted px-1 rounded font-mono">src/plugins/weather/plugin.json</code> and{' '}
              <code className="bg-muted px-1 rounded font-mono">src/plugins/weather/page.tsx</code>. The sidebar,
              search, and routing all auto-discovered it — no manual nav registration needed.
              <br /><br />
              <strong className="text-foreground">Data source:</strong>{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Open-Meteo
              </a>{' '}
              — free, no API key, CORS-enabled, no rate limits for non-commercial use.
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  )
}
