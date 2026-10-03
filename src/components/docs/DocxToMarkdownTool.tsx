/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Eye,
  Code,
  AlertCircle,
  Loader2,
  FileCode
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { getMammoth, getTurndown, getMarked, downloadText, copyToClipboard } from './docCommon';

export default function DocxToMarkdownTool() {
  const [file, setFile] = useState<File | null>(null);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [renderedPreviewHtml, setRenderedPreviewHtml] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('markdown');
  const [copied, setCopied] = useState(false);

  // Real stats
  const [stats, setStats] = useState<{
    wordCount: number;
    charCount: number;
    lineCount: number;
  } | null>(null);

  const toolConfig = CONVERTER_TOOLS['docx-to-markdown'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setMarkdownResult(null);
    setRenderedPreviewHtml(null);
    setErrorMessage(null);
    setStats(null);

    if (!f) return;

    setIsConverting(true);
    try {
      const mammoth = await getMammoth();
      const turndown = await getTurndown();
      const marked = await getMarked();

      const arrayBuffer = await f.arrayBuffer();
      const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
      const html = mammothResult.value;

      const md = turndown.turndown(html);
      setMarkdownResult(md);

      // Render marked HTML for preview
      const previewHtml = await marked.parse(md);
      setRenderedPreviewHtml(previewHtml);

      const words = md.trim() ? md.trim().split(/\s+/).filter(Boolean).length : 0;
      const lines = md.split(/\r?\n/).length;

      setStats({
        wordCount: words,
        charCount: md.length,
        lineCount: lines
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to convert DOCX to Markdown. Ensure the file is a valid .docx document.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!markdownResult) return;
    const ok = await copyToClipboard(markdownResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!markdownResult || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.md`;
    downloadText(markdownResult, filename, 'text/markdown;charset=utf-8');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Upload Box */}
      <div className="mb-6">
        <FileUploadBox
          config={toolConfig}
          selectedFile={file}
          onFileSelect={handleSelectFile}
          error={errorMessage}
          onError={setErrorMessage}
          title="Select or drop your Word (.docx) file"
          subtitle="Processed 100% locally in browser memory"
        />
      </div>

      {/* Loading state */}
      {isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Extracting content and transforming into Markdown...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Converting Word XML DOM to structured Markdown syntax</p>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300 my-4 text-sm">
          <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-200">Conversion Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {markdownResult !== null && file && !isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                {file.name.replace(/\.[^/.]+$/, '')}.md
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Output .md: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(new Blob([markdownResult]).size)}</strong></span>
                {stats && (
                  <>
                    <span>•</span>
                    <span>Words: <strong className="text-slate-700 dark:text-zinc-300">{stats.wordCount.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Lines: <strong className="text-slate-700 dark:text-zinc-300">{stats.lineCount}</strong></span>
                    <span>•</span>
                    <span>Characters: <strong className="text-slate-700 dark:text-zinc-300">{stats.charCount.toLocaleString()}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
                title="Copy Markdown code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-950/40 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download .md
              </button>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Markdown Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Rendered Preview
              </button>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-500 hidden sm:inline">
              Pure client-side conversion
            </span>
          </div>

          {/* Tab 1: Raw Markdown text */}
          {activeTab === 'markdown' && (
            <div className="relative">
              <textarea
                readOnly
                value={markdownResult}
                rows={18}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-xs text-slate-700 dark:text-zinc-300 focus:outline-none resize-y leading-relaxed"
              />
            </div>
          )}

          {/* Tab 2: Rendered preview */}
          {activeTab === 'preview' && renderedPreviewHtml && (
            <div className="bg-white text-slate-500 dark:text-zinc-400 rounded-lg p-6 sm:p-8 max-h-[600px] overflow-y-auto border border-slate-200 dark:border-zinc-700 shadow-inner">
              <div
                className="markdown-preview prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-2 [&_th]:bg-neutral-100 [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3"
                dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
