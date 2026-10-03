/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  Sliders,
  CheckCircle2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  removeAudioSilence
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function SilenceRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [thresholdDb, setThresholdDb] = useState<number>(-40);
  const [minSilenceDuration, setMinSilenceDuration] = useState<number>(0.25);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    originalDuration: number;
    newDuration: number;
    removedDuration: number;
    regionsRemoved: number;
  } | null>(null);

  const [isOrigPlaying, setIsOrigPlaying] = useState<boolean>(false);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);

  const origAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConfig = getConverterConfig('silence-remover')!;

  const handleFileSelect = async (selected: File | null) => {
    handleReset();
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setError(null);

    try {
      const url = URL.createObjectURL(selected);
      setAudioUrl(url);

      const buffer = await decodeAudioFile(selected);
      setDecodedBuffer(buffer);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to decode audio file.');
      setIsProcessing(false);
    }
  };

  const handleRemoveSilence = async () => {
    if (!decodedBuffer || !file) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      const { buffer: cleanedBuffer, originalDuration, newDuration, removedDuration, regionsRemoved } =
        removeAudioSilence(decodedBuffer, thresholdDb, minSilenceDuration);

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(cleanedBuffer);
      } else {
        outputBlob = await audioBufferToMp3(cleanedBuffer, mp3Bitrate, (p) => {
          setEncodingProgress(p);
        });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setMetrics({ originalDuration, newDuration, removedDuration, regionsRemoved });
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Silence removal failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_silenceRemoved.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setDecodedBuffer(null);
    setAudioUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setMetrics(null);
    setError(null);
    setIsOrigPlaying(false);
    setIsResultPlaying(false);
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}:${Number(s) < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={handleFileSelect}
          error={error}
          onError={setError}
        />

        {audioUrl && <audio ref={origAudioRef} src={audioUrl} onEnded={() => setIsOrigPlaying(false)} className="hidden" />}

        {isProcessing && !resultUrl && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Analyzing and trimming audio silence... {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
          </div>
        )}

        {decodedBuffer && !resultUrl && !isProcessing && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Audio Preview */}
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (!origAudioRef.current) return;
                  if (isOrigPlaying) {
                    origAudioRef.current.pause();
                    setIsOrigPlaying(false);
                  } else {
                    origAudioRef.current.play().then(() => setIsOrigPlaying(true)).catch((e) => setError(e.message));
                  }
                }}
                className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {isOrigPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                {isOrigPlaying ? 'Playing original track...' : `Audition original track (${formatSec(decodedBuffer.duration)})`}
              </div>
            </div>

            {/* Threshold controls */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Silence Threshold</span>
                </span>
                <span className="text-red-600 dark:text-red-400 font-mono text-sm">{thresholdDb} dBFS</span>
              </div>
              <input
                type="range"
                min="-60"
                max="-20"
                step="2"
                value={thresholdDb}
                onChange={(e) => setThresholdDb(parseInt(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-60 dB (Aggressive quiet)</span>
                <span>-40 dB (Standard speech)</span>
                <span>-20 dB (Strict pauses)</span>
              </div>
            </div>

            {/* Minimum duration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Minimum Silence Duration</span>
                <span className="text-red-600 dark:text-red-400 font-mono text-sm">{minSilenceDuration}s</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.15, 0.25, 0.5, 1.0].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setMinSilenceDuration(dur)}
                    className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                      minSilenceDuration === dur
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('MP3')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  exportFormat === 'MP3'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                MP3 (MPEG-1 Layer 3)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('WAV')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  exportFormat === 'WAV'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                WAV (16-bit PCM RIFF)
              </button>
            </div>

            <button
              type="button"
              onClick={handleRemoveSilence}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <VolumeX className="w-4 h-4" />
              <span>Trim Dead Air & Silence</span>
            </button>
          </div>
        )}

        {/* Results Screen */}
        {resultBlob && resultUrl && metrics && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Silence Trimmed Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Removed {metrics.removedDuration}s of dead air across {metrics.regionsRemoved} gaps • Output: {formatBytes(resultBlob.size)}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase text-slate-400">Original</div>
                <div className="font-bold text-slate-700 dark:text-zinc-300">{metrics.originalDuration}s</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400">New Duration</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.newDuration}s</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400">Time Saved</div>
                <div className="font-bold text-sky-500">
                  {metrics.originalDuration > 0
                    ? `${((metrics.removedDuration / metrics.originalDuration) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>
            </div>

            {/* Result Audio Player */}
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-left">
              <button
                type="button"
                onClick={() => {
                  if (!resultAudioRef.current) return;
                  if (isResultPlaying) {
                    resultAudioRef.current.pause();
                    setIsResultPlaying(false);
                  } else {
                    resultAudioRef.current.play().then(() => setIsResultPlaying(true)).catch((e) => setError(e.message));
                  }
                }}
                className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {isResultPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                {isResultPlaying ? 'Playing cleaned audio...' : 'Listen to trimmed result'}
              </div>
              <audio
                ref={resultAudioRef}
                src={resultUrl}
                onEnded={() => setIsResultPlaying(false)}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .{exportFormat.toLowerCase()}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setResultBlob(null);
                  setResultUrl(null);
                  setMetrics(null);
                }}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Parameters</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center space-x-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
