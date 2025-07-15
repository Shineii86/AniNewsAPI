// utils/cacheNews.js
import fs from "fs";
import path from "path";
import { fetchCrunchyrollNews } from "./fetchCrunchyroll";
import { fetchANNNews } from "./fetchANN";

const filePath = path.join(process.cwd(), "data", "news.json");

export async function getCachedNews(limit = 10, source = "all") {
  const maxAge = 10 * 60 * 1000; // 10 minutes
  let cache = [];

  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const isFresh = Date.now() - stat.mtimeMs < maxAge;

      if (isFresh) {
        const raw = fs.readFileSync(filePath, "utf8");
        cache = JSON.parse(raw);
      }
    }

    if (!cache.length) {
      const [crunchyroll, ann] = await Promise.all([
        fetchCrunchyrollNews(),
        fetchANNNews(),
      ]);

      cache = [...crunchyroll, ...ann];
      fs.writeFileSync(filePath, JSON.stringify(cache, null, 2), "utf8");
    }

    const filtered =
      source === "crunchyroll"
        ? cache.filter(n => n.source === "Crunchyroll")
        : source === "ann"
        ? cache.filter(n => n.source === "AnimeNewsNetwork")
        : cache;

    return filtered.slice(0, limit);
  } catch (err) {
    return [];
  }
}
