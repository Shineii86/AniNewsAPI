const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');

const MAL_URL = 'https://myanimelist.net/news';

/**
 * Fetch news from MyAnimeList with proper date parsing
 */
async function fetchFromWeb() {
  try {
    console.log('[MAL] Fetching from web...');
    
    const { data } = await axios.get(MAL_URL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'mqlid=1; is_logged_in=0' // Minimal cookies
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Try multiple selectors for news units
    const selectors = [
      '.news-unit',
      '.news-list .news-unit',
      '[class*="news"]',
      '.latest-news .news-item'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (articles.length >= 15) return false;
        
        const $el = $(el);
        
        // Extract title
        const title = $el.find('.title a, h2 a, h3 a, a.title').first().text().trim();
        if (!title) return;
        
        // Extract excerpt
        const excerpt = $el.find('.text, .excerpt, .summary, p').first().text().trim();
        
        // Extract date - MAL has specific date format in .info
        const infoText = $el.find('.info, .date, time').first().text().trim();
        const dateAttr = $el.find('time').attr('datetime');
        
        // Use our improved MAL date parser
        let date;
        if (dateAttr) {
          date = dateParser.parse(dateAttr, new Date());
        } else if (infoText) {
          date = dateParser.parseMALDate(infoText);
        } else {
          date = new Date();
        }
        
        // Extract image
        let image = $el.find('.image img, img').first().attr('src') || 
                   $el.find('.image img, img').first().attr('data-src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        
        // Extract link
        let link = $el.find('.title a, h2 a, h3 a, a.title').first().attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://myanimelist.net${link}`;
        }
        
        if (title && link) {
          articles.push({
            title,
            slug: generateSlug(title, 'myanimelist'),
            source: 'MyAnimeList',
            excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
            date: date.toISOString(),
            image,
            link,
            tags: ['official', 'news']
          });
        }
      });
      
      if (articles.length > 0) break;
    }
    
    console.log(`[MAL] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) {
    console.error('[MAL] Web fetch error:', error.message);
    return [];
  }
}

/**
 * Alternative fetch from MAL news page 2 for more variety
 */
async function fetchFromPage2() {
  try {
    console.log('[MAL] Fetching from page 2...');
    
    const { data } = await axios.get(`${MAL_URL}?p=2`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    $('.news-unit').each((i, el) => {
      if (articles.length >= 10) return false;
      
      const $el = $(el);
      const title = $el.find('.title a').text().trim();
      const excerpt = $el.find('.text').text().trim();
      const infoText = $el.find('.info').text().trim();
      const date = dateParser.parseMALDate(infoText);
      
      let image = $el.find('.image img').attr('src') || '';
      if (image.startsWith('//')) image = `https:${image}`;
      
      let link = $el.find('.title a').attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://myanimelist.net${link}`;
      }
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'myanimelist'),
          source: 'MyAnimeList',
          excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`,
          date: date.toISOString(),
          image,
          link,
          tags: ['official', 'news']
        });
      }
    });
    
    console.log(`[MAL] Found ${articles.length} articles from page 2`);
    return articles;
  } catch (error) {
    console.error('[MAL] Page 2 fetch error:', error.message);
    return [];
  }
}

/**
 * Main fetch function with retry logic
 */
module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      let articles = await fetchFromWeb();
      
      // If we got fewer articles, try page 2
      if (articles.length < 10) {
        const page2Articles = await fetchFromPage2();
        articles = [...articles, ...page2Articles];
      }
      
      if (articles.length > 0) {
        return articles;
      }
      
      if (i < retries) {
        console.log(`[MAL] Retry ${i + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    } catch (error) {
      console.error(`[MAL] Attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  console.error('[MAL] All fetch attempts failed');
  return [];
};
