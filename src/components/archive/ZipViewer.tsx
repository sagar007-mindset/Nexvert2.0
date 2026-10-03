/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileArchive,
  Search,
  ArrowUpDown,
  Folder,
  FileText,
  Lock,
  Download,
  Info,
  Calendar,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface CentralDirectoryEntry {
  name: string;
  isDir: boolean;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage
  crc32: number | null;
  compressionMethod: string;
  date: Date;
  comment?: string;
  zipObject: JSZip.JSZipObject;
}

type SortField = 'name' | 'uncompressed' | 'compressed' | 'ratio' | 'date';
type SortOrder = 'asc' | 'desc';

export default function ZipViewer() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<CentralDirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedEntry, setSelectedEntry] = useState<CentralDirectoryEntry | null>(null);
  const [archiveComment, setArchiveComment] = useState<string | null>(null);

  const activeConfig = getConverterConfig('zip-viewer')!;

  const handleZipFile = async (file: File | null) => {
    if (!file) {
      setZipFile(null);
      setEntries([]);
      setSelectedEntry(null);
      return;
    }

    setZipFile(file);
    setIsLoading(true);
    setError(null);
    setEntries([]);
    setSelectedEntry(null);

    try {
      const zip = new JSZip();
      // loadAsync parses Central Directory records without decompressing file contents
      const loadedZip = await zip.loadAsync(file);
      const parsed: CentralDirectoryEntry[] = [];

      setArchiveComment((loadedZip as any).comment || null);

      for (const [name, obj] of Object.entries(loadedZip.files)) {
        const metadata = (obj as any)._data;
        const uncompressedSize = metadata ? (metadata.uncompressedSize || 0) : 0;
        const compressedSize = metadata ? (metadata.compressedSize || 0) : 0;
        const crc32 = metadata ? metadata.crc32 : null;
        const compressionMethod = (obj as any).options?.compression || (compressedSize < uncompressedSize ? 'DEFLATE' : 'STORE');

        const ratio =
          uncompressedSize > 0 && compressedSize > 0
            ? Math.max(0, ((1 - compressedSize / uncompressedSize) * 100))
            : 0;

        parsed.push({
          name,
          isDir: obj.dir,
          uncompressedSize,
          compressedSize,
          compressionRatio: ratio,
          crc32,
          compressionMethod,
          date: obj.date || new Date(),
          comment: (obj as any).comment || undefined,
          zipObject: obj,
        });
      }

      setEntries(parsed);
    } catch (err: any) {
      setError('Unable to parse ZIP Central Directory: ' + err.message);
      setZipFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExtractSingle = async (entry: CentralDirectoryEntry) => {
    if (entry.isDir) return;
    try {
      const blob = await entry.zipObject.async('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = entry.name.split('/').pop() || entry.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err: any) {
      setError('Extraction error: ' + err.message);
    }
  };

  // Filtered and sorted entries
  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'uncompressed') cmp = a.uncompressedSize - b.uncompressedSize;
    else if (sortField === 'compressed') cmp = a.compressedSize - b.compressedSize;
    else if (sortField === 'ratio') cmp = a.compressionRatio - b.compressionRatio;
    else if (sortField === 'date') cmp = a.date.getTime() - b.date.getTime();
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  // Real aggregate metrics
  const fileCount = entries.filter((e) => !e.isDir).length;
  const dirCount = entries.filter((e) => e.isDir).length;
  const totalUncompressed = entries.reduce((sum, e) => sum + e.uncompressedSize, 0);
  const totalCompressed = entries.reduce((sum, e) => sum + e.compressedSize, 0);
  const overallRatio =
    totalUncompressed > 0 && totalCompressed > 0
      ? Math.max(0, ((1 - totalCompressed / totalUncompressed) * 100)).toFixed(1)
      : '0.0';

  const largestFile = entries
    .filter((e) => !e.isDir)
    .sort((a, b) => b.uncompressedSize - a.uncompressedSize)[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">

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
              Reading Central Directory headers...
            </p>
          </div>
        )}

        {entries.length > 0 && !isLoading && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Aggregate Real Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Total Content
                </span>
                <p className="text-sm font-black font-display text-slate-800 dark:text-white">
                  {fileCount} Files {dirCount > 0 && `+ ${dirCount} Folders`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Uncompressed Size
                </span>
                <p className="text-sm font-black font-display text-slate-800 dark:text-white">
                  {formatBytes(totalUncompressed)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Compressed Size
                </span>
                <p className="text-sm font-black font-display text-slate-800 dark:text-white">
                  {formatBytes(totalCompressed || zipFile?.size || 0)}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                  Space Saved
                </span>
                <p className="text-sm font-black font-display text-emerald-700 dark:text-emerald-300">
                  {overallRatio}%
                </p>
              </div>
            </div>

            {/* Largest File Highlight */}
            {largestFile && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">
                  Largest File: <strong className="text-slate-800 dark:text-white font-mono">{largestFile.name}</strong>
                </span>
                <span className="font-mono text-slate-700 dark:text-zinc-300 font-bold">
                  {formatBytes(largestFile.uncompressedSize)}
                </span>
              </div>
            )}

            {archiveComment && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 font-mono">Archive Comment:</span>
                <p className="text-amber-900 dark:text-amber-200 font-mono text-[11px] whitespace-pre-wrap">{archiveComment}</p>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by file path or extension (e.g. .png, src/, data.json)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Central Directory Table */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 sticky top-0 border-b border-slate-200 dark:border-zinc-700">
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        className="py-2.5 px-3 font-bold cursor-pointer hover:text-red-500 transition-colors"
                      >
                        <div className="flex items-center space-x-1">
                          <span>File Path</span>
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('uncompressed')}
                        className="py-2.5 px-3 font-bold text-right cursor-pointer hover:text-red-500 transition-colors"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Uncompressed</span>
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('compressed')}
                        className="py-2.5 px-3 font-bold text-right cursor-pointer hover:text-red-500 transition-colors hidden sm:table-cell"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Compressed</span>
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('ratio')}
                        className="py-2.5 px-3 font-bold text-right cursor-pointer hover:text-red-500 transition-colors"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Ratio</span>
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 font-bold text-center hidden md:table-cell">
                        CRC32
                      </th>
                      <th className="py-2.5 px-3 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {sortedEntries.map((item, idx) => {
                      const crcHex = item.crc32 !== null ? `0x${(item.crc32 >>> 0).toString(16).toUpperCase().padStart(8, '0')}` : '-';

                      return (
                        <tr
                          key={`${item.name}-${idx}`}
                          onClick={() => setSelectedEntry(item)}
                          className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2 truncate max-w-xs sm:max-w-md">
                              {item.isDir ? (
                                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate text-slate-800 dark:text-zinc-200">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                            {item.isDir ? '-' : formatBytes(item.uncompressedSize)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500 dark:text-zinc-500 hidden sm:table-cell">
                            {item.isDir ? '-' : formatBytes(item.compressedSize)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {item.isDir ? (
                              '-'
                            ) : (
                              <span className={`font-bold ${item.compressionRatio > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {item.compressionRatio.toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center text-slate-400 hidden md:table-cell text-[11px]">
                            {crcHex}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {!item.isDir && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExtractSingle(item);
                                }}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded cursor-pointer"
                                title="Extract this single file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item Details Drawer/Modal */}
            {selectedEntry && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-zinc-200">
                    Central Directory Record: {selectedEntry.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">Uncompressed Bytes</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedEntry.uncompressedSize.toLocaleString()} B</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">Compressed Bytes</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedEntry.compressedSize.toLocaleString()} B</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">CRC-32 Hash</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {selectedEntry.crc32 !== null ? `0x${(selectedEntry.crc32 >>> 0).toString(16).toUpperCase().padStart(8, '0')}` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">Compression Algorithm</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedEntry.compressionMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    Timestamp: {selectedEntry.date.toLocaleString()}
                  </span>
                  {!selectedEntry.isDir && (
                    <button
                      type="button"
                      onClick={() => handleExtractSingle(selectedEntry)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-mono inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Extract This File</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setZipFile(null);
                  setEntries([]);
                  setSelectedEntry(null);
                }}
                className="w-full h-11 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer min-h-[44px]"
              >
                Inspect Another ZIP Archive
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Central directory inspection runs 100% locally in browser memory without decompressing files.</span>
        </div>
      </div>
    </div>
  );
}
