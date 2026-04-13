const express = require('express');
const path = require('path');
const cacheHandler = require('./utils/cacheHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API routes
app.get('/api/news', require('./api/news.js'));
app.get('/api/news/tags', require('./api/news/tags.js'));
app.get('/api/news/:slug', require('./api/news/[slug].js'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const stats = cacheHandler.getStats();
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cache: stats,
    version: '2.0.0'
  });
});

// Cache stats endpoint
app.get('/api/stats', (req, res) => {
  const stats = cacheHandler.getStats();
  res.json({
    success: true,
    data: stats
  });
});

// Clear cache endpoint (for admin use)
app.post('/api/cache/clear', (req, res) => {
  const { key } = req.body;
  
  if (key) {
    cacheHandler.del(key);
    res.json({
      success: true,
      message: `Cache key '${key}' cleared`
    });
  } else {
    cacheHandler.flush();
    res.json({
      success: true,
      message: 'All caches cleared'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/api/news',
      '/api/news/tags',
      '/api/news/:slug',
      '/api/health',
      '/api/stats'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🎌 Anime News API v2.0.0 🎌                      ║
║                                                            ║
║   Server running on http://localhost:${PORT}                 ║
║                                                            ║
║   Endpoints:                                               ║
║   • GET /api/news          - Get all news                  ║
║   • GET /api/news/tags     - Filter by tags                ║
║   • GET /api/news/:slug    - Get article by slug           ║
║   • GET /api/health        - Health check                  ║
║   • GET /api/stats         - Cache statistics              ║
║                                                            ║
║   Sources: ANN, AnimeCorner, MAL, OtakuUSA,               ║
║            Crunchyroll, AnimeHerald, ComicBook            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
