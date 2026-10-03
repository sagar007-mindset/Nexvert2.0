/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  Camera,
  Upload,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wifi,
  Contact,
  Link as LinkIcon,
  FileText,
  VideoOff,
  Sparkles
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface DecodedQrResult {
  rawText: string;
  type: 'url' | 'wifi' | 'vcard' | 'email' | 'tel' | 'sms' | 'text';
  parsedData?: any;
  location?: {
    topLeftCorner: { x: number; y: number };
    topRightCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
  };
}

export default function QrReaderTool() {
  const config = getConverterConfig('qr-reader');

  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<DecodedQrResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Parse decoded text into structured info
  const parsePayload = (text: string): DecodedQrResult => {
    const trimmed = text.trim();

    if (/^https?:\/\//i.test(trimmed)) {
      return { rawText: trimmed, type: 'url' };
    }

    if (/^WIFI:/i.test(trimmed)) {
      const ssidMatch = trimmed.match(/S:([^;]+)/);
      const passMatch = trimmed.match(/P:([^;]+)/);
      const typeMatch = trimmed.match(/T:([^;]+)/);
      return {
        rawText: trimmed,
        type: 'wifi',
        parsedData: {
          ssid: ssidMatch ? ssidMatch[1] : 'Unknown SSID',
          password: passMatch ? passMatch[1] : '(None / Open)',
          encryption: typeMatch ? typeMatch[1] : 'WPA',
        },
      };
    }

    if (/BEGIN:VCARD/i.test(trimmed)) {
      const fnMatch = trimmed.match(/FN:([^\r\n]+)/);
      const telMatch = trimmed.match(/TEL[^:]*:([^\r\n]+)/);
      const emailMatch = trimmed.match(/EMAIL[^:]*:([^\r\n]+)/);
      const orgMatch = trimmed.match(/ORG:([^\r\n]+)/);
      return {
        rawText: trimmed,
        type: 'vcard',
        parsedData: {
          name: fnMatch ? fnMatch[1].trim() : 'Contact',
          phone: telMatch ? telMatch[1].trim() : null,
          email: emailMatch ? emailMatch[1].trim() : null,
          org: orgMatch ? orgMatch[1].trim() : null,
        },
      };
    }

    if (/^mailto:/i.test(trimmed)) {
      return { rawText: trimmed, type: 'email' };
    }

    if (/^(tel:|smsto:)/i.test(trimmed)) {
      return { rawText: trimmed, type: trimmed.startsWith('tel:') ? 'tel' : 'sms' };
    }

    return { rawText: trimmed, type: 'text' };
  };

  // Play a gentle beep chime via Web Audio API on successful scan
  const playSuccessChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // Decode QR code from an image File
  const handleFileDecode = async (file: File | null) => {
    setSelectedFile(file);
    setError(null);
    setDecodedResult(null);

    if (!file) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      return;
    }

    setIsProcessing(true);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    try {
      const jsQR = (await import('jsqr')).default;
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load the uploaded image file.'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D canvas context');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        playSuccessChime();
        setDecodedResult(parsePayload(code.data));
      } else {
        setError('No QR code could be detected in this image. Ensure the code is clearly visible, well-lit, and in focus.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while decoding QR code.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Camera Scanning
  const startCamera = async () => {
    setCameraError(null);
    setDecodedResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      requestScanFrame();
    } catch (err: any) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera access was denied by browser permissions. Please allow camera access in your browser settings.'
          : 'Could not access camera hardware. Ensure no other application is using your camera.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera Scanning
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Scan frame loop for live camera
  const requestScanFrame = async () => {
    const jsQR = (await import('jsqr')).default;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          playSuccessChime();
          setDecodedResult(parsePayload(code.data));
          stopCamera();
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []);

  const handleCopyText = () => {
    if (!decodedResult) return;
    navigator.clipboard.writeText(decodedResult.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <FileUploadBox
            config={config || {
              id: 'qr-reader',
              route: '/qr-reader/',
              title: 'QR Code Reader',
              description: 'Decode QR code image',
              category: 'Tools',
              inputFormats: ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP', 'SVG'],
              outputFormats: ['TEXT'],
              defaultOutputFormat: 'TEXT',
              mimeTypes: ['image/*'],
              fileExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'],
              maxFileSizeMB: 25,
              conversionCapabilities: ['qr-decode'],
              supportsMultipleFiles: false,
              supportsBatchConversion: false,
              relatedToolIds: [],
            }}
            selectedFile={selectedFile}
            onFileSelect={handleFileDecode}
            error={error}
            onError={setError}
            title="Drop QR code image here, or browse"
            subtitle="Supports PNG, JPG, WEBP, GIF, and SVG up to 25MB"
          />

          {isProcessing && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-zinc-400">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>Scanning image matrix for QR patterns...</span>
            </div>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {activeTab === 'camera' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          {!isCameraActive ? (
            <div className="py-8 text-center max-w-md space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-500">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Camera QR Scanner
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Point your smartphone or webcam at a QR code to read its contents live.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Camera Scanner</span>
              </button>
              {cameraError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-lg space-y-4 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                />
                {/* Target Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-red-500/80 rounded-2xl animate-pulse shadow-lg" />
                </div>
              </div>

              <button
                onClick={stopCamera}
                className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Decoded Output Card */}
      {decodedResult && (
        <div className="mt-8 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                QR Code Successfully Decoded
              </h3>
            </div>
            <span className="text-xs uppercase font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              Format: {decodedResult.type}
            </span>
          </div>

          {/* Structured Format Display */}
          {decodedResult.type === 'url' && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <LinkIcon className="w-5 h-5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Website URL</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate font-mono">
                    {decodedResult.rawText}
                  </p>
                </div>
              </div>
              <a
                href={decodedResult.rawText}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <span>Open URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {decodedResult.type === 'wifi' && decodedResult.parsedData && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span>Wi-Fi Network Credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400">SSID (Network):</span>{' '}
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {decodedResult.parsedData.ssid}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400">Password:</span>{' '}
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {decodedResult.parsedData.password}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400">Security:</span>{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {decodedResult.parsedData.encryption}
                  </span>
                </div>
              </div>
            </div>
          )}

          {decodedResult.type === 'vcard' && decodedResult.parsedData && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                <Contact className="w-4 h-4 text-red-500" />
                <span>Contact Card (vCard)</span>
              </div>
              <div className="text-xs space-y-1 pt-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {decodedResult.parsedData.name}
                </p>
                {decodedResult.parsedData.org && (
                  <p className="text-slate-600 dark:text-zinc-400">{decodedResult.parsedData.org}</p>
                )}
                {decodedResult.parsedData.phone && (
                  <p className="text-slate-600 dark:text-zinc-400">Phone: {decodedResult.parsedData.phone}</p>
                )}
                {decodedResult.parsedData.email && (
                  <p className="text-slate-600 dark:text-zinc-400">Email: {decodedResult.parsedData.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Raw Decoded Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Raw Text Content ({decodedResult.rawText.length} characters)
            </label>
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-900 dark:text-zinc-200 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
              {decodedResult.rawText}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopyText}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-zinc-700 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Decoded Text'}</span>
            </button>

            {activeTab === 'camera' && (
              <button
                onClick={startCamera}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Another Code</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
