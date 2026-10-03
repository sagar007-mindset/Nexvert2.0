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
  Minimize2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import { audioBufferToMp3, audioBufferToMono, decodeAudioFile } from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function Mp3Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [targetBitrate, setTargetBitrate] = useState<64 | 96 | 128 | 160 | 192>(96);
  const [downmixToMono, setDownmixToMono] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [isOrigPlaying, setIsOrigPlaying] = useState<boolean>(false);
  const origAudioRef = useRef<HTMLAudioElement | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConfig = getConverterConfig('mp3-compressor')!;

  const toggleOrigPlay = () => {
    if (!origAudioRef.current) return;
    if (isOrigPlaying) {
      origAudioRef.current.pause();
      setIsOrigPlaying(false);
    } else {
      if (isResultPlaying && resultAudioRef.current) {
        resultAudioRef.current.pause();
        setIsResultPlaying(false);
      }
      origAudioRef.current.play().then(() => setIsOrigPlaying(true)).catch((e) => setError(e.message));
    }
  };

  const toggleResultPlay = () => {
    if (!resultAudioRef.current) return;
    if (isResultPlaying) {
      resultAudioRef.current.pause();
      setIsResultPlaying(false);
    } else {
      if (isOrigPlaying && origAudioRef.current) {
        origAudioRef.current.pause();
        setIsOrigPlaying(false);
      }
      resultAudioRef.current.play().then(() => setIsResultPlaying(true)).catch((e) => setError(e.message));
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      let audioBuffer = await decodeAudioFile(file);

      if (downmixToMono && audioBuffer.numberOfChannels > 1) {
        audioBuffer = audioBufferToMono(audioBuffer);
      }

      const compressed = await audioBufferToMp3(audioBuffer, targetBitrate, (progress) => {
        setEncodingProgress(progress);
      });

      const url = URL.createObjectURL(compressed);
      setResultBlob(compressed);
      setResultUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Compression failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_compressed_${targetBitrate}kbps.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setOriginalAudioUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setIsOrigPlaying(false);
    setIsResultPlaying(false);
    setEncodingProgress(0);
  };

  const calculateSavings = () => {
    if (!file || !resultBlob) return null;
    const origSize = file.size;
    const newSize = resultBlob.size;
    const diff = origSize - newSize;
    const percent = (diff / origSize) * 100;
    return {
      isSmaller: diff > 0,
      percentFormatted: Math.abs(percent).toFixed(1),
      bytesDiffFormatted: formatBytes(Math.abs(diff)),
      origFormatted: formatBytes(origSize),
      newFormatted: formatBytes(newSize),
    };
  };

  const savings = calculateSavings();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={(f) => {
            if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
            setFile(f);
            setResultBlob(null);
            setResultUrl(null);
            setError(null);
            if (f) setOriginalAudioUrl(URL.createObjectURL(f));
            else setOriginalAudioUrl(null);
          }}
          error={error}
          onError={setError}
        />

        {isProcessing && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Re-encoding MP3 at {targetBitrate} kbps... {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
            {encodingProgress > 0 && (
              <div className="w-48 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-150"
                  style={{ width: `${encodingProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {file && !isProcessing && !resultUrl && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Audio Preview */}
            {originalAudioUrl && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={toggleOrigPlay}
                  className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {isOrigPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                  {isOrigPlaying ? 'Playing original track...' : `Preview original track (${formatBytes(file.size)})`}
                </div>
                <audio ref={origAudioRef} src={originalAudioUrl} onEnded={() => setIsOrigPlaying(false)} className="hidden" />
              </div>
            )}

            {/* Target Bitrate Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Target Compression Bitrate</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([64, 96, 128, 160, 192] as const).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTargetBitrate(rate)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      targetBitrate === rate
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div>{rate}k</div>
                    <div className="text-[9px] opacity-75">
                      {rate <= 64 ? 'Voice' : rate <= 96 ? 'Speech' : rate <= 128 ? 'Standard' : 'Music'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Downmix Options */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">Downmix to Mono</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Averages left and right channels to cut data footprint further (ideal for speech/podcasts).
                </div>
              </div>
              <input
                type="checkbox"
                checked={downmixToMono}
                onChange={(e) => setDownmixToMono(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleCompress}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Compress Audio ({targetBitrate} kbps{downmixToMono ? ' Mono' : ''})</span>
            </button>
          </div>
        )}

        {/* Compression Results */}
        {resultBlob && savings && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Compression Complete
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {savings.isSmaller
                  ? `Saved ${savings.bytesDiffFormatted} (${savings.percentFormatted}% size reduction)`
                  : `Target bitrate resulted in ${savings.percentFormatted}% file expansion`}
              </p>
            </div>

            {/* Real Size Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Original Size</div>
                <div className="text-base font-black text-slate-700 dark:text-zinc-300">{savings.origFormatted}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Compressed Size</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{savings.newFormatted}</div>
              </div>
            </div>

            {/* Result Audio Player */}
            {resultUrl && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-left">
                <button
                  type="button"
                  onClick={toggleResultPlay}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {isResultPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                  {isResultPlaying ? 'Playing compressed audio...' : 'Listen to compressed audio result'}
                </div>
                <audio ref={resultAudioRef} src={resultUrl} onEnded={() => setIsResultPlaying(false)} className="hidden" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .mp3</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Compress Another Track
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
