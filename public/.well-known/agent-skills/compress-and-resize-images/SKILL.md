---
name: compress-and-resize-images
description: Reduce image file size and change pixel dimensions without visible quality loss. Use when an upload limit rejects a photo, or a page loads slowly because of large images.
---

# Compressing and resizing images

Two different levers, often confused:

- **Resizing** changes pixel dimensions (4000x3000 to 1600x1200). This is usually the bigger win.
- **Compressing** keeps dimensions and discards image data via the quality setting.

Resize first, then compress. A 4000px-wide photo displayed in a 800px column is carrying ~25x
more pixels than it can ever show.

## Sensible targets

| Use | Longest edge | Quality |
|---|---|---|
| Full-width hero image | 1920-2560px | 75-85 |
| In-article image | 1200-1600px | 75-85 |
| Thumbnail | 400-600px | 70-80 |
| Email attachment | 1600px | 70-80 |

Quality 75-85 is the sweet spot for JPG and WEBP. Below ~60, compression artefacts become
visible around sharp edges and in flat gradients such as skies.

## Hitting a specific file size limit

Upload forms usually cap at 2 MB, 5 MB or 10 MB. In order of what to try:

1. Resize the longest edge to 1600px. Often sufficient on its own.
2. Convert to WEBP — typically 25-35% smaller than JPG at matching quality.
3. Lower quality to ~70. Inspect edges and gradients before accepting it.
4. For screenshots of text, keep PNG but reduce the dimensions — JPG makes text edges mushy.

## Things that commonly go wrong

- **Enlarging a small image** cannot add detail that was never captured; it interpolates and
  softens. Start from the largest original you have.
- **Compressing a PNG screenshot as JPG** produces visible ringing around text. Keep text-heavy
  images in PNG, or resize instead.
- **Stripping metadata** often saves a surprising amount on phone photos, and removes GPS
  coordinates as a side effect — see the `strip-image-metadata` skill.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [Compress image](https://nexvert.online/image-compressor/) — quality slider with live size preview
- [Resize image](https://nexvert.online/resize-image/) — exact dimensions or percentage, aspect ratio locked
- [Image converter](https://nexvert.online/) — convert to WEBP for a further size cut

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
