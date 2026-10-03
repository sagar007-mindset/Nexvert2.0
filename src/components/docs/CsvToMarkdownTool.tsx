/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Download,
  Copy,
  Check,
  Upload,
  RotateCcw,
  Eye,
  Code,
  FileSpreadsheet
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { downloadText, copyToClipboard } from './docCommon';

const DEFAULT_SAMPLE_CSV = `Product Name,Category,Price,Stock Units,Rating
MacBook Pro 16",Laptops,$2499.00,45,4.9
Dell XPS 15,Laptops,$1899.00,32,4.7
Sony WH-1000XM5,Audio,$398.00,110,4.8
Keychron Q1 Pro,Keyboards,$199.00,85,4.6
Logitech MX Master 3S,Mice,$99.99,230,4.9`;

/**
 * Robust RFC 4180 CSV parser
 */
function parseCsv(text: string, delimiter: string = ','): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((r) => r.length > 0 && r.some((c) => c !== ''));
}

export default function CsvToMarkdownTool() {
  const [csvInput, setCsvInput] = useState<string>(DEFAULT_SAMPLE_CSV);
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [alignment, setAlignment] = useState<'auto' | 'left' | 'center' | 'right'>('auto');
  const [padColumns, setPadColumns] = useState<boolean>(true);
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [parsedMatrix, setParsedMatrix] = useState<string[][]>([]);
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('markdown');
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState('data-table');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect delimiter
  const detectDelimiter = (sample: string) => {
    const commas = (sample.match(/,/g) || []).length;
    const tabs = (sample.match(/\t/g) || []).length;
    const semis = (sample.match(/;/g) || []).length;
    if (tabs > commas && tabs > semis) return '\t';
    if (semis > commas && semis > tabs) return ';';
    return ',';
  };

  useEffect(() => {
    if (!csvInput.trim()) {
      setMarkdownOutput('');
      setParsedMatrix([]);
      return;
    }

    const delim = detectDelimiter(csvInput.slice(0, 1000));
    const matrix = parseCsv(csvInput, delim);
    setParsedMatrix(matrix);

    if (matrix.length === 0) {
      setMarkdownOutput('');
      return;
    }

    const maxCols = Math.max(...matrix.map((r) => r.length));
    if (maxCols === 0) return;

    // Normalize rows to maxCols
    const normalized = matrix.map((row) => {
      const copy = [...row];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });

    const headers = hasHeader
      ? normalized[0]
      : Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`);
    const dataRows = hasHeader ? normalized.slice(1) : normalized;

    // Determine alignment per column
    const colAlignments: ('left' | 'right' | 'center')[] = [];
    for (let c = 0; c < maxCols; c++) {
      if (alignment === 'left') colAlignments.push('left');
      else if (alignment === 'right') colAlignments.push('right');
      else if (alignment === 'center') colAlignments.push('center');
      else {
        // Auto detect numeric
        const nonHeaderValues = dataRows.map((r) => r[c]).filter(Boolean);
        const numericCount = nonHeaderValues.filter((v) =>
          /^[$€£]?\s*[\d,]+(\.\d+)?%?$/.test(v)
        ).length;
        if (nonHeaderValues.length > 0 && numericCount / nonHeaderValues.length >= 0.7) {
          colAlignments.push('right');
        } else {
          colAlignments.push('left');
        }
      }
    }

    // Column widths
    const colWidths = Array(maxCols).fill(3);
    for (let c = 0; c < maxCols; c++) {
      colWidths[c] = Math.max(colWidths[c], headers[c]?.length || 3);
      for (const row of dataRows) {
        colWidths[c] = Math.max(colWidths[c], row[c]?.length || 0);
      }
    }

    // Build GFM table
    const formatCell = (val: string, colIdx: number) => {
      const safe = val.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
      if (!padColumns) return safe;
      const w = colWidths[colIdx];
      const align = colAlignments[colIdx];
      if (align === 'right') return safe.padStart(w, ' ');
      if (align === 'center') {
        const left = Math.floor((w - safe.length) / 2);
        return safe.padStart(safe.length + left, ' ').padEnd(w, ' ');
      }
      return safe.padEnd(w, ' ');
    };

    const headerLine = `| ${headers.map((h, i) => formatCell(h, i)).join(' | ')} |`;
    const separatorLine = `| ${colAlignments
      .map((align, i) => {
        const w = Math.max(colWidths[i], 3);
        if (align === 'right') return '-'.repeat(w - 1) + ':';
        if (align === 'center') return ':' + '-'.repeat(w - 2) + ':';
        return ':' + '-'.repeat(w - 1);
      })
      .join(' | ')} |`;

    const bodyLines = dataRows.map(
      (row) => `| ${row.map((cell, i) => formatCell(cell, i)).join(' | ')} |`
    );

    const md = [headerLine, separatorLine, ...bodyLines].join('\n');
    setMarkdownOutput(md);
  }, [csvInput, hasHeader, alignment, padColumns]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvInput(content);
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

  const rowCount = parsedMatrix.length;
  const colCount = parsedMatrix[0]?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.tsv,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            Upload CSV File
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Table'}
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

      {/* Settings Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-emerald-600 focus:ring-0"
            />
            <span>First row is Header</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={padColumns}
              onChange={(e) => setPadColumns(e.target.checked)}
              className="rounded border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-emerald-600 focus:ring-0"
            />
            <span>Pretty-pad column widths</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
            <span className="text-slate-500 dark:text-zinc-400">Align:</span>
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="auto">Auto-detect (Numeric Right)</option>
              <option value="left">Left Align All</option>
              <option value="center">Center Align All</option>
              <option value="right">Right Align All</option>
            </select>
          </label>

          {rowCount > 0 && (
            <span className="text-slate-500 dark:text-zinc-400">
              Parsed: <strong className="text-slate-800 dark:text-zinc-200">{rowCount} Rows</strong> × <strong className="text-slate-800 dark:text-zinc-200">{colCount} Columns</strong>
            </span>
          )}
        </div>

        <button
          onClick={() => setCsvInput('')}
          className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Editor & Table Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-slate-200 dark:border-zinc-800 rounded-b-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-[600px]">
        {/* Left: CSV Raw Text Input */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              CSV Input Data
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Supports RFC 4180 quotes & commas</span>
          </div>

          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Paste CSV data here..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed min-h-[300px] lg:min-h-[560px]"
          />
        </div>

        {/* Right: Markdown Output */}
        <div className="flex flex-col bg-white dark:bg-zinc-900/30">
          <div className="bg-white dark:bg-zinc-900/70 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Markdown Syntax
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Table Preview
              </button>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
              {formatBytes(new Blob([markdownOutput]).size)}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'markdown' ? (
              <textarea
                readOnly
                value={markdownOutput}
                className="w-full h-full min-h-[300px] lg:min-h-[560px] bg-slate-50 dark:bg-zinc-950 p-4 font-mono text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none leading-relaxed whitespace-pre overflow-x-auto"
              />
            ) : (
              <div className="p-6 overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 dark:border-zinc-800 text-xs">
                  {hasHeader && parsedMatrix.length > 0 && (
                    <thead>
                      <tr className="bg-white dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-200">
                        {parsedMatrix[0].map((h, idx) => (
                          <th key={idx} className="border border-slate-200 dark:border-zinc-800 p-2.5 font-semibold text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {(hasHeader ? parsedMatrix.slice(1) : parsedMatrix).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white dark:hover:bg-zinc-900/40 text-slate-700 dark:text-zinc-300">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="border border-slate-200 dark:border-zinc-800 p-2.5">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
