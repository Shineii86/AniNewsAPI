import { getCachedNews } from "../../utils/cacheNews";

export default async function handler(req, res) {
  const { limit = 10, sort = "latest", source = "all" } = req.query;

  try {
    const news = await getCachedNews(parseInt(limit), source.toLowerCase());

    if (!news.length) {
      return res.status(200).json({
        success: false,
        message: "⚠️ No news found. Try again later.",
        creator: "Shinei Nouzen",
        github: "https://github.com/shineii86",
        telegram: "https://telegram.me/shineii86",
        timestamp: new Date().toISOString()
      });
    }

    const sorted = sort === "oldest" ? news.reverse() : news;

    res.status(200).json({
      success: true,
      count: sorted.length,
      data: sorted,
      creator: "Shinei Nouzen",
      github: "https://github.com/shineii86",
      telegram: "https://telegram.me/shineii86",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch news.",
      error: err.message
    });
  }
}
