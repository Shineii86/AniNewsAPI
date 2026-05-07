const { APP_NAME, APP_VERSION } = require('../utils/constants');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', name: APP_NAME, version: APP_VERSION })}\n\n`);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  // Note: In production, this would hook into the cache layer
  // to broadcast new articles as they're fetched. For now, clients
  // can poll /api/news with the latest date to detect new articles.
  // A future version will wire this into the scraper pipeline.

  req.on('close', () => {
    clearInterval(heartbeat);
  });
};
