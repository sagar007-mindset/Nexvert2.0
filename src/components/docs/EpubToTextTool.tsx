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
  AlertCircle,
  Loader2,
  FileText,
  List,
  Layers,
  WrapText
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { parseEpubFile, ParsedEpub } from './epubParser';
import { downloadText, copyToClipboard } from './docCommon';

export default function EpubToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedEpub, setParsedEpub] = useState<ParsedEpub | null>(null);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(-1); // -1 = full book
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wrapLines, setWrapLines] = useState(true);
  const [copied, setCopied] = useState(false);

  const toolConfig = CONVERTER_TOOLS['epub-to-text'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setParsedEpub(null);
    setErrorMessage(null);
    setSelectedChapterIdx(-1);

    if (!f) return;

    setIsProcessing(true);
    try {
      const parsed = await parseEpubFile(f);
      setParsedEpub(parsed);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to unpack EPUB ebook. Please verify that this file is an unencrypted standard EPUB archive.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getActiveText = () => {
    if (!parsedEpub) return '';
    if (selectedChapterIdx === -1) {
      return parsedEpub.combinedText;
    }
    return parsedEpub.chapters[selectedChapterIdx]?.textContent || '';
  };

  const handleCopy = async () => {
    const text = getActiveText();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFull = () => {
    if (!parsedEpub || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadText(parsedEpub.combinedText, `${baseName}.txt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadChapter = () => {
    if (!parsedEpub || selectedChapterIdx === -1) return;
    const chapter = parsedEpub.chapters[selectedChapterIdx];
    const safeTitle = (chapter.title || `chapter-${selectedChapterIdx + 1}`).replace(/[^a-z0-9_-]/gi, '_');
    downloadText(chapter.textContent, `${safeTitle}.txt`, 'text/plain;charset=utf-8');
  };

  const activeText = getActiveText();
  const activeWordCount = activeText.trim() ? activeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const activeLineCount = activeText.split(/\r?\n/).length;

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
          subtitle="Reads container.xml, content.opf, and chapter XHTML archives locally"
        />
      </div>

      {/* Loading */}
      {isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-amber-700 dark:text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Unpacking EPUB package and reading chapter spine...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Decompressing XHTML chapter nodes in spine sequence</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300 my-4 text-sm">
          <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-200">EPUB Extraction Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {parsedEpub && file && !isProcessing && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Book Metadata Banner */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{parsedEpub.metadata.title}</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                by <span className="text-slate-800 dark:text-zinc-200 font-medium">{parsedEpub.metadata.author}</span>
                {parsedEpub.metadata.language && ` • Language: ${parsedEpub.metadata.language}`}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input File: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Chapters: <strong className="text-slate-700 dark:text-zinc-300">{parsedEpub.chapters.length}</strong></span>
                <span>•</span>
                <span>Total Words: <strong className="text-slate-700 dark:text-zinc-300">{parsedEpub.totalWordCount.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Total Characters: <strong className="text-slate-700 dark:text-zinc-300">{parsedEpub.totalCharCount.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Active Text'}
              </button>

              <button
                onClick={handleDownloadFull}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Full Book (.txt)
              </button>
            </div>
          </div>

          {/* Chapter Selector and Scope Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                <List className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                View Chapter:
              </span>
              <select
                value={selectedChapterIdx}
                onChange={(e) => setSelectedChapterIdx(Number(e.target.value))}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded px-3 py-1.5 text-xs focus:outline-none max-w-xs"
              >
                <option value={-1}>All Chapters Combined ({parsedEpub.chapters.length} sections)</option>
                {parsedEpub.chapters.map((ch, idx) => (
                  <option key={idx} value={idx}>
                    {idx + 1}. {ch.title} ({ch.wordCount.toLocaleString()} words)
                  </option>
                ))}
              </select>

              {selectedChapterIdx !== -1 && (
                <button
                  onClick={handleDownloadChapter}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline text-xs"
                >
                  Download this chapter only
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
              <span>Section Words: <strong className="text-slate-800 dark:text-zinc-200">{activeWordCount.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Lines: <strong className="text-slate-800 dark:text-zinc-200">{activeLineCount.toLocaleString()}</strong></span>
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
                  wrapLines
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                    : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <WrapText className="w-3 h-3" />
                {wrapLines ? 'Wrap: On' : 'Wrap: Off'}
              </button>
            </div>
          </div>

          {/* Text Area Viewer */}
          <div className="relative">
            <textarea
              readOnly
              value={activeText}
              rows={22}
              wrap={wrapLines ? 'soft' : 'off'}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-y leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
