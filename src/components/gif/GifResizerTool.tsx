/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import { resizeAnimatedGif } from '../../utils/gifHelper';
import FileUploadBox from '../FileUploadBox';

export default function GifResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('gif-resizer')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
    }
  }, [file]);

  const handleResize = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const scale = scalePercent / 100;

      const blob = await resizeAnimatedGif(buffer, {
        scale,
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (err: any) {
      console.error('GIF resize error:', err);
      setError(err?.message || 'Failed to resize animated GIF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${baseName}_${scalePercent}pct.gif`;
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
          title="Select animated GIF to resize"
          subtitle="Supports animated GIF files"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Input GIF
                </label>
                <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 flex items-center justify-center min-h-[160px] max-h-[260px]">
                  {inputUrl && (
                    <img src={inputUrl} alt="Original" className="max-h-[240px] rounded-lg object-contain" />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Scale Dimension: {scalePercent}%
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[25, 50, 75, 125].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScalePercent(s)}
                        disabled={isProcessing}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                          scalePercent === s
                            ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={scalePercent}
                    onChange={(e) => setScalePercent(Number(e.target.value))}
                    disabled={isProcessing}
                    className="w-full accent-red-500 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResize}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resizing Frames ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span>Resize GIF to {scalePercent}%</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Re-sampling & Quantizing Palette</span>
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

            {/* Result */}
            {resultBlob && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Resized Successfully</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 mt-1 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBytes(resultBlob.size)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Resized GIF</span>
                  </button>
                </div>

                {resultUrl && (
                  <div className="rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 max-w-sm mx-auto flex justify-center">
                    <img src={resultUrl} alt="Resized GIF" className="max-h-64 object-contain rounded-md" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
