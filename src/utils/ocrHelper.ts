/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
}

export interface OcrResult {
  text: string;
  confidence: number;
  wordCount: number;
  charCount: number;
  lineCount: number;
}

export const SUPPORTED_OCR_LANGUAGES = [
  { code: 'eng', name: 'English', size: '2.9 MB' },
  { code: 'spa', name: 'Spanish (Español)', size: '2.1 MB' },
  { code: 'fra', name: 'French (Français)', size: '691 KB' },
  { code: 'deu', name: 'German (Deutsch)', size: '1.3 MB' },
  { code: 'ita', name: 'Italian (Italiano)', size: '1.6 MB' },
  { code: 'por', name: 'Portuguese (Português)', size: '1.4 MB' },
];

export async function createOcrWorker(
  language: string = 'eng',
  onProgress?: (progress: OcrProgress) => void
) {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(language, 1, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract',
    langPath: '/tesseract/lang-data',
    gzip: true,
    logger: (m) => {
      if (onProgress && m) {
        onProgress({
          status: m.status || 'Processing',
          progress: typeof m.progress === 'number' ? m.progress : 0,
        });
      }
    },
  });

  return worker;
}

export async function runOcrWithWorker(
  worker: any,
  imageSource: File | Blob | HTMLCanvasElement | ImageData
): Promise<OcrResult> {
  let targetInput: any = imageSource;
  if (typeof ImageData !== 'undefined' && imageSource instanceof ImageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    const ctx = canvas.getContext('2d');
    ctx?.putImageData(imageSource, 0, 0);
    targetInput = canvas;
  }
  const res = await worker.recognize(targetInput);
  const rawText = res.data?.text || '';
  const trimmed = rawText.trim();
  const words = trimmed.length > 0 ? trimmed.split(/\s+/).length : 0;
  const lines = trimmed.length > 0 ? trimmed.split(/\r\n|\r|\n/).filter((l: string) => l.trim().length > 0).length : 0;
  const confidence = Math.round(res.data?.confidence || 0);

  return {
    text: rawText,
    confidence,
    wordCount: words,
    charCount: rawText.length,
    lineCount: lines,
  };
}

/**
 * Execute genuine client-side OCR on an image using local Tesseract WASM & trained data.
 * Zero external network calls.
 */
export async function runOcrOnImage(
  imageSource: File | Blob | HTMLCanvasElement | ImageData,
  language: string = 'eng',
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const worker = await createOcrWorker(language, onProgress);
  try {
    return await runOcrWithWorker(worker, imageSource);
  } finally {
    await worker.terminate();
  }
}
