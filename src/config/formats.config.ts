/**
 * Format Knowledge Model for Nexvert
 * Defines detailed format specifications, characteristics, comparisons,
 * advantages, limitations, and practical use-cases for genuinely supported formats.
 */

export interface FormatKnowledge {
  id: string;
  name: string;
  fullName: string;
  category: 'Image' | 'Document' | 'Audio' | 'Video' | 'Vector' | 'Archive';
  mimeType: string;
  extensions: string[];
  compressionType: 'Lossy' | 'Lossless' | 'Uncompressed' | 'Mixed' | 'Fixed-Layout';
  transparencySupport: boolean;
  idealUseCases: string[];
  advantages: string[];
  limitations: string[];
  relatedFormats: string[];
  primaryConverterRoute: string;
  recommendedBlogTopic?: string;
}

export const FORMAT_KNOWLEDGE: Record<string, FormatKnowledge> = {
  png: {
    id: 'png',
    name: 'PNG',
    fullName: 'Portable Network Graphics',
    category: 'Image',
    mimeType: 'image/png',
    extensions: ['.png'],
    compressionType: 'Lossless',
    transparencySupport: true,
    idealUseCases: [
      'Website logos and iconography with transparent backgrounds',
      'Text-heavy UI screenshots and diagrams requiring crisp readability',
      'Digital graphic design assets requiring non-destructive editing'
    ],
    advantages: [
      'Lossless 2D raster compression retains 100% pixel fidelity',
      'Full 8-bit alpha channel transparency support',
      'Universal compatibility across all modern browsers and graphics suites'
    ],
    limitations: [
      'Substantially larger file sizes than JPG for photographic imagery',
      'Does not support native animation (unlike GIF or APNG)',
      'No native EXIF color profile management on legacy viewers'
    ],
    relatedFormats: ['jpg', 'webp', 'svg', 'gif'],
    primaryConverterRoute: '/png-to-jpg',
    recommendedBlogTopic: 'What is a PNG file and when should you use it?'
  },
  jpg: {
    id: 'jpg',
    name: 'JPG / JPEG',
    fullName: 'Joint Photographic Experts Group',
    category: 'Image',
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg', '.jfif'],
    compressionType: 'Lossy',
    transparencySupport: false,
    idealUseCases: [
      'Digital photography and smartphone camera captures',
      'High-detail web illustrations where smaller file size is prioritized',
      'Print media and social media image sharing'
    ],
    advantages: [
      'Exceptional lossy compression reduces file footprint by up to 80%',
      'Universal hardware and software compatibility across all devices',
      'Full support for EXIF camera metadata and standard color spaces'
    ],
    limitations: [
      'No support for transparent pixels or alpha channels (fills with solid color)',
      'Repeated saving causes generation loss and blocky compression artifacts',
      'Edges on high-contrast text or line art can appear blurry'
    ],
    relatedFormats: ['png', 'webp', 'heic', 'pdf'],
    primaryConverterRoute: '/jpg-to-png',
    recommendedBlogTopic: 'JPG vs PNG: The definitive guide to image compression'
  },
  webp: {
    id: 'webp',
    name: 'WEBP',
    fullName: 'Google Web Picture Format',
    category: 'Image',
    mimeType: 'image/webp',
    extensions: ['.webp'],
    compressionType: 'Mixed',
    transparencySupport: true,
    idealUseCases: [
      'Modern web pages seeking higher Google Core Web Vitals scores',
      'E-commerce product catalogs needing transparent overlays and small file sizes',
      'Web application assets combining photographic textures and UI elements'
    ],
    advantages: [
      '25% to 35% smaller file size compared to equivalent JPG and PNG files',
      'Supports both lossy and lossless compression in a single specification',
      'Full 8-bit alpha transparency support even in lossy mode'
    ],
    limitations: [
      'Limited native support in older desktop photo editing software',
      'Legacy operating systems (e.g. older Windows/macOS) may require codecs',
      'Some social platforms strip or re-encode WEBP uploads to JPG'
    ],
    relatedFormats: ['png', 'jpg', 'gif', 'heic'],
    primaryConverterRoute: '/webp-to-jpg',
    recommendedBlogTopic: 'How WebP speeds up website load times by 30%'
  },
  heic: {
    id: 'heic',
    name: 'HEIC / HEIF',
    fullName: 'High Efficiency Image Container',
    category: 'Image',
    mimeType: 'image/heic',
    extensions: ['.heic', '.heif'],
    compressionType: 'Lossy',
    transparencySupport: true,
    idealUseCases: [
      'Default camera capture format for Apple iPhone and iPad devices',
      'High-efficiency mobile photo storage saving 50% device capacity',
      'Multi-frame live photos and HDR image captures'
    ],
    advantages: [
      'Roughly 50% smaller file size than JPEG at identical visual quality',
      'Supports 16-bit color depth (compared to 8-bit limit in standard JPEG)',
      'Capable of storing image sequences, depth maps, and live photos in one file'
    ],
    limitations: [
      'Requires paid codec extensions or third-party tools on Windows PCs',
      'Unsupported by many web forms, legacy Android versions, and printing kiosks',
      'Direct browser rendering requires client-side WebAssembly transcoding'
    ],
    relatedFormats: ['jpg', 'png', 'webp'],
    primaryConverterRoute: '/',
    recommendedBlogTopic: 'HEIC vs JPG: Why Apple switched and how to fix compatibility'
  },
  svg: {
    id: 'svg',
    name: 'SVG',
    fullName: 'Scalable Vector Graphics',
    category: 'Vector',
    mimeType: 'image/svg+xml',
    extensions: ['.svg'],
    compressionType: 'Lossless',
    transparencySupport: true,
    idealUseCases: [
      'Company logos, brand marks, and typography on responsive websites',
      'Scalable icons, UI symbols, and vector illustrations for web apps',
      'Print-ready vector assets that scale to billboard dimensions without blur'
    ],
    advantages: [
      'Infinite scalability without any pixelation or resolution loss',
      'XML-based text structure allows CSS styling and JavaScript interactivity',
      'Extremely lightweight file sizes for geometric shapes and clean line art'
    ],
    limitations: [
      'Cannot efficiently represent complex photographic images or textures',
      'Complex vector paths with thousands of nodes can cause rendering lag',
      'Not accepted by some social media platforms as standard profile images'
    ],
    relatedFormats: ['png', 'jpg', 'pdf'],
    primaryConverterRoute: '/svg-converter',
    recommendedBlogTopic: 'Raster vs Vector: Understanding SVG vs PNG'
  },
  pdf: {
    id: 'pdf',
    name: 'PDF',
    fullName: 'Portable Document Format',
    category: 'Document',
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
    compressionType: 'Fixed-Layout',
    transparencySupport: true,
    idealUseCases: [
      'Legal contracts, corporate invoices, and official business reports',
      'Standardized resumes, CVs, and academic research papers',
      'Print-ready document layouts with embedded fonts and vector graphics'
    ],
    advantages: [
      'Guarantees identical visual presentation across every OS, device, and printer',
      'Supports searchable text layers, form fields, and digital signatures',
      'Enables multi-page document binding with built-in navigation bookmarks'
    ],
    limitations: [
      'Read-only structure makes spontaneous text editing difficult without conversion',
      'Fixed layout is not inherently responsive to mobile screen reflow',
      'Embedded high-resolution images can create large file sizes'
    ],
    relatedFormats: ['docx', 'jpg', 'png', 'epub'],
    primaryConverterRoute: '/pdf-merge',
    recommendedBlogTopic: 'How to convert and edit PDF documents without Adobe software'
  },
  docx: {
    id: 'docx',
    name: 'DOCX',
    fullName: 'Microsoft Word OpenXML Document',
    category: 'Document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx', '.doc'],
    compressionType: 'Lossless',
    transparencySupport: false,
    idealUseCases: [
      'Drafting, editing, and collaborating on business manuscripts and articles',
      'Collaborative office documents requiring comments and track changes',
      'Dynamic text files with flowing paragraphs, tables, and headers'
    ],
    advantages: [
      'Fully editable text and layout structures across Word, Google Docs, and LibreOffice',
      'OpenXML zip container allows lightweight storage and programmatic parsing',
      'Native support for dynamic spelling, grammar, and typography formatting'
    ],
    limitations: [
      'Layout rendering can vary slightly between different office software versions',
      'Requires compatible document editing software or viewers to open',
      'Not ideal for fixed-layout commercial printing without conversion to PDF'
    ],
    relatedFormats: ['pdf', 'txt'],
    primaryConverterRoute: '/docx-to-pdf',
    recommendedBlogTopic: 'PDF vs DOCX: When to use editable documents vs fixed PDFs'
  },
  mp3: {
    id: 'mp3',
    name: 'MP3',
    fullName: 'MPEG Audio Layer III',
    category: 'Audio',
    mimeType: 'audio/mpeg',
    extensions: ['.mp3'],
    compressionType: 'Lossy',
    transparencySupport: false,
    idealUseCases: [
      'Music streaming, audiobooks, and podcast distribution',
      'Voice memo sharing and portable audio player playback',
      'Background music for web applications and digital games'
    ],
    advantages: [
      'Universal playback compatibility across 100% of media players and devices',
      'Perceptual psychoacoustic compression reduces audio size by up to 90%',
      'Supports ID3 metadata tags for album art, track numbers, and artist info'
    ],
    limitations: [
      'Lossy compression discards subtle high-frequency acoustic data',
      'Not recommended for multi-track studio mastering (use lossless WAV instead)',
      'Slight padding delay at track beginnings can prevent seamless gapless looping'
    ],
    relatedFormats: ['wav', 'ogg', 'mp4', 'm4a'],
    primaryConverterRoute: '/audio-converter',
    recommendedBlogTopic: 'MP3 vs WAV: Audio quality and bitrate explained'
  },
  wav: {
    id: 'wav',
    name: 'WAV',
    fullName: 'Waveform Audio File Format',
    category: 'Audio',
    mimeType: 'audio/wav',
    extensions: ['.wav'],
    compressionType: 'Uncompressed',
    transparencySupport: false,
    idealUseCases: [
      'Professional music production, audio recording, and studio mastering',
      'Game audio sound effects requiring zero decoding latency',
      'Broadcast-quality voiceovers and sound engineering projects'
    ],
    advantages: [
      'Uncompressed linear PCM audio retains 100% original recording fidelity',
      'No lossy compression artifacts or spectral frequency attenuation',
      'Fast client-side decoding with zero CPU decompression overhead'
    ],
    limitations: [
      'Massive file size (approximately 10 MB per minute of stereo audio)',
      'Impractical for mobile streaming or email file attachments',
      'Limited metadata tagging standard compared to MP3 ID3'
    ],
    relatedFormats: ['mp3', 'flac', 'ogg'],
    primaryConverterRoute: '/audio-converter',
    recommendedBlogTopic: 'Lossless vs Lossy Audio: When is WAV truly necessary?'
  },
  mp4: {
    id: 'mp4',
    name: 'MP4',
    fullName: 'MPEG-4 Part 14 Video Container',
    category: 'Video',
    mimeType: 'video/mp4',
    extensions: ['.mp4'],
    compressionType: 'Lossy',
    transparencySupport: false,
    idealUseCases: [
      'Universal video playback on smartphones, smart TVs, PCs, and web browsers',
      'Video uploads to YouTube, Instagram, TikTok, and social networks',
      'Extracting clean audio soundtracks and voice streams to MP3'
    ],
    advantages: [
      'Universal hardware-accelerated video decoding on nearly every modern device',
      'High compression efficiency via standard H.264/H.265 video codecs',
      'Supports multiple audio tracks, chapter marks, and subtitle streams'
    ],
    limitations: [
      'Lossy compression creates banding in dark scenes at very low bitrates',
      'Container format requires proper index (moov atom) placement for web fast-start',
      'Cannot natively store transparent video frames without specialized codecs'
    ],
    relatedFormats: ['webm', 'mp3', 'gif'],
    primaryConverterRoute: '/mp4-to-mp3',
    recommendedBlogTopic: 'How to extract MP3 audio from MP4 video files locally'
  },
  zip: {
    id: 'zip',
    name: 'ZIP',
    fullName: 'ZIP Archive File Format',
    category: 'Archive',
    mimeType: 'application/zip',
    extensions: ['.zip'],
    compressionType: 'Lossless',
    transparencySupport: false,
    idealUseCases: [
      'Packaging multiple documents, photos, or data files into a single bundle',
      'Compressing folder directories to save storage space and bandwidth',
      'Downloading batch-converted images and documents in one clean file'
    ],
    advantages: [
      'Built-in native support in Windows, macOS, Linux, and mobile operating systems',
      'DEFLATE lossless compression reduces total payload without data loss',
      'Allows selective extraction of individual files without decompressing the whole archive'
    ],
    limitations: [
      'Slightly lower compression ratio compared to modern 7Z or RAR formats',
      'Does not natively compress already compressed files (e.g. JPGs, MP3s)',
      'Archive corruption can occasionally affect individual file headers'
    ],
    relatedFormats: ['tar', 'gz', '7z'],
    primaryConverterRoute: '/extract-archive',
    recommendedBlogTopic: 'How to extract and create ZIP archives online without third-party software'
  }
};

export function getFormatKnowledge(formatKey: string): FormatKnowledge | undefined {
  const cleanKey = formatKey.toLowerCase().replace(/^\./, '').trim();
  return FORMAT_KNOWLEDGE[cleanKey];
}
