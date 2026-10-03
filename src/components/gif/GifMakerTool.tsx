/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  RefreshCw,
  Plus,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import { createGifFromImages } from '../../utils/gifHelper';

interface UploadedFrame {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export default function GifMakerTool() {
  const [frames, setFrames] = useState<UploadedFrame[]>([]);
  const [delayMs, setDelayMs] = useState<number>(200); // 200ms = 5fps
  const [maxWidth, setMaxWidth] = useState<number>(480);
  const [loop, setLoop] = useState<number>(0); // 0 = infinite

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setResultBlob(null);
    setResultUrl(null);

    const newFrames: UploadedFrame[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;

      const url = URL.createObjectURL(f);
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });

      newFrames.push({
        id: `${f.name}_${Date.now()}_${i}`,
        file: f,
        previewUrl: url,
        width: img.naturalWidth || 480,
        height: img.naturalHeight || 480,
      });
    }

    setFrames((prev) => [...prev, ...newFrames]);
  };

  const handleRemoveFrame = (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
    setResultBlob(null);
    setResultUrl(null);
  };

  const handleMoveFrame = (idx: number, direction: 'up' | 'down') => {
    setFrames((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleBuildGif = async () => {
    if (frames.length === 0) {
      setError('Please add at least one image to create an animated GIF.');
      return;
    }

    setIsProcessing(true);
    setRenderProgress(0);
    setError(null);

    try {
      // Determine canvas dimensions
      const targetW = maxWidth;
      // Use aspect ratio of first frame
      const firstF = frames[0];
      const aspect = firstF.height / firstF.width;
      const targetH = Math.round(targetW * aspect);

      const canvasList: { canvas: HTMLCanvasElement; delayMs: number }[] = [];

      for (let i = 0; i < frames.length; i++) {
        const item = frames[i];
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load frame ${item.file.name}`));
          img.src = item.previewUrl;
        });

        const fCanvas = document.createElement('canvas');
        fCanvas.width = targetW;
        fCanvas.height = targetH;
        const fCtx = fCanvas.getContext('2d')!;
        fCtx.drawImage(img, 0, 0, targetW, targetH);

        canvasList.push({
          canvas: fCanvas,
          delayMs,
        });

        setRenderProgress(Math.round(((i + 1) / frames.length) * 50));
      }

      const gifBlob = await createGifFromImages(canvasList, targetW, targetH, {
        repeat: loop,
        onProgress: (curr, total) => setRenderProgress(50 + Math.round((curr / total) * 50)),
      });

      setResultBlob(gifBlob);
      setResultUrl(URL.createObjectURL(gifBlob));
      setRenderProgress(100);
    } catch (err: any) {
      console.error('GIF generation error:', err);
      setError(err?.message || 'Failed to generate animated GIF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = `animated_${Date.now()}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        {/* File Add Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-red-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-zinc-950/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFilesAdded(e.target.files)}
          />
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Click to add image frames</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">PNG, JPG, WEBP, or GIF (select multiple files)</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Frames List */}
        {frames.length > 0 && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Frames ({frames.length} images)
              </h4>
              <button
                type="button"
                onClick={() => setFrames([])}
                className="text-xs text-red-700 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
              {frames.map((frame, idx) => (
                <div key={frame.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black aspect-square">
                  <img src={frame.previewUrl} alt="Frame" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-black/80 px-1 rounded">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFrame(frame.id)}
                        className="text-red-700 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveFrame(idx, 'up')}
                          className="p-1 bg-slate-100 dark:bg-zinc-800 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < frames.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveFrame(idx, 'down')}
                          className="p-1 bg-slate-100 dark:bg-zinc-800 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Animation Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Frame Speed: {delayMs}ms ({Math.round(1000 / delayMs)} fps)
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  disabled={isProcessing}
                  className="w-full accent-red-500 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Max Width: {maxWidth}px
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[320, 480, 640].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setMaxWidth(w)}
                      disabled={isProcessing}
                      className={`py-1 rounded-lg border text-xs font-semibold ${
                        maxWidth === w
                          ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Loop Count
                </label>
                <select
                  value={loop}
                  onChange={(e) => setLoop(Number(e.target.value))}
                  disabled={isProcessing}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value={0}>Infinite Loop (Standard)</option>
                  <option value={1}>Play Once (1x)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuildGif}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Encoding GIF ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Animated GIF</span>
                </>
              )}
            </button>

            {/* Result */}
            {resultBlob && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">GIF Created Successfully</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        File Size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(resultBlob.size)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .gif</span>
                  </button>
                </div>

                {resultUrl && (
                  <div className="rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 max-w-sm mx-auto flex justify-center">
                    <img src={resultUrl} alt="Result GIF" className="max-h-64 object-contain rounded-md" />
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
