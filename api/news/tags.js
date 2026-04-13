const cacheHandler = require('../../utils/cacheHandler');

/**
 * Available tags endpoint
 */
module.exports = async (req, res) => {
  try {
    const { tag, source } = req.query;
    
    // Get all cached news
    const cachedNews = cacheHandler.get('news_all') || [];
    
    if (!tag) {
      // Return available tags
      const allTags = new Set();
      cachedNews.forEach(article => {
        (article.tags || []).forEach(t => allTags.add(t.toLowerCase()));
      });
      
      return res.json({
        success: true,
        data: {
          tags: Array.from(allTags).sort(),
          count: allTags.size
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Filter by tag
    const normalizedTag = tag.toLowerCase().trim();
    let filteredArticles = cachedNews.filter(article => 
      article.tags?.some(t => t.toLowerCase() === normalizedTag)
    );
    
    // Optional source filter
    if (source && source !== 'all') {
      filteredArticles = filteredArticles.filter(article => 
        article.source.toLowerCase().replace(/\s+/g, '-') === source.toLowerCase()
      );
    }
    
    // Sort by date
    filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    
    res.json({
      success: true,
      data: filteredArticles,
      meta: {
        total: filteredArticles.length,
        tag: normalizedTag,
        source: source || 'all',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Tags API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter by tag',
      message: error.message
    });
  }
};
