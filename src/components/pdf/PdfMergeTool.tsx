/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Plus,
  GripVertical
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PdfFileItem {
  id: string;
  file: File;
  pageCount: number;
  loading: boolean;
  error?: string;
}

export default function PdfMergeTool() {
  const [items, setItems] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPageCount, setResultPageCount] = useState<number>(0);

  const toolConfig = CONVERTER_TOOLS['pdf-merge'];

  const handleAddFiles = async (newFiles: File[]) => {
    setErrorMessage(null);
    setResultBlob(null);

    const newItems: PdfFileItem[] = newFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      pageCount: 0,
      loading: true
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Inspect each file in parallel to get REAL page count
    for (const item of newItems) {
      try {
        const buf = await item.file.arrayBuffer();
        const doc = await loadPdfDocument(buf);
        const count = doc.getPageCount();
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, pageCount: count, loading: false } : i
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, loading: false, error: err.message || 'Failed to read PDF' }
              : i
          )
        );
      }
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setResultBlob(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResultBlob(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setErrorMessage('Please add at least 2 PDF documents to merge.');
      return;
    }

    const faultyItem = items.find((i) => i.error);
    if (faultyItem) {
      setErrorMessage(`Cannot merge: "${faultyItem.file.name}" has an error: ${faultyItem.error}`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const mergedDoc = await PDFDocument.create();

      let totalPages = 0;
      for (const item of items) {
        const buf = await item.file.arrayBuffer();
        const srcDoc = await loadPdfDocument(buf);
        const indices = srcDoc.getPageIndices();
        const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
        copiedPages.forEach((p) => mergedDoc.addPage(p));
        totalPages += indices.length;
      }

      const mergedBytes = await mergedDoc.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setResultPageCount(totalPages);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const baseName = items[0]?.file.name.replace(/\.[^/.]+$/, '') || 'merged';
    triggerFileDownload(resultBlob, `${baseName}-merged.pdf`);
  };

  const totalInputPages = items.reduce((acc, curr) => acc + (curr.pageCount || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      {/* Upload Box */}
      <FileUploadBox
        config={toolConfig}
        selectedFile={null}
        selectedFiles={items.map((i) => i.file)}
        onFileSelect={(f) => f && handleAddFiles([f])}
        onFilesSelect={handleAddFiles}
        error={errorMessage}
        onError={setErrorMessage}
        title="Choose PDF files to merge"
        subtitle="Select multiple PDF documents or drag them here"
        multiple={true}
      />

      {/* Uploaded Files Queue */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              Files to Merge ({items.length})
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Total Pages: <strong className="text-slate-900 dark:text-white">{totalInputPages}</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-5 text-center">
                  {idx + 1}
                </div>
                <div className="p-2 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(item.file.size)} •{' '}
                    {item.loading ? (
                      <span className="text-amber-500">Reading real page count...</span>
                    ) : item.error ? (
                      <span className="text-red-500">{item.error}</span>
                    ) : (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Reorder Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0 || isProcessing}
                    aria-label={`Move ${item.file.name} up`}
                    className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1 || isProcessing}
                    aria-label={`Move ${item.file.name} down`}
                    className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={isProcessing}
                    aria-label={`Remove ${item.file.name}`}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Action Button */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add More PDFs
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleAddFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={handleMerge}
              disabled={isProcessing || items.length < 2 || items.some((i) => i.loading)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>Merging {items.length} PDFs...</>
              ) : (
                <>Merge {items.length} PDFs ({totalInputPages} Total Pages)</>
              )}
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
                PDFs Successfully Merged!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Created 1 continuous document containing {resultPageCount} pages ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Merged PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
