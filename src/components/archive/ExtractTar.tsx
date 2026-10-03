/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Folder,
  FileText,
  Download,
  Eye,
  Lock,
  X,
  CheckSquare,
  Square,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { parseTar, TarEntry } from '../../utils/tar';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PreviewState {
  name: string;
  type: 'image' | 'text' | 'audio' | 'binary';
  url?: string;
  text?: string;
  size: number;
}

export default function ExtractTar() {
  const [tarFile, setTarFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<TarEntry[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<PreviewState | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isExtractingBatch, setIsExtractingBatch] = useState<boolean>(false);

  const activeConfig = getConverterConfig('extract-tar')!;

  const handleTarFile = async (file: File | null) => {
    if (!file) {
      setTarFile(null);
      setEntries([]);
      setSelectedPaths(new Set());
      return;
    }

    setTarFile(file);
    setIsLoading(true);
    setError(null);
    setEntries([]);
    setSelectedPaths(new Set());

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseTar(buffer);

      if (parsed.length === 0) {
        throw new Error('TAR archive is empty or invalid.');
      }

      setEntries(parsed);
      setSelectedPaths(new Set(parsed.filter((e) => e.type !== 'directory').map((e) => e.name)));
    } catch (err: any) {
      setError('Unable to parse TAR archive: ' + err.message);
      setTarFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fileEntries = entries.filter((e) => e.type !== 'directory');
  const folderEntries = entries.filter((e) => e.type === 'directory');
  const totalBytes = entries.reduce((sum, e) => sum + e.size, 0);

  const toggleSelectAll = () => {
    if (selectedPaths.size === fileEntries.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(fileEntries.map((e) => e.name)));
    }
  };

  const toggleSelectPath = (name: string) => {
    const updated = new Set(selectedPaths);
    if (updated.has(name)) {
      updated.delete(name);
    } else {
      updated.add(name);
    }
    setSelectedPaths(updated);
  };

  const handleExtractSingle = (entry: TarEntry) => {
    if (entry.type === 'directory') return;
    try {
      const blob = new Blob([entry.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = entry.name.split('/').pop() || entry.name;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err: any) {
      setError('Extraction error: ' + err.message);
    }
  };

  const handlePreviewFile = (entry: TarEntry) => {
    if (entry.type === 'directory') return;

    try {
      if (previewContent?.url) {
        URL.revokeObjectURL(previewContent.url);
      }

      const lower = entry.name.toLowerCase();

      // Image
      if (/\.(png|jpg|jpeg|webp|gif|svg|bmp|ico)$/i.test(lower)) {
        let mime = 'image/png';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mime = 'image/jpeg';
        else if (lower.endsWith('.webp')) mime = 'image/webp';
        else if (lower.endsWith('.svg')) mime = 'image/svg+xml';
        else if (lower.endsWith('.gif')) mime = 'image/gif';

        const blob = new Blob([entry.data], { type: mime });
        const url = URL.createObjectURL(blob);
        setPreviewContent({
          name: entry.name,
          type: 'image',
          url,
          size: entry.size,
        });
      }
      // Audio
      else if (/\.(mp3|wav|ogg)$/i.test(lower)) {
        const mime = lower.endsWith('.wav') ? 'audio/wav' : lower.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg';
        const blob = new Blob([entry.data], { type: mime });
        const url = URL.createObjectURL(blob);
        setPreviewContent({
          name: entry.name,
          type: 'audio',
          url,
          size: entry.size,
        });
      }
      // Text / Code
      else if (/\.(txt|json|csv|tsv|md|js|ts|jsx|tsx|css|html|xml|yaml|yml|py|sh|sql|ini|env|log)$/i.test(lower) || entry.size < 500000) {
        try {
          const text = new TextDecoder('utf-8').decode(entry.data);
          setPreviewContent({
            name: entry.name,
            type: 'text',
            text,
            size: entry.size,
          });
        } catch {
          setPreviewContent({
            name: entry.name,
            type: 'binary',
            size: entry.size,
          });
        }
      } else {
        setPreviewContent({
          name: entry.name,
          type: 'binary',
          size: entry.size,
        });
      }
    } catch (err: any) {
      setError('Preview error: ' + err.message);
    }
  };

  const handleExtractSelected = async () => {
    const toExtract = entries.filter((e) => e.type !== 'directory' && selectedPaths.has(e.name));
    if (toExtract.length === 0) return;

    if (toExtract.length === 1) {
      handleExtractSingle(toExtract[0]);
      return;
    }

    setIsExtractingBatch(true);
    setError(null);

    try {
      // Pack selected files into a zip package for batch download
      const zip = new JSZip();
      for (const item of toExtract) {
        zip.file(item.name, item.data, {
          date: item.mtime || new Date(),
        });
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = tarFile ? tarFile.name.replace(/\.tar$/i, '') : 'extracted';
      link.download = `${baseName}_selected_${toExtract.length}_files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err: any) {
      setError('Batch extraction failed: ' + err.message);
    } finally {
      setIsExtractingBatch(false);
    }
  };

  const handleExtractAll = () => {
    for (const item of fileEntries) {
      handleExtractSingle(item);
    }
  };

  const handleCopyPreviewText = () => {
    if (!previewContent?.text) return;
    navigator.clipboard.writeText(previewContent.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleReset = () => {
    if (previewContent?.url) URL.revokeObjectURL(previewContent.url);
    setTarFile(null);
    setEntries([]);
    setSelectedPaths(new Set());
    setError(null);
    setPreviewContent(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={tarFile}
          onFileSelect={handleTarFile}
          error={error}
          onError={setError}
          title="Select TAR File (.tar)"
          subtitle="Choose an uncompressed Unix TAR archive to inspect and unpack."
        />

        {isLoading && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Parsing TAR header blocks...
            </p>
          </div>
        )}

        {entries.length > 0 && !isLoading && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Header & Batch Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  title={selectedPaths.size === fileEntries.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedPaths.size === fileEntries.length ? (
                    <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono">
                  {fileEntries.length} Files {folderEntries.length > 0 && `& ${folderEntries.length} Folders`} ({formatBytes(totalBytes)})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExtractSelected}
                  disabled={selectedPaths.size === 0 || isExtractingBatch}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isExtractingBatch ? 'Extracting...' : `Extract Selected (${selectedPaths.size})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleExtractAll}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Download All
                </button>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {entries.map((item, idx) => {
                const isSelected = selectedPaths.has(item.name);
                const isDir = item.type === 'directory';

                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isDir
                        ? 'bg-slate-100/50 dark:bg-zinc-950/40 border-dashed border-slate-200 dark:border-zinc-800'
                        : isSelected
                        ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      {!isDir ? (
                        <button
                          type="button"
                          onClick={() => toggleSelectPath(item.name)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-4 shrink-0" />
                      )}

                      {isDir ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      )}

                      <span className="font-mono text-slate-700 dark:text-zinc-200 truncate">
                        {item.name}
                      </span>
                    </div>

                    {!isDir && (
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {formatBytes(item.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePreviewFile(item)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 cursor-pointer"
                          title="Preview File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExtractSingle(item)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Per-File Preview */}
            {previewContent && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-zinc-200 truncate max-w-sm">
                      Preview: {previewContent.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({formatBytes(previewContent.size)})
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {previewContent.type === 'text' && (
                      <button
                        type="button"
                        onClick={handleCopyPreviewText}
                        className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedText ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewContent(null)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {previewContent.type === 'image' && previewContent.url && (
                  <div className="text-center p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <img
                      src={previewContent.url}
                      alt={previewContent.name}
                      className="max-h-60 object-contain rounded mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {previewContent.type === 'audio' && previewContent.url && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 flex justify-center">
                    <audio controls src={previewContent.url} className="w-full max-w-md" />
                  </div>
                )}

                {previewContent.type === 'text' && (
                  <pre className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-h-60 overflow-auto font-mono text-[11px] text-slate-700 dark:text-zinc-300 whitespace-pre">
                    {previewContent.text}
                  </pre>
                )}

                {previewContent.type === 'binary' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Binary file. Click below to download directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const item = entries.find((e) => e.name === previewContent.name);
                        if (item) handleExtractSingle(item);
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {previewContent.name.split('/').pop()}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full h-11 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer min-h-[44px]"
              >
                Inspect Another TAR Archive
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Extraction runs 100% locally in browser memory without sending data to servers.</span>
        </div>
      </div>
    </div>
  );
}
