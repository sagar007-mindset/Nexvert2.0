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
  Layers,
  Archive,
  Image as ImageIcon
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

interface ExtractedFrame {
  name: string;
  url: string;
  size: number;
}

export default function ExtractFramesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fpsInterval, setFpsInterval] = useState<string>('1'); // 1 = 1 frame/sec, 0.5 = 1 every 2s, 2 = 2 frames/sec
  const [maxFrames, setMaxFrames] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const activeConfig = getConverterConfig('extract-video-frames')!;

  useEffect(() => {
    setExtractedFrames([]);
    setZipBlob(null);
    setError(null);
    setExtractProgress(0);
  }, [file]);

  const handleExtractFrames = async () => {
    if (!file) return;

    setIsProcessing(true);
    setExtractProgress(0);
    setError(null);
    setRecentLog('Initializing frame extraction pipeline...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputPattern = `frame_%04d.png`;

    let ffmpegRef: any = null;
    const generatedNames: string[] = [];

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog(`Extracting image frames (fps=${fpsInterval}, max=${maxFrames})...`);

      const args = [
        '-i', inputName,
        '-vf', `fps=${fpsInterval}`,
        '-vframes', String(maxFrames),
        outputPattern
      ];

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => setExtractProgress(Math.round(prog * 80)),
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`Frame extraction failed with exit code ${exitCode}`);
      }

      setRecentLog('Packaging PNG frames into ZIP archive...');
      const JSZipModule = await import('jszip');
      const JSZip = (JSZipModule as any).default || JSZipModule;
      const zip = new JSZip();

      const framesList: ExtractedFrame[] = [];

      for (let i = 1; i <= maxFrames; i++) {
        const frameName = `frame_${String(i).padStart(4, '0')}.png`;
        try {
          const frameBytes = await ffmpeg.readFile(frameName);
          generatedNames.push(frameName);

          const frameBlob = new Blob([frameBytes as any], { type: 'image/png' });
          const frameUrl = URL.createObjectURL(frameBlob);

          framesList.push({
            name: frameName,
            url: frameUrl,
            size: frameBlob.size,
          });

          zip.file(frameName, frameBytes);
        } catch {
          // No more frames
          break;
        }
      }

      if (framesList.length === 0) {
        throw new Error('No frames were generated. Please verify the video has valid visual content.');
      }

      setRecentLog('Compressing ZIP archive...');
      const archiveBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta: any) => {
          setExtractProgress(80 + Math.round(meta.percent * 0.2));
        }
      );

      setExtractedFrames(framesList);
      setZipBlob(archiveBlob);
      setExtractProgress(100);
      setRecentLog(`Extracted ${framesList.length} frames successfully.`);
    } catch (err: any) {
      console.error('Frame extraction error:', err);
      setError(err?.message || 'Failed to extract video frames');
    } finally {
      setIsProcessing(false);
      if (ffmpegRef) {
        await safeUnlink(ffmpegRef, inputName);
        for (const f of generatedNames) {
          await safeUnlink(ffmpegRef, f);
        }
      }
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${baseName}_frames.zip`;
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
          title="Select video to extract frames"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      Interval Rate
                    </label>
                    <select
                      value={fpsInterval}
                      onChange={(e) => setFpsInterval(e.target.value)}
                      disabled={isProcessing}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="1">1 frame per second</option>
                      <option value="2">2 frames per second</option>
                      <option value="0.5">1 frame every 2 seconds</option>
                      <option value="0.2">1 frame every 5 seconds</option>
                      <option value="0.1">1 frame every 10 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      Max Frames
                    </label>
                    <select
                      value={maxFrames}
                      onChange={(e) => setMaxFrames(Number(e.target.value))}
                      disabled={isProcessing}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value={30}>30 frames max</option>
                      <option value={60}>60 frames max</option>
                      <option value={120}>120 frames max</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExtractFrames}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting ({extractProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Frames as PNGs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Extracting Frames & Building ZIP</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">{extractProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${extractProgress}%` }}
                  />
                </div>
                {recentLog && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">{recentLog}</p>
                )}
              </div>
            )}

            {/* Result */}
            {zipBlob && extractedFrames.length > 0 && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {extractedFrames.length} Frames Extracted
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        ZIP size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(zipBlob.size)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Frames ZIP</span>
                  </button>
                </div>

                {/* Thumbnails grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                  {extractedFrames.slice(0, 24).map((frame, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-video bg-black flex items-center justify-center">
                      <img src={frame.url} alt={frame.name} className="max-h-full max-w-full object-contain" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/70 px-1 rounded text-slate-700 dark:text-zinc-300">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
                {extractedFrames.length > 24 && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center mt-2">
                    Showing first 24 of {extractedFrames.length} frames (all included in ZIP)
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
