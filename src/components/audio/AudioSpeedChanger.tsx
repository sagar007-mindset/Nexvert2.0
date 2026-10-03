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
  Gauge,
  CheckCircle2,
  FastForward,
  RotateCcw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  changeAudioSpeed
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function AudioSpeedChanger() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [speedRatio, setSpeedRatio] = useState<number>(1.25);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isOrigPlaying, setIsOrigPlaying] = useState<boolean>(false);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);

  const origAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConfig = getConverterConfig('audio-speed-changer')!;

  const handleFileSelect = async (selected: File | null) => {
    handleReset();
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setError(null);
    setStatusMessage('Decoding audio file...');

    try {
      const url = URL.createObjectURL(selected);
      setAudioUrl(url);

      const buffer = await decodeAudioFile(selected);
      setDecodedBuffer(buffer);
      setIsProcessing(false);
      setStatusMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to decode audio file.');
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleProcessSpeed = async () => {
    if (!decodedBuffer || !file) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);
    setStatusMessage(preservePitch ? 'Time-stretching audio with pitch preservation (WSOLA)...' : 'Resampling playback rate...');

    try {
      const processedBuffer = await changeAudioSpeed(decodedBuffer, speedRatio, preservePitch);

      setStatusMessage(`Encoding ${exportFormat}...`);

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(processedBuffer);
      } else {
        outputBlob = await audioBufferToMp3(processedBuffer, mp3Bitrate, (prog) => {
          setEncodingProgress(prog);
        });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
      setStatusMessage('');
    } catch (err: any) {
      setError(err.message || 'Speed transformation failed.');
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_${speedRatio}x_${preservePitch ? 'pitchPreserved' : 'resampled'}.${ext}`;
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
    setError(null);
    setIsOrigPlaying(false);
    setIsResultPlaying(false);
    setStatusMessage('');
  };

  const speedPresets = [0.5, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
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
              {statusMessage || 'Processing audio...'} {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
          </div>
        )}

        {decodedBuffer && !resultUrl && !isProcessing && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Speed Presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Speed Multiplier</span>
                </span>
                <span className="text-red-600 dark:text-red-400 font-mono text-sm">{speedRatio}x</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                {speedPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSpeedRatio(preset)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      Math.abs(speedRatio - preset) < 0.01
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0.25"
                max="3.0"
                step="0.05"
                value={speedRatio}
                onChange={(e) => setSpeedRatio(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer mt-2"
              />
            </div>

            {/* Pitch Mode Toggle */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">
                  Preserve Original Pitch
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {preservePitch
                    ? 'Enabled: Audio speeds up without chipmunk/deep voice pitch shifts.'
                    : 'Disabled: Pitch raises when sped up, lowers when slowed down (classic tape effect).'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={preservePitch}
                onChange={(e) => setPreservePitch(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer shrink-0 ml-3"
              />
            </div>

            {/* Estimated Real Duration Display */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400">Original Duration: </span>
                <span className="font-bold text-slate-700 dark:text-zinc-200">{formatSec(decodedBuffer.duration)}</span>
              </div>
              <div>
                <span className="text-slate-400">New Duration: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatSec(decodedBuffer.duration / speedRatio)}
                </span>
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
              onClick={handleProcessSpeed}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <FastForward className="w-4 h-4" />
              <span>Apply Speed ({speedRatio}x)</span>
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
                Speed Adjusted ({speedRatio}x)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Processed with {preservePitch ? 'pitch preservation' : 'resampling'} • Output: {formatBytes(resultBlob.size)} ({exportFormat})
              </p>
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
                {isResultPlaying ? 'Playing adjusted track...' : 'Listen to adjusted track'}
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
                <span>Adjust Speed Again</span>
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
