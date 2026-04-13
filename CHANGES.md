# Anime News API v2.0 - Changes & Improvements

## 🐛 Issues Fixed

### 1. Date Parsing Issues (FIXED)
**Problem**: API was showing 2025 news in 2026 because:
- MyAnimeList used `new Date().toISOString()` for all articles
- No proper date extraction from relative time strings

**Solution**:
- Created `utils/dateParser.js` with advanced date parsing
- Handles formats: "2 hours ago", "Yesterday", "Jul 17, 12:34 AM"
- Supports ISO, relative, and natural language dates
- Each source now has proper date extraction

### 2. Only MyAnimeList Working (FIXED)
**Problem**: Other sources were failing silently due to:
- Outdated CSS selectors
- No fallback mechanism
- Poor error handling

**Solution**:
- Updated all selectors for each source
- Added RSS fallback for all sources
- Implemented retry logic (3 attempts with exponential backoff)
- Better error logging and graceful degradation

### 3. Performance Issues (FIXED)
**Problem**: Slow response times and cache issues

**Solution**:
- Reduced cache TTL from 15 to 10 minutes for fresher data
- Added concurrent fetching with Promise.allSettled
- Implemented smart cache with disk fallback
- Added cache statistics and monitoring

---

## ✨ New Features

### New Sources Added (7 Total)
1. **Anime News Network** (ann) - RSS + Web scraping
2. **Anime Corner** (animecorner) - RSS + Web scraping
3. **MyAnimeList** (myanimelist) - Web scraping with date parsing
4. **Otaku USA Magazine** (otakuusa) - RSS + Web scraping
5. **Crunchyroll** (crunchyroll) - RSS + Web scraping
6. **Anime Herald** (animeherald) - 🆕 NEW!
7. **Comic Book** (comicbook) - 🆕 NEW!

### New API Endpoints
- `GET /api/health` - Health check and system status
- `GET /api/stats` - Cache statistics and performance metrics
- `POST /api/cache/clear` - Clear cache (admin endpoint)

### New Query Parameters
- `refresh=true` - Force cache refresh
- Enhanced `source` parameter with 7 options
- `limit` now supports up to 100 articles

---

## 📁 File Structure

```
├── api/
│   ├── news.js                 # Main news endpoint
│   ├── health.js               # Health check endpoint
│   ├── stats.js                # Cache statistics endpoint
│   ├── cache/
│   │   └── clear.js            # Cache clear endpoint
│   └── news/
│       ├── tags.js             # Tag filtering endpoint
│       └── [slug].js           # Article by slug endpoint
├── utils/
│   ├── cacheHandler.js         # Enhanced caching system
│   ├── dateParser.js           # NEW: Advanced date parsing
│   ├── generateSlug.js         # Improved slug generation
│   ├── contentParser.js        # Full article extraction
│   ├── fetchANN.js             # ANN scraper with RSS fallback
│   ├── fetchAnimeCorner.js     # Anime Corner scraper
│   ├── fetchMyAnimeList.js     # MAL with proper dates
│   ├── fetchOtakuNews.js       # Otaku USA scraper
│   ├── fetchCrunchyroll.js     # Crunchyroll scraper
│   ├── fetchAnimeHerald.js     # NEW: Anime Herald scraper
│   └── fetchComicBook.js       # NEW: Comic Book scraper
├── public/
│   └── index.html              # Landing page
├── data/                       # Cache storage directory
├── server.js                   # Express server
├── index.js                    # Vercel handler
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies
├── test.js                     # Test suite
└── README.md                   # Documentation
```

---

## 🔧 Technical Improvements

### Date Parsing (`utils/dateParser.js`)
```javascript
// Handles all these formats:
- "2026-04-13T10:30:00.000Z" (ISO)
- "2 hours ago" (relative)
- "Yesterday" (relative)
- "Jul 17, 12:34 AM" (natural)
- "July 17, 2025" (natural)
- "17/07/2025" (European)
```

### Retry Logic
Each source has 3 retry attempts with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay

### RSS Fallback
All sources try web scraping first, then fall back to RSS if needed.

### Cache Strategy
- Memory cache (fast)
- Disk cache (persistent)
- Auto-expiry (10 minutes)
- Force refresh support

---

## 📊 Performance Metrics

| Metric | Before | After |
|--------|--------|-------|
| Sources | 5 | 7 |
| Cache TTL | 15 min | 10 min |
| Max Limit | 50 | 100 |
| Retry Logic | None | 3 attempts |
| RSS Fallback | None | All sources |
| Date Parsing | Basic | Advanced |

---

## 🚀 Deployment

### Vercel
```bash
# Install dependencies
npm install

# Deploy
vercel --prod
```

### Local
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test
```

---

## 📝 API Examples

### Get all news (default)
```
GET /api/news
```

### Get news from specific source
```
GET /api/news?source=ann&limit=10
GET /api/news?source=myanimelist&limit=5&sort=latest
```

### Force refresh cache
```
GET /api/news?refresh=true
```

### Filter by tags
```
GET /api/news/tags?tag=official
GET /api/news/tags?tag=news&source=ann
```

### Get full article
```
GET /api/news/ann-new-anime-series-announced
```

### Health check
```
GET /api/health
```

---

## 🔮 Future Enhancements

Potential improvements for v2.1:
- WebSocket support for real-time updates
- GraphQL endpoint
- Search functionality
- User favorites/bookmarks
- Push notifications
- More sources (Anime News+, Sankaku Complex, etc.)

---

**Version**: 2.0.0  
**Date**: April 13, 2026  
**Author**: Shinei Nouzen
