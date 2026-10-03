/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Composite & Creative Tools Suite:
 * - /add-watermark/
 * - /add-border/
 * - /round-corners/
 * - /image-collage/
 * - /meme-generator/
 * - /photo-to-sketch/
 * - /image-color-picker/ (and /color-picker/)
 * 
 * 100% Client-side HTML5 Canvas processing.
 * Real transparency, genuine Impact stroke memes, real Color-Dodge sketch blend.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Sparkles,
  Layers,
  Pipette,
  Copy,
  Check,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  Grid
} from 'lucide-react';
import FileUploadBox from '../FileUploadBox';
import { getConverterConfig } from '../../config/converters.config';
import { formatBytes } from '../../utils/converter';
import {
  loadImageFromFile,
  canvasToBlob,
  applyPhotoToSketch,
  rgbToHex,
  rgbToHsl
} from '../../utils/imageProcessing';

export type CompositeToolMode =
  | 'add-watermark'
  | 'add-border'
  | 'round-corners'
  | 'image-collage'
  | 'meme-generator'
  | 'photo-to-sketch'
  | 'image-color-picker'
  | 'color-picker';

interface CompositeToolsProps {
  toolId: CompositeToolMode;
}

export default function CompositeTools({ toolId }: CompositeToolsProps) {
  const normalizedMode = toolId === 'color-picker' ? 'image-color-picker' : toolId;
  const config = useMemo(() => {
    return getConverterConfig(normalizedMode) || getConverterConfig('add-watermark')!;
  }, [normalizedMode]);

  const [file, setFile] = useState<File | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Output State
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // 1. Watermark State
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(48);
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.6);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(-25);
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'bottom-right' | 'tile'>('center');
  const [watermarkImgFile, setWatermarkImgFile] = useState<File | null>(null);
  const [watermarkImg, setWatermarkImg] = useState<HTMLImageElement | null>(null);

  // 2. Border State
  const [borderWidth, setBorderWidth] = useState<number>(24);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [borderCornerRadius, setBorderCornerRadius] = useState<number>(16);

  // 3. Round Corners State
  const [cornerRadius, setCornerRadius] = useState<number>(40);

  // 4. Collage State
  const [collageGrid, setCollageGrid] = useState<'2x2' | '3x3' | '1x2' | '2x1'>('2x2');
  const [collageImages, setCollageImages] = useState<{ id: string; img: HTMLImageElement; file: File }[]>([]);
  const [collagePadding, setCollagePadding] = useState<number>(12);
  const [collageBgColor, setCollageBgColor] = useState<string>('#ffffff');

  // 5. Meme State
  const [memeTopText, setMemeTopText] = useState<string>('WHEN YOU WRITE HONEST CODE');
  const [memeBottomText, setMemeBottomText] = useState<string>('AND EVERYTHING ACTUALLY WORKS');
  const [memeFontSize, setMemeFontSize] = useState<number>(54);

  // 6. Photo to Sketch State
  const [sketchBlur, setSketchBlur] = useState<number>(8);
  const [sketchContrast, setSketchContrast] = useState<number>(1.2);

  // 7. Color Picker State
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string; x: number; y: number } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<string[]>([]);

  // Canvas Refs
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorPickerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load Main Image
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

        // Adjust font sizes proportionally to real image dimensions
        const scaleFactor = Math.max(1, Math.round(img.naturalWidth / 800));
        setWatermarkFontSize(36 * scaleFactor);
        setMemeFontSize(44 * scaleFactor);
        setBorderWidth(Math.round(img.naturalWidth * 0.03));
        setCornerRadius(Math.round(img.naturalWidth * 0.05));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading image file.');
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Load watermark image if chosen
  useEffect(() => {
    if (!watermarkImgFile) {
      setWatermarkImg(null);
      return;
    }
    loadImageFromFile(watermarkImgFile).then(setWatermarkImg).catch(() => {});
  }, [watermarkImgFile]);

  // Render on Preview Canvas
  useEffect(() => {
    if (normalizedMode === 'image-collage') {
      renderCollagePreview();
      return;
    }

    if (!sourceImg || !liveCanvasRef.current || origWidth === 0 || origHeight === 0) return;
    const canvas = liveCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use responsive preview bounds
    const maxPrev = 700;
    const scale = Math.min(1, maxPrev / Math.max(origWidth, origHeight));
    const pw = Math.round(origWidth * scale);
    const ph = Math.round(origHeight * scale);

    canvas.width = pw;
    canvas.height = ph;

    renderToolEffect(ctx, pw, ph, sourceImg, scale);
  }, [
    sourceImg,
    normalizedMode,
    origWidth,
    origHeight,
    watermarkType,
    watermarkText,
    watermarkFontSize,
    watermarkColor,
    watermarkOpacity,
    watermarkRotation,
    watermarkPosition,
    watermarkImg,
    borderWidth,
    borderColor,
    borderCornerRadius,
    cornerRadius,
    memeTopText,
    memeBottomText,
    memeFontSize,
    sketchBlur,
    sketchContrast
  ]);

  // Render Color Picker Canvas at exact resolution
  useEffect(() => {
    if (normalizedMode !== 'image-color-picker' || !sourceImg || !colorPickerCanvasRef.current) return;
    const canvas = colorPickerCanvasRef.current;
    canvas.width = origWidth;
    canvas.height = origHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(sourceImg, 0, 0);
  }, [sourceImg, normalizedMode, origWidth, origHeight]);

  const renderCollagePreview = () => {
    if (!liveCanvasRef.current) return;
    const canvas = liveCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseSize = 800;
    canvas.width = baseSize;
    canvas.height = baseSize;

    ctx.fillStyle = collageBgColor;
    ctx.fillRect(0, 0, baseSize, baseSize);

    let rows = 2;
    let cols = 2;
    if (collageGrid === '3x3') {
      rows = 3;
      cols = 3;
    } else if (collageGrid === '1x2') {
      rows = 1;
      cols = 2;
    } else if (collageGrid === '2x1') {
      rows = 2;
      cols = 1;
    }

    const totalCells = rows * cols;
    const cellW = (baseSize - collagePadding * (cols + 1)) / cols;
    const cellH = (baseSize - collagePadding * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = collagePadding + c * (cellW + collagePadding);
        const y = collagePadding + r * (cellH + collagePadding);

        if (idx < collageImages.length) {
          const img = collageImages[idx].img;
          // Cover fit cell
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const cellRatio = cellW / cellH;
          let sw = img.naturalWidth;
          let sh = img.naturalHeight;
          let sx = 0;
          let sy = 0;

          if (imgRatio > cellRatio) {
            sw = img.naturalHeight * cellRatio;
            sx = (img.naturalWidth - sw) / 2;
          } else {
            sh = img.naturalWidth / cellRatio;
            sy = (img.naturalHeight - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
        } else {
          // Empty slot placeholder
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Drop Slot #${idx + 1}`, x + cellW / 2, y + cellH / 2);
        }
      }
    }
  };

  const renderToolEffect = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement,
    scale: number
  ) => {
    ctx.clearRect(0, 0, w, h);

    if (normalizedMode === 'add-border') {
      const bW = Math.round(borderWidth * scale);
      const bR = Math.round(borderCornerRadius * scale);

      // Draw background border fill
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, w, h);

      // Clip inner image with rounded rect
      const innerX = bW;
      const innerY = bW;
      const innerW = Math.max(1, w - bW * 2);
      const innerH = Math.max(1, h - bW * 2);

      ctx.save();
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(innerX, innerY, innerW, innerH, bR);
      } else {
        ctx.rect(innerX, innerY, innerW, innerH);
      }
      ctx.clip();
      ctx.drawImage(img, innerX, innerY, innerW, innerH);
      ctx.restore();
    } else if (normalizedMode === 'round-corners') {
      const r = Math.round(cornerRadius * scale);
      ctx.save();
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(0, 0, w, h, r);
      } else {
        ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      }
      ctx.clip();
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    } else if (normalizedMode === 'meme-generator') {
      ctx.drawImage(img, 0, 0, w, h);

      const fSize = Math.max(14, Math.round(memeFontSize * scale));
      ctx.font = `900 ${fSize}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, Math.round(fSize * 0.12));
      ctx.lineJoin = 'round';

      if (memeTopText.trim()) {
        ctx.textBaseline = 'top';
        const topY = Math.round(16 * scale);
        ctx.strokeText(memeTopText.toUpperCase(), w / 2, topY, w - 24);
        ctx.fillText(memeTopText.toUpperCase(), w / 2, topY, w - 24);
      }

      if (memeBottomText.trim()) {
        ctx.textBaseline = 'bottom';
        const botY = h - Math.round(16 * scale);
        ctx.strokeText(memeBottomText.toUpperCase(), w / 2, botY, w - 24);
        ctx.fillText(memeBottomText.toUpperCase(), w / 2, botY, w - 24);
      }
    } else if (normalizedMode === 'add-watermark') {
      ctx.drawImage(img, 0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = watermarkOpacity;

      if (watermarkType === 'text') {
        const fSize = Math.max(12, Math.round(watermarkFontSize * scale));
        ctx.font = `bold ${fSize}px sans-serif`;
        ctx.fillStyle = watermarkColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (watermarkPosition === 'center') {
          ctx.translate(w / 2, h / 2);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
        } else if (watermarkPosition === 'bottom-right') {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(watermarkText, w - 20, h - 20);
        } else if (watermarkPosition === 'tile') {
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          const stepX = 220 * scale;
          const stepY = 140 * scale;
          for (let x = -w; x < w * 2; x += stepX) {
            for (let y = -h; y < h * 2; y += stepY) {
              ctx.fillText(watermarkText, x, y);
            }
          }
        }
      } else if (watermarkType === 'image' && watermarkImg) {
        const wmRatio = watermarkImg.naturalWidth / watermarkImg.naturalHeight;
        const wmW = Math.round(w * 0.25);
        const wmH = Math.round(wmW / wmRatio);

        if (watermarkPosition === 'center') {
          ctx.translate(w / 2, h / 2);
          ctx.rotate((watermarkRotation * Math.PI) / 180);
          ctx.drawImage(watermarkImg, -wmW / 2, -wmH / 2, wmW, wmH);
        } else if (watermarkPosition === 'bottom-right') {
          ctx.drawImage(watermarkImg, w - wmW - 20, h - wmH - 20, wmW, wmH);
        } else {
          ctx.drawImage(watermarkImg, w / 2 - wmW / 2, h / 2 - wmH / 2, wmW, wmH);
        }
      }
      ctx.restore();
    } else if (normalizedMode === 'photo-to-sketch') {
      // Draw pristine source to temp canvas
      const tempC = document.createElement('canvas');
      tempC.width = w;
      tempC.height = h;
      const tCtx = tempC.getContext('2d')!;
      tCtx.drawImage(img, 0, 0, w, h);

      const sketchCanvas = applyPhotoToSketch(tempC, Math.round(sketchBlur * scale), sketchContrast);
      ctx.drawImage(sketchCanvas, 0, 0);
    }
  };

  // Color Picker Mouse Interactions
  const handleColorPickerMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorPickerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    setHoverColor({ hex, rgb, x, y });
  };

  const handleColorPickerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoverColor) return;
    const canvas = colorPickerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(hoverColor.x, hoverColor.y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hslObj = rgbToHsl(pixel[0], pixel[1], pixel[2]);
    const hsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;

    setPickedColor({ hex, rgb, hsl });
    if (!colorPalette.includes(hex)) {
      setColorPalette((prev) => [hex, ...prev].slice(0, 12));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Render Full Resolution and Export
  const handleExportFull = async () => {
    if (normalizedMode === 'image-collage') {
      if (collageImages.length === 0) {
        setError('Please upload at least one image for the collage.');
        return;
      }
      setIsProcessing(true);
      try {
        const fullCanvas = document.createElement('canvas');
        const size = 1600;
        fullCanvas.width = size;
        fullCanvas.height = size;
        const ctx = fullCanvas.getContext('2d')!;

        ctx.fillStyle = collageBgColor;
        ctx.fillRect(0, 0, size, size);

        let rows = 2;
        let cols = 2;
        if (collageGrid === '3x3') {
          rows = 3;
          cols = 3;
        } else if (collageGrid === '1x2') {
          rows = 1;
          cols = 2;
        } else if (collageGrid === '2x1') {
          rows = 2;
          cols = 1;
        }

        const pad = Math.round(collagePadding * (size / 800));
        const cellW = (size - pad * (cols + 1)) / cols;
        const cellH = (size - pad * (rows + 1)) / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const x = pad + c * (cellW + pad);
            const y = pad + r * (cellH + pad);

            if (idx < collageImages.length) {
              const img = collageImages[idx].img;
              const imgRatio = img.naturalWidth / img.naturalHeight;
              const cellRatio = cellW / cellH;
              let sw = img.naturalWidth;
              let sh = img.naturalHeight;
              let sx = 0;
              let sy = 0;

              if (imgRatio > cellRatio) {
                sw = img.naturalHeight * cellRatio;
                sx = (img.naturalWidth - sw) / 2;
              } else {
                sh = img.naturalWidth / cellRatio;
                sy = (img.naturalHeight - sh) / 2;
              }

              ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
            }
          }
        }

        const blob = await canvasToBlob(fullCanvas, 'image/jpeg', 0.92);
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const url = URL.createObjectURL(blob);
        setOutputBlob(blob);
        setOutputUrl(url);
        setIsProcessing(false);
      } catch (err: any) {
        setError(err.message || 'Error generating collage.');
        setIsProcessing(false);
      }
      return;
    }

    if (!sourceImg || origWidth === 0 || origHeight === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = origWidth;
      fullCanvas.height = origHeight;
      const ctx = fullCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable.');

      renderToolEffect(ctx, origWidth, origHeight, sourceImg, 1.0);

      // PNG keeps transparency (required for round corners)
      const blob = await canvasToBlob(fullCanvas, 'image/png');

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error executing composite effect.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !outputUrl) return;
    const baseName = file?.name?.substring(0, file.name.lastIndexOf('.')) || 'image';
    const ext = outputBlob.type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${baseName}_${normalizedMode}.${ext}`;

    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Input File Box (except for collage which has multiple slots) */}
      {normalizedMode !== 'image-collage' ? (
        <FileUploadBox
          config={config}
          selectedFile={file}
          onFileSelect={(f) => setFile(f)}
          error={error}
          onError={(err) => setError(err)}
        />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Collage Grid Preset:</span>
            <div className="flex space-x-2">
              {(['2x2', '3x3', '1x2', '2x1'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCollageGrid(g)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    collageGrid === g
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Add Images to Collage ({collageImages.length} added):
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files: File[] = e.target.files ? Array.from(e.target.files) : [];
                const newItems: { id: string; img: HTMLImageElement; file: File }[] = [];
                for (const f of files) {
                  try {
                    const loaded = await loadImageFromFile(f);
                    newItems.push({ id: Math.random().toString(), img: loaded, file: f });
                  } catch (err) {}
                }
                setCollageImages((prev) => [...prev, ...newItems]);
              }}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
            />
          </div>

          {collageImages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {collageImages.map((item, idx) => (
                <div key={item.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                  <img src={item.img.src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCollageImages((prev) => prev.filter((it) => it.id !== item.id))}
                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-600 dark:text-zinc-400 font-bold">Spacing:</span>
              <input
                type="range"
                min="0"
                max="40"
                value={collagePadding}
                onChange={(e) => setCollagePadding(parseInt(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
              />
              <span className="font-mono">{collagePadding}px</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-600 dark:text-zinc-400 font-bold">Background:</span>
              <input
                type="color"
                value={collageBgColor}
                onChange={(e) => setCollageBgColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-300 dark:border-zinc-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Controls & Live Previews */}
      {(sourceImg || normalizedMode === 'image-collage') && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          {/* 1. WATERMARK CONTROLS */}
          {normalizedMode === 'add-watermark' && (
            <div className="space-y-4">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setWatermarkType('text')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    watermarkType === 'text'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkType('image')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    watermarkType === 'image'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  Logo Image Watermark
                </button>
              </div>

              {watermarkType === 'text' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Color</label>
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Choose Watermark Logo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setWatermarkImgFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span>Opacity:</span>
                    <span className="font-mono">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span>Rotation:</span>
                    <span className="font-mono">{watermarkRotation}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={watermarkRotation}
                    onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Position</label>
                  <select
                    value={watermarkPosition}
                    onChange={(e: any) => setWatermarkPosition(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="center">Centered</option>
                    <option value="bottom-right">Bottom Right Corner</option>
                    <option value="tile">Full Diagonal Pattern (Tile)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. BORDER CONTROLS */}
          {normalizedMode === 'add-border' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-bold">Border Width:</span>
                  <span className="font-mono">{borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-bold">Inner Radius:</span>
                  <span className="font-mono">{borderCornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={borderCornerRadius}
                  onChange={(e) => setBorderCornerRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">Border Color:</span>
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 3. ROUND CORNERS CONTROLS */}
          {normalizedMode === 'round-corners' && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span className="font-bold">Corner Radius:</span>
                <span className="font-mono">{cornerRadius}px</span>
              </div>
              <input
                type="range"
                min="5"
                max={Math.round(Math.min(origWidth, origHeight) / 2)}
                value={cornerRadius}
                onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Exports as a true transparent 32-bit PNG file preserving smooth anti-aliased corners.
              </p>
            </div>
          )}

          {/* 4. MEME GENERATOR CONTROLS */}
          {normalizedMode === 'meme-generator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Top Text</label>
                  <input
                    type="text"
                    value={memeTopText}
                    onChange={(e) => setMemeTopText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl uppercase font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Bottom Text</label>
                  <input
                    type="text"
                    value={memeBottomText}
                    onChange={(e) => setMemeBottomText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl uppercase font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-bold">Impact Font Size:</span>
                  <span className="font-mono">{memeFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={memeFontSize}
                  onChange={(e) => setMemeFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 5. PHOTO TO SKETCH CONTROLS */}
          {normalizedMode === 'photo-to-sketch' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-bold">Pencil Blur Radius:</span>
                  <span className="font-mono">{sketchBlur}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={sketchBlur}
                  onChange={(e) => setSketchBlur(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-bold">Graphite Contrast:</span>
                  <span className="font-mono">{sketchContrast.toFixed(1)}&times;</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={sketchContrast}
                  onChange={(e) => setSketchContrast(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 6. COLOR PICKER INTERACTIVE VIEW */}
          {normalizedMode === 'image-color-picker' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Pipette className="w-4 h-4 text-red-500" />
                  <span className="text-slate-600 dark:text-zinc-300">
                    Move your cursor over the image and click any pixel to sample its color.
                  </span>
                </div>
                {hoverColor && (
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-600 shadow-sm"
                      style={{ backgroundColor: hoverColor.hex }}
                    />
                    <span>{hoverColor.hex}</span>
                    <span className="text-slate-400">({hoverColor.x}, {hoverColor.y})</span>
                  </div>
                )}
              </div>

              {/* Pixel Canvas */}
              <div className="relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-auto bg-slate-950 p-2 flex items-center justify-center max-h-[420px] select-none cursor-crosshair">
                <canvas
                  ref={colorPickerCanvasRef}
                  onMouseMove={handleColorPickerMouseMove}
                  onClick={handleColorPickerClick}
                  className="max-h-[380px] w-auto max-w-full rounded shadow object-contain"
                />
              </div>

              {/* Picked Color Card */}
              {pickedColor && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-md border-2 border-white dark:border-zinc-700"
                        style={{ backgroundColor: pickedColor.hex }}
                      />
                      <div>
                        <strong className="text-sm font-mono text-slate-900 dark:text-white block">
                          {pickedColor.hex}
                        </strong>
                        <span className="text-xs text-slate-500 font-mono">{pickedColor.rgb}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { label: 'HEX', val: pickedColor.hex, key: 'hex' },
                      { label: 'RGB', val: pickedColor.rgb, key: 'rgb' },
                      { label: 'HSL', val: pickedColor.hsl, key: 'hsl' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => copyToClipboard(item.val, item.key)}
                        className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-left hover:border-red-500 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] text-slate-400 block">{item.label}</span>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">{item.val}</span>
                        </div>
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Palette history */}
              {colorPalette.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Sampled Color Palette:</span>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((hex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => copyToClipboard(hex, `palette-${idx}`)}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm transition-transform hover:scale-110 cursor-pointer relative"
                        style={{ backgroundColor: hex }}
                        title={`Click to copy ${hex}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIVE CANVAS PREVIEW (For all except color-picker) */}
          {normalizedMode !== 'image-color-picker' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Live Render Preview:</span>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-950 p-2 flex items-center justify-center overflow-hidden min-h-[260px]">
                <canvas
                  ref={liveCanvasRef}
                  className="max-h-[360px] w-auto max-w-full rounded shadow-md object-contain"
                />
              </div>
            </div>
          )}

          {/* Action Render Button (for non-color-picker tools) */}
          {normalizedMode !== 'image-color-picker' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportFull}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Output Image...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Render Full Resolution Output</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Download Card */}
          {outputBlob && outputUrl && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Image Generated Successfully
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                    Real File Size: {formatBytes(outputBlob.size)}
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
