/**
 * Single Source of Truth for all public indexable routes across Nexvert.
 * Used for auto-generating sitemap.xml, build-time pre-rendering, and router navigation.
 */

import { TOTAL_TOOLS_COUNT, UTILITY_TOOLS_COUNT } from './navigation.config';
import { SITE_CANONICAL_DOMAIN, SITE_NAME, SITE_URL } from './site.config';

export { SITE_CANONICAL_DOMAIN, SITE_NAME, SITE_URL };

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  category: 'core' | 'video' | 'audio' | 'image' | 'pdf-doc' | 'gif' | 'tools' | 'archive' | 'guides' | 'trust' | 'developer';
  sitemapGroup: 'pages' | 'converters' | 'tools';
  includeInSitemap?: boolean;
  /** Set on duplicate-intent URLs: canonical points to this path and the URL is left out of the sitemap. */
  canonicalPath?: string;
}

export const PUBLIC_ROUTES: RouteConfig[] = [
  // Core & Landing
  {
    path: '/',
    title: 'Nexvert: Free Online File Converter for PDF, Images, Video & Audio',
    description: 'Convert PDF, JPG, PNG, HEIC, WEBP, MP4, MP3 and 50+ formats for free. 190+ online tools that run in your browser — no uploads, no sign-up, no watermarks.',
    category: 'core',
    sitemapGroup: 'pages'
  },

  // Image Converters & Tools
  {
    path: '/png-to-jpg/',
    title: 'Convert PNG to JPG Free — Nexvert',
    description: 'Convert PNG images to JPG format for free, instantly, and completely privacy-safe. All processing is local in your browser—no file uploads required.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/jpg-to-png/',
    title: 'Convert JPG to PNG Free — Nexvert',
    description: 'Convert JPG photos to PNG format for free, instantly, and securely. Keep your graphics crisp and lossless. No server upload required.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/png-to-webp/',
    title: 'Convert PNG to WEBP Free — Nexvert',
    description: 'Convert PNG images to WEBP for free. Modern next-gen compression with full transparency support. 100% private in-browser conversion.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/webp-to-jpg/',
    title: 'Convert WEBP to JPG Free — Nexvert',
    description: 'Convert WEBP files to standard JPG photos instantly in your browser. Universal device compatibility without sending files over the network.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/webp-to-png/',
    title: 'Convert WEBP to PNG Free — Nexvert',
    description: 'Convert WEBP images to lossless PNG format for free. Preserve transparent overlays and vector graphics with zero server uploads.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/jfif-to-png/',
    title: 'Convert JFIF to PNG Free — Nexvert',
    description: 'Convert JFIF images to clean PNG graphics instantly. Solve compatibility issues with a fast in-browser file converter.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/svg-converter/',
    title: 'Free SVG Vector Converter — Nexvert',
    description: 'Convert SVG vector graphics to PNG, JPG, or WEBP instantly. High-resolution rendering with 100% in-browser privacy.',
    category: 'image',
    sitemapGroup: 'converters'
  },
  {
    path: '/image-compressor/',
    title: 'Free Image Compressor – Reduce Image File Size — Nexvert',
    description: 'Compress PNG, JPG, and WEBP images without losing quality. In-browser client-side optimization.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/jpeg-compressor/',
    title: 'Free JPEG & JPG Compressor — Nexvert',
    description: 'Compress JPG and JPEG photos for free. Smart lossy compression reduces footprint for email and web loading.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/png-compressor/',
    title: 'Free PNG Image Compressor — Nexvert',
    description: 'Compress PNG images while retaining transparent layers and crisp details. 100% local browser processing.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/resize-image/',
    title: 'Free Image Resizer – Change Image Dimensions — Nexvert',
    description: 'Resize image width and height for free. Instant pixel dimensions adjustment in your browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/crop-image/',
    title: 'Free Image Cropper – Crop Photos Free — Nexvert',
    description: 'Crop images and photos with custom aspect ratios. Quick, secure in-browser image cropping tool.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/color-picker/',
    canonicalPath: '/image-color-picker/',
    includeInSitemap: false,
    title: 'Free Image Color Picker Tool – Extract HEX & RGB — Nexvert',
    description: 'Pick colors from any uploaded image and copy HEX, RGB, or HSL codes instantly in your browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/rotate-image/',
    title: 'Free Image Rotator – Rotate Photos 90° 180° 270° — Nexvert',
    description: 'Rotate images and photos clockwise or counterclockwise instantly in your browser without quality loss.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/flip-image/',
    title: 'Free Image Flipper – Mirror Photos Online — Nexvert',
    description: 'Flip images horizontally or vertically for free. Instant mirror transformation in your browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-enlarger/',
    title: 'Free Image Enlarger & Upscaler — Nexvert',
    description: 'Upscale and enlarge image resolution without blur using smooth client-side interpolation. Free, private, and photos never leave your device.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/brightness-contrast/',
    title: 'Adjust Image Brightness & Contrast — Nexvert',
    description: 'Adjust image brightness and contrast with live canvas preview and 100% in-browser privacy.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/saturation-adjuster/',
    title: 'Adjust Image Saturation Free — Nexvert',
    description: 'Tune color saturation dynamically with real-time browser-based image filtering. Free, from fully desaturated to vivid, with no upload required.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/grayscale-converter/',
    title: 'Convert Image to Grayscale (B&W) — Nexvert',
    description: 'Convert photos to crisp black and white grayscale images with custom intensity controls. Free, instant, and processed locally with no upload.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/invert-colors/',
    title: 'Invert Image Colors – Negative Photo Filter — Nexvert',
    description: 'Invert image colors into film negatives instantly inside your web browser. Free, one-click color inversion with no upload and no watermark.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/sepia-filter/',
    title: 'Apply Sepia Tone Photo Filter — Nexvert',
    description: 'Add vintage warm sepia photo effects with adjustable tone intensity. Free, instant retro toning that runs entirely inside your web browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/blur-image/',
    title: 'Blur Image Free – Selective Photo Blurring — Nexvert',
    description: 'Apply adjustable Gaussian blur to photos and screenshots for privacy or artistic focus. Free, instant, and processed locally without any upload.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/pixelate-image/',
    title: 'Pixelate Image & Censor — Nexvert',
    description: 'Censor sensitive details or create retro 8-bit mosaic blocks with adjustable pixel size. Free and private, with images never leaving your device.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-sharpener/',
    title: 'Sharpen Image Free – Spatial Edge Enhancement — Nexvert',
    description: 'Enhance image edge contrast and sharpness with real 3x3 convolution kernel filtering. Free, adjustable, and processed entirely in your browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/add-watermark/',
    title: 'Add Watermark to Image – Text & Logo Watermarking — Nexvert',
    description: 'Stamp custom text or image watermarks with precise opacity, rotation and positioning. Free, private, and processed locally without uploading files.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/add-border/',
    title: 'Add Border to Image Free — Nexvert',
    description: 'Add custom frames and colored borders with rounded inner margins to your photos. Free, runs in your browser, and never uploads your images.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/round-corners/',
    title: 'Round Image Corners Free – Transparent PNG Output — Nexvert',
    description: 'Round photo corners smoothly and export as transparent 32-bit PNG graphics. Free, adjustable radius, and processed locally with no upload.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-collage/',
    title: 'Photo Collage Maker Free – 2x2, 3x3 Grid Layouts — Nexvert',
    description: 'Assemble multiple pictures into custom collage grids with adjustable margins and background colors.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/meme-generator/',
    title: 'Meme Generator Free – Impact Font & Outlines — Nexvert',
    description: 'Generate memes with classic bold Impact typography and heavy black stroke borders. Free, watermark-free, and rendered entirely in your browser.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/photo-to-sketch/',
    title: 'Photo to Pencil Sketch – Realistic Graphite Drawing — Nexvert',
    description: 'Transform images into pencil drawings using authentic color-dodge blend inversion. Free, adjustable, and processed locally with no file upload.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-color-picker/',
    title: 'Image Color Picker & Loupe — Nexvert',
    description: 'Sample colors from any image pixel and copy HEX, RGB and HSL values instantly. Free browser-based eyedropper with no upload and no sign-up.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-metadata-viewer/',
    title: 'EXIF Metadata Viewer – Camera, GPS & Exposure Data — Nexvert',
    description: 'Extract and inspect camera specs, GPS coordinates, shutter speeds, ISO, and raw EXIF headers.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/remove-exif/',
    title: 'Remove EXIF Metadata – Sanitize Photos & GPS — Nexvert',
    description: 'Scrub GPS coordinates, camera serials and timestamps from photos by re-encoding clean raw pixels. Free metadata removal that never uploads files.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/bulk-image-compressor/',
    title: 'Bulk Image Compressor – Batch Compress to ZIP — Nexvert',
    description: 'Compress multiple JPG, PNG, and WEBP images in parallel and download all in a single ZIP file.',
    category: 'image',
    sitemapGroup: 'tools'
  },

  // Video & Audio Converters & Tools
  {
    path: '/video-converter/',
    title: 'Free Video Converter – Convert MP4, MOV, WEBM & AVI — Nexvert',
    description: 'Convert video files for free. In-browser client-side video conversion with full data privacy.',
    category: 'video',
    sitemapGroup: 'converters'
  },
  {
    path: '/mp4-converter/',
    title: 'Free MP4 Video Converter — Nexvert',
    description: 'Convert videos to and from MP4 format for free. Fast, private, in-browser video processing.',
    category: 'video',
    sitemapGroup: 'converters'
  },
  {
    path: '/mov-to-mp4/',
    title: 'Convert MOV to MP4 Free — Nexvert',
    description: 'Convert QuickTime MOV videos to universal MP4 format for free. Plays anywhere, keeps original quality, and never uploads your video to a server.',
    category: 'video',
    sitemapGroup: 'converters'
  },
  {
    path: '/video-to-mp3/',
    title: 'Convert Video to MP3 Audio Free — Nexvert',
    description: 'Extract crystal-clear audio tracks from videos and save as MP3 files. Fast in-browser conversion.',
    category: 'video',
    sitemapGroup: 'converters'
  },
  {
    path: '/mp4-to-mp3/',
    title: 'Convert MP4 to MP3 Free — Nexvert',
    description: 'Extract MP3 sound from MP4 videos instantly in your browser. 100% private and offline capable.',
    category: 'video',
    sitemapGroup: 'converters'
  },
  {
    path: '/video-compressor/',
    title: 'Free Video Compressor – Reduce Video File Size — Nexvert',
    description: 'Compress MP4 and WEBM video files without quality loss. Reduce video sizes directly in your browser.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/crop-video/',
    title: 'Free Video Cropper Tool – Crop Video Aspect Ratios — Nexvert',
    description: 'Crop video frame dimensions for free. Customize video boundaries directly in your browser.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/trim-video/',
    canonicalPath: '/video-trimmer/',
    includeInSitemap: false,
    title: 'Trim Video Online Free – Cut Video Clips Instantly — Nexvert',
    description: 'Trim and cut video clips for free. Fast, frame-accurate video trimming in your browser.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/video-trimmer/',
    title: 'Free Video Trimmer & Stream Cutter — Nexvert',
    description: 'Trim and cut video clips with precise start and end points and fast stream copy. Free, lossless trimming with no upload and no watermark.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/mute-video/',
    title: 'Mute Video Free – Strip Audio from Video — Nexvert',
    description: 'Remove audio tracks from MP4, MOV and WEBM video clips with zero re-encoding loss. Free, instant muting that runs entirely inside your browser.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/video-resize/',
    title: 'Free Video Resizer – Change Video Resolution — Nexvert',
    description: 'Scale and resize video dimensions to 1080p, 720p, 480p or fully custom sizes. Free browser-based resizing that never uploads your footage.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/extract-video-frames/',
    title: 'Extract Video Frames – Save Frames as Images — Nexvert',
    description: 'Extract high-resolution video frames at custom time intervals and export as a ZIP archive.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/video-info/',
    title: 'Video Metadata & Stream Inspector — Nexvert',
    description: 'Inspect video codecs, resolution, duration, bitrate, and audio streams with WebAssembly FFprobe.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-converter/',
    title: 'Free Audio Converter – Convert MP3, WAV, OGG & WEBM — Nexvert',
    description: 'Convert audio tracks between popular formats for free. 100% local, secure audio conversion.',
    category: 'audio',
    sitemapGroup: 'converters'
  },
  {
    path: '/mp3-compressor/',
    title: 'Free MP3 Audio Compressor – Reduce MP3 Size — Nexvert',
    description: 'Compress MP3 audio files without destroying sound quality. Smart client-side audio compression.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/wav-to-mp3/',
    title: 'Convert WAV to MP3 Free — Nexvert',
    description: 'Convert WAV audio files to high-fidelity MP3 with genuine local LAME encoding. Free, choose your bitrate, and nothing is uploaded to a server.',
    category: 'audio',
    sitemapGroup: 'converters'
  },
  {
    path: '/mp3-to-wav/',
    title: 'Convert MP3 to WAV Free — Nexvert',
    description: 'Decode MP3 files to 16-bit uncompressed PCM WAV audio instantly in your browser. Free, lossless output for editing and mastering, with no upload.',
    category: 'audio',
    sitemapGroup: 'converters'
  },
  {
    path: '/audio-trimmer/',
    title: 'Free Audio Trimmer & Cutter – Cut Music & Sound — Nexvert',
    description: 'Cut, split and trim audio tracks with live waveform visualization and MP3 or WAV export. Free, precise, and processed entirely inside your browser.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-merger/',
    title: 'Free Audio Merger & Joiner – Combine Tracks — Nexvert',
    description: 'Combine and concatenate multiple audio files into a single seamless track. Free, gapless MP3 and WAV merging that happens entirely in your browser.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-speed-changer/',
    title: 'Audio Speed Changer – Adjust Tempo & Pitch — Nexvert',
    description: 'Change audio tempo and speed with optional pitch preservation using time-stretching. Free, runs locally in your browser, and keeps files private.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-volume/',
    title: 'Audio Volume Booster & Normalizer — Nexvert',
    description: 'Boost audio volume, attenuate gain or normalize peak loudness to 0 dBFS. Free browser-based volume control with no upload and no quality loss.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-reverser/',
    title: 'Free Audio Reverser – Play Audio Backwards — Nexvert',
    description: 'Reverse audio files and hear sounds backwards with sample-accurate playback. Free browser-based reversing for MP3 and WAV, with nothing uploaded.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-to-mono/',
    title: 'Convert Stereo to Mono Audio Free — Nexvert',
    description: 'Downmix stereo or multi-channel audio tracks into mono to halve file size. Free browser-based conversion for MP3 and WAV with no upload required.',
    category: 'audio',
    sitemapGroup: 'converters'
  },
  {
    path: '/audio-info/',
    title: 'Audio Metadata & File Inspector — Nexvert',
    description: 'Inspect exact sample rate, true duration, channels, peak dBFS and RMS loudness. Free metadata analysis that runs in your browser with no upload.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/voice-recorder/',
    title: 'Free Voice Recorder & Microphone Capture — Nexvert',
    description: 'Record voice or audio from your microphone with live visualizer and genuine MP3 or WAV export.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/silence-remover/',
    title: 'Audio Silence Remover – Trim Dead Air — Nexvert',
    description: 'Automatically detect and remove dead air and silent pauses from audio recordings. Free, adjustable threshold, and processed inside your browser.',
    category: 'audio',
    sitemapGroup: 'tools'
  },

  // GIF Tools
  {
    path: '/video-to-gif/',
    title: 'Convert Video to GIF Animated Free — Nexvert',
    description: 'Convert MP4, MOV and WEBM video clips into animated GIF images for free. Choose frame rate, size and duration, all inside your own browser.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/mp4-to-gif/',
    title: 'Convert MP4 to GIF Free — Nexvert',
    description: 'Turn MP4 videos into shareable animated GIFs instantly in your browser with zero server uploads.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/webm-to-gif/',
    title: 'Convert WEBM to GIF Free — Nexvert',
    description: 'Convert WEBM screen recordings and videos into animated GIF images for free. Adjustable frame rate and size, processed entirely in your browser.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/gif-to-mp4/',
    title: 'Convert GIF to MP4 Video Free — Nexvert',
    description: 'Convert animated GIFs into lightweight MP4 video files to save 80% bandwidth on mobile sites.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/image-to-gif/',
    title: 'Convert Images to Animated GIF Free — Nexvert',
    description: 'Combine multiple static images into an animated GIF slideshow for free. Set frame delay and loop count in your browser with no upload needed.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/mov-to-gif/',
    title: 'Convert MOV to GIF Free — Nexvert',
    description: 'Convert QuickTime MOV files into animated GIFs for free with adjustable size and frame rate. Fast in-browser processing with no upload.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/avi-to-gif/',
    title: 'Convert AVI to GIF Free — Nexvert',
    description: 'Convert AVI videos to animated GIFs for free with adjustable frame rate and size. Smooth browser-based conversion that never uploads your video.',
    category: 'gif',
    sitemapGroup: 'converters'
  },
  {
    path: '/gif-maker/',
    title: 'Free Animated GIF Maker — Nexvert',
    description: 'Create custom animated GIFs from images or video clips for free in your browser. Control frame rate, size and looping with no upload required.',
    category: 'gif',
    sitemapGroup: 'tools'
  },
  {
    path: '/gif-resizer/',
    title: 'Free Animated GIF Resizer – Resize GIF Dimensions — Nexvert',
    description: 'Resize animated GIF files with precision scaling while keeping animation timing intact. Free, browser-based, and your GIFs are never uploaded.',
    category: 'gif',
    sitemapGroup: 'tools'
  },
  {
    path: '/gif-splitter/',
    title: 'Free GIF Frame Splitter – Extract GIF Frames to PNG — Nexvert',
    description: 'Split animated GIFs into individual PNG frames and download them as a ZIP archive. Free frame extraction that runs entirely in your browser.',
    category: 'gif',
    sitemapGroup: 'tools'
  },

  // PDF & Document Tools
  {
    path: '/docx-to-pdf/',
    title: 'Convert DOCX to PDF Free — Nexvert',
    description: 'Convert Microsoft Word (.docx) documents to PDF in your browser. Basic text, headings, and formatting only; without complex Word layout preservation.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/docx-to-html/',
    title: 'Convert DOCX to HTML Free — Nexvert',
    description: 'Convert Microsoft Word (.docx) documents to clean, semantic HTML with preserved headings, lists, and tables.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/docx-to-markdown/',
    title: 'Convert DOCX to Markdown Free — Nexvert',
    description: 'Convert Microsoft Word (.docx) documents to clean GitHub-flavored Markdown (.md) syntax directly in your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/docx-to-text/',
    title: 'Convert DOCX to Plain Text Free — Nexvert',
    description: 'Extract raw clean text from Microsoft Word (.docx) files without XML bloat or server uploads.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/markdown-to-html/',
    title: 'Convert Markdown to HTML Free — Nexvert',
    description: 'Compile Markdown (.md) documents into clean, semantic HTML with live visual preview and syntax styling.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/html-to-markdown/',
    title: 'Convert HTML to Markdown Free — Nexvert',
    description: 'Convert HTML web pages and markup snippets into clean Markdown format with customizable heading and bullet styles.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/markdown-to-pdf/',
    title: 'Convert Markdown to PDF Free — Nexvert',
    description: 'Render Markdown notes directly into clean, vector-rendered PDF documents with pagination, custom margins, and headers.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/csv-to-markdown/',
    title: 'Convert CSV to Markdown Table Free — Nexvert',
    description: 'Transform CSV spreadsheets and TSV tables into clean, formatted Markdown pipe tables with column alignment.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/html-to-text/',
    title: 'Convert HTML to Plain Text Free — Nexvert',
    description: 'Strip HTML tags, scripts, and CSS styling to extract clean, readable plain text from web pages and emails.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/epub-to-text/',
    title: 'Convert EPUB to Plain Text Free — Nexvert',
    description: 'Extract the chapter text of DRM-free EPUB ebooks into a single readable plain-text document.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/epub-to-html/',
    title: 'Convert EPUB to HTML Free — Nexvert',
    description: 'Extract and assemble EPUB ebook chapters into a single readable, formatted HTML web document.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/jpg-to-pdf/',
    title: 'Convert JPG to PDF Free — Nexvert',
    description: 'Convert JPG, PNG, and photos into clean PDF documents for free. Combine multiple photos into one PDF.',
    category: 'pdf-doc',
    sitemapGroup: 'converters'
  },
  {
    path: '/pdf-merge/',
    title: 'Free PDF Merger – Combine Multiple PDFs into One — Nexvert',
    description: 'Merge multiple PDF files into one organized document for free. Drag to reorder pages, combine unlimited files, and nothing is uploaded to a server.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/pdf-split/',
    title: 'Free PDF Splitter – Extract Pages from PDF — Nexvert',
    description: 'Split PDF files into individual pages or custom page ranges for free. Fast, private splitting in your browser with no upload and no watermark.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/flatten-pdf/',
    title: 'Free Flatten PDF Tool – Lock Interactive PDF Form Fields — Nexvert',
    description: 'Flatten fillable PDF forms into permanent static pages for free. Locks form fields and annotations into the page, entirely inside your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/resize-pdf/',
    title: 'Free PDF Page Resizer – Change PDF Page Dimensions — Nexvert',
    description: 'Resize PDF page dimensions to A4, Letter or fully custom layouts for free. Scales pages without quality loss, entirely inside your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/rotate-pdf/',
    title: 'Free PDF Page Rotator – Rotate PDF Pages 90° 180° — Nexvert',
    description: 'Rotate individual pages or every page inside a PDF document for free. Fix sideways scans in 90-degree steps, entirely inside your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/crop-pdf/',
    title: 'Free PDF Page Cropper – Crop PDF Margins — Nexvert',
    description: 'Crop margins and white space off PDF pages for free in your browser. Set exact crop boxes per page with no upload, no sign-up and no watermark.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/organize-pdf/',
    title: 'Free PDF Page Organizer – Reorder PDF Pages — Nexvert',
    description: 'Reorder PDF pages visually for free: move pages up or down, then download the reorganized PDF from your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/pdf-page-remover/',
    canonicalPath: '/remove-pdf-pages/',
    includeInSitemap: false,
    title: 'Free Remove Pages from PDF Tool — Nexvert',
    description: 'Remove unwanted or blank pages from a PDF for free. Pick pages from visual thumbnails and download the cleaned PDF.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/extract-pages-from-pdf/',
    canonicalPath: '/extract-pdf-pages/',
    includeInSitemap: false,
    title: 'Free Extract Pages from PDF Tool — Nexvert',
    description: 'Extract specific page numbers or ranges out of a PDF into a new document.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/extract-pdf-pages/',
    title: 'Extract PDF Pages Free – Select and Extract Pages — Nexvert',
    description: 'Select specific pages or ranges and extract them into a brand new PDF document. Free, fast, and processed in your browser with no file upload.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/remove-pdf-pages/',
    title: 'Remove PDF Pages Free – Delete Unwanted Pages — Nexvert',
    description: 'Delete unwanted or blank pages from your PDF document with live visual preview checkboxes.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/add-page-numbers/',
    title: 'Add Page Numbers to PDF Free – Number PDF Pages — Nexvert',
    description: 'Stamp customized sequential page numbers with flexible positioning, starting offsets, and styles.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/watermark-pdf/',
    title: 'Watermark PDF Free – Add Text Watermark to PDF — Nexvert',
    description: 'Stamp custom text watermarks across every page with opacity, rotation and color settings. Free, batch-applied, and processed in your browser.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/pdf-metadata-editor/',
    title: 'PDF Metadata Editor Free – Edit Document Properties — Nexvert',
    description: 'Read and update document Title, Author, Subject, Keywords, Creator, and Producer properties.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/fill-pdf-form/',
    title: 'Fill PDF Form Fields Free – Interactive Form Filler — Nexvert',
    description: 'Detect AcroForm inputs, type into text boxes, toggle checkboxes and dropdowns, and download.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },

  // Tools Directory
  {
    path: '/extract-zip/',
    title: 'Extract ZIP – Inspect & Selectively Unpack Files — Nexvert',
    description: 'Unpack ZIP archives in your browser with file-by-file preview, checksum verification, and selective extraction.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/zip-viewer/',
    title: 'Free ZIP Viewer – Inspect ZIP Central Directory Records — Nexvert',
    description: 'Inspect ZIP internal structure, compression ratios, and CRC32 checksums from central directory headers without decompressing.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/bulk-file-zipper/',
    title: 'Bulk File Zipper – Drop Files & Folders to One ZIP — Nexvert',
    description: 'Compress and bundle dozens of files and directories into a single optimized ZIP package directly in your browser.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/split-zip/',
    title: 'Split ZIP Archive – Split Large ZIP into Fixed-Size Parts — Nexvert',
    description: 'Split large ZIP archives into fixed-size multi-part chunks for email limits and FAT32 drives, and reassemble them client-side.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/tar-to-zip/',
    title: 'Convert TAR to ZIP Free – Repack Unix Archives — Nexvert',
    description: 'Re-pack uncompressed Unix TAR tape archives into compressed DEFLATE ZIP packages client-side.',
    category: 'archive',
    sitemapGroup: 'converters'
  },
  {
    path: '/zip-to-tar/',
    title: 'Convert ZIP to TAR Free – Bundle to Unix Archive — Nexvert',
    description: 'Unpack a ZIP package and bundle into a standard uncompressed POSIX TAR tape archive client-side.',
    category: 'archive',
    sitemapGroup: 'converters'
  },
  {
    path: '/extract-tar/',
    title: 'Extract TAR Archive Free – Unpack TAR Tape Archives — Nexvert',
    description: 'Unpack Unix POSIX TAR archives directly in memory with per-file previews and selective extraction.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/merge-files/',
    title: 'Free File Combiner & Merger — Nexvert',
    description: 'Combine and merge multiple files into one consolidated download package. Free browser-based bundling with no upload, sign-up or file count limit.',
    category: 'tools',
    sitemapGroup: 'tools'
  },
  {
    path: '/create-archive/',
    title: 'Free ZIP Archive Creator – Create ZIP Files Free — Nexvert',
    description: 'Compress and bundle multiple files into a single ZIP archive directly in your browser. Free, unlimited, and your files are never sent to a server.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/extract-archive/',
    canonicalPath: '/extract-zip/',
    includeInSitemap: false,
    title: 'Free ZIP Archive Extractor – Unzip Files — Nexvert',
    description: 'Extract and inspect ZIP archive contents in your browser without software installation.',
    category: 'archive',
    sitemapGroup: 'tools'
  },

  // Tools & Category Hubs
  {
    path: '/tools/',
    title: 'Tools Directory – ' + TOTAL_TOOLS_COUNT + '+ In-Browser Converters — Nexvert',
    description: 'Explore our complete directory of ' + TOTAL_TOOLS_COUNT + '+ free file converters, PDF editors, image optimizers, and developer utilities with 100% privacy.',
    category: 'tools',
    sitemapGroup: 'tools'
  },
  {
    path: '/pdf-tools/',
    title: 'Free PDF Tools – Merge, Split, Edit & Convert — Nexvert',
    description: 'All-in-one suite of free PDF tools: convert PDF to Word, merge, split, compress, unlock, flatten, and extract pages.',
    category: 'pdf-doc',
    sitemapGroup: 'tools'
  },
  {
    path: '/image-tools/',
    title: 'Free Image Tools – Convert, Compress & Resize — Nexvert',
    description: 'Powerful in-browser image tools: convert PNG, JPG, WEBP, HEIC, SVG, compress files, crop dimensions, and pick colors.',
    category: 'image',
    sitemapGroup: 'tools'
  },
  {
    path: '/audio-tools/',
    title: 'Free Audio Tools – Convert & Compress MP3, WAV, OGG — Nexvert',
    description: 'Fast client-side audio tools: convert MP3, WAV, OGG, and compress sound tracks with crystal-clear fidelity.',
    category: 'audio',
    sitemapGroup: 'tools'
  },
  {
    path: '/video-tools/',
    title: 'Free Video Tools – Convert, Compress & Trim — Nexvert',
    description: 'Convert videos between MP4, MOV, WEBM, extract MP3 audio, convert video to GIF, and compress video sizes.',
    category: 'video',
    sitemapGroup: 'tools'
  },
  {
    path: '/archive-tools/',
    title: 'Free Archive Tools – Create & Extract ZIP Files — Nexvert',
    description: 'Create and extract ZIP, TAR, and compressed archives directly in your browser with zero file uploads.',
    category: 'archive',
    sitemapGroup: 'tools'
  },
  {
    path: '/compression-tools/',
    title: 'Free Compression Tools – Reduce Image, Video & PDF Size — Nexvert',
    description: 'Smart lossy and lossless file compressors for PDFs, JPEG, PNG, WEBP, MP4, and MP3 files with 100% privacy.',
    category: 'tools',
    sitemapGroup: 'tools'
  },

  // Supported Formats & File Security
  {
    path: '/supported-formats/',
    title: 'Supported File Formats Directory — Nexvert',
    description: 'Comprehensive directory of all supported PDF, document, image, vector, audio, video, and archive formats with Nexvert.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/file-security/',
    title: 'File Security & In-Browser Memory Privacy — Nexvert',
    description: 'Factual technical breakdown of how Nexvert converts files 100% locally in browser RAM with zero server uploads.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },

  // Guides
  {
    path: '/guides/',
    title: 'Resource Guides & Tutorials — Nexvert',
    description: 'In-depth educational guides on image formats, web optimization, client-side privacy, and PDF conversion.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/nexvert-vs-ilovepdf/',
    title: 'Nexvert vs iLovePDF: Browser Processing vs Server Processing — Nexvert',
    description: 'An honest comparison of Nexvert and iLovePDF. Both convert PDFs for free; the real difference is whether your file is uploaded at all, and which approach suits the job.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/pdf-vs-jpg/',
    title: 'PDF vs JPG: What’s the Difference and When to Use Each? — Nexvert',
    description: 'Detailed breakdown comparing PDF documents vs JPG images. Learn when to use PDF for multi-page text documents and JPG for single visual assets.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/heic-vs-jpg/',
    title: 'HEIC vs JPG: Which Format is Actually Better? — Nexvert',
    description: 'HEIC vs JPG direct comparison. Learn why Apple uses HEIC, how it saves 50% storage space, and when to convert.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/png-to-webp-speed/',
    title: 'How to Convert PNG to WEBP for Maximum Web Speed — Nexvert',
    description: 'Discover why converting PNG to WEBP can speed up your website by 30%. Learn about next-gen compression benefits.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/client-side-privacy/',
    title: 'Why Client-Side Conversion is Safer than Cloud Tools — Nexvert',
    description: 'Learn why cloud-based file converters pose severe security risks and why local in-browser processing is safer.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/how-to-convert-jpg-to-pdf/',
    title: 'How to Convert JPG to PDF Free — Nexvert',
    description: 'Learn how to turn JPG image files into clean, professional PDF documents for free without installing software.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/how-to-convert-png-to-jpg/',
    title: 'How to Convert PNG to JPG Free — Nexvert',
    description: 'Quick guide on converting PNG graphics to JPG images for free. Reduce file size while keeping crisp visual quality.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/how-to-convert-files-on-android/',
    title: 'How to Convert Files on Android Devices Free — Nexvert',
    description: 'Complete guide to converting PDFs, DOCX, images, and audio on Android smartphones and tablets without app installs.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/how-to-convert-files-on-iphone/',
    title: 'How to Convert Files on iPhone & iPad Free — Nexvert',
    description: 'Learn how to convert HEIC photos, PDFs, DOCX, and WEBP files on iPhone and iPad using Safari.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/how-to-convert-pdf-without-installing-software/',
    title: 'How to Convert PDF Without Installing Software — Nexvert',
    description: 'Learn how to convert PDF documents to Word, JPG, PNG, and text for free without installing heavy desktop programs.',
    category: 'guides',
    sitemapGroup: 'pages'
  },
  {
    path: '/guides/jpg-vs-png/',
    title: 'JPG vs PNG: Which Image Format Should You Use? — Nexvert',
    description: 'Comprehensive comparison of JPG vs PNG formats. Understand compression differences, transparency support, and use cases.',
    category: 'guides',
    sitemapGroup: 'pages'
  },

  // Company & Trust Pages
  {
    path: '/about/',
    title: 'About Us – Free, Private Browser-Based File Tools — Nexvert',
    description: 'Learn about Nexvert’s mission to provide 100% private, client-side in-browser file processing tools.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/contact/',
    title: 'Contact Us – Support, Feedback & Tool Requests — Nexvert',
    description: 'Get in touch with the Nexvert team for support, bug reports, feature requests or business and media inquiries. We read every message we receive.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/privacy/',
    title: 'Privacy Policy – How Nexvert Handles Your Data — Nexvert',
    description: 'Read our strict privacy policy. All file conversions are processed locally in your browser memory—zero server uploads.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/terms/',
    title: 'Terms of Service – Rules for Using Nexvert — Nexvert',
    description: 'Review the Terms of Service for using Nexvert’s free, browser-based file conversion and utility tools.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/disclaimer/',
    title: 'Disclaimer – Accuracy & Use of Nexvert Tools — Nexvert',
    description: 'Read the Nexvert legal disclaimer covering file conversion accuracy, service availability, third-party content and limitation of liability.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },
  {
    path: '/cookie-policy/',
    title: 'Cookie Policy – Analytics Cookies & Your Consent — Nexvert',
    description: 'Understand how Nexvert uses minimal, privacy-preserving local storage and analytics cookies.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  },

  // --- DEVELOPER TOOLS & UTILITIES ---
  {
    path: '/developer-tools/',
    title: 'Free Developer Tools – JSON, Encoding & Crypto — Nexvert',
    description: 'Suite of 100% private, client-side developer utilities including JSON formatters, base64 encoders, cryptography tools, code minifiers, and regex testers.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  // JSON
  {
    path: '/json-formatter/',
    title: 'JSON Formatter & Tree Viewer — Nexvert',
    description: 'Prettify and format JSON data with customizable indentation and an interactive collapsible tree viewer. Fast and private in your browser.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-validator/',
    title: 'JSON Validator & Error Finder — Nexvert',
    description: 'Validate JSON syntax and identify the exact line and column of parsing errors with context highlighting. Zero data leaves your machine.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-minifier/',
    title: 'JSON Minifier & Whitespace Compressor — Nexvert',
    description: 'Minify JSON payloads by removing excess whitespace and indentation with real before-and-after byte count verification.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-to-csv/',
    title: 'Convert JSON to CSV Online Free — Nexvert',
    description: 'Convert arrays of JSON objects into tabular CSV format with automatic dot-notation flattening for nested structures.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/csv-to-json/',
    title: 'Convert CSV to JSON Online Free — Nexvert',
    description: 'Parse CSV files into clean JSON objects with RFC 4180 compliance for quoted fields, escaped characters, and embedded commas.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-to-xml/',
    title: 'Convert JSON to XML Online Free — Nexvert',
    description: 'Transform JSON data structures into well-formed, indented XML markup with customizable root element naming.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/xml-to-json/',
    title: 'Convert XML to JSON Online Free — Nexvert',
    description: 'Convert XML documents into structured JSON objects using the native browser DOM parser with full attribute preservation.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-to-yaml/',
    title: 'Convert JSON to YAML — Nexvert',
    description: 'Convert structured JSON payloads to clean, human-readable YAML documents with configurable indentation.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/yaml-to-json/',
    title: 'Convert YAML to JSON — Nexvert',
    description: 'Parse YAML configurations into formatted JSON with real-time syntax validation and precise line-number error reporting.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/json-diff/',
    title: 'JSON Diff – Compare Two JSON Documents — Nexvert',
    description: 'Compare two JSON objects side by side to highlight additions, removals, and structural value modifications.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Encoding
  {
    path: '/base64-encode/',
    title: 'Base64 Encoder & Decoder for Text and Files — Nexvert',
    description: 'Encode text or binary files to Base64 strings and decode Base64 back to original files or UTF-8 text in your browser.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/base64-to-image/',
    title: 'Base64 to Image Decoder — Nexvert',
    description: 'Decode Base64 and Data URI strings into downloadable PNG, JPG, WEBP, or SVG image files with live canvas preview.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/image-to-base64/',
    title: 'Image to Base64 Data URI Converter — Nexvert',
    description: 'Convert images to Base64 data URIs with instant copy-to-clipboard for HTML img tags, CSS background URLs, or raw strings.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/url-encode/',
    title: 'URL Encoder & Decoder — Nexvert',
    description: 'Encode strings into percent-encoded query components or decode URI parameters with support for RFC 3986 standards.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/html-entity-encode/',
    title: 'HTML Entity Encoder & Decoder — Nexvert',
    description: 'Escape special characters into safe HTML entities (&lt;, &gt;, &amp;, &quot;) and unescape HTML-encoded strings.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/jwt-decoder/',
    title: 'JWT Decoder (Header & Payload Inspector) — Nexvert',
    description: 'Inspect JSON Web Token headers and payload claims with human-readable expiration dates. Client-side only; does not verify signatures without secrets.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Hashing
  {
    path: '/sha256-generator/',
    title: 'SHA-256 Hash Generator for Text and Files — Nexvert',
    description: 'Calculate cryptographic SHA-256 digests for strings or dropped files using the native browser Web Crypto API.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/sha1-generator/',
    title: 'SHA-1 Hash Generator for Text and Files — Nexvert',
    description: 'Generate 160-bit SHA-1 checksums for strings and binary files directly inside your browser via Web Crypto.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/sha512-generator/',
    title: 'SHA-512 Hash Generator for Text and Files — Nexvert',
    description: 'Compute 512-bit secure hash algorithms for verification of text messages or binary files using Web Crypto.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/md5-generator/',
    title: 'MD5 Hash Generator for Text and Files — Nexvert',
    description: 'Compute 128-bit MD5 checksums for verifying file integrity or legacy hash comparisons client-side.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/file-checksum/',
    title: 'File Checksum Verifier & Hasher — Nexvert',
    description: 'Drop any file to instantly compute SHA-256, SHA-1, SHA-512, and MD5 hashes with automatic expected checksum matching.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Formatters
  {
    path: '/html-formatter/',
    title: 'HTML Formatter & Beautifier — Nexvert',
    description: 'Format, indent, and prettify messy HTML markup with configurable indentation rules and tag preservation.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/css-formatter/',
    title: 'CSS Formatter & Beautifier — Nexvert',
    description: 'Beautify and indent CSS stylesheets for clean readability with consistent selector and declaration spacing.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/css-minifier/',
    title: 'CSS Minifier & Stylesheet Compressor — Nexvert',
    description: 'Minify CSS files by stripping comments, whitespace, and redundant characters with verified byte-reduction metrics.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/js-formatter/',
    title: 'JavaScript Formatter & Beautifier — Nexvert',
    description: 'Format and indent JavaScript and TypeScript source code cleanly with customizable brace and quote preferences.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/sql-formatter/',
    title: 'SQL Formatter & Query Beautifier — Nexvert',
    description: 'Format complex SQL queries with keyword uppercasing and dialect support for PostgreSQL, MySQL, SQLite, and Transact-SQL.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/xml-formatter/',
    title: 'XML Formatter & Indenter — Nexvert',
    description: 'Prettify and indent XML documents with syntax validation and customizable tag spacing. Free, instant formatting that runs inside your browser.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Generators
  {
    path: '/uuid-generator/',
    title: 'UUID Generator v4 (Bulk & Secure) — Nexvert',
    description: 'Generate cryptographically random UUID v4 identifiers one by one or in bulk batches up to 1,000 using Web Crypto.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/password-generator/',
    title: 'Cryptographic Password Generator & Entropy Calculator — Nexvert',
    description: 'Generate high-entropy random passwords using crypto.getRandomValues with character pool toggles and Shannon entropy calculations.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/random-string/',
    title: 'Random String Generator (Cryptographically Secure) — Nexvert',
    description: 'Generate secure random alphanumeric, hexadecimal, or custom character strings powered by Web Crypto.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/lorem-ipsum/',
    title: 'Lorem Ipsum Placeholder Text Generator — Nexvert',
    description: 'Generate classical Latin Lorem Ipsum placeholder paragraphs, sentences, or word counts for design and typography mockups.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Text & Dev Utilities
  {
    path: '/regex-tester/',
    title: 'Regular Expression Tester & Debugger — Nexvert',
    description: 'Test and debug JavaScript regular expressions with real-time match highlighting, flag toggles, and capture group inspection.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/text-diff/',
    title: 'Text Diff Checker (Line & Word Comparison) — Nexvert',
    description: 'Find differences between two text documents side-by-side or inline with granular word-level and line-level diff highlighting.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/timestamp-converter/',
    title: 'Unix Epoch Timestamp Converter & Formatter — Nexvert',
    description: 'Convert Unix epoch timestamps in seconds or milliseconds to human-readable dates across multiple timezones and vice versa.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/cron-parser/',
    title: 'Cron Expression Parser & Human Explainer — Nexvert',
    description: 'Translate crontab schedule expressions into clear English descriptions and preview upcoming scheduled execution dates.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/number-base-converter/',
    title: 'Number Base Converter (Binary, Hex, Decimal, Octal) — Nexvert',
    description: 'Convert numbers seamlessly between Binary, Octal, Decimal, and Hexadecimal representations with BigInt arbitrary precision.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/slugify/',
    title: 'URL Slug Generator (Clean & SEO-Friendly) — Nexvert',
    description: 'Transform article titles and strings into clean, URL-safe slugs with customizable delimiters and accent normalization.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/case-converter/',
    title: 'String Case Converter (camelCase, snake_case, PascalCase) — Nexvert',
    description: 'Convert text instantly across camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and Title Case.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/query-string-parser/',
    title: 'URL Query String Parser & Builder — Nexvert',
    description: 'Parse URL parameters into an editable key-value grid or build encoded query strings with array and JSON exports.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Color Tools
  {
    path: '/color-converter/',
    title: 'Color Converter (HEX, RGB, HSL, HSV, CMYK) — Nexvert',
    description: 'Convert colors across HEX, RGB, HSL, HSV, and CMYK color spaces with mathematical precision and live swatch preview.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/color-palette-extractor/',
    title: 'Image Color Palette Extractor (K-Means Clustering) — Nexvert',
    description: 'Extract dominant color palettes from uploaded images using HTML5 Canvas pixel sampling and K-Means color quantization.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/contrast-checker/',
    title: 'WCAG Color Contrast Checker (AA & AAA Standards) — Nexvert',
    description: 'Verify accessibility compliance between foreground text and background colors according to WCAG 2.1 AA and AAA standards.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/gradient-generator/',
    title: 'CSS Gradient Generator & Visual Editor — Nexvert',
    description: 'Create linear and radial CSS gradients visually with color stops, angle controls, and one-click CSS code generation.',
    category: 'developer',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // QR, Barcode & OCR Routes
  {
    path: '/qr-code-generator/',
    title: 'Free QR Code Generator – Custom Colors & Logo — Nexvert',
    description: 'Create customized high-resolution QR codes for URLs, WiFi, contacts, and text. Download as crisp PNG or vector SVG with zero tracking.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/qr-reader/',
    title: 'Free QR Code Reader & Scanner – Camera & Upload — Nexvert',
    description: 'Decode QR codes instantly from uploaded images or live camera scans. Extract URLs, WiFi credentials, and contact cards in your browser.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/barcode-generator/',
    title: 'Free Barcode Generator (CODE128, EAN-13, UPC, CODE39) — Nexvert',
    description: 'Generate retail, commercial, and packaging barcodes with customized dimensions and font sizes. Export print-ready PNG and vector SVG.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/wifi-qr-generator/',
    title: 'Free Wi-Fi QR Code Generator – Instant Guest Auto-Connect — Nexvert',
    description: 'Generate scannable Wi-Fi QR codes so guests and coworkers can join your network instantly with camera scanning and zero password typing.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/vcard-generator/',
    title: 'Free vCard QR Code & .VCF File Generator — Nexvert',
    description: 'Generate digital business cards (vCard 3.0). Export as downloadable .vcf contacts and scannable QR codes for mobile phones.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/image-to-text/',
    title: 'Free Image to Text OCR – Extract Text from Photos — Nexvert',
    description: 'Extract text from scanned documents, receipts, screenshots, and photos with local client-side Tesseract WebAssembly optical character recognition.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/pdf-ocr/',
    title: 'Free PDF OCR Tool – Extract Text from Scanned PDF Documents — Nexvert',
    description: 'Extract text from scanned PDF pages locally in your browser. Multi-page document OCR with high-accuracy Tesseract WASM.',
    category: 'pdf-doc',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Utilities Hub
  {
    path: '/utilities/',
    title: 'Free In-Browser Utilities & Calculators — Nexvert',
    description: 'Explore ' + UTILITY_TOOLS_COUNT + '+ fast, private client-side utilities for text manipulation, calculators, unit conversions, generators, and decision makers.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Text Utilities
  {
    path: '/word-counter/',
    title: 'Word Counter & Text Statistics Free — Nexvert',
    description: 'Count words, characters, sentences, paragraphs, and reading time in real time with 100% privacy.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/remove-duplicate-lines/',
    title: 'Remove Duplicate Lines from Text Free — Nexvert',
    description: 'Instantly remove duplicate lines from lists and text documents with custom case-sensitivity options.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/sort-lines/',
    title: 'Sort Lines Alphabetically or Numerically Free — Nexvert',
    description: 'Sort lines in alphabetical, reverse, natural, or length-based order directly in your browser.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/find-and-replace/',
    title: 'Find and Replace Text Free — Nexvert',
    description: 'Find and replace text patterns with regex support and live match counts. Free bulk text editing in your browser with nothing sent to a server.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/text-repeater/',
    title: 'Text Repeater Free (Repeat Strings N Times) — Nexvert',
    description: 'Repeat words, sentences or characters thousands of times with custom separators. Free, instant bulk text generation with no sign-up required.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/reverse-text/',
    title: 'Reverse Text Free (Characters, Words & Lines) — Nexvert',
    description: 'Reverse text backwards by character, word or line order instantly in your browser. Free, unlimited, and nothing you type is sent to a server.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/remove-line-breaks/',
    title: 'Remove Line Breaks & Returns Free — Nexvert',
    description: 'Strip unnecessary line breaks and paragraph returns from copied text and PDFs cleanly. Free, instant reflowing with nothing sent to a server.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/whitespace-remover/',
    title: 'Whitespace Remover Free (Strip Extra Spaces) — Nexvert',
    description: 'Clean up text by removing extra whitespace, double spaces and tab indentation. Free, instant cleanup with nothing you paste sent to a server.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/text-to-speech/',
    title: 'Free In-Browser Text to Speech (TTS) — Nexvert',
    description: 'Listen to text read aloud with high-quality native browser speech synthesis voices. Free, multi-language, with adjustable speed and pitch.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/character-map/',
    title: 'Unicode Character Map & Symbol Picker Free — Nexvert',
    description: 'Search, browse, and copy Unicode symbols, mathematical glyphs, arrows, and currency signs.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Converter Tools
  {
    path: '/unit-converter/',
    title: 'Universal Unit Converter Free — Nexvert',
    description: 'Convert between metric and imperial units for length, weight, temperature, speed, area, volume, and data.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/timezone-converter/',
    title: 'Timezone Converter & World Clock Free — Nexvert',
    description: 'Convert and compare times across worldwide timezones for seamless international coordination.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/roman-numeral-converter/',
    title: 'Roman Numeral Converter Free — Nexvert',
    description: 'Convert standard numbers to Roman numerals and decode Roman numerals back to digits. Free, instant conversion for dates, chapters and clocks.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/number-to-words/',
    title: 'Number to Words Converter Free — Nexvert',
    description: 'Convert numbers into formal English words and currency text for checks, invoices, and legal documents.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Calculators
  {
    path: '/percentage-calculator/',
    title: 'Percentage Calculator Free — Nexvert',
    description: 'Quickly calculate percentage values, percentage differences and fractional increases. Free instant maths for discounts, tips, grades and growth.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/age-calculator/',
    title: 'Chronological Age Calculator Free — Nexvert',
    description: 'Calculate your exact age in years, months, days, hours, and minutes with next birthday countdown.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/date-calculator/',
    title: 'Date Calculator & Day Duration Free — Nexvert',
    description: 'Calculate days between two calendar dates, or add and subtract days, weeks and months. Free instant date maths with no sign-up required.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/bmi-calculator/',
    title: 'Body Mass Index (BMI) Calculator Free — Nexvert',
    description: 'Calculate your BMI and discover healthy weight ranges with metric and imperial units. Free instant results with no sign-up and nothing stored.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/loan-calculator/',
    title: 'Loan EMI & Payment Calculator Free — Nexvert',
    description: 'Calculate monthly loan EMI payments, total interest costs and amortization summaries. Free instant results for home, car and personal loans.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/tip-calculator/',
    title: 'Tip Calculator & Bill Splitter Free — Nexvert',
    description: 'Calculate gratuity tips and split dining checks evenly per guest with custom percentages. Free, instant results with no sign-up or app install.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/discount-calculator/',
    title: 'Discount & Sale Price Calculator Free — Nexvert',
    description: 'Calculate final prices after discounts, coupons and percentage markdowns. Free instant savings maths for shopping, invoices and sale pricing.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/aspect-ratio-calculator/',
    title: 'Aspect Ratio Calculator (16:9, 4:3, 1:1, 21:9) — Nexvert',
    description: 'Calculate proportional dimensions for photos, displays and video formats accurately. Free instant results for 16:9, 4:3, 21:9 and any custom ratio.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/gst-calculator/',
    title: 'GST / VAT Tax Calculator Free — Nexvert',
    description: 'Calculate GST inclusive and exclusive pricing, net amounts and tax portions instantly. Free, accurate, and works for any GST or VAT percentage.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Generators
  {
    path: '/signature-pad/',
    title: 'Digital Signature Pad & PNG Drawer — Nexvert',
    description: 'Draw your electronic signature with a mouse, trackpad or touchscreen and download a transparent PNG. Free, private, and never uploaded anywhere.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/invoice-generator/',
    title: 'Free Invoice Generator (Download PDF) — Nexvert',
    description: 'Generate professional invoices with custom line items, tax, and company branding, and export real PDFs.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/favicon-generator/',
    title: 'Free Favicon Generator & Icon Pack Creator — Nexvert',
    description: 'Generate complete website favicon packs (16px to 512px) with webmanifest in a downloadable ZIP.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/og-image-generator/',
    title: 'Open Graph (OG) Image Generator 1200x630 Free — Nexvert',
    description: 'Create high-resolution 1200x630 social media preview banners for articles, blogs, and websites.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/placeholder-image/',
    title: 'Placeholder Image Generator Free — Nexvert',
    description: 'Generate custom dimension placeholder graphics with custom text, colors, and format downloads.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },

  // Fun Tools
  {
    path: '/random-picker/',
    title: 'Random Choice Picker & Decision Maker Free — Nexvert',
    description: 'Pick random winners, names, or options from custom lists with animated selection and history.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/dice-roller/',
    title: 'Virtual Dice Roller Free (d4, d6, d8, d20, d100) — Nexvert',
    description: 'Roll tabletop dice with quantities, modifiers, rolling animations, and cryptographically fair RNG.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/coin-flip/',
    title: 'Coin Flip Free (Heads or Tails Toss) — Nexvert',
    description: 'Flip a virtual coin with 3D animation, coin toss statistics, and fair cryptographic 50/50 probability.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/random-number/',
    title: 'Cryptographic Random Number Generator Free — Nexvert',
    description: 'Generate truly random numbers within custom ranges with sorting and unique options using Web Crypto.',
    category: 'tools',
    sitemapGroup: 'tools',
    includeInSitemap: true
  },
  {
    path: '/changelog/',
    title: 'Changelog & Tool Updates — Nexvert',
    description: 'Track new tool releases, client-side engine enhancements, privacy updates, and format additions with Nexvert.',
    category: 'trust',
    sitemapGroup: 'pages',
    includeInSitemap: true
  }
];

export function normalizeRoutePath(raw: string): string {
  if (!raw || raw === '/' || raw === '/index.html' || raw === '') return '/';
  const clean = raw.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/` : '/';
}

export function findRouteConfig(pathOrMode: string): RouteConfig | undefined {
  if (!pathOrMode || pathOrMode === '/' || pathOrMode === '/index.html' || pathOrMode === '') {
    return PUBLIC_ROUTES.find((r) => r.path === '/');
  }
  const clean = pathOrMode.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return PUBLIC_ROUTES.find((r) => {
    const rClean = r.path.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    return rClean === clean;
  });
}

export function getCanonicalRouteUrl(rawPath: string): string {
  const norm = normalizeRoutePath(rawPath);
  return norm === '/' ? `${SITE_CANONICAL_DOMAIN}/` : `${SITE_CANONICAL_DOMAIN}${norm}`;
}

