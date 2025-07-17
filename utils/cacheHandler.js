const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const CACHE_TTL = 60 * 15; // 15 minutes default
const CACHE_DIR = path.join(__dirname, '../data');

const cache = new NodeCache({ 
  stdTTL: CACHE_TTL, 
  checkperiod: 120,
  useClones: false
});

// Create data directory if not exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

module.exports = {
  get: (key) => {
    try {
      // Memory-first cache
      const memCache = cache.get(key);
      if (memCache) return memCache;
      
      // Fallback to disk cache with key-specific file
      const cacheFile = path.join(CACHE_DIR, `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        const fileData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
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
      // Persist to disk with key-specific file
      const cacheFile = path.join(CACHE_DIR, `${key}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify(data));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  },
  
  del: (key) => {
    cache.del(key);
    try {
      const cacheFile = path.join(CACHE_DIR, `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (e) {
      console.error('Cache delete error:', e);
    }
  }
};
