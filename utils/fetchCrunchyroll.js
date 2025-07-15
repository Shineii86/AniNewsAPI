const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://www.crunchyroll.com/news', {
      headers: { 'Accept-Language': 'en-US' }
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    $('.news-item').each((i, el) => {
      const $el = $(el);
      const title = $el.find('.news-item__title').text().trim();
      const excerpt = $el.find('.news-item__desc').text().trim();
      const date = $el.find('.news-item__date').attr('datetime');
      const image = $el.find('.news-item__img img').attr('src') || '';
      const link = `https://www.crunchyroll.com${$el.find('a').attr('href')}`;
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'crunchyroll'),
          source: 'Crunchyroll',
          excerpt,
          date,
          image,
          link,
          tags: ['official']
        });
      }
    });
    
    return articles.slice(0, 15);
  } catch (error) {
    console.error('Crunchyroll fetch error:', error);
    return [];
  }
};
