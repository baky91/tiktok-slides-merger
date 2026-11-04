import { createCache } from "./cache.js";

const API_KEY = process.env.RAPIDAPI_API_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

const UNAVAILABLE_TEXT =
  "The service is temporarily unavailable. Please try again later.";
const UNREACHABLE_TEXT = "We could not reach the service. Please try again.";
const TIMEOUT_TEXT = "This is taking too long. Please try again in a moment.";

const cache = createCache({ ttlMs: 10 * 60 * 1000, maxEntries: 500 });
const inFlight = new Map();

export class TiktokApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function fetchCarousel(postId) {
  const cached = cache.get(postId);
  if (cached) {
    // console.log(`Get response from cache (${postId})`);
    return Promise.resolve(cached);
  }

  if (inFlight.has(postId)) {
    // console.log(`Request in-flight (${postId})`);
    return inFlight.get(postId);
  }

  const promise = fetchFromApi(postId)
    .then((carousel) => {
      cache.set(postId, carousel);
      return carousel;
    })
    .finally(() => inFlight.delete(postId));

  inFlight.set(postId, promise);
  return promise;
}

async function fetchFromApi(postId) {
  // Only the network call is wrapped: errors thrown below keep their own type
  let response;
  try {
    response = await fetch(`${API_HOST}/api/post/detail?videoId=${postId}`, {
      headers: {
        "x-rapidapi-key": API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (e) {
    console.error(`RapidAPI request failed (post ${postId}):`, e.message);
    if (e.name === "TimeoutError") {
      throw new TiktokApiError(504, TIMEOUT_TEXT);
    }
    throw new TiktokApiError(502, UNREACHABLE_TEXT);
  }

  const statusCode = response.status;

  if (statusCode !== 200) {
    throw errorFromStatus(statusCode);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error(
      `RapidAPI returned an unreadable response (post ${postId}):`,
      e.message,
    );
    throw new TiktokApiError(502, UNREACHABLE_TEXT);
  }

  const responseImages = data?.itemInfo?.itemStruct?.imagePost?.images ?? [];

  // Entries without a link are dropped, so the list never contains null
  const images = responseImages
    .map((imgObj) => imgObj.imageURL?.urlList?.[0])
    .filter(Boolean);

  if (images.length === 0) {
    throw new TiktokApiError(
      404,
      "Images not found, the post is probably not a carousel.",
    );
  }

  return {
    postId: postId,
    description: data.itemInfo.itemStruct.desc,
    images: images,
  };
}

function errorFromStatus(status) {
  switch (status) {
    case 400:
      return new TiktokApiError(404, "This post could not be found.");
    case 401:
      console.error("RapidAPI rejected the API key (401)");
      return new TiktokApiError(503, UNAVAILABLE_TEXT);
    case 403:
      console.error("No RapidAPI subscription for this API key (403)");
      return new TiktokApiError(503, UNAVAILABLE_TEXT);
    case 429:
      console.error("RapidAPI quota or rate limit reached (429)");
      return new TiktokApiError(503, UNAVAILABLE_TEXT);
    default:
      console.error(`RapidAPI answered with status ${status}`);
      return new TiktokApiError(502, UNREACHABLE_TEXT);
  }
}
