/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { formatBytes } from '../utils/converter';
import { getConverterConfig } from '../config/converters.config';
import { audioBufferToWav, audioBufferToMp3, decodeAudioFile } from '../utils/audioEncoder';
import FileUploadBox from './FileUploadBox';

interface AudioConverterProps {
  initialMode?: string;
}

export default function AudioConverter({ initialMode }: AudioConverterProps = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'WAV' | 'MP3'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [resultDuration, setResultDuration] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const configSlug = initialMode ? initialMode.toLowerCase().replace(/^\//, '') : 'audio-converter';
  const activeConfig = getConverterConfig(configSlug) || getConverterConfig('audio-converter')!;

  useEffect(() => {
    if (initialMode) {
      const cleaned = initialMode.toLowerCase();
      // Target is what comes after "-to-": wav-to-mp3 -> MP3, mp3-to-wav -> WAV
      if (cleaned.endsWith('to-wav')) {
        setTargetFormat('WAV');
      } else {
        setTargetFormat('MP3');
      }
      handleReset();
    }
  }, [initialMode]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (isResultPlaying && resultAudioRef.current) {
        resultAudioRef.current.pause();
        setIsResultPlaying(false);
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        setError('Audio playback failed: ' + err.message);
      });
    }
  };

  const toggleResultPlay = () => {
    if (!resultAudioRef.current) return;
    if (isResultPlaying) {
      resultAudioRef.current.pause();
      setIsResultPlaying(false);
    } else {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      resultAudioRef.current.play().then(() => {
        setIsResultPlaying(true);
      }).catch((err) => {
        setError('Audio playback failed: ' + err.message);
      });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      const audioBuffer = await decodeAudioFile(file);
      setResultDuration(audioBuffer.duration);

      let outputBlob: Blob;

      if (targetFormat === 'WAV') {
        outputBlob = audioBufferToWav(audioBuffer);
      } else {
        // Real MP3 encoding using lamejs
        outputBlob = await audioBufferToMp3(audioBuffer, mp3Bitrate, (progress) => {
          setEncodingProgress(progress);
        });
      }

      const outputUrl = URL.createObjectURL(outputBlob);
      setResultUrl(outputUrl);
      setResultSize(outputBlob.size);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Audio conversion failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = targetFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setAudioUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setResultDuration(null);
    setError(null);
    setIsPlaying(false);
    setIsResultPlaying(false);
    setEncodingProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={file}
          onFileSelect={(f) => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            setFile(f);
            setResultUrl(null);
            setError(null);
            if (f) setAudioUrl(URL.createObjectURL(f));
            else setAudioUrl(null);
          }}
          error={error}
          onError={setError}
        />

        {isProcessing && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              {targetFormat === 'MP3'
                ? `Encoding genuine MP3 (${mp3Bitrate} kbps)... ${encodingProgress > 0 ? `${encodingProgress}%` : ''}`
                : 'Encoding 16-bit PCM WAV...'}
            </p>
            {targetFormat === 'MP3' && encodingProgress > 0 && (
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
            {/* Audio Preview Player */}
            {audioUrl && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                  {isPlaying ? 'Playing original track preview...' : 'Listen to original track'}
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* Target Output Settings */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Select Target Format</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTargetFormat('MP3')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                    targetFormat === 'MP3'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-400 ring-2 ring-red-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-bold text-sm">MP3</div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
                    MPEG-1 Layer 3 (lamejs encoder)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat('WAV')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                    targetFormat === 'WAV'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-400 ring-2 ring-red-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-bold text-sm">WAV</div>
                  <div className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
                    16-bit PCM uncompressed RIFF
                  </div>
                </button>
              </div>
            </div>

            {/* MP3 Bitrate Options */}
            {targetFormat === 'MP3' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  MP3 Bitrate
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([128, 192, 256, 320] as const).map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMp3Bitrate(rate)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        mp3Bitrate === rate
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {rate} kbps
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleConvert}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer"
            >
              Convert to {targetFormat} {targetFormat === 'MP3' ? `(${mp3Bitrate} kbps)` : ''}
            </button>
          </div>
        )}

        {/* Results Screen */}
        {resultUrl && resultSize !== null && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Audio Converted Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Encoded into genuine {targetFormat} ({formatBytes(resultSize)})
                {resultDuration ? ` • ${resultDuration.toFixed(1)}s` : ''}
              </p>
            </div>

            {/* Result Audio Player */}
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-left">
              <button
                type="button"
                onClick={toggleResultPlay}
                className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {isResultPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                {isResultPlaying ? 'Playing converted audio...' : 'Play converted audio'}
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
                <span>Download .{targetFormat.toLowerCase()}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Convert Another Track
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
