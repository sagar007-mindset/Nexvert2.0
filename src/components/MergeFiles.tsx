/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers
} from 'lucide-react';
import { formatBytes } from '../utils/converter';
import { getConverterConfig } from '../config/converters.config';
import FileUploadBox from './FileUploadBox';

interface MergeItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function MergeFiles() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [direction, setDirection] = useState<'vertical' | 'horizontal'>('vertical');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = getConverterConfig('merge-files')!;

  const handleFilesAdded = (files: File[]) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    const updated = [...items];
    for (const f of files) {
      if (/\.(png|jpg|jpeg|webp|bmp)$/i.test(f.name)) {
        updated.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
    }
    setItems(updated);
  };

  const moveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setItems(updated);
    setResultUrl(null);
  };

  const moveRight = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setItems(updated);
    setResultUrl(null);
  };

  const removeItem = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setItems(items.filter((it) => it.id !== id));
    setResultUrl(null);
    setResultSize(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError('Please add at least 2 images to perform merge stitching.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const imagePromises = items.map((item) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load: ${item.file.name}`));
          img.src = item.previewUrl;
        });
      });

      const loadedImages = await Promise.all(imagePromises);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to fetch Canvas graphics context.');
        setIsProcessing(false);
        return;
      }

      let targetWidth = 0;
      let targetHeight = 0;

      if (direction === 'vertical') {
        targetWidth = Math.max(...loadedImages.map((img) => img.naturalWidth));
        targetHeight = loadedImages.reduce((sum, img) => sum + img.naturalHeight, 0);
      } else {
        targetWidth = loadedImages.reduce((sum, img) => sum + img.naturalWidth, 0);
        targetHeight = Math.max(...loadedImages.map((img) => img.naturalHeight));
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      let currentOffset = 0;
      loadedImages.forEach((img) => {
        if (direction === 'vertical') {
          const xOffset = (targetWidth - img.naturalWidth) / 2;
          ctx.drawImage(img, xOffset, currentOffset);
          currentOffset += img.naturalHeight;
        } else {
          const yOffset = (targetHeight - img.naturalHeight) / 2;
          ctx.drawImage(img, currentOffset, yOffset);
          currentOffset += img.naturalWidth;
        }
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to stitch canvas layout.');
          setIsProcessing(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultSize(blob.size);
        setIsProcessing(false);
      }, 'image/png');
    } catch (err: any) {
      setError('Stitching pipeline error: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;

    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `merged_images_stitched.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setItems([]);
    setResultUrl(null);
    setResultSize(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <FileUploadBox
          config={activeConfig}
          selectedFile={null}
          selectedFiles={items.map((i) => i.file)}
          onFileSelect={() => {}}
          onFilesSelect={handleFilesAdded}
          error={error}
          onError={setError}
          multiple={true}
          title="Add Images to Stitch Together"
          subtitle="Select 2 or more image files (PNG, JPG, WEBP, BMP) to combine into a single file."
        />

        {items.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Rearrange items */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase">
                Stitch Order ({items.length} Images)
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono">Direction:</span>
                <button
                  type="button"
                  onClick={() => setDirection('vertical')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    direction === 'vertical'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  Vertical
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('horizontal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    direction === 'horizontal'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  Horizontal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 relative group"
                >
                  <div className="h-24 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-slate-100 dark:border-zinc-800">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500 dark:text-zinc-400 truncate max-w-[80px]">
                      {item.file.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => moveLeft(idx)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRight(idx)}
                        disabled={idx === items.length - 1}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!resultUrl && !isProcessing && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleMerge}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  <Layers className="w-4 h-4" />
                  <span>Stitch {items.length} Images</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Stitching image layers onto high-DPI canvas...</p>
          </div>
        )}

        {/* Result */}
        {resultUrl && !isProcessing && (
          <div className="space-y-5 animate-fadeIn pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 min-h-40">
              <img
                src={resultUrl}
                alt="Merged Stitched Graphic"
                className="max-h-64 object-contain rounded shadow-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-2 uppercase tracking-wide">
                Stitched Image Canvas ({formatBytes(resultSize || 0)})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download Stitched Image</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[44px]"
              >
                Stitch Another Set
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Image stitching performed 100% locally on HTML5 Canvas.</span>
        </div>
      </div>
    </div>
  );
}
