# TikTok Slides Merger

Turn a TikTok photo carousel into a single image.

Paste a carousel link, pick which slides to keep, choose a layout, and download
everything merged into one JPEG.

## Features

- Fetches every image of a TikTok carousel from its link (full `tiktok.com`
  links and `vm.` / `vt.` short links)
- Slide picker: include or exclude each image
- Three layouts: **vertical**, **horizontal** and **grid** (with a chosen number of columns)
- Adjustable spacing between images and **line color** (white or black)
- Two quality levels: **Standard** and **High**
- Live preview with drag to move and scroll / pinch to zoom
- Responsive interface (desktop and mobile)

Only JPEG export is available for now. PDF and PNG are planned (the PDF option
is disabled in `frontend/src/types.ts`).

## How it works

```
┌────────────┐  GET /api/images?url=…   ┌──────────────┐  headless Chromium  ┌────────┐
│  React app │ ───────────────────────► │ Express API  │ ──────────────────► │ TikTok │
│  (Vite)    │ ◄─────────────────────── │  (Node.js)   │ ◄────────────────── └────────┘
│            │   list of image URLs     │              │
│            │                          │              │  downloads the images
│            │  POST /api/merge         │              │ ──────────────────► TikTok CDN
│            │ ───────────────────────► │   + sharp    │
│            │ ◄─────────────────────── │              │
└────────────┘     merged JPEG          └──────────────┘
```

1. **Scraping**: the server opens the carousel in a headless browser
   ([Playwright](https://playwright.dev)) and reads the image URLs embedded in the page.
2. **Preview**: the browser shows the images with plain HTML and CSS. The preview is
   not the final image, but it follows the same layout rules as the export.
3. **Merging**: the server downloads the selected images and assembles them
   with [sharp](https://sharp.pixelplumbing.com). Doing it server-side avoids the
   size limits of the browser `<canvas>` and the CORS restrictions of TikTok's CDN.

## Tech stack

| Part     | Tools                                             |
| -------- | ------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite                        |
| Backend  | Node.js (ES modules), Express 5, Playwright, sharp |
| Packaging | Docker (single image serving API and frontend)   |

## Getting started

### Requirements

- Node.js 20 or later
- npm

### Development

Run the backend and the frontend in two terminals.

```bash
# Terminal 1: API on http://localhost:3001
cd backend
npm install
npm run install-browser   # downloads Chromium for Playwright (first time only)
npm run dev
```

```bash
# Terminal 2: React app on http://localhost:5173
cd frontend
npm install
npm run dev
```

The Vite dev server forwards every `/api` request to `http://localhost:3001`.

### Production

#### With Docker

```bash
docker build -t tiktok-slides-merger .
docker run -p 3001:3001 tiktok-slides-merger
```

Then open http://localhost:3001. The image builds the React app, then serves it
and the API from the same Express server.

#### Without Docker

The `setup-server` bash script builds the frontend, copies it to
`backend/public`, then starts the server in production mode. It offers to
install the Playwright browsers if they are missing.

```bash
./setup-server
```

### Configuration

| Variable   | Default       | Description                                     |
| ---------- | ------------- | ----------------------------------------------- |
| `PORT`     | `3001`        | Port the server listens on                      |
| `NODE_ENV` | `development` | With `production`, the server also serves the built frontend |

## API

### `GET /api/images?url=<tiktok link>`

Returns the images of a carousel.

```json
{
  "url": "https://www.tiktok.com/@user/video/123",
  "id": "123",
  "author": "user",
  "description": "…",
  "images": ["https://…tiktokcdn-eu.com/…"]
}
```

Returns `400` for a missing or invalid link, and `502` if TikTok takes too long to answer.

### `POST /api/merge`

Merges a list of images and returns the result as `image/jpeg`.

```bash
curl -X POST http://localhost:3001/api/merge \
  -H "Content-Type: application/json" \
  -d '{
        "images": ["https://…tiktokcdn-eu.com/a.jpeg", "https://…tiktokcdn-eu.com/b.jpeg"],
        "layout": "grid",
        "columns": 2,
        "spacing": 3,
        "lineColor": "#000000",
        "qualityPreset": "high"
      }' \
  --output merged.jpeg
```

| Field           | Type     | Default     | Description                                                            |
| --------------- | -------- | ----------- | ---------------------------------------------------------------------- |
| `images`        | string[] | required    | 1 to 50 `https` URLs, in display order                                 |
| `layout`        | string   | `grid`      | `vertical`, `horizontal` or `grid`                                     |
| `columns`       | integer  | `2`         | Number of columns, used by the `grid` layout                           |
| `spacing`       | number   | `0`         | Gap between images, from 0 to 20, as a **percentage of the image width** |
| `lineColor`     | string   | `#ffffff`   | Color of the lines between images, as a `#rrggbb` hex color            |
| `qualityPreset` | string   | `high`      | `standard`, `high` (case-insensitive)                         |

Invalid values return `400` with `{ "error": "…" }`.

**Quality presets**

| Preset     | Max size of the result | JPEG quality |
| ---------- | ---------------------- | ------------ |
| `standard` | 8 megapixels           | 80           |
| `high`     | 24 megapixels          | 90           |

**How images are merged**

- Every image is resized to the width of the narrowest one, so nothing is upscaled.
- A row is as tall as its tallest image.
- When the result exceeds the size of the preset, or JPEG's limit of 65,500 px per
  side, everything (spacing included) is reduced by the same factor.
- Only images hosted on TikTok's CDN (`tiktokcdn*.com`) are downloaded, with a
  15 s timeout and a 20 MB limit per image. This prevents the server from being
  used to fetch arbitrary URLs.

## Project structure

```
.
├── backend/
│   ├── server.js          # Express routes
│   ├── scrapper.js        # Playwright scraping of the carousel
│   └── image-builder.js   # Validation of the request and merging with sharp
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── api.ts         # Calls to the API
│       ├── types.ts       # Layout, Format, Quality, LineColor…
│       ├── contexts/      # SettingsProvider (layout, columns, spacing…)
│       └── components/    # Hero, settings panels, preview…
├── Dockerfile
└── setup-server           # Build + start script (production)
```

## Limitations

- **Scraping is fragile.** It depends on the structure of TikTok pages, which can
  change without notice.
- **Image links expire.** TikTok signs them with an expiration date, so a list of
  images can stop working after a while. Fetch the carousel again to get new links.
- **Public carousels only.** Private posts, visible only by friends or deleted, cannot be viewed.
- **No rate limiting.** The scraping and merging routes are not protected yet, and
  each scrape starts a browser. Put the app behind a limiter before exposing it publicly.

## Disclaimer

This project is not affiliated with TikTok. Respect TikTok's terms of service and
the rights of the creators whose content you download.
