const cacheHandler = require('../../utils/cacheHandler');
const contentParser = require('../../utils/contentParser');

/**
 * Get article by slug
 */
module.exports = async (req, res) => {
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({
      success: false,
      error: 'Missing slug parameter',
      message: 'Please provide a slug parameter'
    });
  }
  
  try {
    // Try to find article in cache
    const cachedNews = cacheHandler.get('news_all') || [];
    let article = cachedNews.find(a => a.slug === slug);
    
    // If not found in all, check other source caches
    if (!article) {
      const sources = ['ann', 'animecorner', 'myanimelist', 'otakuusa', 'crunchyroll', 'animeherald', 'comicbook'];
      for (const source of sources) {
        const sourceNews = cacheHandler.get(`news_${source}`) || [];
        article = sourceNews.find(a => a.slug === slug);
        if (article) break;
      }
    }
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
        message: `No article found with slug: ${slug}`
      });
    }
    
    // Check for cached full content
    const contentCacheKey = `article-content-${slug}`;
    const cachedContent = cacheHandler.get(contentCacheKey);
    
    if (cachedContent) {
      console.log(`[Slug API] Cache hit for article: ${slug}`);
      return res.json({
        success: true,
        data: {
          ...article,
          ...cachedContent
        },
        meta: {
          cached: true,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Fetch full content
    console.log(`[Slug API] Fetching full content for: ${slug}`);
    const fullContent = await contentParser.parseContent(article.link);
    
    // Cache content for 1 hour
    cacheHandler.set(contentCacheKey, fullContent, 3600);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    
    res.json({
      success: true,
      data: {
        ...article,
        ...fullContent
      },
      meta: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Slug API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article content',
      message: error.message
    });
  }
};
