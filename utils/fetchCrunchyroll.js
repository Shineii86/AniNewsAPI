const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://www.crunchyroll.com/news', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.crunchyroll.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    // Updated selector - Crunchyroll changed their HTML structure
    $('.news-item, .news-item--featured').each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2, .news-item__title').first().text().trim();
      const excerpt = $el.find('.news-item__desc, .news-item__content').first().text().trim();
      const date = $el.find('time').attr('datetime') || new Date().toISOString();
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const link = $el.find('a').attr('href');
      
      if (title && link) {
        const absoluteLink = link.startsWith('http') ? link : `https://www.crunchyroll.com${link}`;
        
        articles.push({
          title,
          slug: generateSlug(title, 'crunchyroll'),
          source: 'Crunchyroll',
          excerpt: excerpt || `${title.slice(0, 100)}...`,
          date,
          image: image.startsWith('//') ? `https:${image}` : image,
          link: absoluteLink,
          tags: ['official', 'streaming']
        });
      }
    });
    
    return articles.slice(0, 15);
  } catch (error) {
    console.error('Crunchyroll fetch error:', error.message);
    // Return sample data if scraping fails
    return [{
      title: 'Crunchyroll News Service Temporarily Unavailable',
      slug: 'crunchyroll-service-unavailable',
      source: 'Crunchyroll',
      excerpt: 'Our news service is currently experiencing issues. Please check back later.',
      date: new Date().toISOString(),
      image: '',
      link: 'https://www.crunchyroll.com/news',
      tags: ['announcement']
    }];
  }
};
