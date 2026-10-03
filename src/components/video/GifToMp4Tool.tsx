/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Video,
  RefreshCw,
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

export default function GifToMp4Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('gif-to-mp4')!;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setInputUrl(url);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
      setConversionProgress(0);
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
    setRecentLog('Initializing H.264 video encoder...');

    const inputName = `input_${Date.now()}.gif`;
    const outputName = `output_${Date.now()}.mp4`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Converting GIF animation to MP4...');

      // scale=trunc(iw/2)*2:trunc(ih/2)*2 ensures even pixel dimensions required by H.264
      const args = [
        '-i', inputName,
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
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
        throw new Error(`GIF to MP4 conversion failed with exit code ${exitCode}`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'video/mp4' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setConversionProgress(100);
      setRecentLog('Conversion complete.');
    } catch (err: any) {
      console.error('GIF to MP4 error:', err);
      setError(err?.message || 'Failed to convert GIF to MP4 video');
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
    a.download = `${baseName}.mp4`;
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
          title="Select animated GIF to convert"
          subtitle="Supports standard and animated GIF files"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Original GIF
                </label>
                <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 flex items-center justify-center min-h-[160px] max-h-[260px]">
                  {inputUrl ? (
                    <img src={inputUrl} alt="Input GIF" className="max-h-[240px] rounded-lg object-contain" />
                  ) : null}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Action */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 space-y-2">
                  <p className="font-medium text-slate-900 dark:text-white">Why convert GIF to MP4?</p>
                  <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                    H.264 video compression is up to 90% smaller than legacy GIF files, loads faster, and loops smoothly across all modern browsers and smartphones.
                  </p>
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
                      <span>Converting to MP4 ({conversionProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Convert to MP4 Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Encoding H.264 Stream</span>
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
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">MP4 Video Ready</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 mt-1 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBytes(resultBlob.size)}</span>
                        {resultBlob.size < file.size && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold ml-1">
                            ({(((file.size - resultBlob.size) / file.size) * 100).toFixed(1)}% smaller)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .mp4</span>
                  </button>
                </div>

                {resultUrl && (
                  <div className="rounded-lg overflow-hidden bg-black aspect-video border border-slate-200 dark:border-zinc-800 max-w-md mx-auto">
                    <video src={resultUrl} controls autoPlay loop muted className="w-full h-full" />
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
