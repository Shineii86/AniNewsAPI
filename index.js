import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "public", "index.html");
  const html = fs.readFileSync(filePath, "utf8");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
