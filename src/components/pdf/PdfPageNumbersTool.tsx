/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Binary,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Hash,
  LayoutTemplate
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

type PageNumPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export default function PdfPageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [position, setPosition] = useState<PageNumPosition>('bottom-center');
  const [formatStr, setFormatStr] = useState<'page_n_of_total' | 'page_n' | 'just_n' | 'slash'>(
    'page_n_of_total'
  );
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(10);
  const [marginOffset, setMarginOffset] = useState<number>(30); // points
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['add-page-numbers'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const formatTextForPage = (currentNum: number, total: number) => {
    switch (formatStr) {
      case 'page_n_of_total':
        return `Page ${currentNum} of ${total}`;
      case 'page_n':
        return `Page ${currentNum}`;
      case 'just_n':
        return `${currentNum}`;
      case 'slash':
        return `${currentNum} / ${total}`;
      default:
        return `${currentNum}`;
    }
  };

  const handleAddPageNumbers = async () => {
    if (!file || realPageCount === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { StandardFonts, rgb } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);

      const pages = doc.getPages();
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const w = page.getWidth();
        const h = page.getHeight();

        const numVal = startNumber + i;
        const text = formatTextForPage(numVal, totalPages);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0;
        let y = 0;

        switch (position) {
          case 'bottom-center':
            x = (w - textWidth) / 2;
            y = marginOffset;
            break;
          case 'bottom-right':
            x = w - marginOffset - textWidth;
            y = marginOffset;
            break;
          case 'bottom-left':
            x = marginOffset;
            y = marginOffset;
            break;
          case 'top-center':
            x = (w - textWidth) / 2;
            y = h - marginOffset - textHeight;
            break;
          case 'top-right':
            x = w - marginOffset - textWidth;
            y = h - marginOffset - textHeight;
            break;
          case 'top-left':
            x = marginOffset;
            y = h - marginOffset - textHeight;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.25)
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add page numbers to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-numbered.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to add page numbers"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Total pages: {realPageCount}
              </p>
            </div>
          </div>

          {/* Position Selector Visual Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5" /> Position on Page
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              {(
                [
                  ['top-left', 'Top Left'],
                  ['top-center', 'Top Center'],
                  ['top-right', 'Top Right'],
                  ['bottom-left', 'Bottom Left'],
                  ['bottom-center', 'Bottom Center'],
                  ['bottom-right', 'Bottom Right']
                ] as [PageNumPosition, string][]
              ).map(([posKey, label]) => {
                const isSelected = position === posKey;
                return (
                  <button
                    key={posKey}
                    type="button"
                    onClick={() => setPosition(posKey)}
                    className={`py-2 px-1 text-center text-xs rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format & Style Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Numbering Format
              </label>
              <select
                value={formatStr}
                onChange={(e) => setFormatStr(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="page_n_of_total">Page 1 of {realPageCount}</option>
                <option value="page_n">Page 1</option>
                <option value="just_n">1</option>
                <option value="slash">1 / {realPageCount}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Starting Number
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Font Size: {fontSize} pt
              </label>
              <input
                type="range"
                min={8}
                max={18}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-red-600 mt-2"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddPageNumbers}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Hash className="w-4 h-4" />
              {isProcessing ? 'Stamping Numbers...' : 'Add Page Numbers to All Pages'}
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
                Page Numbers Added Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Processed {realPageCount} pages with Helvetica vector numbering ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Numbered PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
