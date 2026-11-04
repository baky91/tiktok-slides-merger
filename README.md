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
┌────────────┐  GET /api/images?url=…   ┌──────────────┐  HTTPS   ┌──────────────────┐
│  React app │ ───────────────────────► │ Express API  │ ───────► │ RapidAPI         │
│  (Vite)    │ ◄─────────────────────── │  (Node.js)   │ ◄─────── │ (TikTok API)     │
│            │   list of image URLs     │              │          └──────────────────┘
│            │                          │              │  short links (HEAD) ──► TikTok
│            │  POST /api/merge         │              │
│            │ ───────────────────────► │   + sharp    │  downloads the images
│            │ ◄─────────────────────── │              │ ──────────────────► TikTok CDN
└────────────┘     merged JPEG          └──────────────┘
```

1. **Lookup**: if the link is a short link (`vm.tiktok.com`, `vt.tiktok.com`), the
   server follows its redirect (an HTTP `HEAD` request to TikTok) to get the
   post ID. It then asks a third-party TikTok API on [RapidAPI](https://rapidapi.com)
   for the post's details, which include the image URLs. Each lookup uses one
   request of your RapidAPI plan. 

   To save that quota, answers are **cached in memory for 10 minutes**, by post
   ID (so a short link and a full link of the same post share one entry, up to
   500 posts). Identical requests that arrive while a lookup is already
   running share its answer instead of calling the API again.
2. **Preview**: the browser shows the images with plain HTML and CSS. The preview is
   not the final image, but it follows the same layout rules as the export.
3. **Merging**: the server downloads the selected images and assembles them
   with [sharp](https://sharp.pixelplumbing.com). Doing it server-side avoids the
   size limits of the browser `<canvas>` and the CORS restrictions of TikTok's CDN.

## Tech stack

| Part      | Tools                                                           |
| --------- | --------------------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite                                      |
| Backend   | Node.js (ES modules), Express 5, sharp, dotenv                  |
| External  | TikTok API on RapidAPI (see `backend/.env.example`)           |
| Packaging | Docker (one `node:22-slim` image serving the API and the frontend) |

## Getting started

### Requirements

- Node.js 22 or later
- npm
- A [RapidAPI](https://rapidapi.com) account with a subscription to [TikTok API](https://rapidapi.com/Lundehund/api/Tiktok%20API).
  The project is set up for the host listed in `backend/.env.example`.

### Development

Run the backend and the frontend in two terminals.

```bash
# Terminal 1: API on http://localhost:3000
cd backend
cp .env.example .env      # then fill in your RapidAPI key
npm install
npm run dev
```

```bash
# Terminal 2: React app on http://localhost:5173
cd frontend
npm install
npm run dev
```

The Vite dev server forwards every `/api` request to `http://localhost:3000`.

Useful frontend scripts:

| Command          | What it does                  |
| ---------------- | ----------------------------- |
| `npm run build`  | Type-checks and builds the app |
| `npm run lint`   | Runs ESLint                   |
| `npm run format` | Formats `src/` with Prettier  |

### Production

#### With Docker

```bash
docker build -t tiktok-slides-merger .
docker run --env-file backend/.env -p 3000:3000 tiktok-slides-merger
```

Then open http://localhost:3000. The image builds the React app, then serves it
and the API from the same Express server.

The `.env` file is **not** copied into the image (see `.dockerignore`): pass the
variables when you start the container, with `--env-file` as above or with `-e`.

#### Without Docker

The `setup-server` bash script builds the frontend, copies it to
`backend/public`, then starts the server in production mode. Create
`backend/.env` first.

```bash
./setup-server
```

### Configuration

| Variable          | Default       | Description                                                          |
| ----------------- | ------------- | -------------------------------------------------------------------- |
| `RAPIDAPI_API_KEY`| none, required | Your RapidAPI key. Keep it secret: `.env` is ignored by Git          |
| `RAPIDAPI_HOST`   | none, required | Address of the RapidAPI TikTok API, **including `https://`** (see `backend/.env.example`) |
| `PORT`            | `3000`        | Port the server listens on                                           |
| `NODE_ENV`        | `development` | With `production`, the server also serves the built frontend         |

Locally, the variables are read from `backend/.env` (loaded with `dotenv`).
`backend/.env.example` is the template to copy.

## API

### `GET /api/images?url=<tiktok link>`

Returns the images of a carousel.

```json
{
  "postId": "123",
  "description": "…",
  "images": ["https://…tiktokcdn-eu.com/…"]
}
```

Errors are returned as `{ "error": "…" }` with a message that is safe to show to
users:

| Status | When |
| ------ | ---- |
| `400`  | The `url` parameter is missing, is not a TikTok link, or is an invalid or expired link |
| `404`  | The post could not be found, or it is not a photo carousel |
| `502`  | The API could not be reached, or answered with an error or an unreadable response |
| `503`  | The service is temporarily unavailable (API key refused, missing subscription or quota reached; the details are written to the server log only) |
| `504`  | The API took too long to answer (10 s) |
| `500`  | Unexpected error on the server |

Each lookup that reaches RapidAPI counts against your plan's quota. Answers
served from the cache do not. Failures are never cached.

### `POST /api/merge`

Merges a list of images and returns the result as `image/jpeg`.

```bash
curl -X POST http://localhost:3000/api/merge \
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
│   ├── server.js             # Express app: mounts the routes, serves the built frontend
│   ├── routes/
│   │   ├── images.js         # GET /api/images
│   │   └── merge.js          # POST /api/merge
│   ├── services/
│   │   ├── tiktok-api.js     # Calls to the RapidAPI TikTok API, error handling, caching
│   │   ├── cache.js          # In-memory cache with expiry and size limit
│   │   └── image-builder.js  # Validation of the merge request and merging with sharp
│   ├── utils/
│   │   └── tiktok-url.js     # TikTok link check and short-link resolution
│   └── .env.example          # Template of the environment variables
├── frontend/
│   ├── public/               # favicon, robots.txt
│   └── src/
│       ├── App.tsx
│       ├── api/              # Calls to the backend (scrape.ts, merge.ts)
│       ├── types.ts          # Layout, Format, Quality, LineColor…
│       ├── contexts/         # SettingsProvider (layout, columns, spacing…)
│       └── components/       # hero/, layout/, preview/, settings/, ui/
├── Dockerfile
└── setup-server              # Build + start script (production)
```

## Limitations

- **Depends on a third-party API.** The lookup relies on RapidAPI: its
  availability, the quota and price of your plan, and the format of its
  responses, which can change without notice.
- **Image links expire.** TikTok signs them with an expiration date (about 48
  hours when measured), so a list of images can stop working after a while.
  Fetch the carousel again to get new links.
- **Public carousels only.** Private posts, visible only by friends or deleted, cannot be viewed.
- **No rate limiting.** The lookup and merging routes are not protected yet: a
  loop of requests can use up your RapidAPI quota and the server's CPU and
  memory. Put the app behind a limiter before exposing it publicly.
- **Images are downloaded by your server** from TikTok's CDN on every merge. A
  slow or blocked connection to the CDN makes the merge fail with a `502`.
- **The cache lives in the server's memory.** It is empty after a restart, and
  each server process has its own. A post that is not a carousel is not cached,
  so repeating it uses one request of your quota each time.

## License

Released under the [MIT License](LICENSE).

## Disclaimer

This project is not affiliated with TikTok or RapidAPI. Respect TikTok's terms
of service, the terms of the API you use through RapidAPI, and the rights of the
creators whose content you download.
