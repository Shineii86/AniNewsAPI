# 📰 Anime News API

![Vercel](https://img.shields.io/badge/Deployed%20On-Vercel-black?logo=vercel)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![Scraping](https://img.shields.io/badge/Scraper-Cheerio-yellow?logo=javascript)
![Status](https://img.shields.io/badge/API-Stable-green)
![License](https://img.shields.io/badge/License-MIT-blue)

![Last Commit](https://img.shields.io/github/last-commit/Shineii86/AniNewsAPI?style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Shineii86/AniNewsAPI?style=for-the-badge) [![GitHub Stars](https://img.shields.io/github/stars/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/stargazers) [![GitHub Forks](https://img.shields.io/github/forks/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/fork)
[![API Status](https://img.shields.io/website?down_color=lightgrey&down_message=offline&label=API%20Status&style=for-the-badge&up_color=green&up_message=online&url=https%3A%2F%2Faninews.vercel.app)](https://aninews.vercel.app)

> 🛰️ A powerful, real-time anime news API that aggregates fresh articles from 7+ reliable sources with intelligent caching and advanced date parsing.

---

## ✨ What's New in v2.0.0

- 🆕 **2 New Sources**: Added Anime Herald and Comic Book
- 🔧 **Fixed Date Parsing**: Properly handles all date formats including relative times ("2 hours ago")
- 🚀 **Better Performance**: Improved concurrent fetching with retry logic
- 📡 **RSS Fallback**: All sources now have RSS fallback when web scraping fails
- 🏥 **Health Check**: New `/api/health` endpoint for monitoring
- 📊 **Statistics**: New `/api/stats` endpoint for cache metrics
- 🔄 **Force Refresh**: New `refresh=true` parameter to bypass cache

---

## 📦 Features

- ⚡ **Real-time Scraping** from 7+ sources
- 🔁 **Smart Caching** with auto-refresh (10 minutes)
- 🏷️ **Tag Filtering** across all sources
- 📄 **Full Article Content** by slug
- 📡 **RSS Fallback** for reliability
- 🚀 **Concurrent Fetching** with retry logic
- 📅 **Advanced Date Parsing** (handles "X hours ago", "Yesterday", etc.)
- 🏥 **Health Monitoring** endpoint
- 📊 **Cache Statistics** endpoint

---

## 🗞️ News Sources (7 Total)

| Source | Description | Type | Status |
|--------|-------------|------|--------|
| **Anime News Network** | Industry-leading anime news | Official | ✅ Active |
| **Anime Corner** | Community-driven anime news | Community | ✅ Active |
| **MyAnimeList** | Popular anime database news | Official | ✅ Active |
| **Otaku USA Magazine** | Anime culture magazine | Community | ✅ Active |
| **Crunchyroll** | Official streaming news | Official | ✅ Active |
| **Anime Herald** | Anime news and reviews | Community | 🆕 New |
| **Comic Book** | Anime and manga coverage | Community | 🆕 New |

---

## 📡 API Endpoints

### `GET /api/news` 

Returns the latest anime news articles from all sources.

#### Query Parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | Number | `20` | Max articles (1-100) |
| `sort` | String | `latest` | `latest` or `oldest` |
| `source` | String | `all` | Filter by source (see below) |
| `refresh` | Boolean | `false` | Force cache refresh |

#### Available Sources:
- `all` - All sources (default)
- `ann` - Anime News Network
- `animecorner` - Anime Corner
- `myanimelist` - MyAnimeList
- `otakuusa` - Otaku USA Magazine
- `crunchyroll` - Crunchyroll
- `animeherald` - Anime Herald
- `comicbook` - Comic Book

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "title": "New Anime Series Announced for 2026",
      "slug": "ann-new-anime-series-announced-for-2026",
      "source": "Anime News Network",
      "excerpt": "A new anime series has been announced...",
      "date": "2026-04-13T10:30:00.000Z",
      "image": "https://example.com/image.jpg",
      "link": "https://www.animenewsnetwork.com/news/...",
      "tags": ["news", "anime", "2026"]
    }
  ],
  "meta": {
    "total": 20,
    "source": "all",
    "sort": "latest",
    "limit": 20,
    "responseTime": "245ms",
    "timestamp": "2026-04-13T10:30:00.000Z",
    "availableSources": ["all", "ann", "animecorner", "myanimelist", "otakuusa", "crunchyroll", "animeherald", "comicbook"]
  }
}
```

#### Example Requests:
```http
GET /api/news?limit=10&sort=latest
GET /api/news?source=ann&limit=5
GET /api/news?source=myanimelist&refresh=true
GET /api/news?limit=50&sort=oldest
```

---

### `GET /api/news/tags`

Filter articles by tags or get available tags.

#### Query Parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tag` | String | No | Tag to filter by |
| `source` | String | No | Source filter |

#### Examples:
```http
GET /api/news/tags                    # Get all available tags
GET /api/news/tags?tag=official       # Filter by 'official' tag
GET /api/news/tags?tag=news&source=ann # Filter by tag and source
```

---

### `GET /api/news/:slug`

Get full article content by slug.

#### Example:
```http
GET /api/news/ann-new-anime-series-announced-for-2026
```

---

### `GET /api/health`

Health check and system status.

#### Example Response:
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2026-04-13T10:30:00.000Z",
  "cache": {
    "hits": 150,
    "misses": 25,
    "keys": ["news_all", "news_ann"],
    "ttl": 600
  },
  "version": "2.0.0"
}
```

---

### `GET /api/stats`

Cache statistics and performance metrics.

---

## 🚀 Quick Start

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shineii86/AniNewsAPI)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Shineii86/AniNewsAPI.git
cd AniNewsAPI

# Install dependencies
npm install

# Start development server
npm run dev

# API will be available at http://localhost:3000
```

---

## 🔧 Configuration

### Environment Variables

```env
# Optional: Set cache duration (in seconds)
CACHE_TTL=600

# Optional: Set Chrome executable path for Puppeteer
CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Caching Strategy

- **Memory Cache**: Fast in-memory storage (10 minutes TTL)
- **File Cache**: Persistent disk storage for backup
- **Auto-refresh**: Cache automatically refreshes on expiry
- **Force Refresh**: Use `?refresh=true` to bypass cache

---

## 📊 Performance

- **Response Time**: ~200-500ms (cached)
- **Concurrent Sources**: 7 sources fetched simultaneously
- **Cache Duration**: 10 minutes
- **Retry Logic**: 3 attempts per source with exponential backoff
- **Timeout**: 15 seconds per source

---

## 🛠️ Technical Details

### Architecture
- **Runtime**: Node.js (Vercel Functions / Express)
- **Scraping**: Cheerio + Axios + RSS Parser
- **Caching**: Node-cache + File system
- **Deployment**: Vercel Serverless / Express Server

### Error Handling
- Graceful fallback when sources fail
- RSS fallback for all sources
- Detailed error logging
- Structured error responses
- Timeout protection (15s per source)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding New Sources

To add a new anime news source:

1. Create a new scraper in `utils/fetchNewSource.js`
2. Follow the existing pattern for data structure
3. Add the source to `api/news.js` SOURCES object
4. Update the README documentation
5. Test thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Anime News Network](https://www.animenewsnetwork.com/)
- [Anime Corner](https://animecorner.me/)
- [MyAnimeList](https://myanimelist.net/)
- [Otaku USA Magazine](https://otakuusamagazine.com/)
- [Crunchyroll](https://www.crunchyroll.com/)
- [Anime Herald](https://www.animeherald.com/)
- [Comic Book](https://comicbook.com/anime/)

---

## 🔗 Links

- **API Base URL**: `https://aninews.vercel.app`
- **Documentation**: [GitHub Repository](https://github.com/Shineii86/AniNewsAPI)
- **Issues**: [GitHub Issues](https://github.com/Shineii86/AniNewsAPI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shineii86/AniNewsAPI/discussions)

---

## 💕 Loved My Work?

🚨 [Follow me on GitHub](https://github.com/Shineii86)

⭐ [Give a star to this project](https://github.com/Shineii86/AniNewsAPI)

<div align="center">

<a href="https://github.com/Shineii86/AlisaReactionBot">
<img src="https://github.com/Shineii86/AniPay/blob/main/Source/Banner6.png" alt="Banner">
</a>
  
  *For inquiries or collaborations*
     
[![Telegram Badge](https://img.shields.io/badge/-Telegram-2CA5E0?style=flat&logo=Telegram&logoColor=white)](https://telegram.me/Shineii86 "Contact on Telegram")
[![Instagram Badge](https://img.shields.io/badge/-Instagram-C13584?style=flat&logo=Instagram&logoColor=white)](https://instagram.com/ikx7.a "Follow on Instagram")
[![Pinterest Badge](https://img.shields.io/badge/-Pinterest-E60023?style=flat&logo=Pinterest&logoColor=white)](https://pinterest.com/ikx7a "Follow on Pinterest")
[![Gmail Badge](https://img.shields.io/badge/-Gmail-D14836?style=flat&logo=Gmail&logoColor=white)](mailto:ikx7a@hotmail.com "Send an Email")

  <sup><b>Copyright © 2026 <a href="https://telegram.me/Shineii86">Shinei Nouzen</a> All Rights Reserved</b></sup>

![Last Commit](https://img.shields.io/github/last-commit/Shineii86/AniNewsAPI?style=for-the-badge)

<sub>Made With ❤️ For The Anime Community</sub>

</div> 
