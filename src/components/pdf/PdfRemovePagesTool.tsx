/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { renderPdfThumbnail } from './pdfThumbnail';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PageThumbnailItem {
  pageNumber: number; // 1-indexed
  dataUrl: string | null;
  loading: boolean;
}

export default function PdfRemovePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]); // 1-indexed
  const [thumbnails, setThumbnails] = useState<PageThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['remove-pdf-pages'] || CONVERTER_TOOLS['pdf-page-remover'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setPagesToDelete([]);
    setThumbnails([]);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      // Initialize thumbnail skeletons
      const initialThumbs: PageThumbnailItem[] = Array.from({ length: count }, (_, i) => ({
        pageNumber: i + 1,
        dataUrl: null,
        loading: true
      }));
      setThumbnails(initialThumbs);

      // Render thumbnails asynchronously using real pdfjs-dist
      const uint8 = new Uint8Array(buf);
      const cacheKey = `${f.name}_${f.size}`;
      for (let p = 1; p <= count; p++) {
        try {
          const dataUrl = await renderPdfThumbnail(uint8, p, 180, cacheKey);
          setThumbnails((prev) =>
            prev.map((t) => (t.pageNumber === p ? { ...t, dataUrl, loading: false } : t))
          );
        } catch (thumbErr) {
          setThumbnails((prev) =>
            prev.map((t) => (t.pageNumber === p ? { ...t, loading: false } : t))
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const togglePageToDelete = (pageNumber: number) => {
    setPagesToDelete((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
    setResultBlob(null);
  };

  const handleRemove = async () => {
    if (!file || realPageCount === 0) return;

    if (pagesToDelete.length === 0) {
      setErrorMessage('Please select at least one page to delete.');
      return;
    }

    if (pagesToDelete.length >= realPageCount) {
      setErrorMessage('You cannot delete all pages. The resulting document must contain at least one page.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const srcDoc = await loadPdfDocument(buf);
      const newDoc = await PDFDocument.create();

      // Pages to keep: all 0-indexed pages NOT in pagesToDelete
      const keepIndices: number[] = [];
      for (let i = 0; i < realPageCount; i++) {
        if (!pagesToDelete.includes(i + 1)) {
          keepIndices.push(i);
        }
      }

      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-pages-removed.pdf`);
  };

  const remainingPageCount = realPageCount - pagesToDelete.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to remove pages from"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Total pages: {realPageCount}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Selected for removal:{' '}
                <strong className="text-red-600 dark:text-red-400">
                  {pagesToDelete.length}
                </strong>{' '}
                ({remainingPageCount} will remain)
              </span>
              {pagesToDelete.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPagesToDelete([])}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Page Grid with Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {thumbnails.map((thumb) => {
              const isSelected = pagesToDelete.includes(thumb.pageNumber);
              return (
                <div
                  key={thumb.pageNumber}
                  onClick={() => togglePageToDelete(thumb.pageNumber)}
                  className={`group relative cursor-pointer flex flex-col items-center rounded-xl p-2 border transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500'
                      : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="w-full flex items-center justify-between mb-1 px-1">
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      p. {thumb.pageNumber}
                    </span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40" />
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full aspect-[1/1.35] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-sm">
                    {thumb.loading ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : thumb.dataUrl ? (
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className={`w-full h-full object-contain transition-opacity ${
                          isSelected ? 'opacity-30 filter grayscale' : 'opacity-100'
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}

                    {/* Delete overlay banner */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-[0.5px]">
                        <span className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Remove
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing || pagesToDelete.length === 0 || remainingPageCount <= 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
              {isProcessing
                ? 'Removing Pages...'
                : `Delete ${pagesToDelete.length} Selected ${pagesToDelete.length === 1 ? 'Page' : 'Pages'}`}
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {resultBlob && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Pages Removed Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Created new PDF with {remainingPageCount} pages remaining ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Updated PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
