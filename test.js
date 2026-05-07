const axios = require('axios');
const { APP_VERSION } = require('./utils/constants');
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function run() {
  console.log(`\n🧪 AniNewsAPI v${APP_VERSION} Tests\n${'═'.repeat(50)}\n`);
  let passed = 0, failed = 0;

  async function test(name, url, validate, opts = {}) {
    process.stdout.write(`  ${name} ... `);
    try {
      const r = await axios.get(url, { timeout: 60000, validateStatus: () => true, ...opts });
      if (validate) { const v = validate(r); if (v !== true) { console.log(`❌ ${v}`); failed++; return; } }
      console.log(`✅ (${r.data?.responseTime || r.headers?.['x-response-time'] || '-'})`);
      passed++;
    } catch (e) { console.log(`❌ ${e.response?.status || e.message}`); failed++; }
  }

  // Core endpoints
  await test('Health', `${BASE_URL}/api/health`, r => r.data.version === APP_VERSION ? true : `version mismatch: ${r.data.version}`);
  await test('Stats', `${BASE_URL}/api/stats`, r => r.data.success ? true : 'not successful');

  // News
  await test('News (all)', `${BASE_URL}/api/news?limit=3&refresh=true`, r => r.data.data?.length > 0 ? true : 'no articles');
  for (const s of ['ann', 'crunchyroll', 'myanimelist', 'animecorner', 'otakuusa', 'animeherald', 'comicbook']) {
    await test(`News (${s})`, `${BASE_URL}/api/news?source=${s}&limit=2`, r => r.data.meta?.source === s ? true : 'source mismatch');
  }
  await test('Pagination', `${BASE_URL}/api/news?offset=2&limit=3`, r => r.data.meta?.offset === 2 ? true : 'offset mismatch');
  await test('Sort oldest', `${BASE_URL}/api/news?sort=oldest&limit=2`, r => r.data.meta?.sort === 'oldest' ? true : 'sort mismatch');
  await test('Invalid source → 400', `${BASE_URL}/api/news?source=fake`, r => r.status === 400 ? true : `expected 400, got ${r.status}`);

  // Tags
  await test('Tags', `${BASE_URL}/api/news/tags`, r => r.data.data?.tags ? true : 'no tags');

  // Search
  await test('Search', `${BASE_URL}/api/search?q=anime&limit=3`, r => r.data.meta?.query === 'anime' ? true : 'query mismatch');
  await test('Search too short → 400', `${BASE_URL}/api/search?q=a`, r => r.status === 400 ? true : `expected 400, got ${r.status}`);

  // RSS
  await test('RSS', `${BASE_URL}/api/rss?limit=3`, r => r.data.includes('<rss') ? true : 'not RSS');
  await test('RSS (crunchyroll)', `${BASE_URL}/api/rss?source=crunchyroll&limit=2`, r => r.data.includes('Crunchyroll') ? true : 'no Crunchyroll');

  // New endpoints
  await test('SSE Stream', `${BASE_URL}/api/stream`, r => r.data.includes('"connected"') ? true : 'no connected event');
  await test('OpenAPI spec', `${BASE_URL}/api/openapi`, r => r.data.openapi === '3.0.3' ? true : 'not openapi 3.0.3');

  // Landing page
  await test('Landing page', `${BASE_URL}/`, r => r.status === 200 && r.headers['content-type']?.includes('html') ? true : 'not HTML');

  // 404
  await test('404 JSON', `${BASE_URL}/api/nonexistent`, r => r.status === 404 && r.data.error === 'Not found' ? true : 'bad 404');

  console.log(`\n${'═'.repeat(50)}\n  ${passed} passed, ${failed} failed\n${'═'.repeat(50)}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
