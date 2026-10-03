/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { getMammoth, getTurndown } from './docCommon';
import { renderMarkdownToPdfBytes } from './markdownPdfRenderer';
import { renderPdfThumbnail, getPdfjs } from '../pdf/pdfThumbnail';
import { triggerFileDownload } from '../pdf/pdfCommon';

export default function DocxToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<'letter' | 'a4'>('letter');

  const toolConfig = CONVERTER_TOOLS['docx-to-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setPdfBytes(null);
    setThumbnailUrl(null);
    setPageCount(0);
    setCurrentPage(1);
    setErrorMessage(null);

    if (!f) return;

    setIsProcessing(true);
    try {
      const mammoth = await getMammoth();
      const turndown = await getTurndown();

      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const md = turndown.turndown(result.value);

      const baseName = f.name.replace(/\.[^/.]+$/, '');
      const bytes = await renderMarkdownToPdfBytes(md, {
        pageSize,
        documentTitle: baseName
      });

      setPdfBytes(bytes);

      // Load with pdfjs to get real page count
      const pdfjs = await getPdfjs(); // configures the local pdf.js worker
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes), cMapPacked: true });
      const loadedDoc = await loadingTask.promise;
      const pages = loadedDoc.numPages;
      setPageCount(pages);

      const thumb = await renderPdfThumbnail(bytes, 1, 400);
      setThumbnailUrl(thumb);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to convert DOCX to PDF. Verify that the file is a valid .docx document.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!pdfBytes || newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
    try {
      const thumb = await renderPdfThumbnail(pdfBytes, newPage, 400);
      setThumbnailUrl(thumb);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!pdfBytes || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(pdfBytes, `${baseName}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Honest Scope Disclosure Banner */}
      <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-100 text-sm block mb-1">Basic Text & Formatting Layout Only</strong>
          Mammoth extracts semantic document structure: headings, body paragraphs, bullet/numbered lists, bold/italics, and tables are converted into a standardized, paginated vector PDF. It <strong>does not preserve</strong> Microsoft Word's desktop publishing layouts, multi-column sections, floating shapes, or custom page geometry. Review the live page preview below before downloading.
        </div>
      </div>

      {/* Upload Box */}
      <div className="mb-6">
        <FileUploadBox
          config={toolConfig}
          selectedFile={file}
          onFileSelect={handleSelectFile}
          error={errorMessage}
          onError={setErrorMessage}
          title="Select or drop your Word (.docx) file"
          subtitle="Word XML parsed and compiled to vector PDF locally"
        />
      </div>

      {/* Loading */}
      {isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-rose-700 dark:text-rose-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Extracting Word content and compiling vector PDF...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Calculating line heights and laying out vector typography</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300 my-4 text-sm">
          <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-200">Conversion Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Result & Live Preview */}
      {pdfBytes && file && !isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-700 dark:text-rose-400" />
                {file.name.replace(/\.[^/.]+$/, '')}.pdf
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input DOCX: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Generated PDF: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(pdfBytes.byteLength)}</strong></span>
                <span>•</span>
                <span>Total Pages: <strong className="text-slate-700 dark:text-zinc-300">{pageCount}</strong></span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .pdf ({formatBytes(pdfBytes.byteLength)})
            </button>
          </div>

          {/* Preview Navigation */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-md mb-4 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                Rendered Page Preview
              </span>

              {pageCount > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-slate-700 dark:text-zinc-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-800 dark:text-zinc-200">
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pageCount}
                    className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-slate-700 dark:text-zinc-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {thumbnailUrl && (
              <div className="shadow-2xl border border-slate-200 dark:border-zinc-700 rounded bg-white p-2 max-w-[420px]">
                <img
                  src={thumbnailUrl}
                  alt={`Rendered PDF page ${currentPage}`}
                  className="w-full h-auto object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
