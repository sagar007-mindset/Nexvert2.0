/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';

export default function WifiQrGeneratorTool() {
  const config = getConverterConfig('wifi-qr-generator');

  // Wi-Fi details
  const [ssid, setSsid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // QR Customization
  const [size, setSize] = useState<number>(320);
  const [ecLevel, setEcLevel] = useState<'M' | 'Q' | 'H'>('Q');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [includeWifiIcon, setIncludeWifiIcon] = useState<boolean>(true);

  // Outputs
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute standard WiFi string format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
  const computeWifiPayload = (): string => {
    if (!ssid.trim()) return '';
    const cleanSsid = ssid.replace(/([\\;,:"])/g, '\\$1');
    const cleanPass = password.replace(/([\\;,:"])/g, '\\$1');
    return `WIFI:T:${encryption};S:${cleanSsid};P:${encryption === 'nopass' ? '' : cleanPass};H:${hidden ? 'true' : 'false'};;`;
  };

  useEffect(() => {
    let isCancelled = false;
    const payload = computeWifiPayload();

    if (!payload) {
      setPngBlob(null);
      setSvgString(null);
      setError(null);
      return;
    }

    const generate = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render QR to canvas
        await QRCode.toCanvas(canvas, payload, {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        // Draw WiFi center icon if checked
        if (includeWifiIcon) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const iconSize = Math.round(size * 0.22);
            const iconX = Math.round((size - iconSize) / 2);
            const iconY = Math.round((size - iconSize) / 2);
            const pad = Math.round(iconSize * 0.15);

            // Protective white/bg background badge
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.roundRect(
              iconX - pad,
              iconY - pad,
              iconSize + pad * 2,
              iconSize + pad * 2,
              Math.round(iconSize * 0.25)
            );
            ctx.fill();

            // Draw colored inner badge
            ctx.fillStyle = fgColor;
            ctx.beginPath();
            ctx.roundRect(
              iconX,
              iconY,
              iconSize,
              iconSize,
              Math.round(iconSize * 0.2)
            );
            ctx.fill();

            // Simple clean vector WiFi waves in white
            ctx.strokeStyle = bgColor;
            ctx.lineWidth = Math.max(2, Math.round(iconSize * 0.08));
            ctx.lineCap = 'round';
            const cx = iconX + iconSize / 2;
            const cy = iconY + iconSize * 0.68;

            // Dot
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.round(iconSize * 0.06), 0, Math.PI * 2);
            ctx.fill();

            // Small wave
            ctx.beginPath();
            ctx.arc(cx, cy, iconSize * 0.22, -Math.PI * 0.75, -Math.PI * 0.25);
            ctx.stroke();

            // Large wave
            ctx.beginPath();
            ctx.arc(cx, cy, iconSize * 0.38, -Math.PI * 0.75, -Math.PI * 0.25);
            ctx.stroke();
          }
        }

        if (isCancelled) return;

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

        let finalSvg = rawSvg;
        if (includeWifiIcon) {
          const iconSize = Math.round(size * 0.22);
          const iconX = Math.round((size - iconSize) / 2);
          const iconY = Math.round((size - iconSize) / 2);
          const pad = Math.round(iconSize * 0.15);
          const cx = iconX + iconSize / 2;
          const cy = iconY + iconSize * 0.68;
          const strokeW = Math.max(2, Math.round(iconSize * 0.08));

          const wifiSvgBadge = `
            <rect x="${iconX - pad}" y="${iconY - pad}" width="${iconSize + pad * 2}" height="${iconSize + pad * 2}" rx="${Math.round(iconSize * 0.25)}" fill="${bgColor}" />
            <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="${Math.round(iconSize * 0.2)}" fill="${fgColor}" />
            <circle cx="${cx}" cy="${cy}" r="${Math.round(iconSize * 0.06)}" fill="${bgColor}" />
            <path d="M ${cx - iconSize * 0.16} ${cy - iconSize * 0.15} A ${iconSize * 0.22} ${iconSize * 0.22} 0 0 1 ${cx + iconSize * 0.16} ${cy - iconSize * 0.15}" stroke="${bgColor}" stroke-width="${strokeW}" stroke-linecap="round" fill="none" />
            <path d="M ${cx - iconSize * 0.27} ${cy - iconSize * 0.27} A ${iconSize * 0.38} ${iconSize * 0.38} 0 0 1 ${cx + iconSize * 0.27} ${cy - iconSize * 0.27}" stroke="${bgColor}" stroke-width="${strokeW}" stroke-linecap="round" fill="none" />
          `;
          finalSvg = rawSvg.replace('</svg>', `${wifiSvgBadge}</svg>`);
        }

        if (!isCancelled) {
          setSvgString(finalSvg);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to generate Wi-Fi QR code.');
        }
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [ssid, password, encryption, hidden, size, ecLevel, fgColor, bgColor, includeWifiIcon]);

  // Download PNG
  const handleDownloadPng = () => {
    if (!pngBlob) return;
    const url = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-qr-${ssid.replace(/[^a-zA-Z0-9_-]/g, '_') || 'network'}.png`;
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
    a.download = `wifi-qr-${ssid.replace(/[^a-zA-Z0-9_-]/g, '_') || 'network'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!pngBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      navigator.clipboard.writeText(computeWifiPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Wi-Fi Network Credentials
            </h3>

            {/* Network SSID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Network Name (SSID) *
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="e.g. CoffeeShop_Guest or Home_5G"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Password */}
            {encryption !== 'nopass' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Wi-Fi Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter network password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Encryption & Hidden */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Security Protocol
                </label>
                <select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                  <option value="WEP">WEP (Legacy)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="rounded-sm text-red-600 focus:ring-red-500"
                  />
                  <span>Hidden Network (SSID not broadcast)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Style Customization */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Style &amp; Branding
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Code Color
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
                  Background
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

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeWifiIcon}
                  onChange={(e) => setIncludeWifiIcon(e.target.checked)}
                  className="rounded-sm text-red-600 focus:ring-red-500"
                />
                <span>Embed Wi-Fi Icon Badge in Center</span>
              </label>

              <span className="text-xs font-mono text-slate-500">
                {size} × {size} px
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Export */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Wi-Fi QR Preview
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Instant Auto-Connect</span>
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

            {!ssid.trim() && (
              <p className="mt-3 text-xs text-slate-500 text-center">
                Enter your network name (SSID) on the left to render the Wi-Fi code.
              </p>
            )}

            {/* Real Honest Metrics */}
            {pngBlob && (
              <div className="w-full mt-4 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400">
                <span>{size} × {size} px</span>
                <span>PNG: {formatBytes(pngBlob.size)}</span>
                {svgString && <span>SVG: {formatBytes(new Blob([svgString]).size)}</span>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-5">
              <button
                onClick={handleDownloadPng}
                disabled={!pngBlob}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Print-Ready PNG</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!svgString}
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

          {/* Mobile instructions */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Users can open their standard camera app on iOS (iPhone/iPad) or Android and tap the popup banner to connect to Wi-Fi instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
