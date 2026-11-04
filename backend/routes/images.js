import express from "express";
import { isTiktokUrl, resolveTiktokUrl } from "../utils/tiktok-url.js";
import { fetchCarousel, TiktokApiError } from "../services/tiktok-api.js";

const router = express.Router();

// EX: GET /api/images?url=https://www.tiktok.com/@user/photo/123
router.get("/", async (req, res) => {
  const tiktokUrl = req.query.url;

  if (!tiktokUrl || !isTiktokUrl(tiktokUrl)) {
    return res.status(400).json({
      error: "Missing or invalid 'url' parameter",
    });
  }

  let postId;
  try {
    const resolvedUrl = await resolveTiktokUrl(tiktokUrl);

    // pathname format : /@user/video/<postId>
    // Remove the possible '/' at the end of the pathname
    let pathname = resolvedUrl.pathname;
    pathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    postId = pathname.split("/").at(-1);
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const data = await fetchCarousel(postId);
    return res.status(200).json(data);
  } catch (e) {
    // Errors we raised ourselves carry a message that is safe to show
    if (e instanceof TiktokApiError) {
      return res.status(e.status).json({ error: e.message });
    }

    // Anything else is a bug: log it, but never show its text to the user
    console.error("Unexpected error in GET /api/images:", e);
    return res.status(500).json({ error: "Something went wrong on our side." });
  }
});

export default router;
