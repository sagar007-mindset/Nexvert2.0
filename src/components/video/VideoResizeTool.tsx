/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Maximize2,
  Video
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  getFFmpeg,
  execFFmpeg,
  safeUnlink,
  FFmpegLoadProgress
} from '../../utils/ffmpegHelper';
import FileUploadBox from '../FileUploadBox';
import VideoEngineNotice from './VideoEngineNotice';

const RESIZE_PRESETS = [
  { id: '1080p', label: '1080p Full HD', height: 1080, desc: '1920×1080 target' },
  { id: '720p', label: '720p HD', height: 720, desc: '1280×720 target' },
  { id: '480p', label: '480p SD', height: 480, desc: '854×480 target' },
  { id: '360p', label: '360p Mobile', height: 360, desc: '640×360 target' },
];

export default function VideoResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<'1080p' | '720p' | '480p' | '360p'>('720p');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [resizeProgress, setResizeProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('video-resize')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setResizeProgress(0);
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
    setResizeProgress(0);
    setError(null);
    setRecentLog('Initializing video scaler...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `resized_${Date.now()}.mp4`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      const targetHeight = RESIZE_PRESETS.find((p) => p.id === preset)?.height || 720;
      setRecentLog(`Rescaling video to ${preset} (${targetHeight}p)...`);

      // scale=-2:height preserves aspect ratio and guarantees even width for H.264
      const scaleFilter = `scale=-2:${targetHeight}`;

      const args = [
        '-i', inputName,
        '-vf', scaleFilter,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        outputName
      ];

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => setResizeProgress(Math.round(prog * 100)),
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`Video resize failed with exit code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'video/mp4' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setResizeProgress(100);
      setRecentLog('Video resized successfully.');
    } catch (err: any) {
      console.error('Resize video error:', err);
      setError(err?.message || 'Failed to resize video');
    } finally {
      setIsProcessing(false);
      if (ffmpegRef) {
        await safeUnlink(ffmpegRef, inputName);
        await safeUnlink(ffmpegRef, outputName);
      }
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${baseName}_${preset}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">

      <VideoEngineNotice
        isLoading={isProcessing && !!engineProgress && engineProgress.ratio < 1}
        progress={engineProgress}
        isReady={false}
        error={error}
      />

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={setFile}
          error={error}
          onError={setError}
          disabled={isProcessing}
          title="Select video to resize"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Input Video
                </label>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <video src={inputUrl || ''} controls className="max-h-full max-w-full" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Target Resolution Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESIZE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPreset(p.id as any)}
                        disabled={isProcessing}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preset === p.id
                            ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
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
                      <span>Resizing ({resizeProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span>Resize to {preset}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Rescaling Video Stream</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{resizeProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${resizeProgress}%` }}
                  />
                </div>
                {recentLog && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">{recentLog}</p>
                )}
              </div>
            )}

            {/* Result */}
            {resultBlob && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Resized to {preset}</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(resultBlob.size)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {preset} Video</span>
                  </button>
                </div>

                {resultUrl && (
                  <div className="rounded-lg overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 max-w-md mx-auto">
                    <video src={resultUrl} controls className="w-full h-full" />
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
