/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Adjustment Tools Suite:
 * - /brightness-contrast/
 * - /saturation-adjuster/
 * - /grayscale-converter/
 * - /invert-colors/
 * - /sepia-filter/
 * - /blur-image/
 * - /pixelate-image/
 * - /image-sharpener/
 * 
 * 100% Client-side HTML5 Canvas processing.
 * Real convolution kernels, real pixel math, zero fake numbers.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun,
  Contrast,
  Sliders,
  Eye,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  Grid
} from 'lucide-react';
import FileUploadBox from '../FileUploadBox';
import { getConverterConfig } from '../../config/converters.config';
import { formatBytes } from '../../utils/converter';
import {
  loadImageFromFile,
  canvasToBlob,
  applyConvolution3x3
} from '../../utils/imageProcessing';

export type AdjustToolMode =
  | 'brightness-contrast'
  | 'saturation-adjuster'
  | 'grayscale-converter'
  | 'invert-colors'
  | 'sepia-filter'
  | 'blur-image'
  | 'pixelate-image'
  | 'image-sharpener';

interface AdjustToolsProps {
  toolId: AdjustToolMode;
}

export default function AdjustTools({ toolId }: AdjustToolsProps) {
  const config = useMemo(() => {
    return getConverterConfig(toolId) || getConverterConfig('brightness-contrast')!;
  }, [toolId]);

  const [file, setFile] = useState<File | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Adjustment State
  const [brightness, setBrightness] = useState<number>(0); // -100 to +100
  const [contrast, setContrast] = useState<number>(0); // -100 to +100
  const [saturation, setSaturation] = useState<number>(100); // 0 to 300%
  const [grayscale, setGrayscale] = useState<number>(100); // 0 to 100%
  const [invert, setInvert] = useState<number>(100); // 0 to 100%
  const [sepia, setSepia] = useState<number>(100); // 0 to 100%
  const [blurRadius, setBlurRadius] = useState<number>(6); // 1 to 50px
  const [pixelSize, setPixelSize] = useState<number>(12); // 2 to 64px
  const [sharpnessStrength, setSharpnessStrength] = useState<number>(2); // 1 to 5

  // Output Format
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  // Output result
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // Live Canvas Ref for interactive preview
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setSourceImg(null);
      setOrigWidth(0);
      setOrigHeight(0);
      setOutputBlob(null);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      return;
    }

    let isMounted = true;
    setError(null);
    loadImageFromFile(file)
      .then((img) => {
        if (!isMounted) return;
        setSourceImg(img);
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') setOutputFormat('jpeg');
        else if (ext === 'webp') setOutputFormat('webp');
        else setOutputFormat('png');

        // Reset parameters based on active tool
        setBrightness(0);
        setContrast(0);
        setSaturation(150);
        setGrayscale(100);
        setInvert(100);
        setSepia(100);
        setBlurRadius(6);
        setPixelSize(12);
        setSharpnessStrength(2);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading image file.');
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Live Render on Canvas whenever adjustments change
  useEffect(() => {
    if (!sourceImg || !liveCanvasRef.current || origWidth === 0 || origHeight === 0) return;

    const canvas = liveCanvasRef.current;
    // Scale preview size down for smooth live 60fps rendering if image is huge
    const maxPreviewDim = 800;
    const scale = Math.min(1, maxPreviewDim / Math.max(origWidth, origHeight));
    const prevW = Math.round(origWidth * scale);
    const prevH = Math.round(origHeight * scale);

    canvas.width = prevW;
    canvas.height = prevH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply adjustments
    renderAdjustmentToContext(ctx, prevW, prevH, sourceImg);
  }, [
    sourceImg,
    toolId,
    brightness,
    contrast,
    saturation,
    grayscale,
    invert,
    sepia,
    blurRadius,
    pixelSize,
    sharpnessStrength,
    origWidth,
    origHeight
  ]);

  // Common renderer for context (used by live preview and full-res export)
  const renderAdjustmentToContext = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement
  ) => {
    ctx.clearRect(0, 0, w, h);

    if (toolId === 'pixelate-image') {
      // Pixelate: downscale then upscale with smoothing disabled
      const effectiveBlock = Math.max(2, pixelSize);
      const scaledW = Math.max(1, Math.round(w / effectiveBlock));
      const scaledH = Math.max(1, Math.round(h / effectiveBlock));

      const offscreen = document.createElement('canvas');
      offscreen.width = scaledW;
      offscreen.height = scaledH;
      const offCtx = offscreen.getContext('2d')!;
      offCtx.drawImage(img, 0, 0, scaledW, scaledH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, scaledW, scaledH, 0, 0, w, h);
    } else if (toolId === 'image-sharpener') {
      // Draw pristine image first
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);

      // 3x3 Sharpening kernel
      // [ 0, -k, 0, -k, 1+4k, -k, 0, -k, 0 ]
      const k = sharpnessStrength * 0.4;
      const kernel = [
        0, -k, 0,
        -k, 1 + 4 * k, -k,
        0, -k, 0
      ];

      const sharpened = applyConvolution3x3(imgData, kernel, 1, 0);
      ctx.putImageData(sharpened, 0, 0);
    } else {
      // CSS Filter supported canvas rendering
      let filterStr = 'none';

      if (toolId === 'brightness-contrast') {
        const b = 100 + brightness;
        const c = 100 + contrast;
        filterStr = `brightness(${b}%) contrast(${c}%)`;
      } else if (toolId === 'saturation-adjuster') {
        filterStr = `saturate(${saturation}%)`;
      } else if (toolId === 'grayscale-converter') {
        filterStr = `grayscale(${grayscale}%)`;
      } else if (toolId === 'invert-colors') {
        filterStr = `invert(${invert}%)`;
      } else if (toolId === 'sepia-filter') {
        filterStr = `sepia(${sepia}%)`;
      } else if (toolId === 'blur-image') {
        filterStr = `blur(${blurRadius}px)`;
      }

      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';
    }
  };

  // Full-resolution export on user confirmation
  const handleRenderFullResolution = async () => {
    if (!sourceImg || origWidth === 0 || origHeight === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = origWidth;
      fullCanvas.height = origHeight;
      const ctx = fullCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');

      if (outputFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, origWidth, origHeight);
      }

      renderAdjustmentToContext(ctx, origWidth, origHeight, sourceImg);

      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
      const q = outputFormat === 'png' ? undefined : jpegQuality;

      const blob = await canvasToBlob(fullCanvas, mimeType, q);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error processing adjustment.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !outputUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const suffix = toolId.replace('-adjuster', '').replace('-converter', '').replace('-filter', '');
    const filename = `${baseName}_${suffix}.${ext}`;

    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      <FileUploadBox
        config={config}
        selectedFile={file}
        onFileSelect={(f) => setFile(f)}
        error={error}
        onError={(err) => setError(err)}
      />

      {sourceImg && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 dark:text-white">{file?.name}</span>
              <span>&bull;</span>
              <span>{formatBytes(file?.size || 0)}</span>
            </div>
            <div className="bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-mono text-[11px]">
              <span>Real Dimensions: </span>
              <strong className="text-slate-900 dark:text-white">{origWidth} &times; {origHeight} px</strong>
            </div>
          </div>

          {/* SLIDERS PER TOOL */}
          <div className="space-y-4">
            {toolId === 'brightness-contrast' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                    <span className="font-bold flex items-center space-x-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Brightness</span>
                    </span>
                    <span className="font-mono">{brightness > 0 ? `+${brightness}` : brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                    <span className="font-bold flex items-center space-x-1">
                      <Contrast className="w-3.5 h-3.5 text-blue-500" />
                      <span>Contrast</span>
                    </span>
                    <span className="font-mono">{contrast > 0 ? `+${contrast}` : contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            )}

            {toolId === 'saturation-adjuster' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Color Saturation</span>
                  <span className="font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {toolId === 'grayscale-converter' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Grayscale Intensity</span>
                  <span className="font-mono">{grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayscale}
                  onChange={(e) => setGrayscale(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {toolId === 'invert-colors' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Invert Intensity</span>
                  <span className="font-mono">{invert}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={invert}
                  onChange={(e) => setInvert(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {toolId === 'sepia-filter' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Sepia Tone Intensity</span>
                  <span className="font-mono">{sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sepia}
                  onChange={(e) => setSepia(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {toolId === 'blur-image' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Blur Radius (ctx.filter blur)</span>
                  <span className="font-mono">{blurRadius}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {toolId === 'pixelate-image' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Pixel Block Size</span>
                  <span className="font-mono">{pixelSize}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="48"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <p className="text-[11px] text-slate-500">
                  Downscales pixels and re-renders with canvas image smoothing disabled for crisp retro mosaic blocks.
                </p>
              </div>
            )}

            {toolId === 'image-sharpener' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Sharpening Strength</span>
                  <span className="font-mono">Level {sharpnessStrength}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={sharpnessStrength}
                  onChange={(e) => setSharpnessStrength(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <p className="text-[11px] text-slate-500">
                  Direct 3&times;3 spatial high-pass convolution kernel over raw pixel buffers.
                </p>
              </div>
            )}
          </div>

          {/* LIVE CANVAS PREVIEW */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Real-Time Canvas Preview:</span>
            </span>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-950 p-2 flex items-center justify-center overflow-hidden min-h-[260px]">
              <canvas
                ref={liveCanvasRef}
                className="max-h-[360px] w-auto max-w-full rounded shadow-md object-contain"
              />
            </div>
          </div>

          {/* Output Format Settings */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Format:</span>
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-mono font-bold cursor-pointer transition-colors ${
                    outputFormat === fmt
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt}
                </button>
              ))}
            </div>

            {outputFormat !== 'png' && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 dark:text-zinc-400">Quality:</span>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={jpegQuality}
                  onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <span className="font-mono font-bold w-8 text-right">{Math.round(jpegQuality * 100)}%</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRenderFullResolution}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Full Resolution ({origWidth} &times; {origHeight} px)...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Process &amp; Prepare Download</span>
                </>
              )}
            </button>
          </div>

          {/* Result Download Card */}
          {outputBlob && outputUrl && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Image Adjusted &amp; Ready
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                    {origWidth} &times; {origHeight} px &bull; {formatBytes(outputBlob.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
