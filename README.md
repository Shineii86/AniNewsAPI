# 📰 Anime News API

![Vercel](https://img.shields.io/badge/Deployed%20On-Vercel-black?logo=vercel)
![Scraping](https://img.shields.io/badge/Scraper-Cheerio-yellow?logo=javascript)
![Status](https://img.shields.io/badge/API-Stable-green)
![License](https://img.shields.io/badge/License-MIT-blue)
[![Made By](https://img.shields.io/badge/Made%20by-Shinei%20Nouzen-critical)](https://github.com/Shineii86)

![Last Commit](https://img.shields.io/github/last-commit/Shineii86/AniNewsAPI?style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Shineii86/AniNewsAPI?style=for-the-badge) [![GitHub Stars](https://img.shields.io/github/stars/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/stargazers) [![GitHub Forks](https://img.shields.io/github/forks/Shineii86/AniNewsAPI?style=for-the-badge)](https://github.com/Shineii86/AniNewsAPI/fork)
[![API Status](https://img.shields.io/website?down_color=lightgrey&down_message=offline&label=API%20Status&style=for-the-badge&up_color=green&up_message=online&url=https%3A%2F%2Faninews.vercel.app)](https://aninews.vercel.app)


> 🛰️ A real-time, blazing-fast, tag-filterable Anime News API that fetches fresh articles from [Crunchyroll](https://www.crunchyroll.com/news) and [Anime News Network](https://www.animenewsnetwork.com/), with optional smart caching for reliability.

---

## 📦 Features

- ⚡ **Real-time Scraping** (no database or backend)
- 🔁 **Smart Caching** via `data/news.json` (auto-refresh every 10 min)
- 🏷️ Filter by **tags**
- 📄 Fetch full **article content by slug**
- 🧩 Multi-source support: Crunchyroll + ANN
- 📥 Ready-to-deploy on [Vercel](https://vercel.com)

---

## 📡 API Endpoints 

### `GET /api/news` (Stable)

Returns the latest anime news articles.

#### (Unstable) <s>Query Parameters:

| Param     | Type     | Default     | Description                                  |
|-----------|----------|-------------|----------------------------------------------|
| `limit`   | Number   | `10`        | Max number of articles                       |
| `sort`    | String   | `latest`    | `latest` or `oldest`                         |
| `source`  | String   | `all`       | `crunchyroll`, `ann`, or `all`               |

#### Example:
```http
GET /api/news?source=crunchyroll&limit=5&sort=oldest
````

---

### `GET /api/news/tags?tag=`

Filters Crunchyroll news by tag (e.g. `anime`, `games`, `manga`).

#### Example:

```http
GET /api/news/tags?tag=games
```

---

### `GET /api/news/:slug`

Returns full article content for a specific Crunchyroll news post.

#### Example:

```http
GET /api/news/demon-slayer-kimetsu-no-yaiba-season-3-announced
```
</s>

---

## 🧠 Smart Caching

* Cached to `data/news.json`
* Automatically refreshed **if older than 10 minutes**
* Ensures **faster loads** and **resilience if source fails**

---

## 🚀 How to Use

### 1. 👾 Clone and Install

```bash
git clone https://github.com/Shineii86/AniNewsAPI
cd AniNewsAPI
npm install
```

### 2. 🚗 Run Locally

```bash
npm run dev
# Visit http://localhost:3000/api/news
```

### 3. 🚀 Deploy to Vercel

> 🔗 [https://vercel.com](https://vercel.com)

* Import your GitHub repo to Vercel
* Deploy as serverless functions (no backend needed)
* Done ✅

---

## 💡 Tech Stack

* ⚙️ Node.js + Serverless
* 📦 Vercel Functions
* 🌐 Axios for fetching
* 🧠 Cheerio for parsing
* 🛠️ Zero-database, zero-cache

---

## 📁 Folder Structure

```json
# Main File Structure
AniNewsAPI/
├── data/
│   └── news.json
├── api/
│   ├── news.js
│   └── news/
│       ├── tags.js
│       └── [slug].js
├── utils/
│   ├── fetchCrunchyroll.js
│   ├── fetchANN.js
│   ├── fetchAnimeCorner.js
│   ├── generateSlug.js
│   ├── cacheHandler.js
│   └── contentParser.js
├── vercel.json
├── package.json
└── README.md
```

---

## 🙏 Acknowledgements

* 📰 [Crunchyroll](https://www.crunchyroll.com/news) — official anime news provider
* 📰 [Anime News Network](https://www.animenewsnetwork.com/)
* 🧠 [Cheerio](https://cheerio.js.org/) for scraping the DOM
* ⚙️ [Vercel](https://vercel.com) for easy, free serverless hosting

---

## 📬 Support

* Issues: [GitHub Issues](https://github.com/Shineii86/AniNewsAPI/issues)

## 🪪 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💕 Loved My Work?
🚨 [Follow me on GitHub](https://github.com/Shineii86/Shineii86)

⭐ [Give a star to this project](https://github.com/Shineii86/AniNewsAPI/)

<a href="https://github.com/Shineii86/AniNewsAPI">
<img src="https://github.com/Shineii86/AniPay/blob/main/Source/Banner6.png" alt="Banner">
</a>

## ☎️ Contact

<div align="center">
  
  *For inquiries or collaborations*
     
[![Telegram Badge](https://img.shields.io/badge/-Telegram-2CA5E0?style=flat&logo=Telegram&logoColor=white)](https://telegram.me/Shineii86 "Contact on Telegram")
[![Instagram Badge](https://img.shields.io/badge/-Instagram-C13584?style=flat&logo=Instagram&logoColor=white)](https://instagram.com/ikx7.a "Follow on Instagram")
[![Pinterest Badge](https://img.shields.io/badge/-Pinterest-E60023?style=flat&logo=Pinterest&logoColor=white)](https://pinterest.com/ikx7a "Follow on Pinterest")
[![Gmail Badge](https://img.shields.io/badge/-Gmail-D14836?style=flat&logo=Gmail&logoColor=white)](mailto:ikx7a@hotmail.com "Send an Email")

  <sup><b>Copyright © 2025 <a href="https://telegram.me/Shineii86">Shinei Nouzen</a> All Rights Reserved</b></sup>

</div>
