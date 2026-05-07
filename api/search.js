const cacheHandler = require('../utils/cacheHandler');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');
const fetchMyAnimeList = require('../utils/fetchMyAnimeList');
const fetchOtakuNews = require('../utils/fetchOtakuNews');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchAnimeHerald = require('../utils/fetchAnimeHerald');
const fetchComicBook = require('../utils/fetchComicBook');
const { CORS_HEADERS, MAX_LIMIT, DEFAULT_LIMIT } = require('../utils/constants');

const SOURCES = {
  ann: { name: 'Anime News Network', fetch: fetchANN },
  animecorner: { name: 'Anime Corner', fetch: fetchAnimeCorner },
  myanimelist: { name: 'MyAnimeList', fetch: fetchMyAnimeList },
  otakuusa: { name: 'Otaku USA Magazine', fetch: fetchOtakuNews },
  crunchyroll: { name: 'Crunchyroll', fetch: fetchCrunchyroll },
  animeherald: { name: 'Anime Herald', fetch: fetchAnimeHerald },
  comicbook: { name: 'Comic Book', fetch: fetchComicBook }
};

module.exports = async (req, res) => {
  const startTime = Date.now();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const query = req.query.q?.trim();
    const source = req.query.source?.toLowerCase() || 'all';
    const limit = Math.min(Math.max(parseInt(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid query parameter',
        message: 'Please provide a search query with at least 2 characters using ?q=your+query',
        timestamp: new Date().toISOString()
      });
    }

    const cacheKey = `news_${source}`;
    let articles = cacheHandler.get(cacheKey);

    if (!articles || articles.length === 0) {
      const fetchPromises = [];
      if (source === 'all') {
        Object.entries(SOURCES).forEach(([key, config]) => {
          fetchPromises.push(config.fetch().catch(() => []));
        });
      } else if (SOURCES[source]?.fetch) {
        fetchPromises.push(SOURCES[source].fetch().catch(() => []));
      }
      const results = await Promise.allSettled(fetchPromises);
      articles = [];
      results.forEach(r => { if (r.status === 'fulfilled') articles = articles.concat(r.value || []); });
      if (articles.length > 0) cacheHandler.set(cacheKey, articles, 600);
    }

    const lowerQuery = query.toLowerCase();
    const searchTerms = lowerQuery.split(/\s+/).filter(t => t.length > 1);

    let results = articles.filter(article => {
      const searchable = `${article.title || ''} ${article.excerpt || ''} ${article.source || ''} ${(article.tags || []).join(' ')}`.toLowerCase();
      return searchTerms.every(term => searchable.includes(term));
    });

    results = results.map(article => {
      let score = 0;
      const title = (article.title || '').toLowerCase();
      const excerpt = (article.excerpt || '').toLowerCase();
      searchTerms.forEach(term => { if (title.includes(term)) score += 10; if (excerpt.includes(term)) score += 3; });
      return { ...article, _score: score };
    });

    results.sort((a, b) => b._score !== a._score ? b._score - a._score : new Date(b.date) - new Date(a.date));

    const total = results.length;
    const paginated = results.slice(offset, offset + limit).map(({ _score, ...a }) => a);
    const responseTime = Date.now() - startTime;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.json({
      success: true, data: paginated,
      meta: { query, total, returned: paginated.length, offset, limit, hasMore: offset + limit < total, source, responseTime: `${responseTime}ms`, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    res.status(500).json({ success: false, error: 'Search failed', message: error.message, timestamp: new Date().toISOString() });
  }
};
