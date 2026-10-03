/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Download, CheckCircle2, RefreshCw, Crop } from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import { getFFmpeg, execFFmpeg, safeUnlink, FFmpegLoadProgress } from '../../utils/ffmpegHelper';
import FileUploadBox from '../FileUploadBox';
import VideoEngineNotice from './VideoEngineNotice';

const ASPECTS = [
  { id: '1:1', label: 'Square 1:1', ratio: 1 },
  { id: '9:16', label: 'Vertical 9:16', ratio: 9 / 16 },
  { id: '16:9', label: 'Widescreen 16:9', ratio: 16 / 9 },
  { id: '4:5', label: 'Portrait 4:5', ratio: 4 / 5 },
  { id: '4:3', label: 'Classic 4:3', ratio: 4 / 3 },
  { id: 'custom', label: 'Custom (px)', ratio: 0 },
] as const;

type AspectId = (typeof ASPECTS)[number]['id'];

const even = (n: number) => Math.max(2, Math.floor(n / 2) * 2);

export default function VideoCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<{ w: number; h: number } | null>(null);
  const [aspect, setAspect] = useState<AspectId>('1:1');
  const [offsetX, setOffsetX] = useState(50); // % position of the crop box when it is narrower than the video
  const [offsetY, setOffsetY] = useState(50);
  const [custom, setCustom] = useState({ w: 0, h: 0, x: 0, y: 0 });

  const [isProcessing, setIsProcessing] = useState(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('crop-video')!;

  useEffect(() => {
    setResultBlob(null);
    setResultUrl(null);
    setVideoSize(null);
    setError(null);
    if (!file) {
      setInputUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setInputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const rect = useMemo(() => {
    if (!videoSize) return null;
    const { w: vw, h: vh } = videoSize;
    if (aspect === 'custom') {
      const w = even(Math.min(custom.w || vw, vw));
      const h = even(Math.min(custom.h || vh, vh));
      const x = even(Math.min(Math.max(0, custom.x), vw - w));
      const y = even(Math.min(Math.max(0, custom.y), vh - h));
      return { w, h, x, y };
    }
    const ratio = ASPECTS.find((a) => a.id === aspect)!.ratio;
    let w = vw;
    let h = vw / ratio;
    if (h > vh) {
      h = vh;
      w = vh * ratio;
    }
    w = even(w);
    h = even(h);
    const x = even(((vw - w) * offsetX) / 100);
    const y = even(((vh - h) * offsetY) / 100);
    return { w, h, x, y };
  }, [videoSize, aspect, offsetX, offsetY, custom]);

  const handleCrop = async () => {
    if (!file || !rect) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `crop_in_${Date.now()}.${inExt}`;
    const outputName = `crop_out_${Date.now()}.mp4`;
    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((p) => setEngineProgress(p));
      ffmpegRef = ffmpeg;
      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const exitCode = await execFFmpeg(
        ffmpeg,
        [
          '-i', inputName,
          '-vf', `crop=${rect.w}:${rect.h}:${rect.x}:${rect.y}`,
          '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-movflags', '+faststart',
          outputName,
        ],
        { onProgress: (p) => setProgress(Math.round(p * 100)) }
      );
      if (exitCode !== 0) throw new Error(`Video crop failed (ffmpeg exit code ${exitCode}).`);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'video/mp4' });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (err: any) {
      setError(err?.message || 'Failed to crop video.');
    } finally {
      setIsProcessing(false);
      if (ffmpegRef) {
        await safeUnlink(ffmpegRef, inputName);
        await safeUnlink(ffmpegRef, outputName);
      }
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file || !rect) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = resultUrl!;
    a.download = `${base}_cropped_${rect.w}x${rect.h}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const numberInput = (key: 'w' | 'h' | 'x' | 'y', label: string) => (
    <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
      {label}
      <input
        type="number"
        min={0}
        value={custom[key]}
        onChange={(e) => setCustom((c) => ({ ...c, [key]: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
        className="mt-1 w-full rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 text-sm text-slate-900 dark:text-white"
      />
    </label>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">

      <VideoEngineNotice isLoading={isProcessing && !!engineProgress && engineProgress.ratio < 1} progress={engineProgress} isReady={false} error={error} />

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={setFile}
          error={error}
          onError={setError}
          disabled={isProcessing}
          title="Select a video to crop"
          subtitle="Supports MP4, MOV, WEBM"
        />

        {file && inputUrl && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-800">
                <video
                  src={inputUrl}
                  controls
                  className="w-full block"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    setVideoSize({ w: v.videoWidth, h: v.videoHeight });
                    setCustom({ w: v.videoWidth, h: v.videoHeight, x: 0, y: 0 });
                  }}
                />
                {rect && videoSize && (
                  <div
                    className="absolute border-2 border-red-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none"
                    style={{
                      left: `${(rect.x / videoSize.w) * 100}%`,
                      top: `${(rect.y / videoSize.h) * 100}%`,
                      width: `${(rect.w / videoSize.w) * 100}%`,
                      height: `${(rect.h / videoSize.h) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="font-mono">
                  {videoSize ? `${videoSize.w}×${videoSize.h}` : '…'} · {formatBytes(file.size)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAspect(a.id)}
                    disabled={isProcessing}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      aspect === a.id ? 'bg-red-600/20 border-red-500 text-red-200' : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {aspect === 'custom' ? (
                <div className="grid grid-cols-2 gap-3">
                  {numberInput('w', 'Width (px)')}
                  {numberInput('h', 'Height (px)')}
                  {numberInput('x', 'Left offset (px)')}
                  {numberInput('y', 'Top offset (px)')}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Horizontal position
                    <input type="range" min={0} max={100} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="w-full accent-red-600" />
                  </label>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Vertical position
                    <input type="range" min={0} max={100} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full accent-red-600" />
                  </label>
                </div>
              )}

              {rect && <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">Output: {rect.w}×{rect.h} px</p>}

              <button
                type="button"
                onClick={handleCrop}
                disabled={isProcessing || !rect}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cropping ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-4 h-4" />
                    <span>Crop Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {resultBlob && resultUrl && (
          <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h2 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Video cropped</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Size: <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatBytes(resultBlob.size)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download MP4</span>
              </button>
            </div>
            <video src={resultUrl} controls className="w-full max-w-md mx-auto rounded-lg bg-black" />
          </div>
        )}
      </div>
    </div>
  );
}
