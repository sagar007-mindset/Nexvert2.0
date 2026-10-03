/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  Folder,
  Eye,
  Lock,
  X,
  CheckSquare,
  Square,
  FileText,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { formatBytes } from '../utils/converter';
import { getConverterConfig } from '../config/converters.config';
import FileUploadBox from './FileUploadBox';

interface ZipFileItem {
  name: string;
  size: number; // uncompressed size
  compressedSize: number;
  crc32: number | null;
  date: Date;
  isFolder: boolean;
  zipObject: JSZip.JSZipObject;
}

interface PreviewState {
  name: string;
  type: 'image' | 'text' | 'audio' | 'binary';
  url?: string;
  text?: string;
  size: number;
  crc32?: string;
}

export default function ExtractArchive() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<ZipFileItem[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<PreviewState | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isExtractingBatch, setIsExtractingBatch] = useState<boolean>(false);

  const activeConfig = getConverterConfig('extract-zip') || getConverterConfig('extract-archive')!;

  const handleZipFile = async (file: File | null) => {
    if (!file) {
      setZipFile(null);
      setFileList([]);
      setSelectedPaths(new Set());
      return;
    }

    setZipFile(file);
    setIsLoading(true);
    setError(null);
    setFileList([]);
    setSelectedPaths(new Set());

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const items: ZipFileItem[] = [];
      const newSelected = new Set<string>();

      for (const [name, obj] of Object.entries(loadedZip.files)) {
        const metadata = (obj as any)._data;
        const uncompressedSize = metadata ? (metadata.uncompressedSize || 0) : 0;
        const compressedSize = metadata ? (metadata.compressedSize || 0) : 0;
        const crc32 = metadata ? metadata.crc32 : null;

        const item: ZipFileItem = {
          name,
          size: uncompressedSize,
          compressedSize,
          crc32,
          date: obj.date || new Date(),
          isFolder: obj.dir,
          zipObject: obj,
        };

        items.push(item);
        if (!obj.dir) {
          newSelected.add(name);
        }
      }

      setFileList(items);
      setSelectedPaths(newSelected);
    } catch (err: any) {
      setError('Failed to inspect or unpack ZIP archive: ' + err.message);
      setZipFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const fileItems = fileList.filter((f) => !f.isFolder);
    if (selectedPaths.size === fileItems.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(fileItems.map((f) => f.name)));
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

  const handleExtractSingle = async (item: ZipFileItem) => {
    if (item.isFolder) return;
    try {
      const blob = await item.zipObject.async('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = item.name.substring(item.name.lastIndexOf('/') + 1) || item.name;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err: any) {
      setError('Error extracting file: ' + err.message);
    }
  };

  const handlePreviewFile = async (item: ZipFileItem) => {
    if (item.isFolder) return;

    try {
      if (previewContent?.url) {
        URL.revokeObjectURL(previewContent.url);
      }

      const lower = item.name.toLowerCase();
      const crcFormatted = item.crc32 !== null ? `0x${(item.crc32 >>> 0).toString(16).toUpperCase().padStart(8, '0')}` : undefined;

      // Image preview
      if (/\.(png|jpg|jpeg|webp|gif|svg|bmp|ico)$/i.test(lower)) {
        const blob = await item.zipObject.async('blob');
        const url = URL.createObjectURL(blob);
        setPreviewContent({
          name: item.name,
          type: 'image',
          url,
          size: item.size,
          crc32: crcFormatted
        });
      }
      // Audio preview
      else if (/\.(mp3|wav|ogg|m4a|aac)$/i.test(lower)) {
        const blob = await item.zipObject.async('blob');
        const url = URL.createObjectURL(blob);
        setPreviewContent({
          name: item.name,
          type: 'audio',
          url,
          size: item.size,
          crc32: crcFormatted
        });
      }
      // Text / Code preview
      else if (/\.(txt|json|csv|tsv|md|js|ts|jsx|tsx|css|html|xml|yaml|yml|py|sh|sql|ini|env|log)$/i.test(lower) || item.size < 500000) {
        try {
          const text = await item.zipObject.async('string');
          setPreviewContent({
            name: item.name,
            type: 'text',
            text,
            size: item.size,
            crc32: crcFormatted
          });
        } catch {
          // Fallback to binary info if text decode fails
          setPreviewContent({
            name: item.name,
            type: 'binary',
            size: item.size,
            crc32: crcFormatted
          });
        }
      } else {
        setPreviewContent({
          name: item.name,
          type: 'binary',
          size: item.size,
          crc32: crcFormatted
        });
      }
    } catch (err: any) {
      setError('Preview generation error: ' + err.message);
    }
  };

  // Extract selected files
  const handleExtractSelected = async () => {
    const toExtract = fileList.filter((item) => !item.isFolder && selectedPaths.has(item.name));
    if (toExtract.length === 0) return;

    if (toExtract.length === 1) {
      await handleExtractSingle(toExtract[0]);
      return;
    }

    setIsExtractingBatch(true);
    setError(null);

    try {
      // Pack selected subset into a clean zip or download one by one
      const subZip = new JSZip();
      for (const item of toExtract) {
        const arrayBuf = await item.zipObject.async('arraybuffer');
        subZip.file(item.name, arrayBuf);
      }

      const blob = await subZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = zipFile ? zipFile.name.replace(/\.zip$/i, '') : 'extracted';
      link.download = `${baseName}_selected_${toExtract.length}_files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err: any) {
      setError('Selective extraction failed: ' + err.message);
    } finally {
      setIsExtractingBatch(false);
    }
  };

  const handleExtractAll = async () => {
    const nonFolders = fileList.filter((f) => !f.isFolder);
    setSelectedPaths(new Set(nonFolders.map((f) => f.name)));
    for (const item of nonFolders) {
      await handleExtractSingle(item);
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
    setZipFile(null);
    setFileList([]);
    setSelectedPaths(new Set());
    setError(null);
    setPreviewContent(null);
  };

  const totalFiles = fileList.filter((f) => !f.isFolder).length;
  const totalFolders = fileList.filter((f) => f.isFolder).length;
  const totalUncompressed = fileList.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={zipFile}
          onFileSelect={handleZipFile}
          error={error}
          onError={setError}
        />

        {isLoading && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Reading central directory records...
            </p>
          </div>
        )}

        {fileList.length > 0 && !isLoading && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Header & Batch Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  title={selectedPaths.size === totalFiles ? 'Deselect All' : 'Select All'}
                >
                  {selectedPaths.size === totalFiles ? (
                    <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono">
                  {totalFiles} Files {totalFolders > 0 && `& ${totalFolders} Folders`} ({formatBytes(totalUncompressed)})
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

            {/* File List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {fileList.map((item, idx) => {
                const isSelected = selectedPaths.has(item.name);
                const ratio =
                  item.size > 0 && item.compressedSize > 0
                    ? Math.max(0, ((1 - item.compressedSize / item.size) * 100)).toFixed(0)
                    : null;

                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      item.isFolder
                        ? 'bg-slate-100/50 dark:bg-zinc-950/40 border-dashed border-slate-200 dark:border-zinc-800'
                        : isSelected
                        ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      {!item.isFolder ? (
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

                      {item.isFolder ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      )}

                      <span className="font-mono text-slate-700 dark:text-zinc-200 truncate">
                        {item.name}
                      </span>
                    </div>

                    {!item.isFolder && (
                      <div className="flex items-center space-x-3 shrink-0">
                        {ratio !== null && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline">
                            -{ratio}%
                          </span>
                        )}
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

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full h-11 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer min-h-[44px]"
              >
                Inspect Another Archive
              </button>
            </div>
          </div>
        )}

        {/* Per-File Preview Modal / Drawer */}
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
                {previewContent.crc32 && (
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    CRC: {previewContent.crc32}
                  </span>
                )}
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
                  Binary format file. Click below to download directly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const item = fileList.find(f => f.name === previewContent.name);
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

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Extraction &amp; file preview run 100% locally in browser memory.</span>
        </div>
      </div>
    </div>
  );
}
