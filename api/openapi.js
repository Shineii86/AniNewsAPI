module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'AniNewsAPI',
      version: '4.0.0',
      description: 'Real-time anime news aggregation API with smart caching, search, RSS feeds, and full-article extraction from 7 sources.',
      contact: { name: 'Shinei Nouzen', url: 'https://github.com/Shineii86', email: 'ikx7a@hotmail.com' },
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
    },
    servers: [
      { url: 'https://aninews.vercel.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local Development' }
    ],
    paths: {
      '/api/news': {
        get: {
          summary: 'Get latest anime news',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Max articles to return' },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 }, description: 'Pagination offset' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'oldest'], default: 'latest' }, description: 'Sort order' },
            { name: 'source', in: 'query', schema: { type: 'string', enum: ['all', 'ann', 'animecorner', 'myanimelist', 'otakuusa', 'crunchyroll', 'animeherald', 'comicbook'], default: 'all' }, description: 'Filter by source' },
            { name: 'refresh', in: 'query', schema: { type: 'boolean', default: false }, description: 'Bypass cache' }
          ],
          responses: {
            '200': { description: 'Successful response with article array and metadata' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/news/tags': {
        get: {
          summary: 'Filter articles by tags or list available tags',
          parameters: [
            { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by tag name' },
            { name: 'source', in: 'query', schema: { type: 'string' }, description: 'Filter by source' }
          ],
          responses: { '200': { description: 'Tags with counts or filtered articles' } }
        }
      },
      '/api/news/{slug}': {
        get: {
          summary: 'Get full article by slug',
          parameters: [
            { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'Article slug identifier' }
          ],
          responses: { '200': { description: 'Full article content' }, '404': { description: 'Article not found' } }
        }
      },
      '/api/search': {
        get: {
          summary: 'Search articles by keyword',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, description: 'Search query' },
            { name: 'source', in: 'query', schema: { type: 'string' }, description: 'Filter by source' },
            { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Max results' },
            { name: 'offset', in: 'query', schema: { type: 'integer' }, description: 'Pagination offset' }
          ],
          responses: { '200': { description: 'Search results with relevance scoring' }, '400': { description: 'Missing or invalid query' } }
        }
      },
      '/api/rss': {
        get: {
          summary: 'RSS 2.0 feed',
          parameters: [
            { name: 'source', in: 'query', schema: { type: 'string', default: 'all' }, description: 'Filter by source' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Max items' }
          ],
          responses: { '200': { description: 'RSS 2.0 XML feed' } }
        }
      },
      '/api/health': {
        get: { summary: 'Health check', responses: { '200': { description: 'API status, version, uptime' } } }
      },
      '/api/stats': {
        get: { summary: 'Cache statistics', responses: { '200': { description: 'Cache hit/miss metrics' } } }
      },
      '/api/cache/clear': {
        post: { summary: 'Clear cache', responses: { '200': { description: 'Cache cleared' } } }
      },
      '/api/stream': {
        get: {
          summary: 'Server-Sent Events stream for new articles',
          responses: { '200': { description: 'SSE stream — events: new_article, heartbeat' } }
        }
      }
    },
    components: {
      schemas: {
        Article: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            source: { type: 'string' },
            excerpt: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            image: { type: 'string', format: 'uri' },
            link: { type: 'string', format: 'uri' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  };

  res.status(200).json(spec);
};
