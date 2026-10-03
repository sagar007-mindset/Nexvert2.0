/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Code,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { getConverterConfig } from '../config/converters.config';
import FileUploadBox from './FileUploadBox';
import TargetFormatSelector from './TargetFormatSelector';
import { Analytics } from '../utils/analytics';

import DocxToHtmlTool from './docs/DocxToHtmlTool';
import DocxToMarkdownTool from './docs/DocxToMarkdownTool';
import DocxToTextTool from './docs/DocxToTextTool';
import MarkdownToHtmlTool from './docs/MarkdownToHtmlTool';
import HtmlToMarkdownTool from './docs/HtmlToMarkdownTool';
import MarkdownToPdfTool from './docs/MarkdownToPdfTool';
import CsvToMarkdownTool from './docs/CsvToMarkdownTool';
import HtmlToTextTool from './docs/HtmlToTextTool';
import EpubToTextTool from './docs/EpubToTextTool';
import EpubToHtmlTool from './docs/EpubToHtmlTool';
import DocxToPdfTool from './docs/DocxToPdfTool';

export type DocMode =
  | 'docx-to-html'
  | 'docx-to-markdown'
  | 'docx-to-text'
  | 'docx-to-pdf'
  | 'markdown-to-html'
  | 'html-to-markdown'
  | 'markdown-to-pdf'
  | 'csv-to-markdown'
  | 'html-to-text'
  | 'epub-to-text'
  | 'epub-to-html'
  | 'csv-to-json'
  | 'json-to-csv';

interface DocumentConverterProps {
  initialMode?: string;
}

export default function DocumentConverter({ initialMode }: DocumentConverterProps = {}) {
  const [mode, setMode] = useState<DocMode>('docx-to-markdown');

  // JSON/CSV state
  const [file, setFile] = useState<File | null>(null);
  const [selectedTargetFormat, setSelectedTargetFormat] = useState<string>('JSON');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultContent, setResultContent] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      const cleaned = initialMode.toLowerCase().replace(/^\//, '').replace(/\/$/, '');
      if (cleaned === 'md-to-html') {
        setMode('markdown-to-html');
      } else if (cleaned === 'html-to-md') {
        setMode('html-to-markdown');
      } else if (cleaned === 'document-converter' || cleaned === 'pdf-converter') {
        setMode('docx-to-markdown');
      } else {
        setMode(cleaned as DocMode);
      }
    }
  }, [initialMode]);

  const tabs: { label: string; id: DocMode }[] = [
    { label: 'DOCX to Markdown', id: 'docx-to-markdown' },
    { label: 'DOCX to HTML', id: 'docx-to-html' },
    { label: 'DOCX to Text', id: 'docx-to-text' },
    { label: 'DOCX to PDF', id: 'docx-to-pdf' },
    { label: 'Markdown to HTML', id: 'markdown-to-html' },
    { label: 'HTML to Markdown', id: 'html-to-markdown' },
    { label: 'Markdown to PDF', id: 'markdown-to-pdf' },
    { label: 'CSV to Markdown', id: 'csv-to-markdown' },
    { label: 'HTML to Text', id: 'html-to-text' },
    { label: 'EPUB to Text', id: 'epub-to-text' },
    { label: 'EPUB to HTML', id: 'epub-to-html' },
    { label: 'CSV to JSON', id: 'csv-to-json' },
    { label: 'JSON to CSV', id: 'json-to-csv' },
  ];

  const handleTabChange = (newMode: DocMode) => {
    setMode(newMode);
    setFile(null);
    setResultContent(null);
    setError(null);
  };

  // Render dedicated honest tool when selected
  const renderToolBody = () => {
    switch (mode) {
      case 'docx-to-html':
        return <DocxToHtmlTool />;
      case 'docx-to-markdown':
        return <DocxToMarkdownTool />;
      case 'docx-to-text':
        return <DocxToTextTool />;
      case 'docx-to-pdf':
        return <DocxToPdfTool />;
      case 'markdown-to-html':
        return <MarkdownToHtmlTool />;
      case 'html-to-markdown':
        return <HtmlToMarkdownTool />;
      case 'markdown-to-pdf':
        return <MarkdownToPdfTool />;
      case 'csv-to-markdown':
        return <CsvToMarkdownTool />;
      case 'html-to-text':
        return <HtmlToTextTool />;
      case 'epub-to-text':
        return <EpubToTextTool />;
      case 'epub-to-html':
        return <EpubToHtmlTool />;
      case 'csv-to-json':
      case 'json-to-csv':
        return renderDataConverter();
      default:
        return <DocxToMarkdownTool />;
    }
  };

  // Honest CSV/JSON parser
  const csvToJson = (csv: string) => {
    const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const obj: any = {};
      const currentLine = lines[i].split(',');
      headers.forEach((header, index) => {
        const value = currentLine[index] ? currentLine[index].replace(/^["']|["']$/g, '').trim() : '';
        obj[header] = value;
      });
      result.push(obj);
    }
    return result;
  };

  const jsonToCsv = (jsonStr: string) => {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return '';
    const headers = Object.keys(arr[0]);
    const csvLines = [headers.join(',')];
    arr.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] === undefined || row[header] === null ? '' : row[header];
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      });
      csvLines.push(values.join(','));
    });
    return csvLines.join('\n');
  };

  const handleConvertData = async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);

    try {
      if (mode === 'csv-to-json') {
        const text = await file.text();
        const jsonResult = csvToJson(text);
        setResultContent(JSON.stringify(jsonResult, null, 2));
      } else if (mode === 'json-to-csv') {
        const text = await file.text();
        const csvResult = jsonToCsv(text);
        setResultContent(csvResult);
      }
    } catch (err: any) {
      setError('Data conversion error: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadData = () => {
    if (!resultContent || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const ext = mode === 'csv-to-json' ? 'json' : 'csv';
    const mime = mode === 'csv-to-json' ? 'application/json' : 'text/csv';

    const blob = new Blob([resultContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${base}_converted.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const renderDataConverter = () => {
    const isCsvToJson = mode === 'csv-to-json';
    const config = {
      id: mode,
      route: `/${mode}/`,
      title: isCsvToJson ? 'Convert CSV to JSON' : 'Convert JSON to CSV',
      description: isCsvToJson ? 'Parse CSV tabular records into formatted JSON.' : 'Flatten JSON objects into CSV format.',
      category: 'PDF & Document' as const,
      inputFormats: isCsvToJson ? ['CSV'] : ['JSON'],
      outputFormats: isCsvToJson ? ['JSON'] : ['CSV'],
      defaultOutputFormat: isCsvToJson ? 'JSON' : 'CSV',
      mimeTypes: isCsvToJson ? ['text/csv', 'text/plain'] : ['application/json', 'text/plain'],
      fileExtensions: isCsvToJson ? ['.csv', '.txt'] : ['.json', '.txt'],
      maxFileSizeMB: 20,
      conversionCapabilities: ['client-side'],
      supportsMultipleFiles: false,
      supportsBatchConversion: false,
      relatedToolIds: []
    };

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={config}
          selectedFile={file}
          onFileSelect={(f) => {
            setFile(f);
            setResultContent(null);
            setError(null);
          }}
          error={error}
          onError={setError}
        />

        {file && !isConverting && !resultContent && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              type="button"
              onClick={handleConvertData}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Code className="w-4 h-4" />
              <span>Convert File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResultContent(null);
              }}
              className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {resultContent && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Converted successfully!</span>
            </div>
            <pre className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 max-h-56 overflow-auto font-mono text-[11px] text-slate-700 dark:text-zinc-300 whitespace-pre">
              {resultContent}
            </pre>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleDownloadData}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResultContent(null);
                }}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black font-display text-slate-800 dark:text-white">
          Document &amp; Text Tools
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Client-side parsing and conversion with real local rendering. No cloud uploads, no fake outputs.
        </p>
      </div>

      {/* Switch tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                mode === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main active tool body */}
      <div className="w-full">
        {renderToolBody()}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
        <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>All file parsing and rendering is executed directly in your browser without external servers.</span>
      </div>
    </div>
  );
}
