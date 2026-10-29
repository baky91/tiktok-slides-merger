import express from "express";
import path from "node:path";
import {
  extractTiktokImages,
  isTiktokUrl,
  resolveTiktokUrl,
} from "./scrapper.js";
import { fileURLToPath } from "node:url";
import { mergeImages, parseMergeBody } from "./image-builder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const app = express();
app.use(express.json());

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

// EX: POST /api/merge { images: [...], layout: "grid", columns: 2, ... }
app.post("/api/merge", async (req, res) => {
  const { error, images, options } = parseMergeBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const { buffer } = await mergeImages(images, options);
    return res
      .status(200)
      .type("image/jpeg")
      .attachment("slidesmerger-export.jpeg")
      .send(buffer);
  } catch (e) {
    console.error("Merge failed:", e);
    return res.status(502).json({ error: e.message });
  }
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
