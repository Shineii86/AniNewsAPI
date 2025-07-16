const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const CACHE_TTL = 60 * 15; // 15 minutes default
const CACHE_FILE = path.join(__dirname, '../data/news.json');

const cache = new NodeCache({ 
  stdTTL: CACHE_TTL, 
  checkperiod: 120,
  useClones: false
});

// Create data directory if not exists
if (!fs.existsSync(path.dirname(CACHE_FILE))) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
}

module.exports = {
  get: (key) => {
    try {
      // Memory-first cache
      const memCache = cache.get(key);
      if (memCache) return memCache;
      
      // Fallback to disk cache
      if (fs.existsSync(CACHE_FILE)) {
        const fileData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        cache.set(key, fileData);
        return fileData;
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
    return null;
  },
  
  set: (key, data, ttl = CACHE_TTL) => {
    try {
      cache.set(key, data, ttl);
      // Persist to disk
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  },
  
  del: (key) => {
    cache.del(key);
    try {
      if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
      }
    } catch (e) {
      console.error('Cache delete error:', e);
    }
  }
};
