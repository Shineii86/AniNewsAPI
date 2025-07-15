const cacheHandler = require('../utils/cacheHandler');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchANN = require('../utils/fetchANN');

module.exports = async (req, res) => {
  try {
    // Check cache first
    const cachedNews = cacheHandler.get('news');
    if (cachedNews) {
      return res.json(cachedNews);
    }
    
    // Fetch from sources concurrently
    const [crunchyrollNews, annNews] = await Promise.allSettled([
      fetchCrunchyroll(),
      fetchANN()
    ]);
    
    // Combine and sort results
    const allNews = [
      ...(crunchyrollNews.value || []),
      ...(annNews.value || [])
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update cache
    cacheHandler.set('news', allNews);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.json(allNews);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};
