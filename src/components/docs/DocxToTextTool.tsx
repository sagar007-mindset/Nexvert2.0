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
  AlertCircle,
  Loader2,
  WrapText,
  AlignLeft
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { getMammoth, downloadText, copyToClipboard } from './docCommon';

export default function DocxToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wrapLines, setWrapLines] = useState(true);
  const [copied, setCopied] = useState(false);

  // Real stats
  const [stats, setStats] = useState<{
    wordCount: number;
    charCount: number;
    lineCount: number;
  } | null>(null);

  const toolConfig = CONVERTER_TOOLS['docx-to-text'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setTextResult(null);
    setErrorMessage(null);
    setStats(null);

    if (!f) return;

    setIsConverting(true);
    try {
      const mammoth = await getMammoth();
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      const raw = result.value;
      setTextResult(raw);

      const words = raw.trim() ? raw.trim().split(/\s+/).filter(Boolean).length : 0;
      const lines = raw.split(/\r?\n/).length;

      setStats({
        wordCount: words,
        charCount: raw.length,
        lineCount: lines
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to extract text from Word document. Please ensure it is a valid .docx file.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!textResult) return;
    const ok = await copyToClipboard(textResult);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!textResult || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.txt`;
    downloadText(textResult, filename, 'text/plain;charset=utf-8');
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
          subtitle="Word document XML is parsed directly in browser memory"
        />
      </div>

      {/* Loading */}
      {isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-amber-700 dark:text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-800 dark:text-zinc-200 font-medium">Extracting raw text from document...</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Reading paragraph XML nodes from DOCX archive</p>
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

      {/* Results */}
      {textResult !== null && file && !isConverting && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-5">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                {file.name.replace(/\.[^/.]+$/, '')}.txt
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span>Input: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</strong></span>
                <span>•</span>
                <span>Output .txt: <strong className="text-slate-700 dark:text-zinc-300">{formatBytes(new Blob([textResult]).size)}</strong></span>
                {stats && (
                  <>
                    <span>•</span>
                    <span>Words: <strong className="text-slate-700 dark:text-zinc-300">{stats.wordCount.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Lines: <strong className="text-slate-700 dark:text-zinc-300">{stats.lineCount.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Characters: <strong className="text-slate-700 dark:text-zinc-300">{stats.charCount.toLocaleString()}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                  wrapLines
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                    : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
                title="Toggle line wrapping"
              >
                <WrapText className="w-4 h-4" />
                {wrapLines ? 'Wrap: On' : 'Wrap: Off'}
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
                title="Copy all text to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download .txt
              </button>
            </div>
          </div>

          {/* Textarea viewer */}
          <div className="relative">
            <textarea
              readOnly
              value={textResult}
              rows={20}
              wrap={wrapLines ? 'soft' : 'off'}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-y leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
