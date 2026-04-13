const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } else {
      // Return API info if no index.html
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        name: 'Anime News API',
        version: '2.0.0',
        description: 'Powerful multi-source anime news API',
        endpoints: {
          'GET /api/news': {
            description: 'Get latest anime news',
            parameters: {
              limit: 'Number (1-100, default: 20)',
              sort: 'String (latest/oldest, default: latest)',
              source: 'String (all/ann/animecorner/myanimelist/otakuusa/crunchyroll/animeherald/comicbook)',
              refresh: 'Boolean (force refresh cache)'
            }
          },
          'GET /api/news/tags': {
            description: 'Filter news by tags or get available tags',
            parameters: {
              tag: 'String (optional - filter by tag)',
              source: 'String (optional - filter by source)'
            }
          },
          'GET /api/news/:slug': {
            description: 'Get full article by slug'
          },
          'GET /api/health': {
            description: 'Health check and system status'
          },
          'GET /api/stats': {
            description: 'Cache statistics'
          }
        },
        sources: [
          'Anime News Network',
          'Anime Corner',
          'MyAnimeList',
          'Otaku USA Magazine',
          'Crunchyroll',
          'Anime Herald',
          'Comic Book'
        ],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
