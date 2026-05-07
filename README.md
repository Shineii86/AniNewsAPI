
> [!NOTE]
> The old deployment URL `https://aninewsapi.vercel.app/` is no longer accessible. Use the current URL: **https://aninews.vercel.app/**

<div align="center">

# 📰 AniNewsAPI

**Real-time Anime News Aggregation API**

![Vercel](https://img.shields.io/badge/Deployed%20On-Vercel-black?logo=vercel&style=flat-square)
![Version](https://img.shields.io/badge/Version-3.0.0-89b4fa?style=flat-square&labelColor=1e1e2e)
![Node](https://img.shields.io/badge/Node.js-≥18-339933?logo=node.js&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Sources](https://img.shields.io/badge/Sources-7-f5c2e7?style=flat-square&labelColor=1e1e2e)
![Status](https://img.shields.io/badge/API-Stable-a6e3a1?style=flat-square&labelColor=1e1e2e)

[![API Status](https://img.shields.io/website?down_color=f38ba8&down_message=offline&label=API&style=for-the-badge&up_color=a6e3a1&up_message=online&url=https%3A%2F%2Faninews.vercel.app)](https://aninews.vercel.app)
![Last Commit](https://img.shields.io/github/last-commit/Shineii86/AniNewsAPI?style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Shineii86/AniNewsAPI?style=for-the-badge)
[![Stars](https://img.shields.io/github/stars/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/stargazers)
[![Forks](https://img.shields.io/github/forks/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/fork)

> A serverless API aggregating anime news from **7 sources** in real-time — with smart caching, keyword search, RSS feeds, and full-article extraction.

<br>

[🚀 Quick Start](#-quick-start) · [📡 API Docs](#-api-endpoints) · [🗞️ Sources](#️-news-sources) · [🏗️ Architecture](#️-architecture) · [🤝 Contributing](#-contributing)

</div>

---

## 📊 At a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    AniNewsAPI v3.0.0                     │
├──────────────┬──────────────┬───────────────────────────┤
│  7 Sources   │  8 Endpoints │  ~200ms cached response   │
│  60+ Articles│  RSS 2.0     │  10-min auto-refresh      │
│  Search      │  Pagination  │  Cross-source dedup       │
└──────────────┴──────────────┴───────────────────────────┘
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### ⚡ Core
- **Real-time scraping** from 7 anime news sources
- **Smart caching** with 10-minute TTL + disk backup
- **Concurrent fetching** — all sources hit simultaneously
- **Retry logic** — 3 attempts per source with exponential backoff
- **Graceful degradation** — if a source fails, others continue

</td>
<td width="50%">

### 🔍 Data
- **Keyword search** with relevance scoring (`/api/search`)
- **RSS 2.0 feed** for readers & integrations (`/api/rss`)
- **Full article extraction** by slug (`/api/news/:slug`)
- **Tag filtering** with article counts (`/api/news/tags`)
- **Pagination** via `offset` + `limit` parameters

</td>
</tr>
<tr>
<td width="50%">

### 🛡️ Reliability
- **RSS fallback** when web scraping is blocked
- **Google News proxy** for Cloudflare-protected sources
- **Cross-source deduplication** by normalized title
- **Timeout protection** — 15s per source, never hangs
- **CORS enabled** — works from any frontend

</td>
<td width="50%">

### 🚀 Deployment
- **Zero-config** Vercel deployment
- **Serverless functions** — scales automatically
- **Express mode** — run standalone with `npm start`
- **Environment variables** for TTL customization
- **~50KB** total codebase, no heavy dependencies

</td>
</tr>
</table>

---

## 🗞️ News Sources

| Source | Key | Method | Articles |
|--------|-----|--------|----------|
| [**Anime News Network**](https://www.animenewsnetwork.com/) | `ann` | Google News RSS | ~15 |
| [**Anime Corner**](https://animecorner.me/) | `animecorner` | Direct Scraping | ~12 |
| [**MyAnimeList**](https://myanimelist.net/) | `myanimelist` | Direct Scraping | ~15 |
| [**Otaku USA Magazine**](https://otakuusamagazine.com/) | `otakuusa` | Google News RSS | ~12 |
| [**Crunchyroll**](https://www.crunchyroll.com/news) | `crunchyroll` | Google News RSS | ~15 |
| [**Anime Herald**](https://www.animeherald.com/) | `animeherald` | RSS Feed | ~10 |
| [**Comic Book**](https://comicbook.com/anime/) | `comicbook` | Direct Scraping | ~10 |

> **Total: 60+ unique articles** after cross-source deduplication

---

## 🏗️ Architecture

```
                    ┌──────────────────┐
                    │   Client Request  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Vercel Edge /   │
                    │   Express Server  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌───▼────────┐
     │  /api/news │  │ /api/search │  │  /api/rss  │
     │  /api/tags │  │  /api/slug  │  │ /api/stats │
     └────────┬───┘  └──────┬──────┘  └───┬────────┘
              │             │              │
              └─────────────┼──────────────┘
                            │
                   ┌────────▼─────────┐
                   │   Cache Layer    │
                   │  (node-cache)    │
                   │  TTL: 10 min     │
                   └────────┬─────────┘
                            │ (on miss)
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────▼───┐ ┌──────▼──────┐ ┌───▼────────┐
     │    ANN     │ │ Crunchyroll │ │    MAL     │  ... (7 total)
     │ Google News│ │ Google News │ │   Direct   │
     └────────────┘ └─────────────┘ └────────────┘
```

**Data Flow:** Request → Cache Check → Fetch Sources → Deduplicate → Enrich → Cache → Respond

---

## 📡 API Endpoints

### `GET /api/news`

Latest anime news from all or specific sources.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | `1-100` | `20` | Max articles |
| `offset` | `≥0` | `0` | Pagination offset |
| `sort` | `latest\|oldest` | `latest` | Sort order |
| `source` | `string` | `all` | Filter by source key |
| `refresh` | `boolean` | `false` | Bypass cache |

```bash
curl "https://aninews.vercel.app/api/news?limit=10"
curl "https://aninews.vercel.app/api/news?source=crunchyroll&limit=10&offset=10"
```

<details>
<summary>📄 Example Response</summary>

```json
{
  "success": true,
  "data": [{ "title": "Demon Slayer Season 4 Announced", "slug": "ann-demon-slayer-season-4-announced", "source": "Anime News Network", "excerpt": "...", "date": "2026-05-07T10:30:00.000Z", "image": "...", "link": "...", "tags": ["news", "anime"] }],
  "meta": { "total": 62, "returned": 10, "offset": 0, "limit": 10, "hasMore": true, "source": "all", "sort": "latest", "responseTime": "234ms" }
}
```
</details>

---

### `GET /api/search`

Full-text search with relevance scoring. Title matches rank higher than excerpt matches.

| Param | Required | Description |
|-------|----------|-------------|
| `q` | ✅ | Search query (min 2 chars) |
| `source` | ❌ | Filter by source |
| `limit` | ❌ | Max results |
| `offset` | ❌ | Pagination |

```bash
curl "https://aninews.vercel.app/api/search?q=demon+slayer"
curl "https://aninews.vercel.app/api/search?q=manga&source=ann&limit=5"
```

---

### `GET /api/news/tags`

List available tags with counts, or filter articles by tag.

```bash
curl "https://aninews.vercel.app/api/news/tags"
curl "https://aninews.vercel.app/api/news/tags?tag=official"
```

---

### `GET /api/news/:slug`

Full article content extraction.

```bash
curl "https://aninews.vercel.app/api/news/ann-demon-slayer-season-4-announced"
```

---

### `GET /api/rss`

Standard RSS 2.0 XML feed. Works with any feed reader.

| Param | Default | Description |
|-------|---------|-------------|
| `source` | `all` | Filter by source |
| `limit` | `20` | Max items |

```bash
curl "https://aninews.vercel.app/api/rss"
curl "https://aninews.vercel.app/api/rss?source=crunchyroll&limit=10"
```

---

### `GET /api/health` · `GET /api/stats` · `POST /api/cache/clear`

Health check, cache statistics, and manual cache flush.

---

## 🚀 Quick Start

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shineii86/AniNewsAPI)

### Local Development

```bash
git clone https://github.com/Shineii86/AniNewsAPI.git
cd AniNewsAPI && npm install && npm run dev
# → http://localhost:3000
```

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_TTL` | `600` | Cache duration in seconds |
| `PORT` | `3000` | Server port (Express mode) |

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Cached response | ~200ms |
| Fresh fetch (all 7) | ~3-6s |
| Cache TTL | 10 minutes |
| Retry attempts | 3 per source |
| Timeout per source | 15 seconds |
| Total articles (avg) | 60+ after dedup |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js ≥ 18 |
| **HTTP** | Express 5 / Vercel Functions |
| **Scraping** | Cheerio + Axios |
| **RSS** | rss-parser |
| **Caching** | node-cache + filesystem |

---

## 📁 Project Structure

```
AniNewsAPI/
├── api/                    # Vercel serverless functions
│   ├── cache/clear.js      # Cache management
│   ├── health.js           # Health check
│   ├── news.js             # Main news endpoint
│   ├── news/{slug}.js      # Article by slug
│   ├── news/tags.js        # Tag filtering
│   ├── rss.js              # RSS feed
│   ├── search.js           # Keyword search
│   └── stats.js            # Cache statistics
├── utils/                  # Core logic
│   ├── cacheHandler.js     # Memory + disk cache
│   ├── constants.js        # Shared config
│   ├── contentParser.js    # Article extraction
│   ├── dateParser.js       # Multi-format date parsing
│   ├── fetch*.js           # Source scrapers (7 files)
│   └── generateSlug.js     # URL-safe slug generator
├── public/index.html       # Landing page
├── server.js               # Express server entry
├── vercel.json             # Vercel routing config
└── CHANGELOG.md
```

---

## 🤝 Contributing

### Add a New Source

1. Create `utils/fetchNewSource.js` — export async function returning `[{ title, slug, source, excerpt, date, image, link, tags }]`
2. Register in `api/news.js` → `SOURCES` object
3. Test with `npm test`, submit a PR

---

## 📄 License

[MIT](LICENSE) © [Shinei Nouzen](https://github.com/Shineii86)

---

## 🙏 Acknowledgments

| Source | About |
|--------|-------|
| [Anime News Network](https://www.animenewsnetwork.com/) | Industry-leading anime journalism |
| [Anime Corner](https://animecorner.me/) | Community-driven anime news & polls |
| [MyAnimeList](https://myanimelist.net/) | The largest anime/manga database |
| [Otaku USA Magazine](https://otakuusamagazine.com/) | English-language anime culture magazine |
| [Crunchyroll](https://www.crunchyroll.com/news) | Official streaming platform news |
| [Anime Herald](https://www.animeherald.com/) | Anime news, reviews & editorials |
| [Comic Book](https://comicbook.com/anime/) | Anime & manga coverage at ComicBook |

---

<div align="center">

**Built with ❤️ for the anime community**

[![Telegram](https://img.shields.io/badge/-Telegram-2CA5E0?style=flat&logo=Telegram&logoColor=white)](https://telegram.me/Shineii86)
[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Shineii86)
[![Instagram](https://img.shields.io/badge/-Instagram-C13584?style=flat&logo=Instagram&logoColor=white)](https://instagram.com/ikx7.a)
[![Gmail](https://img.shields.io/badge/-Gmail-D14836?style=flat&logo=Gmail&logoColor=white)](mailto:ikx7a@hotmail.com)

⭐ [Star this repo](https://github.com/Shineii86/AniNewsAPI) · 🐛 [Report a bug](https://github.com/Shineii86/AniNewsAPI/issues) · 💡 [Request a feature](https://github.com/Shineii86/AniNewsAPI/issues)

</div>
