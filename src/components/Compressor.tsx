/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Sliders,
  Download,
  AlertCircle,
  TrendingDown,
  Lock,
  Check
} from 'lucide-react';
import { formatBytes, detectFormat, ImageFormat } from '../utils/converter';
import { getConverterConfig } from '../config/converters.config';
import FileUploadBox from './FileUploadBox';

interface CompressorProps {
  initialMode?: string;
}

export default function Compressor({ initialMode }: CompressorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ImageFormat | null>(null);
  const [quality, setQuality] = useState<number>(0.7);
  const [scale, setScale] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedResult, setCompressedResult] = useState<{
    url: string;
    size: number;
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = initialMode ? initialMode.toLowerCase().replace(/^\//, '') : 'compressor';
  const activeConfig = getConverterConfig(slug) || getConverterConfig('compressor')!;

  const handleFileSelect = (selectedFile: File | null) => {
    setError(null);
    setCompressedResult(null);
    if (!selectedFile) {
      setFile(null);
      setDetectedFormat(null);
      return;
    }

    const isAudio = selectedFile.type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(selectedFile.name);
    const isVideo = selectedFile.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(selectedFile.name);
    const isImage = (selectedFile.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|ico)$/i.test(selectedFile.name)) && !slug.includes('gif');

    if (isAudio) {
      setError('Audio compression is supported via our dedicated tool. Please use /mp3-compressor/ for audio files.');
      setFile(null);
      setDetectedFormat(null);
      return;
    }

    if (isVideo) {
      setError('Video compression is supported via our dedicated tool. Please use /video-compressor/ for video files.');
      setFile(null);
      setDetectedFormat(null);
      return;
    }

    if (!isImage) {
      setError('Compressor only supports images. For audio files, use /mp3-compressor/. For video files, use /video-compressor/.');
      setFile(null);
      setDetectedFormat(null);
      return;
    }

    const format = detectFormat(selectedFile);
    setFile(selectedFile);
    setDetectedFormat(format || 'webp');
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const isImage = (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|ico)$/i.test(file.name)) && !slug.includes('gif');

      if (!isImage) {
        setError('Compressor only supports image files. For audio use /mp3-compressor/, and for video use /video-compressor/.');
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError('Failed to fetch Canvas Context.');
            setIsProcessing(false);
            return;
          }

          const targetWidth = Math.round((img.naturalWidth || 800) * scale);
          const targetHeight = Math.round((img.naturalHeight || 600) * scale);

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          if (detectedFormat === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const mimeType =
            detectedFormat === 'png'
              ? 'image/png'
              : detectedFormat === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              if (!blob) {
                setError('Failed to compress image.');
                setIsProcessing(false);
                return;
              }

              const resultUrl = URL.createObjectURL(blob);
              setCompressedResult({
                url: resultUrl,
                size: blob.size,
                width: targetWidth,
                height: targetHeight,
              });
              setIsProcessing(false);
            },
            mimeType,
            quality
          );
        } catch (err: any) {
          URL.revokeObjectURL(objectUrl);
          setError(err.message || 'Error executing pixel scaling.');
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError('Error loading image source file.');
        setIsProcessing(false);
      };

      img.src = objectUrl;
    } catch (err: any) {
      setError(err.message || 'Error occurred during compression processing.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;

    const originalName = file.name;
    const dotIndex = originalName.lastIndexOf('.');
    const base = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const ext = dotIndex !== -1 ? originalName.substring(dotIndex) : '';

    const link = document.createElement('a');
    link.href = compressedResult.url;
    link.download = `${base}_compressed${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setDetectedFormat(null);
    setCompressedResult(null);
    setError(null);
    setQuality(0.7);
    setScale(1.0);
  };

  const savingsPercent =
    file && compressedResult
      ? Math.max(0, Math.round(((file.size - compressedResult.size) / file.size) * 100))
      : 0;

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
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Executing lossy/lossless compression algorithms...</p>
          </div>
        )}

        {file && !isProcessing && !compressedResult && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Compression Settings */}
            <div className="space-y-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono">
                <Sliders className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Compression Parameters</span>
              </div>

              {/* Quality Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-zinc-400">Quality Ratio:</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              {/* Resolution Scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-zinc-400">Dimensions Scale:</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{Math.round(scale * 100)}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1.0, 0.8, 0.6, 0.5].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setScale(sc)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                        scale === sc
                          ? 'bg-red-600 dark:bg-[#b93c3c] text-white border-red-600 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-red-400'
                      }`}
                    >
                      {Math.round(sc * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCompress}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer min-h-[44px]"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Compress File Now</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Compression Result Page */}
        {file && compressedResult && !isProcessing && (
          <div className="space-y-5 animate-fadeIn pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Stats Header */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Compression Successful! Reduced size by {savingsPercent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 font-mono block">Original Size:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-sm">{formatBytes(file.size)}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 font-mono block">Compressed Size:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatBytes(compressedResult.size)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed File</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Compress Another File
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Optimization performed locally. Files are never uploaded to remote servers.</span>
        </div>
      </div>
    </div>
  );
}
