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
  ArrowRight
} from 'lucide-react';
import { createTar } from '../../utils/tar';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function ZipToTar() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    tarBlobUrl: string;
    tarSize: number;
    zipSize: number;
    entryCount: number;
    filename: string;
  } | null>(null);

  const activeConfig = getConverterConfig('zip-to-tar')!;

  const handleSelectFile = (selected: File | null) => {
    if (result?.tarBlobUrl) URL.revokeObjectURL(result.tarBlobUrl);
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const entries: { name: string; data: Uint8Array; mtime?: Date }[] = [];

      for (const [name, obj] of Object.entries(loadedZip.files)) {
        if (obj.dir) {
          entries.push({
            name: name.endsWith('/') ? name : `${name}/`,
            data: new Uint8Array(0),
            mtime: obj.date || new Date(),
          });
        } else {
          const uint8 = await obj.async('uint8array');
          entries.push({
            name,
            data: uint8,
            mtime: obj.date || new Date(),
          });
        }
      }

      if (entries.length === 0) {
        throw new Error('ZIP archive is empty.');
      }

      // Pack into a ustar TAR archive
      const tarBytes = await createTar(entries);
      const tarBlob = new Blob([tarBytes], { type: 'application/x-tar' });
      const url = URL.createObjectURL(tarBlob);
      const baseName = file.name.replace(/\.zip$/i, '') || 'archive';

      setResult({
        tarBlobUrl: url,
        tarSize: tarBlob.size,
        zipSize: file.size,
        entryCount: entries.length,
        filename: `${baseName}.tar`,
      });
    } catch (err: any) {
      setError('ZIP to TAR conversion failed: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.tarBlobUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (result?.tarBlobUrl) URL.revokeObjectURL(result.tarBlobUrl);
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={handleSelectFile}
          error={error}
          onError={setError}
          title="Select ZIP File (.zip)"
          subtitle="Choose a ZIP archive to convert to standard Unix TAR format."
        />

        {file && !isConverting && !result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-zinc-400">
                Input ZIP: <strong>{file.name}</strong> ({formatBytes(file.size)})
              </span>
              <span className="text-emerald-600 font-bold">Ready to Convert</span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleConvert}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px]"
              >
                <FileArchive className="w-4 h-4" />
                <span>Convert ZIP to TAR</span>
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
              Reading ZIP entries and writing POSIX TAR stream...
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>TAR stream generated successfully ({result.entryCount} entries packed).</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Input ZIP Size</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{formatBytes(result.zipSize)}</span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Output TAR Size</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{formatBytes(result.tarSize)}</span>
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
                Convert Another ZIP
              </button>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Conversion runs locally with JSZip and a built-in TAR writer — nothing is uploaded.</span>
        </div>
      </div>
    </div>
  );
}
