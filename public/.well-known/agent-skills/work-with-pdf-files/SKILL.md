---
name: work-with-pdf-files
description: Merge, split, compress, rotate, crop and watermark PDF files, and extract specific pages. Use for any task that reorganises or reduces the size of a PDF.
---

# Working with PDF files

## Merging

Combining a cover letter, CV and certificates into one submission is the common case. Page order
is the thing people get wrong — set the order before merging rather than fixing it afterwards.
Merging copies pages as-is: text stays selectable, and fonts and images are preserved.

## Splitting and extracting

- **Split** divides one PDF into several files, by page range or into single pages.
- **Extract** pulls selected pages into one new document, leaving the original untouched.

Use extract when you need "pages 3-7 of this contract" and split when you need every page as its
own file.

## Why a PDF is unexpectedly large

Size is usually dominated by embedded images, not text. A text-only PDF is small; a scanned one
at 600 DPI is enormous, and 150-200 DPI is plenty for screen reading and most printing. So the
fix is almost always "rescan or re-export at a lower DPI", not a compression tool.

Nexvert does **not** have a PDF compressor — it has image compressors. If the PDF is a scan,
compressing the source images before rebuilding the PDF is the route that works.

## Rotation and cropping

- **Rotate** fixes sideways or upside-down scans. Rotation is stored as page metadata, so there
  is no quality loss.
- **Crop** trims margins or white space. Note that cropping usually *hides* rather than deletes
  the area — do not treat it as redaction for sensitive content.

## Watermarking and flattening

- **Watermark** stamps text across pages — "DRAFT", "CONFIDENTIAL", a name for traceability.
- **Flatten** converts fillable form fields into static page content so the values can no longer
  be edited. Do this before sending a completed form.

## A warning about redaction

Drawing a black box over text in most PDF editors does **not** remove the text — it draws a
shape on top, and the text underneath is still selectable and extractable. Genuine redaction
requires deleting the content or rasterising the page. Treat any "black box" PDF as unredacted.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [Merge PDF](https://nexvert.online/pdf-merge/) — combine files, drag to reorder
- [Split PDF](https://nexvert.online/pdf-split/) — by range or into single pages
- [Extract pages](https://nexvert.online/extract-pdf-pages/) — selected pages into a new document
- [Rotate PDF](https://nexvert.online/rotate-pdf/) — fix sideways scans, lossless
- [Flatten PDF](https://nexvert.online/flatten-pdf/) — lock form fields into the page

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
