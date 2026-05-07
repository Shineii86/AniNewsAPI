const cacheHandler = require('../../utils/cacheHandler');
const { CORS_HEADERS } = require('../../utils/constants');

module.exports = async (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const { tag, source } = req.query;
    const cachedNews = cacheHandler.get('news_all') || [];

    if (!tag) {
      const tagCounts = new Map();
      cachedNews.forEach(article => {
        (article.tags || []).forEach(t => { const n = t.toLowerCase(); tagCounts.set(n, (tagCounts.get(n) || 0) + 1); });
      });
      const tags = Array.from(tagCounts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
      return res.json({ success: true, data: { tags, totalTags: tags.length, totalArticles: cachedNews.length }, meta: { timestamp: new Date().toISOString() } });
    }

    const normalizedTag = tag.toLowerCase().trim();
    let filtered = cachedNews.filter(a => a.tags?.some(t => t.toLowerCase() === normalizedTag));
    if (source && source !== 'all') filtered = filtered.filter(a => a.source.toLowerCase().replace(/\s+/g, '-') === source.toLowerCase());
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: filtered, meta: { total: filtered.length, tag: normalizedTag, source: source || 'all', timestamp: new Date().toISOString() } });
  } catch (error) {
    console.error('[Tags API] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to filter by tag', message: error.message });
  }
};
