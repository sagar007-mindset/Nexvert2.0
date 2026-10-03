<<<<<<< HEAD
# Nexvert

Free online file converter — https://nexvert.online

190+ browser-based tools for PDF, images, audio, video, archives and developer data. All
processing runs in the visitor's browser (Canvas, Web Audio, pdf-lib, pdf.js, ffmpeg.wasm,
Tesseract OCR); files are never uploaded.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # TypeScript type check
```

## Build

```bash
npm run build
```

The build runs, in order:

1. `scripts/copy-runtime-assets.cjs` — copies the ffmpeg and Tesseract (OCR) WebAssembly engines
   and language data from `node_modules` into `public/`.
2. `scripts/generate-favicons.cjs` — renders all icon sizes and `favicon.ico` from
   `public/favicon.svg` (small sizes) and `public/logo.svg` (large sizes).
3. `scripts/generate-sitemap.js` — writes `public/sitemap.xml` and `public/llms.txt` from the route
   and tool registries.
4. `scripts/seo-audit.ts` — fails the build on duplicate titles or broken tool routes.
5. `vite build`
6. `scripts/prerender.js` — writes static HTML for every route (including the homepage) plus
   `dist/404.html`, using the same content and JSON-LD modules as the React app.

`public/og-image.png` is generated once with `node scripts/generate-og-image.cjs` and committed.

## Where things live

| What | File |
| --- | --- |
| Routes, titles, meta descriptions, canonical overrides | `src/config/routes.config.ts` |
| Tool registry (formats, limits, related tools) | `src/config/converters.config.ts` |
| Page copy shown under each tool (intro, steps, FAQs) | `src/config/unique-content-*.ts`, `src/config/page-content.ts` |
| Page H1 per URL | `src/config/page-heading.ts` |
| Structured data (JSON-LD) | `src/config/structured-data.ts` |
| Homepage copy and FAQ | `src/config/home-content.ts` |

## Deploy (Netlify)

`netlify.toml` sets the build command, publish directory, redirects for legacy URLs, and cache /
security headers. Unknown URLs are served `dist/404.html` with a real 404 status.

Do not add `Cross-Origin-Embedder-Policy` headers: the single-threaded ffmpeg build does not need
them, and they block the video engine's worker script.
=======
# Nexvert2.0
>>>>>>> 42a738dbec1dd823c1a82c020a3f11760311e5e3
