/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  Info,
  Activity,
  Music,
  Code,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import {
  decodeAudioFile,
  getAudioBufferMetadata,
  AudioBufferMetadata
} from '../../utils/audioEncoder';
import FileUploadBox from '../FileUploadBox';

export default function AudioInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AudioBufferMetadata | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeConfig = getConverterConfig('audio-info')!;

  const handleFileSelect = async (selected: File | null) => {
    setFile(selected);
    setMetadata(null);
    setDecodedBuffer(null);
    setError(null);

    if (!selected) return;

    setIsProcessing(true);
    try {
      const buffer = await decodeAudioFile(selected);
      const meta = getAudioBufferMetadata(buffer, selected);
      setDecodedBuffer(buffer);
      setMetadata(meta);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect audio.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !decodedBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const data = decodedBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const y1 = Math.max(1, (1 + min) * amp);
      const y2 = Math.min(height - 1, (1 + max) * amp);
      const barHeight = Math.max(2, y2 - y1);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(i, y1, 1, barHeight);
    }
  }, [decodedBuffer]);

  const copyJson = () => {
    if (!metadata || !file) return;
    const payload = {
      fileName: file.name,
      mimeType: file.type,
      ...metadata,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
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

        {isProcessing && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Decoding audio PCM stream for analysis...</p>
          </div>
        )}

        {metadata && file && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Waveform Thumbnail */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-500" />
                <span>Audio Waveform Profile</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950">
                <canvas ref={canvasRef} width={600} height={90} className="w-full h-24 block" />
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.formattedDuration}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">({metadata.durationSeconds}s)</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sample Rate</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.sampleRate.toLocaleString()} Hz
                </div>
                <div className="text-[10px] text-slate-500">{(metadata.sampleRate / 1000).toFixed(1)} kHz</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Channels</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.channelMode}
                </div>
                <div className="text-[10px] text-slate-500">{metadata.channels} audio channel{metadata.channels > 1 ? 's' : ''}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Bitrate</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.calculatedBitrateKbps} kbps
                </div>
                <div className="text-[10px] text-slate-500">File size ÷ duration</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Peak Level</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.peakDbFS} dBFS
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Linear: {metadata.peakLinear}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">RMS Loudness</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.rmsDbFS} dBFS
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Linear: {metadata.rmsLinear}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">PCM Samples / Ch</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.totalSamplesPerChannel.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Per channel</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Silence Share</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {metadata.silencePercentage}%
                </div>
                <div className="text-[10px] text-slate-500">&lt; -50 dBFS frames</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">File Container Size</div>
                <div className="text-sm font-black text-slate-800 dark:text-white font-mono mt-0.5">
                  {formatBytes(metadata.fileSizeBytes)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{metadata.fileSizeBytes.toLocaleString()} bytes</div>
              </div>
            </div>

            {/* Export JSON Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={copyJson}
                className="py-2.5 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {copiedJson ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Metadata Copied!' : 'Copy Metadata as JSON'}</span>
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
