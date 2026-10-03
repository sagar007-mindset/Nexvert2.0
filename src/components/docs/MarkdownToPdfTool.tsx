/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Upload,
  RotateCcw,
  Loader2,
  AlertCircle,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { renderMarkdownToPdfBytes, RenderPdfOptions } from './markdownPdfRenderer';
import { renderPdfThumbnail, getPdfjs } from '../pdf/pdfThumbnail';
import { triggerFileDownload } from '../pdf/pdfCommon';

const DEFAULT_SAMPLE_MARKDOWN = `# Project Documentation Summary

This document illustrates how Markdown is rendered into a clean, print-ready PDF with pure in-browser vector typography.

## Standard Typography Layout

- **Document Headings**: H1, H2, and H3 with clean visual hierarchy
- **Body Paragraphs**: Helvetica standard typography with automatic word wrapping
- **Bullet Lists**: Clean alignment and proportional spacing
- **Page Footers**: Sequential page numbers stamped on every page

### Code Snippet Example

\`\`\`typescript
interface Config {
  title: string;
  pageSize: 'letter' | 'a4';
  margin: number;
}
\`\`\`

> Note: This converter uses a lightweight vector typography engine. It focuses on clean readability, exact word-wrapping, and fast offline export.

## Table of Specifications

| Item | Dimension |
| Standard Margin | 0.75 in (54 pt) |
| Standard Font | Helvetica Regular / Bold |
| Page Numbering | Centered Bottom Footer |

Upload your Markdown file or type directly in the editor below to compile your PDF document.
`;

export default function MarkdownToPdfTool() {
  const [markdownInput, setMarkdownInput] = useState<string>(DEFAULT_SAMPLE_MARKDOWN);
  const [pageSize, setPageSize] = useState<'letter' | 'a4'>('letter');
  const [baseFontSize, setBaseFontSize] = useState<number>(10.5);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compilePdf = async (mdText: string, size: 'letter' | 'a4', fontSize: number, title: string) => {
    if (!mdText.trim()) {
      setPdfBytes(null);
      setThumbnailUrl(null);
      setPageCount(0);
      return;
    }

    setIsCompiling(true);
    setErrorMessage(null);

    try {
      const options: RenderPdfOptions = {
        pageSize: size,
        baseFontSize: fontSize,
        documentTitle: title
      };

      const bytes = await renderMarkdownToPdfBytes(mdText, options);
      setPdfBytes(bytes);

      // Load with pdfjs to get real page count & render thumbnail
      const pdfjs = await getPdfjs(); // configures the local pdf.js worker
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes), cMapPacked: true });
      const loadedDoc = await loadingTask.promise;
      const pages = loadedDoc.numPages;
      setPageCount(pages);

      const targetPage = Math.min(currentPage, pages);
      setCurrentPage(targetPage);

      const thumb = await renderPdfThumbnail(bytes, targetPage, 400);
      setThumbnailUrl(thumb);
    } catch (err: any) {
      setErrorMessage('Failed to compile PDF: ' + (err.message || String(err)));
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      compilePdf(markdownInput, pageSize, baseFontSize, docTitle);
    }, 400);
    return () => clearTimeout(timeout);
  }, [markdownInput, pageSize, baseFontSize, docTitle]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const base = f.name.replace(/\.[^/.]+$/, '');
    setDocTitle(base);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setMarkdownInput(content);
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const handleDownload = () => {
    if (!pdfBytes) return;
    triggerFileDownload(pdfBytes, `${docTitle}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            Upload .md File
          </button>

          <button
            onClick={handleDownload}
            disabled={!pdfBytes}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .pdf {pdfBytes ? `(${formatBytes(pdfBytes.byteLength)})` : ''}
          </button>
        </div>
      </div>

      {/* Honest Scope Banner */}
      <div className="mb-6 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 dark:text-zinc-300">
        <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-zinc-200">Basic Typography Layout:</strong> Headings, body text, lists, and code blocks are rendered into a clean, legible PDF layout with standard margins and footers. Does not emulate complex desktop publishing graphics, columns, or CSS floats.
        </div>
      </div>

      {/* Settings Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
            <span className="text-slate-500 dark:text-zinc-400">Page Size:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="a4">A4 (210 × 297 mm)</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
            <span className="text-slate-500 dark:text-zinc-400">Base Font:</span>
            <select
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(Number(e.target.value))}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value={9.5}>Compact (9.5 pt)</option>
              <option value={10.5}>Standard (10.5 pt)</option>
              <option value={12}>Large (12 pt)</option>
            </select>
          </label>

          {pageCount > 0 && (
            <span className="text-slate-500 dark:text-zinc-400">
              Generated: <strong className="text-slate-800 dark:text-zinc-200">{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</strong>
            </span>
          )}
        </div>

        <button
          onClick={() => setMarkdownInput('')}
          className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Editor
        </button>
      </div>

      {/* Editor & PDF Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-slate-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-[620px]">
        {/* Left: Markdown Editor */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
              Markdown Content
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Auto-compiles on edit</span>
          </div>

          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder="Type or paste Markdown..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[350px] lg:min-h-[580px]"
          />
        </div>

        {/* Right: Live PDF Page Preview */}
        <div className="flex flex-col bg-white dark:bg-zinc-900/40">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
              Live PDF Output Preview
            </span>

            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-slate-700 dark:text-zinc-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-700 dark:text-zinc-300 font-mono">
                  {currentPage} / {pageCount}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  className="p-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-slate-700 dark:text-zinc-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
            {isCompiling ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-rose-700 dark:text-rose-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">Rendering vector PDF canvas...</p>
              </div>
            ) : thumbnailUrl ? (
              <div className="shadow-2xl border border-slate-200 dark:border-zinc-700 rounded bg-white p-2 max-w-[420px]">
                <img
                  src={thumbnailUrl}
                  alt={`Rendered PDF page ${currentPage}`}
                  className="w-full h-auto object-contain rounded"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-500">Enter Markdown to view rendered PDF</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
