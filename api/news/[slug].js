const cacheHandler = require('../../utils/cacheHandler');
const contentParser = require('../../utils/contentParser');
const { CORS_HEADERS } = require('../../utils/constants');

module.exports = async (req, res) => {
  const { slug } = req.query;
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (!slug) return res.status(400).json({ success: false, error: 'Missing slug parameter' });

  try {
    const cachedNews = cacheHandler.get('news_all') || [];
    let article = cachedNews.find(a => a.slug === slug);
    if (!article) {
      for (const src of ['ann', 'animecorner', 'myanimelist', 'otakuusa', 'crunchyroll', 'animeherald', 'comicbook']) {
        article = (cacheHandler.get(`news_${src}`) || []).find(a => a.slug === slug);
        if (article) break;
      }
    }
    if (!article) return res.status(404).json({ success: false, error: 'Article not found', message: `No article found with slug: ${slug}` });

    const contentCacheKey = `article-content-${slug}`;
    const cachedContent = cacheHandler.get(contentCacheKey);
    if (cachedContent) {
      return res.json({ success: true, data: { ...article, ...cachedContent }, meta: { cached: true, timestamp: new Date().toISOString() } });
    }

    const fullContent = await contentParser.parseContent(article.link);
    cacheHandler.set(contentCacheKey, fullContent, 3600);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.json({ success: true, data: { ...article, ...fullContent }, meta: { cached: false, timestamp: new Date().toISOString() } });
  } catch (error) {
    console.error('[Slug API] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch article content', message: error.message });
  }
};
