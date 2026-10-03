/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCw,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { renderPdfThumbnail } from './pdfThumbnail';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PageRotateItem {
  pageNumber: number; // 1-indexed
  baseRotation: number;
  rotationDelta: number; // 0, 90, 180, 270
  dataUrl: string | null;
  loading: boolean;
}

export default function PdfRotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [pages, setPages] = useState<PageRotateItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['rotate-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setPages([]);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      const rawPages = doc.getPages();
      const initialPages: PageRotateItem[] = rawPages.map((p, i) => ({
        pageNumber: i + 1,
        baseRotation: p.getRotation().angle,
        rotationDelta: 0,
        dataUrl: null,
        loading: true
      }));
      setPages(initialPages);

      // Render real thumbnails
      const uint8 = new Uint8Array(buf);
      const cacheKey = `${f.name}_${f.size}`;
      for (let p = 1; p <= count; p++) {
        try {
          const dataUrl = await renderPdfThumbnail(uint8, p, 180, cacheKey);
          setPages((prev) =>
            prev.map((item) => (item.pageNumber === p ? { ...item, dataUrl, loading: false } : item))
          );
        } catch {
          setPages((prev) =>
            prev.map((item) => (item.pageNumber === p ? { ...item, loading: false } : item))
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const rotatePage = (pageNumber: number, degreesToAdd: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNumber
          ? { ...p, rotationDelta: (p.rotationDelta + degreesToAdd + 360) % 360 }
          : p
      )
    );
    setResultBlob(null);
  };

  const rotateAllPages = (degreesToAdd: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotationDelta: (p.rotationDelta + degreesToAdd + 360) % 360
      }))
    );
    setResultBlob(null);
  };

  const resetAllRotations = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotationDelta: 0 })));
    setResultBlob(null);
  };

  const handleSaveRotatedPdf = async () => {
    if (!file || realPageCount === 0) return;

    const hasAnyRotation = pages.some((p) => p.rotationDelta !== 0);
    if (!hasAnyRotation) {
      setErrorMessage('No rotation changes were made yet. Rotate one or more pages first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { degrees } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);

      const docPages = doc.getPages();
      pages.forEach((p, idx) => {
        if (p.rotationDelta !== 0) {
          const targetPage = docPages[idx];
          const currentAngle = targetPage.getRotation().angle;
          const finalAngle = (currentAngle + p.rotationDelta + 360) % 360;
          targetPage.setRotation(degrees(finalAngle));
        }
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to rotate PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-rotated.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to rotate"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {realPageCount} pages
              </p>
            </div>

            {/* Bulk Rotation Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-1">Rotate All:</span>
              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5 text-red-500" /> +90° All
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(180)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                180° All
              </button>
              <button
                type="button"
                onClick={resetAllRotations}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((p) => {
              const currentTotalAngle = (p.baseRotation + p.rotationDelta) % 360;
              return (
                <div
                  key={p.pageNumber}
                  className="flex flex-col items-center rounded-xl p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
                      p. {p.pageNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        p.rotationDelta !== 0
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {currentTotalAngle}°
                    </span>
                  </div>

                  {/* Thumbnail with visual rotation */}
                  <div className="w-full aspect-[1/1.35] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-sm">
                    {p.loading ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : p.dataUrl ? (
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${p.rotationDelta}deg)` }}
                      >
                        <img
                          src={p.dataUrl}
                          alt={`Page ${p.pageNumber}`}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>

                  {/* Individual Rotate Button */}
                  <button
                    type="button"
                    onClick={() => rotatePage(p.pageNumber, 90)}
                    className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-red-500" /> Rotate 90°
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveRotatedPdf}
              disabled={isProcessing || !pages.some((p) => p.rotationDelta !== 0)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <RotateCw className="w-4 h-4" />
              {isProcessing ? 'Saving Rotations...' : 'Apply & Save Rotated PDF'}
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
                PDF Rotated Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Updated document with real rotation saved ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Rotated PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
