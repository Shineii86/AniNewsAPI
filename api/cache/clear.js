const cacheHandler = require('../../utils/cacheHandler');
const { CORS_HEADERS } = require('../../utils/constants');

module.exports = async (req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed', message: 'Only POST requests are allowed' });
    const { key } = req.body || {};
    if (key) {
      cacheHandler.del(key);
      res.json({ success: true, message: `Cache key '${key}' cleared`, timestamp: new Date().toISOString() });
    } else {
      cacheHandler.flush();
      res.json({ success: true, message: 'All caches cleared', timestamp: new Date().toISOString() });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, timestamp: new Date().toISOString() });
  }
};
