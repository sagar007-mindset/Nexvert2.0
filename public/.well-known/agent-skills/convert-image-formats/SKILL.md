---
name: convert-image-formats
description: Choose between and convert JPG, PNG, WEBP, HEIC, AVIF, GIF, BMP and SVG. Use when deciding which image format to use, or converting iPhone HEIC photos for compatibility.
---

# Converting between image formats

## Pick the format by what the image is

| Format | Best for | Transparency | Lossy |
|---|---|---|---|
| **JPG** | photographs | no | yes |
| **PNG** | screenshots, logos, line art, anything needing transparency | yes | no |
| **WEBP** | web delivery — ~25-35% smaller than JPG at equivalent quality | yes | both |
| **AVIF** | web delivery, smaller again than WEBP, slower to encode | yes | both |
| **HEIC** | iPhone camera default; excellent compression, poor compatibility | yes | yes |
| **SVG** | icons, diagrams, anything that must scale without blurring | yes | n/a (vector) |

## The conversions people actually need

**HEIC to JPG.** iPhones shoot HEIC by default and many Windows apps, older web forms and
printing services cannot open it. Converting to JPG trades some file size for near-universal
compatibility. Convert a copy — HEIC holds more image data than the JPG will.

**PNG to JPG.** Worth doing for photographs saved as PNG, where the file is often several times
larger for no visible benefit. Do **not** do it when the image has transparency: JPG has no
alpha channel, so transparent areas flatten to a solid colour, usually white or black.

**To WEBP.** The single easiest page-weight win for a website. Keep a JPG or PNG fallback only
if you must support very old browsers; every current browser handles WEBP.

**SVG to PNG.** Needed when something only accepts raster images. Export at the largest size you
will ever display, since the PNG cannot scale back up cleanly.

## Things that commonly go wrong

- **Converting lossy to lossy repeatedly** re-compresses the image each time and the damage
  accumulates. Always go back to the original rather than re-converting an export.
- **Raising quality on an already-compressed file** does not restore detail. It only makes a
  bigger file containing the same lost data.
- **Colour shifts** usually mean the source had a non-sRGB colour profile. Convert to sRGB for
  anything destined for the web.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [Image converter (HEIC, PNG, WEBP…)](https://nexvert.online/) — accepts HEIC input; choose JPG as the output format
- [PNG to JPG](https://nexvert.online/png-to-jpg/) — shrink photographs stored as PNG
- [SVG converter](https://nexvert.online/svg-converter/) — vector to raster

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
