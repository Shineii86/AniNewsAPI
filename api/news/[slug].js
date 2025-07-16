const cacheHandler = require('../../utils/cacheHandler');
const contentParser = require('../../utils/contentParser');

module.exports = async (req, res) => {
  const { slug } = req.query;
  
  try {
    const cachedNews = cacheHandler.get('news') || [];
    const article = cachedNews.find(a => a.slug === slug);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Check for cached content
    const cachedArticle = cacheHandler.get(`article-${slug}`);
    if (cachedArticle) {
      return res.json(cachedArticle);
    }
    
    // Fetch full content
    const content = await contentParser.parseContent(article.link);
    const fullArticle = { ...article, content };
    
    // Cache article content for 1 hour
    cacheHandler.set(`article-${slug}`, fullArticle, 3600);
    
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(fullArticle);
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};
