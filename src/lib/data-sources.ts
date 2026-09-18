// Data source registry — all free-tier API providers used by MERIDIAN.
// Each provider has documented free-tier limits and upgrade URLs.
// When a user hits a limit, the UI shows an upgrade prompt linking to the provider.

export interface DataSource {
  id: string
  name: string
  category: 'crypto' | 'fx' | 'equities' | 'news' | 'rss' | 'general' | 'economic' | 'regulatory' | 'realtime'
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
  // Real-time support (WebSocket)
  realtime?: boolean
  wsUrl?: string  // WebSocket endpoint
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
  // ─── Real-time WebSocket providers (free, no key) ───
  {
    id: 'binance-ws',
    name: 'Binance WebSocket',
    category: 'realtime',
    description: 'Real-time crypto trades and order book via WebSocket. No API key, no rate limit, true streaming.',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'No limit (per connection)',
    requiresApiKey: false,
    upgradeUrl: 'https://binance.com/en/support/faq/how-to-connect-to-binance-api-3a04b6e8d3c7',
    upgradeText: 'Free forever — WebSocket streaming',
    corsEnabled: true,
    realtime: true,
    wsUrl: 'wss://stream.binance.com:9443/ws',
    docsUrl: 'https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams',
    active: true,
  },
  {
    id: 'coinbase-ws',
    name: 'Coinbase WebSocket',
    category: 'realtime',
    description: 'Real-time crypto ticker data from Coinbase. No API key required.',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'No limit (per connection)',
    requiresApiKey: false,
    upgradeUrl: 'https://docs.cloud.coinbase.com/',
    upgradeText: 'Free forever — WebSocket streaming',
    corsEnabled: true,
    realtime: true,
    wsUrl: 'wss://ws-feed.exchange.coinbase.com',
    docsUrl: 'https://docs.cloud.coinbase.com/exchange/docs/websocket-channels',
    active: false,
  },
  {
    id: 'kraken-ws',
    name: 'Kraken WebSocket',
    category: 'realtime',
    description: 'Real-time crypto market data from Kraken. No API key required.',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'No limit (per connection)',
    requiresApiKey: false,
    upgradeUrl: 'https://www.kraken.com/features/api',
    upgradeText: 'Free forever — WebSocket streaming',
    corsEnabled: true,
    realtime: true,
    wsUrl: 'wss://ws.kraken.com',
    docsUrl: 'https://docs.kraken.com/websockets/',
    active: false,
  },
  // ─── Equity data with free tiers ───
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    category: 'equities',
    description: 'Real-time and historical US stock market data. Free API key includes live market data.',
    freeTierLimit: '200 calls/min',
    freeTierRateLimit: '200 calls/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://app.alpaca.markets/signup',
    upgradeUrl: 'https://alpaca.markets/pricing',
    upgradeText: 'Pro from $99/mo — unlimited data',
    corsEnabled: false,
    realtime: true,
    wsUrl: 'wss://stream.data.alpaca.markets/v2/iex',
    docsUrl: 'https://alpaca.markets/docs/api-references/',
    active: false,
  },
  {
    id: 'twelvedata',
    name: 'Twelve Data',
    category: 'equities',
    description: 'Stock, forex, crypto, and ETF data. 8 API calls/min on free tier.',
    freeTierLimit: '800 calls/day',
    freeTierRateLimit: '8 calls/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://twelvedata.com/register',
    upgradeUrl: 'https://twelvedata.com/pricing',
    upgradeText: 'Pro from $29/mo — 800 calls/min',
    corsEnabled: true,
    docsUrl: 'https://twelvedata.com/docs',
    active: false,
  },
  {
    id: 'tiingo',
    name: 'Tiingo',
    category: 'equities',
    description: 'End-of-day and real-time stock prices, news, and fundamentals.',
    freeTierLimit: '1,000 requests/day',
    freeTierRateLimit: '10 requests/hour (EOD only)',
    requiresApiKey: true,
    apiKeyUrl: 'https://api.tiingo.com/tiingo/fundamentals/metadatas',
    upgradeUrl: 'https://api.tiingo.com/pricing',
    upgradeText: 'Pro from $10/mo — real-time data',
    corsEnabled: true,
    docsUrl: 'https://api.tiingo.com/documentation',
    active: false,
  },
  {
    id: 'iexcloud',
    name: 'IEX Cloud',
    category: 'equities',
    description: 'US stock market data including real-time quotes, historical prices, and fundamentals.',
    freeTierLimit: '50,000 messages/mo',
    freeTierRateLimit: '5 requests/sec',
    requiresApiKey: true,
    apiKeyUrl: 'https://iexcloud.io/cloud-login',
    upgradeUrl: 'https://iexcloud.io/pricing',
    upgradeText: 'Grow from $19/mo — 5M messages',
    corsEnabled: true,
    docsUrl: 'https://iexcloud.io/docs/',
    active: false,
  },
  // ─── Economic data (free, government APIs) ───
  {
    id: 'fred',
    name: 'FRED (Federal Reserve)',
    category: 'economic',
    description: '80+ years of US economic data from the St. Louis Fed — GDP, inflation, unemployment, rates.',
    freeTierLimit: '120 requests/min',
    freeTierRateLimit: '120 requests/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://fred.stlouisfed.org/docs/api/api_key.html',
    upgradeUrl: 'https://fred.stlouisfed.org',
    upgradeText: 'Free forever — government API',
    corsEnabled: false,
    docsUrl: 'https://fred.stlouisfed.org/docs/api/fred/',
    active: false,
  },
  {
    id: 'ecb',
    name: 'ECB Data Portal',
    category: 'economic',
    description: 'European Central Bank statistical data — exchange rates, monetary aggregates, interest rates.',
    freeTierLimit: 'Unlimited',
    freeTierRateLimit: 'No limit',
    requiresApiKey: false,
    upgradeUrl: 'https://data.ecb.europa.eu/',
    upgradeText: 'Free forever — government API',
    corsEnabled: true,
    docsUrl: 'https://data.ecb.europa.eu/api',
    active: false,
  },
  // ─── Regulatory data (free) ───
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    category: 'regulatory',
    description: 'US SEC company filings — 10-K, 10-Q, 8-K, insider trading. Full-text search. Free, no key.',
    freeTierLimit: '10 requests/sec',
    freeTierRateLimit: '10 requests/sec',
    requiresApiKey: false,
    upgradeUrl: 'https://www.sec.gov/developer',
    upgradeText: 'Free forever — government API',
    corsEnabled: true,
    docsUrl: 'https://www.sec.gov/os/accessing-edgar-data',
    active: false,
  },
  {
    id: 'openfigi',
    name: 'OpenFIGI',
    category: 'regulatory',
    description: 'Financial Instrument Global Identifier mapping. Free API from Bloomberg.',
    freeTierLimit: 'Unlimited (with free account)',
    freeTierRateLimit: '25 requests/min',
    requiresApiKey: true,
    apiKeyUrl: 'https://www.openfigi.com/user/login',
    upgradeUrl: 'https://www.openfigi.com/',
    upgradeText: 'Free forever — Bloomberg-sponsored',
    corsEnabled: true,
    docsUrl: 'https://www.openfigi.com/api',
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
