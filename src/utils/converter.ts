/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ImageFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'bmp';

/** Input formats the image converter can decode (outputs are ImageFormat). */
export type InputImageFormat = ImageFormat | 'svg' | 'heic';

export interface ConversionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  format: ImageFormat;
}

export const SUPPORTED_FORMATS: { [key in ImageFormat]: { label: string; mime: string; ext: string } } = {
  png: { label: 'PNG', mime: 'image/png', ext: 'png' },
  jpg: { label: 'JPG / JPEG', mime: 'image/jpeg', ext: 'jpg' },
  webp: { label: 'WEBP', mime: 'image/webp', ext: 'webp' },
  gif: { label: 'GIF', mime: 'image/gif', ext: 'gif' },
  bmp: { label: 'BMP', mime: 'image/bmp', ext: 'bmp' },
};

/**
 * Detect the image format of a file based on its MIME type and file extension.
 */
export function detectFormat(file: File): InputImageFormat | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime === 'image/heic' || mime === 'image/heif' || /\.(heic|heif)$/.test(name)) return 'heic';
  if (mime === 'image/svg+xml' || name.endsWith('.svg')) return 'svg';
  if (mime === 'image/png' || name.endsWith('.png')) return 'png';
  if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg' || /\.(jpe?g|jfif|jpe)$/.test(name)) return 'jpg';
  if (mime === 'image/webp' || name.endsWith('.webp')) return 'webp';
  if (mime === 'image/gif' || name.endsWith('.gif')) return 'gif';
  if (mime === 'image/bmp' || mime === 'image/x-ms-bmp' || name.endsWith('.bmp')) return 'bmp';

  return null;
}

/**
 * Get available output target formats (excludes the source format).
 */
export function getAvailableTargets(source: InputImageFormat): ImageFormat[] {
  return (Object.keys(SUPPORTED_FORMATS) as ImageFormat[]).filter((f) => f !== source);
}

/**
 * Format bytes into a human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
}

function loadImageElement(blob: Blob): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. Make sure it is a valid, uncorrupted image.'));
    };
    img.src = url;
  });
}

/** Reads width/height (or viewBox) from SVG markup for SVGs without intrinsic size. */
function readSvgSize(svgText: string): { width: number; height: number } | null {
  const tag = svgText.match(/<svg[^>]*>/i)?.[0];
  if (!tag) return null;
  const num = (attr: string) => {
    const m = tag.match(new RegExp(`\\s${attr}\\s*=\\s*["']\\s*([\\d.]+)\\s*(px)?\\s*["']`, 'i'));
    return m ? parseFloat(m[1]) : 0;
  };
  const width = num('width');
  const height = num('height');
  if (width && height) return { width, height };
  const vb = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]) };
  return null;
}

/**
 * Decodes any supported input (PNG, JPG/JFIF, WEBP, GIF, BMP, SVG, HEIC) into a drawable source.
 */
export async function decodeImage(file: File): Promise<DecodedImage> {
  const format = detectFormat(file);

  if (format === 'heic') {
    // Safari decodes HEIC natively; other browsers lazy-load a WebAssembly decoder.
    try {
      const { img, url } = await loadImageElement(file);
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, dispose: () => URL.revokeObjectURL(url) };
    } catch {
      const { heicTo } = await import('heic-to');
      const bitmap = await heicTo({ blob: file, type: 'bitmap' }).catch(() => {
        throw new Error('This HEIC/HEIF photo could not be decoded. It may be corrupted or use an unsupported HEIF variant.');
      });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
    }
  }

  if (format === 'svg') {
    let text = await file.text();
    const size = readSvgSize(text) || { width: 1024, height: 1024 };
    // Browsers only rasterize SVGs with explicit dimensions reliably; inject them when missing.
    const svgTag = text.match(/<svg[^>]*>/i)?.[0] || '';
    if (!/\swidth\s*=/i.test(svgTag) || !/\sheight\s*=/i.test(svgTag)) {
      text = text.replace(/<svg/i, `<svg width="${size.width}" height="${size.height}"`);
    }
    const { img, url } = await loadImageElement(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }));
    return {
      source: img,
      width: Math.round(img.naturalWidth || size.width),
      height: Math.round(img.naturalHeight || size.height),
      dispose: () => URL.revokeObjectURL(url),
    };
  }

  const { img, url } = await loadImageElement(file);
  return { source: img, width: img.naturalWidth || 800, height: img.naturalHeight || 600, dispose: () => URL.revokeObjectURL(url) };
}

/** Encodes canvas pixels as a 24-bit uncompressed Windows BMP (alpha flattened onto white). */
function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const { width, height } = canvas;
  const data = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const buffer = new ArrayBuffer(54 + pixelBytes);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  bytes[0] = 0x42; // "B"
  bytes[1] = 0x4d; // "M"
  view.setUint32(2, 54 + pixelBytes, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelBytes, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  for (let y = 0; y < height; y++) {
    const row = 54 + (height - 1 - y) * rowSize; // BMP rows are stored bottom-up
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3] / 255;
      bytes[row + x * 3] = Math.round(data[i + 2] * a + 255 * (1 - a));
      bytes[row + x * 3 + 1] = Math.round(data[i + 1] * a + 255 * (1 - a));
      bytes[row + x * 3 + 2] = Math.round(data[i] * a + 255 * (1 - a));
    }
  }
  return new Blob([buffer], { type: 'image/bmp' });
}

/** Encodes canvas pixels as a single-frame GIF (256-colour palette, 1-bit transparency). */
async function encodeGif(canvas: HTMLCanvasElement): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const { width, height } = canvas;
  const rgba = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const palette = quantize(rgba, 256, { format: 'rgba4444', oneBitAlpha: true });
  const index = applyPalette(rgba, palette, 'rgba4444');
  const transparentIndex = palette.findIndex((c: number[]) => c[3] === 0);
  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, {
    palette,
    transparent: transparentIndex >= 0,
    transparentIndex: Math.max(0, transparentIndex),
  });
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

/**
 * Encodes a canvas into the requested format. GIF and BMP use real encoders because
 * canvas.toBlob() silently falls back to PNG for MIME types the browser cannot write.
 */
export async function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality = 0.9): Promise<Blob> {
  if (format === 'bmp') return encodeBmp(canvas);
  if (format === 'gif') return encodeGif(canvas);
  const mime = SUPPORTED_FORMATS[format].mime;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, format === 'jpg' || format === 'webp' ? quality : undefined)
  );
  if (!blob || blob.type !== mime) {
    throw new Error(`Your browser cannot export ${SUPPORTED_FORMATS[format].label} images. Try PNG or JPG instead.`);
  }
  return blob;
}

/**
 * Convert an image file to the target format client-side using the Canvas API.
 */
export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.9
): Promise<ConversionResult> {
  const decoded = await decodeImage(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: targetFormat === 'gif' || targetFormat === 'bmp' });
    if (!ctx) throw new Error('Failed to get 2D canvas context');

    // JPG and BMP have no transparency: flatten onto white instead of black
    if (targetFormat === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

    const blob = await encodeCanvas(canvas, targetFormat, quality);
    return {
      blob,
      url: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      format: targetFormat,
    };
  } finally {
    decoded.dispose();
  }
}
