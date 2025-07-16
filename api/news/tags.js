const cacheHandler = require('../../utils/cacheHandler');

module.exports = async (req, res) => {
  try {
    const { tag } = req.query;
    
    if (!tag) {
      return res.status(400).json({ error: 'Missing tag parameter' });
    }
    
    const cachedNews = cacheHandler.get('news') || [];
    const normalizedTag = tag.toLowerCase();
    
    // Filter articles by tag
    const filteredArticles = cachedNews.filter(article => 
      article.tags.some(t => t.toLowerCase() === normalizedTag)
    );
    
    // For Crunchyroll-only filtering as specified
    const crunchyrollArticles = filteredArticles.filter(
      article => article.source.toLowerCase() === 'crunchyroll'
    );
    
    if (crunchyrollArticles.length === 0) {
      return res.status(404).json({
        error: 'No Crunchyroll articles found for this tag',
        suggestion: 'Try /api/news/tags for available tags'
      });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.json(crunchyrollArticles);
  } catch (error) {
    console.error('Tag filter error:', error);
    res.status(500).json({ error: 'Failed to filter by tag' });
  }
};
