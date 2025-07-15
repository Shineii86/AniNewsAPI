# 📄 API Documentation

## Base URL
```
https://aninews.vercel.app/api/news
```

---

## Endpoints

### 1. GET `/api/news`
Fetch latest anime news articles.

| Query        | Type     | Default   | Description                                |
|--------------|----------|-----------|--------------------------------------------|
| `limit`      | number   | `10`      | Max number of articles to return           |
| `sort`       | string   | `latest`  | `latest` or `oldest`                       |
| `source`     | string   | `all`     | `crunchyroll`, `ann`, or `all`             |

**Example Request**
```
GET /api/news?source=crunchyroll&limit=5&sort=oldest
```

**Example Response**
```json
{
  "success": true,
  "count": 5,
  "data": [ /* array of article objects */ ],
  "creator": "Shinei Nouzen",
  "timestamp": "2025-07-15T10:00:00Z"
}
```

---

### 2. GET `/api/news/tags`
Filter articles by tag (Crunchyroll only).

| Query   | Type   | Default | Description             |
| ------- | ------ | ------- | ----------------------- |
| `tag`   | string | —       | Tag name (e.g. `games`) |
| `limit` | number | `20`    | Max articles to return  |

**Example Request**
```
GET /api/news/tags?tag=anime
```

---

### 3. GET `/api/news/:slug`
Fetch full content of a single article by its slug.

**Example Request**
```
GET /api/news/demon-slayer-season-4-announced
```

---

## Response Object
Each article object contains:
* `title` (string)
* `summary` (string, Crunchyroll only)
* `link` (string)
* `date` (string)
* `image` (string, Crunchyroll only)
* `tags` (string[], Crunchyroll only)
* `source` (`crunchyroll` or `ann`)
* `content` (string[] for full article)

---

## Error Handling
* Returns HTTP 200 with `success: false` if no results
* Returns HTTP 500 on server or scraping errors

---

<a href="https://github.com/Shineii86/AniRecommendAPI">
<img src="https://github.com/Shineii86/AniPay/blob/main/Source/Banner6.png" alt="Banner">
</a>

<div align="center">

  *Last updated: 15 July 2025*  
  *For inquiries or collaborations*
     
[![Telegram Badge](https://img.shields.io/badge/-Telegram-2CA5E0?style=flat&logo=Telegram&logoColor=white)](https://telegram.me/Shineii86 "Contact on Telegram")
[![Instagram Badge](https://img.shields.io/badge/-Instagram-C13584?style=flat&logo=Instagram&logoColor=white)](https://instagram.com/ikx7.a "Follow on Instagram")
[![Pinterest Badge](https://img.shields.io/badge/-Pinterest-E60023?style=flat&logo=Pinterest&logoColor=white)](https://pinterest.com/ikx7a "Follow on Pinterest")
[![Gmail Badge](https://img.shields.io/badge/-Gmail-D14836?style=flat&logo=Gmail&logoColor=white)](mailto:ikx7a@hotmail.com "Send an Email")

  <sup><b>Copyright © 2025 <a href="https://telegram.me/Shineii86">Shinei Nouzen</a> All Rights Reserved</b></sup>

</div>
