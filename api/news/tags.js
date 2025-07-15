// api/news/tags.js
import { getCachedNews } from "../../utils/cacheNews";

export default async function handler(req, res) {
  try {
    const news = await getCachedNews();
    const tags = [...new Set(news.flatMap(n => n.tags || []))];

    res.status(200).json({
      success: true,
      count: tags.length,
      tags,
      timestamp: new Date().toISOString(),
      creator: "Shinei Nouzen",
      github: "https://github.com/Shineii86",
      telegram: "https://telegram.me/Shineii86",
      message: "Build with ❤️ by Shinei Nouzen",
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true
      })
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
