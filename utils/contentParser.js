const axios = require('axios');
const cheerio = require('cheerio');
const he = require('he');

/**
 * Content extraction for full article reading
 */
module.exports = {
  parseContent: async (url) => {
    try {
      console.log(`[Parser] Parsing content from: ${url}`);
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 20000,
        maxRedirects: 5
      });
      
      const $ = cheerio.load(data);
      let content = '';
      let title = '';
      let author = '';
      let publishDate = '';
      
      // Extract title
      title = $('h1').first().text().trim() || 
              $('h2').first().text().trim() || 
              $('title').text().trim();
      
      // Extract author
      author = $('.author, .byline, [rel="author"], .writer').first().text().trim();
      
      // Extract publish date
      publishDate = $('time').attr('datetime') || 
                    $('.date, .publish-date, .posted-on').first().text().trim();
      
      // Site-specific content extraction
      if (url.includes('animenewsnetwork.com')) {
        content = $('.news-content, .article-content, .content-body').html() || '';
      } else if (url.includes('animecorner.me')) {
        content = $('.entry-content, .post-content, article').html() || '';
      } else if (url.includes('myanimelist.net')) {
        content = $('.news-unit .text, .content, article').html() || '';
      } else if (url.includes('otakuusamagazine.com')) {
        content = $('.entry-content, .post-content, article').html() || '';
      } else if (url.includes('crunchyroll.com')) {
        content = $('.article-body, .content-body, article').html() || '';
      } else if (url.includes('animeherald.com')) {
        content = $('.entry-content, .post-content').html() || '';
      } else if (url.includes('comicbook.com')) {
        content = $('.article-body, .content-body').html() || '';
      } else {
        // Fallback to common content areas
        content = $('article').html() || 
                  $('.content').html() || 
                  $('.post-content').html() || 
                  $('.entry-content').html() || 
                  $('.article-content').html() || '';
      }
      
      // Clean up content
      if (content) {
        // Remove script and style tags
        const $content = cheerio.load(content);
        $content('script, style, iframe, nav, header, footer, aside').remove();
        
        // Remove empty paragraphs
        $content('p').each((i, el) => {
          if ($(el).text().trim() === '') {
            $(el).remove();
          }
        });
        
        content = $content.html();
        
        // Decode HTML entities
        content = he.decode(content);
        
        // Clean up whitespace
        content = content.replace(/\n\s*\n/g, '\n').trim();
      }
      
      // If still no content, try to get text
      if (!content) {
        content = `<p>${$('article, .content, .post').first().text().substring(0, 2000)}...</p>`;
      }
      
      return {
        title,
        author,
        publishDate,
        content,
        url
      };
    } catch (error) {
      console.error(`[Parser] Error parsing ${url}:`, error.message);
      return {
        title: '',
        author: '',
        publishDate: '',
        content: `<p>Unable to retrieve full content. <a href="${url}" target="_blank" rel="noopener noreferrer">View original article</a></p>`,
        url,
        error: error.message
      };
    }
  },
  
  /**
   * Extract plain text from HTML content
   */
  extractText: (html) => {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim();
  },
  
  /**
   * Extract images from content
   */
  extractImages: (html) => {
    if (!html) return [];
    const $ = cheerio.load(html);
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        images.push(src.startsWith('//') ? `https:${src}` : src);
      }
    });
    return images;
  }
};
