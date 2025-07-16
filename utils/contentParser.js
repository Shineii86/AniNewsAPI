const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');

// Improved content extraction
module.exports = {
  parseContent: async (url) => {
    try {
      // Special handling for Crunchyroll
      if (url.includes('crunchyroll')) {
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const content = await page.evaluate(() => {
          // Try multiple selectors
          return document.querySelector('.article-body, .content, article')?.innerHTML || '';
        });
        
        await browser.close();
        return content;
      }
      
      // Traditional HTML parsing for other sites
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      
      if (url.includes('animenewsnetwork')) {
        return $('.news-content').html();
      }
      
      if (url.includes('animecorner')) {
        return $('.entry-content').html();
      }
      
      // Fallback to common content areas
      return $('article').html() || $('.content').html() || $('.post-content').html() || '';
    } catch (error) {
      console.error(`Content parse error for ${url}:`, error.message);
      return `<p>Unable to retrieve content. <a href="${url}" target="_blank">View original article</a></p>`;
    }
  }
};
