---
name: strip-image-metadata
description: Remove EXIF metadata including GPS coordinates, camera serial numbers and timestamps from photos before sharing them publicly. Use for privacy review of images.
---

# Removing metadata from photos

## What a photo carries beyond the picture

Phone and camera photos embed EXIF metadata that frequently includes:

- **GPS coordinates** — often precise to a few metres, revealing a home or workplace
- **Date and time** the photo was taken
- **Camera make, model and serial number**, which can link separate photos to one device
- Lens, exposure settings, and sometimes a thumbnail of the *original* image from before edits

Anyone who downloads the file can read all of it. No special tooling is required.

## When this matters

- Selling something online and photographing it at home
- Posting photos of children, or of anywhere you regularly are
- Dating profiles and classified listings
- Journalism, activism, or any situation where a source's location is sensitive
- Sharing an edited image where the embedded thumbnail may still show the unedited original

## What already strips it, and what does not

Most large social platforms strip EXIF on upload — but **do not rely on this**. It varies by
platform, by upload path, and it does not apply to a file sent directly over email, messaging
apps that send "as a file", cloud links, or any site hosting the original.

Re-encoding the pixels removes metadata reliably, because the output is a new file built only
from image data.

## A caution on screenshots and redaction

Removing metadata does not redact the *picture*. Blurring or pixelating is only safe if applied
and then flattened — some formats and editors keep the original underneath. For sensitive
redaction, crop the region out entirely rather than covering it.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [Remove EXIF](https://nexvert.online/remove-exif/) — strips GPS, serials and timestamps by re-encoding clean pixels
- [Blur image](https://nexvert.online/blur-image/) — obscure faces or details before sharing
- [Pixelate image](https://nexvert.online/pixelate-image/) — mosaic over sensitive regions
- [Crop image](https://nexvert.online/crop-image/) — the most reliable redaction — remove the pixels

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
