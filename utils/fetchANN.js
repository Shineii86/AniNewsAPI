const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');
const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const ANN_URL = 'https://www.animenewsnetwork.com/news/';
const ANN_GNEWS = 'https://news.google.com/rss/search?q=site:animenewsnetwork.com%2Fnews&hl=en-US&gl=US&ceid=US:en';

async function fetchFromGoogleNews() {
  try {
    console.log('[ANN] Fetching from Google News RSS...');
    const feed = await rssParser.parseURL(ANN_GNEWS);
    const articles = [];
    feed.items.slice(0, 15).forEach(item => {
      const title = item.title?.trim();
      if (!title) return;
      const cleanTitle = title.replace(/\s*-\s*Anime News Network.*$/i, '').trim();
      const excerpt = item.contentSnippet || item.content || '';
      const date = dateParser.parse(item.pubDate || item.isoDate, new Date());
      let image = '';
      const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
      const tags = item.categories?.map(c => c.toLowerCase()) || ['news', 'anime'];
      if (cleanTitle && item.link) articles.push({ title: cleanTitle, slug: generateSlug(cleanTitle, 'ann'), source: 'Anime News Network', excerpt: excerpt.substring(0, 200) || `${cleanTitle.slice(0, 120)}...`, date: date.toISOString(), image, link: item.link, tags });
    });
    console.log(`[ANN] Found ${articles.length} articles from Google News`);
    return articles;
  } catch (error) { console.error('[ANN] Google News error:', error.message); return []; }
}

async function fetchFromWeb() {
  try {
    console.log('[ANN] Fetching from web...');
    const { data } = await axios.get(ANN_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' }, timeout: 15000 });
    const $ = cheerio.load(data);
    const articles = [];
    for (const selector of ['.herald.box.news', '.news-item', 'article.news', '.news-article']) {
      $(selector).each((i, el) => {
        if (articles.length >= 15) return false;
        const $el = $(el);
        const title = $el.find('h3 a, .title a, h2 a').first().text().trim();
        if (!title) return;
        const excerpt = $el.find('.preview, .excerpt, .summary').first().text().trim();
        const dateAttr = $el.find('time').attr('datetime');
        const dateText = $el.find('.byline, .date, time').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        let image = $el.find('img').attr('src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        let link = $el.find('h3 a, .title a, h2 a').first().attr('href') || '';
        if (link && !link.startsWith('http')) link = `https://www.animenewsnetwork.com${link}`;
        const tags = [];
        $el.find('.tags a, .category a').each((i, t) => { const tt = $(t).text().trim().toLowerCase(); if (tt) tags.push(tt); });
        if (title && link) articles.push({ title, slug: generateSlug(title, 'ann'), source: 'Anime News Network', excerpt: excerpt || `${title.slice(0, 120)}...`, date: date.toISOString(), image, link, tags: tags.length > 0 ? tags : ['news', 'anime'] });
      });
      if (articles.length > 0) break;
    }
    console.log(`[ANN] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) { console.error('[ANN] Web fetch error:', error.message); return []; }
}

module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      let articles = await fetchFromGoogleNews();
      if (articles.length === 0) articles = await fetchFromWeb();
      if (articles.length > 0) return articles;
      if (i < retries) { console.log(`[ANN] Retry ${i + 1}/${retries}...`); await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
    } catch (error) { console.error(`[ANN] Attempt ${i + 1} failed:`, error.message); if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
  console.error('[ANN] All fetch attempts failed');
  return [];
};
