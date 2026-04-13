/**
 * Simple test script for Anime News API
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`URL: ${url}`);
  
  try {
    const start = Date.now();
    const response = await axios.get(url, { timeout: 30000 });
    const duration = Date.now() - start;
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`⏱️  Response time: ${duration}ms`);
    
    if (response.data.success) {
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`📰 Articles: ${response.data.data.length}`);
        if (response.data.data.length > 0) {
          const first = response.data.data[0];
          console.log(`   First article: "${first.title?.substring(0, 50)}..."`);
          console.log(`   Source: ${first.source}`);
          console.log(`   Date: ${first.date}`);
        }
      } else if (response.data.data) {
        console.log(`📄 Data:`, typeof response.data.data);
      }
      
      if (response.data.meta) {
        console.log(`📊 Meta:`, JSON.stringify(response.data.meta, null, 2).substring(0, 200));
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           🎌 Anime News API v2.0 Test Suite 🎌            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'Health Check', url: `${BASE_URL}/api/health` },
    { name: 'All News (default)', url: `${BASE_URL}/api/news` },
    { name: 'All News (limit 5)', url: `${BASE_URL}/api/news?limit=5` },
    { name: 'ANN Source', url: `${BASE_URL}/api/news?source=ann&limit=3` },
    { name: 'Anime Corner Source', url: `${BASE_URL}/api/news?source=animecorner&limit=3` },
    { name: 'MyAnimeList Source', url: `${BASE_URL}/api/news?source=myanimelist&limit=3` },
    { name: 'OtakuUSA Source', url: `${BASE_URL}/api/news?source=otakuusa&limit=3` },
    { name: 'Crunchyroll Source', url: `${BASE_URL}/api/news?source=crunchyroll&limit=3` },
    { name: 'Anime Herald Source', url: `${BASE_URL}/api/news?source=animeherald&limit=3` },
    { name: 'Comic Book Source', url: `${BASE_URL}/api/news?source=comicbook&limit=3` },
    { name: 'Tags Endpoint', url: `${BASE_URL}/api/news/tags` },
    { name: 'Stats Endpoint', url: `${BASE_URL}/api/stats` }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    if (result) passed++;
    else failed++;
    
    // Small delay between tests
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      Test Summary                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Passed: ${passed.toString().padStart(2)}                                            ║`);
  console.log(`║  ❌ Failed: ${failed.toString().padStart(2)}                                            ║`);
  console.log(`║  📊 Total:  ${tests.length.toString().padStart(2)}                                            ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
