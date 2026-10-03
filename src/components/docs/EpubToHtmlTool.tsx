/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  Eye,
  Code,
  AlertCircle,
  Loader2,
  FileCode,
  Palette,
  Layers
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { parseEpubFile, ParsedEpub } from './epubParser';
import { downloadText, copyToClipboard } from './docCommon';

export default function EpubToHtmlTool() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedEpub, setParsedEpub] = useState<ParsedEpub | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reader' | 'code'>('reader');
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [copied, setCopied] = useState(false);

  const toolConfig = CONVERTER_TOOLS['epub-to-html'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setParsedEpub(null);
    setErrorMessage(null);

    if (!f) return;

    setIsProcessing(true);
    try {
      const parsed = await parseEpubFile(f);
      setParsedEpub(parsed);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to unpack EPUB ebook into HTML. Verify the file is an unencrypted standard EPUB archive.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!parsedEpub) return;
    const ok = await copyToClipboard(parsedEpub.combinedHtml);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!parsedEpub || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadText(parsedEpub.combinedHtml, `${baseName}.html`, 'text/html;charset=utf-8');
  };

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-300',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e8d7be]',
    dark: 'bg-[#181a1b] text-[#e8e6e3] border-[#383d40]'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Upload Box */}
      <div className="mb-6">
        <FileUploadBox
          config={toolConfig}
          selectedFile={file}
          onFileSelect={handleSelectFile}
          error={errorMessage}
          onError={setErrorMessage}
          title="Select or drop your EPUB ebook file"
          subtitle="All chapters and images are extracted and unified in browser memory"
        />
      </div>

      {/* Loading */}
      {isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Unpacking EPUB package and embedding images...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Reading XHTML chapters and encoding assets into standalone HTML5</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300 my-4 text-sm">
          <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-200">Extraction Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {parsedEpub && file && !isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400 shrink-0" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{parsedEpub.metadata.title}</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                by <span className="text-slate-800 dark:text-zinc-200 font-medium">{parsedEpub.metadata.author}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Output HTML: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(new Blob([parsedEpub.combinedHtml]).size)}</strong></span>
                <span>•</span>
                <span>Chapters: <strong className="text-slate-700 dark:text-zinc-300">{parsedEpub.chapters.length}</strong></span>
                <span>•</span>
                <span>Words: <strong className="text-slate-700 dark:text-zinc-300">{parsedEpub.totalWordCount.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy HTML'}
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Standalone .html
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('reader')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'reader'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                In-App E-Reader
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
                HTML Source ({formatBytes(new Blob([parsedEpub.combinedHtml]).size)})
              </button>
            </div>

            {activeTab === 'reader' && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <Palette className="w-3.5 h-3.5" />
                <span>Theme:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setReaderTheme('light')}
                    className={`px-2 py-1 rounded text-xs border ${
                      readerTheme === 'light'
                        ? 'bg-white text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-300 font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setReaderTheme('sepia')}
                    className={`px-2 py-1 rounded text-xs border ${
                      readerTheme === 'sepia'
                        ? 'bg-[#fbf0d9] text-[#433422] border-[#e8d7be] font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReaderTheme('dark')}
                    className={`px-2 py-1 rounded text-xs border ${
                      readerTheme === 'dark'
                        ? 'bg-[#181a1b] text-[#e8e6e3] border-[#383d40] font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reader View */}
          {activeTab === 'reader' && (
            <div
              className={`rounded-lg p-6 sm:p-12 max-h-[700px] overflow-y-auto border shadow-inner transition-colors ${themeClasses[readerTheme]}`}
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center pb-8 mb-8 border-b border-current/20">
                  <h2 className="text-3xl font-serif font-bold mb-2">{parsedEpub.metadata.title}</h2>
                  <p className="text-base italic opacity-80">by {parsedEpub.metadata.author}</p>
                </div>

                {/* Table of Contents */}
                <div className="p-4 rounded-lg bg-black/5 border border-current/15 mb-10 text-sm">
                  <p className="font-semibold mb-2">Chapters ({parsedEpub.chapters.length})</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {parsedEpub.chapters.map((c, i) => (
                      <a
                        key={i}
                        href={`#epub-chapter-${i + 1}`}
                        className="block hover:underline opacity-90 truncate"
                      >
                        {i + 1}. {c.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Chapter Bodies */}
                <div className="space-y-12">
                  {parsedEpub.chapters.map((ch, idx) => (
                    <section key={idx} id={`epub-chapter-${idx + 1}`} className="space-y-4">
                      <div className="border-b border-current/15 pb-2">
                        <span className="text-xs uppercase tracking-wider opacity-60">Chapter {idx + 1}</span>
                        <h2 className="text-2xl font-serif font-bold">{ch.title}</h2>
                      </div>
                      <div
                        className="epub-reader-body font-serif text-base leading-relaxed space-y-4 [&_p]:indent-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:mx-auto [&_img]:rounded [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2"
                        dangerouslySetInnerHTML={{ __html: ch.htmlContent }}
                      />
                    </section>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HTML Source View */}
          {activeTab === 'code' && (
            <div className="relative">
              <textarea
                readOnly
                value={parsedEpub.combinedHtml}
                rows={20}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-xs text-slate-700 dark:text-zinc-300 focus:outline-none resize-y leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
