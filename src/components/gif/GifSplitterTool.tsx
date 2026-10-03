/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Layers,
  RefreshCw,
  Sparkles,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import { extractGifFrames } from '../../utils/gifHelper';
import FileUploadBox from '../FileUploadBox';

interface ExtractedFrameItem {
  index: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export default function GifSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [frames, setFrames] = useState<ExtractedFrameItem[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const activeConfig = getConverterConfig('gif-splitter')!;

  useEffect(() => {
    setFrames([]);
    setZipBlob(null);
    setError(null);
    setProgress(0);
  }, [file]);

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();

      const extracted = await extractGifFrames(buffer, {
        onProgress: (p) => setProgress(Math.round(p * 70)),
      });

      if (extracted.length === 0) {
        throw new Error('No frames could be extracted from this GIF file.');
      }

      // Build frame items
      const items: ExtractedFrameItem[] = extracted.map((frame, i) => {
        const url = URL.createObjectURL(frame.blob);
        return {
          index: i + 1,
          blob: frame.blob,
          url,
          width: frame.width,
          height: frame.height,
        };
      });

      // Package into ZIP
      const JSZipModule = await import('jszip');
      const JSZip = (JSZipModule as any).default || JSZipModule;
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const name = `frame_${String(item.index).padStart(4, '0')}.png`;
        zip.file(name, item.blob);
      }

      const zipFile = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta: any) => {
          setProgress(70 + Math.round(meta.percent * 0.3));
        }
      );

      setFrames(items);
      setZipBlob(zipFile);
      setProgress(100);
    } catch (err: any) {
      console.error('GIF split error:', err);
      setError(err?.message || 'Failed to split animated GIF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${baseName}_frames.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSingle = (item: ExtractedFrameItem) => {
    if (!file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `${baseName}_frame_${item.index}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={setFile}
          error={error}
          onError={setError}
          disabled={isProcessing}
          title="Select animated GIF to split"
          subtitle="Supports animated GIF files"
        />

        {file && !frames.length && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6 text-center">
            <button
              type="button"
              onClick={handleSplit}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg inline-flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Frames ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Deconstruct GIF into PNG Frames</span>
                </>
              )}
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">Decompressing Frames & Compressing ZIP</span>
              <span className="font-mono text-red-600 dark:text-red-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {frames.length > 0 && zipBlob && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Extracted {frames.length} PNG Frames
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      ZIP archive size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(zipBlob.size)}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All (ZIP)</span>
                </button>
              </div>
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
              Individual Frames ({frames.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800">
              {frames.map((item) => (
                <div key={item.index} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black aspect-square flex items-center justify-center p-1">
                  <img src={item.url} alt={`Frame ${item.index}`} className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-black/80 px-1 rounded self-start">
                      #{item.index}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="p-1.5 bg-red-600 hover:bg-red-500 rounded text-white text-[10px] flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
