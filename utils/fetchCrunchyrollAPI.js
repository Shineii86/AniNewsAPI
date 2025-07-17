const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    // Use web scraping approach since RSS is not working
    const { data } = await axios.get('https://www.crunchyroll.com/news', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Try multiple selectors to find articles
    const selectors = [
      '.news-item, .news-item--featured',
      'article',
      '.article-card',
      '.content-card',
      '.card'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, .title, .news-item__title').first().text().trim();
        const excerpt = $el.find('.description, .excerpt, .news-item__desc, .news-item__content').first().text().trim();
        const date = $el.find('time').attr('datetime') || new Date().toISOString();
        const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
        const link = $el.find('a').attr('href');
        
        if (title && link && articles.length < 10) {
          const absoluteLink = link.startsWith('http') ? link : `https://www.crunchyroll.com${link}`;
          
          articles.push({
            title,
            slug: generateSlug(title, 'crunchyroll'),
            source: 'Crunchyroll',
            excerpt: excerpt || `${title.slice(0, 100)}...`,
            date,
            image: image.startsWith('//') ? `https:${image}` : image,
            link: absoluteLink,
            tags: ['official', 'news']
          });
        }
      });
      
      if (articles.length > 0) break; // Stop if we found articles
    }
    
    return articles.slice(0, 10);
  } catch (error) {
    console.error('Crunchyroll fetch error:', error.message);
    return [];
  }
};