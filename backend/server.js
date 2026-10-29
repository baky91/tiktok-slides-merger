import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { extractTiktokImages, resolveTiktokUrl } from "./scrapper.js";
import { fileURLToPath } from "node:url";
import {
  LAYOUTS,
  MAX_IMAGES,
  MAX_SPACING,
  mergeImages,
  QUALITY_PRESETS,
} from "./image-builder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const app = express();
app.use(express.json());

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

// Validates the merge request body, filling in defaults for missing options
function parseMergeBody(body) {
  const {
    images,
    layout = "grid",
    columns = 2,
    spacing = 0,
    background = "#ffffff",
    qualityPreset = "high",
  } = body ?? {};

  if (
    !Array.isArray(images) ||
    images.length === 0 ||
    images.length > MAX_IMAGES ||
    !images.every(
      (image) => typeof image === "string" && image.startsWith("https://"),
    )
  ) {
    return {
      error: `'images' must be a list of 1 to ${MAX_IMAGES} https URLs`,
    };
  }
  if (!LAYOUTS.includes(layout)) {
    return { error: `'layout' must be one of: ${LAYOUTS.join(", ")}` };
  }
  if (!Number.isInteger(columns) || columns < 1) {
    return { error: "'columns' must be a positive integer" };
  }
  if (!Number.isInteger(spacing) || spacing < 0 || spacing > MAX_SPACING) {
    return {
      error: `'spacing' must be an integer between 0 and ${MAX_SPACING}`,
    };
  }
  if (typeof background !== "string" || !/^#[0-9a-f]{6}$/i.test(background)) {
    return { error: "'background' must be a hex color like #ffffff" };
  }
  const preset = QUALITY_PRESETS[String(qualityPreset).toLowerCase()];
  if (!preset) {
    return {
      error: `'qualityPreset' must be one of: ${Object.keys(QUALITY_PRESETS).join(", ")}`,
    };
  }

  return {
    images,
    options: { layout, columns, spacing, background, ...preset },
  };
}

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
