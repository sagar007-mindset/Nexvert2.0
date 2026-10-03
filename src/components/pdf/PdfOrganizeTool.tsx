/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { renderPdfThumbnail } from './pdfThumbnail';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PageOrganizeItem {
  originalIndex: number; // 0-indexed
  pageNumber: number; // original 1-indexed
  dataUrl: string | null;
  loading: boolean;
}

export default function PdfOrganizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [pages, setPages] = useState<PageOrganizeItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['organize-pdf'];

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

      const initialPages: PageOrganizeItem[] = Array.from({ length: count }, (_, i) => ({
        originalIndex: i,
        pageNumber: i + 1,
        dataUrl: null,
        loading: true
      }));
      setPages(initialPages);

      // Render thumbnails
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

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
    setResultBlob(null);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    movePage(draggedIdx, idx);
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const resetOrder = () => {
    setPages((prev) => [...prev].sort((a, b) => a.originalIndex - b.originalIndex));
    setResultBlob(null);
  };

  const isOrderChanged = pages.some((p, i) => p.originalIndex !== i);

  const handleSaveOrganizedPdf = async () => {
    if (!file || realPageCount === 0) return;

    if (!isOrderChanged) {
      setErrorMessage('The page order has not been changed yet.');
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

      const newIndices = pages.map((p) => p.originalIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, newIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save reorganized PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-reorganized.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to organize"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {realPageCount} pages
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOrderChanged && (
                <button
                  type="button"
                  onClick={resetOrder}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                >
                  Reset to Original Order
                </button>
              )}
            </div>
          </div>

          {/* Draggable Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((p, idx) => {
              const isDragging = draggedIdx === idx;
              return (
                <div
                  key={p.originalIndex}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col items-center rounded-xl p-3 border transition-all cursor-move ${
                    isDragging
                      ? 'opacity-40 border-red-500 ring-2 ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      Pos: #{idx + 1}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Orig: p.{p.pageNumber}
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full aspect-[1/1.35] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-sm">
                    {p.loading ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : p.dataUrl ? (
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>

                  {/* Move Left / Right Controls */}
                  <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => movePage(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label="Move earlier"
                      className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    <button
                      type="button"
                      onClick={() => movePage(idx, idx + 1)}
                      disabled={idx === pages.length - 1}
                      aria-label="Move later"
                      className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveOrganizedPdf}
              disabled={isProcessing || !isOrderChanged}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Layers className="w-4 h-4" />
              {isProcessing ? 'Saving Reordered PDF...' : 'Save Reorganized PDF'}
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
                PDF Successfully Reorganized!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Saved with new page sequence ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Reordered PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
