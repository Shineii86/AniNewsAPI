const cacheHandler = require('../utils/cacheHandler');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');
const fetchMyAnimeList = require('../utils/fetchMyAnimeList');
const fetchOtakuNews = require('../utils/fetchOtakuNews');
const fetchCrunchyrollAPI = require('../utils/fetchCrunchyrollAPI');

module.exports = async (req, res) => {
  try {
    // Parse query parameters
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'latest';
    const source = req.query.source || 'all';
    
    // Get cached news with source-specific key
    const cacheKey = `news_${source}`;
    const cachedNews = cacheHandler.get(cacheKey);
    if (cachedNews) {
      return sendFilteredResponse(res, cachedNews, source, sort, limit);
    }
    
    // Fetch from sources concurrently
    const sourcePromises = [];
    
    if (source === 'all' || source === 'ann') {
      sourcePromises.push(fetchANN());
    }
    if (source === 'all' || source === 'animecorner') {
      sourcePromises.push(fetchAnimeCorner());
    }
    if (source === 'all' || source === 'myanimelist') {
      sourcePromises.push(fetchMyAnimeList());
    }
    if (source === 'all' || source === 'otakuusa') {
      sourcePromises.push(fetchOtakuNews());
    }
    if (source === 'all' || source === 'crunchyroll') {
      sourcePromises.push(fetchCrunchyrollAPI());
    }
    
    // If no valid source specified, default to all
    if (sourcePromises.length === 0) {
      sourcePromises.push(
        fetchANN(),
        fetchAnimeCorner(),
        fetchMyAnimeList(),
        fetchOtakuNews(),
        fetchCrunchyrollAPI()
      );
    }
    
    const results = await Promise.allSettled(sourcePromises);
    
    let allNews = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allNews = allNews.concat(result.value);
      } else {
        console.error(`Source ${index} failed:`, result.reason);
      }
    });
    
    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add source-based tags and clean up data
    allNews = allNews.map(article => ({
      ...article,
      tags: [...(article.tags || []), article.source.toLowerCase().replace(/\s+/g, '-')],
      excerpt: article.excerpt || `${article.title.slice(0, 100)}...`,
      image: article.image || ''
    }));
    
    // Update cache with source-specific key (15 minutes)
    cacheHandler.set(cacheKey, allNews, 900);
    
    sendFilteredResponse(res, allNews, source, sort, limit);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

function sendFilteredResponse(res, news, source, sort, limit) {
  try {
    // Since we're now fetching source-specific data, no need to filter again
    // The filtering is already done by fetching only the requested source
    let filteredNews = news;
    
    // Sort results
    if (sort === 'oldest') {
      filteredNews.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else { // Default: latest first
      filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Apply limit
    filteredNews = filteredNews.slice(0, limit);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.setHeader('X-Total-Sources', '5');
    res.setHeader('X-Available-Sources', 'all,ann,animecorner,myanimelist,otakuusa,crunchyroll');
    
    res.json({
      success: true,
      data: filteredNews,
      meta: {
        total: filteredNews.length,
        source: source,
        sort: sort,
        limit: limit,
        timestamp: new Date().toISOString(),
        availableSources: ['all', 'ann', 'animecorner', 'myanimelist', 'otakuusa', 'crunchyroll']
      }
    });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({
      error: 'Failed to process response',
      message: error.message
    });
  }
}
