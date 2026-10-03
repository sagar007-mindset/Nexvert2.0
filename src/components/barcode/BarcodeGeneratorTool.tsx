/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Barcode,
  Download,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';

type BarcodeFormat =
  | 'CODE128'
  | 'EAN13'
  | 'UPC'
  | 'CODE39'
  | 'ITF14'
  | 'MSI'
  | 'pharmacode'
  | 'codabar';

interface FormatPreset {
  id: BarcodeFormat;
  name: string;
  defaultVal: string;
  description: string;
  placeholder: string;
}

const BARCODE_FORMATS: FormatPreset[] = [
  {
    id: 'CODE128',
    name: 'Code 128 (Universal)',
    defaultVal: 'NEXVERT-2026',
    description: 'High-density alphanumeric barcode standard used worldwide in logistics and packaging.',
    placeholder: 'Any letters, numbers, symbols',
  },
  {
    id: 'EAN13',
    name: 'EAN-13 (International Retail)',
    defaultVal: '9780201379624',
    description: '12 or 13-digit standard for retail products outside North America.',
    placeholder: '12 or 13 digits (e.g. 9780201379624)',
  },
  {
    id: 'UPC',
    name: 'UPC-A (North American Retail)',
    defaultVal: '036000291452',
    description: '11 or 12-digit standard for grocery and retail checkout across the US & Canada.',
    placeholder: '11 or 12 digits (e.g. 036000291452)',
  },
  {
    id: 'CODE39',
    name: 'Code 39 (Industrial & Military)',
    defaultVal: 'ITEM-9874',
    description: 'Discrete, self-checking symbology supporting uppercase letters, digits, and special characters (- . $ / + % space).',
    placeholder: 'UPPERCASE, digits, - . $ / + %',
  },
  {
    id: 'ITF14',
    name: 'ITF-14 (Shipping Containers)',
    defaultVal: '10012345678902',
    description: '14-digit interleaved 2 of 5 barcode commonly printed on corrugated carton packaging.',
    placeholder: '14 digits',
  },
  {
    id: 'codabar',
    name: 'Codabar (Libraries & Blood Banks)',
    defaultVal: 'A12345678B',
    description: 'Character set includes digits 0-9 and delimiters A, B, C, D at start and end.',
    placeholder: 'A...B with digits inside',
  },
];

export default function BarcodeGeneratorTool() {
  const config = getConverterConfig('barcode-generator');

  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [value, setValue] = useState<string>('NEXVERT-2026');
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(100);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [margin, setMargin] = useState<number>(10);
  const [lineColor, setLineColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Outputs
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Switch format and update default text if appropriate
  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat);
    const preset = BARCODE_FORMATS.find((f) => f.id === newFormat);
    if (preset) {
      setValue(preset.defaultVal);
    }
  };

  // Render Barcode
  useEffect(() => {
    let isCancelled = false;

    if (!value.trim()) {
      setError('Please enter a value to generate a barcode.');
      setPngBlob(null);
      setSvgString(null);
      return;
    }

    setError(null);

    const renderBarcode = async () => {
      try {
        const JsBarcode = (await import('jsbarcode')).default;

        // 1. Render to SVG
        const svgElem = svgRef.current;
        if (svgElem) {
          JsBarcode(svgElem, value, {
            format,
            width: barWidth,
            height: barHeight,
            displayValue,
            fontSize,
            margin,
            lineColor,
            background: bgColor,
            valid: (valid) => {
              if (!valid && !isCancelled) {
                setError(`The input "${value}" is invalid for ${format} specifications.`);
              }
            },
          });

          if (!isCancelled) {
            const serializer = new XMLSerializer();
            const str = serializer.serializeToString(svgElem);
            setSvgString(str);
          }
        }

        // 2. Render to Canvas for PNG export
        const canvas = canvasRef.current;
        if (canvas) {
          JsBarcode(canvas, value, {
            format,
            width: barWidth,
            height: barHeight,
            displayValue,
            fontSize,
            margin,
            lineColor,
            background: bgColor,
          });

          if (!isCancelled) {
            canvas.toBlob((blob) => {
              if (!isCancelled && blob) {
                setPngBlob(blob);
              }
            }, 'image/png');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || `Failed to encode "${value}" in ${format} format.`);
          setPngBlob(null);
          setSvgString(null);
        }
      }
    };

    renderBarcode();

    return () => {
      isCancelled = true;
    };
  }, [format, value, barWidth, barHeight, displayValue, fontSize, margin, lineColor, bgColor]);

  // Download PNG
  const handleDownloadPng = () => {
    if (!pngBlob) return;
    const url = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format}-${value.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format}-${value.replace(/[^a-zA-Z0-9_-]/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!pngBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('ClipboardItem unavailable');
      }
    } catch {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedPreset = BARCODE_FORMATS.find((f) => f.id === format);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Symbology / Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Barcode Symbology (Standard)
              </label>
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as BarcodeFormat)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              >
                {BARCODE_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {selectedPreset && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  {selectedPreset.description}
                </p>
              )}
            </div>

            {/* Input Value */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Data / Code to Encode
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={selectedPreset?.placeholder || 'Enter value'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Style & Geometry Controls */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Dimensions &amp; Typography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Bar Width
                  </label>
                  <span className="text-xs font-mono text-slate-500">{barWidth} px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Bar Height
                  </label>
                  <span className="text-xs font-mono text-slate-500">{barHeight} px</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={160}
                  step={5}
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-2">
                  <input
                    type="checkbox"
                    checked={displayValue}
                    onChange={(e) => setDisplayValue(e.target.checked)}
                    className="rounded-sm text-red-600 focus:ring-red-500"
                  />
                  <span>Show Text Label Below Bars</span>
                </label>
              </div>

              {displayValue && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Font Size
                    </label>
                    <span className="text-xs font-mono text-slate-500">{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={28}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Line Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Barcode & Export */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Live Barcode Preview
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Vector SVG</span>
              </span>
            </div>

            {/* Render Container */}
            <div className="w-full min-h-[160px] p-6 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center overflow-x-auto shadow-inner">
              <svg ref={svgRef} className="max-w-full h-auto" />
              {/* Hidden canvas for exact pixel PNG export */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Real Honest Metrics */}
            {pngBlob && (
              <div className="w-full mt-4 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400">
                <span>Symbology: {format}</span>
                <span>PNG: {formatBytes(pngBlob.size)}</span>
                {svgString && <span>SVG: {formatBytes(new Blob([svgString]).size)}</span>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-5">
              <button
                onClick={handleDownloadPng}
                disabled={!pngBlob || !!error}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!svgString || !!error}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Scalable SVG</span>
              </button>

              <button
                onClick={handleCopyImage}
                disabled={!pngBlob || !!error}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Barcode Image'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Generated barcodes adhere to ISO/IEC 15417 standards. Compatible with retail POS barcode scanners, handheld laser terminals, and mobile scanning apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
