// utils/fetchANN.js
import axios from "axios";
import cheerio from "cheerio";

export async function fetchANNNews() {
  const { data } = await axios.get("https://www.animenewsnetwork.com/news");
  const $ = cheerio.load(data);
  const articles = [];

  $("div.herald.box.news").each((i, el) => {
    const title = $(el).find("h3").text().trim();
    const link = "https://www.animenewsnetwork.com" + $(el).find("a").attr("href");
    const date = $(el).find(".date").text().trim();
    const slug = link.split("/").filter(Boolean).pop();

    if (title && link) {
      articles.push({ title, link, date, source: "AnimeNewsNetwork", slug });
    }
  });

  return articles;
}
