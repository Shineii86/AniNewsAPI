const express = require('express');
const path = require('path');
const { APP_NAME, APP_VERSION, CORS_HEADERS } = require('./utils/constants');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  next();
});
app.use((req, res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next(); });

app.get('/api/news', require('./api/news.js'));
app.get('/api/news/tags', require('./api/news/tags.js'));
app.get('/api/news/:slug', require('./api/news/[slug].js'));
app.get('/api/search', require('./api/search.js'));
app.get('/api/rss', require('./api/rss.js'));
app.get('/api/health', require('./api/health.js'));
app.get('/api/stats', require('./api/stats.js'));
app.post('/api/cache/clear', require('./api/cache/clear.js'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((req, res) => res.status(404).json({ success: false, error: 'Not found', availableEndpoints: ['GET /api/news', 'GET /api/news/tags', 'GET /api/news/:slug', 'GET /api/search?q=', 'GET /api/rss', 'GET /api/health', 'GET /api/stats', 'POST /api/cache/clear'] }));
app.use((err, req, res, next) => { console.error('[Server Error]:', err); res.status(500).json({ success: false, error: 'Internal server error', message: err.message }); });

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗\n║           🎌 ${APP_NAME} v${APP_VERSION} 🎌\n║   Server running on http://localhost:${PORT}\n║\n║   Endpoints:\n║   • GET /api/news, /api/search, /api/rss\n║   • GET /api/news/tags, /api/news/:slug\n║   • GET /api/health, /api/stats\n║   • POST /api/cache/clear\n╚════════════════════════════════════════════════════════════╝\n`);
});

module.exports = app;
