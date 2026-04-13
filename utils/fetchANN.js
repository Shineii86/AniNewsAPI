const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');

// RSS Parser as fallback
const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const ANN_URL = 'https://www.animenewsnetwork.com/news/';
const ANN_RSS = 'https://www.animenewsnetwork.com/news/rss.xml';

/**
 * Fetch news from Anime News Network
 */
async function fetchFromWeb() {
  try {
    console.log('[ANN] Fetching from web...');
    
    const { data } = await axios.get(ANN_URL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Try multiple selectors for resilience
    const selectors = [
      '.herald.box.news',
      '.news-item',
      'article.news',
      '.news-article'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (articles.length >= 15) return false;
        
        const $el = $(el);
        
        // Extract title
        const title = $el.find('h3 a, .title a, h2 a').first().text().trim();
        if (!title) return;
        
        // Extract excerpt
        const excerpt = $el.find('.preview, .excerpt, .summary').first().text().trim();
        
        // Extract date
        const dateAttr = $el.find('time').attr('datetime') || 
                        $el.find('.byline time').attr('datetime');
        const dateText = $el.find('.byline, .date, time').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        
        // Extract image
        let image = $el.find('img').attr('src') || 
                   $el.find('img').attr('data-src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        
        // Extract link
        let link = $el.find('h3 a, .title a, h2 a').first().attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://www.animenewsnetwork.com${link}`;
        }
        
        // Extract tags
        const tags = [];
        $el.find('.tags a, .category a').each((i, tag) => {
          const tagText = $(tag).text().trim().toLowerCase();
          if (tagText) tags.push(tagText);
        });
        
        if (title && link) {
          articles.push({
            title,
            slug: generateSlug(title, 'ann'),
            source: 'Anime News Network',
            excerpt: excerpt || `${title.slice(0, 120)}...`,
            date: date.toISOString(),
            image,
            link,
            tags: tags.length > 0 ? tags : ['news', 'anime']
          });
        }
      });
      
      if (articles.length > 0) break;
    }
    
    console.log(`[ANN] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) {
    console.error('[ANN] Web fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch news from ANN RSS feed
 */
async function fetchFromRSS() {
  try {
    console.log('[ANN] Fetching from RSS...');
    
    const feed = await rssParser.parseURL(ANN_RSS);
    const articles = [];
    
    feed.items.slice(0, 15).forEach(item => {
      const title = item.title?.trim();
      const excerpt = item.contentSnippet || item.content || '';
      const date = dateParser.parse(item.pubDate || item.isoDate, new Date());
      const link = item.link;
      
      // Try to extract image from content
      let image = '';
      const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
        if (image.startsWith('//')) image = `https:${image}`;
      }
      
      // Extract categories as tags
      const tags = item.categories?.map(c => c.toLowerCase()) || ['news', 'anime'];
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'ann'),
          source: 'Anime News Network',
          excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
          date: date.toISOString(),
          image,
          link,
          tags
        });
      }
    });
    
    console.log(`[ANN] Found ${articles.length} articles from RSS`);
    return articles;
  } catch (error) {
    console.error('[ANN] RSS fetch error:', error.message);
    return [];
  }
}

/**
 * Main fetch function with retry logic
 */
module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      // Try web scraping first
      let articles = await fetchFromWeb();
      
      // Fallback to RSS if web scraping fails
      if (articles.length === 0) {
        articles = await fetchFromRSS();
      }
      
      if (articles.length > 0) {
        return articles;
      }
      
      if (i < retries) {
        console.log(`[ANN] Retry ${i + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    } catch (error) {
      console.error(`[ANN] Attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  console.error('[ANN] All fetch attempts failed');
  return [];
};
