/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  Wrench,
  ArrowRight,
  Code,
  Zap
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import PageH1 from './PageH1';

interface ChangelogEntry {
  version: string;
  date: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  highlights: string[];
  toolsAdded?: { name: string; route: string }[];
}

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v2.4.0',
    date: 'Latest Release',
    badge: 'Major Suite Release',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
    title: '32+ Client-Side Utilities & Re-Architected 6-Pillar Navigation',
    description: 'Expanded the browser-native ecosystem with a comprehensive utilities suite covering text manipulation, mathematical and date calculators, instant generators, and fun decision makers. Completely rebuilt the site navigation into six streamlined pillars with 100% verified route mapping.',
    highlights: [
      'Added 32 new offline-capable utility tools with zero network requests',
      'Unified navigation into 6 clean categories: Convert, PDF Tools, Image Tools, Media, Developer, Utilities',
      'Purged all server-dependent or mock operations to ensure 100% authentic, byte-accurate processing',
      'Implemented contextual related-tools internal linking across all tool surfaces to enhance discoverability',
      'Authored unique H1 titles, descriptions, and technical FAQs for every tool'
    ],
    toolsAdded: [
      { name: 'Word Counter', route: '/word-counter/' },
      { name: 'Duplicate Line Remover', route: '/remove-duplicate-lines/' },
      { name: 'Percentage Calculator', route: '/percentage-calculator/' },
      { name: 'Age Calculator', route: '/age-calculator/' },
      { name: 'Date Calculator', route: '/date-calculator/' },
      { name: 'BMI Calculator', route: '/bmi-calculator/' },
      { name: 'Loan EMI Calculator', route: '/loan-calculator/' },
      { name: 'Digital Signature Pad', route: '/signature-pad/' },
      { name: 'Invoice Generator', route: '/invoice-generator/' },
      { name: 'QR Code Generator', route: '/qr-code-generator/' },
      { name: 'Barcode Generator', route: '/barcode-generator/' },
      { name: 'Random Picker', route: '/random-picker/' }
    ]
  },
  {
    version: 'v2.3.0',
    date: 'Recent Update',
    badge: 'Developer Expansion',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
    title: 'High-Performance Developer Suite & Cryptographic Tools',
    description: 'Introduced an extensive developer workspace powered by standard browser Web Crypto APIs, modern ECMAScript parsers, and lossless formatting algorithms.',
    highlights: [
      'Launched Web Crypto hash generation (MD5, SHA-1, SHA-256, SHA-512) and HMAC token generator',
      'Client-side JWT Token Inspector with decoded header/payload verification and expiry indicators',
      'Multi-format code minifiers for HTML, CSS, and JavaScript with token savings metrics',
      'Interactive Regex Tester with live match highlighting and regular expression flags',
      'Dual-pane Code Diff Viewer with side-by-side visual difference highlighting'
    ],
    toolsAdded: [
      { name: 'JSON Formatter & Validator', route: '/json-formatter/' },
      { name: 'Base64 Encoder/Decoder', route: '/base64-encode/' },
      { name: 'Hash Generator', route: '/sha256-generator/' },
      { name: 'JWT Decoder', route: '/jwt-decoder/' },
      { name: 'SQL Formatter', route: '/sql-formatter/' },
      { name: 'Regex Tester', route: '/regex-tester/' }
    ]
  },
  {
    version: 'v2.2.0',
    date: 'Milestone',
    badge: 'Document & PDF Engine',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
    title: 'Local PDF Manipulation & Word Document Transformations',
    description: 'Deployed comprehensive client-side PDF editing using pdf-lib and mammoth.js. Documents are loaded directly into memory without cloud upload, ensuring complete privacy for legal, financial, and personal contracts.',
    highlights: [
      'Lossless client-side PDF Merge, Split, Page Rotation, and Page Extraction',
      'Interactive PDF Form Filling and Form Flattening for archival and submission',
      'Precision PDF Page Cropping and custom margin trimming',
      'DOCX to HTML, Markdown, and Plain Text conversion via client-side DOM parsing',
      'Dynamic PDF Watermarking and customizable Page Numbering'
    ],
    toolsAdded: [
      { name: 'PDF Merge Tool', route: '/pdf-merge/' },
      { name: 'PDF Split Tool', route: '/pdf-split/' },
      { name: 'PDF Page Rotator', route: '/rotate-pdf/' },
      { name: 'Crop PDF Margins', route: '/crop-pdf/' },
      { name: 'Flatten PDF Forms', route: '/flatten-pdf/' },
      { name: 'DOCX to HTML Converter', route: '/docx-to-html/' }
    ]
  },
  {
    version: 'v2.1.0',
    date: 'Milestone',
    badge: 'Audio, Video & GIF',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60',
    title: 'In-Browser Media Workflows & WebAssembly Encoding',
    description: 'Engineered high-speed Web Audio and HTML5 media pipelines for offline audio processing, GIF frame extraction, video trimming, and speech playback.',
    highlights: [
      'Web Audio API silence detection, volume amplification, and audio reversal',
      'Direct MP3, WAV, and AAC client-side transcoding and audio compression',
      'Client-side Animated GIF maker with frame rate, delay, and dimensional controls',
      'HTML5 Canvas frame extractor from MP4 and WebM video streams'
    ],
    toolsAdded: [
      { name: 'Audio Converter', route: '/audio-converter/' },
      { name: 'MP3 Compressor', route: '/mp3-compressor/' },
      { name: 'Audio Trimmer', route: '/audio-trimmer/' },
      { name: 'Audio Speed Changer', route: '/audio-speed-changer/' },
      { name: 'GIF Maker', route: '/gif-maker/' },
      { name: 'Video to GIF', route: '/video-to-gif/' }
    ]
  },
  {
    version: 'v2.0.0',
    date: 'Milestone',
    badge: 'Platform Inception',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
    title: 'Zero-Upload Privacy Architecture Launch',
    description: 'Initial public launch of Nexvert, built from the ground up on the principle that file conversion and manipulation should happen inside the user’s browser without server-side telemetry or file retention.',
    highlights: [
      'Pioneered pure browser-based conversion with HTML5 Canvas, Web Workers, and WebAssembly',
      'Supported major image formats including PNG, JPG, WebP, SVG, and HEIC',
      'Zero user tracking, zero account registration requirements, and zero cloud storage logs'
    ],
    toolsAdded: [
      { name: 'Image Converter', route: '/' },
      { name: 'PNG to JPG', route: '/png-to-jpg/' },
      { name: 'JPG to PNG', route: '/jpg-to-png/' },
      { name: 'WEBP to PNG', route: '/webp-to-png/' },
      { name: 'WEBP to JPG', route: '/webp-to-jpg/' },
      { name: 'Create ZIP Archive', route: '/create-archive/' }
    ]
  }
];

interface ChangelogPageProps {
  onNavigate: (route: string) => void;
}

export default function ChangelogPage({ onNavigate }: ChangelogPageProps) {
  return (
    <div className="w-full space-y-8 animate-fadeIn text-left max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Changelog' }
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
          <Sparkles className="w-3.5 h-3.5" /> Platform Release History
        </div>
        <PageH1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-tight">
          Changelog &amp; Tool Updates
        </PageH1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Track the chronological evolution of Nexvert. We continuously deploy new client-side utilities, enhance file parsing engines, and expand offline capabilities—all without servers, logins, or fees.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-zinc-400 pt-1">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Local Execution
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Processing
          </span>
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-blue-500" /> No Backend Dependencies
          </span>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="space-y-10 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
        {CHANGELOG_ENTRIES.map((entry) => (
          <div key={entry.version} className="relative pl-10 space-y-4">
            {/* Timeline dot */}
            <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-red-600 dark:border-red-500 ring-4 ring-slate-50 dark:ring-zinc-900" />

            {/* Entry Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {entry.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${entry.badgeColor}`}>
                    {entry.badge}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {entry.date}
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                  {entry.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {entry.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                  Key Improvements
                </h3>
                <ul className="space-y-2">
                  {entry.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools added pills */}
              {entry.toolsAdded && entry.toolsAdded.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                    Featured Tools in this Release
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.toolsAdded.map((tool) => (
                      <a
                        key={tool.route}
                        href={tool.route}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(tool.route);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-700 text-xs font-semibold transition-all cursor-pointer group"
                      >
                        <span>{tool.name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
