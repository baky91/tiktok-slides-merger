const API_KEY = process.env.RAPIDAPI_API_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

const UNAVAILABLE_TEXT =
  "The service is temporarily unavailable. Please try again later.";

export class TiktokApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function fetchCarousel(postId) {
  const response = await fetch(
    `${API_HOST}/api/post/detail?videoId=${postId}`,
    {
      headers: {
        "x-rapidapi-key": API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    },
  );

  const statusCode = response.status;

  if (statusCode !== 200) {
    throw errorFromStatus(statusCode);
  }

  const data = await response.json();

  const responseImages = data.itemInfo?.itemStruct?.imagePost?.images;

  if (!responseImages || responseImages.length === 0) {
    throw new TiktokApiError(
      404,
      "Images not found, the post is probably not a carousel.",
    );
  }

  const images = responseImages.map((imgObj) => {
    return imgObj.imageURL.urlList[0];
  });

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
      return new TiktokApiError(
        502,
        "We could not reach the service. Please try again.",
      );
  }
}
