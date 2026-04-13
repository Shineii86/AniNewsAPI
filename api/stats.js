const cacheHandler = require('../utils/cacheHandler');

module.exports = async (req, res) => {
  try {
    const stats = cacheHandler.getStats();
    
    // Calculate hit rate
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) : 0;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.json({
      success: true,
      data: {
        ...stats,
        hitRate: `${hitRate}%`,
        totalRequests: total
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
