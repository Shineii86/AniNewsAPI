const cacheHandler = require('../utils/cacheHandler');
const { APP_NAME, APP_VERSION, CORS_HEADERS } = require('../utils/constants');

module.exports = async (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    const stats = cacheHandler.getStats();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.json({ success: true, status: 'healthy', name: APP_NAME, version: APP_VERSION, uptime: process.uptime(), memory: process.memoryUsage(), timestamp: new Date().toISOString(), cache: stats, node: process.version });
  } catch (error) {
    res.status(500).json({ success: false, status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() });
  }
};
