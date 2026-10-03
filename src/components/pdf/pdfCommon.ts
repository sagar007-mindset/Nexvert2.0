/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatBytes } from '../../utils/converter';

export interface PdfLoadedInfo {
  pageCount: number;
  fileSizeBytes: number;
  pages: {
    index: number;
    width: number;
    height: number;
    rotation: number;
  }[];
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  hasForm: boolean;
  fieldCount: number;
}

let pdfLibPromise: Promise<typeof import('pdf-lib')> | null = null;

export async function getPdfLib() {
  if (!pdfLibPromise) {
    pdfLibPromise = import('pdf-lib');
  }
  return pdfLibPromise;
}

/**
 * Load PDF bytes safely using pdf-lib with clear, honest error handling
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer) {
  const { PDFDocument } = await getPdfLib();
  try {
    const doc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: false,
      updateMetadata: false
    });
    return doc;
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.toLowerCase().includes('encrypted') || msg.toLowerCase().includes('password')) {
      throw new Error(
        'This PDF document is encrypted or password-protected. Password decryption without credentials is not supported.'
      );
    }
    if (msg.toLowerCase().includes('corrupt') || msg.toLowerCase().includes('invalid')) {
      throw new Error(
        'Unable to parse PDF: The file appears to be corrupted, truncated, or is not a valid PDF document.'
      );
    }
    throw new Error(`Failed to read PDF document: ${msg}`);
  }
}

/**
 * Inspect a PDF file and return true page count and dimensions
 */
export async function inspectPdfFile(file: File): Promise<PdfLoadedInfo> {
  const buf = await file.arrayBuffer();
  const doc = await loadPdfDocument(buf);
  const pageCount = doc.getPageCount();
  const rawPages = doc.getPages();

  const pages = rawPages.map((p, index) => ({
    index,
    width: Math.round(p.getWidth() * 100) / 100,
    height: Math.round(p.getHeight() * 100) / 100,
    rotation: p.getRotation().angle
  }));

  let hasForm = false;
  let fieldCount = 0;
  try {
    const form = doc.getForm();
    const fields = form.getFields();
    fieldCount = fields.length;
    hasForm = fieldCount > 0;
  } catch {
    hasForm = false;
    fieldCount = 0;
  }

  return {
    pageCount,
    fileSizeBytes: file.size,
    pages,
    title: doc.getTitle() || undefined,
    author: doc.getAuthor() || undefined,
    subject: doc.getSubject() || undefined,
    keywords: doc.getKeywords() ? doc.getKeywords()!.split(';') : undefined,
    creator: doc.getCreator() || undefined,
    producer: doc.getProducer() || undefined,
    hasForm,
    fieldCount
  };
}

/**
 * Parse human page ranges (e.g. "1-3, 5, 8-10") into 0-indexed integer array
 */
export function parsePageRangeString(input: string, maxPages: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/[,;\s]+/);
  const result = new Set<number>();

  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range segment: "${part}". Please use format like "1-5".`);
      }
      const min = Math.max(1, Math.min(start, end));
      const max = Math.min(maxPages, Math.max(start, end));
      for (let i = min; i <= max; i++) {
        result.add(i - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}". Please enter valid numeric pages.`);
      }
      if (pageNum >= 1 && pageNum <= maxPages) {
        result.add(pageNum - 1);
      } else {
        throw new Error(`Page number ${pageNum} is out of bounds (document has ${maxPages} pages).`);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Trigger genuine client-side file download
 */
export function triggerFileDownload(data: Blob | Uint8Array | ArrayBuffer, filename: string) {
  // Raw bytes (e.g. from pdf-lib's save()) must be wrapped: createObjectURL only accepts Blobs.
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
