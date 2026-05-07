const fs = require('fs');
const path = require('path');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('./utils/constants');

// In-memory cache for landing page (avoids disk read on every request)
let cachedHtml = null;
let cachedHtmlMtime = 0;

module.exports = (req, res) => {
  try {
    const accept = req.headers.accept || '';

    // ── robots.txt ──
    if (req.url === '/robots.txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=86400');
      return res.status(200).send(
`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://aninews.vercel.app/sitemap.xml

# AniNewsAPI — Real-time Anime News Aggregation API
`
      );
    }

    // ── sitemap.xml ──
    if (req.url === '/sitemap.xml') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=86400');
      return res.status(200).send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aninews.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aninews.vercel.app/#features</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://aninews.vercel.app/#docs</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aninews.vercel.app/#sources</loc>
    <priority>0.7</priority>
  </url>
</urlset>`
      );
    }

    // ── Landing page (cached in memory) ──
    if (accept.includes('text/html') || req.url === '/' || req.url === '') {
      const filePath = path.join(__dirname, 'public', 'index.html');
      const stat = fs.statSync(filePath);

      // Re-read only if file changed
      if (!cachedHtml || stat.mtimeMs !== cachedHtmlMtime) {
        cachedHtml = fs.readFileSync(filePath, 'utf8');
        cachedHtmlMtime = stat.mtimeMs;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(cachedHtml);
    }

    // ── Fallback: API index (JSON) ──
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.status(200).json({
      name: APP_NAME, version: APP_VERSION, description: APP_DESCRIPTION,
      documentation: 'https://aninews.vercel.app',
      openapi: 'https://aninews.vercel.app/api/openapi',
      endpoints: {
        'GET /api/news': 'Latest anime news with pagination, sorting, source filtering',
        'GET /api/news/tags': 'Tag listing with counts, or filter by tag',
        'GET /api/news/:slug': 'Full article content extraction',
        'GET /api/search': 'Full-text search with relevance scoring',
        'GET /api/rss': 'RSS 2.0 XML feed',
        'GET /api/health': 'Health check',
        'GET /api/stats': 'Cache statistics',
        'GET /api/stream': 'SSE initial burst',
        'GET /api/openapi': 'OpenAPI 3.0.3 spec',
        'POST /api/cache/clear': 'Flush cache'
      },
      sources: ['Anime News Network', 'Anime Corner', 'MyAnimeList', 'Otaku USA Magazine', 'Crunchyroll', 'Anime Herald', 'Comic Book'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
