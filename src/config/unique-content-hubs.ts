/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Copy for the category hub pages. Every tool, format and feature named here exists on the site.

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_HUBS_CONTENT: Record<string, ToolSEOData> = {
  home: {
    h1: 'Free Online File Converter & Tools',
    description: 'Convert PDF, JPG, PNG, HEIC, WEBP, MP4, MP3 and 50+ formats for free in your browser.',
    introParagraph: 'Nexvert is a free online file converter with more than 190 browser-based tools for documents, images, audio, video, archives and developer data. Files are processed on your own device with browser APIs and WebAssembly, so they are not uploaded to a server.',
    steps: [
      { title: 'Pick a tool', text: 'Choose a converter or browse a category.' },
      { title: 'Add your file', text: 'Select or drag in the file; it stays on your device.' },
      { title: 'Download the result', text: 'Adjust options if needed and save the output.' },
    ],
    faqs: [
      { question: 'Is Nexvert free?', answer: 'Yes. Every tool is free, with no account and no watermarks.' },
      { question: 'Are my files uploaded?', answer: 'No. Conversion runs in your browser on your device.' },
      { question: 'Do I need to install anything?', answer: 'No. It works in any modern desktop or mobile browser.' },
    ],
  },

  tools: {
    h1: 'All Tools – Nexvert File Converters & Utilities',
    description: 'Browse and search every Nexvert tool: PDF, image, audio, video, archive, compression, developer and everyday utilities.',
    introParagraph: 'This directory lists every Nexvert tool in one place — more than 190 converters, editors and utilities grouped into PDF & documents, images, audio, video, archives, compression, developer tools and everyday utilities. Search by tool name, file format or task (for example "merge", "WebP" or "SHA-256") to jump straight to what you need. Every tool runs in your browser: files are processed on your device, there is no sign-up, and results are never watermarked. Tools that use your camera (QR scanning) or microphone (voice recorder) ask for permission first.',
    steps: [
      { title: 'Search or filter', text: 'Type a format, task or tool name, or pick a category.' },
      { title: 'Open the tool', text: 'Click a tool card to open its page.' },
      { title: 'Process your file', text: 'Add your file or input, adjust the options and download the result.' },
    ],
    faqs: [
      { question: 'How many tools does Nexvert have?', answer: 'More than 190, covering PDF and document conversion, image editing and conversion, audio, video, archives, compression, developer utilities and calculators.' },
      { question: 'What if the conversion I need is missing?', answer: 'Send a request through the Contact page. Suggestions are used to decide which tools to add next.' },
      { question: 'Can I bookmark a tool?', answer: 'Yes. Every tool has its own URL, such as /pdf-merge/ or /png-to-jpg/, which you can bookmark or share.' },
    ],
  },

  'pdf-tools': {
    h1: 'PDF & Document Tools',
    description: 'Merge, split, rotate, crop, reorder, watermark, number and OCR PDFs, and convert Word, Markdown, HTML, EPUB and images — free in your browser.',
    introParagraph: 'The PDF & Document Tools cover the everyday jobs people otherwise need Acrobat for. Merge several PDFs, split a PDF by pages or ranges, extract or remove pages, rotate, reorder, crop and resize pages, add page numbers or a text watermark, edit document metadata, fill and flatten forms, and recognise text in scanned PDFs with OCR. Conversion tools turn JPG and PNG images, Word (.docx) files and Markdown into PDF, and convert DOCX, HTML, Markdown, CSV and EPUB between text formats. Everything runs in your browser with pdf-lib, pdf.js and Tesseract, so contracts, IDs and financial documents are never uploaded.',
    steps: [
      { title: 'Choose a PDF tool', text: 'Pick the task: merge, split, rotate, organize, OCR, convert and more.' },
      { title: 'Add your document', text: 'Upload the PDF, Word file or images; pages are previewed as thumbnails where relevant.' },
      { title: 'Apply and download', text: 'Make your changes and download the new document.' },
    ],
    faqs: [
      { question: 'Can I edit password-protected PDFs?', answer: 'Encrypted PDFs need to be unlocked first. Remove the password in your PDF reader, then use the unlocked copy.' },
      { question: 'Can I convert PDF to Word or compress a PDF?', answer: 'Not yet. The PDF tools focus on organising, editing and OCR, plus converting images, Word and Markdown to PDF. To get editable text from a scanned PDF, use PDF OCR.' },
      { question: 'Are my PDFs uploaded to a server?', answer: 'No. Every PDF tool runs in your browser, so documents stay on your device.' },
    ],
  },

  'image-tools': {
    h1: 'Image Tools – Convert, Compress, Resize & Edit Images',
    description: 'Convert HEIC, PNG, JPG, WEBP, GIF, BMP and SVG, compress, resize, crop and edit images, and read text or QR codes — all in your browser.',
    introParagraph: 'The Image Tools convert, optimise and edit pictures without uploading them. Convert between PNG, JPG, WEBP, GIF and BMP — including iPhone HEIC photos, JFIF files and SVG graphics as input — compress single images or whole batches, and resize, crop, rotate, flip or enlarge them. Adjust brightness, contrast and saturation, apply grayscale, sepia, blur, pixelate, sharpen or sketch effects, add watermarks, borders and rounded corners, and make collages, memes and animated GIFs. You can also pick colours, view or remove EXIF metadata, read text with OCR, and scan or create QR codes and barcodes. All processing uses the browser’s canvas and WebAssembly.',
    steps: [
      { title: 'Choose a tool', text: 'For example the image converter, compressor, resizer or an effect.' },
      { title: 'Upload your image', text: 'Select or drag in PNG, JPG, WEBP, GIF, BMP, SVG or HEIC files.' },
      { title: 'Adjust and download', text: 'Set format, quality or size, preview the result and download it.' },
    ],
    faqs: [
      { question: 'Which format gives the smallest files?', answer: 'WEBP is usually 25–35% smaller than JPG at similar quality and supports transparency. Use JPG for photos when compatibility matters and PNG for graphics with sharp edges or transparency.' },
      { question: 'Can I convert iPhone HEIC photos to JPG?', answer: 'Yes. Upload the HEIC photo to the image converter and choose JPG; it is decoded in your browser.' },
      { question: 'How do I remove location data from photos?', answer: 'Use Remove EXIF, which re-saves the image without GPS coordinates, camera details and other metadata.' },
    ],
  },

  'developer-tools': {
    h1: 'Developer Tools – JSON, Encoding, Hashing & Formatting',
    description: 'Format and convert JSON, YAML, XML and CSV, encode Base64 and URLs, decode JWTs, generate hashes and UUIDs, and test regex — privately in your browser.',
    introParagraph: 'The Developer Tools are quick utilities for everyday engineering work that you can use on sensitive data because nothing leaves your browser. Format, validate, minify and diff JSON; convert between JSON, CSV, XML and YAML; encode and decode Base64, URLs and HTML entities; decode JWTs; generate SHA-1, SHA-256, SHA-512 and MD5 hashes of text or files; beautify HTML, CSS, JavaScript, SQL and XML; generate UUIDs, passwords and random strings; test regular expressions; explain cron expressions; convert timestamps and number bases; and work with colours, contrast and gradients. Hashing uses the native Web Crypto API.',
    steps: [
      { title: 'Choose a utility', text: 'Pick a formatter, converter, encoder, hash or generator.' },
      { title: 'Paste your input', text: 'Paste JSON, text, a token or a file; most tools update as you type.' },
      { title: 'Copy the result', text: 'Copy the output or download it.' },
    ],
    faqs: [
      { question: 'Is it safe to paste API tokens or production data?', answer: 'Yes. Parsing, decoding and hashing run in your browser’s JavaScript engine; the data is not sent to a server.' },
      { question: 'Does the JSON validator show where the error is?', answer: 'Yes. Invalid JSON produces the parser’s error message, including the position where parsing failed.' },
      { question: 'Can I hash files, not just text?', answer: 'Yes. The hash generators and File Checksum accept files and compute SHA-1, SHA-256, SHA-512 and MD5 locally.' },
    ],
  },

  utilities: {
    h1: 'Online Utilities & Calculators',
    description: 'Word counter, text cleaners, unit and time zone converters, loan, BMI, GST and date calculators, invoice and signature makers, and random pickers.',
    introParagraph: 'The Utilities collection covers everyday tasks: count words and characters, remove duplicate lines, sort, find and replace, clean whitespace and line breaks, and read text aloud. Convert units, time zones, Roman numerals and numbers to words; calculate percentages, age, days between dates, BMI, loan EMIs, tips, discounts and GST; create invoices as PDF, draw signatures, and generate favicons, Open Graph images and placeholder images; or pick a random winner, roll dice, flip a coin and generate random numbers. Calculations update as you type and nothing you enter is stored or sent anywhere.',
    steps: [
      { title: 'Pick a utility', text: 'Choose a text tool, converter, calculator, generator or random tool.' },
      { title: 'Enter your values', text: 'Type or paste text or numbers; results update instantly.' },
      { title: 'Copy or download', text: 'Copy the result or download the generated file.' },
    ],
    faqs: [
      { question: 'Can the text tools handle long documents?', answer: 'Yes. Tens of thousands of lines are processed in a moment in the browser.' },
      { question: 'Are my numbers or text saved?', answer: 'No. Inputs exist only in your browser tab and disappear when you close it.' },
      { question: 'Are the random tools fair?', answer: 'Yes. The picker, dice, coin and number generator use the browser’s cryptographically secure random generator.' },
    ],
  },

  'audio-tools': {
    h1: 'Audio Tools – Convert, Trim, Merge & Edit Audio',
    description: 'Convert audio to MP3 or WAV, trim, merge, change speed and volume, reverse, convert to mono, remove silence and record your voice — in your browser.',
    introParagraph: 'The Audio Tools edit and convert sound files without uploading them. Convert MP3, WAV, OGG, M4A, WebM, FLAC and AAC files to MP3 (128–320 kbps) or WAV, compress MP3s, trim or cut a clip, merge several tracks, change speed with or without pitch, boost or normalise volume, reverse audio, convert stereo to mono, remove silent gaps, inspect audio properties, and record from your microphone. Audio is decoded with the Web Audio API and MP3s are encoded with the LAME encoder in your browser. To pull audio out of a video, use Video to MP3.',
    steps: [
      { title: 'Choose an audio tool', text: 'Pick convert, trim, merge, speed, volume and more.' },
      { title: 'Add your audio', text: 'Upload a file or record from your microphone.' },
      { title: 'Export', text: 'Choose MP3 or WAV and download the result.' },
    ],
    faqs: [
      { question: 'Does converting WAV to MP3 reduce quality?', answer: 'MP3 is lossy, but at 256–320 kbps most listeners cannot tell the difference, and the file is roughly 80% smaller.' },
      { question: 'How do I extract audio from a video?', answer: 'Use Video to MP3 or MP4 to MP3, which save the soundtrack as an MP3 at 128–320 kbps.' },
      { question: 'Can I edit multitrack projects?', answer: 'No. These are single-file tools for quick edits; multitrack mixing needs a desktop audio editor.' },
    ],
  },

  'video-tools': {
    h1: 'Video Tools – Convert, Compress, Trim & Crop Video',
    description: 'Convert MP4, MOV, WebM and AVI, compress, trim, crop, resize or mute videos, extract frames and make GIFs — in your browser with ffmpeg.wasm.',
    introParagraph: 'The Video Tools use ffmpeg compiled to WebAssembly to edit video directly in your browser. Convert MP4, MOV, WebM and AVI to MP4 (H.264) or WebM, compress videos with an adjustable quality level, trim clips, crop to square, 9:16 vertical or custom sizes, resize to 1080p, 720p, 480p or 360p, remove the audio track, extract frames as images, inspect video details, turn clips into GIFs and GIFs into MP4, and save the soundtrack as MP3. The video engine (about 31 MB) is downloaded once and cached. Encoding speed depends on your device, so short clips work best.',
    steps: [
      { title: 'Choose a video tool', text: 'Pick convert, compress, trim, crop, resize, mute or GIF.' },
      { title: 'Add your video', text: 'Upload an MP4, MOV, WebM or AVI file and preview it.' },
      { title: 'Process and download', text: 'Set the options, wait for processing to finish, and download the result.' },
    ],
    faqs: [
      { question: 'Why is video slower than image conversion?', answer: 'Every frame has to be decoded and re-encoded on your device’s CPU. A one-minute 30 fps clip has 1,800 frames.' },
      { question: 'Can I convert iPhone MOV videos to MP4?', answer: 'Yes. Use MOV to MP4, which re-encodes them as H.264 MP4 that plays on Windows, Android and TVs.' },
      { question: 'Is my video uploaded?', answer: 'No. All processing happens in your browser; only the video engine itself is downloaded from this site.' },
    ],
  },

  'archive-tools': {
    h1: 'Archive Tools – ZIP & TAR Online',
    description: 'Extract, view, create and split ZIP files, and convert between TAR (.tar, .tar.gz) and ZIP — without installing software.',
    introParagraph: 'The Archive Tools handle ZIP and TAR files in your browser, which helps on computers where you cannot install WinRAR or 7-Zip. Extract a ZIP and download selected files, inspect a ZIP’s contents before extracting, create ZIP archives with folders or zip many files at once, split large files into parts and join them again, convert TAR and TAR.GZ archives to ZIP, convert ZIP to TAR, and extract TAR archives. Files are read and written with JSZip and a built-in TAR engine on your device.',
    steps: [
      { title: 'Choose an archive tool', text: 'Extract, view, create, split or convert.' },
      { title: 'Add the archive or files', text: 'Upload a ZIP or TAR file, or the files you want to pack.' },
      { title: 'Download', text: 'Download extracted files, a new archive or the split parts.' },
    ],
    faqs: [
      { question: 'Can I see what is inside a ZIP before extracting?', answer: 'Yes. ZIP Viewer lists every file with its size and compression ratio without extracting anything.' },
      { question: 'Can it open password-protected ZIP files?', answer: 'No. Encrypted archives are not supported; extract them with a desktop tool that accepts the password.' },
      { question: 'How large can archives be?', answer: 'Up to 300 MB–1 GB depending on the tool, limited by your device’s memory.' },
    ],
  },

  'compression-tools': {
    h1: 'Compression Tools – Make Images, Video & MP3 Smaller',
    description: 'Compress JPG, PNG and WEBP images (single or in bulk), videos and MP3 files to smaller sizes in your browser.',
    introParagraph: 'The Compression Tools shrink files so they fit upload limits, load faster on websites and take less space. Compress a JPG, PNG or WEBP image with a quality control, compress many images at once and download them as a ZIP, reduce video size with an adjustable quality level, and re-encode MP3 files at a lower bitrate. Each tool shows the original and new size so you can balance size against quality. All compression runs on your device.',
    steps: [
      { title: 'Pick the file type', text: 'Image, bulk images, video or MP3.' },
      { title: 'Choose the level', text: 'Set quality, bitrate or compression strength.' },
      { title: 'Compare and download', text: 'Check the new size and download the smaller file.' },
    ],
    faqs: [
      { question: 'What is the difference between lossy and lossless compression?', answer: 'Lossless compression keeps every pixel or sample and only reorganises the data. Lossy compression removes detail that is hard to notice, which saves far more space.' },
      { question: 'Why did my file barely get smaller?', answer: 'Files that are already heavily compressed — small JPGs, streaming-quality MP4s or low-bitrate MP3s — have little left to remove without visible or audible loss.' },
      { question: 'Can I compress a PDF?', answer: 'Not yet. PDF compression is not available; for scanned PDFs, splitting large documents can help meet upload limits.' },
    ],
  },
};
