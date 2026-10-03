/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Info,
  Languages,
  Eye,
  Sliders
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import { runOcrOnImage, SUPPORTED_OCR_LANGUAGES, OcrResult, OcrProgress } from '../../utils/ocrHelper';

export default function ImageToTextTool() {
  const config = getConverterConfig('image-to-text');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('eng');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
    setOcrResult(null);
    setProgressInfo(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRunOcr = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setOcrResult(null);
    setProgressInfo({ status: 'initializing tesseract wasm', progress: 0.05 });

    try {
      const result = await runOcrOnImage(selectedFile, selectedLang, (progress) => {
        setProgressInfo(progress);
      });

      if (!result.text || result.text.trim().length === 0) {
        setError('No readable text could be recognized in the uploaded image. Check contrast, lighting, or try a higher resolution image.');
      } else {
        setOcrResult(result);
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(err?.message || 'An error occurred while executing optical character recognition.');
    } finally {
      setIsProcessing(false);
      setProgressInfo(null);
    }
  };

  // Download extracted text as .txt
  const handleDownloadTxt = () => {
    if (!ocrResult?.text) return;
    const blob = new Blob([ocrResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'extracted-text';
    a.download = `${baseName}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    if (!ocrResult?.text) return;
    navigator.clipboard.writeText(ocrResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean up preview url on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Honest Disclaimer Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-semibold">Important Notice Regarding OCR Accuracy</p>
          <p className="leading-relaxed">
            Recognition accuracy is heavily governed by image clarity, high resolution, and sharp contrast. Standard printed typography delivers excellent recognition, while handwritten script, cursive, and heavily stylized artistic fonts have significantly reduced accuracy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Options */}
        <div className="lg:col-span-6 space-y-6">
          <FileUploadBox
            config={config || {
              id: 'image-to-text',
              route: '/image-to-text/',
              title: 'Image to Text OCR',
              description: 'Extract text from images',
              category: 'Image',
              inputFormats: ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'TIFF'],
              outputFormats: ['TXT'],
              defaultOutputFormat: 'TXT',
              mimeTypes: ['image/*'],
              fileExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'],
              maxFileSizeMB: 30,
              conversionCapabilities: ['ocr-text-extraction'],
              supportsMultipleFiles: false,
              supportsBatchConversion: false,
              relatedToolIds: [],
            }}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            error={error}
            onError={setError}
            title="Drop image here or click to browse"
            subtitle="Supports PNG, JPG, WEBP, and BMP up to 30MB"
          />

          {selectedFile && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>OCR Language Model</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Local / Offline
                </span>
              </div>

              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              >
                {SUPPORTED_OCR_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.size})
                  </option>
                ))}
              </select>

              {previewUrl && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Image Preview</span>
                  </span>
                  <div className="max-h-56 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2">
                    <img
                      src={previewUrl}
                      alt="Uploaded document preview"
                      className="max-h-52 w-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleRunOcr}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start Text Recognition</span>
                  </>
                )}
              </button>

              {/* Genuine progress readout */}
              {isProcessing && progressInfo && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span className="capitalize">{progressInfo.status}</span>
                    <span className="font-mono">{Math.round(progressInfo.progress * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-200"
                      style={{ width: `${Math.max(5, Math.round(progressInfo.progress * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: OCR Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Recognized Text Output</span>
                </span>
                {ocrResult && (
                  <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Confidence: {ocrResult.confidence}%
                  </span>
                )}
              </div>

              {ocrResult ? (
                <div className="space-y-4">
                  {/* Real Honest Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Words</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ocrResult.wordCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Characters</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ocrResult.charCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Lines</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ocrResult.lineCount}</p>
                    </div>
                  </div>

                  {/* Text Container */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-slate-900 dark:text-zinc-200 whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed selection:bg-red-500 selection:text-white">
                    {ocrResult.text}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-zinc-600 space-y-3">
                  <FileText className="w-12 h-12 stroke-[1.5]" />
                  <p className="text-sm">
                    {isProcessing
                      ? 'Recognizing text matrix...'
                      : 'Upload an image and click "Start Text Recognition" to view extracted text.'}
                  </p>
                </div>
              )}
            </div>

            {ocrResult && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-2">
                <button
                  onClick={handleDownloadTxt}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Text (.txt)</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Tesseract WebAssembly runs completely offline in your local browser sandbox. Scanned documents, sensitive forms, and confidential records never touch a cloud server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
