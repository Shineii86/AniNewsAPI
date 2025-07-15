const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const CACHE_TTL = 60 * 15; // 15 minutes
const CACHE_FILE = path.join(__dirname, '../data/news.json');

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 });

module.exports = {
  get: (key) => {
    // Memory-first cache
    const memCache = cache.get(key);
    if (memCache) return memCache;
    
    // Fallback to disk cache
    try {
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
  
  set: (key, data) => {
    cache.set(key, data);
    // Persist to disk
    fs.writeFile(CACHE_FILE, JSON.stringify(data), (err) => {
      if (err) console.error('Cache write error:', err);
    });
  }
};
