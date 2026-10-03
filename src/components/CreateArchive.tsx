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
  Sliders,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check,
  X,
  UploadCloud
} from 'lucide-react';
import { formatBytes } from '../utils/converter';
import { getConverterConfig } from '../config/converters.config';
import FileUploadBox from './FileUploadBox';

interface ArchiveFileEntry {
  id: string;
  file: File;
  path: string; // Relative path inside ZIP including folder (e.g. "docs/readme.txt")
}

export default function CreateArchive() {
  const [files, setFiles] = useState<ArchiveFileEntry[]>([]);
  const [zipName, setZipName] = useState<string>('archive');
  const [compressionLevel, setCompressionLevel] = useState<number>(6); // 0 = store, 1-9 = deflate
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState<number | null>(null);
  const [totalRawSize, setTotalRawSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Path editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string>('');

  // New folder creation state
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const activeConfig = getConverterConfig('create-zip') || getConverterConfig('create-archive')!;

  const handleFilesAdded = (newFiles: File[]) => {
    setError(null);
    setZipBlobUrl(null);
    setZipSize(null);

    const updated = [...files];
    for (const f of newFiles) {
      // Use webkitRelativePath if present, otherwise default to file.name
      const relativePath = (f as any).webkitRelativePath || f.name;
      if (!updated.some((item) => item.path === relativePath && item.file.size === f.size)) {
        updated.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          path: relativePath,
        });
      }
    }
    setFiles(updated);
    setTotalRawSize(updated.reduce((sum, item) => sum + item.file.size, 0));
  };

  // Handle native folder picker
  const handleFolderPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files) as File[];
      handleFilesAdded(fileList);
      e.target.value = '';
    }
  };

  // Drag and drop handler with directory traversal support
  const handleDropWithDirectories = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const extracted: { file: File; relativePath: string }[] = [];

    const traverseEntry = async (entry: any, currentPath: string): Promise<void> => {
      if (!entry) return;
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          entry.file((file: File) => {
            const relPath = currentPath ? `${currentPath}/${file.name}` : file.name;
            extracted.push({ file, relativePath: relPath });
            resolve();
          }, () => resolve());
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readEntries = (): Promise<any[]> => {
          return new Promise((resolve) => {
            dirReader.readEntries((entries: any[]) => {
              resolve(entries || []);
            }, () => resolve([]));
          });
        };

        let hasMore = true;
        while (hasMore) {
          const batch = await readEntries();
          if (batch.length === 0) {
            hasMore = false;
          } else {
            const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            for (const child of batch) {
              await traverseEntry(child, nextPath);
            }
          }
        }
      }
    };

    try {
      const promises: Promise<void>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item.webkitGetAsEntry === 'function') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(traverseEntry(entry, ''));
          }
        } else {
          const file = item.getAsFile();
          if (file) {
            extracted.push({ file, relativePath: file.name });
          }
        }
      }

      await Promise.all(promises);

      if (extracted.length > 0) {
        const updated = [...files];
        for (const item of extracted) {
          if (!updated.some((existing) => existing.path === item.relativePath && existing.file.size === item.file.size)) {
            updated.push({
              id: Math.random().toString(36).substring(2, 9),
              file: item.file,
              path: item.relativePath,
            });
          }
        }
        setFiles(updated);
        setTotalRawSize(updated.reduce((sum, f) => sum + f.file.size, 0));
      }
    } catch (err: any) {
      setError('Error parsing dropped folders: ' + err.message);
    }
  };

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    setTotalRawSize(updated.reduce((sum, f) => sum + f.file.size, 0));
    setZipBlobUrl(null);
    setZipSize(null);
  };

  const startEditPath = (item: ArchiveFileEntry) => {
    setEditingId(item.id);
    setEditingPath(item.path);
  };

  const saveEditPath = (id: string) => {
    let clean = editingPath.trim().replace(/^\/+/, '');
    if (!clean) {
      const found = files.find(f => f.id === id);
      clean = found ? found.file.name : 'file';
    }
    setFiles(files.map(f => f.id === id ? { ...f, path: clean } : f));
    setEditingId(null);
  };

  // Move files to folder prefix
  const handleAssignToFolder = () => {
    if (!newFolderName.trim()) return;
    const folderClean = newFolderName.trim().replace(/^\/+|\/+$/g, '') + '/';
    setFiles(files.map(f => {
      // If path doesn't already start with this folder
      if (!f.path.startsWith(folderClean)) {
        return { ...f, path: `${folderClean}${f.path}` };
      }
      return f;
    }));
    setShowFolderModal(false);
    setNewFolderName('');
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setCompressionProgress(0);

    try {
      const zip = new JSZip();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const cleanPath = item.path.trim().replace(/^\/+/, '') || item.file.name;
        zip.file(cleanPath, arrayBuffer, {
          date: new Date(item.file.lastModified || Date.now())
        });
      }

      const compressionType = compressionLevel === 0 ? 'STORE' : 'DEFLATE';
      const compressionOptions = compressionLevel === 0 ? undefined : { level: compressionLevel };

      const content = await zip.generateAsync(
        {
          type: 'blob',
          compression: compressionType,
          compressionOptions: compressionOptions,
          mimeType: 'application/zip'
        },
        (metadata) => {
          setCompressionProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(content);
      setZipBlobUrl(url);
      setZipSize(content.size);
      setIsGenerating(false);
    } catch (err: any) {
      setError('Failed to build ZIP archive: ' + err.message);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlobUrl) return;
    const cleanName = zipName.trim().replace(/\.zip$/i, '') || 'archive';
    const link = document.createElement('a');
    link.href = zipBlobUrl;
    link.download = `${cleanName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);
    setFiles([]);
    setZipName('archive');
    setZipBlobUrl(null);
    setZipSize(null);
    setTotalRawSize(0);
    setError(null);
    setCompressionProgress(0);
    setEditingId(null);
  };

  // Distinct folders present in archive paths
  const distinctFolders = Array.from(
    new Set(
      files
        .filter((f) => f.path.includes('/'))
        .map((f) => f.path.substring(0, f.path.lastIndexOf('/')))
    )
  );

  const realCompressionRatio =
    zipSize !== null && totalRawSize > 0
      ? Math.max(0, ((1 - zipSize / totalRawSize) * 100)).toFixed(1)
      : '0.0';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-left">

      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDropWithDirectories}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6"
      >
        <FileUploadBox
          config={activeConfig}
          selectedFile={null}
          selectedFiles={files.map((f) => f.file)}
          onFileSelect={() => {}}
          onFilesSelect={handleFilesAdded}
          error={error}
          onError={setError}
          multiple={true}
          title="Drag & Drop Files or Folders Here"
          subtitle="Select any files or drop whole directories with nested folder hierarchy preserved."
        />

        {/* Hidden folder input for directory picking */}
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderPicked}
          {...({ webkitdirectory: '', directory: '' } as any)}
          multiple
          className="hidden"
        />

        {/* Secondary Folder Picker Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-amber-500" />
            <span>Add Entire Folder...</span>
          </button>

          {files.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFolderModal(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Folder className="w-4 h-4 text-blue-500" />
              <span>Prefix with Folder</span>
            </button>
          )}
        </div>

        {/* Folder assignment modal */}
        {showFolderModal && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                Move all included files into a subfolder
              </span>
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. assets or backup_2026"
                className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAssignToFolder}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Apply Prefix
              </button>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            {/* Archive options */}
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
                    placeholder="archive"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-zinc-500">.zip</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase flex items-center justify-between">
                  <span>Compression Level</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {compressionLevel === 0 ? 'Stored (0%)' : `Deflate (Level ${compressionLevel})`}
                  </span>
                </label>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value={0}>0 - Store (Fastest, uncompressed)</option>
                  <option value={1}>1 - Fast Compression</option>
                  <option value={6}>6 - Normal / Balanced (Default)</option>
                  <option value={9}>9 - Maximum DEFLATE Compression</option>
                </select>
              </div>
            </div>

            {/* Folder Hierarchy Status */}
            {distinctFolders.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs">
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-600 dark:text-zinc-300">
                  Preserving <strong className="text-slate-800 dark:text-white">{distinctFolders.length}</strong> folder paths ({distinctFolders.slice(0, 3).join(', ')}{distinctFolders.length > 3 ? '...' : ''})
                </span>
              </div>
            )}

            {/* Included Files & Paths List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  Files in Archive ({files.length}) &bull; Total Raw Size: {formatBytes(totalRawSize)}
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {files.map((item) => {
                  const isEditing = editingId === item.id;
                  const hasFolder = item.path.includes('/');

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs gap-2"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {hasFolder ? (
                          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}

                        {isEditing ? (
                          <div className="flex items-center space-x-1 flex-1">
                            <input
                              type="text"
                              value={editingPath}
                              onChange={(e) => setEditingPath(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditPath(item.id)}
                              className="flex-1 px-2 py-0.5 bg-white dark:bg-zinc-900 border border-red-500 rounded text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveEditPath(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-200 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="font-mono text-slate-700 dark:text-zinc-200 truncate cursor-pointer hover:text-red-600 transition-colors"
                            onClick={() => startEditPath(item)}
                            title="Click to edit path inside archive"
                          >
                            {item.path}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {formatBytes(item.file.size)}
                        </span>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditPath(item)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer"
                            title="Edit file path"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!zipBlobUrl && !isGenerating && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateZip}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Build ZIP Archive ({files.length} Files)</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Packing ZIP stream ({compressionProgress}%)...
            </p>
            <div className="w-48 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-150"
                style={{ width: `${compressionProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {zipBlobUrl && !isGenerating && zipSize !== null && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ZIP archive compiled successfully!</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 pl-6">
                Original: {formatBytes(totalRawSize)} &rarr; Compressed ZIP: {formatBytes(zipSize)} ({realCompressionRatio}% savings)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download {zipName.trim() || 'archive'}.zip</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Create Another ZIP
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Folder packing &amp; compression run 100% locally in browser memory via JSZip.</span>
        </div>
      </div>
    </div>
  );
}
