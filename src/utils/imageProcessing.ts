/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client-Side HTML5 Canvas Image Processing Utilities
 * Absolute truthfulness: No fabricated numbers, no fake delays, real pixel operations.
 */

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    // The URL is not revoked on load: tools render previews with <img src={img.src}>,
    // which fail with ERR_FILE_NOT_FOUND once the blob URL is revoked.
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. The file may be corrupt or an unsupported format.'));
    };
    img.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string = 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to encode canvas as ${mimeType}.`));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * 3x3 Convolution kernel filter over ImageData.
 * Used for genuine image sharpening (unsharp mask).
 */
export function applyConvolution3x3(
  sourceData: ImageData,
  kernel: number[], // 9 numbers: row0, row1, row2
  factor: number = 1,
  bias: number = 0
): ImageData {
  const width = sourceData.width;
  const height = sourceData.height;
  const src = sourceData.data;

  // Create clean output buffer
  const output = new ImageData(width, height);
  const dst = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;

      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        const py = Math.min(height - 1, Math.max(0, y + ky));
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const srcIdx = (py * width + px) * 4;
          const kVal = kernel[(ky + 1) * 3 + (kx + 1)];

          r += src[srcIdx] * kVal;
          g += src[srcIdx + 1] * kVal;
          b += src[srcIdx + 2] * kVal;
        }
      }

      dst[dstIdx] = Math.min(255, Math.max(0, Math.round(r * factor + bias)));
      dst[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(g * factor + bias)));
      dst[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(b * factor + bias)));
      dst[dstIdx + 3] = src[dstIdx + 3]; // Preserve alpha
    }
  }

  return output;
}

/**
 * Genuine Pencil Sketch Algorithm:
 * 1. Grayscale
 * 2. Invert grayscale
 * 3. Box blur inverted
 * 4. Color Dodge blend: (base * 256) / (255 - blend + 1)
 */
export function applyPhotoToSketch(
  canvas: HTMLCanvasElement,
  blurRadius: number = 8,
  contrast: number = 1.0
): HTMLCanvasElement {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const totalPixels = width * height;

  // Step 1: Grayscale buffer
  const gray = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // Standard luminosity formula
    gray[i] = Math.round(0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2]);
  }

  // Step 2: Inverted Grayscale buffer
  const invGray = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    invGray[i] = 255 - gray[i];
  }

  // Step 3: Fast horizontal + vertical box blur on inverted grayscale
  const blurredInv = fastBoxBlurGray(invGray, width, height, blurRadius);

  // Step 4: Color dodge blend
  const outputData = ctx.createImageData(width, height);
  const out = outputData.data;

  for (let i = 0; i < totalPixels; i++) {
    const base = gray[i];
    const blend = blurredInv[i];

    // Color Dodge: min(255, (base * 255) / (255 - blend))
    let val = 255;
    if (blend < 255) {
      val = Math.min(255, Math.floor((base * 256) / (255 - blend + 1)));
    }

    if (contrast !== 1.0) {
      val = Math.min(255, Math.max(0, Math.round(((val / 255 - 0.5) * contrast + 0.5) * 255)));
    }

    const idx = i * 4;
    out[idx] = val;
    out[idx + 1] = val;
    out[idx + 2] = val;
    out[idx + 3] = src[idx + 3]; // keep source alpha
  }

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resCtx = resultCanvas.getContext('2d')!;
  resCtx.putImageData(outputData, 0, 0);
  return resultCanvas;
}

function fastBoxBlurGray(
  src: Uint8Array,
  w: number,
  h: number,
  radius: number
): Uint8Array {
  const r = Math.max(1, Math.round(radius));
  const temp = new Uint8Array(w * h);
  const dest = new Uint8Array(w * h);

  // Horizontal blur pass
  for (let y = 0; y < h; y++) {
    let sum = 0;
    const yOffset = y * w;
    for (let k = -r; k <= r; k++) {
      const px = Math.min(w - 1, Math.max(0, k));
      sum += src[yOffset + px];
    }
    temp[yOffset] = Math.round(sum / (2 * r + 1));

    for (let x = 1; x < w; x++) {
      const addX = Math.min(w - 1, x + r);
      const subX = Math.max(0, x - r - 1);
      sum += src[yOffset + addX] - src[yOffset + subX];
      temp[yOffset + x] = Math.round(sum / (2 * r + 1));
    }
  }

  // Vertical blur pass
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const py = Math.min(h - 1, Math.max(0, k));
      sum += temp[py * w + x];
    }
    dest[x] = Math.round(sum / (2 * r + 1));

    for (let y = 1; y < h; y++) {
      const addY = Math.min(h - 1, y + r);
      const subY = Math.max(0, y - r - 1);
      sum += temp[addY * w + x] - temp[subY * w + x];
      dest[y * w + x] = Math.round(sum / (2 * r + 1));
    }
  }

  return dest;
}

/**
 * Target-File-Size binary search compression for JPG and WEBP.
 * Iteratively converges quality to hit user target file size without guesswork.
 */
export async function binarySearchCompressToTarget(
  canvas: HTMLCanvasElement,
  targetBytes: number,
  mimeType: string = 'image/jpeg',
  maxIterations: number = 7
): Promise<{ blob: Blob; quality: number; actualBytes: number }> {
  // If format doesn't support quality parameter (like PNG), fallback to standard toBlob
  if (mimeType === 'image/png') {
    const blob = await canvasToBlob(canvas, mimeType);
    return { blob, quality: 1.0, actualBytes: blob.size };
  }

  let minQ = 0.05;
  let maxQ = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.7;
  let bestDiff = Infinity;

  for (let i = 0; i < maxIterations; i++) {
    const testQ = (minQ + maxQ) / 2;
    const blob = await canvasToBlob(canvas, mimeType, testQ);
    const diff = Math.abs(blob.size - targetBytes);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBlob = blob;
      bestQuality = testQ;
    }

    // If within 3% of target size, good enough
    if (diff / targetBytes < 0.03) {
      return { blob, quality: testQ, actualBytes: blob.size };
    }

    if (blob.size > targetBytes) {
      // Too big -> reduce quality
      maxQ = testQ;
    } else {
      // Too small -> increase quality
      minQ = testQ;
    }
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, mimeType, bestQuality);
  }

  return { blob: bestBlob, quality: bestQuality, actualBytes: bestBlob.size };
}

/**
 * Color conversion utilities for Color Picker
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
