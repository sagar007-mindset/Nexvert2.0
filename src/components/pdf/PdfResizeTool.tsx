/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Maximize2,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Scaling,
  Check
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface PageFormatPreset {
  name: string;
  widthPt: number;
  heightPt: number;
  description: string;
}

const PRESETS: Record<string, PageFormatPreset> = {
  a4: { name: 'A4', widthPt: 595.28, heightPt: 841.89, description: '210 × 297 mm (International Standard)' },
  letter: { name: 'US Letter', widthPt: 612, heightPt: 792, description: '8.5 × 11 inches (US Standard)' },
  legal: { name: 'US Legal', widthPt: 612, heightPt: 1008, description: '8.5 × 14 inches (Legal Documents)' },
  a3: { name: 'A3', widthPt: 841.89, heightPt: 1190.55, description: '297 × 420 mm (Large Format)' },
};

export default function PdfResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetPreset, setTargetPreset] = useState<string>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [scaleContent, setScaleContent] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['resize-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setOrigDimensions(null);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      const firstPage = doc.getPage(0);
      setOrigDimensions({
        width: Math.round(firstPage.getWidth()),
        height: Math.round(firstPage.getHeight())
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const handleResize = async () => {
    if (!file || realPageCount === 0) return;

    const preset = PRESETS[targetPreset];
    if (!preset) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const pages = doc.getPages();

      for (const page of pages) {
        const origW = page.getWidth();
        const origH = page.getHeight();
        const isOrigLandscape = origW > origH;

        let targetW = preset.widthPt;
        let targetH = preset.heightPt;

        if (orientation === 'landscape') {
          targetW = Math.max(preset.widthPt, preset.heightPt);
          targetH = Math.min(preset.widthPt, preset.heightPt);
        } else if (orientation === 'portrait') {
          targetW = Math.min(preset.widthPt, preset.heightPt);
          targetH = Math.max(preset.widthPt, preset.heightPt);
        } else {
          // auto: match original aspect ratio orientation
          if (isOrigLandscape) {
            targetW = Math.max(preset.widthPt, preset.heightPt);
            targetH = Math.min(preset.widthPt, preset.heightPt);
          } else {
            targetW = Math.min(preset.widthPt, preset.heightPt);
            targetH = Math.max(preset.widthPt, preset.heightPt);
          }
        }

        if (scaleContent) {
          // Scale content proportionally and center on new page canvas
          const scale = Math.min(targetW / origW, targetH / origH);
          const scaledW = origW * scale;
          const scaledH = origH * scale;
          const offsetX = (targetW - scaledW) / 2;
          const offsetY = (targetH - scaledH) / 2;

          page.scaleContent(scale, scale);
          page.translateContent(offsetX / scale, offsetY / scale);
        }

        page.setSize(targetW, targetH);
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resize PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-${targetPreset}.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to resize"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && origDimensions && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          {/* File Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {realPageCount} pages • Current size: {origDimensions.width} × {origDimensions.height} pt
              </p>
            </div>
          </div>

          {/* Preset Selection Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Target Paper Standard
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(PRESETS).map(([key, p]) => {
                const isSelected = targetPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTargetPreset(key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-slate-900 dark:text-white ring-1 ring-red-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-sm mb-1">
                      <span>{p.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation & Scaling options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="auto">Auto (Match original page orientation)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Content Fitting
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scaleContent}
                  onChange={(e) => setScaleContent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Scale & center vector content to fit target paper size
                </span>
              </label>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleResize}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Scaling className="w-4 h-4" />
              {isProcessing ? 'Resizing Pages...' : `Resize to ${PRESETS[targetPreset]?.name}`}
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
                PDF Resized Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                All {realPageCount} pages scaled to {PRESETS[targetPreset]?.name} ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Resized PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
