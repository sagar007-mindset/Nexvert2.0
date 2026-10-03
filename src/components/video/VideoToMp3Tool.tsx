/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  Music,
  RefreshCw,
  Sparkles,
  Volume2
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

export default function VideoToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState<'128k' | '192k' | '256k' | '320k'>('192k');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [recentLog, setRecentLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const activeConfig = getConverterConfig('video-to-mp3')!;

  useEffect(() => {
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setExtractProgress(0);
  }, [file]);

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setExtractProgress(0);
    setError(null);
    setRecentLog('Initializing audio extractor...');

    const inExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input_${Date.now()}.${inExt}`;
    const outputName = `audio_${Date.now()}.mp3`;

    let ffmpegRef: any = null;

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      ffmpegRef = ffmpeg;

      const { fetchFile } = await import('@ffmpeg/util');
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      setRecentLog('Demuxing and encoding audio stream to MP3...');

      const args = [
        '-i', inputName,
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', bitrate,
        outputName
      ];

      const exitCode = await execFFmpeg(ffmpeg, args, {
        onProgress: (prog) => setExtractProgress(Math.round(prog * 100)),
        onLog: (msg) => {
          if (msg && !msg.startsWith('frame=')) {
            setRecentLog(msg.slice(0, 80));
          }
        }
      });

      if (exitCode !== 0) {
        throw new Error(`Audio extraction failed with exit code ${exitCode}. Please verify the video has an audio track.`);
      }

      const outData = await ffmpeg.readFile(outputName);
      const blob = new Blob([outData as any], { type: 'audio/mpeg' });

      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setExtractProgress(100);
      setRecentLog('Audio extraction complete.');
    } catch (err: any) {
      console.error('Audio extraction error:', err);
      setError(err?.message || 'Failed to extract audio track from video');
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
    a.download = `${baseName}.mp3`;
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
          title="Select video to extract audio"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV"
        />

        {file && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    MP3 Audio Quality (Bitrate)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['128k', '192k', '256k', '320k'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBitrate(b)}
                        disabled={isProcessing}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                          bitrate === b
                            ? 'bg-red-50 dark:bg-red-600/20 border-red-500 text-red-600 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {b.replace('k', '')} kbps
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting Audio ({extractProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract MP3 Audio Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Encoding MP3 Stream</span>
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
            {resultBlob && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">MP3 Extracted Successfully</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Size: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{formatBytes(resultBlob.size)}</span> • Format: <span className="font-mono text-emerald-700 dark:text-emerald-400">audio/mpeg</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .mp3</span>
                  </button>
                </div>

                {resultUrl && (
                  <div className="rounded-xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-200 dark:border-zinc-800 max-w-md mx-auto">
                    <audio src={resultUrl} controls className="w-full" />
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
