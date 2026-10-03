/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Eye,
  Code,
  Upload,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import { getMarked, downloadText, copyToClipboard } from './docCommon';

const DEFAULT_SAMPLE_MARKDOWN = `# Getting Started with Markdown

Markdown allows you to write using an easy-to-read, easy-to-write plain text format that converts cleanly into valid **HTML**.

## Feature Highlights

- **Headings**: Convert \`# H1\` to \`###### H6\`
- **Text Formatting**: *Italics*, **Bold**, ~~Strikethrough~~, and \`Inline Code\`
- **Lists**: Ordered and unordered nested lists
- **Tables**: GitHub Flavored Markdown (GFM) tables

### Formatted Table Example

| Feature | In-Browser Engine | External Server |
| :--- | :---: | :---: |
| Data Privacy | 100% Client-Side | None |
| Speed | Instant | Latency |
| Offline Ready | Yes | No |

> "Simplicity is prerequisite for reliability."
> — Edsger W. Dijkstra

\`\`\`typescript
// Quick syntax highlighting preview
function greet(user: string): string {
  return \`Welcome, \${user}!\`;
}
\`\`\`

Type or paste your Markdown in the editor, or upload a \`.md\` file to see the live HTML conversion.
`;

export default function MarkdownToHtmlTool() {
  const [markdownInput, setMarkdownInput] = useState<string>(DEFAULT_SAMPLE_MARKDOWN);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [standaloneHtml, setStandaloneHtml] = useState<boolean>(true);
  const [activeOutputTab, setActiveOutputTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState<string>('document');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live conversion effect
  useEffect(() => {
    let isCancelled = false;

    async function convert() {
      try {
        const marked = await getMarked();
        const html = await marked.parse(markdownInput);
        if (!isCancelled) {
          setRenderedHtml(html);
        }
      } catch (err) {
        if (!isCancelled) {
          setRenderedHtml('<p class="text-red-500">Error parsing markdown.</p>');
        }
      }
    }

    convert();
    return () => {
      isCancelled = true;
    };
  }, [markdownInput]);

  // Real stats
  const wordCount = markdownInput.trim() ? markdownInput.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = markdownInput.split(/\r?\n/).length;
  const charCount = markdownInput.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const base = f.name.replace(/\.[^/.]+$/, '');
    setFilename(base);

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

  const getFullHtmlDocument = () => {
    if (!standaloneHtml) return renderedHtml;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 840px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 1.5em; font-weight: 600; }
    h1 { font-size: 2.25rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
    table, th, td { border: 1px solid #cbd5e1; }
    th, td { padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #475569; margin: 1em 0; font-style: italic; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
  };

  const handleCopy = async () => {
    const full = getFullHtmlDocument();
    const ok = await copyToClipboard(full);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const full = getFullHtmlDocument();
    downloadText(full, `${filename}.html`, 'text/html;charset=utf-8');
  };

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
            accept=".md,.markdown,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Upload .md File
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy HTML'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .html
          </button>
        </div>
      </div>

      {/* Options Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
          <span>Words: <strong className="text-slate-800 dark:text-zinc-200">{wordCount.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Characters: <strong className="text-slate-800 dark:text-zinc-200">{charCount.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Lines: <strong className="text-slate-800 dark:text-zinc-200">{lineCount.toLocaleString()}</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={standaloneHtml}
              onChange={(e) => setStandaloneHtml(e.target.checked)}
              className="rounded border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-rose-600 focus:ring-0"
            />
            <span>Include standalone HTML template with responsive styles</span>
          </label>

          <button
            onClick={() => setMarkdownInput('')}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Side-by-Side Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-slate-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-[620px]">
        {/* Left Column: Markdown Input Editor */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Markdown Editor
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Live updates as you type</span>
          </div>

          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder="Type or paste Markdown here..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[350px] lg:min-h-[580px]"
          />
        </div>

        {/* Right Column: Live Output (Preview or HTML Source) */}
        <div className="flex flex-col bg-white dark:bg-zinc-900/30">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveOutputTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeOutputTab === 'preview'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveOutputTab('code')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeOutputTab === 'code'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Generated HTML ({formatBytes(new Blob([getFullHtmlDocument()]).size)})
              </button>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Instant client-side compile</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeOutputTab === 'preview' ? (
              <div className="bg-white text-slate-500 dark:text-zinc-400 p-6 sm:p-8 h-full min-h-[350px] lg:min-h-[580px]">
                <div
                  className="prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2[data-h1]]:text-2xl [&_h2[data-h1]]:mt-0 [&_h2[data-h1]]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-2 [&_th]:bg-neutral-100 [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-neutral-900 [&_pre]:text-neutral-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:font-mono"
                  // Preview only: "# Title" is shown as a styled <h2 data-h1> so the page keeps a single
                  // H1 for SEO. The exported/copied HTML still contains the user's real <h1>.
                  dangerouslySetInnerHTML={{
                    __html: renderedHtml.replace(/<h1(\s|>)/gi, '<h2 data-h1="true"$1').replace(/<\/h1>/gi, '</h2>'),
                  }}
                />
              </div>
            ) : (
              <textarea
                readOnly
                value={getFullHtmlDocument()}
                className="w-full h-full min-h-[350px] lg:min-h-[580px] bg-slate-50 dark:bg-zinc-950 p-4 font-mono text-xs text-slate-700 dark:text-zinc-300 focus:outline-none resize-none leading-relaxed"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
