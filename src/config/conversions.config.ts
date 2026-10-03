import type { ImageFormat } from '../utils/converter.ts';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ConversionPageConfig {
  slug: string;
  fromFormat: string;
  toFormat: string;
  title: string;
  metaDescription: string;
  h1: string;
  introParagraph: string;
  steps: string[];
  faqs: FAQItem[];
  relatedSlugs: string[];
}

export const CONVERSION_PAGES: Record<string, ConversionPageConfig> = {
  'png-to-jpg': {
    slug: 'png-to-jpg',
    fromFormat: 'png',
    toFormat: 'jpg',
    title: 'Convert PNG to JPG Free — Nexvert',
    metaDescription: 'Convert PNG images to JPG format for free, instantly, and completely privacy-safe. All processing is local in your browser—no file uploads required.',
    h1: 'Convert PNG to JPG Free',
    introParagraph: 'PNG to JPG conversion is one of the most common graphic adjustments needed for web design and digital publishing. While PNG format excels at preserving high quality and supporting alpha transparency, it often produces large files that slow down web pages. Converting your PNG images to JPG reduces the storage footprint significantly by applying highly efficient lossy compression. Nexvert executes this transformation in real-time, right inside your browser. Because we use advanced HTML5 canvas rendering rather than cloud-hosted servers, your files never leave your computer. This makes our free tool the absolute safest way to optimize image sizes for websites, email attachments, and portfolio uploads.',
    steps: [
      'Select or drag and drop your PNG image into the converter box above.',
      'Adjust the quality slider to balance between visual fidelity and file size footprint.',
      'Click Convert and immediately download your optimized JPG image.'
    ],
    faqs: [
      {
        question: 'Will I lose image quality when converting PNG to JPG?',
        answer: 'Yes, because JPG is a lossy format. However, by keeping the quality slider at 90% or higher, the difference is virtually imperceptible to the human eye while still reducing file size considerably.'
      },
      {
        question: 'Is my privacy protected during the PNG to JPG conversion?',
        answer: 'Absolutely. Nexvert processes every image client-side in your browser memory. We never transmit your images to any database or server, keeping your sensitive photos 100% secure.'
      },
      {
        question: 'What happens to transparent backgrounds in my PNG file?',
        answer: 'Since the JPG format does not support transparency, any transparent areas in your PNG image will automatically be filled with a solid, professional white background.'
      }
    ],
    relatedSlugs: ['png-to-webp', 'jpg-to-png', 'webp-to-jpg']
  },
  'jpg-to-png': {
    slug: 'jpg-to-png',
    fromFormat: 'jpg',
    toFormat: 'png',
    title: 'Convert JPG to PNG Free — Nexvert',
    metaDescription: 'Convert JPG photos to PNG format for free, instantly, and securely. Keep your graphics crisp and lossless. No server upload required.',
    h1: 'Convert JPG to PNG Free',
    introParagraph: 'Converting JPG to PNG is the ideal solution when you need to prevent additional image degradation or prepare assets for graphic design. JPG is a lossy format, meaning it loses quality every time it is saved. PNG, on the other hand, utilizes robust lossless compression, ensuring your vector logos, text-based screenshots, or layered designs remain perfectly crisp. Nexvert provides a free, secure, and lightning-fast local converter that transforms JPEG streams into stable PNG assets instantly. By bypassing traditional server uploads, our application performs all pixel extraction in your browser canvas. This maximizes performance and guarantees absolute data protection for personal and professional image catalogs.',
    steps: [
      'Choose or drag your JPG file into the converter box above.',
      'Select PNG as your target format option.',
      'Click Convert to transform the file and download your crisp, lossless PNG file.'
    ],
    faqs: [
      {
        question: 'Does converting JPG to PNG make the image higher quality?',
        answer: 'No, converting a lossy JPG to PNG will not restore lost details. It does, however, prevent any further degradation during editing and saves the file in a lossless format.'
      },
      {
        question: 'Why is my converted PNG file larger than the original JPG?',
        answer: 'PNG uses lossless compression to preserve full pixel accuracy, which naturally results in larger file sizes compared to the highly compressed lossy JPG format.'
      },
      {
        question: 'Can I use this tool to add a transparent background to a JPG?',
        answer: 'A standard converter cannot automatically make backgrounds transparent, but saving in PNG format prepares the file so you can open it in an editor and export transparent pixels.'
      }
    ],
    relatedSlugs: ['png-to-jpg', 'webp-to-jpg', 'png-to-webp']
  },
  'png-to-webp': {
    slug: 'png-to-webp',
    fromFormat: 'png',
    toFormat: 'webp',
    title: 'Convert PNG to WEBP Free — Nexvert',
    metaDescription: 'Convert PNG images to WEBP for free. Modern next-gen compression with full transparency support. 100% private in-browser conversion.',
    h1: 'Convert PNG to WEBP Free',
    introParagraph: 'WEBP is a modern, next-generation image format developed by Google to optimize loading speeds on the modern web. By converting PNG to WEBP, you can achieve up to 30% smaller file sizes than PNG while retaining full alpha transparency and rich visual detail. This makes WEBP the absolute standard for web developers looking to improve page loading speeds, SEO rankings, and Core Web Vitals. Our Nexvert tool enables you to convert PNG to WEBP without sending your private files across the web. The conversion engine is executed strictly in your local sandbox, keeping your workflows completely confidential while instantly compiling web-ready graphics.',
    steps: [
      'Upload your PNG file into the container above.',
      'Set the quality level to determine the next-gen compression ratio.',
      'Click the Convert button and download your lightweight WEBP image file.'
    ],
    faqs: [
      {
        question: 'Is WEBP better than PNG for web performance?',
        answer: 'Yes, WEBP is significantly superior for web performance. It supports transparency like PNG but generates much smaller file sizes, which results in faster page loading speeds.'
      },
      {
        question: 'Will my transparent PNG remain transparent in WEBP?',
        answer: 'Yes, WEBP has full native support for alpha transparency, meaning any transparent overlays or icons will remain perfectly clear after conversion.'
      },
      {
        question: 'Is the WEBP format compatible with all modern browsers?',
        answer: 'Yes, WEBP is fully supported by all modern web browsers, including Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge.'
      }
    ],
    relatedSlugs: ['png-to-jpg', 'webp-to-jpg', 'webp-to-png']
  },
  'webp-to-jpg': {
    slug: 'webp-to-jpg',
    fromFormat: 'webp',
    toFormat: 'jpg',
    title: 'Convert WEBP to JPG Free — Nexvert',
    metaDescription: 'Convert WEBP files to JPG format for free and instantly. Maximum compatibility for legacy software and offline use. Done 100% locally.',
    h1: 'Convert WEBP to JPG Free',
    introParagraph: 'While WEBP is fantastic for loading websites, it is often unsupported by older image viewers, email clients, print services, and local editing suites. Converting WEBP to JPG ensures maximum universal compatibility so you can open, print, or share your files without worrying about software constraints. Our client-side conversion suite handles WEBP decoding and JPG encoding with zero backend lag. Because the conversion runs locally in your browser memory, it is extremely fast and entirely confidential. Save time and bandwidth by processing your conversions instantly on Nexvert, the internet’s safest local file converter.',
    steps: [
      'Drag and drop or browse for your WEBP image.',
      'Select JPG as the target format and adjust the image quality.',
      'Click the Convert button and download your universally compatible JPG file.'
    ],
    faqs: [
      {
        question: 'Why should I convert WEBP to JPG?',
        answer: 'The primary reason is compatibility. JPG is universally supported across older devices, operating systems, word processors, and professional printing services.'
      },
      {
        question: 'Does this converter upload my files to any cloud server?',
        answer: 'No, all file processing is performed locally in your browser using the HTML5 Canvas API. Your files never touch our servers, protecting your privacy completely.'
      },
      {
        question: 'How long does the WEBP to JPG conversion take?',
        answer: 'It is practically instantaneous, usually taking less than half a second depending on the original image dimensions.'
      }
    ],
    relatedSlugs: ['png-to-jpg', 'webp-to-png', 'jpg-to-png']
  },
  'docx-to-pdf': {
    slug: 'docx-to-pdf',
    fromFormat: 'docx',
    toFormat: 'pdf',
    title: 'Convert DOCX to PDF Free — Nexvert',
    metaDescription: 'Convert Word DOCX files to professional PDF documents for free. Clean layouts, lossless embedded graphics, and fully private local conversion.',
    h1: 'Convert DOCX to PDF Free',
    introParagraph: 'DOCX to PDF turns a Word document into a PDF you can share or print, directly in your browser. The document’s text, headings, lists, bold and italic text are read with the Mammoth library and laid out as a clean A4 or Letter PDF, with a live preview and page count before you download. It is designed for text-focused documents such as letters, notes and reports; complex Word layouts — multi-column pages, text boxes, headers and footers, and precise fonts — are simplified rather than reproduced exactly. Your file is never uploaded.',
    steps: [
      'Choose your .docx file — the conversion starts automatically.',
      'Check the preview and page count, and pick A4 or Letter page size if needed.',
      'Click Download .pdf to save the document.'
    ],
    faqs: [
      {
        question: 'Will the PDF look exactly like my Word document?',
        answer: 'Text, headings, lists and emphasis are kept, but complex layouts, custom fonts, text boxes, headers/footers and exact spacing are simplified. For pixel-perfect output, use Word’s own "Save as PDF".'
      },
      {
        question: 'Can I convert old .doc files?',
        answer: 'No. Only the modern .docx format is supported. Open a .doc file in Word, Google Docs or LibreOffice and save it as .docx first.'
      },
      {
        question: 'Is my document uploaded to a server?',
        answer: 'No. The document is parsed and the PDF is generated in your browser, so confidential files stay on your device.'
      }
    ],
    relatedSlugs: ['jpg-to-pdf', 'pdf-merge', 'pdf-split']
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    fromFormat: 'jpg',
    toFormat: 'pdf',
    title: 'Convert JPG to PDF Free — Nexvert',
    metaDescription: 'Convert JPG, PNG, and WEBP images into clean PDF documents for free. Fits photo pages perfectly. Fast, secure, and 100% private.',
    h1: 'Convert JPG to PDF Free',
    introParagraph: 'JPG to PDF combines one or more photos into a single PDF document — ideal for scanned receipts, ID copies, homework photos and portfolios. Add JPG, PNG, WEBP or BMP images, put them in order, and choose A4, US Letter or fit-to-image page size, portrait, landscape or automatic orientation, and a margin. JPG photos are embedded without re-compression, so they keep their original quality; other formats are converted losslessly to PNG before embedding. Everything runs in your browser.',
    steps: [
      'Add your JPG, PNG, WEBP or BMP images and arrange their order.',
      'Choose page size (A4, Letter or fit to image), orientation and margin.',
      'Convert and download the combined PDF.'
    ],
    faqs: [
      {
        question: 'Does converting JPG to PDF reduce image quality?',
        answer: 'No. JPG files are embedded as-is without re-compression, and other formats are converted to lossless PNG first.'
      },
      {
        question: 'Can I combine several images into one PDF?',
        answer: 'Yes. Each image becomes one page, in the order you set.'
      },
      {
        question: 'Which page size should I choose?',
        answer: 'A4 or Letter for printing and official documents; Fit to Image Size if you want each page to match the photo exactly.'
      }
    ],
    relatedSlugs: ['docx-to-pdf', 'pdf-merge', 'pdf-split']
  },
  'pdf-merge': {
    slug: 'pdf-merge',
    fromFormat: 'pdf',
    toFormat: 'pdf',
    title: 'Merge PDF Files Free — Nexvert',
    metaDescription: 'Merge multiple PDF documents into a single consolidated PDF file for free. Super-fast browser-side joining. 100% private.',
    h1: 'Merge PDF Files Free',
    introParagraph: 'PDF Merge combines several PDF files into one document in the order you choose — for example a cover letter, CV and certificates, or monthly statements. Add the PDFs, reorder them with the up and down controls, and merge. All pages are copied with their text, images and fonts intact. The merge runs in your browser with the pdf-lib library, so private documents are never uploaded.',
    steps: [
      'Select two or more PDF files.',
      'Put the files in the order you want with the move up and down controls.',
      'Click Merge and download the combined PDF.'
    ],
    faqs: [
      {
        question: 'Is there a limit to how many PDFs I can merge?',
        answer: 'There is no fixed number of files. The practical limit is your device’s memory, with each file up to 100 MB.'
      },
      {
        question: 'Are bookmarks and form fields kept?',
        answer: 'Page content — text, images, fonts and links on the page — is kept. Document-level features such as the bookmark outline and interactive form fields may not carry over to the merged file.'
      },
      {
        question: 'Can I merge password-protected PDFs?',
        answer: 'Encrypted PDFs must be unlocked first. Remove the password in your PDF reader, then merge the unlocked copy.'
      }
    ],
    relatedSlugs: ['pdf-split', 'docx-to-pdf', 'jpg-to-pdf']
  },
  'pdf-split': {
    slug: 'pdf-split',
    fromFormat: 'pdf',
    toFormat: 'zip',
    title: 'Split PDF Pages Free — Nexvert',
    metaDescription: 'Split PDF files into individual pages or custom ranges for free. Extract separate sheets into a neat ZIP archive safely and privately.',
    h1: 'Split PDF Pages Free',
    introParagraph: 'PDF Split separates a multi-page PDF into smaller files. Choose "all pages" to save every page as its own PDF, or enter custom page ranges such as 1-3, 5, 8-10 to create one PDF per range. The results are packaged in a single ZIP download. Pages are copied exactly as they are, with the original text, fonts and images, and the whole process runs in your browser.',
    steps: [
      'Upload the PDF you want to split.',
      'Choose "all pages" or enter custom page ranges.',
      'Split and download the ZIP containing the separate PDFs.'
    ],
    faqs: [
      {
        question: 'How do I extract only a few pages?',
        answer: 'Use custom ranges, for example 2-4 to get pages 2, 3 and 4 as one PDF. To pull pages into a single new document you can also use Extract PDF Pages.'
      },
      {
        question: 'Why do the pages download as a ZIP?',
        answer: 'Splitting usually creates several PDFs, so they are bundled into one ZIP file for a single download.'
      },
      {
        question: 'Can I split a password-protected PDF?',
        answer: 'Encrypted PDFs need to be unlocked first; remove the password in your PDF reader and split the unlocked copy.'
      }
    ],
    relatedSlugs: ['pdf-merge', 'jpg-to-pdf', 'docx-to-pdf']
  },
  'mp4-to-mp3': {
    slug: 'mp4-to-mp3',
    fromFormat: 'mp4',
    toFormat: 'mp3',
    title: 'Convert MP4 to MP3 Free — Nexvert',
    metaDescription: 'Convert MP4 videos to MP3 audio files for free. Extract high-quality soundtracks, audio streams, and voice notes safely and 100% offline.',
    h1: 'Convert MP4 to MP3 Free',
    introParagraph: 'MP4 to MP3 extracts the audio track from an MP4 video and saves it as an MP3 — useful for lectures, interviews, podcasts recorded on video, and music clips. Choose 128, 192, 256 or 320 kbps, preview the result in the built-in player, and download. The conversion uses ffmpeg compiled to WebAssembly and runs entirely in your browser; the video engine (about 31 MB) downloads once and is then cached.',
    steps: [
      'Select the MP4 video.',
      'Choose the MP3 bitrate: 128, 192, 256 or 320 kbps.',
      'Convert, preview the audio, and download the MP3.'
    ],
    faqs: [
      {
        question: 'Which bitrate should I choose?',
        answer: '192 kbps is a good default. Use 128 kbps for speech to save space and 256–320 kbps for music. A higher bitrate cannot add quality the original audio did not have.'
      },
      {
        question: 'Can I extract audio from MOV, WebM or AVI?',
        answer: 'Yes — use the Video to MP3 tool, which accepts MP4, MOV, WebM and AVI files.'
      },
      {
        question: 'Is my video uploaded?',
        answer: 'No. The audio is extracted on your device with ffmpeg.wasm; the video never leaves your browser.'
      }
    ],
    relatedSlugs: ['video-to-mp3', 'audio-converter', 'video-converter']
  },
  'video-to-mp3': {
    slug: 'video-to-mp3',
    fromFormat: 'video',
    toFormat: 'mp3',
    title: 'Convert Video to MP3 Free — Nexvert',
    metaDescription: 'Convert video files (MP4, WebM, MOV) to MP3 audio for free. Extract high-bitrate soundtracks instantly and privately inside your browser.',
    h1: 'Convert Video to MP3 Free',
    introParagraph: 'Video to MP3 extracts the soundtrack from MP4, MOV, WebM and AVI videos and saves it as an MP3 at 128, 192, 256 or 320 kbps. Preview the extracted audio in the built-in player before downloading. It runs on ffmpeg compiled to WebAssembly inside your browser, so there are no upload waits and your videos stay private. The first use downloads the video engine (about 31 MB), which is then cached.',
    steps: [
      'Choose an MP4, MOV, WebM or AVI video.',
      'Pick the MP3 bitrate.',
      'Convert, listen to the preview, and download the MP3.'
    ],
    faqs: [
      {
        question: 'Which video formats are supported?',
        answer: 'MP4, MOV, WebM and AVI. Videos without an audio track cannot produce an MP3.'
      },
      {
        question: 'Can I preview the audio before downloading?',
        answer: 'Yes. A player appears after conversion so you can check the result.'
      },
      {
        question: 'Why is the first conversion slower?',
        answer: 'The ffmpeg video engine downloads once (about 31 MB). Later conversions start immediately.'
      }
    ],
    relatedSlugs: ['mp4-to-mp3', 'audio-converter', 'video-converter']
  },
  'audio-converter': {
    slug: 'audio-converter',
    fromFormat: 'audio',
    toFormat: 'wav',
    title: 'Free Audio Converter — Nexvert',
    metaDescription: 'Convert audio files between MP3, WAV, OGG, M4A, and WebM for free. Adjust bitrates and channels safely offline in your browser.',
    h1: 'Free Audio Converter',
    introParagraph: 'The Audio Converter turns audio files into MP3 or WAV. It reads MP3, WAV, OGG, M4A, WebM, FLAC and AAC files (whatever your browser can decode) and encodes a genuine MP3 at 128, 192, 256 or 320 kbps with the LAME encoder, or an uncompressed 16-bit PCM WAV for editing. Preview the original and the converted file in the built-in player. Conversion runs locally in your browser.',
    steps: [
      'Upload an MP3, WAV, OGG, M4A, WebM, FLAC or AAC file.',
      'Choose MP3 (with bitrate) or WAV as the output.',
      'Convert, preview, and download the new file.'
    ],
    faqs: [
      {
        question: 'Which formats can I convert to?',
        answer: 'MP3 (128–320 kbps) and 16-bit PCM WAV. Input can be any format your browser decodes, including MP3, WAV, OGG, M4A, WebM, FLAC and AAC.'
      },
      {
        question: 'What is the difference between MP3 and WAV?',
        answer: 'WAV is uncompressed and ideal for editing; MP3 is compressed and much smaller, which suits listening and sharing.'
      },
      {
        question: 'Is my audio uploaded?',
        answer: 'No. Decoding and encoding happen on your device.'
      }
    ],
    relatedSlugs: ['mp4-to-mp3', 'video-to-mp3', 'video-converter']
  },
  'video-converter': {
    slug: 'video-converter',
    fromFormat: 'video',
    toFormat: 'mp4',
    title: 'Free Video Converter — Nexvert',
    metaDescription: 'Convert video formats (MP4, WebM, MOV) for free. Adjust resolution and parameters locally in your browser without cloud uploads.',
    h1: 'Free Video Converter',
    introParagraph: 'The Video Converter changes a video’s format so it plays on the device or platform you need. It accepts MP4, MOV, WebM and AVI files and converts them to MP4 (H.264 video with AAC audio — the most compatible format for phones, TVs and social media) or WebM (VP8 with Vorbis audio for the web). Conversion runs on ffmpeg compiled to WebAssembly in your browser, so your footage is never uploaded. The video engine (about 31 MB) is downloaded once and cached.',
    steps: [
      'Choose an MP4, MOV, WebM or AVI video.',
      'Select MP4 (H.264) or WebM (VP8) as the output.',
      'Convert and download the new video.'
    ],
    faqs: [
      {
        question: 'Which output format should I pick?',
        answer: 'MP4 (H.264/AAC) plays almost everywhere — iPhone, Android, Windows, TVs, WhatsApp and social networks. Choose WebM only for web pages that specifically need it.'
      },
      {
        question: 'How long does conversion take?',
        answer: 'It depends on your device and the video length. Browser-based encoding is slower than desktop software, so short clips (a few minutes) work best.'
      },
      {
        question: 'Is my video kept private?',
        answer: 'Yes. Decoding and encoding run in your browser; nothing is uploaded.'
      }
    ],
    relatedSlugs: ['audio-converter', 'mp4-to-mp3', 'video-to-mp3']
  },
  'svg-converter': {
    slug: 'svg-converter',
    fromFormat: 'svg',
    toFormat: 'png',
    title: 'Free SVG Vector Converter — Nexvert',
    metaDescription: 'Convert SVG vector files to PNG, JPG, or WEBP for free. Choose output resolutions and render sizes safely offline in your browser.',
    h1: 'Free SVG Vector Converter',
    introParagraph: 'SVG files are great for responsive web layouts, but they aren\'t supported on some social networks or design platforms. Our SVG Converter lets you convert vector files into high-quality PNG, JPG, or WEBP raster images. Nexvert runs fully offline, allowing you to set custom widths and heights while keeping your designs secure.',
    steps: [
      'Upload your SVG vector file into the container above.',
      'Set your target format (PNG, JPG, or WEBP) and output dimensions.',
      'Download your crisp, high-quality raster image instantly.'
    ],
    faqs: [
      {
        question: 'What formats can I convert SVG to?',
        answer: 'You can convert SVG files to PNG, JPG, or WEBP raster formats.'
      },
      {
        question: 'Can I render SVGs at very high resolutions?',
        answer: 'Yes! Since SVGs are scalable, you can render them at large dimensions without losing any image quality.'
      },
      {
        question: 'Are my vector designs uploaded?',
        answer: 'No, all rendering is handled locally in your web browser, keeping your vector art secure.'
      }
    ],
    relatedSlugs: ['png-to-jpg', 'png-to-webp', 'jpg-to-png']
  }
};

const IMAGE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'heic']);

/** True when a landing page converts image -> image and should embed the canvas image converter. */
export function isImageLandingPage(config: ConversionPageConfig): boolean {
  return IMAGE_FORMATS.has(config.fromFormat) && IMAGE_FORMATS.has(config.toFormat);
}
