const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');
const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const CR_URLS = ['https://www.crunchyroll.com/news', 'https://www.crunchyroll.com/news/latest'];
const CR_GNEWS = 'https://news.google.com/rss/search?q=site:crunchyroll.com%2Fnews&hl=en-US&gl=US&ceid=US:en';

async function fetchFromGoogleNews() {
  try {
    console.log('[Crunchyroll] Fetching from Google News RSS...');
    const feed = await rssParser.parseURL(CR_GNEWS);
    const articles = [];
    feed.items.slice(0, 15).forEach(item => {
      const title = item.title?.trim();
      if (!title) return;
      const cleanTitle = title.replace(/\s*-\s*(Crunchyroll|Crunchyroll News).*$/i, '').trim();
      const excerpt = item.contentSnippet || item.content || '';
      const date = dateParser.parse(item.pubDate || item.isoDate, new Date());
      let image = '';
      const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
      const tags = item.categories?.map(c => c.toLowerCase()) || ['official', 'news'];
      if (cleanTitle && item.link) articles.push({ title: cleanTitle, slug: generateSlug(cleanTitle, 'crunchyroll'), source: 'Crunchyroll', excerpt: excerpt.substring(0, 200) || `${cleanTitle.slice(0, 120)}...`, date: date.toISOString(), image, link: item.link, tags });
    });
    console.log(`[Crunchyroll] Found ${articles.length} articles from Google News`);
    return articles;
  } catch (error) { console.error('[Crunchyroll] Google News error:', error.message); return []; }
}

async function fetchFromWeb(urlIndex = 0) {
  try {
    const url = CR_URLS[urlIndex];
    console.log(`[Crunchyroll] Fetching from web (${url})...`);
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' }, timeout: 15000 });
    const $ = cheerio.load(data);
    const articles = [];
    for (const selector of ['.news-item', 'article', '.article-card', '[class*="news"]']) {
      $(selector).each((i, el) => {
        if (articles.length >= 12) return false;
        const $el = $(el);
        const title = $el.find('h2, h3, .title, .news-item__title').first().text().trim();
        if (!title || title.length < 10) return;
        const excerpt = $el.find('.description, .excerpt, p').first().text().trim();
        const dateAttr = $el.find('time').attr('datetime');
        const dateText = $el.find('time, .date').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        let image = $el.find('img').first().attr('src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        let link = $el.find('a').first().attr('href') || '';
        if (link && !link.startsWith('http')) link = `https://www.crunchyroll.com${link}`;
        const tags = [$el.find('.category, .tag').first().text().trim().toLowerCase() || 'official', 'news'];
        if (title && link) articles.push({ title, slug: generateSlug(title, 'crunchyroll'), source: 'Crunchyroll', excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`, date: date.toISOString(), image, link, tags });
      });
      if (articles.length > 0) break;
    }
    console.log(`[Crunchyroll] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) { console.error('[Crunchyroll] Web fetch error:', error.message); return []; }
}

module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      let articles = await fetchFromGoogleNews();
      if (articles.length === 0) { articles = await fetchFromWeb(0); if (articles.length === 0) articles = await fetchFromWeb(1); }
      if (articles.length > 0) return articles;
      if (i < retries) { console.log(`[Crunchyroll] Retry ${i + 1}/${retries}...`); await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
    } catch (error) { console.error(`[Crunchyroll] Attempt ${i + 1} failed:`, error.message); if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
  console.error('[Crunchyroll] All fetch attempts failed');
  return [];
};
