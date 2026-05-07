const cacheHandler = require('../utils/cacheHandler');
const fetchANN = require('../utils/fetchANN');
const fetchAnimeCorner = require('../utils/fetchAnimeCorner');
const fetchMyAnimeList = require('../utils/fetchMyAnimeList');
const fetchOtakuNews = require('../utils/fetchOtakuNews');
const fetchCrunchyroll = require('../utils/fetchCrunchyroll');
const fetchAnimeHerald = require('../utils/fetchAnimeHerald');
const fetchComicBook = require('../utils/fetchComicBook');
const { APP_NAME, APP_VERSION, CORS_HEADERS, MAX_LIMIT, DEFAULT_LIMIT } = require('../utils/constants');

const SOURCES = {
  ann: { name: 'Anime News Network', fetch: fetchANN },
  animecorner: { name: 'Anime Corner', fetch: fetchAnimeCorner },
  myanimelist: { name: 'MyAnimeList', fetch: fetchMyAnimeList },
  otakuusa: { name: 'Otaku USA Magazine', fetch: fetchOtakuNews },
  crunchyroll: { name: 'Crunchyroll', fetch: fetchCrunchyroll },
  animeherald: { name: 'Anime Herald', fetch: fetchAnimeHerald },
  comicbook: { name: 'Comic Book', fetch: fetchComicBook }
};

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateRSS(articles, source) {
  const now = new Date().toUTCString();
  const sourceLabel = source === 'all' ? 'All Sources' : SOURCES[source]?.name || source;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(APP_NAME)} - ${escapeXml(sourceLabel)}</title>
    <description>Latest anime news from ${escapeXml(sourceLabel)}</description>
    <link>https://aninewsapi.vercel.app</link>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>${APP_NAME} v${APP_VERSION}</generator>
`;
  for (const a of articles) {
    const pubDate = new Date(a.date).toUTCString();
    const cats = (a.tags || []).map(t => `      <category>${escapeXml(t)}</category>`).join('\n');
    xml += `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(a.link)}</link>
      <description>${escapeXml(a.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(a.link)}</guid>
      <source url="https://aninewsapi.vercel.app/api/news?source=${encodeURIComponent(a.source.toLowerCase().replace(/\s+/g, ''))}">${escapeXml(a.source)}</source>
${cats}
`;
    if (a.image) xml += `      <media:thumbnail url="${escapeXml(a.image)}"/>\n`;
    xml += `    </item>\n`;
  }
  xml += `  </channel>\n</rss>`;
  return xml;
}

module.exports = async (req, res) => {
  const startTime = Date.now();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const source = req.query.source?.toLowerCase() || 'all';
    const limit = Math.min(Math.max(parseInt(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const cacheKey = `news_${source}`;
    let articles = cacheHandler.get(cacheKey);

    if (!articles || articles.length === 0) {
      const fetchPromises = [];
      if (source === 'all') {
        Object.entries(SOURCES).forEach(([key, config]) => { fetchPromises.push(config.fetch().catch(() => [])); });
      } else if (SOURCES[source]?.fetch) {
        fetchPromises.push(SOURCES[source].fetch().catch(() => []));
      } else {
        return res.status(400).json({ success: false, error: 'Invalid source', timestamp: new Date().toISOString() });
      }
      const results = await Promise.allSettled(fetchPromises);
      articles = [];
      results.forEach(r => { if (r.status === 'fulfilled') articles = articles.concat(r.value || []); });
      if (articles.length > 0) cacheHandler.set(cacheKey, articles, 600);
    }

    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const rssXml = generateRSS(articles.slice(0, limit), source);
    const responseTime = Date.now() - startTime;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(200).send(rssXml);
  } catch (error) {
    console.error('[RSS API] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate RSS feed', message: error.message, timestamp: new Date().toISOString() });
  }
};
