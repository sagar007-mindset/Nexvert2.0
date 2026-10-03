/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  FileArchive,
  Download,
  Trash2,
  Lock,
  FolderPlus,
  Folder,
  FileText,
  CheckCircle2,
  Sliders,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface BulkFileItem {
  id: string;
  file: File;
  path: string;
  category: 'Image' | 'Document' | 'Audio' | 'Video' | 'Code' | 'Archive' | 'Other';
}

function getFileCategory(name: string): BulkFileItem['category'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff'].includes(ext)) return 'Image';
  if (['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv', 'rtf'].includes(ext)) return 'Document';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'Audio';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'Video';
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'sh', 'sql', 'cpp', 'java'].includes(ext)) return 'Code';
  if (['zip', 'tar', 'gz', 'bz2'].includes(ext)) return 'Archive';
  return 'Other';
}

export default function BulkFileZipper() {
  const [files, setFiles] = useState<BulkFileItem[]>([]);
  const [zipName, setZipName] = useState<string>('bulk_archive');
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const activeConfig = getConverterConfig('bulk-file-zipper')!;

  const handleAddFiles = (newFiles: File[]) => {
    setError(null);
    setZipBlobUrl(null);
    setZipSize(null);

    const updated = [...files];
    for (const f of newFiles) {
      const relPath = (f as any).webkitRelativePath || f.name;
      if (!updated.some((item) => item.path === relPath && item.file.size === f.size)) {
        updated.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          path: relPath,
          category: getFileCategory(f.name),
        });
      }
    }
    setFiles(updated);
  };

  const handleFolderPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Drag and drop with directory traversal
  const handleDropDirectories = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const extracted: { file: File; path: string }[] = [];

    const traverse = async (entry: any, currentPath: string): Promise<void> => {
      if (!entry) return;
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          entry.file((file: File) => {
            const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
            extracted.push({ file, path: fullPath });
            resolve();
          }, () => resolve());
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readEntries = (): Promise<any[]> => {
          return new Promise((resolve) => {
            reader.readEntries((res: any[]) => resolve(res || []), () => resolve([]));
          });
        };
        let more = true;
        while (more) {
          const batch = await readEntries();
          if (batch.length === 0) more = false;
          else {
            const nextP = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            for (const c of batch) await traverse(c, nextP);
          }
        }
      }
    };

    try {
      const promises: Promise<void>[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (typeof it.webkitGetAsEntry === 'function') {
          const entry = it.webkitGetAsEntry();
          if (entry) promises.push(traverse(entry, ''));
        } else {
          const f = it.getAsFile();
          if (f) extracted.push({ file: f, path: f.name });
        }
      }

      await Promise.all(promises);

      if (extracted.length > 0) {
        const updated = [...files];
        for (const item of extracted) {
          if (!updated.some((ex) => ex.path === item.path && ex.file.size === item.file.size)) {
            updated.push({
              id: Math.random().toString(36).substring(2, 9),
              file: item.file,
              path: item.path,
              category: getFileCategory(item.file.name),
            });
          }
        }
        setFiles(updated);
      }
    } catch (err: any) {
      setError('Error reading dropped files: ' + err.message);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    setZipBlobUrl(null);
    setZipSize(null);
  };

  const handleBuildZip = async () => {
    if (files.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const zip = new JSZip();

      for (const item of files) {
        const arrayBuf = await item.file.arrayBuffer();
        zip.file(item.path, arrayBuf, {
          date: new Date(item.file.lastModified || Date.now())
        });
      }

      const compType = compressionLevel === 0 ? 'STORE' : 'DEFLATE';
      const compOptions = compressionLevel === 0 ? undefined : { level: compressionLevel };

      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: compType,
          compressionOptions: compOptions,
          mimeType: 'application/zip',
        },
        (metadata) => {
          setProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(blob);
      setZipBlobUrl(url);
      setZipSize(blob.size);
    } catch (err: any) {
      setError('Bulk zipping failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlobUrl) return;
    const clean = zipName.trim().replace(/\.zip$/i, '') || 'bulk_archive';
    const link = document.createElement('a');
    link.href = zipBlobUrl;
    link.download = `${clean}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);
    setFiles([]);
    setZipName('bulk_archive');
    setZipBlobUrl(null);
    setZipSize(null);
    setProgress(0);
    setError(null);
  };

  const totalRawBytes = files.reduce((sum, f) => sum + f.file.size, 0);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  files.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.path.toLowerCase().includes(searchFilter.toLowerCase().trim());
    const matchesCat = activeCategoryFilter === 'all' || f.category === activeCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const realRatio =
    zipSize !== null && totalRawBytes > 0
      ? Math.max(0, ((1 - zipSize / totalRawBytes) * 100)).toFixed(1)
      : '0.0';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-left">

      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDropDirectories}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6"
      >
        <FileUploadBox
          config={activeConfig}
          selectedFile={null}
          selectedFiles={files.map((f) => f.file)}
          onFileSelect={() => {}}
          onFilesSelect={handleAddFiles}
          error={error}
          onError={setError}
          multiple={true}
          title="Drop Many Files or Folders Here"
          subtitle="Select dozens or hundreds of files to package into a single ZIP."
        />

        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderPicked}
          {...({ webkitdirectory: '', directory: '' } as any)}
          multiple
          className="hidden"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-amber-500" />
            <span>Add Whole Directory...</span>
          </button>
        </div>

        {files.length > 0 && (
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
            {/* Category breakdown tags */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                All ({files.length})
              </button>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>

            {/* Config inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase">
                  Archive Filename
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={zipName}
                    onChange={(e) => setZipName(e.target.value)}
                    placeholder="bulk_archive"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-zinc-500">.zip</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase flex items-between justify-between">
                  <span>Compression Level</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {compressionLevel === 0 ? 'Store (Fastest)' : `Deflate ${compressionLevel}`}
                  </span>
                </label>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value={0}>0 - Store (Fastest, uncompressed)</option>
                  <option value={1}>1 - Fast Compression</option>
                  <option value={6}>6 - Balanced (Default)</option>
                  <option value={9}>9 - Maximum Compression</option>
                </select>
              </div>
            </div>

            {/* Search within batch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Batch Queue ({files.length} Files &bull; Total: {formatBytes(totalRawBytes)})
                </span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter queue..."
                  className="px-2 py-1 text-[11px] font-mono bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200 w-36 sm:w-48 focus:outline-none"
                />
              </div>

              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {filteredFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 dark:text-zinc-200 truncate">
                        {item.path}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {formatBytes(item.file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!zipBlobUrl && !isGenerating && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleBuildZip}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Zip {files.length} Files Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Generating ZIP archive ({progress}%)...
            </p>
            <div className="w-48 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {zipBlobUrl && !isGenerating && zipSize !== null && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bulk ZIP created successfully!</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 pl-6">
                Total Files: {files.length} &bull; Output Size: {formatBytes(zipSize)} ({realRatio}% compression ratio)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download {zipName.trim() || 'bulk_archive'}.zip</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Zip More Files
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Compression runs 100% locally in browser memory with zero network uploads.</span>
        </div>
      </div>
    </div>
  );
}
