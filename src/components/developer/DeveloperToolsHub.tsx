/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Code2,
  FileJson,
  Binary,
  ShieldCheck,
  AlignLeft,
  Sparkles,
  Type,
  Palette,
  Search,
  ArrowRight,
  Zap,
  Lock,
  Cpu
} from 'lucide-react';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import PageH1 from '../PageH1';

interface DeveloperToolsHubProps {
  onNavigate: (path: string) => void;
}

interface ToolItem {
  id: string;
  route: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

interface CategorySection {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: ToolItem[];
}

export default function DeveloperToolsHub({ onNavigate }: DeveloperToolsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: CategorySection[] = [
    {
      id: 'json',
      title: 'JSON Tools',
      description: 'Format, validate, minify, diff, and convert JSON structures.',
      icon: FileJson,
      tools: [
        { id: 'json-formatter', route: '/json-formatter/', title: 'JSON Formatter', description: 'Prettify JSON with customizable indentation & collapsible tree viewer.', iconName: 'FileJson' },
        { id: 'json-validator', route: '/json-validator/', title: 'JSON Validator', description: 'Validate JSON syntax and pinpoint exact line and column errors.', iconName: 'CheckCircle' },
        { id: 'json-minifier', route: '/json-minifier/', title: 'JSON Minifier', description: 'Strip whitespace with real before-and-after byte count verification.', iconName: 'Minimize2' },
        { id: 'json-to-csv', route: '/json-to-csv/', title: 'JSON to CSV', description: 'Convert JSON object arrays to CSV with dot-notation flattening.', iconName: 'FileSpreadsheet' },
        { id: 'csv-to-json', route: '/csv-to-json/', title: 'CSV to JSON', description: 'Parse CSV files into clean JSON objects with RFC 4180 quote support.', iconName: 'FileCode' },
        { id: 'json-to-xml', route: '/json-to-xml/', title: 'JSON to XML', description: 'Transform JSON data structures into well-formed, indented XML markup.', iconName: 'Code' },
        { id: 'xml-to-json', route: '/xml-to-json/', title: 'XML to JSON', description: 'Convert XML documents into structured JSON objects using browser DOM parser.', iconName: 'FileCode2' },
        { id: 'json-to-yaml', route: '/json-to-yaml/', title: 'JSON to YAML', description: 'Convert structured JSON payloads to clean YAML documents.', iconName: 'FileText' },
        { id: 'yaml-to-json', route: '/yaml-to-json/', title: 'YAML to JSON', description: 'Parse YAML configuration into formatted JSON with syntax validation.', iconName: 'FileJson' },
        { id: 'json-diff', route: '/json-diff/', title: 'JSON Diff', description: 'Side-by-side structural diff of two JSON documents highlighting changes.', iconName: 'GitCompare' },
      ]
    },
    {
      id: 'encoding',
      title: 'Encoding & Decoding',
      description: 'Encode and decode Base64, URLs, HTML entities, and JWTs.',
      icon: Binary,
      tools: [
        { id: 'base64-encode', route: '/base64-encode/', title: 'Base64 Encoder / Decoder', description: 'Encode & decode text or binary files to Base64 in both directions.', iconName: 'Binary' },
        { id: 'base64-to-image', route: '/base64-to-image/', title: 'Base64 to Image', description: 'Decode Base64 string into a downloadable image file with live preview.', iconName: 'Image' },
        { id: 'image-to-base64', route: '/image-to-base64/', title: 'Image to Base64', description: 'Convert image files into data URIs with copyable HTML and CSS snippets.', iconName: 'FileImage' },
        { id: 'url-encode', route: '/url-encode/', title: 'URL Encoder / Decoder', description: 'Encode or decode URI components and query string parameters.', iconName: 'Link' },
        { id: 'html-entity-encode', route: '/html-entity-encode/', title: 'HTML Entity Encoder', description: 'Escape and unescape special characters to safe HTML entities.', iconName: 'Code2' },
        { id: 'jwt-decoder', route: '/jwt-decoder/', title: 'JWT Decoder', description: 'Decode JSON Web Token header and payload claims client-side.', iconName: 'Key', badge: 'Client-Only' },
      ]
    },
    {
      id: 'hashing',
      title: 'Hashing & Checksums',
      description: 'Cryptographic hashing powered by Web Crypto API and SparkMD5.',
      icon: ShieldCheck,
      tools: [
        { id: 'sha256-generator', route: '/sha256-generator/', title: 'SHA-256 Hash Generator', description: 'Calculate SHA-256 digests for text strings or files via Web Crypto.', iconName: 'Shield' },
        { id: 'sha1-generator', route: '/sha1-generator/', title: 'SHA-1 Hash Generator', description: 'Generate 160-bit SHA-1 checksums for strings and binary files.', iconName: 'ShieldAlert' },
        { id: 'sha512-generator', route: '/sha512-generator/', title: 'SHA-512 Hash Generator', description: 'Compute 512-bit secure hash algorithms for verification.', iconName: 'ShieldCheck' },
        { id: 'md5-generator', route: '/md5-generator/', title: 'MD5 Hash Generator', description: 'Compute 128-bit MD5 checksums for legacy hash verification.', iconName: 'Hash' },
        { id: 'file-checksum', route: '/file-checksum/', title: 'File Checksum Verifier', description: 'Drop a file to compute SHA-256, SHA-1, SHA-512, MD5 with match verification.', iconName: 'CheckCircle2' },
      ]
    },
    {
      id: 'formatters',
      title: 'Code Formatters',
      description: 'Beautify and format HTML, CSS, JavaScript, SQL, and XML.',
      icon: AlignLeft,
      tools: [
        { id: 'html-formatter', route: '/html-formatter/', title: 'HTML Formatter', description: 'Prettify and indent messy HTML markup with tag preservation.', iconName: 'Code' },
        { id: 'css-formatter', route: '/css-formatter/', title: 'CSS Formatter', description: 'Beautify and indent CSS stylesheets for clean readability.', iconName: 'Paintbrush' },
        { id: 'css-minifier', route: '/css-minifier/', title: 'CSS Minifier', description: 'Strip comments and whitespace with real byte-reduction stats.', iconName: 'Minimize2' },
        { id: 'js-formatter', route: '/js-formatter/', title: 'JavaScript Formatter', description: 'Format and indent JS/TS code with custom brace and quote styles.', iconName: 'FileCode' },
        { id: 'sql-formatter', route: '/sql-formatter/', title: 'SQL Formatter', description: 'Beautify queries for PostgreSQL, MySQL, SQLite, and Transact-SQL.', iconName: 'Database' },
        { id: 'xml-formatter', route: '/xml-formatter/', title: 'XML Formatter', description: 'Pretty-print XML documents with syntax validation and indentation.', iconName: 'FileText' },
      ]
    },
    {
      id: 'generators',
      title: 'Generators',
      description: 'Cryptographically secure generators using crypto.getRandomValues.',
      icon: Sparkles,
      tools: [
        { id: 'uuid-generator', route: '/uuid-generator/', title: 'UUID Generator v4', description: 'Generate random UUID v4 identifiers in bulk up to 1,000 using Web Crypto.', iconName: 'Hash' },
        { id: 'password-generator', route: '/password-generator/', title: 'Password Generator', description: 'Cryptographic random passwords with entropy bits calculation.', iconName: 'Lock' },
        { id: 'random-string', route: '/random-string/', title: 'Random String Generator', description: 'Secure random strings with customizable length and character sets.', iconName: 'Shuffle' },
        { id: 'lorem-ipsum', route: '/lorem-ipsum/', title: 'Lorem Ipsum Generator', description: 'Generate classical Latin placeholder paragraphs, sentences, and words.', iconName: 'AlignLeft' },
      ]
    },
    {
      id: 'text',
      title: 'Text & Dev Utilities',
      description: 'Regular expressions, text diffing, timestamps, and case tools.',
      icon: Type,
      tools: [
        { id: 'regex-tester', route: '/regex-tester/', title: 'Regex Tester & Debugger', description: 'Live match highlighting, flag toggles, and capture group inspection.', iconName: 'Search' },
        { id: 'text-diff', route: '/text-diff/', title: 'Text Diff Checker', description: 'Side-by-side and inline text difference checker (line and word level).', iconName: 'GitCompare' },
        { id: 'timestamp-converter', route: '/timestamp-converter/', title: 'Timestamp Converter', description: 'Unix epoch to human-readable dates across timezones and vice versa.', iconName: 'Clock' },
        { id: 'cron-parser', route: '/cron-parser/', title: 'Cron Expression Parser', description: 'Translate cron schedules into plain English with upcoming occurrences.', iconName: 'Calendar' },
        { id: 'number-base-converter', route: '/number-base-converter/', title: 'Number Base Converter', description: 'Convert between Binary, Octal, Decimal, and Hex with BigInt precision.', iconName: 'Binary' },
        { id: 'slugify', route: '/slugify/', title: 'URL Slug Generator', description: 'Transform strings into clean, SEO-friendly URL slugs.', iconName: 'Link' },
        { id: 'case-converter', route: '/case-converter/', title: 'String Case Converter', description: 'Convert text to camelCase, snake_case, kebab-case, PascalCase, etc.', iconName: 'Type' },
        { id: 'query-string-parser', route: '/query-string-parser/', title: 'Query String Parser', description: 'Parse URL parameters into editable key-value grid or build queries.', iconName: 'ListFilter' },
      ]
    },
    {
      id: 'color',
      title: 'Color Tools',
      description: 'Color space conversion, palette extraction, and WCAG contrast.',
      icon: Palette,
      tools: [
        { id: 'color-converter', route: '/color-converter/', title: 'Color Converter', description: 'HEX, RGB, HSL, HSV, CMYK conversions with mathematical precision.', iconName: 'Palette' },
        { id: 'color-palette-extractor', route: '/color-palette-extractor/', title: 'Palette Extractor', description: 'Extract dominant colors from uploaded images using K-Means clustering.', iconName: 'Pipette' },
        { id: 'contrast-checker', route: '/contrast-checker/', title: 'WCAG Contrast Checker', description: 'Test color pairs for WCAG 2.1 AA and AAA accessibility compliance.', iconName: 'Eye' },
        { id: 'gradient-generator', route: '/gradient-generator/', title: 'CSS Gradient Generator', description: 'Visual linear and radial gradient builder with one-click CSS export.', iconName: 'Sparkles' },
      ]
    }
  ];

  // Filter tools
  const allTools = categories.flatMap((cat) =>
    cat.tools.map((t) => ({ ...t, categoryId: cat.id, categoryTitle: cat.title }))
  );

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold mb-4 shadow-xs">
          <Zap className="w-3.5 h-3.5" />
          <span>43 In-Browser Developer Utilities</span>
        </div>
        <PageH1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Developer <span className="text-red-600">Tools</span>
        </PageH1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Fast browser-based developer utilities. Tools that support client-side processing run in your browser without requiring a developer API account.
        </p>

        {/* Feature Highlights Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 text-xs text-slate-600 dark:text-zinc-400">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Client-Side</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Zero Network Calls</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Web Crypto Security</span>
          </span>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search developer tools (e.g. JSON formatter, base64, sha256, regex, contrast)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
            }`}
          >
            All Tools ({allTools.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1.5 ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
              }`}
            >
              <span>{cat.title}</span>
              <span className="text-[10px] opacity-70">({cat.tools.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.route)}
              className="group p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400">
                    {tool.categoryTitle}
                  </span>
                  {tool.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                <span>Open tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <Search className="w-8 h-8 mx-auto text-slate-400 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No tools found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            No developer tools matched &ldquo;{searchQuery}&rdquo;. Try another keyword or clear your filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
