/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile
} from '../../utils/audioEncoder';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop animation and clean audio streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Visualizer loop for live audio input
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const r = 239;
      const g = Math.round(68 + (dataArray[i] / 255) * 100);
      const b = 68;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
      if (x > width) break;
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  const startRecording = async () => {
    setError(null);
    handleReset();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording (navigator.mediaDevices.getUserMedia).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Live Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      audioChunksRef.current = [];

      // Determine mime type supported
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(rawBlob);
        setRecordedAudioUrl(url);

        try {
          setIsProcessing(true);
          const rawFile = new File([rawBlob], 'voice_recording.webm', { type: rawBlob.type });
          const buffer = await decodeAudioFile(rawFile);
          setRecordedBuffer(buffer);
          setIsProcessing(false);
        } catch (decErr: any) {
          setError('Failed to decode recorded stream: ' + decErr.message);
          setIsProcessing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setElapsedSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      drawVisualizer();
    } catch (err: any) {
      setError(err.message || 'Microphone access denied or failed.');
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const handleExport = async () => {
    if (!recordedBuffer) return;

    setIsProcessing(true);
    setEncodingProgress(0);
    setError(null);

    try {
      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(recordedBuffer);
      } else {
        outputBlob = await audioBufferToMp3(recordedBuffer, mp3Bitrate, (prog) => {
          setEncodingProgress(prog);
        });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Encoding failed.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `voice_recording_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setRecordedBuffer(null);
    setRecordedAudioUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setElapsedSeconds(0);
    setIsAudioPlaying(false);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        {/* Recording Visual Stage */}
        <div className="rounded-2xl bg-slate-950 p-6 text-center space-y-4 border border-slate-800 relative overflow-hidden">
          {/* Live visualizer canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-24 rounded-xl block bg-slate-900/60 border border-slate-800"
          />

          <div className="space-y-1">
            <div className="text-3xl font-black font-mono text-white tracking-wider">
              {formatTimer(elapsedSeconds)}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {isRecording
                ? isPaused
                  ? 'Recording paused'
                  : 'Recording live microphone audio...'
                : recordedBuffer
                ? `Recording finished (${recordedBuffer.duration.toFixed(1)}s)`
                : 'Ready to record'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            {!isRecording && !recordedBuffer && (
              <button
                type="button"
                onClick={startRecording}
                className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <>
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-red-600/20"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Recording</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Playback & Export Stage */}
        {recordedBuffer && !resultUrl && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Audio Audition Player */}
            {recordedAudioUrl && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!playbackAudioRef.current) return;
                    if (isAudioPlaying) {
                      playbackAudioRef.current.pause();
                      setIsAudioPlaying(false);
                    } else {
                      playbackAudioRef.current.play().then(() => setIsAudioPlaying(true)).catch((e) => setError(e.message));
                    }
                  }}
                  className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {isAudioPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="flex-1 text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">
                  {isAudioPlaying ? 'Playing back recording...' : 'Audition voice recording'}
                </div>
                <audio
                  ref={playbackAudioRef}
                  src={recordedAudioUrl}
                  onEnded={() => setIsAudioPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* Target Export Settings */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Export Format</label>
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

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isProcessing}
                className="py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export as {exportFormat}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record Again</span>
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-6 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              Encoding recording to {exportFormat}... {encodingProgress > 0 ? `${encodingProgress}%` : ''}
            </p>
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
                Voice Recording Exported
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ready for download: {formatBytes(resultBlob.size)} ({exportFormat})
              </p>
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
                onClick={handleReset}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                New Voice Recording
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
