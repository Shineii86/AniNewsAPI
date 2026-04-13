const cacheHandler = require('../utils/cacheHandler');

module.exports = async (req, res) => {
  try {
    const stats = cacheHandler.getStats();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.json({
      success: true,
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      cache: stats,
      version: '2.0.0',
      node: process.version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
