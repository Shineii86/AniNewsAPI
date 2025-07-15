const cacheHandler = require('../../../utils/cacheHandler');

module.exports = async (req, res) => {
  try {
    const cachedTags = cacheHandler.get('tags');
    if (cachedTags) {
      return res.json(cachedTags);
    }
    
    const cachedNews = cacheHandler.get('news') || [];
    const tags = new Set();
    
    cachedNews.forEach(article => {
      article.tags.forEach(tag => tags.add(tag.toLowerCase()));
    });
    
    const tagList = Array.from(tags).sort();
    cacheHandler.set('tags', tagList);
    
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json(tagList);
  } catch (error) {
    console.error('Tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};
