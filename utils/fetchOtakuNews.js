const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const dateParser = require('./dateParser');
const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const OU_URLS = ['https://otakuusamagazine.com/anime-latest-news/', 'https://otakuusamagazine.com/'];
const OU_GNEWS = 'https://news.google.com/rss/search?q=site:otakuusamagazine.com&hl=en-US&gl=US&ceid=US:en';

async function fetchFromGoogleNews() {
  try {
    console.log('[OtakuUSA] Fetching from Google News RSS...');
    const feed = await rssParser.parseURL(OU_GNEWS);
    const articles = [];
    feed.items.slice(0, 12).forEach(item => {
      const title = item.title?.trim();
      if (!title) return;
      const cleanTitle = title.replace(/\s*-\s*Otaku\s*USA\s*Magazine.*$/i, '').trim();
      const excerpt = item.contentSnippet || item.content || '';
      const date = dateParser.parse(item.pubDate || item.isoDate, new Date());
      let image = '';
      const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
      const tags = item.categories?.map(c => c.toLowerCase()) || ['community', 'magazine'];
      if (cleanTitle && item.link) articles.push({ title: cleanTitle, slug: generateSlug(cleanTitle, 'otakuusa'), source: 'Otaku USA Magazine', excerpt: excerpt.substring(0, 200) || `${cleanTitle.slice(0, 120)}...`, date: date.toISOString(), image, link: item.link, tags });
    });
    console.log(`[OtakuUSA] Found ${articles.length} articles from Google News`);
    return articles;
  } catch (error) { console.error('[OtakuUSA] Google News error:', error.message); return []; }
}

async function fetchFromWeb(urlIndex = 0) {
  try {
    const url = OU_URLS[urlIndex];
    console.log(`[OtakuUSA] Fetching from web (${url})...`);
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' }, timeout: 15000 });
    const $ = cheerio.load(data);
    const articles = [];
    for (const selector of ['article.post', '.post', '.entry', 'article']) {
      $(selector).each((i, el) => {
        if (articles.length >= 10) return false;
        const $el = $(el);
        const title = $el.find('h2 a, h3 a, .entry-title a').first().text().trim();
        if (!title) return;
        const excerpt = $el.find('.entry-summary, .excerpt, p').first().text().trim();
        const dateAttr = $el.find('time').attr('datetime');
        const dateText = $el.find('.entry-date, time, .date').first().text().trim();
        const date = dateParser.parse(dateAttr || dateText, new Date());
        let image = $el.find('img').first().attr('src') || '';
        if (image.startsWith('//')) image = `https:${image}`;
        const link = $el.find('h2 a, h3 a, .entry-title a').first().attr('href') || '';
        const tags = [];
        $el.find('.cat-links a, .category a, .tags a').each((i, t) => { const tt = $(t).text().trim().toLowerCase(); if (tt) tags.push(tt); });
        if (title && link) articles.push({ title, slug: generateSlug(title, 'otakuusa'), source: 'Otaku USA Magazine', excerpt: excerpt.substring(0, 200) || `${title.slice(0, 120)}...`, date: date.toISOString(), image, link, tags: tags.length > 0 ? tags : ['community', 'magazine'] });
      });
      if (articles.length > 0) break;
    }
    console.log(`[OtakuUSA] Found ${articles.length} articles from web`);
    return articles;
  } catch (error) { console.error('[OtakuUSA] Web fetch error:', error.message); return []; }
}

module.exports = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      let articles = await fetchFromGoogleNews();
      if (articles.length === 0) { articles = await fetchFromWeb(0); if (articles.length === 0) articles = await fetchFromWeb(1); }
      if (articles.length > 0) return articles;
      if (i < retries) { console.log(`[OtakuUSA] Retry ${i + 1}/${retries}...`); await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
    } catch (error) { console.error(`[OtakuUSA] Attempt ${i + 1} failed:`, error.message); if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
  console.error('[OtakuUSA] All fetch attempts failed');
  return [];
};
