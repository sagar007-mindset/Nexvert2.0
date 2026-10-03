/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import {
  Play,
  Pause,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  Music
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  audioBufferToWav,
  audioBufferToMp3,
  decodeAudioFile,
  mergeAudioBuffers
} from '../../utils/audioEncoder';

interface TrackItem {
  id: string;
  file: File;
  buffer: AudioBuffer;
  duration: number;
}

export default function AudioMerger() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [gapSeconds, setGapSeconds] = useState<number>(0.5);
  const [exportFormat, setExportFormat] = useState<'MP3' | 'WAV'>('MP3');
  const [mp3Bitrate, setMp3Bitrate] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isResultPlaying, setIsResultPlaying] = useState<boolean>(false);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeConfig = getConverterConfig('audio-merger')!;

  const handleAddFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    const files: File[] = Array.from(e.target.files);

    const newTracks: TrackItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMessage(`Decoding "${file.name}"... (${i + 1}/${files.length})`);
      try {
        const buffer = await decodeAudioFile(file);
        newTracks.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          buffer,
          duration: buffer.duration,
        });
      } catch (err: any) {
        setError(`Failed to load "${file.name}": ${err.message}`);
      }
    }

    setTracks((prev) => [...prev, ...newTracks]);
    setIsProcessing(false);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const updated = [...tracks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTracks(updated);
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (tracks.length < 2) {
      setError('Please add at least 2 audio files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatusMessage('Merging audio buffers...');

    try {
      const buffers = tracks.map((t) => t.buffer);
      const mergedBuffer = await mergeAudioBuffers(buffers, gapSeconds);

      setStatusMessage(`Encoding merged track to ${exportFormat}...`);

      let outputBlob: Blob;
      if (exportFormat === 'WAV') {
        outputBlob = audioBufferToWav(mergedBuffer);
      } else {
        outputBlob = await audioBufferToMp3(mergedBuffer, mp3Bitrate);
      }

      const url = URL.createObjectURL(outputBlob);
      setResultBlob(outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
      setStatusMessage('');
    } catch (err: any) {
      setError(err.message || 'Audio merge failed.');
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const ext = exportFormat.toLowerCase();
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `merged_audio_${tracks.length}_tracks.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCalculatedDuration =
    tracks.reduce((acc, t) => acc + t.duration, 0) +
    (tracks.length > 1 ? (tracks.length - 1) * gapSeconds : 0);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(1);
    return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        {/* Upload Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Tracks Sequence ({tracks.length})
            </div>
            <div className="text-[11px] text-slate-500">
              Total Duration: {formatSeconds(totalCalculatedDuration)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Audio Files</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.webm"
            onChange={handleAddFiles}
            className="hidden"
          />
        </div>

        {/* Tracks List */}
        {tracks.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center cursor-pointer hover:border-red-500/50 transition-all"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">Click to add audio files to merge</div>
            <div className="text-xs text-slate-400 mt-1">Supports MP3, WAV, OGG, M4A, FLAC, and WebM</div>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{track.file.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatSeconds(track.duration)} • {track.buffer.sampleRate}Hz • {track.buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'} • {formatBytes(track.file.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTrack(idx, 'up')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === tracks.length - 1}
                    onClick={() => moveTrack(idx, 'down')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTrack(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tracks.length > 0 && !resultUrl && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            {/* Gap settings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Silence Gap Between Tracks: {gapSeconds}s
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 0.5, 1.0, 2.0].map((gap) => (
                  <button
                    key={gap}
                    type="button"
                    onClick={() => setGapSeconds(gap)}
                    className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                      gapSeconds === gap
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {gap === 0 ? 'No Gap (0s)' : `${gap}s Gap`}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Format Settings */}
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

            {exportFormat === 'MP3' && (
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
            )}

            <button
              type="button"
              disabled={tracks.length < 2 || isProcessing}
              onClick={handleMerge}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Layers className="w-4 h-4" />
              <span>Merge {tracks.length} Tracks ({formatSeconds(totalCalculatedDuration)})</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-6 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">{statusMessage || 'Processing audio...'}</p>
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
                Tracks Merged Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Combined {tracks.length} tracks into {formatSeconds(totalCalculatedDuration)} • Output size: {formatBytes(resultBlob.size)} ({exportFormat})
              </p>
            </div>

            {/* Merged Audio Player */}
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
                {isResultPlaying ? 'Playing merged audio...' : 'Listen to merged result'}
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
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Modify Track Order
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
