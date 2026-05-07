/**
 * Application constants
 */
module.exports = {
  APP_NAME: 'AniNewsAPI',
  APP_VERSION: '3.0.0',
  APP_DESCRIPTION: 'Powerful multi-source anime news API',
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 600,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
  DEFAULT_SORT: 'latest',
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  REQUEST_TIMEOUT: 15000,
  CONTENT_TIMEOUT: 20000,
  MAX_ARTICLES_PER_SOURCE: 15,
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
};
