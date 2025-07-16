const cacheHandler = require('../utils/cacheHandler');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');

module.exports = async (req, res) => {
  try {
    // Parse query parameters
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'latest';
    const source = req.query.source || 'all';
    
    // Get cached news
    const cachedNews = cacheHandler.get('news');
    if (cachedNews) {
      return sendFilteredResponse(res, cachedNews, source, sort, limit);
    }
    
    // Fetch from sources concurrently
    const sources = [
      source === 'all' || source === 'crunchyroll' ? fetchCrunchyroll() : Promise.resolve([]),
      source === 'all' || source === 'ann' ? fetchANN() : Promise.resolve([]),
      source === 'all' || source === 'animecorner' ? fetchAnimeCorner() : Promise.resolve([])
    ];
    
    const results = await Promise.allSettled(sources);
    
    let allNews = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allNews = allNews.concat(result.value);
      }
    });
    
    // Sort by date
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add source-based tags
    allNews = allNews.map(article => ({
      ...article,
      tags: [...article.tags, article.source.toLowerCase().replace(/\s+/g, '-')]
    }));
    
    // Update cache
    cacheHandler.set('news', allNews);
    
    sendFilteredResponse(res, allNews, source, sort, limit);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

function sendFilteredResponse(res, news, source, sort, limit) {
  // Filter by source
  let filteredNews = news;
  if (source !== 'all') {
    filteredNews = filteredNews.filter(
      article => article.source.toLowerCase() === source.toLowerCase()
    );
  }
  
  // Sort results
  if (sort === 'oldest') {
    filteredNews.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else { // Default: latest first
    filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  // Apply limit
  filteredNews = filteredNews.slice(0, limit);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.json(filteredNews);
}
