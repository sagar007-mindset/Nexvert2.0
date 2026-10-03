/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Undo2,
  Plus,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

interface GeneratorUtilitiesProps {
  toolId: string;
}

export default function GeneratorUtilities({ toolId }: GeneratorUtilitiesProps) {
  switch (toolId) {
    case 'signature-pad':
      return <SignaturePad />;
    case 'invoice-generator':
      return <InvoiceGenerator />;
    case 'favicon-generator':
      return <FaviconGenerator />;
    case 'og-image-generator':
      return <OgImageGenerator />;
    case 'placeholder-image':
      return <PlaceholderImageGenerator />;
    default:
      return <div className="text-sm text-slate-500">Select a valid generator tool.</div>;
  }
}

// -------------------------------------------------------------
// 1. SIGNATURE PAD
// -------------------------------------------------------------
function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0f172a'); // Slate 900
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    const lastState = newHistory.pop();
    setHistory(newHistory);

    if (lastState) {
      ctx.putImageData(lastState, 0, 0);
      if (newHistory.length === 0) setHasDrawn(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const downloadSignature = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let exportCanvas = canvas;
    if (format === 'jpeg') {
      // Create white background canvas
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.drawImage(canvas, 0, 0);
        exportCanvas = bgCanvas;
      }
    }

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = exportCanvas.toDataURL(mime, 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `signature.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Colors */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Ink Color:</span>
          {[
            { label: 'Black', hex: '#0f172a' },
            { label: 'Navy Blue', hex: '#1e3a8a' },
            { label: 'Dark Gray', hex: '#475569' },
            { label: 'Crimson', hex: '#991b1b' }
          ].map((c) => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                color === c.hex ? 'scale-110 border-amber-500' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Thickness:</span>
          <input
            type="range"
            min={1}
            max={8}
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 accent-amber-600 cursor-pointer"
          />
          <span className="text-xs font-semibold">{lineWidth}px</span>
        </div>

        {/* Undo & Clear */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            onClick={handleClear}
            disabled={!hasDrawn}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Surface */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-white border-2 border-dashed border-slate-300 dark:border-zinc-700 shadow-inner overflow-hidden flex flex-col justify-between p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
            <span className="text-sm font-medium">Draw your signature here with mouse or touch</span>
            <span className="text-xs text-slate-300 mt-1">&mdash; Sign on the line below &mdash;</span>
          </div>
        )}

        <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 dark:border-slate-300 pointer-events-none" />
      </div>

      {/* Export Options */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => downloadSignature('png')}
          disabled={!hasDrawn}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Transparent PNG</span>
        </button>
        <button
          onClick={() => downloadSignature('jpeg')}
          disabled={!hasDrawn}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download JPEG (White BG)</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. INVOICE GENERATOR (REAL PDF via pdf-lib)
// -------------------------------------------------------------
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2024-001');
  const [invoiceDate, setInvoiceDate] = useState('2024-09-15');
  const [dueDate, setDueDate] = useState('2024-10-15');

  const [fromName, setFromName] = useState('Acme Solutions LLC');
  const [fromEmail, setFromEmail] = useState('billing@acmesolutions.com');
  const [fromAddress, setFromAddress] = useState('100 Market St, Suite 400\nSan Francisco, CA 94105');

  const [toName, setToName] = useState('Client Corporation');
  const [toEmail, setToEmail] = useState('accounts@clientcorp.com');
  const [toAddress, setToAddress] = useState('500 5th Ave, Floor 18\nNew York, NY 10110');

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Full Stack Web Architecture & Implementation', quantity: 40, rate: 85 },
    { id: '2', description: 'Security Auditing & Code Optimization', quantity: 15, rate: 95 }
  ]);
  const [taxPercent, setTaxPercent] = useState<number>(8);
  const [generating, setGenerating] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: 'New Consulting Service', quantity: 1, rate: 100 }
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const subtotal = items.reduce((acc, it) => acc + (it.quantity || 0) * (it.rate || 0), 0);
  const taxAmount = (subtotal * (taxPercent || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { height } = page.getSize();
      let y = height - 50;

      // Header: INVOICE title & Number
      page.drawText('INVOICE', {
        x: 50,
        y,
        size: 24,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16)
      });

      page.drawText(`#${invoiceNumber}`, {
        x: 400,
        y: y + 5,
        size: 14,
        font: fontBold,
        color: rgb(0.85, 0.45, 0.05)
      });

      y -= 30;
      page.drawText(`Date: ${invoiceDate}`, { x: 400, y, size: 10, font });
      y -= 15;
      page.drawText(`Due Date: ${dueDate}`, { x: 400, y, size: 10, font });

      // Addresses Section
      y -= 30;
      page.drawText('From:', { x: 50, y, size: 10, font: fontBold });
      page.drawText('Bill To:', { x: 300, y, size: 10, font: fontBold });

      y -= 15;
      page.drawText(fromName, { x: 50, y, size: 11, font: fontBold });
      page.drawText(toName, { x: 300, y, size: 11, font: fontBold });

      y -= 14;
      page.drawText(fromEmail, { x: 50, y, size: 9, font, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(toEmail, { x: 300, y, size: 9, font, color: rgb(0.3, 0.35, 0.4) });

      y -= 30;
      // Table Header Bar
      page.drawRectangle({
        x: 50,
        y: y - 5,
        width: 495,
        height: 22,
        color: rgb(0.95, 0.96, 0.98)
      });

      page.drawText('Description', { x: 60, y, size: 9, font: fontBold });
      page.drawText('Qty', { x: 340, y, size: 9, font: fontBold });
      page.drawText('Rate', { x: 400, y, size: 9, font: fontBold });
      page.drawText('Total', { x: 480, y, size: 9, font: fontBold });

      y -= 25;

      // Table Rows
      for (const item of items) {
        const lineTot = (item.quantity || 0) * (item.rate || 0);
        page.drawText(item.description.slice(0, 45), { x: 60, y, size: 9, font });
        page.drawText(String(item.quantity), { x: 340, y, size: 9, font });
        page.drawText(`$${item.rate.toFixed(2)}`, { x: 400, y, size: 9, font });
        page.drawText(`$${lineTot.toFixed(2)}`, { x: 480, y, size: 9, font: fontBold });

        y -= 20;
        if (y < 120) break; // Keep space for totals
      }

      // Divider line
      y -= 10;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.85, 0.88, 0.92)
      });

      // Totals
      y -= 25;
      page.drawText('Subtotal:', { x: 380, y, size: 10, font });
      page.drawText(`$${subtotal.toFixed(2)}`, { x: 480, y, size: 10, font: fontBold });

      y -= 18;
      page.drawText(`Tax (${taxPercent}%):`, { x: 380, y, size: 10, font });
      page.drawText(`$${taxAmount.toFixed(2)}`, { x: 480, y, size: 10, font });

      y -= 22;
      page.drawRectangle({
        x: 370,
        y: y - 5,
        width: 175,
        height: 25,
        color: rgb(0.98, 0.95, 0.9)
      });
      page.drawText('Grand Total:', {
        x: 380,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.7, 0.35, 0.05)
      });
      page.drawText(`$${grandTotal.toFixed(2)}`, {
        x: 480,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0.7, 0.35, 0.05)
      });

      // Footer
      page.drawText('Thank you for your business!', {
        x: 50,
        y: 40,
        size: 9,
        font,
        color: rgb(0.5, 0.55, 0.6)
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Invoice PDF error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Details */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* From */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              From (Your Business)
            </h4>
            <input
              type="text"
              placeholder="Business Name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
            <input
              type="email"
              placeholder="Billing Email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>

          {/* To */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Bill To (Client)
            </h4>
            <input
              type="text"
              placeholder="Client Name / Company"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
            <input
              type="email"
              placeholder="Client Accounts Email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Line Items
            </h4>
            <button
              onClick={addItem}
              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800"
              >
                <div className="col-span-6">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => updateItem(it.id, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-center"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    value={it.rate}
                    onChange={(e) => updateItem(it.id, 'rate', parseFloat(e.target.value) || 0)}
                    placeholder="Rate"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-center"
                  />
                </div>
                <div className="col-span-1 text-right text-xs font-bold text-slate-700 dark:text-zinc-300">
                  ${((it.quantity || 0) * (it.rate || 0)).toFixed(0)}
                </div>
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => removeItem(it.id)}
                    disabled={items.length <= 1}
                    className="text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations & Grand Total */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Tax (%):</span>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className="w-20 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Subtotal: ${subtotal.toFixed(2)} + Tax: ${taxAmount.toFixed(2)}
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              Total: ${grandTotal.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={generatePdf}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{generating ? 'Generating PDF...' : 'Download Invoice PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. FAVICON GENERATOR (Multi-size + ZIP)
// -------------------------------------------------------------
function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateZip = async () => {
    if (!imageSrc) return;
    setGenerating(true);

    try {
      const zip = new JSZip();
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const sizes = [
        { name: 'favicon-16x16.png', size: 16 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'favicon-48x48.png', size: 48 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'android-chrome-192x192.png', size: 192 },
        { name: 'android-chrome-512x512.png', size: 512 }
      ];

      for (const { name, size } of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
          if (blob) {
            zip.file(name, blob);
          }
        }
      }

      // Web manifest
      const manifest = {
        name: 'My Website',
        short_name: 'Website',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

      // HTML snippet helper
      const htmlSnippet = `<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
`;
      zip.file('favicon-html-tags.html', htmlSnippet);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicons-pack.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Favicon ZIP generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/svg+xml, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <ImageIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            Click to upload your logo or icon image
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Supports PNG, JPEG, SVG, WebP (Square recommended, min 512x512)
          </p>
        </div>

        {/* Preview of Generated Sizes */}
        {imageSrc && (
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Multi-Size Favicon Preview
            </h4>
            <div className="flex flex-wrap items-end gap-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
              {[
                { size: 16, label: '16x16' },
                { size: 32, label: '32x32' },
                { size: 48, label: '48x48' },
                { size: 64, label: '64x64' }
              ].map((s) => (
                <div key={s.size} className="text-center space-y-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xs inline-block">
                    <img
                      src={imageSrc}
                      alt={s.label}
                      style={{ width: s.size, height: s.size }}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={generateZip}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{generating ? 'Packing ZIP...' : 'Download Favicon ZIP Pack'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. OG IMAGE GENERATOR
// -------------------------------------------------------------
function OgImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState('Build Fast, Private Client-Side Tools');
  const [subtitle, setSubtitle] = useState('Instant in-browser utilities without servers or telemetry.');
  const [author, setAuthor] = useState('Nexvert');
  const [tag, setTag] = useState('Open Source Utility');
  const [theme, setTheme] = useState<'midnight' | 'slate' | 'emerald' | 'amber' | 'indigo'>('midnight');

  const THEMES = {
    midnight: { bg1: '#090d16', bg2: '#111827', text: '#ffffff', subtext: '#94a3b8', accent: '#f59e0b' },
    slate: { bg1: '#0f172a', bg2: '#1e293b', text: '#ffffff', subtext: '#94a3b8', accent: '#38bdf8' },
    emerald: { bg1: '#064e3b', bg2: '#022c22', text: '#ffffff', subtext: '#a7f3d0', accent: '#34d399' },
    amber: { bg1: '#78350f', bg2: '#451a03', text: '#ffffff', subtext: '#fde68a', accent: '#fbbf24' },
    indigo: { bg1: '#1e1b4b', bg2: '#0f172a', text: '#ffffff', subtext: '#c7d2fe', accent: '#818cf8' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard Open Graph 1200 x 630
    canvas.width = 1200;
    canvas.height = 630;

    const t = THEMES[theme];

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, t.bg1);
    grad.addColorStop(1, t.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 40; x < 1200; x += 40) {
      for (let y = 40; y < 630; y += 40) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Badge / Tag
    if (tag) {
      ctx.fillStyle = t.accent;
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(tag.toUpperCase(), 100, 140);
    }

    // Main Title (word wrap)
    ctx.fillStyle = t.text;
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';

    const words = title.split(' ');
    let line = '';
    let y = 230;
    for (const w of words) {
      const testLine = line + w + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1000 && line !== '') {
        ctx.fillText(line, 100, y);
        line = w + ' ';
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);

    // Subtitle
    if (subtitle) {
      ctx.fillStyle = t.subtext;
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillText(subtitle, 100, y + 70);
    }

    // Brand / Author footer
    ctx.fillStyle = t.accent;
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(author, 100, 550);
  }, [title, subtitle, author, tag, theme]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'og-image-1200x630.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Brand / Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Tag / Badge
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>
        </div>

        {/* Theme Palette Selector */}
        <div className="flex items-center space-x-3 text-xs pt-1">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Theme:</span>
          {(['midnight', 'slate', 'emerald', 'amber', 'indigo'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize cursor-pointer transition-colors ${
                theme === t
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Live Canvas Preview (scaled down proportionally) */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-md">
          <canvas ref={canvasRef} className="w-full h-auto aspect-1200/630 block" />
        </div>

        <div className="flex justify-end">
          <button
            onClick={downloadImage}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res 1200x630 OG Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. PLACEHOLDER IMAGE
// -------------------------------------------------------------
function PlaceholderImageGenerator() {
  const [width, setWidth] = useState<number>(600);
  const [height, setHeight] = useState<number>(400);
  const [bgColor, setBgColor] = useState('#e2e8f0');
  const [textColor, setTextColor] = useState('#475569');
  const [customText, setCustomText] = useState('');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = Math.min(Math.max(10, width), 2400);
    const h = Math.min(Math.max(10, height), 2400);
    canvas.width = w;
    canvas.height = h;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Text
    const displayText = customText.trim() || `${w} × ${h}`;
    const fontSize = Math.max(14, Math.floor(Math.min(w, h) / 10));

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, w / 2, h / 2);
  }, [width, height, bgColor, textColor, customText]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = `image/${format}`;
    const url = canvas.toDataURL(mime, 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placeholder-${width}x${height}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              min={10}
              max={2400}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              min={10}
              max={2400}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <span className="text-xs font-mono uppercase">{bgColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <span className="text-xs font-mono uppercase">{textColor}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Custom Text (Optional)
            </label>
            <input
              type="text"
              placeholder={`Defaults to "${width} × ${height}"`}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 flex items-center justify-center overflow-auto max-h-96">
          <canvas ref={canvasRef} className="max-w-full max-h-80 shadow-md rounded-lg" />
        </div>

        <div className="flex justify-end">
          <button
            onClick={downloadImage}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Placeholder Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}
