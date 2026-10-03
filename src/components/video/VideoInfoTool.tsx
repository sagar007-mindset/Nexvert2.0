/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Info,
  Clock,
  Video,
  Music,
  Maximize2,
  Cpu,
  RefreshCw,
  Download,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  getFFmpeg,
  probeVideoFile,
  VideoMetadata,
  FFmpegLoadProgress
} from '../../utils/ffmpegHelper';
import FileUploadBox from '../FileUploadBox';
import VideoEngineNotice from './VideoEngineNotice';

export default function VideoInfoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<FFmpegLoadProgress | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = getConverterConfig('video-info')!;

  useEffect(() => {
    setMetadata(null);
    setError(null);
  }, [file]);

  const handleInspect = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const ffmpeg = await getFFmpeg((prog) => setEngineProgress(prog));
      const data = await probeVideoFile(ffmpeg, file);
      setMetadata(data);
    } catch (err: any) {
      console.error('Probe error:', err);
      setError(err?.message || 'Failed to inspect video metadata with ffprobe');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
    if (!metadata) return;
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${metadata.filename}_ffprobe_metadata.json`;
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
          title="Select video to inspect"
          subtitle="Supports MP4, MOV, WEBM, AVI, MKV, FLV, WMV"
        />

        {file && !metadata && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6 text-center">
            <button
              type="button"
              onClick={handleInspect}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg inline-flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Probing with FFprobe...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Inspect Streams with FFprobe</span>
                </>
              )}
            </button>
          </div>
        )}

        {metadata && (
          <div className="mt-6 border-t border-slate-200 dark:border-zinc-800 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Stream Properties (Genuine FFprobe)</h3>
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Container format */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                  Container Format
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {metadata.formatName}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                  Exact File Size
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                  {formatBytes(metadata.filesize)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                  Duration
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                  {metadata.duration > 0 ? `${metadata.duration.toFixed(2)}s` : 'Unknown'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                  Overall Bitrate
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                  {metadata.overallBitrate > 0
                    ? `${Math.round(metadata.overallBitrate / 1000)} kbps`
                    : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Video Stream */}
            {metadata.video && (
              <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Video Stream Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Video Codec:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold uppercase">{metadata.video.codec}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Resolution:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.video.width && metadata.video.height
                        ? `${metadata.video.width} × ${metadata.video.height}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Frame Rate:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.video.fps ? `${metadata.video.fps} fps` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Stream Bitrate:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.video.bitrate ? `${Math.round(metadata.video.bitrate / 1000)} kbps` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Stream */}
            {metadata.audio && (
              <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <Music className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Audio Stream Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Audio Codec:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold uppercase">{metadata.audio.codec}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Sample Rate:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.audio.sampleRate ? `${metadata.audio.sampleRate} Hz` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Channels:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.audio.channels === 1 ? 'Mono (1)' : metadata.audio.channels === 2 ? 'Stereo (2)' : metadata.audio.channels || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Audio Bitrate:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {metadata.audio.bitrate ? `${Math.round(metadata.audio.bitrate / 1000)} kbps` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
