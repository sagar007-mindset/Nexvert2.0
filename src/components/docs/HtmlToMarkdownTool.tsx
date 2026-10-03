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
  Code,
  FileCode
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getTurndown, downloadText, copyToClipboard } from './docCommon';

const DEFAULT_SAMPLE_HTML = `<article>
  <h1>HTML to Markdown Converter</h1>
  <p>Convert any raw HTML document or snippet into clean, standardized <strong>Markdown</strong> in real time.</p>
  
  <h2>Supported Formatting Elements</h2>
  <ul>
    <li>Headings (H1 through H6)</li>
    <li>Bold text and <em>italicized emphasis</em></li>
    <li>Inline code like <code>const x = 42;</code></li>
    <li>Ordered and unordered lists</li>
    <li>Standard and GFM Tables</li>
  </ul>

  <h3>Feature Comparison</h3>
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>In-Browser Processing</td>
        <td>100% Client-Side</td>
      </tr>
      <tr>
        <td>Table Preservation</td>
        <td>GFM Aligned</td>
      </tr>
    </tbody>
  </table>

  <blockquote>
    <p>Clean markup makes content portable, readable, and version-control friendly.</p>
  </blockquote>
</article>`;

export default function HtmlToMarkdownTool() {
  const [htmlInput, setHtmlInput] = useState<string>(DEFAULT_SAMPLE_HTML);
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState<string>('converted-document');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live conversion
  useEffect(() => {
    let isCancelled = false;

    async function convert() {
      try {
        const turndown = await getTurndown();
        const md = turndown.turndown(htmlInput);
        if (!isCancelled) {
          setMarkdownOutput(md);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setMarkdownOutput(`// Error converting HTML to Markdown: ${err.message}`);
        }
      }
    }

    convert();
    return () => {
      isCancelled = true;
    };
  }, [htmlInput]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const base = f.name.replace(/\.[^/.]+$/, '');
    setFilename(base);

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
    if (!markdownOutput) return;
    const ok = await copyToClipboard(markdownOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!markdownOutput) return;
    downloadText(markdownOutput, `${filename}.md`, 'text/markdown;charset=utf-8');
  };

  const wordCount = markdownOutput.trim() ? markdownOutput.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = markdownOutput.split(/\r?\n/).length;

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
            <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            Upload HTML File
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .md
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
          <span>Input HTML: <strong className="text-slate-800 dark:text-zinc-200">{formatBytes(new Blob([htmlInput]).size)}</strong></span>
          <span>•</span>
          <span>Output .md: <strong className="text-slate-800 dark:text-zinc-200">{formatBytes(new Blob([markdownOutput]).size)}</strong></span>
          <span>•</span>
          <span>Words: <strong className="text-slate-800 dark:text-zinc-200">{wordCount.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Lines: <strong className="text-slate-800 dark:text-zinc-200">{lineCount.toLocaleString()}</strong></span>
        </div>

        <button
          onClick={() => setHtmlInput('')}
          className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Side-by-Side Editor & Converted Markdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-slate-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-[600px]">
        {/* Left Column: HTML Input */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              HTML Source Input
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Paste or edit raw HTML</span>
          </div>

          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="Paste HTML here..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[300px] lg:min-h-[560px]"
          />
        </div>

        {/* Right Column: Markdown Output */}
        <div className="flex flex-col bg-white dark:bg-zinc-900/30">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              Converted Markdown Output (.md)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Auto-formatted GFM</span>
          </div>

          <textarea
            readOnly
            value={markdownOutput}
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[300px] lg:min-h-[560px]"
          />
        </div>
      </div>
    </div>
  );
}
