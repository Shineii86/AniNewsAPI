const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');

module.exports = async () => {
  try {
    const { data } = await axios.get('https://animecorner.me/category/news/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const articles = [];

    $('article').each((i, el) => {
      const $el = $(el);
      const title = $el.find('h2.entry-title a').text().trim();
      const excerpt = $el.find('.entry-excerpt').text().trim();
      const dateText = $el.find('.entry-date').text().trim();
      const dateAttr = $el.find('.entry-date').attr('datetime');
      const image = $el.find('.entry-thumb img').attr('src') || $el.find('.entry-thumb img').attr('data-src');
      const link = $el.find('h2.entry-title a').attr('href');

      if (title && link) {
        // Parse date - try datetime attribute first, then text
        let date;
        if (dateAttr) {
          date = new Date(dateAttr).toISOString();
        } else if (dateText) {
          date = new Date(dateText).toISOString();
        } else {
          date = new Date().toISOString();
        }

        articles.push({
          title,
          slug: generateSlug(title, 'animecorner'),
          source: 'Anime Corner',
          excerpt: excerpt || `${title.slice(0, 100)}...`,
          date,
          image: image || '',
          link,
          tags: ['community', 'news']
        });
      }
    });

    return articles.slice(0, 10);
  } catch (error) {
    console.error('AnimeCorner fetch error:', error.message);
    return [];
  }
};
