/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  Scissors,
  RefreshCw,
  Clock,
  RotateCcw
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

export default function VideoTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [trimProgress, setTrimProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeConfig = getConverterConfig('video-trimmer')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setTrimProgress(0);
      setStartTime(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
      setDuration(0);
    }
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSetStartToCurrent = () => {
    if (currentTime < endTime) {
      setStartTime(Number(currentTime.toFixed(2)));
    }
  };

  const handleSetEndToCurrent = () => {
    if (currentTime > startTime) {
      setEndTime(Number(currentTime.toFixed(2)));
    }
  };

  const handleTrim = async () => {
    if (!file) return;
    if (startTime >= endTime) {
      setError('Start time must be strictly before end time.');
      return;
    }

    setIsProcessing(true);
    setTrimProgress(0);
    setError(null);
    setRecentLog('Initializing trimmer engine...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `trimmed_${Date.now()}.mp4`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Cutting video stream...');

      // First attempt: Stream copy without re-encoding (extremely fast and lossless)
      let exitCode = await execFFmpeg(ffmpeg, [
        '-ss', String(startTime),
        '-to', String(endTime),
        '-i', inputName,
        '-c', 'copy',
        '-avoid_negative_ts', '1',
        outputName
      ], {
        onProgress: (prog) => setTrimProgress(Math.round(prog * 100)),
        onLog: (msg) => setRecentLog(msg.slice(0, 80))
      });

      // If stream copy failed (e.g. incompatible stream headers across cuts), fallback to fast transcode
      if (exitCode !== 0) {
        setRecentLog('Stream copy unavailable, transcoding cut region...');
        exitCode = await execFFmpeg(ffmpeg, [
          '-ss', String(startTime),
          '-to', String(endTime),
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-movflags', '+faststart',
          outputName
        ], {
          onProgress: (prog) => setTrimProgress(Math.round(prog * 100)),
          onLog: (msg) => setRecentLog(msg.slice(0, 80))
        });
      }

      if (exitCode !== 0) {
        throw new Error(`Trim failed with exit code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'video/mp4' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setTrimProgress(100);
      setRecentLog('Trim complete.');
    } catch (err: any) {
      console.error('Trim error:', err);
      setError(err?.message || 'Video trimming encountered an unexpected error');
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
    a.download = `${baseName}_cut_${startTime.toFixed(1)}s-${endTime.toFixed(1)}s.mp4`;
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
          title="Select video to trim"
          subtitle="Supports MP4, MOV, WEBM, MKV, AVI"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Video Player */}
              <div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={inputUrl || ''}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    className="max-h-full max-w-full"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                    <span>Current: <span className="font-mono text-slate-900 dark:text-white font-medium">{currentTime.toFixed(2)}s</span></span>
                  </div>
                  <span>Total Duration: <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium">{duration.toFixed(2)}s</span></span>
                </div>
              </div>

              {/* Trim Controls */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Trim Boundaries</span>
                    <span className="text-red-600 dark:text-red-400 font-mono">
                      Clip: {Math.max(0, endTime - startTime).toFixed(2)}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Start Time (sec)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={endTime}
                          value={startTime}
                          onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                          disabled={isProcessing}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleSetStartToCurrent}
                          title="Set start to current playback position"
                          className="px-2 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-[10px] font-medium"
                        >
                          Mark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">End Time (sec)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min={startTime}
                          max={duration}
                          value={endTime}
                          onChange={(e) => setEndTime(Math.min(duration, Number(e.target.value)))}
                          disabled={isProcessing}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleSetEndToCurrent}
                          title="Set end to current playback position"
                          className="px-2 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-[10px] font-medium"
                        >
                          Mark
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Uses fast stream copying without quality degradation whenever keyframe boundaries allow.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTrim}
                  disabled={isProcessing || startTime >= endTime}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Cutting ({trimProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Cut & Export Clip</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Processing */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Extracting Video Clip</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{trimProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${trimProgress}%` }}
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
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Clip Cut Successfully</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Duration: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{(endTime - startTime).toFixed(2)}s</span> • Size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(resultBlob.size)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cut Clip</span>
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
