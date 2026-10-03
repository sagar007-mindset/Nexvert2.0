/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Palette,
  Pipette,
  Eye,
  Sparkles,
  ArrowLeftRight,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  FileImage
} from 'lucide-react';

interface ColorToolsProps {
  toolId: string;
}

// Exact Mathematical Color Conversions
function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } | null {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('') + 'ff';
  } else if (clean.length === 4) {
    clean = clean.split('').map((c) => c + c).join('');
  } else if (clean.length === 6) {
    clean += 'ff';
  } else if (clean.length !== 8) {
    return null;
  }

  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;

  const r = (num >> 24) & 255;
  const g = (num >> 16) & 255;
  const b = (num >> 8) & 255;
  const a = Math.round(((num & 255) / 255) * 100) / 100;
  return { r, g, b, a };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  const k = Math.min(c, m, y);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

// W3C WCAG 2.1 Luminance Formula
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Math.round(((brightest + 0.05) / (darkest + 0.05)) * 100) / 100;
}

// K-Means Color Clustering for Palette Extraction
function extractKMeansPalette(pixels: Uint8ClampedArray, k: number, maxIterations = 10): { hex: string; r: number; g: number; b: number; count: number; percentage: number }[] {
  const step = Math.max(1, Math.floor(pixels.length / (4 * 5000))); // sample up to 5000 pixels
  const samples: [number, number, number][] = [];

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const alpha = pixels[i + 3];
    if (alpha > 128) {
      samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }
  }

  if (samples.length === 0) return [];

  // Initialize centroids with evenly spaced samples
  let centroids: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i / k) * samples.length);
    centroids.push([...samples[idx]]);
  }

  const clusters: number[] = new Array(samples.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign samples to nearest centroid
    for (let i = 0; i < samples.length; i++) {
      const [r, g, b] = samples[i];
      let minDist = Infinity;
      let closestCentroid = 0;

      for (let c = 0; c < k; c++) {
        const [cr, cg, cb] = centroids[c];
        const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = c;
        }
      }
      clusters[i] = closestCentroid;
    }

    // Recompute centroids
    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < samples.length; i++) {
      const c = clusters[i];
      sums[c][0] += samples[i][0];
      sums[c][1] += samples[i][1];
      sums[c][2] += samples[i][2];
      counts[c]++;
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        centroids[c] = [
          Math.round(sums[c][0] / counts[c]),
          Math.round(sums[c][1] / counts[c]),
          Math.round(sums[c][2] / counts[c])
        ];
      }
    }
  }

  // Count final assignments
  const finalCounts = new Array(k).fill(0);
  for (const c of clusters) {
    finalCounts[c]++;
  }

  const total = samples.length;
  const result = centroids.map(([r, g, b], idx) => {
    const count = finalCounts[idx];
    return {
      hex: rgbToHex(r, g, b),
      r,
      g,
      b,
      count,
      percentage: Math.round((count / total) * 1000) / 10
    };
  });

  return result.sort((a, b) => b.percentage - a.percentage);
}

export default function ColorTools({ toolId }: ColorToolsProps) {
  // Color Converter States
  const [currentColor, setCurrentColor] = useState<string>('#dc2626');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Contrast Checker States
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#dc2626');

  // Palette Extractor States
  const [paletteImage, setPaletteImage] = useState<string | null>(null);
  const [paletteColorsCount, setPaletteColorsCount] = useState<number>(6);
  const [extractedPalette, setExtractedPalette] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gradient Generator States
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [gradientStops, setGradientStops] = useState<{ color: string; position: number }[]>([
    { color: '#dc2626', position: 0 },
    { color: '#ea580c', position: 50 },
    { color: '#fbbf24', position: 100 }
  ]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Converted formats for active currentColor
  const colorData = useMemo(() => {
    if (toolId !== 'color-converter') return null;
    const rgb = hexToRgb(currentColor);
    if (!rgb) return null;

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    return {
      hex,
      rgbStr: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgbaStr: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
      hslStr: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsvStr: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmykStr: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      rgb,
      hsl,
      hsv,
      cmyk
    };
  }, [currentColor, toolId]);

  // Contrast Ratio Calculations
  const contrastData = useMemo(() => {
    if (toolId !== 'contrast-checker') return null;
    const fgRgb = hexToRgb(fgColor);
    const bgRgb = hexToRgb(bgColor);
    if (!fgRgb || !bgRgb) return null;

    const ratio = getContrastRatio(fgRgb, bgRgb);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaaNormal: ratio >= 7.0,
      aaLarge: ratio >= 3.0,
      aaaLarge: ratio >= 4.5,
      components: ratio >= 3.0
    };
  }, [fgColor, bgColor, toolId]);

  // Palette image processor
  const handlePaletteImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPaletteImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Downscale for performance if large
        const maxDim = 300;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const palette = extractKMeansPalette(imageData.data, paletteColorsCount);
        setExtractedPalette(palette);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Re-run palette if count changes
  useEffect(() => {
    if (paletteImage && toolId === 'color-palette-extractor') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const maxDim = 300;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const palette = extractKMeansPalette(imageData.data, paletteColorsCount);
        setExtractedPalette(palette);
      };
      img.src = paletteImage;
    }
  }, [paletteColorsCount, paletteImage, toolId]);

  // Gradient CSS String
  const gradientCss = useMemo(() => {
    if (toolId !== 'gradient-generator') return '';
    const sorted = [...gradientStops].sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${stopsStr})`;
    }
    return `radial-gradient(circle, ${stopsStr})`;
  }, [gradientType, gradientAngle, gradientStops, toolId]);

  return (
    <div className="space-y-4">
      {/* TOOL 1: COLOR CONVERTER */}
      {toolId === 'color-converter' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-16 h-16 rounded-xl border-0 cursor-pointer p-0 bg-transparent shrink-0 shadow-xs"
            />
            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Hex or CSS Color
              </label>
              <input
                type="text"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                placeholder="#dc2626"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
            {colorData && (
              <div
                className="w-full sm:w-32 h-16 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-inner"
                style={{ backgroundColor: colorData.hex }}
              />
            )}
          </div>

          {colorData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'HEX', value: colorData.hex },
                { label: 'RGB', value: colorData.rgbStr },
                { label: 'RGBA', value: colorData.rgbaStr },
                { label: 'HSL', value: colorData.hslStr },
                { label: 'HSV', value: colorData.hsvStr },
                { label: 'CMYK', value: colorData.cmykStr }
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.label)}
                    className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {copiedKey === item.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: CONTRAST CHECKER */}
      {toolId === 'contrast-checker' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            {/* Foreground */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">Foreground (Text)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
                />
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Background</span>
                <button
                  onClick={() => {
                    const temp = fgColor;
                    setFgColor(bgColor);
                    setBgColor(temp);
                  }}
                  className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Contrast Score Card */}
          {contrastData && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Contrast Ratio</span>
                <div className="text-4xl font-display font-black text-slate-900 dark:text-white mt-1">
                  {contrastData.ratio}:1
                </div>
              </div>

              {/* WCAG Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center space-x-2">
                  {contrastData.aaNormal ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">AA Normal</div>
                    <div className="text-[10px] text-slate-400">&ge; 4.5:1</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center space-x-2">
                  {contrastData.aaaNormal ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">AAA Normal</div>
                    <div className="text-[10px] text-slate-400">&ge; 7.0:1</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center space-x-2">
                  {contrastData.aaLarge ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">AA Large Text</div>
                    <div className="text-[10px] text-slate-400">&ge; 3.0:1</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center space-x-2">
                  {contrastData.aaaLarge ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">AAA Large Text</div>
                    <div className="text-[10px] text-slate-400">&ge; 4.5:1</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center space-x-2 sm:col-span-2 md:col-span-1">
                  {contrastData.components ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">UI Controls</div>
                    <div className="text-[10px] text-slate-400">&ge; 3.0:1</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Sample */}
          <div
            className="p-6 rounded-2xl transition-all shadow-inner"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: fgColor }}>
              Live Sample Heading (Large Text)
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: fgColor }}>
              This is standard body text previewing how your chosen foreground color reads against the background in compliance with W3C WCAG 2.1 accessibility guidelines.
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-xs font-bold border"
              style={{ borderColor: fgColor, color: fgColor }}
            >
              UI Button Element
            </button>
          </div>
        </div>
      )}

      {/* TOOL 3: COLOR PALETTE EXTRACTOR */}
      {toolId === 'color-palette-extractor' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handlePaletteImageUpload(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <FileImage className="w-10 h-10 text-slate-400 dark:text-zinc-500 mb-2" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs cursor-pointer mb-1.5"
              >
                Upload Image to Extract Palette
              </button>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Processed 100% locally via Canvas API &amp; K-Means Clustering
              </p>
            </div>
          </div>

          {paletteImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-zinc-300">Palette Size:</span>
                  {[4, 6, 8, 10].map((k) => (
                    <button
                      key={k}
                      onClick={() => setPaletteColorsCount(k)}
                      className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                        paletteColorsCount === k ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                      }`}
                    >
                      {k} Colors
                    </button>
                  ))}
                </div>

                {extractedPalette.length > 0 && (
                  <button
                    onClick={() =>
                      handleCopy(
                        extractedPalette.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n'),
                        'css-vars'
                      )
                    }
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'css-vars' ? 'Copied CSS Variables!' : 'Copy CSS Variables'}
                  </button>
                )}
              </div>

              {/* Palette Swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {extractedPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 group"
                  >
                    <div
                      className="w-full h-16 rounded-lg border border-slate-100 dark:border-zinc-700 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{color.hex}</span>
                      <button
                        onClick={() => handleCopy(color.hex, `pal-${idx}`)}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        {copiedKey === `pal-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {color.percentage}% dominance
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: GRADIENT GENERATOR */}
      {toolId === 'gradient-generator' && (
        <div className="space-y-4">
          {/* Live Gradient Preview Stage */}
          <div
            className="w-full h-44 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all flex items-end p-4"
            style={{ background: gradientCss }}
          >
            <button
              onClick={() => handleCopy(`background: ${gradientCss};`, 'gradient-css')}
              className="px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold hover:bg-black transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-lg"
            >
              {copiedKey === 'gradient-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'gradient-css' ? 'Copied CSS!' : 'Copy CSS'}</span>
            </button>
          </div>

          {/* Generated CSS (visible so it can be reviewed or selected manually) */}
          <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono whitespace-pre-wrap break-all border border-slate-800" aria-label="Generated CSS">
            {`background: ${gradientCss};`}
          </pre>

          {/* Gradient Controls */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Gradient Type
                </label>
                <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs">
                  <button
                    onClick={() => setGradientType('linear')}
                    className={`flex-1 py-1 rounded-md font-bold cursor-pointer ${
                      gradientType === 'linear' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => setGradientType('radial')}
                    className={`flex-1 py-1 rounded-md font-bold cursor-pointer ${
                      gradientType === 'radial' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Radial
                  </button>
                </div>
              </div>

              {gradientType === 'linear' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    <span>Angle: <strong className="text-red-600">{gradientAngle}&deg;</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              )}
            </div>

            {/* Color Stops */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Color Stops ({gradientStops.length})
                </span>
                <button
                  onClick={() =>
                    setGradientStops([
                      ...gradientStops,
                      { color: '#3b82f6', position: 100 }
                    ])
                  }
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 inline-flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Stop</span>
                </button>
              </div>

              <div className="space-y-2">
                {gradientStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-zinc-950">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => {
                        const copy = [...gradientStops];
                        copy[idx].color = e.target.value;
                        setGradientStops(copy);
                      }}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => {
                        const copy = [...gradientStops];
                        copy[idx].color = e.target.value;
                        setGradientStops(copy);
                      }}
                      className="w-24 p-1.5 rounded border border-slate-200 dark:border-zinc-800 font-mono text-xs"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => {
                        const copy = [...gradientStops];
                        copy[idx].position = Number(e.target.value);
                        setGradientStops(copy);
                      }}
                      className="flex-1 accent-red-600"
                    />
                    <span className="text-xs font-mono font-bold w-12 text-right">{stop.position}%</span>
                    {gradientStops.length > 2 && (
                      <button
                        onClick={() => setGradientStops(gradientStops.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
