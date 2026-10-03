/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Contact,
  Download,
  Copy,
  Check,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';

export default function VCardGeneratorTool() {
  const config = getConverterConfig('vcard-generator');

  // Contact fields
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Morgan');
  const [org, setOrg] = useState('Tech Solutions');
  const [title, setTitle] = useState('Senior Engineer');
  const [mobilePhone, setMobilePhone] = useState('+1 (555) 234-5678');
  const [workPhone, setWorkPhone] = useState('');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [website, setWebsite] = useState('https://example.com');
  const [street, setStreet] = useState('123 Market St');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');
  const [country, setCountry] = useState('USA');
  const [notes, setNotes] = useState('Met at Global Tech Summit 2026');

  // QR Customization
  const [size, setSize] = useState<number>(360);
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Outputs
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [vcfBlob, setVcfBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate vCard 3.0 text
  const generateVCardText = useCallback((): string => {
    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName.trim()};${firstName.trim()};;;`,
      `FN:${[firstName.trim(), lastName.trim()].filter(Boolean).join(' ')}`,
    ];

    if (org.trim()) lines.push(`ORG:${org.trim()}`);
    if (title.trim()) lines.push(`TITLE:${title.trim()}`);
    if (mobilePhone.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${mobilePhone.trim()}`);
    if (workPhone.trim()) lines.push(`TEL;TYPE=WORK,VOICE:${workPhone.trim()}`);
    if (email.trim()) lines.push(`EMAIL;TYPE=INTERNET,WORK:${email.trim()}`);
    if (website.trim()) lines.push(`URL:${website.trim()}`);

    const hasAddress = [street, city, state, zip, country].some((v) => v.trim().length > 0);
    if (hasAddress) {
      lines.push(`ADR;TYPE=WORK:;;${street.trim()};${city.trim()};${state.trim()};${zip.trim()};${country.trim()}`);
    }

    if (notes.trim()) lines.push(`NOTE:${notes.trim()}`);

    lines.push('END:VCARD');
    return lines.join('\r\n');
  }, [firstName, lastName, org, title, mobilePhone, workPhone, email, website, street, city, state, zip, country, notes]);

  // Update vCard Blob and QR Code
  useEffect(() => {
    let isCancelled = false;
    const vcardText = generateVCardText();

    // Create honest .vcf Blob
    const vcf = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
    setVcfBlob(vcf);

    const generateQr = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render QR to canvas (use 'M' error correction to keep data density manageable for vCards)
        await QRCode.toCanvas(canvas, vcardText, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        if (isCancelled) return;

        canvas.toBlob((blob) => {
          if (!isCancelled && blob) {
            setPngBlob(blob);
          }
        }, 'image/png');

        // Generate SVG string
        const svg = await QRCode.toString(vcardText, {
          type: 'svg',
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        if (!isCancelled) {
          setSvgString(svg);
        }
      } catch (err) {
        console.error('Error generating vCard QR:', err);
      }
    };

    generateQr();

    return () => {
      isCancelled = true;
    };
  }, [generateVCardText, size, fgColor, bgColor]);

  // Download .vcf File
  const handleDownloadVcf = () => {
    if (!vcfBlob) return;
    const url = URL.createObjectURL(vcfBlob);
    const a = document.createElement('a');
    a.href = url;
    const namePart = [firstName, lastName].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '') || 'contact';
    a.download = `${namePart}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download PNG QR
  const handleDownloadPng = () => {
    if (!pngBlob) return;
    const url = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = url;
    const namePart = [firstName, lastName].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '') || 'contact';
    a.download = `vcard-qr-${namePart}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download SVG QR
  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const namePart = [firstName, lastName].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '') || 'contact';
    a.download = `vcard-qr-${namePart}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy vCard Text to Clipboard
  const handleCopyVCard = () => {
    navigator.clipboard.writeText(generateVCardText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Details Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Personal &amp; Professional Info
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>Company / Organization</span>
                </label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Organization"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Director"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Mobile Phone</span>
                </label>
                <input
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Work Phone</span>
                </label>
                <input
                  type="tel"
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  placeholder="Direct office line"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@work.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>Website URL</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Address */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Physical Address</span>
              </label>
              <div>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Contact Note</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: vCard & QR Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                vCard QR Code
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-blue-950/50 text-red-700 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Standard vCard 3.0</span>
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
            <div className="w-full mt-4 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400">
              {vcfBlob && <span>VCF: {formatBytes(vcfBlob.size)}</span>}
              {pngBlob && <span>PNG: {formatBytes(pngBlob.size)}</span>}
              {svgString && <span>SVG: {formatBytes(new Blob([svgString]).size)}</span>}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-5">
              {/* VCF Download Button (Primary) */}
              <button
                onClick={handleDownloadVcf}
                disabled={!vcfBlob}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Contact Card (.vcf)</span>
              </button>

              {/* PNG QR Download */}
              <button
                onClick={handleDownloadPng}
                disabled={!pngBlob}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code (PNG)</span>
              </button>

              {/* SVG QR Download */}
              <button
                onClick={handleDownloadSvg}
                disabled={!svgString}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code (SVG)</span>
              </button>

              <button
                onClick={handleCopyVCard}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Raw vCard!' : 'Copy Raw vCard Text'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              When scanned with an iPhone or Android camera, a prompt automatically appears to "Add to Contacts", saving the photo, organization, and phone numbers directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
