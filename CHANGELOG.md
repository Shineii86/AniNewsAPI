# 📋 Changelog

All notable changes to **AniNewsAPI** will be documented in this file.

---

## [3.0.0] - 2026-05-08

### Added
- **Keyword Search** (`/api/search`): Full-text search across all articles with relevance scoring and pagination
- **RSS Feed** (`/api/rss`): Standard RSS 2.0 XML output for feed readers and automated integrations
- **Pagination**: Added `offset` query parameter to `/api/news` for cursor-based pagination
- **Cross-Source Deduplication**: Duplicate articles across sources are automatically removed by normalized title matching
- **`.gitignore`**: Added to exclude cache files, data, node_modules, and environment files from version control
- **Constants Module** (`utils/constants.js`): Centralized configuration for version, limits, timeouts, user agent, and CORS headers
- **Tag Counts**: `/api/news/tags` now returns article count per tag, sorted by popularity
- **CORS Preflight**: All API endpoints now handle OPTIONS preflight requests in code
- **Favicon**: SVG emoji favicon (📰) with Apple Touch Icon support
- **Open Graph Meta**: Full OG tags for Facebook/social media link previews
- **Twitter Cards**: Large image card with title, description, and preview
- **SEO Metadata**: Canonical URL, keywords, robots, theme-color, apple-mobile-web-app tags
- **README Overhaul**: Complete rewrite with architecture diagram, feature matrix, structured endpoint docs, and project structure

### Changed
- **Crunchyroll Source**: Switched from blocked RSS/web scraping to Google News RSS proxy (`site:crunchyroll.com/news`) — now returns 15 articles reliably
- **ANN Source**: Added Google News RSS fallback — now returns 15 articles when direct access is blocked by Cloudflare
- **OtakuUSA Source**: Added Google News RSS fallback — now returns 12 articles when direct access returns 520 errors
- **Version Bump**: 2.0.0 → 3.0.0 across package.json, constants, health endpoint, README, and landing page
- **Landing Page**: Updated hero text to list all 7 sources instead of just "Crunchyroll & ANN"
- **Landing Page**: Fixed stats section showing "5 sources" → "7 sources"
- **Landing Page**: Added Search and RSS feature cards and endpoint docs
- **Health Endpoint**: Now reports `name` and `version` from centralized constants
- **CORS Headers**: Now set in API code via constants module (in addition to vercel.json)

### Removed
- **`utils/cacheNews.js`**: Deleted unused legacy ESM module that was never imported by any API endpoint
- **Unused dependencies**: Removed `puppeteer-core`, `xml2js`, and `@vercel/node` from package.json (never imported)

### Fixed
- **server.js**: Updated to use centralized constants, mount all new endpoints (/api/search, /api/rss), and add CORS middleware
- **test.js**: Rewritten to test all 14 endpoints including search, RSS, pagination, and per-source filtering
- **Response Metadata**: `/api/news` now returns `returned` count and `hasMore` boolean for pagination clarity
- **Tag Sorting**: Tags are now sorted by article count (most popular first) instead of alphabetical

---

## [2.0.0] - 2025-04-13

### Added
- **2 New Sources**: Anime Herald and Comic Book (7 total sources)
- **Date Parser**: Advanced date parsing for relative times ("2 hours ago", "Yesterday", etc.)
- **RSS Fallback**: All sources now have RSS feed fallback when web scraping fails
- **Health Check**: `/api/health` endpoint for system monitoring
- **Statistics**: `/api/stats` endpoint for cache hit/miss metrics
- **Cache Clear**: `POST /api/cache/clear` endpoint to manually flush cache
- **Force Refresh**: `?refresh=true` query parameter to bypass cache
- **Retry Logic**: Concurrent fetching with exponential backoff (3 attempts per source)
- **Disk Cache**: File-system backup cache when memory cache expires
- **Landing Page**: Full documentation page with feature cards and endpoint reference

---

## [1.0.0] - 2025-01-01

### Added
- Initial release with 5 sources: ANN, Anime Corner, MyAnimeList, Otaku USA, Crunchyroll
- News endpoint, tag filtering, article content by slug
- Smart caching with 15-minute TTL
- Cheerio web scraping with Vercel deployment
