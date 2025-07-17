const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://myanimelist.net/news', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    $('.news-unit').each((i, el) => {
      const $el = $(el);
      const title = $el.find('.title a').text().trim();
      const excerpt = $el.find('.text').text().trim();
      const date = $el.find('.info').text().trim();
      const image = $el.find('.image img').attr('src') || '';
      const link = $el.find('.title a').attr('href');
      
      if (title && link) {
        const absoluteLink = link.startsWith('http') ? link : `https://myanimelist.net${link}`;
        
        articles.push({
          title,
          slug: generateSlug(title, 'myanimelist'),
          source: 'MyAnimeList',
          excerpt: excerpt || `${title.slice(0, 100)}...`,
          date: new Date().toISOString(), // MAL doesn't provide proper date format
          image: image.startsWith('//') ? `https:${image}` : image,
          link: absoluteLink,
          tags: ['official', 'news']
        });
      }
    });
    
    return articles.slice(0, 10);
  } catch (error) {
    console.error('MyAnimeList fetch error:', error.message);
    return [];
  }
};