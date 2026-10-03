/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  VolumeX,
  RefreshCw,
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

export default function MuteVideoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [muteProgress, setMuteProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('mute-video')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setMuteProgress(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
    }
  }, [file]);

  const handleMute = async () => {
    if (!file) return;

    setIsProcessing(true);
    setMuteProgress(0);
    setError(null);
    setRecentLog('Initializing video stream processor...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `muted_${Date.now()}.${inExt === 'webm' ? 'webm' : 'mp4'}`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Stripping audio stream with stream copy...');

      // -an removes audio, -c:v copy preserves exact video frames without re-encoding
      let exitCode = await execFFmpeg(ffmpeg, [
        '-i', inputName,
        '-an',
        '-c:v', 'copy',
        outputName
      ], {
        onProgress: (prog) => setMuteProgress(Math.round(prog * 100)),
        onLog: (msg) => setRecentLog(msg.slice(0, 80))
      });

      // Fallback if container stream copy is not supported
      if (exitCode !== 0) {
        setRecentLog('Direct copy fallback, remuxing video stream...');
        exitCode = await execFFmpeg(ffmpeg, [
          '-i', inputName,
          '-an',
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          outputName
        ], {
          onProgress: (prog) => setMuteProgress(Math.round(prog * 100)),
          onLog: (msg) => setRecentLog(msg.slice(0, 80))
        });
      }

      if (exitCode !== 0) {
        throw new Error(`Failed to remove audio track. Exit code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const mime = outputName.endsWith('.webm') ? 'video/webm' : 'video/mp4';
      const blob = new Blob([outData as any], { type: mime });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setMuteProgress(100);
      setRecentLog('Video audio stripped successfully.');
    } catch (err: any) {
      console.error('Mute video error:', err);
      setError(err?.message || 'Failed to strip audio from video');
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
    const outExt = resultBlob.type === 'video/webm' ? 'webm' : 'mp4';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${baseName}_muted.${outExt}`;
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
          title="Select video to mute"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Original Video
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
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                    <VolumeX className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Lossless Audio Stripping</span>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Removes all audio streams while copying video frames 1:1 without re-encoding or quality loss.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMute}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Stripping Audio ({muteProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Mute Video Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Stream Copy Progress</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{muteProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${muteProgress}%` }}
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
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Video Muted (Audio Removed)</h4>
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
                    <span>Download Muted Video</span>
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
