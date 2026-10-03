/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  Sliders
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

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState<number>(10);
  const [widthPreset, setWidthPreset] = useState<number>(480);
  const [startTime, setStartTime] = useState<number>(0);
  const [gifDuration, setGifDuration] = useState<number>(5);
  const [totalVideoDuration, setTotalVideoDuration] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeConfig = getConverterConfig('video-to-gif')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setConversionProgress(0);
      setStartTime(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
      setTotalVideoDuration(0);
    }
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setTotalVideoDuration(dur);
      setGifDuration(Math.min(5, dur > 0 ? dur : 5));
    }
  };

  const handleGenerateGif = async () => {
    if (!file) return;

    setIsProcessing(true);
    setConversionProgress(0);
    setError(null);
    setRecentLog('Initializing GIF rendering engine...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `animated_${Date.now()}.gif`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Generating 2-pass high quality GIF palette...');

      // 2-pass palettegen filter produces crisp GIFs without color banding
      const scaleFilter = widthPreset > 0 ? `scale=${widthPreset}:-1:flags=lanczos` : 'scale=iw:-1';
      const vf = `fps=${fps},${scaleFilter},split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;

      const args = [
        '-ss', String(startTime),
        '-t', String(gifDuration),
        '-i', inputName,
        '-vf', vf,
        outputName
      ];

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => setConversionProgress(Math.round(prog * 100)),
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`GIF conversion failed with exit code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'image/gif' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setConversionProgress(100);
      setRecentLog('GIF generation complete.');
    } catch (err: any) {
      console.error('GIF generation error:', err);
      setError(err?.message || 'GIF conversion encountered an unexpected error');
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
    a.download = `${baseName}.gif`;
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
          title="Select video to convert to GIF"
          subtitle="Supports MP4, MOV, WEBM, AVI"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Input Video
                </label>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={inputUrl || ''}
                    onLoadedMetadata={handleLoadedMetadata}
                    controls
                    className="max-h-full max-w-full"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      Framerate (FPS): {fps}
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[5, 10, 15, 20].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFps(f)}
                          disabled={isProcessing}
                          className={`py-1.5 rounded-lg border text-xs font-semibold ${
                            fps === f
                              ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      Width: {widthPreset === 0 ? 'Original' : `${widthPreset}px`}
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[320, 480, 640].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWidthPreset(w)}
                          disabled={isProcessing}
                          className={`py-1.5 rounded-lg border text-xs font-semibold ${
                            widthPreset === w
                              ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {w}p
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Start Time (sec)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={totalVideoDuration > 0 ? totalVideoDuration : 600}
                      value={startTime}
                      onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                      disabled={isProcessing}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Duration (sec)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={gifDuration}
                      onChange={(e) => setGifDuration(Math.max(1, Math.min(30, Number(e.target.value))))}
                      disabled={isProcessing}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateGif}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating GIF ({conversionProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Animated GIF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Palette & Frame Rendering</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{conversionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${conversionProgress}%` }}
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
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">GIF Created</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(resultBlob.size)}</span> • Format: <span className="font-mono text-emerald-700 dark:text-emerald-400">image/gif</span>
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
                    <img src={resultUrl} alt="Generated GIF" className="max-h-64 rounded-md object-contain" />
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
