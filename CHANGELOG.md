# 📋 Changelog

All notable changes to **AniNewsAPI** will be documented in this file.

---

## [4.0.2] - 2026-05-08

### Fixed
- **CRITICAL: Vercel FUNCTION_INVOCATION_FAILED crash**: `cacheHandler.js` used `fs.mkdirSync` on a read-only filesystem at module load time. On Vercel serverless, only `/tmp` is writable. Now detects serverless environment and uses `/tmp/aninews-cache` instead. Wrapped directory creation in try-catch.
- **Removed legacy `builds` from `vercel.json`**: Modern Vercel auto-detects `api/` routes. The `builds` config was conflicting with zero-config mode.

---

## [4.0.1] - 2026-05-08

### Changed
- **README At a Glance**: Replaced ASCII art with markdown table grid showing key metrics
- **README Architecture**: Replaced ASCII flowchart with three markdown tables — request flow, endpoints, and sources

---

## [4.0.0] - 2026-05-08

### Added
- **Try It Live Playground** (`#tryit`): Interactive panel on landing page to test any API endpoint directly from the browser with syntax-highlighted JSON responses
- **Live Article Preview**: Landing page now fetches and displays 6 real articles from `/api/news` on page load — actual data, not mockups
- **Server-Sent Events** (`/api/stream`): SSE endpoint for real-time article push notifications with 30s heartbeat keep-alive
- **OpenAPI 3.0 Specification** (`/api/openapi`): Machine-readable API spec for Swagger UI, Postman, and auto-generated clients
- **Rate Limit Headers**: All API responses now include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers
- **404 HTML Page**: Browser requests to unknown routes get a styled dark 404 page; API clients still get JSON
- **JSON-LD Structured Data**: Added `SoftwareApplication` schema markup for Google rich results
- **`<noscript>` Fallback**: Graceful degradation banner when JavaScript is disabled
- **GitHub API Preconnect**: `<link rel="preconnect" href="https://api.github.com">` for faster stats loading
- **`color-scheme: dark` Meta**: Prevents white flash on page load in dark mode browsers

### Changed
- **Version Bump**: 3.1.3 → 4.0.0 across package.json, constants, test, README, and landing page
- **GitHub Stats Error Handling**: Live stats now show fallback values (300+, 45+) instead of "—" when GitHub API is unreachable
- **README Architecture Diagram**: Updated to include `/api/stream` (SSE) and `/api/openapi` (JSON spec) endpoints
- **README At a Glance**: Endpoint count updated from 9 to 11
- **README Project Structure**: Added `stream.js` and `openapi.js` to file tree

---

## [3.1.4] - 2026-05-08

### Fixed
- **README "At a Glance"**: Updated version from 3.0.0 to 3.1.3, corrected endpoint count from 8 to 9
- **README Architecture diagram**: Added missing `/api/health` and `/api/cache/clear` endpoints to the data flow diagram
- **Version consistency**: Bumped version to 3.1.3 across `package.json`, `utils/constants.js`, and `test.js`

---

## [3.1.3] - 2026-05-08

### Fixed
- **Auto-updating copyright year**: Footer now dynamically sets year via `new Date().getFullYear()` instead of hardcoded "2025"

---

## [3.1.2] - 2026-05-08

### Changed
- **Replaced all emoji icons with proper SVG icons**: Logo marks (header, footer, favicon) now use inline SVG newspaper icon instead of 📰 emoji
- **Live GitHub Stats**: Stats ribbon now shows real-time stars, forks from GitHub API; hero badge shows live version from `package.json`
- **Live CTA Stats**: GitHub section now fetches and displays live stars, forks, and contributor count via GitHub API

---

## [3.1.1] - 2026-05-08

### Added
- **README Notice**: Added deprecation notice for old URL `https://aninewsapi.vercel.app/` — no longer accessible, directing users to current `https://aninews.vercel.app/`

---

## [3.1.0] - 2026-05-08

### Changed
- **Frontend Complete Redesign** (`public/index.html`): Rebuilt landing page from scratch with a modern, distinctive aesthetic
  - Switched from Inter/JetBrains Mono to **Space Grotesk / Space Mono** font pairing for sharper visual identity
  - Replaced Catppuccin color scheme with a **violet/pink/cyan accent palette** on a deep dark base (`#0a0a0f`)
  - Added **ambient floating orb background** with blur and infinite float animation for depth
  - Added **noise texture overlay** via inline SVG for subtle grain
  - Introduced **glassmorphism sticky header** with `backdrop-filter: blur(20px) saturate(1.5)`
  - Redesigned hero with **animated gradient shimmer** on headline, status badge with live pulse dot, and **interactive terminal preview** showing a live `curl` response with blinking cursor
  - Replaced stat cards with a **stats ribbon** using a 1px-gap grid layout and color-coded numbers
  - Replaced feature card grid with **borderless grid** using top-border reveal animation on hover
  - Replaced documentation endpoint blocks with **collapsible accordion cards** — click to expand/collapse details
  - Added **sources grid** with per-source cards showing scrape method badges (RSS / Scrape)
  - Redesigned CTA section with a **gradient-topped card** and metadata row (stars, contributors, license)
  - Replaced footer with a **compact single-row layout** with social icon buttons
  - Added **scroll-reveal animations** via IntersectionObserver for progressive content loading
  - Improved **mobile responsiveness** with hamburger toggle, stacked grids, and fluid typography via `clamp()`
  - Reduced external dependencies: removed Font Awesome heavy load, kept only icon subset needed

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
