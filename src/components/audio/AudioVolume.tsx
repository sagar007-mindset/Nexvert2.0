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
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  adjustAudioVolume
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function AudioVolume() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [gainDb, setGainDb] = useState<number>(0);
  const [normalizePeak, setNormalizePeak] = useState<boolean>(false);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ peakBefore: number; peakAfter: number } | null>(null);

  const [isOrigPlaying, setIsOrigPlaying] = useState<boolean>(false);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);

  const origAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConfig = getConverterConfig('audio-volume')!;

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
      setError(err.message || 'Failed to decode audio.');
      setIsProcessing(false);
    }
  };

  const handleAdjustVolume = async () => {
    if (!decodedBuffer || !file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const linearMultiplier = Math.pow(10, gainDb / 20);
      const { buffer: adjustedBuffer, peakBeforeDb, peakAfterDb } = adjustAudioVolume(
        decodedBuffer,
        linearMultiplier,
        normalizePeak
      );

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(adjustedBuffer);
      } else {
        outputBlob = await audioBufferToMp3(adjustedBuffer, mp3Bitrate);
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setStats({ peakBefore: peakBeforeDb, peakAfter: peakAfterDb });
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Volume adjustment failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_volume_${normalizePeak ? 'normalized' : `${gainDb > 0 ? '+' : ''}${gainDb}dB`}.${ext}`;
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
    setStats(null);
    setError(null);
    setIsOrigPlaying(false);
    setIsResultPlaying(false);
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
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Processing audio levels...</p>
          </div>
        )}

        {decodedBuffer && !resultUrl && !isProcessing && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Normalize Option */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Normalize Peak to 0 dBFS</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Automatically amplifies audio to maximize loudness without digital clipping or distortion.
                </div>
              </div>
              <input
                type="checkbox"
                checked={normalizePeak}
                onChange={(e) => setNormalizePeak(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer shrink-0 ml-3"
              />
            </div>

            {/* Manual Gain Slider */}
            {!normalizePeak && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-zinc-300">
                  <span className="flex items-center space-x-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Gain Adjustment</span>
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-mono text-sm">
                    {gainDb > 0 ? `+${gainDb}` : gainDb} dB ({Math.round(Math.pow(10, gainDb / 20) * 100)}%)
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[-12, -6, 0, 6, 12].map((db) => (
                    <button
                      key={db}
                      type="button"
                      onClick={() => setGainDb(db)}
                      className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                        gainDb === db
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {db > 0 ? `+${db}` : db} dB
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="-24"
                  max="24"
                  step="0.5"
                  value={gainDb}
                  onChange={(e) => setGainDb(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer mt-2"
                />
              </div>
            )}

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
              onClick={handleAdjustVolume}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>
                {normalizePeak ? 'Normalize Peak to 0 dBFS' : `Apply Volume (${gainDb > 0 ? `+${gainDb}` : gainDb} dB)`}
              </span>
            </button>
          </div>
        )}

        {/* Results Screen */}
        {resultBlob && resultUrl && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Volume Adjustment Complete
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {normalizePeak
                  ? 'Peak level normalized to 0.00 dBFS'
                  : `Gain modified by ${gainDb > 0 ? `+${gainDb}` : gainDb} dB`} • Size: {formatBytes(resultBlob.size)}
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono">
                <div className="text-left">
                  <div className="text-[10px] uppercase text-slate-400">Peak Before</div>
                  <div className="font-bold text-slate-700 dark:text-zinc-300">{stats.peakBefore} dBFS</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400">Peak After</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{stats.peakAfter} dBFS</div>
                </div>
              </div>
            )}

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
                {isResultPlaying ? 'Playing volume adjusted audio...' : 'Listen to volume adjusted audio'}
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
                }}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Again</span>
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
