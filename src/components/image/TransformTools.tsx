/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Transform Tools Suite:
 * - /resize-image/
 * - /crop-image/
 * - /rotate-image/
 * - /flip-image/
 * - /image-enlarger/
 * 
 * 100% Client-side HTML5 Canvas processing.
 * Real dimensions, real bytes, zero fabricated numbers.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Maximize2,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Lock,
  Unlock,
  Sliders,
  AlertCircle,
  Check,
  ZoomIn,
  RefreshCw,
  Info
} from 'lucide-react';
import FileUploadBox from '../FileUploadBox';
import { getConverterConfig } from '../../config/converters.config';
import { formatBytes } from '../../utils/converter';
import { loadImageFromFile, canvasToBlob } from '../../utils/imageProcessing';

export type TransformToolMode = 'resize-image' | 'crop-image' | 'rotate-image' | 'flip-image' | 'image-enlarger';

interface TransformToolsProps {
  toolId: TransformToolMode;
}

export default function TransformTools({ toolId }: TransformToolsProps) {
  const config = useMemo(() => {
    return getConverterConfig(toolId) || getConverterConfig('resize-image')!;
  }, [toolId]);

  const [file, setFile] = useState<File | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Resize State
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.9);

  // Crop State
  // normalized crop coordinates (0 to 1)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8
  });
  const [cropPreset, setCropPreset] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');
  const [isDraggingCrop, setIsDraggingCrop] = useState<string | null>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  // Rotate State
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Flip State
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Enlarge State
  const [enlargeScale, setEnlargeScale] = useState<number>(2);

  // Output State
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number } | null>(null);

  // Canvas ref for live rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setSourceImg(null);
      setOrigWidth(0);
      setOrigHeight(0);
      setOutputBlob(null);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      setOutputDimensions(null);
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
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);

        // Auto choose format based on original file extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') {
          setOutputFormat('jpeg');
        } else if (ext === 'webp') {
          setOutputFormat('webp');
        } else {
          setOutputFormat('png');
        }

        // Reset crop box
        setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
        setRotationAngle(0);
        setFlipH(false);
        setFlipV(false);
        setEnlargeScale(2);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading image file.');
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Handle Dimension Inputs with Aspect Ratio Lock
  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (maintainAspect && origWidth > 0) {
      const calculated = Math.round((val / origWidth) * origHeight);
      setTargetHeight(calculated);
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (maintainAspect && origHeight > 0) {
      const calculated = Math.round((val / origHeight) * origWidth);
      setTargetWidth(calculated);
    }
  };

  const applyPercentPreset = (percent: number) => {
    if (origWidth > 0 && origHeight > 0) {
      const w = Math.round((origWidth * percent) / 100);
      const h = Math.round((origHeight * percent) / 100);
      setTargetWidth(w);
      setTargetHeight(h);
    }
  };

  // Crop Presets
  const applyCropPreset = (preset: 'free' | '1:1' | '4:3' | '16:9' | '9:16') => {
    setCropPreset(preset);
    if (preset === 'free' || origWidth === 0 || origHeight === 0) return;

    let targetRatio = 1;
    if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;
    else if (preset === '9:16') targetRatio = 9 / 16;

    const imgRatio = origWidth / origHeight;
    let newW = 0.8;
    let newH = 0.8;

    if (imgRatio > targetRatio) {
      newH = 0.8;
      newW = (newH * origHeight * targetRatio) / origWidth;
    } else {
      newW = 0.8;
      newH = (newW * origWidth) / (origHeight * targetRatio);
    }

    newW = Math.min(1, Math.max(0.1, newW));
    newH = Math.min(1, Math.max(0.1, newH));
    const newX = (1 - newW) / 2;
    const newY = (1 - newH) / 2;

    setCropRect({ x: newX, y: newY, width: newW, height: newH });
  };

  // Perform Transformation via Canvas
  const processTransformation = async () => {
    if (!sourceImg || origWidth === 0 || origHeight === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');

      let finalW = origWidth;
      let finalH = origHeight;

      if (toolId === 'resize-image') {
        finalW = Math.max(1, Math.round(targetWidth));
        finalH = Math.max(1, Math.round(targetHeight));
        canvas.width = finalW;
        canvas.height = finalH;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalW, finalH);
        }

        ctx.drawImage(sourceImg, 0, 0, finalW, finalH);
      } else if (toolId === 'image-enlarger') {
        finalW = Math.round(origWidth * enlargeScale);
        finalH = Math.round(origHeight * enlargeScale);
        canvas.width = finalW;
        canvas.height = finalH;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalW, finalH);
        }

        ctx.drawImage(sourceImg, 0, 0, finalW, finalH);
      } else if (toolId === 'crop-image') {
        const cropX = Math.round(cropRect.x * origWidth);
        const cropY = Math.round(cropRect.y * origHeight);
        finalW = Math.max(1, Math.round(cropRect.width * origWidth));
        finalH = Math.max(1, Math.round(cropRect.height * origHeight));

        canvas.width = finalW;
        canvas.height = finalH;

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalW, finalH);
        }

        ctx.drawImage(
          sourceImg,
          cropX,
          cropY,
          finalW,
          finalH,
          0,
          0,
          finalW,
          finalH
        );
      } else if (toolId === 'rotate-image') {
        const rad = (rotationAngle * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        finalW = Math.round(origWidth * cos + origHeight * sin);
        finalH = Math.round(origWidth * sin + origHeight * cos);

        canvas.width = finalW;
        canvas.height = finalH;

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalW, finalH);
        }

        ctx.translate(finalW / 2, finalH / 2);
        ctx.rotate(rad);
        ctx.drawImage(sourceImg, -origWidth / 2, -origHeight / 2);
      } else if (toolId === 'flip-image') {
        finalW = origWidth;
        finalH = origHeight;
        canvas.width = finalW;
        canvas.height = finalH;

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalW, finalH);
        }

        ctx.save();
        ctx.translate(flipH ? finalW : 0, flipV ? finalH : 0);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(sourceImg, 0, 0);
        ctx.restore();
      }

      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
      const q = outputFormat === 'png' ? undefined : jpegQuality;

      const blob = await canvasToBlob(canvas, mimeType, q);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setOutputDimensions({ width: finalW, height: finalH });
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error executing transformation on canvas.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !outputUrl || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const suffix = toolId.replace('-image', '');
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

      {/* Input File Box */}
      <FileUploadBox
        config={config}
        selectedFile={file}
        onFileSelect={(f) => setFile(f)}
        error={error}
        onError={(err) => setError(err)}
      />

      {sourceImg && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          {/* File Real Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 dark:text-white">{file?.name}</span>
              <span>&bull;</span>
              <span>{formatBytes(file?.size || 0)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-mono text-[11px]">
              <span>Source Dimensions:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{origWidth} &times; {origHeight} px</strong>
            </div>
          </div>

          {/* TOOL SPECIFIC CONTROLS */}

          {/* 1. RESIZE IMAGE */}
          {toolId === 'resize-image' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Target Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetWidth || ''}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Target Height (px)</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight || ''}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMaintainAspect(!maintainAspect)}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    maintainAspect
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {maintainAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Lock Aspect Ratio</span>
                </button>

                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400 mr-1">Presets:</span>
                  {[25, 50, 75, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPercentPreset(pct)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CROP IMAGE */}
          {toolId === 'crop-image' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Aspect Ratio Preset:</span>
                <div className="flex flex-wrap gap-1">
                  {(['free', '1:1', '4:3', '16:9', '9:16'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applyCropPreset(p)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        cropPreset === p
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Crop Interface */}
              <div className="relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 select-none">
                <div className="relative max-h-[380px] inline-block">
                  <img
                    ref={previewImgRef}
                    src={sourceImg.src}
                    alt="Crop source"
                    className="max-h-[380px] w-auto block object-contain pointer-events-none"
                  />
                  {/* Draggable Crop Box Overlay */}
                  <div
                    ref={cropBoxRef}
                    className="absolute border-2 border-red-500 bg-red-500/15 cursor-move shadow-2xl"
                    style={{
                      left: `${cropRect.x * 100}%`,
                      top: `${cropRect.y * 100}%`,
                      width: `${cropRect.width * 100}%`,
                      height: `${cropRect.height * 100}%`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCropX = cropRect.x;
                      const startCropY = cropRect.y;

                      const onMouseMove = (moveEv: MouseEvent) => {
                        const rect = previewImgRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        const deltaX = (moveEv.clientX - startX) / rect.width;
                        const deltaY = (moveEv.clientY - startY) / rect.height;

                        const newX = Math.min(1 - cropRect.width, Math.max(0, startCropX + deltaX));
                        const newY = Math.min(1 - cropRect.height, Math.max(0, startCropY + deltaY));
                        setCropRect((prev) => ({ ...prev, x: newX, y: newY }));
                      };

                      const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                      };

                      window.addEventListener('mousemove', onMouseMove);
                      window.addEventListener('mouseup', onMouseUp);
                    }}
                  >
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-mono px-1 py-0.5 pointer-events-none">
                      {Math.round(cropRect.width * origWidth)} &times; {Math.round(cropRect.height * origHeight)} px
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Drag the highlighted red box to frame your crop area.
              </p>
            </div>
          )}

          {/* 3. ROTATE IMAGE */}
          {toolId === 'rotate-image' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Quick Angles:</span>
                <div className="flex space-x-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setRotationAngle((prev) => (prev + deg) % 360)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>+{deg}&deg;</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRotationAngle(0)}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span>Free Angle Slider:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{rotationAngle}&deg;</strong>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[220px]">
                <img
                  src={sourceImg.src}
                  alt="Rotated preview"
                  className="max-h-[200px] w-auto transition-transform duration-100"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                />
              </div>
            </div>
          )}

          {/* 4. FLIP IMAGE */}
          {toolId === 'flip-image' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    flipH
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip Horizontal (X-Axis)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    flipV
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span>Flip Vertical (Y-Axis)</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[220px]">
                <img
                  src={sourceImg.src}
                  alt="Flip preview"
                  className="max-h-[200px] w-auto transition-transform duration-150"
                  style={{
                    transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
                  }}
                />
              </div>
            </div>
          )}

          {/* 5. IMAGE ENLARGER */}
          {toolId === 'image-enlarger' && (
            <div className="space-y-4">
              {/* Honest Notice as mandated */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Honest Resolution Notice:</p>
                  <p className="text-[11px] leading-relaxed">
                    This tool uses HTML5 Canvas bicubic interpolation to scale image pixels. It does not invent new details using AI generation, so enlarging lower-resolution images will look softer than the original.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Enlarge Multiplier:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {[1.5, 2, 3, 4].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setEnlargeScale(mult)}
                      className={`py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                        enlargeScale === mult
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {mult}&times; ({Math.round(origWidth * mult)} &times; {Math.round(origHeight * mult)} px)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Output Format & Quality Settings */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Output Format:</span>
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
                  min="0.2"
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
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={processTransformation}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Canvas...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Render Output Image</span>
                </>
              )}
            </button>
          </div>

          {/* Result Box */}
          {outputBlob && outputUrl && outputDimensions && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Image Rendered Successfully
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                    {outputDimensions.width} &times; {outputDimensions.height} px &bull; {formatBytes(outputBlob.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
