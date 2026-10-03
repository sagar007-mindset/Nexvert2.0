/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Homepage copy shared by App.tsx and scripts/prerender.js (static HTML + FAQPage schema).

export const HOME_TITLE = 'Nexvert: Free Online File Converter for PDF, Images, Video & Audio';
export const HOME_DESCRIPTION =
  'Convert PDF, JPG, PNG, HEIC, WEBP, MP4, MP3 and 50+ formats for free. 190+ online tools that run in your browser — no uploads, no sign-up, no watermarks.';
export const HOME_H1 = 'Free Online File Converter & Tools';
export const HOME_INTRO =
  'Convert PDFs, office documents, photos, vector graphics, audio tracks and videos for free. Nexvert’s tools run inside your browser, so your files are processed on your own device instead of being uploaded to a server.';
export const HOME_ANSWER =
  'Nexvert is a free online file converter with more than 190 browser-based tools for documents, images, audio, video, archives and developer data. Files are decoded and re-encoded locally with browser APIs and WebAssembly, so they are not uploaded to a cloud conversion service, and there is no sign-up or watermark.';

export const HOME_FAQS = [
  {
    question: 'What is Nexvert?',
    answer:
      'Nexvert is a free file conversion platform with browser-based tools for converting, compressing and editing documents, images, vector graphics, audio, video and archives.',
  },
  {
    question: 'Is Nexvert really free?',
    answer:
      'Yes. Every tool is free to use without an account, and converted files are never watermarked.',
  },
  {
    question: 'Are my files uploaded to a server?',
    answer:
      'No. Conversion happens inside your browser with HTML5 Canvas, the Web Audio API and WebAssembly engines such as ffmpeg.wasm and Tesseract. Your files stay in your device’s memory and are discarded when you close the tab.',
  },
  {
    question: 'What file formats does Nexvert support?',
    answer:
      'More than 50 formats, including PDF, DOCX, EPUB, Markdown, JPG, PNG, WEBP, HEIC, GIF, BMP, SVG, MP3, WAV, OGG, M4A, MP4, WEBM, MOV, ZIP and TAR. The Supported Formats page lists every format and the tools that accept it.',
  },
  {
    question: 'Do I need to install any software?',
    answer:
      'No. Nexvert runs in any modern desktop or mobile browser — Chrome, Edge, Firefox and Safari — without extensions, plugins or desktop programs.',
  },
  {
    question: 'Does Nexvert work on iPhone and Android?',
    answer:
      'Yes. The site is fully responsive and works in iOS Safari, Android Chrome, Samsung Internet and tablet browsers. Very large videos may convert faster on a desktop computer because processing uses your device’s CPU and memory.',
  },
  {
    question: 'Is there a file size limit?',
    answer:
      'Limits are set per tool (up to 100 MB for image and PDF tools, 200 MB for audio and 500 MB–1 GB for video) and are there to protect your browser’s memory, not to push you to a paid plan. If a file is too large, the upload box tells you the tool’s limit.',
  },
  {
    question: 'Who is Nexvert for?',
    answer:
      'Students, office workers, photographers, web developers and anyone who needs a quick, private conversion without installing software or creating an account.',
  },
];
