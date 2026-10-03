/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileArchive,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Folder,
  FileText
} from 'lucide-react';
import { parseTar } from '../../utils/tar';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function TarToZip() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    zipBlobUrl: string;
    zipSize: number;
    tarSize: number;
    entryCount: number;
    filename: string;
  } | null>(null);

  const activeConfig = getConverterConfig('tar-to-zip')!;

  const handleSelectFile = (selected: File | null) => {
    if (result?.zipBlobUrl) URL.revokeObjectURL(result.zipBlobUrl);
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Parse tar entries (dependency-free reader, supports .tar.gz)
      const tarEntries = await parseTar(arrayBuffer);

      if (tarEntries.length === 0) {
        throw new Error('No entries or files found in TAR archive.');
      }

      // Pack into JSZip
      const zip = new JSZip();

      for (const entry of tarEntries) {
        if (entry.type === 'directory' || entry.name.endsWith('/')) {
          zip.folder(entry.name);
        } else {
          zip.file(entry.name, entry.data, {
            date: entry.mtime || new Date(),
          });
        }
      }

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
          mimeType: 'application/zip',
        },
        (metadata) => {
          setProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(zipBlob);
      const baseName = file.name.replace(/\.tar$/i, '') || 'converted';

      setResult({
        zipBlobUrl: url,
        zipSize: zipBlob.size,
        tarSize: file.size,
        entryCount: tarEntries.length,
        filename: `${baseName}.zip`,
      });
    } catch (err: any) {
      setError('TAR to ZIP conversion failed: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.zipBlobUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (result?.zipBlobUrl) URL.revokeObjectURL(result.zipBlobUrl);
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const savingsRatio =
    result && result.tarSize > 0
      ? Math.max(0, ((1 - result.zipSize / result.tarSize) * 100)).toFixed(1)
      : '0.0';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={handleSelectFile}
          error={error}
          onError={setError}
          title="Select TAR File (.tar)"
          subtitle="Choose an uncompressed Unix TAR archive to convert to ZIP format."
        />

        {file && !isConverting && !result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-zinc-400">
                Input TAR: <strong>{file.name}</strong> ({formatBytes(file.size)})
              </span>
              <span className="text-emerald-600 font-bold">Ready to Compress</span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleConvert}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
              >
                <FileArchive className="w-4 h-4" />
                <span>Convert TAR to ZIP</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isConverting && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Extracting TAR entries and compressing to ZIP ({progress}%)...
            </p>
            <div className="w-48 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Conversion Complete! {result.entryCount} entries compressed.</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Original TAR</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{formatBytes(result.tarSize)}</span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Compressed ZIP ({savingsRatio}% saved)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(result.zipSize)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download {result.filename}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Convert Another TAR
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Conversion runs locally with a built-in TAR reader and JSZip — nothing is uploaded.</span>
        </div>
      </div>
    </div>
  );
}
