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
      signal: AbortSignal.timeout(5000),
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

  return url;
}
