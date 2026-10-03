/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Scissors,
  Trash2,
  RotateCw,
  Crop,
  Scaling,
  Hash,
  Stamp,
  Image as ImageIcon,
  FileCode2,
  Lock,
  FormInput,
  Search,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import PageH1 from '../PageH1';

interface PdfToolItem {
  id: string;
  path: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  category: 'Organize & Pages' | 'Edit & Enhance' | 'Forms & Security' | 'Convert';
}

const PDF_TOOLS_LIST: PdfToolItem[] = [
  // Organize & Pages
  {
    id: 'pdf-merge',
    path: '/pdf-merge/',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single organized document in your chosen order.',
    icon: Layers,
    badge: 'Popular',
    category: 'Organize & Pages'
  },
  {
    id: 'pdf-split',
    path: '/pdf-split/',
    title: 'Split PDF',
    description: 'Separate one document into individual one-page files or custom page ranges as a ZIP.',
    icon: Scissors,
    category: 'Organize & Pages'
  },
  {
    id: 'organize-pdf',
    path: '/organize-pdf/',
    title: 'Organize PDF Pages',
    description: 'Reorder, move, or sort PDF pages with interactive visual thumbnail previews.',
    icon: Layers,
    category: 'Organize & Pages'
  },
  {
    id: 'remove-pdf-pages',
    path: '/remove-pdf-pages/',
    title: 'Remove PDF Pages',
    description: 'Delete specific unwanted pages from your document with live visual preview checkboxes.',
    icon: Trash2,
    category: 'Organize & Pages'
  },
  {
    id: 'extract-pdf-pages',
    path: '/extract-pdf-pages/',
    title: 'Extract PDF Pages',
    description: 'Select specific pages or numeric ranges and extract them into a brand new PDF.',
    icon: FileText,
    category: 'Organize & Pages'
  },
  {
    id: 'rotate-pdf',
    path: '/rotate-pdf/',
    title: 'Rotate PDF',
    description: 'Rotate individual pages or the entire document 90°, 180°, or 270° degrees.',
    icon: RotateCw,
    category: 'Organize & Pages'
  },

  // Edit & Enhance
  {
    id: 'crop-pdf',
    path: '/crop-pdf/',
    title: 'Crop PDF',
    description: 'Trim margins or crop page bounding boxes using real vector crop boxes.',
    icon: Crop,
    category: 'Edit & Enhance'
  },
  {
    id: 'resize-pdf',
    path: '/resize-pdf/',
    title: 'Resize PDF',
    description: 'Scale pages to international standards including A4, US Letter, US Legal, and A3.',
    icon: Scaling,
    category: 'Edit & Enhance'
  },
  {
    id: 'add-page-numbers',
    path: '/add-page-numbers/',
    title: 'Add Page Numbers',
    description: 'Stamp customized, sequential page numbers with flexible positioning and offsets.',
    icon: Hash,
    category: 'Edit & Enhance'
  },
  {
    id: 'watermark-pdf',
    path: '/watermark-pdf/',
    title: 'Watermark PDF',
    description: 'Stamp text watermarks across all pages with custom opacity, rotation, and color.',
    icon: Stamp,
    category: 'Edit & Enhance'
  },
  {
    id: 'pdf-metadata-editor',
    path: '/pdf-metadata-editor/',
    title: 'Edit PDF Metadata',
    description: 'Read and update document Title, Author, Subject, Keywords, and Creator properties.',
    icon: FileCode2,
    category: 'Edit & Enhance'
  },

  // Forms & Convert
  {
    id: 'fill-pdf-form',
    path: '/fill-pdf-form/',
    title: 'Fill PDF Form',
    description: 'Detect AcroForm fields, enter values in text inputs, checkboxes and dropdowns, and save.',
    icon: FormInput,
    badge: 'Interactive',
    category: 'Forms & Security'
  },
  {
    id: 'flatten-pdf',
    path: '/flatten-pdf/',
    title: 'Flatten PDF',
    description: 'Convert fillable form fields and visual annotations into permanent static graphics.',
    icon: Lock,
    category: 'Forms & Security'
  },
  {
    id: 'jpg-to-pdf',
    path: '/jpg-to-pdf/',
    title: 'JPG & PNG to PDF',
    description: 'Convert multiple images into a multi-page PDF document with custom page sizes.',
    icon: ImageIcon,
    badge: 'Multi-file',
    category: 'Convert'
  },
];

interface PdfToolsHubProps {
  onNavigate: (path: string) => void;
}

export default function PdfToolsHub({ onNavigate }: PdfToolsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Organize & Pages', 'Edit & Enhance', 'Forms & Security', 'Convert'];

  const filteredTools = PDF_TOOLS_LIST.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-fadeIn pb-12">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 dark:bg-red-500/20">
          <FileText className="w-3.5 h-3.5" /> 14 In-Browser PDF Tools
        </div>
        <PageH1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Free Online PDF Tools Suite
        </PageH1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Merge, split, crop, rotate, watermark, organize, and fill PDF documents. Fast, secure, and completely private — files never leave your device.
        </p>

        {/* Security & Privacy Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Privacy
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Zap className="w-4 h-4 text-amber-500" /> Instant In-Memory Processing
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Lock className="w-4 h-4 text-blue-500" /> Zero Server Uploads
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PDF tools..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.path)}
              className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-red-500/50 dark:hover:border-red-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-slate-500 space-y-2">
          <p className="text-sm font-medium">No tools found matching "{searchQuery}".</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
