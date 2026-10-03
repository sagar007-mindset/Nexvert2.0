/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scissors,
  FileText,
  Archive,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, parsePageRangeString, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [splitMode, setSplitMode] = useState<'all-pages' | 'custom-ranges'>('all-pages');
  const [customRangeText, setCustomRangeText] = useState('1-2, 3-4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultZipBlob, setResultZipBlob] = useState<Blob | null>(null);
  const [resultFileCount, setResultFileCount] = useState<number>(0);

  const toolConfig = CONVERTER_TOOLS['pdf-split'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultZipBlob(null);
    setRealPageCount(0);

    if (!f) return;

    setIsLoadingPdf(true);
    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const pages = doc.getPageCount();
      setRealPageCount(pages);
      if (pages > 2) {
        setCustomRangeText(`1-${Math.ceil(pages / 2)}, ${Math.ceil(pages / 2) + 1}-${pages}`);
      } else {
        setCustomRangeText('1');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF file.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleSplit = async () => {
    if (!file || realPageCount === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultZipBlob(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const srcDoc = await loadPdfDocument(buf);
      const zip = new JSZip();
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      let generatedFiles = 0;

      if (splitMode === 'all-pages') {
        // Split every page into its own individual PDF
        for (let i = 0; i < realPageCount; i++) {
          const singleDoc = await PDFDocument.create();
          const [copied] = await singleDoc.copyPages(srcDoc, [i]);
          singleDoc.addPage(copied);
          const pdfBytes = await singleDoc.save();
          zip.file(`${baseName}-page-${i + 1}.pdf`, pdfBytes);
          generatedFiles++;
        }
      } else {
        // Custom ranges: split by comma-separated parts
        const rangeSegments = customRangeText.split(',').map((s) => s.trim()).filter(Boolean);
        if (rangeSegments.length === 0) {
          throw new Error('Please enter at least one valid page range (e.g. "1-3, 4-5").');
        }

        for (let idx = 0; idx < rangeSegments.length; idx++) {
          const seg = rangeSegments[idx];
          const indices = parsePageRangeString(seg, realPageCount);
          if (indices.length === 0) continue;

          const rangeDoc = await PDFDocument.create();
          const copiedPages = await rangeDoc.copyPages(srcDoc, indices);
          copiedPages.forEach((p) => rangeDoc.addPage(p));
          const pdfBytes = await rangeDoc.save();

          const cleanSegName = seg.replace(/\s+/g, '').replace(/[^0-9-]/g, '');
          zip.file(`${baseName}-pages-${cleanSegName || idx + 1}.pdf`, pdfBytes);
          generatedFiles++;
        }
      }

      if (generatedFiles === 0) {
        throw new Error('No PDF pages matched your range selection.');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setResultZipBlob(zipBlob);
      setResultFileCount(generatedFiles);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!resultZipBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultZipBlob, `${baseName}-split-pages.zip`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      {/* File Upload Box */}
      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF document to split"
        subtitle="PDF documents up to 100 MB"
      />

      {/* Configuration Section */}
      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Document Details
              </h3>
              <p className="text-xs text-slate-500">
                {file.name} ({formatBytes(file.size)})
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
              Total Pages: <strong>{realPageCount}</strong>
            </span>
          </div>

          {/* Split Mode Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Split Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('all-pages')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'all-pages'
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-slate-900 dark:text-white ring-1 ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1 flex items-center justify-between">
                  Every Page Separately
                  <span className="text-xs font-mono font-normal opacity-70">
                    {realPageCount} {realPageCount === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Splits every page into its own individual 1-page PDF file.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('custom-ranges')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  splitMode === 'custom-ranges'
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-slate-900 dark:text-white ring-1 ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">Custom Page Ranges</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Specify exact page groups (e.g. 1-3, 4, 5-8) to bundle together.
                </p>
              </button>
            </div>
          </div>

          {/* Custom Ranges Input */}
          {splitMode === 'custom-ranges' && (
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Page Ranges
                <span className="text-[11px] font-normal text-slate-400">
                  (Valid: 1 to {realPageCount})
                </span>
              </label>
              <input
                type="text"
                value={customRangeText}
                onChange={(e) => setCustomRangeText(e.target.value)}
                placeholder="e.g. 1-2, 3-5, 6"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Separate ranges with commas. Each range will be saved as its own PDF in the output ZIP.
              </p>
            </div>
          )}

          {/* Split Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSplit}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Scissors className="w-4 h-4" />
              {isProcessing ? 'Processing PDF Pages...' : `Split PDF & Generate ZIP`}
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {resultZipBlob && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                PDF Split Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Created {resultFileCount} PDF documents inside a ZIP archive ({formatBytes(resultZipBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Archive className="w-4 h-4" /> Download Split PDFs (.ZIP)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
