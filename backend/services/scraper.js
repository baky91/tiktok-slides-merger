import { chromium } from "playwright";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function isTiktokUrl(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "tiktok.com" || hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

// Converts a short link (vm.tiktok.com, vt.tiktok.com) into a www.tiktok.com link
// by manually following the HTTP redirects
export async function resolveTiktokUrl(tiktokUrl) {
  let currentUrl = tiktokUrl;

  for (let hop = 0; hop < 5; hop++) {
    const { hostname } = new URL(currentUrl);
    if (hostname === "www.tiktok.com" || hostname === "tiktok.com") {
      break;
    }

    const response = await fetch(currentUrl, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT },
    });
    const location = response.headers.get("location");
    if (!location) {
      break;
    }
    currentUrl = new URL(location, currentUrl).href;
  }

  // Strip tracking parameters (?_r=1, is_from_webapp, ...)
  const url = new URL(currentUrl);
  url.search = "";

  // An invalid short link redirects to the home page
  // valid path example: /@user/photo/123
  if (!/^\/@[^/]+\/(photo|video)\/\d+/.test(url.pathname)) {
    throw new Error("Invalid or expired TikTok link");
  }

  return url.href;
}

export async function extractTiktokImages(tiktokUrl) {
  // Launch the browser in "headless" mode
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();

  try {
    console.log(`Navigating to: ${tiktokUrl}`);

    // Navigate to the URL with a 30 second timeout
    await page.goto(tiktokUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page
      .waitForSelector("#__UNIVERSAL_DATA_FOR_REHYDRATION__, #SIGI_STATE", {
        state: "attached",
        timeout: 15000,
      })
      .catch(() => {});

    // Extract the data TikTok injects into the page
    const tiktokData = await page.evaluate(() => {
      const scriptTag =
        document.getElementById("__UNIVERSAL_DATA_FOR_REHYDRATION__") ||
        document.getElementById("SIGI_STATE");
      if (scriptTag) {
        return JSON.parse(scriptTag.textContent);
      }
      return null;
    });

    if (!tiktokData) {
      throw new Error(
        "Could not find the structured page data. TikTok may have blocked the request",
      );
    }

    // Retrieve the post and its images
    const item = findItem(tiktokData);
    if (!item) {
      throw new Error("No post found in the page data");
    }

    const images = (item.imagePost?.images ?? [])
      .map((image) => image.imageURL?.urlList?.[0])
      .filter(Boolean);

    if (images.length === 0) {
      throw new Error("This post is not an image carousel");
    }

    return {
      id: item.id,
      author: item.author?.uniqueId ?? item.author ?? null,
      description: item.desc ?? "",
      images,
    };
  } catch (error) {
    console.error("Extraction Error:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// TikTok exposes two formats depending on the page version
function findItem(data) {
  // Recent format: __UNIVERSAL_DATA_FOR_REHYDRATION__
  const detail = data.__DEFAULT_SCOPE__?.["webapp.video-detail"];
  if (detail?.itemInfo?.itemStruct) {
    return detail.itemInfo.itemStruct;
  }

  // Legacy format: SIGI_STATE
  const items = Object.values(data.ItemModule ?? {});
  return items[0] ?? null;
}
