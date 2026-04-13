const cacheHandler = require('../utils/cacheHandler');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');
const fetchMyAnimeList = require('../utils/fetchMyAnimeList');
const fetchOtakuNews = require('../utils/fetchOtakuNews');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchAnimeHerald = require('../utils/fetchAnimeHerald');
const fetchComicBook = require('../utils/fetchComicBook');

// Available sources configuration
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

/**
 * Main API handler
 */
module.exports = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Parse query parameters
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const sort = req.query.sort === 'oldest' ? 'oldest' : 'latest';
    const source = req.query.source?.toLowerCase() || 'all';
    const forceRefresh = req.query.refresh === 'true';
    
    // Validate source
    if (!SOURCE_KEYS.includes(source)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid source parameter',
        message: `Available sources: ${SOURCE_KEYS.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get cached news with source-specific key
    const cacheKey = `news_${source}`;
    
    if (!forceRefresh) {
      const cachedNews = cacheHandler.get(cacheKey);
      if (cachedNews && cachedNews.length > 0) {
        console.log(`[API] Cache hit for ${source}`);
        return sendFilteredResponse(res, cachedNews, source, sort, limit, startTime);
      }
    } else {
      console.log(`[API] Force refresh requested for ${source}`);
      cacheHandler.del(cacheKey);
    }
    
    // Fetch from sources concurrently
    console.log(`[API] Fetching fresh data for source: ${source}`);
    const allNews = await fetchFromSources(source);
    
    if (allNews.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'No news available',
        message: 'All news sources are currently unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update cache (10 minutes TTL)
    cacheHandler.set(cacheKey, allNews, 600);
    
    sendFilteredResponse(res, allNews, source, sort, limit, startTime);
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Fetch news from specified sources
 */
async function fetchFromSources(source) {
  const sourcePromises = [];
  const sourceNames = [];
  
  if (source === 'all') {
    // Fetch from all sources except 'all'
    Object.entries(SOURCES).forEach(([key, config]) => {
      if (key !== 'all' && config.fetch) {
        sourcePromises.push(
          config.fetch().catch(err => {
            console.error(`[Source] ${key} failed:`, err.message);
            return [];
          })
        );
        sourceNames.push(key);
      }
    });
  } else if (SOURCES[source]?.fetch) {
    sourcePromises.push(
      SOURCES[source].fetch().catch(err => {
        console.error(`[Source] ${source} failed:`, err.message);
        return [];
      })
    );
    sourceNames.push(source);
  }
  
  console.log(`[API] Fetching from sources: ${sourceNames.join(', ')}`);
  
  const results = await Promise.allSettled(sourcePromises);
  
  let allNews = [];
  results.forEach((result, index) => {
    const sourceName = sourceNames[index];
    if (result.status === 'fulfilled') {
      const articles = result.value || [];
      console.log(`[Source] ${sourceName}: ${articles.length} articles`);
      allNews = allNews.concat(articles);
    } else {
      console.error(`[Source] ${sourceName} rejected:`, result.reason?.message);
    }
  });
  
  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Add source-based tags and clean up data
  allNews = allNews.map(article => ({
    ...article,
    tags: [...new Set([...(article.tags || []), article.source.toLowerCase().replace(/\s+/g, '-')])],
    excerpt: article.excerpt || `${article.title.slice(0, 120)}...`,
    image: article.image || '',
    date: article.date || new Date().toISOString()
  }));
  
  return allNews;
}

/**
 * Send filtered response
 */
function sendFilteredResponse(res, news, source, sort, limit, startTime) {
  try {
    let filteredNews = [...news];
    
    // Sort results
    if (sort === 'oldest') {
      filteredNews.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Apply limit
    filteredNews = filteredNews.slice(0, limit);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Total-Sources', '7');
    res.setHeader('X-Available-Sources', SOURCE_KEYS.join(','));
    
    res.json({
      success: true,
      data: filteredNews,
      meta: {
        total: filteredNews.length,
        source: source,
        sort: sort,
        limit: limit,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        availableSources: SOURCE_KEYS
      }
    });
  } catch (error) {
    console.error('[API] Response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process response',
      message: error.message
    });
  }
}
