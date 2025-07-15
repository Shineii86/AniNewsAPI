import { fetchCrunchyrollNews } from "../../../utils/fetchCrunchyroll";

export default async function handler(req, res) {
  const { tag = "", limit = 20 } = req.query;

  try {
    const news = await fetchCrunchyrollNews(limit);
    const filtered = news.filter(item =>
      item.tags?.includes(tag.toLowerCase())
    );

    if (!filtered.length) {
      return res.status(200).json({
        success: false,
        message: `⚠️ No news found with tag "${tag}"`,
        creator: "Shinei Nouzen",
        github: "https://github.com/shineii86",
        telegram: "https://telegram.me/shineii86",
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      tag,
      count: filtered.length,
      data: filtered,
      creator: "Shinei Nouzen",
      github: "https://github.com/shineii86",
      telegram: "https://telegram.me/shineii86",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch by tag",
      error: err.message
    });
  }
}
