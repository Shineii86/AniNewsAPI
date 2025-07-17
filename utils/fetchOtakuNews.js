const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://otakuusamagazine.com/anime-latest-news/', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    $('.post').each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2 a, h3 a, .entry-title a').text().trim();
      const excerpt = $el.find('.entry-summary, .excerpt').text().trim();
      const date = $el.find('.entry-date, time').attr('datetime') || new Date().toISOString();
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const link = $el.find('h2 a, h3 a, .entry-title a').attr('href');
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'otakuusa'),
          source: 'Otaku USA Magazine',
          excerpt: excerpt || `${title.slice(0, 100)}...`,
          date,
          image: image.startsWith('//') ? `https:${image}` : image,
          link,
          tags: ['community', 'news']
        });
      }
    });
    
    return articles.slice(0, 10);
  } catch (error) {
    console.error('Otaku USA fetch error:', error.message);
    return [];
  }
};