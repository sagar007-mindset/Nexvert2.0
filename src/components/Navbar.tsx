/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ArrowLeftRight,
  Zap,
  Moon,
  Sun,
  FileText,
  Image,
  Video,
  Code2,
  Wrench,
  Search,
  Menu,
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { ToolMode } from '../App';
import BrandLogo from './BrandLogo';
import {
  TOTAL_TOOLS_COUNT,
  PDF_TOOLS_COUNT,
  DEV_TOOLS_COUNT,
  UTILITY_TOOLS_COUNT
} from '../config/navigation.config';

interface NavbarProps {
  activeMode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface NavCategorySection {
  title: string;
  items: { label: string; mode: ToolMode; badge?: string }[];
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  hubMode: ToolMode;
  hubLabel: string;
  sections: NavCategorySection[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'convert',
    label: 'Convert',
    icon: ArrowLeftRight,
    hubMode: 'tools' as ToolMode,
    hubLabel: `Browse All ${TOTAL_TOOLS_COUNT}+ Converters`,
    sections: [
      {
        title: 'Document Formats',
        items: [
          { label: 'DOCX to PDF', mode: 'docx-to-pdf' as ToolMode },
          { label: 'DOCX to HTML', mode: 'docx-to-html' as ToolMode },
          { label: 'DOCX to Markdown', mode: 'docx-to-markdown' as ToolMode },
          { label: 'DOCX to Text', mode: 'docx-to-text' as ToolMode },
          { label: 'Markdown to HTML', mode: 'markdown-to-html' as ToolMode },
          { label: 'HTML to Markdown', mode: 'html-to-markdown' as ToolMode },
          { label: 'Markdown to PDF', mode: 'markdown-to-pdf' as ToolMode },
          { label: 'CSV to Markdown', mode: 'csv-to-markdown' as ToolMode },
          { label: 'HTML to Text', mode: 'html-to-text' as ToolMode },
          { label: 'EPUB to Text', mode: 'epub-to-text' as ToolMode },
          { label: 'EPUB to HTML', mode: 'epub-to-html' as ToolMode }
        ]
      },
      {
        title: 'Archives & Packages',
        items: [
          { label: 'Create ZIP Archive', mode: 'create-archive' as ToolMode },
          { label: 'Extract ZIP Archive', mode: 'extract-archive' as ToolMode },
          { label: 'Extract TAR Archive', mode: 'extract-tar' as ToolMode },
          { label: 'ZIP File Viewer', mode: 'zip-viewer' as ToolMode },
          { label: 'Bulk File Zipper', mode: 'bulk-file-zipper' as ToolMode },
          { label: 'Split ZIP Archive', mode: 'split-zip' as ToolMode },
          { label: 'TAR to ZIP', mode: 'tar-to-zip' as ToolMode },
          { label: 'ZIP to TAR', mode: 'zip-to-tar' as ToolMode },
          { label: 'Merge Files', mode: 'merge-files' as ToolMode },
          { label: 'SVG Converter', mode: 'svg-converter' as ToolMode },
          { label: 'Archive Tools Hub', mode: 'archive-tools' as ToolMode, badge: 'Hub' }
        ]
      }
    ]
  },
  {
    id: 'pdf-tools',
    label: 'PDF Tools',
    icon: FileText,
    hubMode: 'pdf-tools' as ToolMode,
    hubLabel: `All ${PDF_TOOLS_COUNT}+ PDF Tools Hub`,
    sections: [
      {
        title: 'Organize & Pages',
        items: [
          { label: 'Merge PDF', mode: 'pdf-merge' as ToolMode },
          { label: 'Split PDF', mode: 'pdf-split' as ToolMode },
          { label: 'Organize PDF Pages', mode: 'organize-pdf' as ToolMode },
          { label: 'Extract PDF Pages', mode: 'extract-pdf-pages' as ToolMode },
          { label: 'Rotate PDF', mode: 'rotate-pdf' as ToolMode },
          { label: 'Resize PDF Pages', mode: 'resize-pdf' as ToolMode }
        ]
      },
      {
        title: 'Edit & Optimize',
        items: [
          { label: 'Crop PDF Margins', mode: 'crop-pdf' as ToolMode },
          { label: 'Watermark PDF', mode: 'watermark-pdf' as ToolMode },
          { label: 'Add Page Numbers', mode: 'add-page-numbers' as ToolMode },
          { label: 'Fill PDF Forms', mode: 'fill-pdf-form' as ToolMode },
          { label: 'Flatten PDF Forms', mode: 'flatten-pdf' as ToolMode },
          { label: 'PDF Metadata Editor', mode: 'pdf-metadata-editor' as ToolMode }
        ]
      },
      {
        title: 'PDF Conversions',
        items: [
          { label: 'JPG to PDF', mode: 'jpg-to-pdf' as ToolMode },
          { label: 'PDF OCR Text Extractor', mode: 'pdf-ocr' as ToolMode }
        ]
      }
    ]
  },
  {
    id: 'image-tools',
    label: 'Image Tools',
    icon: Image,
    hubMode: 'image-tools' as ToolMode,
    hubLabel: 'Explore All Image Tools',
    sections: [
      {
        title: 'Transform & Crop',
        items: [
          { label: 'Resize Image', mode: 'resize-image' as ToolMode },
          { label: 'Crop Image', mode: 'crop-image' as ToolMode },
          { label: 'Rotate Image', mode: 'rotate-image' as ToolMode },
          { label: 'Flip Image', mode: 'flip-image' as ToolMode },
          { label: 'Image Enlarger', mode: 'image-enlarger' as ToolMode },
          { label: 'Add Watermark', mode: 'add-watermark' as ToolMode },
          { label: 'Remove EXIF Metadata', mode: 'remove-exif' as ToolMode }
        ]
      },
      {
        title: 'Compress & Filter',
        items: [
          { label: 'Image Compressor', mode: 'image-compressor' as ToolMode },
          { label: 'PNG Compressor', mode: 'png-compressor' as ToolMode },
          { label: 'JPEG Compressor', mode: 'jpeg-compressor' as ToolMode },
          { label: 'Bulk Image Compressor', mode: 'bulk-image-compressor' as ToolMode },
          { label: 'Brightness & Contrast', mode: 'brightness-contrast' as ToolMode },
          { label: 'Saturation Adjuster', mode: 'saturation-adjuster' as ToolMode },
          { label: 'Grayscale Converter', mode: 'grayscale-converter' as ToolMode },
          { label: 'Invert Colors', mode: 'invert-colors' as ToolMode },
          { label: 'Blur Image', mode: 'blur-image' as ToolMode },
          { label: 'Pixelate Image', mode: 'pixelate-image' as ToolMode },
          { label: 'Image Sharpener', mode: 'image-sharpener' as ToolMode }
        ]
      },
      {
        title: 'Image Conversions',
        items: [
          { label: 'PNG to JPG', mode: 'png-to-jpg' as ToolMode },
          { label: 'JPG to PNG', mode: 'jpg-to-png' as ToolMode },
          { label: 'WEBP to PNG', mode: 'webp-to-png' as ToolMode },
          { label: 'WEBP to JPG', mode: 'webp-to-jpg' as ToolMode },
          { label: 'Image to Text (OCR)', mode: 'image-to-text' as ToolMode }
        ]
      }
    ]
  },
  {
    id: 'media',
    label: 'Media',
    icon: Video,
    hubMode: 'video-tools' as ToolMode,
    hubLabel: 'Media Tools Hub',
    sections: [
      {
        title: 'Video Utilities',
        items: [
          { label: 'Video Converter', mode: 'video-converter' as ToolMode },
          { label: 'Video Compressor', mode: 'video-compressor' as ToolMode },
          { label: 'Video Trimmer', mode: 'video-trimmer' as ToolMode },
          { label: 'Video Resize', mode: 'video-resize' as ToolMode },
          { label: 'Extract Video Frames', mode: 'extract-video-frames' as ToolMode },
          { label: 'Video to GIF', mode: 'video-to-gif' as ToolMode },
          { label: 'Video to MP3', mode: 'video-to-mp3' as ToolMode },
          { label: 'Video Metadata & Info', mode: 'video-info' as ToolMode }
        ]
      },
      {
        title: 'Audio Suite',
        items: [
          { label: 'Audio Converter', mode: 'audio-converter' as ToolMode },
          { label: 'MP3 Compressor', mode: 'mp3-compressor' as ToolMode },
          { label: 'Audio Trimmer', mode: 'audio-trimmer' as ToolMode },
          { label: 'Audio Merger', mode: 'audio-merger' as ToolMode },
          { label: 'Audio Speed Changer', mode: 'audio-speed-changer' as ToolMode },
          { label: 'Volume Booster', mode: 'audio-volume' as ToolMode },
          { label: 'Silence Remover', mode: 'silence-remover' as ToolMode },
          { label: 'Stereo to Mono', mode: 'audio-to-mono' as ToolMode },
          { label: 'Audio Reverser', mode: 'audio-reverser' as ToolMode },
          { label: 'Voice Recorder', mode: 'voice-recorder' as ToolMode },
          { label: 'Audio Metadata & Info', mode: 'audio-info' as ToolMode },
          { label: 'WAV to MP3', mode: 'wav-to-mp3' as ToolMode },
          { label: 'MP3 to WAV', mode: 'mp3-to-wav' as ToolMode }
        ]
      },
      {
        title: 'GIF Tools',
        items: [
          { label: 'GIF Maker', mode: 'gif-maker' as ToolMode },
          { label: 'GIF to MP4', mode: 'gif-to-mp4' as ToolMode },
          { label: 'GIF Resizer', mode: 'gif-resizer' as ToolMode },
          { label: 'GIF Splitter', mode: 'gif-splitter' as ToolMode }
        ]
      }
    ]
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Code2,
    hubMode: 'developer-tools' as ToolMode,
    hubLabel: `Explore ${DEV_TOOLS_COUNT}+ Developer Tools`,
    sections: [
      {
        title: 'JSON & Parsers',
        items: [
          { label: 'JSON Formatter', mode: 'json-formatter' as ToolMode },
          { label: 'JSON Validator', mode: 'json-validator' as ToolMode },
          { label: 'JSON Minifier', mode: 'json-minifier' as ToolMode },
          { label: 'JSON to CSV', mode: 'json-to-csv' as ToolMode },
          { label: 'CSV to JSON', mode: 'csv-to-json' as ToolMode },
          { label: 'JSON to XML', mode: 'json-to-xml' as ToolMode },
          { label: 'XML to JSON', mode: 'xml-to-json' as ToolMode },
          { label: 'JSON to YAML', mode: 'json-to-yaml' as ToolMode },
          { label: 'YAML to JSON', mode: 'yaml-to-json' as ToolMode },
          { label: 'JSON Diff', mode: 'json-diff' as ToolMode }
        ]
      },
      {
        title: 'Encoders & Cryptography',
        items: [
          { label: 'Base64 Encoder/Decoder', mode: 'base64-encode' as ToolMode },
          { label: 'Base64 to Image', mode: 'base64-to-image' as ToolMode },
          { label: 'Image to Base64', mode: 'image-to-base64' as ToolMode },
          { label: 'URL Encoder/Decoder', mode: 'url-encode' as ToolMode },
          { label: 'HTML Entity Encoder', mode: 'html-entity-encode' as ToolMode },
          { label: 'JWT Decoder', mode: 'jwt-decoder' as ToolMode },
          { label: 'SHA-256 Generator', mode: 'sha256-generator' as ToolMode },
          { label: 'SHA-1 Generator', mode: 'sha1-generator' as ToolMode },
          { label: 'SHA-512 Generator', mode: 'sha512-generator' as ToolMode },
          { label: 'MD5 Generator', mode: 'md5-generator' as ToolMode },
          { label: 'File Checksum Verifier', mode: 'file-checksum' as ToolMode }
        ]
      },
      {
        title: 'Formatting & Code',
        items: [
          { label: 'Regex Tester', mode: 'regex-tester' as ToolMode },
          { label: 'SQL Formatter', mode: 'sql-formatter' as ToolMode },
          { label: 'Text Diff Checker', mode: 'text-diff' as ToolMode },
          { label: 'HTML Formatter', mode: 'html-formatter' as ToolMode },
          { label: 'CSS Formatter', mode: 'css-formatter' as ToolMode },
          { label: 'CSS Minifier', mode: 'css-minifier' as ToolMode },
          { label: 'JS Formatter', mode: 'js-formatter' as ToolMode },
          { label: 'Color Converter', mode: 'color-converter' as ToolMode },
          { label: 'Palette Extractor', mode: 'color-palette-extractor' as ToolMode },
          { label: 'Contrast Checker', mode: 'contrast-checker' as ToolMode },
          { label: 'Timestamp Converter', mode: 'timestamp-converter' as ToolMode },
          { label: 'Cron Parser', mode: 'cron-parser' as ToolMode },
          { label: 'UUID Generator', mode: 'uuid-generator' as ToolMode },
          { label: 'Password Generator', mode: 'password-generator' as ToolMode }
        ]
      }
    ]
  },
  {
    id: 'utilities',
    label: 'Utilities',
    icon: Wrench,
    hubMode: 'utilities' as ToolMode,
    hubLabel: `Browse All ${UTILITY_TOOLS_COUNT}+ Utilities`,
    sections: [
      {
        title: 'Text & Writing',
        items: [
          { label: 'Word Counter', mode: 'word-counter' as ToolMode },
          { label: 'Remove Duplicate Lines', mode: 'remove-duplicate-lines' as ToolMode },
          { label: 'Sort Lines', mode: 'sort-lines' as ToolMode },
          { label: 'Find & Replace', mode: 'find-and-replace' as ToolMode },
          { label: 'Text Repeater', mode: 'text-repeater' as ToolMode },
          { label: 'Reverse Text', mode: 'reverse-text' as ToolMode },
          { label: 'Remove Line Breaks', mode: 'remove-line-breaks' as ToolMode },
          { label: 'Whitespace Remover', mode: 'whitespace-remover' as ToolMode },
          { label: 'Text to Speech', mode: 'text-to-speech' as ToolMode },
          { label: 'Character Map', mode: 'character-map' as ToolMode }
        ]
      },
      {
        title: 'Calculators',
        items: [
          { label: 'Percentage Calculator', mode: 'percentage-calculator' as ToolMode },
          { label: 'Age Calculator', mode: 'age-calculator' as ToolMode },
          { label: 'Date Calculator', mode: 'date-calculator' as ToolMode },
          { label: 'BMI Calculator', mode: 'bmi-calculator' as ToolMode },
          { label: 'Loan EMI Calculator', mode: 'loan-calculator' as ToolMode },
          { label: 'Tip Calculator', mode: 'tip-calculator' as ToolMode },
          { label: 'Discount Calculator', mode: 'discount-calculator' as ToolMode },
          { label: 'Aspect Ratio Calculator', mode: 'aspect-ratio-calculator' as ToolMode },
          { label: 'GST / Tax Calculator', mode: 'gst-calculator' as ToolMode }
        ]
      },
      {
        title: 'Generators & Random',
        items: [
          { label: 'Unit Converter', mode: 'unit-converter' as ToolMode },
          { label: 'Timezone Converter', mode: 'timezone-converter' as ToolMode },
          { label: 'Roman Numeral Converter', mode: 'roman-numeral-converter' as ToolMode },
          { label: 'Number to Words', mode: 'number-to-words' as ToolMode },
          { label: 'Digital Signature Pad', mode: 'signature-pad' as ToolMode },
          { label: 'Invoice Generator', mode: 'invoice-generator' as ToolMode },
          { label: 'Favicon Generator', mode: 'favicon-generator' as ToolMode },
          { label: 'OG Image Generator', mode: 'og-image-generator' as ToolMode },
          { label: 'Placeholder Image', mode: 'placeholder-image' as ToolMode },
          { label: 'Random Picker', mode: 'random-picker' as ToolMode },
          { label: 'Dice Roller', mode: 'dice-roller' as ToolMode },
          { label: 'Coin Flip', mode: 'coin-flip' as ToolMode },
          { label: 'Random Number Generator', mode: 'random-number' as ToolMode }
        ]
      }
    ]
  }
];

export default function Navbar({
  activeMode,
  onModeChange,
  isDarkMode,
  onToggleDarkMode
}: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileCategoryTab, setMobileCategoryTab] = useState<string>('convert');

  const navRef = useRef<HTMLElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectMode = (mode: ToolMode) => {
    onModeChange(mode);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Filter mobile search items
  const allNavItems = NAV_CATEGORIES.flatMap((c) =>
    c.sections.flatMap((s) => s.items.map((item) => ({ ...item, category: c.label })))
  );

  const filteredMobileItems = mobileSearchQuery.trim()
    ? allNavItems.filter((i) =>
        i.label.toLowerCase().includes(mobileSearchQuery.toLowerCase().trim())
      )
    : null;

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleSelectMode('image-converter' as ToolMode);
            }}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer focus:outline-hidden shrink-0 select-none"
            aria-label="Nexvert Home"
          >
            <BrandLogo size={32} showText={true} textSize="sm" />
          </a>

          {/* Desktop Navigation - 6 Categories */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 shrink-0" aria-label="Main Navigation">
            {NAV_CATEGORIES.map((cat) => {
              const isOpen = openDropdown === cat.id;
              const Icon = cat.icon;
              const isRightAligned = cat.id === 'developer' || cat.id === 'utilities';
              const shortLabel = cat.id === 'pdf-tools' ? 'PDF' : cat.id === 'image-tools' ? 'Images' : cat.label;

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(cat.id)}
                    className={`flex items-center gap-1 xl:gap-1.5 px-1.5 xl:px-2.5 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isOpen
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      <span className="lg:hidden xl:inline">{cat.label}</span>
                      <span className="hidden lg:inline xl:hidden">{shortLabel}</span>
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-red-500' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Mega Dropdown Panel */}
                  {isOpen && (
                    <div
                      className={`absolute top-full mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 lg:p-5 z-50 text-left transition-all max-w-[calc(100vw-2rem)] ${
                        isRightAligned
                          ? 'right-0'
                          : cat.sections.length >= 3
                          ? '-left-12 lg:-left-20 xl:-left-32'
                          : cat.sections.length === 2
                          ? '-left-6 lg:-left-10 xl:-left-16'
                          : 'left-0'
                      } ${
                        cat.sections.length >= 3
                          ? 'w-[min(720px,calc(100vw-1rem))]'
                          : cat.sections.length === 2
                          ? 'w-[min(520px,calc(100vw-1rem))]'
                          : 'w-[min(320px,calc(100vw-1rem))]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-xs font-black text-slate-900 dark:text-white font-display uppercase tracking-wider">
                            {cat.label} Suite
                          </span>
                        </div>
                        <a
                          href={`/${cat.hubMode}/`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectMode(cat.hubMode);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                        >
                          <span>{cat.hubLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div
                        className={`grid gap-5 ${
                          cat.sections.length === 3
                            ? 'grid-cols-3'
                            : cat.sections.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-1'
                        }`}
                      >
                        {cat.sections.map((section, sIdx) => (
                          <div key={sIdx} className="space-y-1.5">
                            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 py-0.5">
                              {section.title}
                            </h4>
                            <div className="space-y-0.5">
                              {section.items.map((item) => (
                                <a
                                  key={item.mode}
                                  href={`/${item.mode}/`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSelectMode(item.mode);
                                  }}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    activeMode === item.mode
                                      ? 'bg-red-50 text-red-600 font-bold dark:bg-red-950/40 dark:text-red-400'
                                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                      {item.badge}
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Controls: Dark Mode & Mobile/Tablet Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Privacy Guarantee Badge - shown on ultra-wide screens (2xl+) so it never crowds laptops */}
            <a
              href="/file-security/"
              onClick={(e) => {
                e.preventDefault();
                handleSelectMode('file-security' as ToolMode);
              }}
              className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 transition-colors shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Uploads</span>
            </a>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Toggle Dark Mode"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile & Tablet Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 sm:px-6 md:px-8 py-4 space-y-4 max-h-[85vh] overflow-y-auto text-left shadow-xl">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools across all 6 categories..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            {mobileSearchQuery && (
              <button
                type="button"
                onClick={() => setMobileSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results if user is typing */}
          {filteredMobileItems ? (
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 dark:text-zinc-500">
                Search Results ({filteredMobileItems.length})
              </span>
              {filteredMobileItems.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No tools found matching &quot;{mobileSearchQuery}&quot;</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredMobileItems.map((item) => (
                    <a
                      key={item.mode}
                      href={`/${item.mode}/`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectMode(item.mode);
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 min-h-[44px]"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Category Pills for Mobile Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {NAV_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMobileCategoryTab(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[40px] flex items-center shrink-0 ${
                      mobileCategoryTab === cat.id
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Active Category Content */}
              {(() => {
                const activeCat = NAV_CATEGORIES.find((c) => c.id === mobileCategoryTab) || NAV_CATEGORIES[0];
                return (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase font-display">
                        {activeCat.label} Suite
                      </span>
                      <a
                        href={`/${activeCat.hubMode}/`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectMode(activeCat.hubMode);
                        }}
                        className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <span>{activeCat.hubLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-3">
                      {activeCat.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-zinc-500">
                            {sec.title}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                            {sec.items.map((item) => (
                              <a
                                key={item.mode}
                                href={`/${item.mode}/`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelectMode(item.mode);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium truncate flex items-center min-h-[42px] ${
                                  activeMode === item.mode
                                    ? 'bg-red-50 text-red-600 font-bold dark:bg-red-950/40 dark:text-red-400'
                                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                                }`}
                              >
                                {item.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Quick links at bottom of mobile menu */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <a
              href="/tools/"
              onClick={(e) => {
                e.preventDefault();
                handleSelectMode('tools' as ToolMode);
              }}
              className="hover:text-red-600"
            >
              All Tools Directory
            </a>
            <span>&bull;</span>
            <a
              href="/changelog/"
              onClick={(e) => {
                e.preventDefault();
                handleSelectMode('changelog' as ToolMode);
              }}
              className="hover:text-red-600 text-red-600 font-bold"
            >
              Changelog
            </a>
            <span>&bull;</span>
            <a
              href="/file-security/"
              onClick={(e) => {
                e.preventDefault();
                handleSelectMode('file-security' as ToolMode);
              }}
              className="hover:text-red-600"
            >
              File Security
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
