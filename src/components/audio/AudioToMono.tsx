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
  CheckCircle2,
  GitCommitHorizontal,
  RotateCcw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  audioBufferToMono
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function AudioToMono() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(128);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [isOrigPlaying, setIsOrigPlaying] = useState<boolean>(false);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);

  const origAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConfig = getConverterConfig('audio-to-mono')!;

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

  const handleConvertToMono = async () => {
    if (!decodedBuffer || !file) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      const monoBuffer = audioBufferToMono(decodedBuffer);

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(monoBuffer);
      } else {
        outputBlob = await audioBufferToMp3(monoBuffer, mp3Bitrate, (p) => {
          setEncodingProgress(p);
        });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Mono downmixing failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_mono.${ext}`;
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
              Downmixing audio channels... {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
          </div>
        )}

        {decodedBuffer && !resultUrl && !isProcessing && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Channel Info Card */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Channel Architecture</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  Original: {decodedBuffer.numberOfChannels === 1 ? 'Mono (1 Channel)' : `${decodedBuffer.numberOfChannels} Channels (Stereo)`} → Target: 1 Channel (Mono)
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                1 Channel
              </span>
            </div>

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
                {isOrigPlaying ? 'Playing original stereo audio...' : 'Listen to original track'}
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
                MP3 (MPEG-1 Layer 3 Mono)
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
                WAV (16-bit PCM Mono)
              </button>
            </div>

            {exportFormat === 'MP3' && (
              <div className="grid grid-cols-4 gap-2">
                {([128, 192, 256, 320] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMp3Bitrate(r)}
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      mp3Bitrate === r
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {r}k
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleConvertToMono}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <GitCommitHorizontal className="w-4 h-4" />
              <span>Downmix to Mono</span>
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
                Downmixed to Mono Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Averaged into 1 channel • Output size: {formatBytes(resultBlob.size)} ({exportFormat})
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
                {isResultPlaying ? 'Playing mono audio...' : 'Listen to mono audio result'}
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
                <span>Convert Another</span>
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
