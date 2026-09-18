// Data source registry — all free-tier API providers used by MERIDIAN.
// Each provider has documented free-tier limits and upgrade URLs.
// When a user hits a limit, the UI shows an upgrade prompt linking to the provider.

export interface DataSource {
  id: string
  name: string
  category: 'crypto' | 'fx' | 'equities' | 'news' | 'rss' | 'general'
  description: string
  // Free tier info
  freeTierLimit: string
  freeTierRateLimit: string
  requiresApiKey: boolean
  apiKeyUrl?: string  // where to get a key
  // Upgrade info
  upgradeUrl: string
  upgradeText: string
  // CORS support for direct browser fetching
  corsEnabled: boolean
  // Docs URL
  docsUrl: string
  // Whether this provider is currently active in the app
  active: boolean
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'crypto',
    description: 'Crypto market data — prices, market caps, volume, OHLCV for 10,000+ coins.',
    freeTierLimit: '10,000 calls/month',
    freeTierRateLimit: '10-30 calls/min',
    requiresApiKey: false,
    upgradeUrl: 'https://www.coingecko.com/en/api/pricing',
    upgradeText: 'Demo API plan — $0/mo, 500 calls/min',
    corsEnabled: true,
    docsUrl: 'https://docs.coingecko.com/reference/introduction',
    active: true,
  },
  {
    id: 'frankfurter',
    name: 'Frankfurter',
    category: 'fx',
    description: 'ECB daily reference foreign exchange rates. Open source, no key, no limits.',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'No rate limit',
    requiresApiKey: false,
    upgradeUrl: 'https://github.com/hakanensari/frankfurter',
    upgradeText: 'Free forever — self-hostable',
    corsEnabled: true,
    docsUrl: 'https://www.frankfurter.app/docs/',
    active: true,
  },
  {
    id: 'rss2json',
    name: 'RSS2JSON',
    category: 'rss',
    description: 'Converts any RSS feed to JSON. CORS-enabled, works directly from browser.',
    freeTierLimit: '10,000 requests/day',
    freeTierRateLimit: '5 requests/sec',
    requiresApiKey: false,
    apiKeyUrl: 'https://rss2json.com/register',
    upgradeUrl: 'https://rss2json.com/pricing',
    upgradeText: 'Paid plans from $9/mo — 100k requests/day',
    corsEnabled: true,
    docsUrl: 'https://rss2json.com/docs',
    active: true,
  },
  {
    id: 'alphavantage',
    name: 'Alpha Vantage',
    category: 'equities',
    description: 'Stock market data, forex, crypto, technical indicators. Requires free API key.',
    freeTierLimit: '25 requests/day',
    freeTierRateLimit: '5 requests/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://www.alphavantage.co/support/#api-key',
    upgradeUrl: 'https://www.alphavantage.co/premium/',
    upgradeText: 'Premium plans from $49.99/mo — 75 req/min',
    corsEnabled: true,
    docsUrl: 'https://www.alphavantage.co/documentation/',
    active: false,
  },
  {
    id: 'finnhub',
    name: 'Finnhub',
    category: 'general',
    description: 'Stock, forex, crypto data + company news, earnings, economic calendar.',
    freeTierLimit: '60 calls/min',
    freeTierRateLimit: '60 calls/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://finnhub.io/register',
    upgradeUrl: 'https://finnhub.io/pricing',
    upgradeText: 'Pro from $9.99/mo — 300 calls/min',
    corsEnabled: true,
    docsUrl: 'https://finnhub.io/docs/api',
    active: false,
  },
  {
    id: 'newsapi',
    name: 'NewsAPI.org',
    category: 'news',
    description: 'Aggregate news from 80,000+ sources worldwide. Full-text search.',
    freeTierLimit: '100 requests/day',
    freeTierRateLimit: 'Development only (localhost)',
    requiresApiKey: true,
    apiKeyUrl: 'https://newsapi.org/register',
    upgradeUrl: 'https://newsapi.org/pricing',
    upgradeText: 'Business from $449/mo — production use',
    corsEnabled: true,
    docsUrl: 'https://newsapi.org/docs',
    active: false,
  },
  {
    id: 'stooq',
    name: 'Stooq',
    category: 'equities',
    description: 'Historical stock OHLCV data as CSV. Free, no key. (Requires JS verification for server-side.)',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'Fair use',
    requiresApiKey: false,
    upgradeUrl: 'https://stooq.com',
    upgradeText: 'Free — no paid tier',
    corsEnabled: false,
    docsUrl: 'https://stooq.com/q/d/l/',
    active: false,
  },
]

// RSS feed sources (financial + tech news)
export interface RssSource {
  id: string
  name: string
  category: 'finance' | 'tech' | 'general'
  url: string
  // Display info
  description: string
  color: string  // hex color for badge
}

export const RSS_SOURCES: RssSource[] = [
  // Financial news (7 sources)
  {
    id: 'cnbc',
    name: 'CNBC',
    category: 'finance',
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
    description: 'Top business and financial news from CNBC',
    color: '#005594',
  },
  {
    id: 'bbc-business',
    name: 'BBC Business',
    category: 'finance',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    description: 'BBC News Business section',
    color: '#bb1919',
  },
  {
    id: 'npr-business',
    name: 'NPR Business',
    category: 'finance',
    url: 'https://feeds.npr.org/1006/rss.xml',
    description: 'NPR Business news',
    color: '#0066cc',
  },
  {
    id: 'wsj-markets',
    name: 'WSJ Markets',
    category: 'finance',
    url: 'https://feeds.content.dowjones.io/public/rss/SB10001424053111904210904576582181006553888',
    description: 'Wall Street Journal Markets feed',
    color: '#0274b6',
  },
  {
    id: 'yahoo-finance',
    name: 'Yahoo Finance',
    category: 'finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    description: 'Yahoo Finance top stories',
    color: '#6001d2',
  },
  {
    id: 'investing-news',
    name: 'Investing.com',
    category: 'finance',
    url: 'https://www.investing.com/rss/news_1.rss',
    description: 'Investing.com financial news',
    color: '#ff7900',
  },
  {
    id: 'ft-markets',
    name: 'FT Markets',
    category: 'finance',
    url: 'https://www.ft.com/rss/home',
    description: 'Financial Times latest news',
    color: '#990f3d',
  },
  // Tech news (3 sources)
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    category: 'tech',
    url: 'https://techcrunch.com/feed/',
    description: 'Startup and technology news',
    color: '#00c853',
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    category: 'tech',
    url: 'https://www.theverge.com/rss/index.xml',
    description: 'Technology, science, and culture',
    color: '#e91e63',
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    category: 'tech',
    url: 'https://news.ycombinator.com/rss',
    description: 'Y Combinator Hacker News — top stories',
    color: '#ff6600',
  },
]

// Helper to get a data source by ID
export function getDataSource(id: string): DataSource | undefined {
  return DATA_SOURCES.find(s => s.id === id)
}

// Helper to get RSS sources by category
export function getRssSources(category?: 'finance' | 'tech' | 'general'): RssSource[] {
  if (!category) return RSS_SOURCES
  return RSS_SOURCES.filter(s => s.category === category)
}
