import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "❌ Slug is required."
    });
  }

  try {
    const url = `https://www.crunchyroll.com/news/${slug}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $("h1").text().trim();
    const date = $(".publish-date").first().text().trim();
    const paragraphs = [];
    $(".news-content p").each((_, el) => {
      paragraphs.push($(el).text().trim());
    });

    res.status(200).json({
      success: true,
      slug,
      title,
      date,
      content: paragraphs,
      source: url,
      creator: "Shinei Nouzen",
      github: "https://github.com/shineii86",
      telegram: "https://telegram.me/shineii86",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch article",
      error: err.message
    });
  }
}
