const cacheHandler = require('../utils/cacheHandler');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');
const fetchMyAnimeList = require('../utils/fetchMyAnimeList');
const fetchOtakuNews = require('../utils/fetchOtakuNews');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchAnimeHerald = require('../utils/fetchAnimeHerald');
const fetchComicBook = require('../utils/fetchComicBook');
const { CORS_HEADERS, MAX_LIMIT, DEFAULT_LIMIT, DEFAULT_SORT } = require('../utils/constants');

const SOURCES = {
  all: { name: 'All Sources', fetch: null },
  ann: { name: 'Anime News Network', fetch: fetchANN },
  animecorner: { name: 'Anime Corner', fetch: fetchAnimeCorner },
  myanimelist: { name: 'MyAnimeList', fetch: fetchMyAnimeList },
  otakuusa: { name: 'Otaku USA Magazine', fetch: fetchOtakuNews },
  crunchyroll: { name: 'Crunchyroll', fetch: fetchCrunchyroll },
  animeherald: { name: 'Anime Herald', fetch: fetchAnimeHerald },
  comicbook: { name: 'Comic Book', fetch: fetchComicBook }
};
const SOURCE_KEYS = Object.keys(SOURCES);

function deduplicateArticles(articles) {
  const seen = new Map();
  const unique = [];
  for (const article of articles) {
    const key = article.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) { seen.set(key, true); unique.push(article); }
  }
  return unique;
}

module.exports = async (req, res) => {
  const startTime = Date.now();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const sort = req.query.sort === 'oldest' ? 'oldest' : DEFAULT_SORT;
    const source = req.query.source?.toLowerCase() || 'all';
    const forceRefresh = req.query.refresh === 'true';

    if (!SOURCE_KEYS.includes(source)) {
      return res.status(400).json({ success: false, error: 'Invalid source parameter', message: `Available sources: ${SOURCE_KEYS.join(', ')}`, timestamp: new Date().toISOString() });
    }

    const cacheKey = `news_${source}`;
    if (!forceRefresh) {
      const cached = cacheHandler.get(cacheKey);
      if (cached && cached.length > 0) return sendResponse(res, cached, source, sort, limit, offset, startTime);
    } else {
      cacheHandler.del(cacheKey);
    }

    const allNews = await fetchFromSources(source);
    if (allNews.length === 0) {
      return res.status(503).json({ success: false, error: 'No news available', message: 'All sources are currently unavailable.', timestamp: new Date().toISOString() });
    }
    cacheHandler.set(cacheKey, allNews, 600);
    sendResponse(res, allNews, source, sort, limit, offset, startTime);
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message, timestamp: new Date().toISOString() });
  }
};

async function fetchFromSources(source) {
  const sourcePromises = [], sourceNames = [];
  if (source === 'all') {
    Object.entries(SOURCES).forEach(([key, config]) => {
      if (key !== 'all' && config.fetch) {
        sourcePromises.push(config.fetch().catch(() => []));
        sourceNames.push(key);
      }
    });
  } else if (SOURCES[source]?.fetch) {
    sourcePromises.push(SOURCES[source].fetch().catch(() => []));
    sourceNames.push(source);
  }

  const results = await Promise.allSettled(sourcePromises);
  let allNews = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`[Source] ${sourceNames[i]}: ${result.value?.length || 0} articles`);
      allNews = allNews.concat(result.value || []);
    }
  });

  const before = allNews.length;
  allNews = deduplicateArticles(allNews);
  if (before !== allNews.length) console.log(`[API] Deduplicated: ${before} → ${allNews.length}`);

  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  allNews = allNews.map(article => ({
    ...article,
    tags: [...new Set([...(article.tags || []), article.source.toLowerCase().replace(/\s+/g, '-')])],
    excerpt: article.excerpt || `${article.title.slice(0, 120)}...`,
    image: article.image || '',
    date: article.date || new Date().toISOString()
  }));
  return allNews;
}

function sendResponse(res, news, source, sort, limit, offset, startTime) {
  let filtered = [...news];
  if (sort === 'oldest') filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  else filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.length;
  filtered = filtered.slice(offset, offset + limit);
  const responseTime = Date.now() - startTime;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-Response-Time', `${responseTime}ms`);
  res.json({
    success: true, data: filtered,
    meta: { total, returned: filtered.length, offset, limit, hasMore: offset + limit < total, source, sort, responseTime: `${responseTime}ms`, timestamp: new Date().toISOString(), availableSources: SOURCE_KEYS }
  });
}
