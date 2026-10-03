/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  Scissors,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  trimAudioBuffer
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function AudioTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSelectionOnly, setPlaySelectionOnly] = useState<boolean>(false);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeConfig = getConverterConfig('audio-trimmer')!;

  // Load and decode audio buffer when file changes
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
      setStartTime(0);
      setEndTime(buffer.duration);
      setCurrentTime(0);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to decode audio.');
      setIsProcessing(false);
    }
  };

  // Draw Waveform onto canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !decodedBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const data = decodedBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    const duration = decodedBuffer.duration;
    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;
    const currentX = (currentTime / duration) * width;

    // Draw background
    ctx.fillStyle = '#0f172a'; // dark navy slate
    ctx.fillRect(0, 0, width, height);

    // Unselected regions shaded
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);

    // Selected region highlight
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(startX, 0, Math.max(0, endX - startX), height);

    // Draw waveform bars
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const isInside = i >= startX && i <= endX;
      ctx.fillStyle = isInside ? '#ef4444' : '#64748b'; // red if inside, slate if outside

      const y1 = Math.max(1, (1 + min) * amp);
      const y2 = Math.min(height - 1, (1 + max) * amp);
      const barHeight = Math.max(2, y2 - y1);
      ctx.fillRect(i, y1, 1, barHeight);
    }

    // Draw Start marker
    ctx.fillStyle = '#10b981'; // emerald
    ctx.fillRect(startX - 1.5, 0, 3, height);

    // Draw End marker
    ctx.fillStyle = '#ef4444'; // red
    ctx.fillRect(endX - 1.5, 0, 3, height);

    // Draw Playhead marker
    if (currentTime >= 0 && currentTime <= duration) {
      ctx.fillStyle = '#38bdf8'; // sky blue
      ctx.fillRect(currentX - 1, 0, 2, height);
    }
  }, [decodedBuffer, startTime, endTime, currentTime]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle Playhead tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (playSelectionOnly && audio.currentTime >= endTime) {
        audio.pause();
        audio.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [playSelectionOnly, startTime, endTime]);

  const togglePlaySelection = () => {
    if (!audioRef.current || !decodedBuffer) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      setPlaySelectionOnly(true);
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => setError(e.message));
    }
  };

  const togglePlayFull = () => {
    if (!audioRef.current || !decodedBuffer) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setPlaySelectionOnly(false);
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => setError(e.message));
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !decodedBuffer) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const clickedTime = ratio * decodedBuffer.duration;

    if (audioRef.current) {
      audioRef.current.currentTime = clickedTime;
      setCurrentTime(clickedTime);
    }
  };

  const handleTrim = async () => {
    if (!decodedBuffer || !file) return;
    if (startTime >= endTime) {
      setError('Start time must be less than end time.');
      return;
    }

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      const trimmed = trimAudioBuffer(decodedBuffer, startTime, endTime);

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(trimmed);
      } else {
        outputBlob = await audioBufferToMp3(trimmed, mp3Bitrate, (prog) => {
          setEncodingProgress(prog);
        });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Trimming failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${baseName}_trimmed_${startTime.toFixed(1)}s-${endTime.toFixed(1)}s.${ext}`;
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
    setIsPlaying(false);
    setIsResultPlaying(false);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(2);
    return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
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

        {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

        {isProcessing && !decodedBuffer && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Decoding audio waveform PCM data...</p>
          </div>
        )}

        {decodedBuffer && !resultUrl && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Waveform Canvas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Start: {formatSeconds(startTime)}</span>
                <span className="text-sky-500 font-bold">Head: {formatSeconds(currentTime)}</span>
                <span className="text-red-600 dark:text-red-400 font-bold">End: {formatSeconds(endTime)}</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={120}
                  onClick={handleCanvasClick}
                  className="w-full h-28 cursor-pointer block"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Click anywhere on the waveform to scrub playhead. Drag or use the numeric controls below to set start/end.
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={togglePlaySelection}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                {isPlaying && playSelectionOnly ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>Play Selection ({(endTime - startTime).toFixed(1)}s)</span>
              </button>
              <button
                type="button"
                onClick={togglePlayFull}
                className="py-2 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isPlaying && !playSelectionOnly ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-700 dark:fill-zinc-200" />}
                <span>Play Full Track</span>
              </button>
            </div>

            {/* Time Adjusters */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex justify-between">
                  <span>Start Time (seconds)</span>
                  <button
                    type="button"
                    onClick={() => setStartTime(Number(currentTime.toFixed(2)))}
                    className="text-emerald-600 text-[10px] hover:underline cursor-pointer"
                  >
                    Set to Playhead
                  </button>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max={endTime}
                  value={startTime}
                  onChange={(e) => setStartTime(Math.max(0, Math.min(endTime, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex justify-between">
                  <span>End Time (seconds)</span>
                  <button
                    type="button"
                    onClick={() => setEndTime(Number(currentTime.toFixed(2)))}
                    className="text-red-600 text-[10px] hover:underline cursor-pointer"
                  >
                    Set to Playhead
                  </button>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min={startTime}
                  max={decodedBuffer.duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(startTime, Math.min(decodedBuffer.duration, parseFloat(e.target.value) || decodedBuffer.duration)))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Export Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
            </div>

            {exportFormat === 'MP3' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">MP3 Bitrate</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              </div>
            )}

            <button
              type="button"
              onClick={handleTrim}
              disabled={isProcessing}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Scissors className="w-4 h-4" />
              <span>Trim Selection ({(endTime - startTime).toFixed(2)}s)</span>
            </button>
          </div>
        )}

        {isProcessing && decodedBuffer && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Encoding trimmed audio... {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
          </div>
        )}

        {/* Trimmed Result View */}
        {resultBlob && resultUrl && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Audio Trimmed Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Extracted {(endTime - startTime).toFixed(2)}s region • Output size: {formatBytes(resultBlob.size)} ({exportFormat})
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
                {isResultPlaying ? 'Playing trimmed clip...' : 'Listen to trimmed clip'}
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
                <span>Adjust Trim Selection</span>
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
