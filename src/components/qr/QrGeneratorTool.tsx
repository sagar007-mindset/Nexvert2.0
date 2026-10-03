/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Link,
  AlignLeft,
  Wifi,
  Contact,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';

type QrMode = 'url' | 'text' | 'wifi' | 'vcard' | 'sms';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export default function QrGeneratorTool() {
  const config = getConverterConfig('qr-generator');

  // Modes & Inputs
  const [mode, setMode] = useState<QrMode>('url');
  const [urlInput, setUrlInput] = useState('https://');
  const [textInput, setTextInput] = useState('');
  
  // WiFi
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  // SMS
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Style customization
  const [size, setSize] = useState<number>(320);
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');

  // Center logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Output states
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final encoded text based on mode
  const computePayload = useCallback((): string => {
    switch (mode) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput.trim();
      case 'wifi': {
        const ssid = wifiSsid.replace(/([\\;,:"])/g, '\\$1');
        const pass = wifiPassword.replace(/([\\;,:"])/g, '\\$1');
        return `WIFI:T:${wifiEncryption};S:${ssid};P:${pass};H:${wifiHidden ? 'true' : 'false'};;`;
      }
      case 'vcard': {
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardLast.trim()};${vcardFirst.trim()};;;`,
          `FN:${vcardFirst.trim()} ${vcardLast.trim()}`.trim(),
        ];
        if (vcardOrg.trim()) lines.push(`ORG:${vcardOrg.trim()}`);
        if (vcardTitle.trim()) lines.push(`TITLE:${vcardTitle.trim()}`);
        if (vcardPhone.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${vcardPhone.trim()}`);
        if (vcardEmail.trim()) lines.push(`EMAIL;TYPE=INTERNET,WORK:${vcardEmail.trim()}`);
        if (vcardUrl.trim()) lines.push(`URL:${vcardUrl.trim()}`);
        lines.push('END:VCARD');
        return lines.join('\n');
      }
      case 'sms':
        return `SMSTO:${smsPhone.trim()}:${smsMessage.trim()}`;
      default:
        return '';
    }
  }, [mode, urlInput, textInput, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, vcardFirst, vcardLast, vcardOrg, vcardTitle, vcardPhone, vcardEmail, vcardUrl, smsPhone, smsMessage]);

  // Handle Logo Upload
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setGenerationError('Logo must be an image file (PNG, JPG, SVG, WebM).');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      // Auto-boost EC Level to Q or H if currently L or M
      if (ecLevel === 'L' || ecLevel === 'M') {
        setEcLevel('Q');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoDataUrl(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Generate QR Code on canvas and generate SVG
  useEffect(() => {
    let isCancelled = false;
    const payload = computePayload();

    if (!payload || payload.length === 0) {
      setPngBlob(null);
      setSvgString(null);
      setGenerationError(null);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const generate = async () => {
      try {
        const QRCode = (await import('qrcode')).default;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render QR directly to canvas
        await QRCode.toCanvas(canvas, payload, {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        // If logo is present, render onto canvas
        if (logoDataUrl) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                const logoSize = Math.round(size * (logoSizePercent / 100));
                const logoX = Math.round((size - logoSize) / 2);
                const logoY = Math.round((size - logoSize) / 2);

                // Draw background protective pill/box behind logo
                const pad = Math.round(logoSize * 0.1);
                ctx.fillStyle = bgColor;
                ctx.beginPath();
                ctx.roundRect(
                  logoX - pad,
                  logoY - pad,
                  logoSize + pad * 2,
                  logoSize + pad * 2,
                  Math.round(logoSize * 0.2)
                );
                ctx.fill();

                // Draw logo image
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                resolve();
              };
              img.onerror = () => reject(new Error('Failed to render centre logo onto QR code'));
              img.src = logoDataUrl;
            });
          }
        }

        if (isCancelled) return;

        // Extract honest PNG blob from the canvas
        canvas.toBlob((blob) => {
          if (!isCancelled && blob) {
            setPngBlob(blob);
          }
        }, 'image/png');

        // Generate SVG string
        const rawSvg = await QRCode.toString(payload, {
          type: 'svg',
          margin: 2,
          errorCorrectionLevel: ecLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        // If logo present, inject into SVG
        let finalSvg = rawSvg;
        if (logoDataUrl) {
          const logoSize = Math.round(size * (logoSizePercent / 100));
          const logoX = Math.round((size - logoSize) / 2);
          const logoY = Math.round((size - logoSize) / 2);
          const pad = Math.round(logoSize * 0.1);

          const logoSvgTag = `
            <rect x="${logoX - pad}" y="${logoY - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${Math.round(logoSize * 0.2)}" fill="${bgColor}" />
            <image href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />
          `;
          finalSvg = rawSvg.replace('</svg>', `${logoSvgTag}</svg>`);
        }

        if (!isCancelled) {
          setSvgString(finalSvg);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setGenerationError(err?.message || 'Failed to generate QR code with current parameters.');
        }
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [computePayload, size, ecLevel, fgColor, bgColor, logoDataUrl, logoSizePercent]);

  // Download PNG
  const handleDownloadPng = () => {
    if (!pngBlob) return;
    const url = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${mode}-${size}x${size}.png`;
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
    a.download = `qr-code-${mode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy PNG image to clipboard
  const handleCopy = async () => {
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
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback: copy payload text
      const payload = computePayload();
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const colorPresets = [
    { name: 'Dark Slate', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Pure Black', fg: '#000000', bg: '#ffffff' },
    { name: 'Navy Blue', fg: '#1e3a8a', bg: '#ffffff' },
    { name: 'Forest Green', fg: '#064e3b', bg: '#ffffff' },
    { name: 'Burgundy', fg: '#881337', bg: '#ffffff' },
    { name: 'Dark Purple', fg: '#4c1d95', bg: '#ffffff' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mode Selector & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Tabs */}
          <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200 dark:border-zinc-800">
            {[
              { id: 'url', label: 'URL / Link', icon: Link },
              { id: 'text', label: 'Plain Text', icon: AlignLeft },
              { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
              { id: 'vcard', label: 'vCard', icon: Contact },
              { id: 'sms', label: 'SMS', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as QrMode)}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            {mode === 'url' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {mode === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Text Content
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter message, instructions, or notes to encode..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {mode === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Home or Office Wi-Fi"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Wi-Fi Password"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Encryption
                    </label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded-sm text-red-600 focus:ring-red-500"
                      />
                      <span>Hidden Network</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {mode === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={vcardFirst}
                      onChange={(e) => setVcardFirst(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={vcardLast}
                      onChange={(e) => setVcardLast(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      placeholder="Product Lead"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={vcardUrl}
                    onChange={(e) => setVcardUrl(e.target.value)}
                    placeholder="https://janedoe.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {mode === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Preset SMS Message
                  </label>
                  <textarea
                    rows={3}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="I am requesting information regarding..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Design & Style Customization */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Style &amp; Appearance
            </h3>

            {/* Colors */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
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

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mr-1">Presets:</span>
                {colorPresets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: p.fg }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Correction & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="L">L – Low (~7% recovery)</option>
                  <option value="M">M – Medium (~15% recovery)</option>
                  <option value="Q">Q – Quartile (~25% recovery)</option>
                  <option value="H">H – High (~30% recovery, recommended for logos)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Resolution Size
                  </label>
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400">
                    {size} × {size} px
                  </span>
                </div>
                <input
                  type="range"
                  min={160}
                  max={800}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            {/* Centre Logo Option */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Centre Logo (Optional)</span>
                </label>
                {logoFile && (
                  <button
                    onClick={removeLogo}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              {!logoFile ? (
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-file-input"
                  />
                  <label
                    htmlFor="logo-file-input"
                    className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Logo Image (PNG, SVG, JPG)</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoDataUrl!}
                      alt="Center Logo"
                      className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 dark:border-zinc-700 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {logoFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {formatBytes(logoFile.size)} • Center-aligned
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        Logo Relative Scale
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                        {logoSizePercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={30}
                      value={logoSizePercent}
                      onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview & Export */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Live Preview
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>100% Vector Ready</span>
              </span>
            </div>

            {/* QR Canvas Frame */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center max-w-full overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg"
                style={{
                  width: Math.min(size, 280),
                  height: Math.min(size, 280),
                }}
              />
            </div>

            {/* Real Honest Metrics */}
            {pngBlob && (
              <div className="w-full mt-4 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400">
                <span>{size} × {size} px</span>
                <span>PNG: {formatBytes(pngBlob.size)}</span>
                {svgString && (
                  <span>SVG: {formatBytes(new Blob([svgString]).size)}</span>
                )}
              </div>
            )}

            {generationError && (
              <div className="w-full mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
                {generationError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-5">
              <button
                onClick={handleDownloadPng}
                disabled={!pngBlob || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG ({size} × {size})</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!svgString || isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector SVG</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!pngBlob}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Your data is rendered entirely inside your browser using client-side WebAssembly canvas routines. No data, URLs, or logos are ever sent to an external server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
