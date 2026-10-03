/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Upload,
  RotateCcw,
  WrapText,
  FileCode
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { htmlToStructuredText, downloadText, copyToClipboard } from './docCommon';

const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head><title>Executive Briefing</title></head>
<body>
  <h1>Quarterly Progress & Strategy Update</h1>
  <p>Our infrastructure migration has completed ahead of schedule, with zero reported regressions across all services.</p>

  <h2>Key Accomplishments</h2>
  <ul>
    <li>Reduced container cold-start times by 40%</li>
    <li>Migrated document conversion pipelines to 100% in-browser WebAssembly and JavaScript</li>
    <li>Eliminated external server transmission for sensitive enterprise files</li>
  </ul>

  <h2>Upcoming Roadmaps</h2>
  <ol>
    <li>Deploy offline-first vector PDF rendering engine</li>
    <li>Ship EPUB container unpacking tools</li>
    <li>Enhance markdown table pretty-printing</li>
  </ol>

  <blockquote>
    "Security is not a feature; it is an architectural foundation."
  </blockquote>
</body>
</html>`;

export default function HtmlToTextTool() {
  const [htmlInput, setHtmlInput] = useState<string>(DEFAULT_SAMPLE_HTML);
  const [textOutput, setTextOutput] = useState<string>('');
  const [wrapLines, setWrapLines] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState('extracted-text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!htmlInput.trim()) {
      setTextOutput('');
      return;
    }
    const clean = htmlToStructuredText(htmlInput);
    setTextOutput(clean);
  }, [htmlInput]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setHtmlInput(content);
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const handleCopy = async () => {
    if (!textOutput) return;
    const ok = await copyToClipboard(textOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!textOutput) return;
    downloadText(textOutput, `${filename}.txt`, 'text/plain;charset=utf-8');
  };

  const wordCount = textOutput.trim() ? textOutput.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = textOutput.split(/\r?\n/).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".html,.htm,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-teal-400" />
            Upload HTML File
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .txt
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
          <span>Words: <strong className="text-slate-800 dark:text-zinc-200">{wordCount.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Lines: <strong className="text-slate-800 dark:text-zinc-200">{lineCount.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Characters: <strong className="text-slate-800 dark:text-zinc-200">{textOutput.length.toLocaleString()}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1 ${
              wrapLines
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                : 'bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
            {wrapLines ? 'Wrap: On' : 'Wrap: Off'}
          </button>

          <button
            onClick={() => setHtmlInput('')}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-slate-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-[600px]">
        {/* Left: Raw HTML Input */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-teal-400" />
              Raw HTML Input
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
              {formatBytes(new Blob([htmlInput]).size)}
            </span>
          </div>

          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="Paste HTML here..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[300px] lg:min-h-[560px]"
          />
        </div>

        {/* Right: Clean Plain Text Output */}
        <div className="flex flex-col bg-white dark:bg-zinc-900/30">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Structured Plain Text Output
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Tags stripped, structure preserved</span>
          </div>

          <textarea
            readOnly
            value={textOutput}
            wrap={wrapLines ? 'soft' : 'off'}
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[300px] lg:min-h-[560px]"
          />
        </div>
      </div>
    </div>
  );
}
