import express from "express";
import { isTiktokUrl, resolveTiktokUrl } from "../utils/tiktok-url.js";

const API_KEY = process.env.RAPIDAPI_API_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

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
    postId = resolvedUrl.pathname.split("/").at(-1);
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const response = await fetch(
      `${API_HOST}/api/post/detail?videoId=${postId}`,
      {
        headers: {
          "x-rapidapi-key": API_KEY,
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    const data = await response.json();

    const responseImages = data.itemInfo.itemStruct.imagePost.images;
    const images = responseImages.map((imgObj) => {
      return imgObj.imageURL.urlList[0];
    });

    return res.status(200).json({
      postId: postId,
      description: data.itemInfo.itemStruct.desc,
      images: images,
    });
  } catch (e) {
    const status = e.message.includes("timeout") ? 502 : 400;
    return res.status(status).json({ error: e.message });
  }
});

export default router;
