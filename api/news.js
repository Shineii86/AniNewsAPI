const cacheHandler = require('../utils/cacheHandler');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');

// Add a new source for fallback
module.exports = async (req, res) => {
  try {
    const cachedNews = cacheHandler.get('news');
    if (cachedNews) {
      res.setHeader('X-Cache-Status', 'HIT');
      return res.json(cachedNews);
    }
    
    // Fetch from multiple sources
    const sources = [
      fetchANN(),
      fetchCrunchyroll(),
      fetchAnimeCorner() // Add this new source
    ];
    
    const results = await Promise.allSettled(sources);
    
    let allNews = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allNews = allNews.concat(result.value);
      } else {
        console.error(`Source ${index} failed:`, result.reason);
      }
    });
    
    // Fallback to ANN only if everything fails
    if (allNews.length === 0) {
      console.error('All sources failed, using ANN fallback');
      const annFallback = await fetchANN();
      allNews = annFallback;
    }
    
    // Sort by date
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Cache with shorter TTL on failure
    const cacheTTL = allNews.length > 10 ? 600 : 60; // 10 min or 1 min
    cacheHandler.set('news', allNews, cacheTTL);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', `public, max-age=${cacheTTL}`);
    res.setHeader('X-Cache-Status', 'MISS');
    res.json(allNews);
  } catch (error) {
    console.error('API error:', error);
    
    // Try to return cached data even on error
    const cachedNews = cacheHandler.get('news');
    if (cachedNews) {
      res.setHeader('X-Cache-Status', 'STALE');
      return res.json(cachedNews);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message
    });
  }
};
