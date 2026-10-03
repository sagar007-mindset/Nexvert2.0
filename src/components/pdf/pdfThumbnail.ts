/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cache rendered thumbnails by a unique key: `${pdfHashOrName}_page_${pageNumber}`
const thumbnailCache = new Map<string, string>();

let pdfjsInstance: any = null;
let pdfjsLoadingPromise: Promise<any> | null = null;

export async function getPdfjs() {
  if (pdfjsInstance) return pdfjsInstance;
  if (!pdfjsLoadingPromise) {
    pdfjsLoadingPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      // Configure local worker URL without any external CDN network calls
      try {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
          ).href;
        }
      } catch {
        // Fallback or ignore if already configured
      }
      pdfjsInstance = pdfjs;
      return pdfjs;
    })();
  }
  return pdfjsLoadingPromise;
}

/**
 * Render a real visual thumbnail for a specific PDF page using pdfjs-dist.
 */
export async function renderPdfThumbnail(
  pdfBytes: Uint8Array,
  pageNumber: number,
  targetWidth: number = 220,
  cacheKey?: string
): Promise<string> {
  const fullCacheKey = cacheKey ? `${cacheKey}_p${pageNumber}_w${targetWidth}` : null;
  if (fullCacheKey && thumbnailCache.has(fullCacheKey)) {
    return thumbnailCache.get(fullCacheKey)!;
  }

  try {
    const pdfjs = await getPdfjs();
    // Copy array buffer slice to avoid detached buffer issues
    const dataCopy = new Uint8Array(pdfBytes);
    const loadingTask = pdfjs.getDocument({
      data: dataCopy,
      cMapUrl: undefined,
      cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
      throw new Error(`Page ${pageNumber} out of bounds (1..${pdfDoc.numPages})`);
    }

    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D canvas context');

    // Fill white background for transparent pages
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (fullCacheKey) {
      thumbnailCache.set(fullCacheKey, dataUrl);
    }
    return dataUrl;
  } catch (err: any) {
    console.warn('pdf.js thumbnail render warning:', err);
    // Return SVG fallback with exact aspect ratio if possible
    return generateFallbackThumbnail(pageNumber, targetWidth, Math.round(targetWidth * 1.414));
  }
}

/**
 * Fallback visual generator if PDF rendering fails (e.g. encrypted or damaged stream)
 */
export function generateFallbackThumbnail(
  pageNumber: number,
  width: number = 220,
  height: number = 310
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="4"/>
    <line x1="20" y1="30" x2="${width - 20}" y2="30" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
    <line x1="20" y1="45" x2="${width - 40}" y2="45" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
    <line x1="20" y1="60" x2="${width - 30}" y2="60" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
    <rect x="${width / 2 - 30}" y="${height / 2 - 18}" width="60" height="36" fill="#ef4444" rx="6"/>
    <text x="${width / 2}" y="${height / 2 + 6}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">p. ${pageNumber}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
