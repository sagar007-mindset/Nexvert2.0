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
  Settings,
  RefreshCw,
  Video,
  FileText,
  Clock,
  Sparkles
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

const SUPPORTED_OUTPUTS = [
  { ext: 'mp4', label: 'MP4 (H.264 / AAC)', mime: 'video/mp4' },
  { ext: 'webm', label: 'WEBM (VP8 / Vorbis)', mime: 'video/webm' },
  { ext: 'mov', label: 'MOV (QuickTime)', mime: 'video/quicktime' },
  { ext: 'avi', label: 'AVI (MPEG-4)', mime: 'video/x-msvideo' },
  { ext: 'mkv', label: 'MKV (Matroska)', mime: 'video/x-matroska' },
];

export default function VideoConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetExt, setTargetExt] = useState<string>('mp4');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('video-converter')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setConversionProgress(0);

      // Default target format: pick different from input
      const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      if (inExt === 'mp4') setTargetExt('webm');
      else setTargetExt('mp4');

      return () => URL.revokeObjectURL(url);
    } else {
      setInputUrl(null);
      setResultBlob(null);
      setResultUrl(null);
    }
  }, [file]);

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setConversionProgress(0);
    setError(null);
    setRecentLog('Preparing video transcode...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `output_${Date.now()}.${targetExt}`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      setRecentLog('Writing video file to virtual memory...');
      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Transcoding video...');

      // Build genuine encoding arguments based on format
      let args: string[] = [];
      if (targetExt === 'mp4') {
        args = [
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-movflags', '+faststart',
          outputName
        ];
      } else if (targetExt === 'webm') {
        args = [
          '-i', inputName,
          '-c:v', 'libvpx',
          '-crf', '22',
          '-b:v', '1.5M',
          '-c:a', 'libvorbis',
          outputName
        ];
      } else if (targetExt === 'mov') {
        args = [
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          outputName
        ];
      } else if (targetExt === 'avi') {
        args = [
          '-i', inputName,
          '-c:v', 'mpeg4',
          '-q:v', '4',
          '-c:a', 'libmp3lame',
          outputName
        ];
      } else if (targetExt === 'mkv') {
        args = [
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-c:a', 'aac',
          outputName
        ];
      }

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => {
          setConversionProgress(Math.round(prog * 100));
        },
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`FFmpeg exited with error code ${exitCode}. Please ensure the input video codec is valid.`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const targetMime = SUPPORTED_OUTPUTS.find((o) => o.ext === targetExt)?.mime || 'video/mp4';
      const blob = new Blob([outData as any], { type: targetMime });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setConversionProgress(100);
      setRecentLog('Transcoding completed successfully.');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err?.message || 'An error occurred during video transcoding');
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
    a.download = `${baseName}.${targetExt}`;
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
          title="Drop your video file here"
          subtitle="Supports MP4, WEBM, MOV, AVI, MKV up to 500 MB"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Input Video Preview
                </label>
                {inputUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                    <video
                      src={inputUrl}
                      controls
                      className="max-h-full max-w-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800">
                    <Video className="w-8 h-8" />
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Settings */}
              <div className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Target Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_OUTPUTS.map((opt) => (
                      <button
                        key={opt.ext}
                        type="button"
                        onClick={() => setTargetExt(opt.ext)}
                        disabled={isProcessing}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          targetExt === opt.ext
                            ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-mono">.{opt.ext}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950/60 rounded-xl p-3 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-mono">FFmpeg WebAssembly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transcode Mode:</span>
                    <span className="text-slate-700 dark:text-zinc-300">Local Client-Side</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Converting ({conversionProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Convert to {targetExt.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Transcoding Progress</span>
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
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Conversion Complete</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Output size: <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">{formatBytes(resultBlob.size)}</span>
                        {file && (
                          <span className="ml-2 text-slate-500 dark:text-zinc-400">
                            (Original: {formatBytes(file.size)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .{targetExt}</span>
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
