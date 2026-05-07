const axios = require('axios');
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function run() {
  console.log(`\n🧪 AniNewsAPI v3.0.0 Tests\n${'═'.repeat(50)}\n`);
  let passed = 0, failed = 0;

  async function test(name, url, validate) {
    process.stdout.write(`  ${name} ... `);
    try {
      const r = await axios.get(url, { timeout: 60000 });
      if (validate) { const v = validate(r); if (v !== true) { console.log(`❌ ${v}`); failed++; return; } }
      console.log(`✅ (${r.data?.responseTime || '-'})`);
      passed++;
    } catch (e) { console.log(`❌ ${e.response?.status || e.message}`); failed++; }
  }

  await test('Health', `${BASE_URL}/api/health`, r => r.data.version === '3.0.0' ? true : 'version mismatch');
  await test('Stats', `${BASE_URL}/api/stats`, r => r.data.success ? true : 'not successful');
  await test('News (all)', `${BASE_URL}/api/news?limit=3&refresh=true`, r => r.data.data.length > 0 ? true : 'no articles');
  for (const s of ['ann', 'crunchyroll', 'myanimelist', 'animecorner', 'otakuusa', 'animeherald', 'comicbook']) {
    await test(`News (${s})`, `${BASE_URL}/api/news?source=${s}&limit=2`, r => r.data.meta.source === s ? true : 'source mismatch');
  }
  await test('Pagination', `${BASE_URL}/api/news?offset=2&limit=3`, r => r.data.meta.offset === 2 ? true : 'offset mismatch');
  await test('Invalid source → 400', `${BASE_URL}/api/news?source=fake`, r => r.status === 400 ? true : 'expected 400');
  await test('Tags', `${BASE_URL}/api/news/tags`, r => r.data.data.tags ? true : 'no tags');
  await test('Search', `${BASE_URL}/api/search?q=anime&limit=3`, r => r.data.meta.query === 'anime' ? true : 'query mismatch');
  await test('Search too short → 400', `${BASE_URL}/api/search?q=a`, r => r.status === 400 ? true : 'expected 400');
  await test('RSS', `${BASE_URL}/api/rss?limit=3`, r => r.data.includes('<rss') ? true : 'not RSS');
  await test('RSS (crunchyroll)', `${BASE_URL}/api/rss?source=crunchyroll&limit=2`, r => r.data.includes('Crunchyroll') ? true : 'no Crunchyroll');

  console.log(`\n${'═'.repeat(50)}\n  ${passed} passed, ${failed} failed\n${'═'.repeat(50)}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
