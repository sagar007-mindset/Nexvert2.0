/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Stamp,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

const COLOR_PRESETS = [
  { name: 'Red', hex: '#dc2626', rgb: [0.86, 0.15, 0.15] as [number, number, number] },
  { name: 'Slate', hex: '#64748b', rgb: [0.39, 0.45, 0.55] as [number, number, number] },
  { name: 'Blue', hex: '#2563eb', rgb: [0.15, 0.39, 0.92] as [number, number, number] },
  { name: 'Green', hex: '#16a34a', rgb: [0.09, 0.64, 0.29] as [number, number, number] },
  { name: 'Amber', hex: '#d97706', rgb: [0.85, 0.47, 0.02] as [number, number, number] },
];

export default function PdfWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotationAngle, setRotationAngle] = useState<number>(-45);
  const [fontSize, setFontSize] = useState<number>(48);
  const [selectedColorHex, setSelectedColorHex] = useState<string>('#dc2626');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['watermark-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const hexToRgb01 = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    return [r, g, b];
  };

  const handleApplyWatermark = async () => {
    if (!file || realPageCount === 0) return;
    if (!text.trim()) {
      setErrorMessage('Please enter watermark text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { StandardFonts, rgb, degrees } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);

      const [r, g, b] = hexToRgb01(selectedColorHex);
      const pages = doc.getPages();

      for (const page of pages) {
        const w = page.getWidth();
        const h = page.getHeight();

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        // Center calculation
        const x = (w - textWidth) / 2;
        const y = (h - textHeight) / 2;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: Math.max(0.01, Math.min(1, opacity)),
          rotate: degrees(rotationAngle)
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-watermarked.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to watermark"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Total pages: {realPageCount}
              </p>
            </div>
          </div>

          {/* Watermark Configuration Form */}
          <div className="space-y-4">
            {/* Watermark text */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, COPY"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 mt-2">
                {['CONFIDENTIAL', 'DRAFT', 'COPY', 'DO NOT SHARE'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setText(sample)}
                    className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Sliders and Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {/* Opacity */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Opacity</span>
                  <span className="font-mono text-slate-500">{Math.round(opacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={0.8}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Rotation Angle */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Rotation Angle</span>
                  <span className="font-mono text-slate-500">{rotationAngle}°</span>
                </label>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={15}
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Font Size</span>
                  <span className="font-mono text-slate-500">{fontSize} pt</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={72}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Watermark Color
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColorHex(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColorHex.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-white ring-2 ring-red-500 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={selectedColorHex}
                  onChange={(e) => setSelectedColorHex(e.target.value)}
                  className="w-7 h-7 p-0 rounded-full border-0 cursor-pointer"
                  title="Custom Color"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleApplyWatermark}
              disabled={isProcessing || !text.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Stamp className="w-4 h-4" />
              {isProcessing ? 'Applying Watermark...' : 'Apply Watermark to All Pages'}
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
                Watermark Applied Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Processed all {realPageCount} pages with vector watermark text ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Watermarked PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
