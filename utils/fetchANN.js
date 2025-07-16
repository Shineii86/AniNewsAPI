const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://www.animenewsnetwork.com/news/', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const articles = [];
    
    $('.herald.box.news').each((i, el) => {
      const $el = $(el);
      const title = $el.find('h3 a').text().trim();
      const excerpt = $el.find('.preview').text().trim();
      const date = $el.find('.byline time').attr('datetime');
      const image = $el.find('img').attr('src') || '';
      const link = $el.find('h3 a').attr('href');
      const tags = [];
      
      $el.find('.byline .tags a').each((i, tag) => {
        tags.push($(tag).text().trim().toLowerCase());
      });
      
      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, 'ann'),
          source: 'Anime News Network',
          excerpt,
          date,
          image: image.startsWith('//') ? `https:${image}` : image,
          link: `https://www.animenewsnetwork.com${link}`,
          tags: tags.length > 0 ? tags : ['news']
        });
      }
    });
    
    return articles.slice(0, 15);
  } catch (error) {
    console.error('ANN fetch error:', error.message);
    return [];
  }
};
