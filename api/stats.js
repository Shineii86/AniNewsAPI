const cacheHandler = require('../utils/cacheHandler');
const { CORS_HEADERS } = require('../utils/constants');

module.exports = async (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    const stats = cacheHandler.getStats();
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) : '0.00';
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.json({ success: true, data: { ...stats, hitRate: `${hitRate}%`, totalRequests: total }, meta: { timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, timestamp: new Date().toISOString() });
  }
};
