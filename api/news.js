import { getCachedNews } from "../utils/cacheNews";

export default async function handler(req, res) {
  const { limit = 10, sort = "latest", source = "all" } = req.query;

  try {
    const news = await getCachedNews(parseInt(limit), source.toLowerCase());

    if (!news.length) {
      return res.status(200).json({
        success: false,
        message: "⚠️ No news found. Try again later.",
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
    }

    const sorted = sort === "oldest" ? [...news].reverse() : news;

    res.status(200).json({
      success: true,
      count: sorted.length,
      data: sorted,
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
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch news.",
      error: err.message,
      creator: "Shinei Nouzen",
      github: "https://github.com/Shineii86",
      telegram: "https://telegram.me/Shineii86",
      message: "Build with ❤️ by Shinei Nouzen",
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true
      })
    });
  }
}
