/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, Suspense } from 'react';
import { lazyTracked } from './utils/lazyTracked';
import {
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import {
  detectFormat,
  formatBytes,
  convertImage,
  SUPPORTED_FORMATS,
  ImageFormat,
  InputImageFormat,
  ConversionResult
} from './utils/converter';

import Navbar from './components/Navbar';
import BrandLogo from './components/BrandLogo';
import SEOHead from './components/SEOHead';
import FileUploadBox from './components/FileUploadBox';
import TargetFormatSelector from './components/TargetFormatSelector';
import RelatedToolsSection from './components/RelatedToolsSection';
import ToolShell from './components/ToolShell';
import { CATEGORY_HUBS } from './config/structured-data';
import NotFoundPage from './components/NotFoundPage';
import { PageH1Context } from './components/PageH1';
import { getPageH1 } from './config/page-heading';
import ConsentBanner from './components/ConsentBanner';
import { HOME_TITLE, HOME_DESCRIPTION, HOME_FAQS, HOME_INTRO, HOME_ANSWER } from './config/home-content';
import { toolNameFromTitle } from './config/tool-name';
import { CONVERSION_PAGES, isImageLandingPage } from './config/conversions.config';
import { getConverterConfig } from './config/converters.config';
import { PUBLIC_ROUTES, findRouteConfig } from './config/routes.config';
import { SOCIAL_LINKS } from './config/site.config';

const AudioConverter = lazyTracked('./components/AudioConverter', () => import('./components/AudioConverter'));
const DocumentConverter = lazyTracked('./components/DocumentConverter', () => import('./components/DocumentConverter'));
const Compressor = lazyTracked('./components/Compressor', () => import('./components/Compressor'));
const MergeFiles = lazyTracked('./components/MergeFiles', () => import('./components/MergeFiles'));
const ChangelogPage = lazyTracked('./components/ChangelogPage', () => import('./components/ChangelogPage'));
const ToolPageSection = lazyTracked('./components/ToolPageSection', () => import('./components/ToolPageSection'));
const CreateArchive = lazyTracked('./components/CreateArchive', () => import('./components/CreateArchive'));
const ExtractArchive = lazyTracked('./components/ExtractArchive', () => import('./components/ExtractArchive'));
const ZipViewer = lazyTracked('./components/archive/ZipViewer', () => import('./components/archive/ZipViewer'));
const BulkFileZipper = lazyTracked('./components/archive/BulkFileZipper', () => import('./components/archive/BulkFileZipper'));
const SplitZip = lazyTracked('./components/archive/SplitZip', () => import('./components/archive/SplitZip'));
const TarToZip = lazyTracked('./components/archive/TarToZip', () => import('./components/archive/TarToZip'));
const ZipToTar = lazyTracked('./components/archive/ZipToTar', () => import('./components/archive/ZipToTar'));
const ExtractTar = lazyTracked('./components/archive/ExtractTar', () => import('./components/archive/ExtractTar'));
const TrustPage = lazyTracked('./components/TrustPage', () => import('./components/TrustPage'));
const SupportedFormatsPage = lazyTracked('./components/SupportedFormatsPage', () => import('./components/SupportedFormatsPage'));
const FileSecurityPage = lazyTracked('./components/FileSecurityPage', () => import('./components/FileSecurityPage'));
const GuidesSection = lazyTracked('./components/GuidesSection', () => import('./components/GuidesSection'));
const ToolsDirectoryPage = lazyTracked('./components/ToolsDirectoryPage', () => import('./components/ToolsDirectoryPage'));

const DeveloperToolsHub = lazyTracked('./components/developer/DeveloperToolsHub', () => import('./components/developer/DeveloperToolsHub'));
const DeveloperToolWrapper = lazyTracked('./components/developer/DeveloperToolWrapper', () => import('./components/developer/DeveloperToolWrapper'));
const JsonTools = lazyTracked('./components/developer/JsonTools', () => import('./components/developer/JsonTools'));
const EncodingTools = lazyTracked('./components/developer/EncodingTools', () => import('./components/developer/EncodingTools'));
const HashingTools = lazyTracked('./components/developer/HashingTools', () => import('./components/developer/HashingTools'));
const FormatterTools = lazyTracked('./components/developer/FormatterTools', () => import('./components/developer/FormatterTools'));
const GeneratorTools = lazyTracked('./components/developer/GeneratorTools', () => import('./components/developer/GeneratorTools'));
const TextDevTools = lazyTracked('./components/developer/TextDevTools', () => import('./components/developer/TextDevTools'));
const ColorTools = lazyTracked('./components/developer/ColorTools', () => import('./components/developer/ColorTools'));
const DeveloperConversionTools = lazyTracked('./components/developer/DeveloperConversionTools', () => import('./components/developer/DeveloperConversionTools'));

const TransformTools = lazyTracked('./components/image/TransformTools', () => import('./components/image/TransformTools'));
const AdjustTools = lazyTracked('./components/image/AdjustTools', () => import('./components/image/AdjustTools'));
const CompositeTools = lazyTracked('./components/image/CompositeTools', () => import('./components/image/CompositeTools'));
const AnalysisTools = lazyTracked('./components/image/AnalysisTools', () => import('./components/image/AnalysisTools'));
const CompressTools = lazyTracked('./components/image/CompressTools', () => import('./components/image/CompressTools'));

const PdfToolsHub = lazyTracked('./components/pdf/PdfToolsHub', () => import('./components/pdf/PdfToolsHub'));
const PdfMergeTool = lazyTracked('./components/pdf/PdfMergeTool', () => import('./components/pdf/PdfMergeTool'));
const PdfSplitTool = lazyTracked('./components/pdf/PdfSplitTool', () => import('./components/pdf/PdfSplitTool'));
const PdfExtractPagesTool = lazyTracked('./components/pdf/PdfExtractPagesTool', () => import('./components/pdf/PdfExtractPagesTool'));
const PdfRemovePagesTool = lazyTracked('./components/pdf/PdfRemovePagesTool', () => import('./components/pdf/PdfRemovePagesTool'));
const PdfRotateTool = lazyTracked('./components/pdf/PdfRotateTool', () => import('./components/pdf/PdfRotateTool'));
const PdfOrganizeTool = lazyTracked('./components/pdf/PdfOrganizeTool', () => import('./components/pdf/PdfOrganizeTool'));
const PdfCropTool = lazyTracked('./components/pdf/PdfCropTool', () => import('./components/pdf/PdfCropTool'));
const PdfResizeTool = lazyTracked('./components/pdf/PdfResizeTool', () => import('./components/pdf/PdfResizeTool'));
const PdfPageNumbersTool = lazyTracked('./components/pdf/PdfPageNumbersTool', () => import('./components/pdf/PdfPageNumbersTool'));
const PdfWatermarkTool = lazyTracked('./components/pdf/PdfWatermarkTool', () => import('./components/pdf/PdfWatermarkTool'));
const JpgToPdfTool = lazyTracked('./components/pdf/JpgToPdfTool', () => import('./components/pdf/JpgToPdfTool'));
const PdfMetadataEditorTool = lazyTracked('./components/pdf/PdfMetadataEditorTool', () => import('./components/pdf/PdfMetadataEditorTool'));
const PdfFlattenTool = lazyTracked('./components/pdf/PdfFlattenTool', () => import('./components/pdf/PdfFlattenTool'));
const PdfFillFormTool = lazyTracked('./components/pdf/PdfFillFormTool', () => import('./components/pdf/PdfFillFormTool'));

const DocxToHtmlTool = lazyTracked('./components/docs/DocxToHtmlTool', () => import('./components/docs/DocxToHtmlTool'));
const DocxToMarkdownTool = lazyTracked('./components/docs/DocxToMarkdownTool', () => import('./components/docs/DocxToMarkdownTool'));
const DocxToTextTool = lazyTracked('./components/docs/DocxToTextTool', () => import('./components/docs/DocxToTextTool'));
const MarkdownToHtmlTool = lazyTracked('./components/docs/MarkdownToHtmlTool', () => import('./components/docs/MarkdownToHtmlTool'));
const HtmlToMarkdownTool = lazyTracked('./components/docs/HtmlToMarkdownTool', () => import('./components/docs/HtmlToMarkdownTool'));
const MarkdownToPdfTool = lazyTracked('./components/docs/MarkdownToPdfTool', () => import('./components/docs/MarkdownToPdfTool'));
const CsvToMarkdownTool = lazyTracked('./components/docs/CsvToMarkdownTool', () => import('./components/docs/CsvToMarkdownTool'));
const HtmlToTextTool = lazyTracked('./components/docs/HtmlToTextTool', () => import('./components/docs/HtmlToTextTool'));
const EpubToTextTool = lazyTracked('./components/docs/EpubToTextTool', () => import('./components/docs/EpubToTextTool'));
const EpubToHtmlTool = lazyTracked('./components/docs/EpubToHtmlTool', () => import('./components/docs/EpubToHtmlTool'));
const DocxToPdfTool = lazyTracked('./components/docs/DocxToPdfTool', () => import('./components/docs/DocxToPdfTool'));

const Mp3Compressor = lazyTracked('./components/audio/Mp3Compressor', () => import('./components/audio/Mp3Compressor'));
const AudioTrimmer = lazyTracked('./components/audio/AudioTrimmer', () => import('./components/audio/AudioTrimmer'));
const AudioMerger = lazyTracked('./components/audio/AudioMerger', () => import('./components/audio/AudioMerger'));
const AudioSpeedChanger = lazyTracked('./components/audio/AudioSpeedChanger', () => import('./components/audio/AudioSpeedChanger'));
const AudioVolume = lazyTracked('./components/audio/AudioVolume', () => import('./components/audio/AudioVolume'));
const AudioReverser = lazyTracked('./components/audio/AudioReverser', () => import('./components/audio/AudioReverser'));
const AudioToMono = lazyTracked('./components/audio/AudioToMono', () => import('./components/audio/AudioToMono'));
const AudioInfo = lazyTracked('./components/audio/AudioInfo', () => import('./components/audio/AudioInfo'));
const VoiceRecorder = lazyTracked('./components/audio/VoiceRecorder', () => import('./components/audio/VoiceRecorder'));
const SilenceRemover = lazyTracked('./components/audio/SilenceRemover', () => import('./components/audio/SilenceRemover'));

const VideoConverterTool = lazyTracked('./components/video/VideoConverterTool', () => import('./components/video/VideoConverterTool'));
const VideoCompressorTool = lazyTracked('./components/video/VideoCompressorTool', () => import('./components/video/VideoCompressorTool'));
const VideoTrimmerTool = lazyTracked('./components/video/VideoTrimmerTool', () => import('./components/video/VideoTrimmerTool'));
const VideoCropTool = lazyTracked('./components/video/VideoCropTool', () => import('./components/video/VideoCropTool'));
const VideoToGifTool = lazyTracked('./components/video/VideoToGifTool', () => import('./components/video/VideoToGifTool'));
const GifToMp4Tool = lazyTracked('./components/video/GifToMp4Tool', () => import('./components/video/GifToMp4Tool'));
const VideoToMp3Tool = lazyTracked('./components/video/VideoToMp3Tool', () => import('./components/video/VideoToMp3Tool'));
const MuteVideoTool = lazyTracked('./components/video/MuteVideoTool', () => import('./components/video/MuteVideoTool'));
const VideoResizeTool = lazyTracked('./components/video/VideoResizeTool', () => import('./components/video/VideoResizeTool'));
const ExtractFramesTool = lazyTracked('./components/video/ExtractFramesTool', () => import('./components/video/ExtractFramesTool'));
const VideoInfoTool = lazyTracked('./components/video/VideoInfoTool', () => import('./components/video/VideoInfoTool'));

const GifMakerTool = lazyTracked('./components/gif/GifMakerTool', () => import('./components/gif/GifMakerTool'));
const GifResizerTool = lazyTracked('./components/gif/GifResizerTool', () => import('./components/gif/GifResizerTool'));
const GifSplitterTool = lazyTracked('./components/gif/GifSplitterTool', () => import('./components/gif/GifSplitterTool'));

const QrGeneratorTool = lazyTracked('./components/qr/QrGeneratorTool', () => import('./components/qr/QrGeneratorTool'));
const QrReaderTool = lazyTracked('./components/qr/QrReaderTool', () => import('./components/qr/QrReaderTool'));
const BarcodeGeneratorTool = lazyTracked('./components/barcode/BarcodeGeneratorTool', () => import('./components/barcode/BarcodeGeneratorTool'));
const WifiQrGeneratorTool = lazyTracked('./components/qr/WifiQrGeneratorTool', () => import('./components/qr/WifiQrGeneratorTool'));
const VCardGeneratorTool = lazyTracked('./components/qr/VCardGeneratorTool', () => import('./components/qr/VCardGeneratorTool'));
const ImageToTextTool = lazyTracked('./components/ocr/ImageToTextTool', () => import('./components/ocr/ImageToTextTool'));
const PdfOcrTool = lazyTracked('./components/ocr/PdfOcrTool', () => import('./components/ocr/PdfOcrTool'));

const UtilitiesHub = lazyTracked('./components/utilities/UtilitiesHub', () => import('./components/utilities/UtilitiesHub'));
const UtilityToolWrapper = lazyTracked('./components/utilities/UtilityToolWrapper', () => import('./components/utilities/UtilityToolWrapper'));
const TextUtilities = lazyTracked('./components/utilities/TextUtilities', () => import('./components/utilities/TextUtilities'));
const ConverterUtilities = lazyTracked('./components/utilities/ConverterUtilities', () => import('./components/utilities/ConverterUtilities'));
const CalculatorUtilities = lazyTracked('./components/utilities/CalculatorUtilities', () => import('./components/utilities/CalculatorUtilities'));
const GeneratorUtilities = lazyTracked('./components/utilities/GeneratorUtilities', () => import('./components/utilities/GeneratorUtilities'));
const FunUtilities = lazyTracked('./components/utilities/FunUtilities', () => import('./components/utilities/FunUtilities'));

export type ToolMode = string;

// Hubs that are registered as tools but render a directory, not a single tool.
const HUB_TOOL_IDS = new Set(['pdf-tools', 'developer-tools']);

export default function App({ initialPath }: { initialPath?: string } = {}) {
  // initialPath is passed when the page is pre-rendered at build time (no window on the server).
  const [currentPath, setCurrentPath] = useState(() => initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'));

  const getCleanMode = (rawPath: string): string => {
    if (!rawPath || rawPath === '/' || rawPath === '/index.html' || rawPath === '') {
      return 'image-converter';
    }
    const clean = rawPath.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    return clean || 'image-converter';
  };

  const activeMode = getCleanMode(currentPath);

  const activeToolConfig = getConverterConfig(activeMode) || getConverterConfig('image-converter')!;

  const navigateTo = (path: string) => {
    let cleanPath = path.split('?')[0].split('#')[0];
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath !== '/' && !cleanPath.endsWith('/')) cleanPath += '/';
    window.history.pushState(null, '', cleanPath);
    setCurrentPath(cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Ensure URL has trailing slash if not root and not a static file
    const rawPath = window.location.pathname;
    if (rawPath !== '/' && !rawPath.endsWith('/') && !rawPath.includes('.')) {
      const formatted = rawPath + '/' + window.location.search + window.location.hash;
      window.history.replaceState(null, '', formatted);
      setCurrentPath(rawPath + '/');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Starts false so the first client render matches the pre-rendered HTML (hydration); the real
  // value is read after mount. The <html class="dark"> itself is set before paint by index.html.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    setThemeReady(true);
  }, []);


  const [file, setFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<InputImageFormat | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat | null>(null);
  const [quality, setQuality] = useState<number>(0.9);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleReset();
  }, [activeMode]);

  useEffect(() => {
    if (!themeReady) return;
    try {
      localStorage.setItem('ic_dark_mode', String(isDarkMode));
    } catch {
      /* storage unavailable */
    }
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode, themeReady]);


  const handleFileSelect = (selectedFile: File | null) => {
    setError(null);
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setDetectedFormat(null);
      setTargetFormat(null);
      return;
    }

    const config = CONVERSION_PAGES[activeMode];
    const format = detectFormat(selectedFile);

    if (!format) {
      setError('Please select a supported image file (PNG, JPG, JFIF, WEBP, GIF, BMP, SVG or HEIC).');
      return;
    }

    setFile(selectedFile);
    setDetectedFormat(format);

    if (config) {
      setTargetFormat(config.toFormat as ImageFormat);
    } else if (format) {
      const targets = activeToolConfig.outputFormats.map((f) => f.toLowerCase() as ImageFormat);
      const filtered = targets.filter((t) => t !== format);
      setTargetFormat(filtered[0] || ('jpg' as ImageFormat));
    }
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) {
      setError('Please select a file and target output format.');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const conversionResult = await convertImage(file, targetFormat, quality);
      setResult(conversionResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDetectedFormat(null);
    setTargetFormat(null);
    setResult(null);
    setError(null);
    setQuality(0.9);
  };

  const handleDownload = () => {
    if (!result || !file) return;

    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newExtension = SUPPORTED_FORMATS[result.format]?.ext || result.format;
    const downloadName = `${originalNameWithoutExt}_converted.${newExtension}`;

    const link = document.createElement('a');
    link.href = result.url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSizeSavings = () => {
    if (!file || !result) return null;
    const difference = file.size - result.size;
    const percent = Math.round((difference / file.size) * 100);
    return { difference, percent };
  };

  const savings = getSizeSavings();

  const renderImageConverterCard = () => {
    return (
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-5 md:p-6 flex flex-col space-y-4 sm:space-y-5 relative overflow-hidden text-left">
        {isConverting && (
          <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-red-600 animate-spin" />
            <p className="mt-4 font-display font-black text-slate-800 dark:text-white text-lg">Converting your image...</p>
            <p className="mt-1 text-slate-400 dark:text-zinc-500 text-xs font-mono">Running browser Canvas translation</p>
          </div>
        )}

        <FileUploadBox
          config={activeToolConfig}
          selectedFile={file}
          onFileSelect={handleFileSelect}
          error={error}
          onError={setError}
        />

        {file && !result && (
          <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Target Output Format Selector */}
            <TargetFormatSelector
              formats={activeToolConfig.outputFormats}
              selectedFormat={targetFormat ? targetFormat.toUpperCase() : ''}
              onChange={(fmt) => setTargetFormat(fmt.toLowerCase() as ImageFormat)}
            />

            {/* Quality Settings */}
            {(targetFormat === 'jpg' || targetFormat === 'webp') && (
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    Output Quality
                  </label>
                  <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={handleConvert}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer text-sm min-h-[44px]"
              >
                <span>Convert Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl transition-all cursor-pointer text-sm min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success Page */}
        {file && result && (
          <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-zinc-800 animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Image successfully converted!</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
              <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-3 min-h-36">
                <img
                  src={result.url}
                  alt="Converted preview"
                  className="max-h-36 object-contain rounded shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  {result.width}x{result.height} px
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase block">Original</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{detectedFormat?.toUpperCase()}</span>
                  </div>
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40">
                    <span className="text-[10px] text-red-500 dark:text-red-400 font-semibold uppercase block">Converted</span>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400">{targetFormat?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original Size:</span>
                    <span className="font-bold">{formatBytes(file.size)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Output Size:</span>
                    <span className="font-bold">{formatBytes(result.size)}</span>
                  </div>
                </div>

                {savings && savings.difference > 0 && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-800 dark:text-emerald-400 font-bold text-[11px] flex justify-between items-center">
                    <span>Optimized Footprint:</span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-mono text-[10px]">
                      -{savings.percent}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 dark:bg-[#b93c3c] dark:hover:bg-[#a13333] text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-red-100 dark:shadow-none transition-all cursor-pointer text-sm min-h-[44px]"
              >
                <span>Download Converted File</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl transition-all cursor-pointer text-sm min-h-[44px]"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActiveToolContent = () => {
    // Image-format landing pages embed the canvas image converter. Every other landing page
    // (PDF, video, audio, DOCX...) renders its dedicated tool below; its landing copy is shown
    // by ToolPageContent so the right tool is never replaced by the image converter.
    const landingConfig = CONVERSION_PAGES[activeMode];
    if (landingConfig && isImageLandingPage(landingConfig)) {
      const landingRoute = findRouteConfig(activeMode);
      return (
        <div className="w-full">
          <SEOHead
            title={landingConfig.title}
            description={landingConfig.metaDescription}
            path={landingRoute?.path || `/${activeMode}/`}
            faqs={landingConfig.faqs}
            steps={landingConfig.steps}
            breadcrumbName={`${landingConfig.fromFormat.toUpperCase()} to ${landingConfig.toFormat.toUpperCase()} converter`}
            toolCategory={getConverterConfig(activeMode)?.category || 'Image'}
            h1={landingConfig.h1}
          />
          <div className="flex justify-center w-full">{renderImageConverterCard()}</div>
        </div>
      );
    }

    switch (activeMode) {
      case 'image-converter':
        return (
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            <SEOHead title={HOME_TITLE} description={HOME_DESCRIPTION} path="/" faqs={HOME_FAQS} />
            
            {/* Hero Header Section */}
            <div className="text-center space-y-1.5 sm:space-y-2 max-w-2xl mx-auto px-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                <Zap className="w-3.5 h-3.5" /> Client-Side In-Browser File Conversion
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white font-display leading-tight">
                Free Online File Converter &amp; Tools
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
                {HOME_INTRO}
              </p>
            </div>

            {/* Core Converter Card - Front & Center Above the Fold */}
            <div className="flex justify-center w-full">
              {renderImageConverterCard()}
            </div>

            {/* Direct Answer Box for AI search engines & users */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 md:p-7 max-w-3xl mx-auto space-y-2 sm:space-y-2.5 text-left">
              <div className="flex items-center space-x-2 text-xs font-bold font-mono text-red-600 dark:text-red-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>What is Nexvert?</span>
              </div>
              <p className="text-slate-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {HOME_ANSWER}
              </p>
            </div>

            {/* Category Directory Navigation Grid */}
            <div className="max-w-3xl mx-auto space-y-4 text-left">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white font-display">
                  Explore File Conversion Categories
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Select a category to browse specialized converter tools and format utilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <a
                  href="/image-tools/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/image-tools'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Images &amp; Photos</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">PNG, JPG, WEBP, HEIC</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Lossless &amp; lossy image tools &rarr;</span>
                </a>

                <a
                  href="/pdf-tools/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/pdf-tools'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Documents &amp; PDFs</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">PDF, DOCX, TXT, EPUB</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Merge, split, and edit docs &rarr;</span>
                </a>

                <a
                  href="/audio-tools/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/audio-tools'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Audio Streams</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">MP3, WAV, OGG, M4A</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Extract and transcode audio &rarr;</span>
                </a>

                <a
                  href="/video-tools/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/video-tools'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Video &amp; Animation</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">MP4, WebM, MOV, GIF</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Convert and compress video &rarr;</span>
                </a>

                <a
                  href="/archive-tools/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/archive-tools'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Archives &amp; Zip</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">ZIP, TAR, GZ</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Extract and bundle files &rarr;</span>
                </a>

                <a
                  href="/supported-formats/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/supported-formats'); }}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 rounded-2xl text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase block mb-1">Formats Index</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">50+ Format Specs</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">View compatibility matrix &rarr;</span>
                </a>
              </div>
            </div>

            {/* Popular Conversion Routes Grid */}
            <div className="max-w-3xl mx-auto space-y-6 pt-4 text-left">
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white font-display">
                  Popular Direct Conversion Tools
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Access specialized conversion tools with custom compression tuning and format comparison specifications.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {Object.values(CONVERSION_PAGES).slice(0, 16).map((page) => (
                  <a
                    key={page.slug}
                    href={`/${page.slug}/`}
                    onClick={(e) => { e.preventDefault(); navigateTo(`/${page.slug}`); }}
                    className="group cursor-pointer bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 hover:border-red-500 dark:border-zinc-800 dark:hover:border-red-900 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between transition-all shadow-sm text-left h-20 sm:h-24"
                  >
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase font-mono">{page.fromFormat.toUpperCase()}</span>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-zinc-200 truncate pr-1">
                        {page.h1.replace(/^(Free|Convert)\s+/i, '').replace(/\s+Free$/i, '')}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* 4-Step Execution Instructions */}
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display border-b border-slate-200 dark:border-zinc-800 pb-2">
                How File Conversion Works in 4 Steps
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">Choose Your File</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">
                    Drag and drop or select your input document, photo, audio, or video file.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">Select Output Format</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">
                    Pick your desired format and adjust quality or compression settings if needed.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">In-Browser Processing</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">
                    WebAssembly and HTML5 Canvas transcode your file inside local device memory.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">Instant Download</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">
                    Save the converted file directly to your downloads folder without waiting for email links.
                  </p>
                </div>
              </div>
            </div>

            {/* Related tools section on home */}
            <RelatedToolsSection
              config={activeToolConfig}
              onNavigate={(route) => navigateTo(route)}
            />

            {/* Educational Knowledge & Blog Bridge Section */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Guides Hub Card */}
              <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Guides &amp; Tutorials
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Practical File Conversion Guides
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Step-by-step tutorials comparing formats like JPG vs PNG, explaining how to convert PDFs on iPhone/Android, and optimizing web images.
                  </p>
                </div>
                <a
                  href="/guides/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('/guides/');
                  }}
                  className="w-fit px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>Browse Guides Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Official Blog Bridge Card */}
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-red-500" /> Educational Blog
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nexvert Official Blog
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Deep dives into image compression algorithms, audio bitrates, vector rendering specs, and local browser security architecture.
                  </p>
                </div>
                <a
                  href="/guides/"
                  onClick={(e) => { e.preventDefault(); navigateTo('/guides'); }}
                  className="w-fit px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <span>Explore Guides &amp; Tutorials</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Comprehensive Entity Clarity & Platform Information Section */}
            <section className="max-w-4xl mx-auto space-y-6 sm:space-y-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm text-left">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 space-y-2">
                <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                  Entity Breakdown &amp; Technical Specifications
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 dark:text-white">
                  About Nexvert
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                  Nexvert provides browser-based document and media tools with client-side processing where supported.
                </p>
              </div>

              {/* Homepage FAQ — same text as the FAQPage schema and the pre-rendered HTML */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {HOME_FAQS.map((faq) => (
                  <div key={faq.question} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{faq.question}</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                See the{' '}
                <a href="/supported-formats/" onClick={(e) => { e.preventDefault(); navigateTo('/supported-formats'); }} className="text-red-600 font-bold hover:underline">Supported Formats Directory</a>
                {' '}and{' '}
                <a href="/file-security/" onClick={(e) => { e.preventDefault(); navigateTo('/file-security'); }} className="text-red-600 font-bold hover:underline">File Security &amp; Privacy</a>
                {' '}pages for details.
              </p>
            </section>
          </div>
        );
      default: {
        const routeMeta = findRouteConfig(activeMode);
        const seoNode = routeMeta ? (
          <SEOHead
            title={routeMeta.title}
            description={routeMeta.description}
            path={routeMeta.canonicalPath || routeMeta.path}
            breadcrumbName={toolNameFromTitle(routeMeta.title)}
            toolCategory={getConverterConfig(activeMode)?.category}
          />
        ) : null;

        if (activeMode === 'tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'developer-tools') {
          return (
            <div className="w-full">
              {seoNode}
              <DeveloperToolsHub onNavigate={navigateTo} />
            </div>
          );
        }

        if (activeMode === 'pdf-tools') {
          return <div className="w-full">{seoNode}<PdfToolsHub onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'document-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="PDF & Document" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'image-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="Image" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'audio-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="Audio" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'video-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="Video" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'archive-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="Archive" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'compression-tools') {
          return <div className="w-full">{seoNode}<ToolsDirectoryPage categoryFilter="Compression" onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'supported-formats') {
          return <div className="w-full">{seoNode}<SupportedFormatsPage onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'file-security') {
          return <div className="w-full">{seoNode}<FileSecurityPage onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'guides' || activeMode.startsWith('guides/')) {
          const guideSlug = activeMode.startsWith('guides/') ? activeMode.replace('guides/', '') : null;
          return <div className="w-full">{seoNode}<GuidesSection activeGuideSlug={guideSlug} onNavigate={navigateTo} /></div>;
        }

        if (
          activeMode === 'about' ||
          activeMode === 'contact' ||
          activeMode === 'privacy' ||
          activeMode === 'terms' ||
          activeMode === 'disclaimer' ||
          activeMode === 'cookie-policy'
        ) {
          return <div className="w-full">{seoNode}<TrustPage type={activeMode as any} onNavigate={navigateTo} /></div>;
        }

        if (activeMode === 'changelog') {
          return <div className="w-full">{seoNode}<ChangelogPage onNavigate={navigateTo} /></div>;
        }

        // Specific standalone utilities
        if (activeMode === 'merge-files') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<MergeFiles /></div>;
        }
        if (activeMode === 'create-archive' || activeMode === 'create-zip') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<CreateArchive /></div>;
        }
        if (activeMode === 'extract-archive' || activeMode === 'extract-zip') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<ExtractArchive /></div>;
        }
        if (activeMode === 'zip-viewer') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<ZipViewer /></div>;
        }
        if (activeMode === 'bulk-file-zipper') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<BulkFileZipper /></div>;
        }
        if (activeMode === 'split-zip') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<SplitZip /></div>;
        }
        if (activeMode === 'tar-to-zip') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<TarToZip /></div>;
        }
        if (activeMode === 'zip-to-tar') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<ZipToTar /></div>;
        }
        if (activeMode === 'extract-tar') {
          return <div className="w-full max-w-2xl mx-auto">{seoNode}<ExtractTar /></div>;
        }

        // Image Tool Suite
        const isTransformTool = [
          'resize-image', 'crop-image', 'rotate-image', 'flip-image', 'image-enlarger'
        ].includes(activeMode);
        if (isTransformTool) {
          return <div className="w-full">{seoNode}<TransformTools toolId={activeMode as any} /></div>;
        }

        const isAdjustTool = [
          'brightness-contrast', 'saturation-adjuster', 'grayscale-converter',
          'invert-colors', 'sepia-filter', 'blur-image', 'pixelate-image', 'image-sharpener'
        ].includes(activeMode);
        if (isAdjustTool) {
          return <div className="w-full">{seoNode}<AdjustTools toolId={activeMode as any} /></div>;
        }

        const isCompositeTool = [
          'add-watermark', 'add-border', 'round-corners', 'image-collage',
          'meme-generator', 'photo-to-sketch', 'image-color-picker', 'color-picker'
        ].includes(activeMode);
        if (isCompositeTool) {
          return <div className="w-full">{seoNode}<CompositeTools toolId={activeMode as any} /></div>;
        }

        const isAnalysisTool = [
          'image-metadata-viewer', 'remove-exif'
        ].includes(activeMode);
        if (isAnalysisTool) {
          return <div className="w-full">{seoNode}<AnalysisTools toolId={activeMode as any} /></div>;
        }

        const isCompressTool = [
          'image-compressor', 'bulk-image-compressor'
        ].includes(activeMode);
        if (isCompressTool) {
          return <div className="w-full">{seoNode}<CompressTools toolId={activeMode as any} /></div>;
        }

        // Dedicated PDF Tool Suite
        if (activeMode === 'pdf-merge') {
          return <div className="w-full">{seoNode}<PdfMergeTool /></div>;
        }
        if (activeMode === 'pdf-split') {
          return <div className="w-full">{seoNode}<PdfSplitTool /></div>;
        }
        if (activeMode === 'extract-pdf-pages' || activeMode === 'extract-pages-from-pdf') {
          return <div className="w-full">{seoNode}<PdfExtractPagesTool /></div>;
        }
        if (activeMode === 'remove-pdf-pages' || activeMode === 'pdf-page-remover') {
          return <div className="w-full">{seoNode}<PdfRemovePagesTool /></div>;
        }
        if (activeMode === 'rotate-pdf') {
          return <div className="w-full">{seoNode}<PdfRotateTool /></div>;
        }
        if (activeMode === 'organize-pdf') {
          return <div className="w-full">{seoNode}<PdfOrganizeTool /></div>;
        }
        if (activeMode === 'crop-pdf') {
          return <div className="w-full">{seoNode}<PdfCropTool /></div>;
        }
        if (activeMode === 'resize-pdf') {
          return <div className="w-full">{seoNode}<PdfResizeTool /></div>;
        }
        if (activeMode === 'add-page-numbers') {
          return <div className="w-full">{seoNode}<PdfPageNumbersTool /></div>;
        }
        if (activeMode === 'watermark-pdf') {
          return <div className="w-full">{seoNode}<PdfWatermarkTool /></div>;
        }
        if (activeMode === 'jpg-to-pdf') {
          return <div className="w-full">{seoNode}<JpgToPdfTool /></div>;
        }
        if (activeMode === 'pdf-metadata-editor') {
          return <div className="w-full">{seoNode}<PdfMetadataEditorTool /></div>;
        }
        if (activeMode === 'flatten-pdf') {
          return <div className="w-full">{seoNode}<PdfFlattenTool /></div>;
        }
        if (activeMode === 'fill-pdf-form') {
          return <div className="w-full">{seoNode}<PdfFillFormTool /></div>;
        }

        // Dedicated Document Tool Suite (Honest local parsers & renderers)
        if (activeMode === 'docx-to-html') {
          return <div className="w-full">{seoNode}<DocxToHtmlTool /></div>;
        }
        if (activeMode === 'docx-to-markdown') {
          return <div className="w-full">{seoNode}<DocxToMarkdownTool /></div>;
        }
        if (activeMode === 'docx-to-text') {
          return <div className="w-full">{seoNode}<DocxToTextTool /></div>;
        }
        if (activeMode === 'markdown-to-html') {
          return <div className="w-full">{seoNode}<MarkdownToHtmlTool /></div>;
        }
        if (activeMode === 'html-to-markdown') {
          return <div className="w-full">{seoNode}<HtmlToMarkdownTool /></div>;
        }
        if (activeMode === 'markdown-to-pdf') {
          return <div className="w-full">{seoNode}<MarkdownToPdfTool /></div>;
        }
        if (activeMode === 'csv-to-markdown') {
          return <div className="w-full">{seoNode}<CsvToMarkdownTool /></div>;
        }
        if (activeMode === 'html-to-text') {
          return <div className="w-full">{seoNode}<HtmlToTextTool /></div>;
        }
        if (activeMode === 'epub-to-text') {
          return <div className="w-full">{seoNode}<EpubToTextTool /></div>;
        }
        if (activeMode === 'epub-to-html') {
          return <div className="w-full">{seoNode}<EpubToHtmlTool /></div>;
        }
        if (activeMode === 'docx-to-pdf') {
          return <div className="w-full">{seoNode}<DocxToPdfTool /></div>;
        }

        // Dedicated Audio Tools
        if (activeMode === 'mp3-compressor') {
          return <div className="w-full">{seoNode}<Mp3Compressor /></div>;
        }
        if (activeMode === 'audio-trimmer' || activeMode === 'audio-cutter' || activeMode === 'mp3-cutter') {
          return <div className="w-full">{seoNode}<AudioTrimmer /></div>;
        }
        if (activeMode === 'audio-merger' || activeMode === 'audio-joiner') {
          return <div className="w-full">{seoNode}<AudioMerger /></div>;
        }
        if (activeMode === 'audio-speed-changer' || activeMode === 'audio-speed') {
          return <div className="w-full">{seoNode}<AudioSpeedChanger /></div>;
        }
        if (activeMode === 'audio-volume' || activeMode === 'audio-booster' || activeMode === 'audio-normalizer') {
          return <div className="w-full">{seoNode}<AudioVolume /></div>;
        }
        if (activeMode === 'audio-reverser') {
          return <div className="w-full">{seoNode}<AudioReverser /></div>;
        }
        if (activeMode === 'audio-to-mono') {
          return <div className="w-full">{seoNode}<AudioToMono /></div>;
        }
        if (activeMode === 'audio-info') {
          return <div className="w-full">{seoNode}<AudioInfo /></div>;
        }
        if (activeMode === 'voice-recorder') {
          return <div className="w-full">{seoNode}<VoiceRecorder /></div>;
        }
        if (activeMode === 'silence-remover') {
          return <div className="w-full">{seoNode}<SilenceRemover /></div>;
        }

        // Video Tools Suite
        if (activeMode === 'video-converter' || activeMode === 'mp4-converter' || activeMode === 'mov-to-mp4') {
          return <div className="w-full">{seoNode}<VideoConverterTool /></div>;
        }
        if (activeMode === 'video-compressor') {
          return <div className="w-full">{seoNode}<VideoCompressorTool /></div>;
        }
        if (activeMode === 'crop-video') {
          return <div className="w-full">{seoNode}<VideoCropTool /></div>;
        }
        if (activeMode === 'video-trimmer' || activeMode === 'trim-video') {
          return <div className="w-full">{seoNode}<VideoTrimmerTool /></div>;
        }
        if (activeMode === 'video-to-gif' || activeMode === 'mp4-to-gif' || activeMode === 'webm-to-gif' || activeMode === 'mov-to-gif' || activeMode === 'avi-to-gif') {
          return <div className="w-full">{seoNode}<VideoToGifTool /></div>;
        }
        if (activeMode === 'gif-to-mp4') {
          return <div className="w-full">{seoNode}<GifToMp4Tool /></div>;
        }
        if (activeMode === 'video-to-mp3' || activeMode === 'mp4-to-mp3') {
          return <div className="w-full">{seoNode}<VideoToMp3Tool /></div>;
        }
        if (activeMode === 'mute-video') {
          return <div className="w-full">{seoNode}<MuteVideoTool /></div>;
        }
        if (activeMode === 'video-resize') {
          return <div className="w-full">{seoNode}<VideoResizeTool /></div>;
        }
        if (activeMode === 'extract-video-frames' || activeMode === 'extract-frames') {
          return <div className="w-full">{seoNode}<ExtractFramesTool /></div>;
        }
        if (activeMode === 'video-info') {
          return <div className="w-full">{seoNode}<VideoInfoTool /></div>;
        }

        // GIF Tools Suite
        if (activeMode === 'gif-maker' || activeMode === 'image-to-gif') {
          return <div className="w-full">{seoNode}<GifMakerTool /></div>;
        }
        if (activeMode === 'gif-resizer') {
          return <div className="w-full">{seoNode}<GifResizerTool /></div>;
        }
        if (activeMode === 'gif-splitter') {
          return <div className="w-full">{seoNode}<GifSplitterTool /></div>;
        }

        // QR, Barcode & OCR Suite
        if (activeMode === 'qr-code-generator' || activeMode === 'qr-generator') {
          return <div className="w-full">{seoNode}<QrGeneratorTool /></div>;
        }
        if (activeMode === 'qr-reader' || activeMode === 'qr-scanner' || activeMode === 'qr-code-scanner') {
          return <div className="w-full">{seoNode}<QrReaderTool /></div>;
        }
        if (activeMode === 'barcode-generator') {
          return <div className="w-full">{seoNode}<BarcodeGeneratorTool /></div>;
        }
        if (activeMode === 'wifi-qr-generator') {
          return <div className="w-full">{seoNode}<WifiQrGeneratorTool /></div>;
        }
        if (activeMode === 'vcard-generator') {
          return <div className="w-full">{seoNode}<VCardGeneratorTool /></div>;
        }
        if (activeMode === 'image-to-text' || activeMode === 'ocr') {
          return <div className="w-full">{seoNode}<ImageToTextTool /></div>;
        }
        if (activeMode === 'pdf-ocr') {
          return <div className="w-full">{seoNode}<PdfOcrTool /></div>;
        }
        if (activeMode === 'utilities') {
          return <div className="w-full">{seoNode}<UtilitiesHub onNavigate={navigateTo} /></div>;
        }

        // Standard converter lookup via single source of truth
        const toolConfig = getConverterConfig(activeMode);
        if (toolConfig) {
          switch (toolConfig.category) {
            case 'Image':
              return (
                <div className="w-full">
                  {seoNode}
                  <div className="flex justify-center w-full">{renderImageConverterCard()}</div>
                </div>
              );
            case 'Audio':
            case 'Video':
            case 'GIF':
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<AudioConverter initialMode={activeMode} /></div>;
            case 'PDF & Document':
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<DocumentConverter initialMode={activeMode} /></div>;
            case 'Compression':
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<Compressor initialMode={activeMode} /></div>;
            case 'Archive':
              if (activeMode === 'create-archive' || activeMode === 'create-zip') return <div className="w-full max-w-2xl mx-auto">{seoNode}<CreateArchive /></div>;
              if (activeMode === 'extract-archive' || activeMode === 'extract-zip') return <div className="w-full max-w-2xl mx-auto">{seoNode}<ExtractArchive /></div>;
              if (activeMode === 'zip-viewer') return <div className="w-full max-w-2xl mx-auto">{seoNode}<ZipViewer /></div>;
              if (activeMode === 'bulk-file-zipper') return <div className="w-full max-w-2xl mx-auto">{seoNode}<BulkFileZipper /></div>;
              if (activeMode === 'split-zip') return <div className="w-full max-w-2xl mx-auto">{seoNode}<SplitZip /></div>;
              if (activeMode === 'tar-to-zip') return <div className="w-full max-w-2xl mx-auto">{seoNode}<TarToZip /></div>;
              if (activeMode === 'zip-to-tar') return <div className="w-full max-w-2xl mx-auto">{seoNode}<ZipToTar /></div>;
              if (activeMode === 'extract-tar') return <div className="w-full max-w-2xl mx-auto">{seoNode}<ExtractTar /></div>;
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<CreateArchive /></div>;
            case 'Tools':
              if (activeMode === 'merge-files') return <div className="w-full max-w-2xl mx-auto">{seoNode}<MergeFiles /></div>;
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<DocumentConverter initialMode={activeMode} /></div>;
            case 'Developer': {
              const isJsonTool = [
                'json-formatter', 'json-validator', 'json-minifier',
                'json-to-csv', 'json-to-xml', 'json-to-yaml', 'json-diff'
              ].includes(activeMode);

              const isEncodingTool = [
                'base64-encode', 'base64-decode', 'base64-to-image', 'image-to-base64',
                'url-encode', 'url-decode', 'html-entity-encode', 'jwt-decoder'
              ].includes(activeMode);

              const isHashingTool = [
                'sha256-generator', 'sha1-generator', 'sha512-generator', 'md5-generator', 'file-checksum'
              ].includes(activeMode);

              const isConversionTool = [
                'csv-to-json', 'xml-to-json', 'yaml-to-json'
              ].includes(activeMode);

              const isFormatterTool = [
                'html-formatter', 'css-formatter', 'js-formatter',
                'sql-formatter', 'xml-formatter', 'css-minifier'
              ].includes(activeMode);

              const isGeneratorTool = [
                'uuid-generator', 'password-generator', 'random-string', 'lorem-ipsum'
              ].includes(activeMode);

              const isTextDevTool = [
                'regex-tester', 'text-diff', 'timestamp-converter', 'cron-parser',
                'number-base-converter', 'slugify', 'case-converter', 'query-string-parser'
              ].includes(activeMode);

              const isColorTool = [
                'color-converter', 'color-palette-extractor', 'contrast-checker', 'gradient-generator'
              ].includes(activeMode);

              let childComponent = null;
              if (isJsonTool) childComponent = <JsonTools toolId={activeMode} />;
              else if (isConversionTool) childComponent = <DeveloperConversionTools toolId={activeMode} />;
              else if (isEncodingTool) childComponent = <EncodingTools toolId={activeMode} />;
              else if (isHashingTool) childComponent = <HashingTools toolId={activeMode} />;
              else if (isFormatterTool) childComponent = <FormatterTools toolId={activeMode} />;
              else if (isGeneratorTool) childComponent = <GeneratorTools toolId={activeMode} />;
              else if (isTextDevTool) childComponent = <TextDevTools toolId={activeMode} />;
              else if (isColorTool) childComponent = <ColorTools toolId={activeMode} />;

              return (
                <div className="w-full">
                  {seoNode}
                  <DeveloperToolWrapper toolId={activeMode} onNavigate={navigateTo}>
                    {childComponent}
                  </DeveloperToolWrapper>
                </div>
              );
            }
            case 'Utilities': {
              const isTextUtil = [
                'word-counter', 'remove-duplicate-lines', 'sort-lines', 'find-and-replace',
                'text-repeater', 'reverse-text', 'remove-line-breaks', 'whitespace-remover',
                'text-to-speech', 'character-map'
              ].includes(activeMode);

              const isConverterUtil = [
                'unit-converter', 'timezone-converter', 'roman-numeral-converter', 'number-to-words'
              ].includes(activeMode);

              const isCalculatorUtil = [
                'percentage-calculator', 'age-calculator', 'date-calculator', 'bmi-calculator',
                'loan-calculator', 'tip-calculator', 'discount-calculator', 'aspect-ratio-calculator',
                'gst-calculator'
              ].includes(activeMode);

              const isGeneratorUtil = [
                'signature-pad', 'invoice-generator', 'favicon-generator', 'og-image-generator',
                'placeholder-image'
              ].includes(activeMode);

              const isFunUtil = [
                'random-picker', 'dice-roller', 'coin-flip', 'random-number'
              ].includes(activeMode);

              let childComponent = null;
              if (isTextUtil) childComponent = <TextUtilities toolId={activeMode} />;
              else if (isConverterUtil) childComponent = <ConverterUtilities toolId={activeMode} />;
              else if (isCalculatorUtil) childComponent = <CalculatorUtilities toolId={activeMode} />;
              else if (isGeneratorUtil) childComponent = <GeneratorUtilities toolId={activeMode} />;
              else if (isFunUtil) childComponent = <FunUtilities toolId={activeMode} />;

              return (
                <div className="w-full">
                  {seoNode}
                  <UtilityToolWrapper toolId={activeMode} onNavigate={navigateTo}>
                    {childComponent}
                  </UtilityToolWrapper>
                </div>
              );
            }
            default:
              return <div className="w-full max-w-2xl mx-auto">{seoNode}<DocumentConverter initialMode={activeMode} /></div>;
          }
        }

        // Unknown route -> 404 page
        return <div className="w-full">{seoNode}<NotFoundPage onNavigate={navigateTo} /></div>;
      }
    }
  };

  const renderActiveTool = () => {
    const content = renderActiveToolContent();
    const toolConfig = getConverterConfig(activeMode);
    const routeMeta = findRouteConfig(activeMode);
    const landing = CONVERSION_PAGES[activeMode];
    const shouldShowRelated = Boolean(
      toolConfig &&
      activeMode !== 'image-converter' &&
      toolConfig.category !== 'Developer' &&
      toolConfig.category !== 'Utilities' &&
      !activeMode.endsWith('-tools') &&
      activeMode !== 'tools'
    );

    // Every tool page (not hubs, guides or info pages) gets the shared ToolShell header.
    const isToolPage = Boolean(
      routeMeta && activeMode !== 'image-converter' && !HUB_TOOL_IDS.has(activeMode) &&
      (toolConfig || (landing && isImageLandingPage(landing)))
    );
    const hub = toolConfig ? CATEGORY_HUBS[toolConfig.category] : CATEGORY_HUBS.Image;

    return (
      <div className="nexvert-tool-page w-full space-y-12">
        {isToolPage && routeMeta ? (
          <ToolShell
            h1={getPageH1(routeMeta.path) || routeMeta.title}
            description={toolConfig?.description || routeMeta.description}
            hub={hub ? { name: hub.name, path: hub.path } : undefined}
            onNavigate={navigateTo}
          >
            {/* Own boundary: a hydration mismatch inside one tool only re-renders that tool */}
            <Suspense fallback={<div className="w-full flex justify-center py-16"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
              {content}
            </Suspense>
          </ToolShell>
        ) : (
          content
        )}
        {routeMeta && activeMode !== 'image-converter' && (
          // Lazy chunk with the page copy + FAQ/HowTo schema; its HTML is already pre-rendered.
          <Suspense fallback={null}>
            <ToolPageSection
              path={routeMeta.path}
              canonicalPath={routeMeta.canonicalPath}
              title={routeMeta.title}
              description={routeMeta.description}
              toolTitle={toolConfig?.title}
              toolCategory={toolConfig?.category}
              withSeo={!(landing && isImageLandingPage(landing))}
            />
          </Suspense>
        )}
        {shouldShowRelated && toolConfig && (
          <div className="w-full pt-8 border-t border-slate-200 dark:border-zinc-800">
            <RelatedToolsSection config={toolConfig} onNavigate={navigateTo} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 font-sans flex flex-col antialiased transition-colors duration-200">
      <Navbar 
        activeMode={activeMode} 
        onModeChange={(mode) => navigateTo(mode === 'image-converter' ? '/' : `/${mode}`)} 
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />


      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 md:py-6 lg:py-7 flex flex-col items-center">
        <Suspense fallback={
          <div className="w-full flex items-center justify-center py-24 text-slate-400">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <PageH1Context.Provider value={getPageH1(currentPath)}>{renderActiveTool()}</PageH1Context.Provider>
        </Suspense>
      </main>

      <footer className="w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-zinc-500 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BrandLogo size={28} showText={false} />
            <span className="font-bold text-slate-800 dark:text-slate-200 font-display text-sm tracking-tight">
              Nexvert
            </span>
          </a>
          <span className="hidden sm:inline text-slate-400">&bull;</span>
          <span className="text-[11px] text-slate-400">Browser-Based File Conversion</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-slate-600 dark:text-zinc-400 font-semibold max-w-4xl mx-auto">
          <a href="/utilities/" onClick={(e) => { e.preventDefault(); navigateTo('/utilities'); }} className="hover:underline text-red-600 dark:text-red-400">Utilities Hub</a>
          <span>&bull;</span>
          <a href="/developer-tools/" onClick={(e) => { e.preventDefault(); navigateTo('/developer-tools'); }} className="hover:underline text-red-600 dark:text-red-400">Developer Tools</a>
          <span>&bull;</span>
          <a href="/supported-formats/" onClick={(e) => { e.preventDefault(); navigateTo('/supported-formats'); }} className="hover:underline">Supported Formats</a>
          <span>&bull;</span>
          <a href="/file-security/" onClick={(e) => { e.preventDefault(); navigateTo('/file-security'); }} className="hover:underline">File Security</a>
          <span>&bull;</span>
          <a href="/guides/" onClick={(e) => { e.preventDefault(); navigateTo('/guides'); }} className="hover:underline">Guides &amp; Tutorials</a>
          <span>&bull;</span>
          <a href="/changelog/" onClick={(e) => { e.preventDefault(); navigateTo('/changelog'); }} className="hover:underline text-red-600 dark:text-red-400">Changelog</a>
          <span>&bull;</span>
          <a href="/about/" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="hover:underline">About Us</a>
          <span>&bull;</span>
          <a href="/privacy/" onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} className="hover:underline">Privacy Policy</a>
          <span>&bull;</span>
          <a href="/terms/" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="hover:underline">Terms of Service</a>
          <span>&bull;</span>
          <a href="/contact/" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="hover:underline">Contact Us</a>
          <span>&bull;</span>
          <a href="/disclaimer/" onClick={(e) => { e.preventDefault(); navigateTo('/disclaimer'); }} className="hover:underline">Disclaimer</a>
          <span>&bull;</span>
          <a href="/cookie-policy/" onClick={(e) => { e.preventDefault(); navigateTo('/cookie-policy'); }} className="hover:underline">Cookie Policy</a>
        </div>
        {/*
          Visible, crawlable links to the official profiles. rel="me" marks them as the same
          entity as this site (the mechanism Mastodon/IndieWeb verification relies on), which
          also matters for answer engines doing entity resolution, not just humans clicking.
        */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-slate-500 dark:text-zinc-500">
          <a href={SOCIAL_LINKS.x.url} rel="me noopener" target="_blank" className="hover:underline hover:text-red-600 dark:hover:text-red-400">{SOCIAL_LINKS.x.label}</a>
          <span>&bull;</span>
          <a href={SOCIAL_LINKS.threads.url} rel="me noopener" target="_blank" className="hover:underline hover:text-red-600 dark:hover:text-red-400">{SOCIAL_LINKS.threads.label}</a>
          <span>&bull;</span>
          <a href={SOCIAL_LINKS.github.url} rel="me noopener" target="_blank" className="hover:underline hover:text-red-600 dark:hover:text-red-400">{SOCIAL_LINKS.github.label}</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Nexvert. All rights reserved. Client-Side In-Browser Conversion.</p>
      </footer>
      <ConsentBanner onNavigate={navigateTo} />
    </div>
  );
}
