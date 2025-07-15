const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');

module.exports = {
  parseContent: async (url) => {
    try {
      // Use Puppeteer for JS-rendered sites
      if (url.includes('crunchyroll')) {
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: process.env.CHROME_EXECUTABLE_PATH
        });
        
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        
        const content = await page.evaluate(() => {
          return document.querySelector('.article-body')?.innerHTML || '';
        });
        
        await browser.close();
        return content;
      }
      
      // Traditional HTML parsing
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      if (url.includes('animenewsnetwork')) {
        return $('.news-content').html();
      }
      
      return $('article').html() || $('.content').html() || '';
    } catch (error) {
      console.error(`Content parse error for ${url}:`, error);
      return '';
    }
  }
};
