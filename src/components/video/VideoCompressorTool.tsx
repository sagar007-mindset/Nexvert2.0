/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Minimize2,
  RefreshCw,
  Video,
  Sliders,
  Sparkles,
  ArrowRight
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

export default function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState<number>(28);
  const [audioBitrate, setAudioBitrate] = useState<'96k' | '128k' | '160k'>('128k');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('video-compressor')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setCompressionProgress(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
    }
  }, [file]);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setCompressionProgress(0);
    setError(null);
    setRecentLog('Initializing compression engine...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `compressed_${Date.now()}.mp4`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      setRecentLog('Loading video file into memory...');
      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog(`Compressing with CRF ${crf}...`);

      const args = [
        '-i', inputName,
        '-c:v', 'libx264',
        '-crf', String(crf),
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', audioBitrate,
        '-movflags', '+faststart',
        outputName
      ];

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => {
          setCompressionProgress(Math.round(prog * 100));
        },
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`Compression failed with error code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'video/mp4' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setCompressionProgress(100);
      setRecentLog('Compression complete.');
    } catch (err: any) {
      console.error('Compression error:', err);
      setError(err?.message || 'Video compression encountered an unexpected error');
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
    a.download = `${baseName}_compressed.mp4`;
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
          title="Select or drop a video to compress"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Original Video
                </label>
                {inputUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                    <video src={inputUrl} controls className="max-h-full max-w-full" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800">
                    <Video className="w-8 h-8" />
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Compression Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Constant Rate Factor (CRF): {crf}
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {crf <= 23 ? 'High Quality' : crf <= 30 ? 'Balanced' : 'Aggressive (Smallest Size)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="38"
                    step="1"
                    value={crf}
                    onChange={(e) => setCrf(Number(e.target.value))}
                    disabled={isProcessing}
                    className="w-full accent-red-500 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    <span>18 (Near Lossless)</span>
                    <span>28 (Recommended)</span>
                    <span>38 (Smallest)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Audio Bitrate
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['96k', '128k', '160k'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setAudioBitrate(b)}
                        disabled={isProcessing}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                          audioBitrate === b
                            ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Compressing ({compressionProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span>Compress Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Encoding Pass</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{compressionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
                {recentLog && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">{recentLog}</p>
                )}
              </div>
            )}

            {/* Real Result - strictly calculated from file.size and resultBlob.size */}
            {resultBlob && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Compression Completed</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 mt-1 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBytes(resultBlob.size)}</span>
                        {resultBlob.size < file.size ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold ml-1">
                            ({(((file.size - resultBlob.size) / file.size) * 100).toFixed(1)}% smaller)
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-zinc-400 ml-1">
                            (Higher quality selected or already heavily compressed)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed MP4</span>
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
