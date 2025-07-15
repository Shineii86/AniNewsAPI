// utils/fetchCrunchyroll.js
import axios from "axios";
import cheerio from "cheerio";

export async function fetchCrunchyrollNews() {
  const { data } = await axios.get("https://www.crunchyroll.com/news");
  const $ = cheerio.load(data);
  const articles = [];

  $("a.cr-news-card").each((i, el) => {
    const title = $(el).find(".card-title").text().trim();
    const link = "https://www.crunchyroll.com" + $(el).attr("href");
    const image = $(el).find("img").attr("src");
    const slug = link.split("/").filter(Boolean).pop();
    const date = $(el).find(".card-date").text().trim();

    if (title && link) {
      articles.push({ title, link, image, date, source: "Crunchyroll", slug });
    }
  });

  return articles;
}
