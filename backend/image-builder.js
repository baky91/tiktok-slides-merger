import sharp from "sharp";

// libjpeg cannot encode images larger than 65500 px on either side
export const JPEG_MAX_SIDE = 65500;

// Only TikTok's CDNs can be downloaded, so the server cannot be used to
// fetch arbitrary URLs (tiktokcdn.com, tiktokcdn-eu.com, tiktokcdn-us.com…)
const ALLOWED_HOST = /(^|\.)tiktokcdn(-[a-z]+)?\.com$/;
const DOWNLOAD_TIMEOUT = 15_000;
const MAX_DOWNLOAD_SIZE = 20_000_000;

// Downloads URLs into buffers; file paths and buffers are returned as is
async function loadImage(image) {
  if (typeof image !== "string" || !/^https?:\/\//i.test(image)) return image;

  const { hostname } = new URL(image);
  if (!ALLOWED_HOST.test(hostname))
    throw new Error(`Host not allowed: ${hostname}`);

  const response = await fetch(image, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
  });
  if (!response.ok)
    throw new Error(`Download failed (${response.status}): ${hostname}`);
  if (Number(response.headers.get("content-length")) > MAX_DOWNLOAD_SIZE) {
    throw new Error(`Image too large: ${hostname}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_DOWNLOAD_SIZE)
    throw new Error(`Image too large: ${hostname}`);
  return buffer;
}

export const QUALITY_PRESETS = {
  standard: { maxPixels: 8_000_000, quality: 80 },
  high: { maxPixels: 24_000_000, quality: 90 },
  max: { maxPixels: 60_000_000, quality: 95 },
};
export const LAYOUTS = ["vertical", "horizontal", "grid"];
export const MAX_IMAGES = 50;
export const MAX_SPACING = 100;

/**
 * Merges a list of images into a single JPEG.
 *
 * Every image is resized to a common cell width (the narrowest image, so
 * nothing is upscaled), like the HTML preview grid. A row is as tall as its
 * tallest image, and images are placed in the top-left corner of their cell.
 *
 * @param {(string | Buffer)[]} images URLs, file paths or buffers, in display order
 * @param {object} [options]
 * @param {"vertical" | "horizontal" | "grid"} [options.layout]
 * @param {number} [options.columns] Maximum number of columns in grid layout
 * @param {number} [options.spacing] Gap between images, in px at full size
 * @param {string} [options.background] Color of the gaps and empty cells
 * @param {number} [options.maxSide] Maximum width/height of the output, in px
 * @param {number} [options.maxPixels] Maximum width × height of the output
 * @param {number} [options.quality] JPEG quality (1-100)
 * @returns {Promise<{ buffer: Buffer, width: number, height: number, scale: number }>}
 */
export async function mergeImages(
  inputs,
  {
    layout = "grid",
    columns = 2,
    spacing = 0,
    background = "#ffffff",
    maxSide = JPEG_MAX_SIDE,
    maxPixels = Infinity,
    quality = 90,
  } = {},
) {
  if (inputs && inputs.length === 0) {
    throw new Error("No images to merge");
  }

  // Downloaded once, then reused for both the metadata and the resizing
  const images = await Promise.all(inputs.map(loadImage));

  let columnCount;
  if (layout === "vertical") {
    columnCount = 1;
  } else if (layout === "horizontal") {
    columnCount = images.length;
  } else {
    columnCount = Math.max(1, Math.min(columns, images.length));
  }

  const sizes = await Promise.all(
    images.map(async (image) => {
      const { width, height } = await sharp(image).metadata();
      return { width, height };
    }),
  );

  // Layout at full size, used to compute how much the output must shrink
  const fullCellWidth = Math.min(...sizes.map((size) => size.width));
  const full = computeLayout(sizes, columnCount, fullCellWidth, spacing);
  const scale = Math.min(
    1,
    maxSide / full.width,
    maxSide / full.height,
    Math.sqrt(maxPixels / (full.width * full.height)),
  );

  // Flooring every dimension keeps the scaled output within the limits
  const cellWidth = Math.max(1, Math.floor(fullCellWidth * scale));
  const gap = Math.floor(spacing * scale);
  const { width, height, cells } = computeLayout(
    sizes,
    columnCount,
    cellWidth,
    gap,
  );

  const tiles = await Promise.all(
    images.map(async (image, index) => ({
      input: await sharp(image)
        .resize({ width: cellWidth, height: cells[index].height, fit: "fill" })
        .toBuffer(),
      left: cells[index].left,
      top: cells[index].top,
    })),
  );

  const buffer = await sharp({
    create: { width, height, channels: 3, background },
    limitInputPixels: false,
  })
    .composite(tiles)
    .jpeg({ quality })
    .toBuffer();

  return { buffer, width, height, scale };
}

// Positions every image in a grid of `columnCount` cells of `cellWidth` px
function computeLayout(sizes, columnCount, cellWidth, gap) {
  const heights = sizes.map((size) =>
    Math.max(1, Math.floor((size.height * cellWidth) / size.width)),
  );

  const rowHeights = [];
  heights.forEach((height, index) => {
    const row = Math.floor(index / columnCount);
    rowHeights[row] = Math.max(rowHeights[row] ?? 0, height);
  });

  const rowTops = [];
  let top = 0;
  for (const rowHeight of rowHeights) {
    rowTops.push(top);
    top += rowHeight + gap;
  }

  const cells = heights.map((height, index) => ({
    left: (index % columnCount) * (cellWidth + gap),
    top: rowTops[Math.floor(index / columnCount)],
    height,
  }));

  return {
    width: columnCount * cellWidth + (columnCount - 1) * gap,
    height: top - gap,
    cells,
  };
}
