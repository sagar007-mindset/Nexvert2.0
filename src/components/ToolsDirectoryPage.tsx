/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CONVERTER_TOOLS, ConverterToolConfig } from '../config/converters.config';
import { TOTAL_TOOLS_COUNT } from '../config/navigation.config';
import Breadcrumbs from './Breadcrumbs';
import {
  Search,
  Wrench,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Video,
  Layers,
  Code2,
  Sparkles,
  ArrowLeftRight,
  Filter
} from 'lucide-react';
import PageH1 from './PageH1';

interface ToolsDirectoryPageProps {
  categoryFilter?: string;
  onNavigate: (route: string) => void;
}

export default function ToolsDirectoryPage({ categoryFilter, onNavigate }: ToolsDirectoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>(categoryFilter || 'All');

  const allTools = useMemo(() => {
    return Object.values(CONVERTER_TOOLS);
  }, []);

  // Map any tool into one of the 6 canonical pillars:
  // Convert, PDF Tools, Image Tools, Media, Developer, Utilities
  const getToolPillar = (tool: ConverterToolConfig): string => {
    if (tool.category === 'Utilities') return 'Utilities';
    if (tool.category === 'Developer') return 'Developer';
    if (tool.category === 'PDF & Document') return 'PDF Tools';
    if (tool.category === 'Image') return 'Image Tools';
    if (tool.category === 'Audio' || tool.category === 'Video' || tool.category === 'GIF') return 'Media';
    return 'Convert';
  };

  // Compute exact tool count per pillar
  const pillarCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: allTools.length,
      Convert: 0,
      'PDF Tools': 0,
      'Image Tools': 0,
      Media: 0,
      Developer: 0,
      Utilities: 0
    };

    for (const tool of allTools) {
      const pillar = getToolPillar(tool);
      if (counts[pillar] !== undefined) {
        counts[pillar]++;
      } else {
        counts.Convert++;
      }
    }
    return counts;
  }, [allTools]);

  const pillars = [
    { name: 'All', icon: Layers },
    { name: 'Convert', icon: ArrowLeftRight },
    { name: 'PDF Tools', icon: FileText },
    { name: 'Image Tools', icon: ImageIcon },
    { name: 'Media', icon: Video },
    { name: 'Developer', icon: Code2 },
    { name: 'Utilities', icon: Sparkles }
  ];

  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      const pillar = getToolPillar(tool);

      // Category / Pillar filter
      const pillarMatch =
        selectedPillar === 'All' ||
        pillar.toLowerCase() === selectedPillar.toLowerCase() ||
        (selectedPillar.toLowerCase().includes('pdf') && pillar === 'PDF Tools') ||
        (selectedPillar.toLowerCase().includes('image') && pillar === 'Image Tools') ||
        (selectedPillar.toLowerCase().includes('audio') && (tool.category === 'Audio' || pillar === 'Media')) ||
        (selectedPillar.toLowerCase().includes('video') && (tool.category === 'Video' || pillar === 'Media')) ||
        (selectedPillar.toLowerCase().includes('archive') && (tool.category === 'Archive' || pillar === 'Convert')) ||
        (selectedPillar.toLowerCase().includes('compression') && (tool.category === 'Compression' || pillar === 'Image Tools' || pillar === 'Media' || pillar === 'PDF Tools'));

      if (!pillarMatch) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        pillar.toLowerCase().includes(q) ||
        tool.inputFormats.some((f) => f.toLowerCase().includes(q)) ||
        tool.outputFormats.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [allTools, selectedPillar, searchQuery]);

  const getPillarTitle = () => {
    if (selectedPillar === 'All') return 'All Online File Tools & Converters';
    if (selectedPillar === 'Convert') return 'Format Conversion & Archive Utilities';
    if (selectedPillar === 'PDF Tools') return 'In-Browser PDF Manipulation Tools';
    if (selectedPillar === 'Image Tools') return 'Browser-Based Image Converters & Editors';
    if (selectedPillar === 'Media') return 'Audio, Video & GIF In-Browser Utilities';
    if (selectedPillar === 'Developer') return 'Client-Side Developer & Cryptographic Tools';
    if (selectedPillar === 'Utilities') return 'Fast Offline Text, Math & Everyday Utilities';
    return `${selectedPillar} Tools`;
  };

  const getPillarDesc = () => {
    if (selectedPillar === 'All')
      return `Browse our verified directory of ${allTools.length} free, browser-native file tools. Convert documents, edit PDFs, optimize images, process audio/video, encode developer payloads, and compute everyday calculations with 100% client-side privacy.`;
    if (selectedPillar === 'Convert')
      return `Transform document formats, create and inspect ZIP/TAR archives, and convert raw text without external server uploads.`;
    if (selectedPillar === 'PDF Tools')
      return `Merge, split, crop, flatten, rotate, watermark, and fill PDF documents directly in local browser memory.`;
    if (selectedPillar === 'Image Tools')
      return `Compress, crop, resize, rotate, filter, and convert image formats locally using modern HTML5 Canvas.`;
    if (selectedPillar === 'Media')
      return `High-speed audio trimming, video conversion, volume boosting, and GIF generation powered by browser Web APIs.`;
    if (selectedPillar === 'Developer')
      return `Format JSON/SQL, inspect JWTs, hash text with Web Crypto (SHA-256, MD5), and test regular expressions securely.`;
    if (selectedPillar === 'Utilities')
      return `Instant word counting, line manipulation, EMI/loan calculations, signature drawing, and decision makers.`;
    return `Explore high-performance in-browser ${selectedPillar.toLowerCase()} tools with local client-side processing.`;
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn text-left max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tools Directory', href: '/tools/' },
          ...(selectedPillar !== 'All' ? [{ label: selectedPillar }] : [])
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
          <Wrench className="w-3.5 h-3.5" /> Full Tools Directory ({allTools.length} Total)
        </div>
        <PageH1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-tight">
          {getPillarTitle()}
        </PageH1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          {getPillarDesc()}
        </p>
      </div>

      {/* Search & Category Pillar Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-6 rounded-3xl shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across all ${TOTAL_TOOLS_COUNT}+ tools by name, format, or task (e.g., PDF merge, WebP, SHA-256, Word count)...`}
            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-red-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* 6 Category Pillars with Real Tool Counts */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>Filter by Category Pillar:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = selectedPillar === pillar.name;
              const count = pillarCounts[pillar.name] ?? 0;

              return (
                <button
                  key={pillar.name}
                  type="button"
                  onClick={() => setSelectedPillar(pillar.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pillar.name}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> active tool{filteredTools.length !== 1 ? 's' : ''}
            {selectedPillar !== 'All' ? ` in ${selectedPillar}` : ''}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> 100% In-Browser Privacy
          </span>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const pillar = getToolPillar(tool);

              return (
                <div
                  key={tool.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-900/60 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400 uppercase">
                        {pillar}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Client-side
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {tool.title.replace(/ (—|–) Nexvert$/, '')}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* Input -> Output format badges & action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400 truncate">
                      {tool.inputFormats[0] ? (
                        <>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded">
                            {tool.inputFormats[0]}
                          </span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded">
                            {tool.outputFormats[0] || tool.defaultOutputFormat || tool.inputFormats[0]}
                          </span>
                        </>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded">
                          {tool.category}
                        </span>
                      )}
                    </div>

                    <a
                      href={tool.route}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(tool.route);
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
            <p className="text-slate-700 dark:text-zinc-300 font-bold text-base">
              No matching file tools found for &quot;{searchQuery}&quot;.
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-md mx-auto">
              Try searching by file format (e.g. PDF, JPG, PNG, WEBP, MP3, ZIP) or reset your filter to view all tools.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedPillar('All');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
