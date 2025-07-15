import fs from "fs";
import path from "path";
import { fetchCrunchyrollNews } from "./fetchCrunchyroll";
import { fetchANNNews } from "./fetchANN";

export async function getCachedNews(limit = 10, source = "all") {
  const filePath = path.join(process.cwd(), "data", "news.json");
  const now = Date.now();

  // Try using cached file if recent
  if (fs.existsSync(filePath)) {
    const file = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const cachedTime = new Date(file.timestamp).getTime();

    if (now - cachedTime < 1000 * 60 * 10) {
      // Filter sources
      const filtered = file.data.filter(n =>
        source === "all" ? true : n.source === source
      );
      return filtered.slice(0, limit);
    }
  }

  // Else fetch live and store
  let combined = [];

  if (source === "crunchyroll" || source === "all") {
    const cr = await fetchCrunchyrollNews(limit);
    combined.push(...cr);
  }

  if (source === "ann" || source === "all") {
    const ann = await fetchANNNews(limit);
    combined.push(...ann);
  }

  // Save to cache
  const payload = {
    timestamp: new Date().toISOString(),
    data: combined
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return combined.slice(0, limit);
}
