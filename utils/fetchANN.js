const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://www.animenewsnetwork.com/news/', {
      headers: { 'User-Agent': 'AniNewsAPI/1.0' }
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
        tags.push($(tag).text().trim());
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
          tags
        });
      }
    });
    
    return articles.slice(0, 15);
  } catch (error) {
    console.error('ANN fetch error:', error);
    return [];
  }
};
