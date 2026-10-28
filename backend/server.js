import express from "express";
import path from "node:path";
import { extractTiktokImages, resolveTiktokUrl } from "./scrapper.js";
import { fileURLToPath } from "node:url";

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
