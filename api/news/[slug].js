import { getCachedNews } from "../../utils/cacheNews";

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    const news = await getCachedNews();
    const article = news.find(n => n.slug === slug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "❌ Article not found.",
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

    res.status(200).json({
      success: true,
      article,
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
      message: "❌ Failed to fetch article.",
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
