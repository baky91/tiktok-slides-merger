import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { extractTiktokImages, resolveTiktokUrl } from "./scrapper.js";
import { fileURLToPath } from "node:url";
import { mergeImages } from "./image-builder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const app = express();

function isTiktokUrl(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "tiktok.com" || hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

// EX: GET /api/images?url=https://www.tiktok.com/@user/photo/123
app.get("/api/images", async (req, res) => {
  const tiktokUrl = req.query.url;

  if (!tiktokUrl || !isTiktokUrl(tiktokUrl)) {
    return res.status(400).json({
      error: "Missing or invalid 'url' parameter",
    });
  }

  let resolvedUrl;
  try {
    resolvedUrl = await resolveTiktokUrl(tiktokUrl);
    resolvedUrl = resolvedUrl.replace("photo", "video");
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const result = await extractTiktokImages(resolvedUrl);
    return res.status(200).json({
      url: resolvedUrl,
      ...result,
    });
  } catch (e) {
    const status = e.message.includes("timeout") ? 502 : 400;
    return res.status(status).json({ error: e.message });
  }
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

let images = [
  "images/1.jpeg",
  "images/2.jpeg",
  "images/3.jpeg",
  "images/4.jpeg",
  "images/5.jpeg",
  "images/6.jpeg",
  "images/7.jpeg",
  "images/8.jpeg",
  "images/9.jpeg",
  "images/9.jpeg",
];
images = Array.from({ length: 10 }, () => images).flat();

mergeImages(
  images.map((image) => path.join(__dirname, image)),
  { layout: "grid", columns: 10 },
)
  .then(({ buffer }) =>
    fs.writeFile(path.join(__dirname, "images/merged.jpeg"), buffer),
  )
  .catch((e) => console.error("Merge failed:", e));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
