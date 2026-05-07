const { APP_NAME, APP_VERSION } = require('../utils/constants');
const cacheHandler = require('../utils/cacheHandler');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', name: APP_NAME, version: APP_VERSION })}\n\n`);

  // Send current article count
  const cached = cacheHandler.get('news_all');
  const count = Array.isArray(cached) ? cached.length : 0;
  res.write(`data: ${JSON.stringify({ type: 'status', articles: count, timestamp: new Date().toISOString() })}\n\n`);

  // Send heartbeat immediately (Vercel functions timeout at 10s on Hobby)
  res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);

  // Close after initial burst — Vercel serverless can't hold long-lived connections
  // Clients should poll /api/news with ?refresh=true for fresh data
  res.write(`data: ${JSON.stringify({ type: 'info', message: 'SSE initial burst complete. Poll /api/news for updates.' })}\n\n`);
  res.end();
};
