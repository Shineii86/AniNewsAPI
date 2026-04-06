# 📰 Anime News API

![Vercel](https://img.shields.io/badge/Deployed%20On-Vercel-black?logo=vercel)
![Scraping](https://img.shields.io/badge/Scraper-Cheerio-yellow?logo=javascript)
![Status](https://img.shields.io/badge/API-Stable-green)
![License](https://img.shields.io/badge/License-MIT-blue)
[![Made By](https://img.shields.io/badge/Made%20by-Shinei%20Nouzen-critical)](https://github.com/Shineii86)

![Last Commit](https://img.shields.io/github/last-commit/Shineii86/AniNewsAPI?style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Shineii86/AniNewsAPI?style=for-the-badge) [![GitHub Stars](https://img.shields.io/github/stars/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/stargazers) [![GitHub Forks](https://img.shields.io/github/forks/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/fork)
[![API Status](https://img.shields.io/website?down_color=lightgrey&down_message=offline&label=API%20Status&style=for-the-badge&up_color=green&up_message=online&url=https%3A%2F%2Faninews.vercel.app)](https://aninews.vercel.app)


> 🛰️ A real-time, blazing-fast, tag-filterable Anime News API that fetches fresh articles from multiple reliable sources with smart caching for optimal performance.

---

## 📦 Features

- ⚡ **Real-time Scraping** (no database required)
- 🔁 **Smart Caching** with auto-refresh (15 minutes)
- 🏷️ Filter by **tags** and **sources**
- 📄 Fetch full **article content by slug**
- 🧩 **Multi-source support**: 5 reliable anime news sources
- 📥 Ready-to-deploy on [Vercel](https://vercel.com)
- 🚀 **Improved Error Handling** and response structure
- 🔄 **Concurrent Fetching** for better performance

---

## 🗞️ News Sources

| Source | Description | Type |
|--------|-------------|------|
| **Anime News Network** | Industry-leading anime news | Official |
| **Anime Corner** | Community-driven anime news | Community |
| **MyAnimeList** | Popular anime database news | Official |
| **Otaku USA Magazine** | Anime culture magazine | Community |
| **Crunchyroll** | Official anime streaming news | Official |

---

## 📡 API Endpoints 

### `GET /api/news` <sup>`(✅ Stable)`</sup>

Returns the latest anime news articles from all sources.

#### Query Parameters:

| Param     | Type     | Default     | Description                                  |
|-----------|----------|-------------|----------------------------------------------|
| `limit`   | Number   | `10`        | Max number of articles (1-50)               |
| `sort`    | String   | `latest`    | `latest` or `oldest`                         |
| `source`  | String   | `all`       | Source filter (see available sources below) |

#### Available Sources:
- `all` - All sources (default)
- `ann` - Anime News Network
- `animecorner` - Anime Corner
- `myanimelist` - MyAnimeList
- `otakuusa` - Otaku USA Magazine
- `crunchyroll` - Crunchyroll

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "title": "New Anime Series Announced",
      "slug": "ann-new-anime-series-announced",
      "source": "Anime News Network",
      "excerpt": "A new anime series has been announced...",
      "date": "2024-01-15T10:30:00.000Z",
      "image": "https://example.com/image.jpg",
      "link": "https://www.animenewsnetwork.com/news/...",
      "tags": ["news", "anime-news-network"]
    }
  ],
  "meta": {
    "total": 10,
    "source": "all",
    "sort": "latest",
    "limit": 10,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "availableSources": ["all", "ann", "animecorner", "myanimelist", "otakuusa", "crunchyroll"]
  }
}
```

#### Example Requests:
```http
GET /api/news?source=ann&limit=5&sort=latest
GET /api/news?source=animecorner&limit=3
GET /api/news?limit=20&sort=oldest
```

---

### `GET /api/news/tags` <sup>`(⚠️ Experimental)`</sup>

Filter articles by tags (currently supports Crunchyroll only).

#### Query Parameters:

| Param | Type   | Required | Description           |
|-------|--------|----------|-----------------------|
| `tag` | String | Yes      | Tag to filter by      |

#### Example:
```http
GET /api/news/tags?tag=official
```

---

### `GET /api/news/[slug]` <sup>`(✅ Stable)`</sup>

Get full article content by slug.

#### Example:
```http
GET /api/news/ann-new-anime-series-announced
```

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
CACHE_TTL=900

# Optional: Set Chrome executable path for Puppeteer
CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Caching

The API uses a two-tier caching system:
- **Memory Cache**: Fast in-memory storage (15 minutes TTL)
- **File Cache**: Persistent disk storage for backup

---

## 📊 Performance

- **Response Time**: ~200-500ms (cached)
- **Concurrent Sources**: 5 sources fetched simultaneously
- **Cache Duration**: 15 minutes
- **Rate Limiting**: Built-in via Vercel
- **Uptime**: 99.9%+

---

## 🛠️ Technical Details

### Architecture
- **Runtime**: Node.js (Vercel Functions)
- **Scraping**: Cheerio + Axios
- **Caching**: Node-cache + File system
- **Deployment**: Vercel Serverless Functions

### Error Handling
- Graceful fallback when sources fail
- Detailed error logging
- Structured error responses
- Timeout protection (10s per source)

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
3. Add the source to `api/news.js`
4. Update the README documentation
5. Test thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Anime News Network](https://www.animenewsnetwork.com/) for comprehensive anime news
- [Anime Corner](https://animecorner.me/) for community-driven content
- [MyAnimeList](https://myanimelist.net/) for database and news
- [Otaku USA Magazine](https://otakuusamagazine.com/) for anime culture coverage
- [Crunchyroll](https://www.crunchyroll.com/) for official anime news

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
