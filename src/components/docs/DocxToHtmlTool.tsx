/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Eye,
  Code,
  FileText,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { getMammoth, downloadText, copyToClipboard } from './docCommon';

export default function DocxToHtmlTool() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlResult, setHtmlResult] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'messages'>('preview');
  const [copied, setCopied] = useState(false);

  // Real extracted metrics
  const [stats, setStats] = useState<{
    wordCount: number;
    charCount: number;
    paragraphCount: number;
    imageCount: number;
    headingCount: number;
  } | null>(null);

  const toolConfig = CONVERTER_TOOLS['docx-to-html'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setHtmlResult(null);
    setMessages([]);
    setErrorMessage(null);
    setStats(null);

    if (!f) return;

    setIsConverting(true);
    try {
      const mammoth = await getMammoth();
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      const rawHtml = result.value;
      setHtmlResult(rawHtml);
      setMessages(result.messages || []);

      // Calculate honest metrics from actual converted HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      const text = doc.body.textContent || '';
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      const paragraphs = doc.querySelectorAll('p').length;
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      const images = doc.querySelectorAll('img').length;

      setStats({
        wordCount: words,
        charCount: text.length,
        paragraphCount: paragraphs,
        imageCount: images,
        headingCount: headings
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to read DOCX file. Ensure the file is a valid Microsoft Word .docx document.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!htmlResult) return;
    const ok = await copyToClipboard(htmlResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!htmlResult || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.html`;

    // Wrap in standalone HTML template for download
    const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 1.5em; }
    table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
    table, th, td { border: 1px solid #cbd5e1; }
    th, td { padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #475569; margin: 1em 0; }
  </style>
</head>
<body>
${htmlResult}
</body>
</html>`;

    downloadText(fullDocument, filename, 'text/html;charset=utf-8');
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
          title="Drop your Word .docx file here"
          subtitle="Supports standard Microsoft Word .docx files up to 100MB"
        />
      </div>

      {/* Loading state */}
      {isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-rose-600 dark:text-rose-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Extracting semantic HTML from Word document...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Processing XML paragraph and table streams locally in browser memory</p>
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

      {/* Results View */}
      {htmlResult !== null && file && !isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Top Bar with real stats and actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                {file.name.replace(/\.[^/.]+$/, '')}.html
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Output HTML: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(new Blob([htmlResult]).size)}</strong></span>
                {stats && (
                  <>
                    <span>•</span>
                    <span>Words: <strong className="text-slate-700 dark:text-zinc-300">{stats.wordCount.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Headings: <strong className="text-slate-700 dark:text-zinc-300">{stats.headingCount}</strong></span>
                    <span>•</span>
                    <span>Images: <strong className="text-slate-700 dark:text-zinc-300">{stats.imageCount}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
                title="Copy HTML to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy HTML'}
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download .html
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'code'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML Source ({formatBytes(new Blob([htmlResult]).size)})
              </button>
              {messages.length > 0 && (
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                    activeTab === 'messages'
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  Notes ({messages.length})
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 dark:text-zinc-500 hidden sm:inline">
              Pure client-side extraction via Mammoth
            </span>
          </div>

          {/* Tab 1: Visual Preview */}
          {activeTab === 'preview' && (
            <div className="bg-white text-slate-500 dark:text-zinc-400 rounded-lg p-6 sm:p-8 max-h-[600px] overflow-y-auto border border-slate-200 dark:border-zinc-700 shadow-inner">
              <div
                className="docx-html-preview prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-2 [&_th]:bg-neutral-100 [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_img]:max-w-full [&_img]:h-auto [&_img]:my-3"
                dangerouslySetInnerHTML={{ __html: htmlResult }}
              />
            </div>
          )}

          {/* Tab 2: HTML Source Code */}
          {activeTab === 'code' && (
            <div className="relative">
              <textarea
                readOnly
                value={htmlResult}
                rows={18}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-xs text-slate-700 dark:text-zinc-300 focus:outline-none resize-y leading-relaxed"
              />
            </div>
          )}

          {/* Tab 3: Mammoth Messages / Warnings */}
          {activeTab === 'messages' && (
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-2 text-xs">
              <p className="text-slate-500 dark:text-zinc-400 font-medium mb-2">
                Conversion notices generated during Word XML parsing:
              </p>
              {messages.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/80 p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                  <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{m.message || String(m)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
