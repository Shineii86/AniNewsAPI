const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 600; // 10 minutes default (reduced from 15)
const CACHE_DIR = path.join(__dirname, '../data');

const cache = new NodeCache({ 
  stdTTL: CACHE_TTL, 
  checkperiod: 60, // Check every minute
  useClones: false,
  deleteOnExpire: true
});

// Create data directory if not exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  lastRefresh: null
};

module.exports = {
  get: (key) => {
    try {
      // Memory-first cache
      const memCache = cache.get(key);
      if (memCache) {
        stats.hits++;
        console.log(`[Cache] HIT for key: ${key}`);
        return memCache;
      }
      
      // Fallback to disk cache with key-specific file
      const cacheFile = path.join(CACHE_DIR, `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        const stat = fs.statSync(cacheFile);
        const age = Date.now() - stat.mtimeMs;
        const maxAge = CACHE_TTL * 1000;
        
        // Check if file cache is still fresh
        if (age < maxAge) {
          const fileData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          cache.set(key, fileData);
          stats.hits++;
          console.log(`[Cache] DISK HIT for key: ${key}`);
          return fileData;
        } else {
          // Delete stale cache file
          fs.unlinkSync(cacheFile);
          console.log(`[Cache] DISK EXPIRED for key: ${key}`);
        }
      }
      
      stats.misses++;
      console.log(`[Cache] MISS for key: ${key}`);
      return null;
    } catch (e) {
      console.error('[Cache] Read error:', e.message);
      return null;
    }
  },
  
  set: (key, data, ttl = CACHE_TTL) => {
    try {
      cache.set(key, data, ttl);
      // Persist to disk with key-specific file
      const cacheFile = path.join(CACHE_DIR, `${key}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      stats.lastRefresh = new Date().toISOString();
      console.log(`[Cache] SET for key: ${key} (${data.length || data.data?.length || 'object'} items)`);
    } catch (e) {
      console.error('[Cache] Write error:', e.message);
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
      console.error('[Cache] Delete error:', e.message);
    }
  },
  
  flush: () => {
    cache.flushAll();
    try {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        }
      });
      console.log('[Cache] Flushed all caches');
    } catch (e) {
      console.error('[Cache] Flush error:', e.message);
    }
  },
  
  getStats: () => ({
    ...stats,
    keys: cache.keys(),
    ttl: CACHE_TTL
  }),
  
  // Force refresh cache
  refresh: async (fetchFn, key) => {
    module.exports.del(key);
    const data = await fetchFn();
    module.exports.set(key, data);
    return data;
  }
};
