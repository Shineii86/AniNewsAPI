const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');

const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const AH_URL = 'https://www.animeherald.com/';
const AH_RSS = 'https://www.animeherald.com/feed/';

/**
 * Fetch news from Anime Herald website
 */
async function fetchFromWeb() {
  try {
    console.log('[AnimeHerald] Fetching from web...');
    
    const { data } = await axios.get(AH_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Try multiple selectors
    const selectors = [
      'article.post',
      '.post',
      '.entry',
      'article'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (articles.length >= 10) return false;
        
        const $el = $(el);
        
        // Extract title
        const title = $el.find('h2 a, h3 a, .entry-title a, .post-title a').first().text().trim();
        if (!title) return;
        
        // Extract excerpt
        const excerpt = $el.find('.entry-summary, .excerpt, p').first().text().trim();
        
        // Extract date
        const dateAttr = $el.find('time').attr('datetime');
        const dateText = $el.find('.entry-date, time, .date').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        
        // Extract image
        let image = $el.find('img').first().attr('src') || 
                   $el.find('img').first().attr('data-src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        
        // Extract link
        const link = $el.find('h2 a, h3 a, .entry-title a, .post-title a').first().attr('href') || '';
        
        // Extract tags
        const tags = [];
        $el.find('.cat-links a, .category a, .tags a').each((i, tag) => {
          const tagText = $(tag).text().trim().toLowerCase();
          if (tagText) tags.push(tagText);
        });
        
        if (title && link) {
          articles.push({
            title,
            slug: generateSlug(title, 'animeherald'),
            source: 'Anime Herald',
            excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
            date: date.toISOString(),
            image,
            link,
            tags: tags.length > 0 ? tags : ['news', 'anime']
          });
        }
      });
      
      if (articles.length > 0) break;
    }
    
    console.log(`[AnimeHerald] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) {
    console.error('[AnimeHerald] Web fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch from RSS feed
 */
async function fetchFromRSS() {
  try {
    console.log('[AnimeHerald] Fetching from RSS...');
    
    const feed = await rssParser.parseURL(AH_RSS);
    const articles = [];
    
    feed.items.slice(0, 10).forEach(item => {
      const title = item.title?.trim();
      const excerpt = item.contentSnippet || '';
      const date = dateParser.parse(item.pubDate || item.isoDate, new Date());
      const link = item.link;
      
      // Extract image from content
      let image = '';
      const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
      }
      
      // Extract categories
      const tags = item.categories?.map(c => c.toLowerCase()) || ['news', 'anime'];
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'animeherald'),
          source: 'Anime Herald',
          excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
          date: date.toISOString(),
          image,
          link,
          tags
        });
      }
    });
    
    console.log(`[AnimeHerald] Found ${articles.length} articles from RSS`);
    return articles;
  } catch (error) {
    console.error('[AnimeHerald] RSS fetch error:', error.message);
    return [];
  }
}

/**
 * Main fetch function
 */
module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      let articles = await fetchFromWeb();
      
      if (articles.length === 0) {
        articles = await fetchFromRSS();
      }
      
      if (articles.length > 0) {
        return articles;
      }
      
      if (i < retries) {
        console.log(`[AnimeHerald] Retry ${i + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    } catch (error) {
      console.error(`[AnimeHerald] Attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  console.error('[AnimeHerald] All fetch attempts failed');
  return [];
};
