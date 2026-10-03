/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GifFrame {
  index: number;
  width: number;
  height: number;
  delayMs: number;
  canvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
}

/**
 * Creates an animated GIF from a list of HTMLImageElements or ImageBitmaps
 * using the lightweight 'gifenc' library (~20KB).
 */
export async function createGifFromImages(
  images: { canvas: HTMLCanvasElement; delayMs: number }[],
  width: number,
  height: number,
  options?: {
    repeat?: number; // 0 = loop forever
    onProgress?: (current: number, total: number) => void;
  }
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

  const gif = GIFEncoder();
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const item = images[i];
    const ctx = item.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas 2D context');

    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = imageData.data;

    // Palette quantization (256 colors)
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay: item.delayMs,
      repeat: options?.repeat ?? 0,
    });

    options?.onProgress?.(i + 1, total);
  }

  gif.finish();
  const bytes = gif.bytes();
  return new Blob([bytes], { type: 'image/gif' });
}

/**
 * Splits an animated GIF into its individual frames using 'omggif'
 */
export async function splitGifFrames(
  gifBuffer: ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<GifFrame[]> {
  const omggifModule = await import('omggif');
  // Handle both esm default and cjs
  const GifReader = (omggifModule as any).GifReader || (omggifModule as any).default?.GifReader || (omggifModule as any).default;
  const reader = new GifReader(new Uint8Array(gifBuffer));

  const totalFrames = reader.numFrames();
  const width = reader.width;
  const height = reader.height;

  const frames: GifFrame[] = [];

  // Temporary canvas to accumulate frames according to disposal method
  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compositeCtx = compositeCanvas.getContext('2d', { willReadFrequently: true })!;

  const frameImageData = compositeCtx.createImageData(width, height);

  for (let i = 0; i < totalFrames; i++) {
    const frameInfo = reader.frameInfo(i);
    // Decode RGBA pixels for this frame
    reader.decodeAndBlitFrameRGBA(i, frameImageData.data);

    compositeCtx.putImageData(frameImageData, 0, 0);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = width;
    frameCanvas.height = height;
    const fCtx = frameCanvas.getContext('2d')!;
    fCtx.drawImage(compositeCanvas, 0, 0);

    const blob: Blob = await new Promise((resolve) => {
      frameCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const dataUrl = frameCanvas.toDataURL('image/png');

    frames.push({
      index: i,
      width,
      height,
      delayMs: (frameInfo.delay || 10) * 10, // gif delay is in hundredths of a second
      canvas: frameCanvas,
      blob,
      dataUrl,
    });

    onProgress?.(i + 1, totalFrames);
  }

  return frames;
}

/**
 * Resizes an animated GIF to new dimensions using omggif and gifenc
 */
export async function resizeGif(
  gifBuffer: ArrayBuffer,
  targetWidth: number,
  targetHeight: number,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const frames = await splitGifFrames(gifBuffer);
  const total = frames.length;

  const resizedCanvases: { canvas: HTMLCanvasElement; delayMs: number }[] = [];

  for (let i = 0; i < total; i++) {
    const frame = frames[i];
    const rCanvas = document.createElement('canvas');
    rCanvas.width = targetWidth;
    rCanvas.height = targetHeight;
    const rCtx = rCanvas.getContext('2d', { willReadFrequently: true })!;

    // High quality scaling
    rCtx.imageSmoothingEnabled = true;
    rCtx.imageSmoothingQuality = 'high';
    rCtx.drawImage(frame.canvas, 0, 0, targetWidth, targetHeight);

    resizedCanvases.push({
      canvas: rCanvas,
      delayMs: frame.delayMs,
    });
  }

  return createGifFromImages(resizedCanvases, targetWidth, targetHeight, {
    repeat: 0,
    onProgress,
  });
}

/**
 * Convenient wrapper to resize animated GIF with scale factor or dimensions
 */
export async function resizeAnimatedGif(
  gifBuffer: ArrayBuffer,
  options: {
    scale?: number;
    width?: number;
    height?: number;
    onProgress?: (p: number) => void;
  }
): Promise<Blob> {
  const frames = await splitGifFrames(gifBuffer);
  if (frames.length === 0) throw new Error('Could not read GIF frames');

  const origW = frames[0].width;
  const origH = frames[0].height;

  let targetW = options.width || (options.scale ? Math.round(origW * options.scale) : origW);
  let targetH = options.height || (options.scale ? Math.round(origH * options.scale) : origH);

  if (targetW < 1) targetW = 1;
  if (targetH < 1) targetH = 1;

  return resizeGif(gifBuffer, targetW, targetH, (curr, total) => {
    options.onProgress?.(curr / total);
  });
}

/**
 * Convenient alias for splitGifFrames with progress ratio
 */
export async function extractGifFrames(
  gifBuffer: ArrayBuffer,
  options?: {
    onProgress?: (p: number) => void;
  }
): Promise<GifFrame[]> {
  return splitGifFrames(gifBuffer, (curr, total) => {
    options?.onProgress?.(curr / total);
  });
}
