/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Download,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, parsePageRangeString, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function PdfExtractPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['extract-pdf-pages'] || CONVERTER_TOOLS['extract-pages-from-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setSelectedIndices([]);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const pages = doc.getPageCount();
      setRealPageCount(pages);
      // Default to select first page
      setSelectedIndices([0]);
      setRangeInput('1');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const togglePageIndex = (index: number) => {
    setSelectedIndices((prev) => {
      const next = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b);
      // Sync range input
      setRangeInput(next.map((i) => i + 1).join(', '));
      return next;
    });
    setResultBlob(null);
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    try {
      const parsed = parsePageRangeString(val, realPageCount);
      setSelectedIndices(parsed);
      setErrorMessage(null);
    } catch {
      // Allow user to keep typing
    }
    setResultBlob(null);
  };

  const selectAll = () => {
    const all = Array.from({ length: realPageCount }, (_, i) => i);
    setSelectedIndices(all);
    setRangeInput(`1-${realPageCount}`);
    setResultBlob(null);
  };

  const selectNone = () => {
    setSelectedIndices([]);
    setRangeInput('');
    setResultBlob(null);
  };

  const handleExtract = async () => {
    if (!file || selectedIndices.length === 0) {
      setErrorMessage('Please select at least one page to extract.');
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

      const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-extracted.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to extract pages from"
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
                {formatBytes(file.size)} • {realPageCount} total pages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Range text input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Page Selection (comma separated or ranges, e.g. 1, 3-5):
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => handleRangeInputChange(e.target.value)}
              placeholder="e.g. 1, 3, 5-8"
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Visual page chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Or Click Pages to Select ({selectedIndices.length} selected):
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
              {Array.from({ length: realPageCount }, (_, i) => {
                const isSelected = selectedIndices.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePageIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-500'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    Page {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleExtract}
              disabled={isProcessing || selectedIndices.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileText className="w-4 h-4" />
              {isProcessing
                ? 'Extracting Pages...'
                : `Extract ${selectedIndices.length} ${selectedIndices.length === 1 ? 'Page' : 'Pages'} to New PDF`}
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
                Pages Extracted Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Created 1 PDF with {selectedIndices.length} pages ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Extracted PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
