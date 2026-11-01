import express from "express";
import {
  extractTiktokImages,
  isTiktokUrl,
  resolveTiktokUrl,
} from "../services/scraper.js";

const router = express.Router();

// TODO: POST /api/scrape -> création file d'attente pour
// router.post("/", (req, res) => {});

// TODO: GET /api/scrape/:id -> récupérer infos file d'attente
// router.get("/:id", (req, res) => {});

// TODO: DELETE /api/scrape/:id -> annule une tâche si en attente
// router.delete("/:id", (req, res) => {});

// EX: GET /api/images?url=https://www.tiktok.com/@user/photo/123
router.get("/", async (req, res) => {
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

export default router;
