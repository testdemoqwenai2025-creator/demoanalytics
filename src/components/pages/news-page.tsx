'use client'

import * as React from 'react'
import { RefreshCw, ExternalLink, Search, Newspaper, AlertTriangle, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeading, StatusPill, EmptyState, StatCard } from '@/components/dashboard/primitives'
import { RSS_SOURCES, type RssSource } from '@/lib/data-sources'
import { useApiGuard } from '@/hooks/use-api-usage'
import { toast } from 'sonner'

interface FeedItem {
  title: string
  link: string
  pubDate: string
  description: string
  thumbnail?: string
  source: string
  sourceId: string
  category: string
}

export function NewsPage() {
  const [selectedSource, setSelectedSource] = React.useState<RssSource>(RSS_SOURCES[0])
  const [items, setItems] = React.useState<FeedItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'finance' | 'tech'>('all')

  const { canCall, track, usage } = useApiGuard('rss2json')

  const fetchFeed = async (source: RssSource) => {
    if (!canCall) {
      toast.error('RSS2JSON rate limit reached', {
        description: 'Free tier: 10,000 requests/day. Visit Pricing to upgrade.',
        action: { label: 'Upgrade', onClick: () => window.open('/pricing', '_self') },
      })
      return
    }

    setLoading(true)
    setError(null)
    track()

    try {
      // Use rss2json.com as a free CORS-enabled RSS-to-JSON proxy
      const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
      const res = await fetch(rss2jsonUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (data.status !== 'ok') throw new Error(data.message || 'Feed fetch failed')

      const feedItems: FeedItem[] = (data.items || []).slice(0, 50).map((item: any) => ({
        title: item.title || 'Untitled',
        link: item.link || '#',
        pubDate: item.pubDate || '',
        description: stripHtml(item.description || '').slice(0, 300),
        thumbnail: item.thumbnail || extractImage(item.description || item.content || ''),
        source: source.name,
        sourceId: source.id,
        category: source.category,
      }))

      setItems(feedItems)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch feed')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchFeed(selectedSource)
  }, [selectedSource])

  const filteredItems = items.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
        !item.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <SectionHeading
        title="News Feeds"
        description="Live RSS from 10 financial + tech sources. Free-tier via rss2json.com."
        action={
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${usage.status === 'limit-reached' ? 'bg-red-500' : usage.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {usage.callsLastDay}/{usage.limitPerDay || '∞'} calls today
          </Badge>
        }
      />

      {/* Rate limit warning */}
      {usage.status === 'warning' && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Approaching RSS2JSON free tier limit ({usage.percentUsed}% used)
            </span>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              {usage.callsLastDay} of {usage.limitPerDay} daily requests consumed.{' '}
              <a href="/pricing" className="underline">View upgrade options →</a>
            </p>
          </div>
        </div>
      )}

      {usage.status === 'limit-reached' && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-red-900 dark:text-red-200">
              RSS2JSON free tier limit reached
            </span>
            <p className="text-red-700 dark:text-red-300 mt-0.5">
              You've used all {usage.limitPerDay} free requests today.{' '}
              <a href="/pricing" className="underline">Upgrade to a paid plan →</a> or wait until tomorrow.
            </p>
          </div>
        </div>
      )}

      {/* Source selector + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedSource.id} onValueChange={(v) => {
          const src = RSS_SOURCES.find(s => s.id === v)
          if (src) setSelectedSource(src)
        }}>
          <SelectTrigger className="w-[220px] h-9">
            <Newspaper className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RSS_SOURCES.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                  <Badge variant="outline" className="text-[9px] ml-1">{s.category}</Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="finance">Finance only</SelectItem>
            <SelectItem value="tech">Tech only</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search articles..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>

        <Button size="sm" variant="outline" onClick={() => fetchFeed(selectedSource)} disabled={loading}>
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Source info */}
      <Card className="bg-muted/30">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md text-white text-xs font-bold"
            style={{ backgroundColor: selectedSource.color }}>
            {selectedSource.name[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{selectedSource.name}</div>
            <div className="text-xs text-muted-foreground">{selectedSource.description}</div>
          </div>
          <Badge variant="outline" className="text-[10px]">{selectedSource.category}</Badge>
        </CardContent>
      </Card>

      {/* Feed items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Latest Articles</span>
            <span className="text-xs text-muted-foreground font-normal">{filteredItems.length} items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive p-4">
              Failed to load feed: {error}
              <p className="text-xs text-muted-foreground mt-2">
                The RSS source may be temporarily unavailable or the rss2json proxy may be rate-limiting.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : filteredItems.length === 0 ? (
            <EmptyState title="No articles found" description="Try a different source or search term." />
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredItems.map((item, i) => (
                  <ArticleCard key={`${item.sourceId}-${i}`} item={item} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ArticleCard({ item }: { item: FeedItem }) {
  const [expanded, setExpanded] = React.useState(false)
  const source = RSS_SOURCES.find(s => s.id === item.sourceId)

  return (
    <div className="rounded-md border p-3 hover:bg-accent/40 transition-colors">
      <div className="flex items-start gap-3">
        {item.thumbnail && (
          <img src={item.thumbnail} alt="" className="w-16 h-16 rounded object-cover shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: source?.color || '#888' }} />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.source}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{formatDate(item.pubDate)}</span>
          </div>
          <h3 className="text-sm font-medium leading-tight mb-1">{item.title}</h3>
          <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a href={item.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              Read article <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <button onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              {expanded ? 'Show less' : 'Show more'}
              <ChevronDown className={`h-2.5 w-2.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/)
  return match?.[1]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
