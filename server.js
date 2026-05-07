const express = require('express');
const path = require('path');
const { APP_NAME, APP_VERSION, CORS_HEADERS } = require('./utils/constants');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  next();
});

// ── In-memory rate limiter ──
const rateBuckets = new Map();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000; // 1 minute

function getRateKey(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
}

function checkRate(req, res) {
  const key = getRateKey(req);
  const now = Date.now();
  let bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW };
    rateBuckets.set(key, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, RATE_LIMIT - bucket.count);
  const resetSec = Math.ceil((bucket.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(resetSec));

  if (bucket.count > RATE_LIMIT) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Max ${RATE_LIMIT} requests per minute. Try again in ${resetSec}s.`,
      retryAfter: resetSec
    });
    return false;
  }
  return true;
}

// Clean stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(key);
  }
}, 5 * 60 * 1000);

// Apply rate limiting to API routes
app.use('/api', (req, res, next) => {
  if (!checkRate(req, res)) return;
  next();
});

// Logging
app.use((req, res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next(); });

// API routes
app.get('/api/news', require('./api/news.js'));
app.get('/api/news/tags', require('./api/news/tags.js'));
app.get('/api/news/:slug', require('./api/news/[slug].js'));
app.get('/api/search', require('./api/search.js'));
app.get('/api/rss', require('./api/rss.js'));
app.get('/api/health', require('./api/health.js'));
app.get('/api/stats', require('./api/stats.js'));
app.get('/api/stream', require('./api/stream.js'));
app.get('/api/openapi', require('./api/openapi.js'));
app.post('/api/cache/clear', require('./api/cache/clear.js'));

// Landing page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 404
app.use((req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    res.status(404).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — AniNewsAPI</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Space Grotesk',system-ui,sans-serif;background:#0a0a0f;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}a{color:#a78bfa;text-decoration:none}a:hover{text-decoration:underline}.code{font-size:6rem;font-weight:700;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin-bottom:16px}p{color:#94a3b8;margin-bottom:24px;font-size:1.1rem}pre{background:#161622;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;font-size:0.85rem;color:#94a3b8;text-align:left;max-width:500px;margin:0 auto;overflow-x:auto}</style></head><body><div><div class="code">404</div><p>This endpoint doesn't exist. Try the API instead:</p><pre><code>curl https://aninews.vercel.app/api/news</code></pre><br><a href="/">← Back to AniNewsAPI</a></div></body></html>`);
  } else {
    res.status(404).json({
      success: false, error: 'Not found',
      availableEndpoints: ['GET /api/news', 'GET /api/news/tags', 'GET /api/news/:slug', 'GET /api/search?q=', 'GET /api/rss', 'GET /api/health', 'GET /api/stats', 'GET /api/stream', 'GET /api/openapi', 'POST /api/cache/clear']
    });
  }
});

app.use((err, req, res, next) => { console.error('[Server Error]:', err); res.status(500).json({ success: false, error: 'Internal server error', message: err.message }); });

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗\n║           🎌 ${APP_NAME} v${APP_VERSION} 🎌\n║   Server running on http://localhost:${PORT}\n║\n║   Endpoints:\n║   • GET /api/news, /api/search, /api/rss\n║   • GET /api/news/tags, /api/news/:slug\n║   • GET /api/health, /api/stats, /api/stream\n║   • GET /api/openapi\n║   • POST /api/cache/clear\n╚════════════════════════════════════════════════════════════╝\n`);
});

module.exports = app;
