/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

const PAGE_PRESETS: Record<string, { name: string; w: number; h: number }> = {
  fit: { name: 'Fit to Image Size', w: 0, h: 0 },
  a4: { name: 'A4 (210 × 297 mm)', w: 595.28, h: 841.89 },
  letter: { name: 'US Letter (8.5 × 11 in)', w: 612, h: 792 },
  a3: { name: 'A3 (297 × 420 mm)', w: 841.89, h: 1190.55 },
};

export default function JpgToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSizeKey, setPageSizeKey] = useState<string>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [marginPt, setMarginPt] = useState<number>(20); // 0, 20, 40
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['jpg-to-pdf'];

  const handleAddFiles = (newFiles: File[]) => {
    setErrorMessage(null);
    setResultBlob(null);

    newFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            file,
            previewUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
          }
        ]);
      };
      img.onerror = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            file,
            previewUrl,
            width: 800,
            height: 600,
          }
        ]);
      };
      img.src = previewUrl;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setResultBlob(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setResultBlob(null);
  };

  /**
   * Convert an image File to a PNG or JPEG Uint8Array suitable for pdf-lib
   */
  const convertFileToImageBytes = async (file: File): Promise<{ bytes: Uint8Array; type: 'jpg' | 'png' }> => {
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    if (isJpg) {
      const buf = await file.arrayBuffer();
      return { bytes: new Uint8Array(buf), type: 'jpg' };
    }
    if (isPng) {
      const buf = await file.arrayBuffer();
      return { bytes: new Uint8Array(buf), type: 'png' };
    }

    // For other formats (WebP, BMP, GIF), draw to offscreen canvas and convert to PNG
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error('Failed to create canvas context'));
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error('Failed to render image to blob'));
          const buf = await blob.arrayBuffer();
          resolve({ bytes: new Uint8Array(buf), type: 'png' });
        }, 'image/png');
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to decode image: ${file.name}`));
      };
      img.src = url;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one image to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const doc = await PDFDocument.create();

      for (const item of images) {
        const { bytes, type } = await convertFileToImageBytes(item.file);
        const embeddedImg = type === 'jpg'
          ? await doc.embedJpg(bytes)
          : await doc.embedPng(bytes);

        const imgW = embeddedImg.width;
        const imgH = embeddedImg.height;

        let pageW = imgW;
        let pageH = imgH;

        if (pageSizeKey !== 'fit') {
          const preset = PAGE_PRESETS[pageSizeKey];
          let baseW = preset.w;
          let baseH = preset.h;

          if (orientation === 'landscape') {
            pageW = Math.max(baseW, baseH);
            pageH = Math.min(baseW, baseH);
          } else if (orientation === 'portrait') {
            pageW = Math.min(baseW, baseH);
            pageH = Math.max(baseW, baseH);
          } else {
            // auto
            if (imgW > imgH) {
              pageW = Math.max(baseW, baseH);
              pageH = Math.min(baseW, baseH);
            } else {
              pageW = Math.min(baseW, baseH);
              pageH = Math.max(baseW, baseH);
            }
          }
        }

        const page = doc.addPage([pageW, pageH]);

        // Calculate fitted image dimensions respecting margin
        const availW = Math.max(10, pageW - marginPt * 2);
        const availH = Math.max(10, pageH - marginPt * 2);

        const scale = Math.min(availW / imgW, availH / imgH, 1);
        const drawW = imgW * scale;
        const drawH = imgH * scale;

        const x = marginPt + (availW - drawW) / 2;
        const y = marginPt + (availH - drawH) / 2;

        page.drawImage(embeddedImg, {
          x,
          y,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const baseName = images[0]?.file.name.replace(/\.[^/.]+$/, '') || 'images';
    triggerFileDownload(resultBlob, `${baseName}-converted.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={null}
        selectedFiles={images.map((i) => i.file)}
        onFileSelect={(f) => f && handleAddFiles([f])}
        onFilesSelect={handleAddFiles}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select images to convert into PDF"
        subtitle="JPG, PNG, WebP, BMP formats supported"
        multiple={true}
      />

      {images.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          {/* Images List Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-500" />
                Images Queue ({images.length})
              </h3>
              <p className="text-xs text-slate-500">
                Each image will become 1 page in the generated PDF
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/bmp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleAddFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>
          </div>

          {/* Queue Items */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60"
              >
                <div className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                  #{idx + 1}
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(item.file.size)} • {item.width} × {item.height} px
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'down')}
                    disabled={idx === images.length - 1}
                    className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Size
              </label>
              <select
                value={pageSizeKey}
                onChange={(e) => setPageSizeKey(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {Object.entries(PAGE_PRESETS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                disabled={pageSizeKey === 'fit'}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-40"
              >
                <option value="auto">Auto (Match image ratio)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Margins
              </label>
              <select
                value={marginPt}
                onChange={(e) => setMarginPt(Number(e.target.value))}
                disabled={pageSizeKey === 'fit'}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-40"
              >
                <option value={0}>None (0 pt)</option>
                <option value={20}>Small (20 pt)</option>
                <option value={40}>Large (40 pt)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleConvert}
              disabled={isProcessing || images.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileText className="w-4 h-4" />
              {isProcessing
                ? 'Creating PDF Document...'
                : `Convert ${images.length} ${images.length === 1 ? 'Image' : 'Images'} to PDF`}
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {resultBlob && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                PDF Created Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Converted {images.length} images into a {images.length}-page PDF document ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
