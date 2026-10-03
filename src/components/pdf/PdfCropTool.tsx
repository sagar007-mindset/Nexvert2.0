/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { renderPdfThumbnail } from './pdfThumbnail';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function PdfCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1); // 1-indexed
  const [pageWidth, setPageWidth] = useState<number>(595);
  const [pageHeight, setPageHeight] = useState<number>(842);
  const [cropLeft, setCropLeft] = useState<number>(30); // in points
  const [cropRight, setCropRight] = useState<number>(30);
  const [cropTop, setCropTop] = useState<number>(30);
  const [cropBottom, setCropBottom] = useState<number>(30);
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [pageThumbnail, setPageThumbnail] = useState<string | null>(null);
  const [isLoadingThumb, setIsLoadingThumb] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['crop-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setCurrentPage(1);
    setPageThumbnail(null);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      const firstPage = doc.getPage(0);
      const w = Math.round(firstPage.getWidth());
      const h = Math.round(firstPage.getHeight());
      setPageWidth(w);
      setPageHeight(h);

      // Set default margin to 5% of width/height
      setCropLeft(Math.round(w * 0.05));
      setCropRight(Math.round(w * 0.05));
      setCropTop(Math.round(h * 0.05));
      setCropBottom(Math.round(h * 0.05));

      loadPageThumb(f, 1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const loadPageThumb = async (f: File, pageNum: number) => {
    setIsLoadingThumb(true);
    try {
      const buf = await f.arrayBuffer();
      const uint8 = new Uint8Array(buf);
      const thumb = await renderPdfThumbnail(uint8, pageNum, 360, `${f.name}_${f.size}`);
      setPageThumbnail(thumb);
    } catch {
      setPageThumbnail(null);
    } finally {
      setIsLoadingThumb(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!file || newPage < 1 || newPage > realPageCount) return;
    setCurrentPage(newPage);
    loadPageThumb(file, newPage);
  };

  const handleCrop = async () => {
    if (!file || realPageCount === 0) return;

    const remainingW = pageWidth - cropLeft - cropRight;
    const remainingH = pageHeight - cropTop - cropBottom;
    if (remainingW <= 20 || remainingH <= 20) {
      setErrorMessage('Crop margins are too large. Please leave at least 20pt for the cropped content.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const docPages = doc.getPages();

      const pagesToCrop = applyToAll
        ? docPages
        : [docPages[currentPage - 1]];

      for (const page of pagesToCrop) {
        const w = page.getWidth();
        const h = page.getHeight();

        // PDF coordinate system has (0,0) at bottom-left
        const x = cropLeft;
        const y = cropBottom;
        const width = Math.max(10, w - cropLeft - cropRight);
        const height = Math.max(10, h - cropTop - cropBottom);

        page.setCropBox(x, y, width, height);
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to crop PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-cropped.pdf`);
  };

  // Preview overlay percentages
  const leftPct = (cropLeft / pageWidth) * 100;
  const rightPct = (cropRight / pageWidth) * 100;
  const topPct = (cropTop / pageHeight) * 100;
  const bottomPct = (cropBottom / pageHeight) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to crop"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {realPageCount} pages • Dimensions: {pageWidth} × {pageHeight} pt
              </p>
            </div>

            {realPageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {realPageCount}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= realPageCount}
                  aria-label="Next page"
                  className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Crop Preview & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Visual Preview */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 mb-2">Live Crop Preview</span>
              <div
                className="relative max-w-[280px] w-full aspect-[1/1.414] bg-white dark:bg-slate-900 shadow-md rounded border border-slate-300 dark:border-slate-700 overflow-hidden"
              >
                {isLoadingThumb ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                ) : pageThumbnail ? (
                  <img
                    src={pageThumbnail}
                    alt="Page thumbnail"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 opacity-40" />
                  </div>
                )}

                {/* Shaded Margins (Outside Crop Area) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 9999px rgba(15, 23, 42, 0.45)`,
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${topPct}%,
                      ${leftPct}% ${topPct}%,
                      ${leftPct}% ${100 - bottomPct}%,
                      ${100 - rightPct}% ${100 - bottomPct}%,
                      ${100 - rightPct}% ${topPct}%,
                      0% ${topPct}%
                    )`
                  }}
                />

                {/* Crop Box Frame */}
                <div
                  className="absolute border-2 border-dashed border-red-500 pointer-events-none transition-all"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    right: `${rightPct}%`,
                    bottom: `${bottomPct}%`
                  }}
                >
                  <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                    Keep Area
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                Output dimensions: {Math.max(0, pageWidth - cropLeft - cropRight)} × {Math.max(0, pageHeight - cropTop - cropBottom)} pt
              </p>
            </div>

            {/* Margin Inputs & Settings */}
            <div className="md:col-span-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Trim Margins (Points)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Top Margin: {cropTop} pt
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.floor(pageHeight * 0.4)}
                    value={cropTop}
                    onChange={(e) => setCropTop(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Bottom Margin: {cropBottom} pt
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.floor(pageHeight * 0.4)}
                    value={cropBottom}
                    onChange={(e) => setCropBottom(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Left Margin: {cropLeft} pt
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.floor(pageWidth * 0.4)}
                    value={cropLeft}
                    onChange={(e) => setCropLeft(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Right Margin: {cropRight} pt
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.floor(pageWidth * 0.4)}
                    value={cropRight}
                    onChange={(e) => setCropRight(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>

              {/* Apply Scope Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Apply Crop To:
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={applyToAll}
                      onChange={() => setApplyToAll(true)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    All {realPageCount} Pages
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="cropScope"
                      checked={!applyToAll}
                      onChange={() => setApplyToAll(false)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    Only Current Page ({currentPage})
                  </label>
                </div>
              </div>

              {/* Crop Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleCrop}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Crop className="w-4 h-4" />
                  {isProcessing ? 'Cropping PDF...' : 'Apply Crop & Save PDF'}
                </button>
              </div>
            </div>
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
                PDF Cropped Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Saved cropped document ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Cropped PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
