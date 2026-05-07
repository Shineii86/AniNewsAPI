const fs = require('fs');
const path = require('path');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('./utils/constants');

module.exports = (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        name: APP_NAME, version: APP_VERSION, description: APP_DESCRIPTION,
        endpoints: {
          'GET /api/news': { description: 'Get latest anime news', parameters: { limit: 'Number (1-100, default: 20)', offset: 'Number (pagination offset)', sort: 'String (latest/oldest)', source: 'String (all/ann/animecorner/myanimelist/otakuusa/crunchyroll/animeherald/comicbook)', refresh: 'Boolean (force refresh)' } },
          'GET /api/news/tags': { description: 'Filter by tags or get available tags', parameters: { tag: 'String', source: 'String' } },
          'GET /api/news/:slug': { description: 'Get full article by slug' },
          'GET /api/search': { description: 'Search articles by keyword', parameters: { q: 'String (required)', source: 'String', limit: 'Number' } },
          'GET /api/rss': { description: 'RSS feed output', parameters: { source: 'String', limit: 'Number' } },
          'GET /api/health': { description: 'Health check' },
          'GET /api/stats': { description: 'Cache statistics' },
          'POST /api/cache/clear': { description: 'Clear cache' }
        },
        sources: ['Anime News Network', 'Anime Corner', 'MyAnimeList', 'Otaku USA Magazine', 'Crunchyroll', 'Anime Herald', 'Comic Book'],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) { res.status(500).json({ error: 'Internal server error', message: error.message }); }
};
