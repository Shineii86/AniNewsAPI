# 🤝 Contributing to AniNewsAPI

Thanks for your interest in contributing! Here's how to get started.

---

## 🚀 Quick Start

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/AniNewsAPI.git
cd AniNewsAPI

# Install dependencies
npm install

# Start local server
npm run dev
# → http://localhost:3000
```

---

## 📋 Ways to Contribute

### 🐛 Report Bugs
- Use [GitHub Issues](https://github.com/Shineii86/AniNewsAPI/issues/new?template=bug_report.md)
- Include steps to reproduce, expected vs actual behavior
- Mention your Node.js version and OS

### 💡 Suggest Features
- Open a [Feature Request](https://github.com/Shineii86/AniNewsAPI/issues/new?template=feature_request.md)
- Explain the use case and expected behavior

### 🔧 Submit Code
1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Test locally: `npm test`
5. Commit with a clear message: `git commit -m "feat: add my feature"`
6. Push and open a Pull Request

---

## 📰 Adding a New News Source

This is the most common contribution. Here's the exact process:

### 1. Create the scraper

Create `utils/fetchMySource.js`:

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const generateSlug = require('./generateSlug');
const { parseDate } = require('./dateParser');

const SOURCE_NAME = 'My Source';

async function fetchMySource() {
  try {
    const { data } = await axios.get('https://example.com/news', {
      timeout: 15000,
      headers: { 'User-Agent': 'AniNewsAPI/4.0' }
    });

    const $ = cheerio.load(data);
    const articles = [];

    $('article').each((i, el) => {
      const title = $(el).find('h2').text().trim();
      const link = $(el).find('a').attr('href');
      const excerpt = $(el).find('p').text().trim();
      const image = $(el).find('img').attr('src');
      const date = parseDate($(el).find('time').text());

      if (title && link) {
        articles.push({
          title,
          slug: generateSlug(title, SOURCE_NAME),
          source: SOURCE_NAME,
          excerpt: excerpt?.slice(0, 200) || '',
          date: date || new Date().toISOString(),
          image: image || '',
          link: link.startsWith('http') ? link : `https://example.com${link}`,
          tags: ['news', 'anime']
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`[${SOURCE_NAME}] Error:`, error.message);
    return [];
  }
}

module.exports = fetchMySource;
```

### 2. Register the source

In `api/news.js`, add to the `SOURCES` object:

```javascript
const fetchMySource = require('../utils/fetchMySource');

const SOURCES = {
  // ... existing sources ...
  mysource: { name: 'My Source', fetch: fetchMySource },
};
```

### 3. Test

```bash
npm run dev
curl "http://localhost:3000/api/news?source=mysource&limit=5"
```

### 4. Submit

```bash
git add utils/fetchMySource.js api/news.js
git commit -m "feat: add My Source as news source"
```

---

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use |
|--------|-----|
| `feat:` | New feature or source |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes nor adds |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance (deps, config) |

Examples:
- `feat: add Anime News Network RSS fallback`
- `fix: handle missing image in Crunchyroll scraper`
- `docs: update README architecture diagram`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test against production
API_URL=https://aninews.vercel.app npm test
```

All endpoints are tested. If you add a new endpoint, add a test case in `test.js`.

---

## 📁 Project Structure

```
AniNewsAPI/
├── api/                    # Serverless API functions
│   ├── news.js             # Main news endpoint
│   ├── search.js           # Keyword search
│   ├── rss.js              # RSS feed
│   ├── stream.js           # SSE
│   ├── openapi.js          # OpenAPI spec
│   └── ...
├── utils/                  # Core logic
│   ├── fetch*.js           # Source scrapers (add yours here)
│   ├── cacheHandler.js     # Cache layer
│   ├── constants.js        # Shared config
│   └── ...
├── public/                 # Static files
│   ├── index.html          # Landing page
│   ├── tos.html            # Terms of Service
│   ├── privacy.html        # Privacy Policy
│   └── ...
├── server.js               # Express server (local dev)
├── test.js                 # Test suite
└── vercel.json             # Vercel config
```

---

## ❓ Questions?

- [GitHub Discussions](https://github.com/Shineii86/AniNewsAPI/discussions)
- [Telegram](https://telegram.me/shineii86)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
