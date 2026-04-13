const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');

const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const CR_URLS = [
  'https://www.crunchyroll.com/news',
  'https://www.crunchyroll.com/news/latest'
];
const CR_RSS = 'https://www.crunchyroll.com/news/feed';

/**
 * Fetch news from Crunchyroll website
 */
async function fetchFromWeb(urlIndex = 0) {
  try {
    const url = CR_URLS[urlIndex];
    console.log(`[Crunchyroll] Fetching from web (${url})...`);
    
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Try multiple selectors - Crunchyroll changes their layout frequently
    const selectors = [
      '.news-item',
      '.news-item--featured',
      'article.news-item',
      '.article-card',
      '.content-card',
      '.news-card',
      '[class*="news"]',
      'article'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (articles.length >= 12) return false;
        
        const $el = $(el);
        
        // Extract title - try multiple selectors
        const title = $el.find('h2, h3, .title, .news-item__title, .article-title').first().text().trim();
        if (!title || title.length < 10) return;
        
        // Extract excerpt
        const excerpt = $el.find('.description, .excerpt, .news-item__desc, .news-item__content, p').first().text().trim();
        
        // Extract date
        const dateAttr = $el.find('time').attr('datetime');
        const dateText = $el.find('time, .date, .news-item__date').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        
        // Extract image
        let image = $el.find('img').first().attr('src') || 
                   $el.find('img').first().attr('data-src') || 
                   $el.find('img').first().attr('data-lazy-src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        
        // Extract link
        let link = $el.find('a').first().attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://www.crunchyroll.com${link}`;
        }
        
        // Extract category/tags
        const category = $el.find('.category, .news-item__category, .tag').first().text().trim().toLowerCase();
        const tags = category ? [category] : ['official', 'news'];
        
        if (title && link) {
          articles.push({
            title,
            slug: generateSlug(title, 'crunchyroll'),
            source: 'Crunchyroll',
            excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
            date: date.toISOString(),
            image,
            link,
            tags
          });
        }
      });
      
      if (articles.length > 0) break;
    }
    
    console.log(`[Crunchyroll] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) {
    console.error('[Crunchyroll] Web fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch from RSS feed
 */
async function fetchFromRSS() {
  try {
    console.log('[Crunchyroll] Fetching from RSS...');
    
    const feed = await rssParser.parseURL(CR_RSS);
    const articles = [];
    
    feed.items.slice(0, 12).forEach(item => {
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
      const tags = item.categories?.map(c => c.toLowerCase()) || ['official', 'news'];
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'crunchyroll'),
          source: 'Crunchyroll',
          excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
          date: date.toISOString(),
          image,
          link,
          tags
        });
      }
    });
    
    console.log(`[Crunchyroll] Found ${articles.length} articles from RSS`);
    return articles;
  } catch (error) {
    console.error('[Crunchyroll] RSS fetch error:', error.message);
    return [];
  }
}

/**
 * Main fetch function
 */
module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      // Try first URL
      let articles = await fetchFromWeb(0);
      
      // If no articles, try second URL
      if (articles.length === 0) {
        articles = await fetchFromWeb(1);
      }
      
      // Fallback to RSS
      if (articles.length === 0) {
        articles = await fetchFromRSS();
      }
      
      if (articles.length > 0) {
        return articles;
      }
      
      if (i < retries) {
        console.log(`[Crunchyroll] Retry ${i + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    } catch (error) {
      console.error(`[Crunchyroll] Attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  console.error('[Crunchyroll] All fetch attempts failed');
  return [];
};
