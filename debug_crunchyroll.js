const axios = require('axios');
const cheerio = require('cheerio');

async function debugCrunchyroll() {
  try {
    const { data } = await axios.get('https://www.crunchyroll.com/news', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    
    console.log('Page title:', $('title').text());
    console.log('News items found:', $('.news-item').length);
    console.log('Featured items found:', $('.news-item--featured').length);
    console.log('Article elements:', $('article').length);
    console.log('H2 elements:', $('h2').length);
    console.log('H3 elements:', $('h3').length);
    
    // Check for different possible selectors
    console.log('\nTesting different selectors:');
    console.log('- .news-item:', $('.news-item').length);
    console.log('- .news-item--featured:', $('.news-item--featured').length);
    console.log('- article:', $('article').length);
    console.log('- .article:', $('.article').length);
    console.log('- [data-testid]:', $('[data-testid]').length);
    
    // Check if it's a React/SPA page
    console.log('\nChecking for React/SPA indicators:');
    console.log('- Script tags:', $('script').length);
    console.log('- __NEXT_DATA__:', data.includes('__NEXT_DATA__'));
    console.log('- React:', data.includes('React'));
    
    // Show first few elements that might contain news
    console.log('\nFirst few divs with classes:');
    $('div[class]').slice(0, 10).each((i, el) => {
      console.log(`- ${$(el).attr('class')}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugCrunchyroll();