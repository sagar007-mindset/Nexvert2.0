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
  Layers,
  StopCircle,
  FileCheck
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';
import {
  createOcrWorker,
  runOcrWithWorker,
  SUPPORTED_OCR_LANGUAGES,
  OcrProgress
} from '../../utils/ocrHelper';
import { getPdfjs } from '../pdf/pdfThumbnail';

interface PageOcrData {
  pageNumber: number;
  text: string;
  confidence: number;
  wordCount: number;
  charCount: number;
}

export default function PdfOcrTool() {
  const config = getConverterConfig('pdf-ocr');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<string>('eng');

  // Page range selection
  const [rangeMode, setRangeMode] = useState<'all' | 'custom'>('all');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentPageProcessing, setCurrentPageProcessing] = useState<number>(0);
  const [totalInBatch, setTotalInBatch] = useState<number>(0);
  const [progressInfo, setProgressInfo] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Results
  const [pageResults, setPageResults] = useState<PageOcrData[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<'all' | number>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Handle PDF file upload
  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    setError(null);
    setTotalPages(0);
    setPageResults([]);
    setActiveViewTab('all');

    if (!file) return;

    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
      });

      const pdfDoc = await loadingTask.promise;
      const count = pdfDoc.numPages || 0;
      setTotalPages(count);
      setStartPage(1);
      setEndPage(Math.min(count, 5)); // default first 5 pages or all if fewer
    } catch (err: any) {
      setError(err?.message || 'Could not parse PDF document. The file may be password protected or corrupted.');
    }
  };

  // Run PDF OCR
  const handleStartOcr = async () => {
    if (!selectedFile || totalPages <= 0) return;

    setIsProcessing(true);
    setError(null);
    setPageResults([]);
    isCancelledRef.current = false;

    const from = rangeMode === 'all' ? 1 : Math.max(1, Math.min(startPage, totalPages));
    const to = rangeMode === 'all' ? totalPages : Math.max(from, Math.min(endPage, totalPages));
    const pagesToProcess: number[] = [];
    for (let i = from; i <= to; i++) {
      pagesToProcess.push(i);
    }

    setTotalInBatch(pagesToProcess.length);
    setProgressInfo({ status: 'initializing tesseract wasm and loading dictionary', progress: 0.05 });

    let worker: any = null;

    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      // Initialize single worker for all pages
      worker = await createOcrWorker(selectedLang, (p) => {
        setProgressInfo(p);
      });

      const results: PageOcrData[] = [];

      for (let idx = 0; idx < pagesToProcess.length; idx++) {
        if (isCancelledRef.current) break;

        const pageNum = pagesToProcess[idx];
        setCurrentPageProcessing(pageNum);
        setProgressInfo({
          status: `Rendering & OCR'ing page ${pageNum} (${idx + 1} of ${pagesToProcess.length})`,
          progress: (idx) / pagesToProcess.length,
        });

        // Render PDF page to high-res canvas (scale 2.0 = ~150-200 DPI suitable for OCR)
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to acquire 2D canvas context for page rendering.');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        // OCR this rendered page
        const ocr = await runOcrWithWorker(worker, canvas);

        const pageData: PageOcrData = {
          pageNumber: pageNum,
          text: ocr.text,
          confidence: ocr.confidence,
          wordCount: ocr.wordCount,
          charCount: ocr.charCount,
        };

        results.push(pageData);
        setPageResults([...results]);
      }
    } catch (err: any) {
      console.error('PDF OCR error:', err);
      setError(err?.message || 'Error occurred while performing optical character recognition on PDF.');
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // Ignore termination errors
        }
      }
      setIsProcessing(false);
      setProgressInfo(null);
      setCurrentPageProcessing(0);
    }
  };

  const handleCancelOcr = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
  };

  // Aggregated text across all processed pages
  const getCombinedText = (): string => {
    return pageResults
      .map((p) => `--- Page ${p.pageNumber} ---\n\n${p.text.trim()}`)
      .join('\n\n\n');
  };

  // Download all pages text
  const handleDownloadAllTxt = () => {
    const text = getCombinedText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download single active page text
  const handleDownloadSinglePageTxt = (pageNum: number) => {
    const item = pageResults.find((p) => p.pageNumber === pageNum);
    if (!item?.text) return;
    const blob = new Blob([item.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'document';
    a.download = `${baseName}-page-${pageNum}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Aggregate metrics
  const totalWords = pageResults.reduce((acc, p) => acc + p.wordCount, 0);
  const totalChars = pageResults.reduce((acc, p) => acc + p.charCount, 0);
  const avgConfidence = pageResults.length > 0
    ? Math.round(pageResults.reduce((acc, p) => acc + p.confidence, 0) / pageResults.length)
    : 0;

  const currentDisplayPageData = typeof activeViewTab === 'number'
    ? pageResults.find((p) => p.pageNumber === activeViewTab)
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Accuracy disclaimer banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-semibold">Client-Side Scanned Document Processing</p>
          <p className="leading-relaxed">
            All PDF pages are rasterized and OCR'd locally inside your web browser. No document pages or data are ever uploaded to any server. Multi-page OCR is computationally intensive; processing 10+ high-resolution pages may take 30–60 seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-5 space-y-6">
          <FileUploadBox
            config={config || {
              id: 'pdf-ocr',
              route: '/pdf-ocr/',
              title: 'PDF OCR Tool',
              description: 'Extract text from scanned PDF files',
              category: 'PDF & Document',
              inputFormats: ['PDF'],
              outputFormats: ['TXT'],
              defaultOutputFormat: 'TXT',
              mimeTypes: ['application/pdf'],
              fileExtensions: ['.pdf'],
              maxFileSizeMB: 50,
              conversionCapabilities: ['pdf-ocr-extraction'],
              supportsMultipleFiles: false,
              supportsBatchConversion: false,
              relatedToolIds: [],
            }}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            error={error}
            onError={setError}
            title="Drop scanned PDF here, or browse"
            subtitle="Real PDF files up to 50MB"
          />

          {selectedFile && totalPages > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Document Info
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Found
                </span>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <span>Document Language</span>
                </label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                >
                  {SUPPORTED_OCR_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Range Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Pages to OCR
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRangeMode('all')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      rangeMode === 'all'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    All Pages (1–{totalPages})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeMode('custom')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      rangeMode === 'custom'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>

                {rangeMode === 'custom' && (
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="text-slate-600 dark:text-zinc-400">Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, Math.min(Number(e.target.value), totalPages)))}
                      disabled={isProcessing}
                      className="w-16 px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-center font-mono text-slate-900 dark:text-white"
                    />
                    <span className="text-slate-600 dark:text-zinc-400">to</span>
                    <input
                      type="number"
                      min={startPage}
                      max={totalPages}
                      value={endPage}
                      onChange={(e) => setEndPage(Math.max(startPage, Math.min(Number(e.target.value), totalPages)))}
                      disabled={isProcessing}
                      className="w-16 px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-center font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Start & Cancel Buttons */}
              <div className="pt-2">
                {!isProcessing ? (
                  <button
                    onClick={handleStartOcr}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Start PDF OCR Recognition</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCancelOcr}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <StopCircle className="w-4 h-4 text-red-400" />
                    <span>Cancel OCR Operation</span>
                  </button>
                )}
              </div>

              {/* Real Progress Feedback */}
              {isProcessing && progressInfo && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span className="truncate max-w-[200px]">{progressInfo.status}</span>
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

        {/* Right Column: Extracted Document Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[440px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>OCR Document Results</span>
                </span>
                {pageResults.length > 0 && (
                  <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Avg. Confidence: {avgConfidence}%
                  </span>
                )}
              </div>

              {pageResults.length > 0 ? (
                <div className="space-y-4">
                  {/* Real Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pages</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{pageResults.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Words</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{totalWords}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Characters</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{totalChars}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">File Size</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {formatBytes(new Blob([getCombinedText()]).size)}
                      </p>
                    </div>
                  </div>

                  {/* Page Selector Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setActiveViewTab('all')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        activeViewTab === 'all'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                      }`}
                    >
                      All Pages Combined
                    </button>
                    {pageResults.map((p) => (
                      <button
                        key={p.pageNumber}
                        onClick={() => setActiveViewTab(p.pageNumber)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          activeViewTab === p.pageNumber
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                        }`}
                      >
                        Page {p.pageNumber}
                      </button>
                    ))}
                  </div>

                  {/* Displayed Text Content */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-zinc-200 whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
                    {activeViewTab === 'all' ? getCombinedText() : (currentDisplayPageData?.text || 'No text extracted on this page.')}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-zinc-600 space-y-3">
                  <FileText className="w-12 h-12 stroke-[1.5]" />
                  <p className="text-sm">
                    {isProcessing
                      ? `Processing page ${currentPageProcessing} of ${totalInBatch}...`
                      : 'Upload a PDF file and click "Start PDF OCR Recognition" to extract text.'}
                  </p>
                </div>
              )}
            </div>

            {pageResults.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-2">
                {activeViewTab === 'all' ? (
                  <button
                    onClick={handleDownloadAllTxt}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Pages (.txt)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadSinglePageTxt(activeViewTab as number)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Page {activeViewTab} (.txt)</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    handleCopyText(
                      activeViewTab === 'all' ? getCombinedText() : currentDisplayPageData?.text || ''
                    )
                  }
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
              Each PDF page is rendered to high-density bitmap memory before parsing through Tesseract's neural optical recognition engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
