import { createServer } from "node:http";
import { extractTiktokImages, resolveTiktokUrl } from "./scrapper.js";

const PORT = Number(process.env.PORT ?? 3001);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    ...CORS_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

function isTiktokUrl(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "tiktok.com" || hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(
    req.url,
    `http://${req.headers.host}`,
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method === "GET" && pathname === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  // GET /api/images?url=https://www.tiktok.com/@user/photo/123
  if (req.method === "GET" && pathname === "/api/images") {
    const tiktokUrl = searchParams.get("url").replace("photo", "video");
    if (!tiktokUrl || !isTiktokUrl(tiktokUrl)) {
      return sendJson(res, 400, {
        error: "Missing or invalid 'url' parameter",
      });
    }

    let resolvedUrl;
    try {
      resolvedUrl = await resolveTiktokUrl(tiktokUrl);
      resolvedUrl = resolvedUrl.replace("photo", "video");
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }

    try {
      const result = await extractTiktokImages(resolvedUrl);
      return sendJson(res, 200, { url: resolvedUrl, ...result });
    } catch (error) {
      return sendJson(res, 502, { error: error.message });
    }
  }

  return sendJson(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Scraping server running on http://localhost:${PORT}`);
});
