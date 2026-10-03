/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Search,
  Download,
  FileText,
  Trash2,
  Sparkles,
  ArrowDownUp,
  Sliders,
  Type
} from 'lucide-react';

interface TextUtilitiesProps {
  toolId: string;
}

export default function TextUtilities({ toolId }: TextUtilitiesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  switch (toolId) {
    case 'word-counter':
      return <WordCounter onCopy={handleCopy} />;
    case 'remove-duplicate-lines':
      return <RemoveDuplicateLines onCopy={handleCopy} onDownload={handleDownload} />;
    case 'sort-lines':
      return <SortLines onCopy={handleCopy} onDownload={handleDownload} />;
    case 'find-and-replace':
      return <FindAndReplace onCopy={handleCopy} onDownload={handleDownload} />;
    case 'text-repeater':
      return <TextRepeater onCopy={handleCopy} onDownload={handleDownload} />;
    case 'reverse-text':
      return <ReverseText onCopy={handleCopy} onDownload={handleDownload} />;
    case 'remove-line-breaks':
      return <RemoveLineBreaks onCopy={handleCopy} onDownload={handleDownload} />;
    case 'whitespace-remover':
      return <WhitespaceRemover onCopy={handleCopy} onDownload={handleDownload} />;
    case 'text-to-speech':
      return <TextToSpeech />;
    case 'character-map':
      return <CharacterMap onCopy={handleCopy} />;
    default:
      return <div className="text-sm text-slate-500">Select a valid text utility tool.</div>;
  }
}

// -------------------------------------------------------------
// 1. WORD COUNTER
// -------------------------------------------------------------
function WordCounter({ onCopy }: { onCopy: (text: string) => void }) {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s+/g, '').length;
    
    // Words: split by whitespace and filter non-empty tokens
    const wordsArray = text.trim().length > 0 ? text.trim().split(/\s+/).filter(Boolean) : [];
    const wordCount = wordsArray.length;

    // Sentences: split on period, exclamation, question mark
    const sentences = text.trim().length > 0 
      ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length 
      : 0;

    // Paragraphs: split by double newline or non-empty blocks
    const paragraphs = text.trim().length > 0
      ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
      : 0;

    // Reading time: standard 200 words/min
    const readingMinutes = wordCount / 200;
    const readingSeconds = Math.round(readingMinutes * 60);

    // Speaking time: standard 130 words/min
    const speakingMinutes = wordCount / 130;
    const speakingSeconds = Math.round(speakingMinutes * 60);

    // Keyword density: top 5 words
    const freqMap: Record<string, number> = {};
    for (const w of wordsArray) {
      const clean = w.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (clean.length > 2) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    }
    const topWords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        percent: wordCount > 0 ? ((count / wordCount) * 100).toFixed(1) : '0'
      }));

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      wordCount,
      sentences,
      paragraphs,
      readingSeconds,
      speakingSeconds,
      topWords
    };
  }, [text]);

  const loadSample = () => {
    setText(
      'Client-side tools provide unmatched security and privacy. When your data never leaves your device, you remain in complete control of your confidential documents, creative ideas, and everyday work. Fast, reliable, and always available.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Words
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats.wordCount.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Characters
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats.charsWithSpaces.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
            {stats.charsWithoutSpaces.toLocaleString()} no spaces
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Sentences
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats.sentences.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Paragraphs
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats.paragraphs.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-zinc-400 font-medium">Estimated Reading Time:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {stats.readingSeconds < 60 ? `${stats.readingSeconds} sec` : `${Math.ceil(stats.readingSeconds / 60)} min`}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-zinc-400 font-medium">Estimated Speaking Time:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {stats.speakingSeconds < 60 ? `${stats.speakingSeconds} sec` : `${Math.ceil(stats.speakingSeconds / 60)} min`}
          </span>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Type or Paste Your Text
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSample}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Load Sample
            </button>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <button
              onClick={() => setText('')}
              className="text-xs text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here..."
          className="w-full p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
        />
      </div>

      {/* Keyword Frequency Table */}
      {stats.topWords.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Top Keyword Frequency
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stats.topWords.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-center"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {item.word}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
                  {item.count}x ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. REMOVE DUPLICATE LINES
// -------------------------------------------------------------
function RemoveDuplicateLines({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [input, setInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeBlank, setRemoveBlank] = useState(true);
  const [keepLast, setKeepLast] = useState(false);

  const result = useMemo(() => {
    if (!input) return { text: '', originalCount: 0, uniqueCount: 0, removedCount: 0 };
    let lines = input.split(/\r?\n/);
    const originalCount = lines.length;

    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }
    if (removeBlank) {
      lines = lines.filter((l) => l.length > 0);
    }

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    const processLines = keepLast ? [...lines].reverse() : lines;

    for (const line of processLines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    }

    if (keepLast) {
      uniqueLines.reverse();
    }

    const uniqueCount = uniqueLines.length;
    const removedCount = originalCount - uniqueCount;

    return {
      text: uniqueLines.join('\n'),
      originalCount,
      uniqueCount,
      removedCount
    };
  }, [input, caseSensitive, trimLines, removeBlank, keepLast]);

  return (
    <div className="space-y-6">
      {/* Options Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Case Sensitive</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
            className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Trim Whitespace</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeBlank}
            onChange={(e) => setRemoveBlank(e.target.checked)}
            className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Remove Blank Lines</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={keepLast}
            onChange={(e) => setKeepLast(e.target.checked)}
            className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Keep Last Occurrence</span>
        </label>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-zinc-300">Input Lines</span>
            <span className="text-slate-500 dark:text-zinc-400">
              {result.originalCount} {result.originalCount === 1 ? 'line' : 'lines'}
            </span>
          </div>
          <textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste list of items with duplicates..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-zinc-300">Deduplicated Output</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {result.uniqueCount} unique &bull; {result.removedCount} removed
            </span>
          </div>
          <textarea
            readOnly
            rows={12}
            value={result.text}
            placeholder="Deduplicated lines appear here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(result.text)}
          disabled={!result.text}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Output</span>
        </button>
        <button
          onClick={() => onDownload(result.text, 'deduplicated-lines.txt')}
          disabled={!result.text}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. SORT LINES
// -------------------------------------------------------------
function SortLines({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [input, setInput] = useState('');
  const [sortMode, setSortMode] = useState<'alpha-asc' | 'alpha-desc' | 'natural' | 'length-asc' | 'length-desc' | 'reverse' | 'shuffle'>('alpha-asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  const sortedOutput = useMemo(() => {
    if (!input) return '';
    let lines = input.split(/\r?\n/);
    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    switch (sortMode) {
      case 'alpha-asc':
        return [...lines].sort((a, b) =>
          caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())
        ).join('\n');
      case 'alpha-desc':
        return [...lines].sort((a, b) =>
          caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())
        ).join('\n');
      case 'natural':
        return [...lines].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: caseSensitive ? 'case' : 'base' })
        ).join('\n');
      case 'length-asc':
        return [...lines].sort((a, b) => a.length - b.length || a.localeCompare(b)).join('\n');
      case 'length-desc':
        return [...lines].sort((a, b) => b.length - a.length || a.localeCompare(b)).join('\n');
      case 'reverse':
        return [...lines].reverse().join('\n');
      case 'shuffle': {
        const arr = [...lines];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('\n');
      }
      default:
        return input;
    }
  }, [input, sortMode, caseSensitive, trimLines]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Sort Mode:</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="alpha-asc">Alphabetical (A &rarr; Z)</option>
            <option value="alpha-desc">Alphabetical Reverse (Z &rarr; A)</option>
            <option value="natural">Natural Numerical (1, 2, 10...)</option>
            <option value="length-asc">Line Length (Shortest first)</option>
            <option value="length-desc">Line Length (Longest first)</option>
            <option value="reverse">Reverse Line Order</option>
            <option value="shuffle">Random Shuffle</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Case Sensitive</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Trim Whitespace</span>
          </label>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          rows={12}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste lines to sort..."
          className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        />
        <textarea
          readOnly
          rows={12}
          value={sortedOutput}
          placeholder="Sorted lines will display here..."
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
        />
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(sortedOutput)}
          disabled={!sortedOutput}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Sorted Text</span>
        </button>
        <button
          onClick={() => onDownload(sortedOutput, 'sorted-lines.txt')}
          disabled={!sortedOutput}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. FIND AND REPLACE
// -------------------------------------------------------------
function FindAndReplace({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [content, setContent] = useState('');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  const { output, matchCount } = useMemo(() => {
    if (!content || !findStr) return { output: content, matchCount: 0 };
    setRegexError(null);

    try {
      let regex: RegExp;
      if (isRegex) {
        const flags = 'g' + (matchCase ? '' : 'i');
        regex = new RegExp(findStr, flags);
      } else {
        let escaped = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (wholeWord) {
          escaped = `\\b${escaped}\\b`;
        }
        const flags = 'g' + (matchCase ? '' : 'i');
        regex = new RegExp(escaped, flags);
      }

      const matches = content.match(regex);
      const matchCount = matches ? matches.length : 0;
      const output = content.replace(regex, replaceStr);

      return { output, matchCount };
    } catch (err: any) {
      setRegexError(err.message);
      return { output: content, matchCount: 0 };
    }
  }, [content, findStr, replaceStr, isRegex, matchCase, wholeWord]);

  return (
    <div className="space-y-6">
      {/* Controls Container */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Find
            </label>
            <input
              type="text"
              value={findStr}
              onChange={(e) => setFindStr(e.target.value)}
              placeholder={isRegex ? 'Enter regular expression (e.g. \\d{4})' : 'Find text...'}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Replace With
            </label>
            <input
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              placeholder="Replacement string..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-800">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold text-slate-700 dark:text-zinc-300">RegEx Mode</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Match Case</span>
            </label>
            {!isRegex && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholeWord}
                  onChange={(e) => setWholeWord(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Whole Word</span>
              </label>
            )}
          </div>

          <div className="text-xs font-bold text-slate-600 dark:text-zinc-400">
            {regexError ? (
              <span className="text-red-500">{regexError}</span>
            ) : (
              <span>Matches: <strong className="text-amber-600 dark:text-amber-400">{matchCount}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Editor surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Original Text
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your source text here..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Replaced Result
          </label>
          <textarea
            readOnly
            rows={10}
            value={output}
            placeholder="Replaced output appears here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(output)}
          disabled={!output}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Result</span>
        </button>
        <button
          onClick={() => onDownload(output, 'replaced-text.txt')}
          disabled={!output}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. TEXT REPEATER
// -------------------------------------------------------------
function TextRepeater({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [text, setText] = useState('Hello World');
  const [count, setCount] = useState<number>(5);
  const [separator, setSeparator] = useState<'newline' | 'space' | 'comma' | 'custom'>('newline');
  const [customSep, setCustomSep] = useState(' - ');
  const [addNumbers, setAddNumbers] = useState(false);

  const repeatedOutput = useMemo(() => {
    if (!text || count <= 0) return '';
    const safeCount = Math.min(Math.max(1, count), 10000);

    let sep = '\n';
    if (separator === 'space') sep = ' ';
    if (separator === 'comma') sep = ', ';
    if (separator === 'custom') sep = customSep;

    const items: string[] = [];
    for (let i = 1; i <= safeCount; i++) {
      items.push(addNumbers ? `${i}. ${text}` : text);
    }
    return items.join(sep);
  }, [text, count, separator, customSep, addNumbers]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Text to Repeat
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Repeat Count (1 &ndash; 10,000)
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-700 dark:text-zinc-300">Separator:</span>
            <div className="flex items-center space-x-2">
              {(['newline', 'space', 'comma', 'custom'] as const).map((mode) => (
                <label key={mode} className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="sep"
                    checked={separator === mode}
                    onChange={() => setSeparator(mode)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="capitalize text-slate-700 dark:text-zinc-300">{mode}</span>
                </label>
              ))}
            </div>

            {separator === 'custom' && (
              <input
                type="text"
                value={customSep}
                onChange={(e) => setCustomSep(e.target.value)}
                placeholder="Custom separator"
                className="w-24 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
              />
            )}
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addNumbers}
              onChange={(e) => setAddNumbers(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Add Line Numbers</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Generated Output</span>
          <span className="text-slate-500">
            {repeatedOutput.length.toLocaleString()} characters
          </span>
        </div>
        <textarea
          readOnly
          rows={10}
          value={repeatedOutput}
          className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
        />
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(repeatedOutput)}
          disabled={!repeatedOutput}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Output</span>
        </button>
        <button
          onClick={() => onDownload(repeatedOutput, 'repeated-text.txt')}
          disabled={!repeatedOutput}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. REVERSE TEXT
// -------------------------------------------------------------
function ReverseText({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog.');
  const [mode, setMode] = useState<'char' | 'words' | 'lines' | 'upside-down'>('char');

  // Upside down unicode map
  const upsideDownMap: Record<string, string> = {
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
    k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
    u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
    A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ',
    K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥',
    U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
    '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
    '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡', '?': '¿', '<': '>', '>': '<',
    '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '&': '⅋', '_': '‾'
  };

  const reversed = useMemo(() => {
    if (!text) return '';
    switch (mode) {
      case 'char':
        return Array.from(text).reverse().join('');
      case 'words':
        return text.split(/(\s+)/).reverse().join('');
      case 'lines':
        return text.split(/\r?\n/).reverse().join('\n');
      case 'upside-down': {
        const flipped = text.split('').map((c) => upsideDownMap[c] || c);
        return flipped.reverse().join('');
      }
      default:
        return text;
    }
  }, [text, mode]);

  return (
    <div className="space-y-6">
      {/* Modes */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'char', label: 'Reverse Characters' },
          { id: 'words', label: 'Reverse Words' },
          { id: 'lines', label: 'Reverse Lines' },
          { id: 'upside-down', label: 'Upside Down (Flip)' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mode === m.id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Input Text
          </label>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Reversed Output
          </label>
          <textarea
            readOnly
            rows={8}
            value={reversed}
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(reversed)}
          disabled={!reversed}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Reversed Text</span>
        </button>
        <button
          onClick={() => onDownload(reversed, 'reversed-text.txt')}
          disabled={!reversed}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. REMOVE LINE BREAKS
// -------------------------------------------------------------
function RemoveLineBreaks({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'spaces' | 'preserve-paragraphs' | 'custom'>('spaces');
  const [customSep, setCustomSep] = useState(', ');

  const { output, breaksRemoved } = useMemo(() => {
    if (!text) return { output: '', breaksRemoved: 0 };

    const totalBreaks = (text.match(/\r?\n/g) || []).length;

    let output = '';
    if (mode === 'spaces') {
      output = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (mode === 'preserve-paragraphs') {
      const paragraphs = text.split(/\r?\n\s*\r?\n/);
      output = paragraphs
        .map((p) => p.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim())
        .join('\n\n');
    } else {
      output = text.replace(/\r?\n/g, customSep);
    }

    return { output, breaksRemoved: totalBreaks };
  }, [text, mode, customSep]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="break-mode"
              checked={mode === 'spaces'}
              onChange={() => setMode('spaces')}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Replace with Single Space</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="break-mode"
              checked={mode === 'preserve-paragraphs'}
              onChange={() => setMode('preserve-paragraphs')}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Preserve Paragraphs</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="break-mode"
              checked={mode === 'custom'}
              onChange={() => setMode('custom')}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Custom Separator</span>
          </label>

          {mode === 'custom' && (
            <input
              type="text"
              value={customSep}
              onChange={(e) => setCustomSep(e.target.value)}
              className="w-20 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          )}
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Line breaks removed: <strong className="text-amber-600 dark:text-amber-400">{breaksRemoved}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Input with Line Breaks
          </label>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text with unwanted hard wraps or line breaks..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Continuous Text Output
          </label>
          <textarea
            readOnly
            rows={10}
            value={output}
            placeholder="Continuous output without line breaks appears here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(output)}
          disabled={!output}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Output</span>
        </button>
        <button
          onClick={() => onDownload(output, 'cleaned-text.txt')}
          disabled={!output}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. WHITESPACE REMOVER
// -------------------------------------------------------------
function WhitespaceRemover({
  onCopy,
  onDownload
}: {
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}) {
  const [text, setText] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(true);
  const [tabsToSpaces, setTabsToSpaces] = useState(true);

  const { cleaned, originalBytes, cleanedBytes } = useMemo(() => {
    if (!text) return { cleaned: '', originalBytes: 0, cleanedBytes: 0 };
    const originalBytes = new TextEncoder().encode(text).length;

    let res = text;
    if (tabsToSpaces) {
      res = res.replace(/\t/g, '    ');
    }

    let lines = res.split(/\r?\n/);
    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }
    if (collapseSpaces) {
      lines = lines.map((l) => l.replace(/ {2,}/g, ' '));
    }
    if (removeBlankLines) {
      lines = lines.filter((l) => l.length > 0);
    }

    const cleaned = lines.join('\n');
    const cleanedBytes = new TextEncoder().encode(cleaned).length;

    return { cleaned, originalBytes, cleanedBytes };
  }, [text, trimLines, collapseSpaces, removeBlankLines, tabsToSpaces]);

  const savedBytes = Math.max(0, originalBytes - cleanedBytes);
  const savedPercent = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Trim Line Edges</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={collapseSpaces}
              onChange={(e) => setCollapseSpaces(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Collapse Consecutive Spaces</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeBlankLines}
              onChange={(e) => setRemoveBlankLines(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Remove Blank Lines</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tabsToSpaces}
              onChange={(e) => setTabsToSpaces(e.target.checked)}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Tabs to Spaces</span>
          </label>
        </div>

        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Saved: {savedBytes} bytes ({savedPercent}%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Original Text ({originalBytes} bytes)
          </label>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text with excessive spaces, trailing tabs, or blank lines..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Cleaned Text ({cleanedBytes} bytes)
          </label>
          <textarea
            readOnly
            rows={10}
            value={cleaned}
            placeholder="Normalized text appears here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onCopy(cleaned)}
          disabled={!cleaned}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Cleaned Text</span>
        </button>
        <button
          onClick={() => onDownload(cleaned, 'clean-whitespace.txt')}
          disabled={!cleaned}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .txt</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. TEXT TO SPEECH
// -------------------------------------------------------------
function TextToSpeech() {
  const [text, setText] = useState(
    'Welcome to the private, in-browser text to speech synthesizer. All speech audio is generated directly on your machine through the browser speech engine with zero latency, zero cloud APIs, and complete privacy.'
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (available.length > 0 && !selectedVoice) {
        // Default to first English or first voice
        const defaultVoice = available.find((v) => v.lang.startsWith('en')) || available[0];
        if (defaultVoice) setSelectedVoice(defaultVoice.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim() || !supported) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceObj = voices.find((v) => v.voiceURI === selectedVoice);
    if (voiceObj) utterance.voice = voiceObj;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!supported) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
        Web Speech Synthesis API is not supported in this browser. Please use Chrome, Safari, Edge, or Firefox.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
          Text to Read Aloud
        </label>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak..."
          className="w-full p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
        />
      </div>

      {/* Settings Grid */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Voice ({voices.length} available)
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
            <span>Speed / Rate</span>
            <span>{rate}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
            <span>Pitch</span>
            <span>{pitch}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking && !isPaused ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-slate-300 dark:bg-zinc-700'
            }`}
          />
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
            {isSpeaking && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isSpeaking || isPaused ? (
            <button
              onClick={isPaused ? handleResume : handleSpeak}
              disabled={!text.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Resume' : 'Speak'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleStop}
            disabled={!isSpeaking && !isPaused}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. CHARACTER MAP
// -------------------------------------------------------------
function CharacterMap({ onCopy }: { onCopy: (text: string) => void }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('currency');
  const [selectedChar, setSelectedChar] = useState<{ char: string; name: string; hex: string; dec: number } | null>(null);

  const charDatabase = useMemo(() => {
    return [
      // Currency
      { cat: 'currency', char: '$', name: 'Dollar Sign', hex: '0024', dec: 36 },
      { cat: 'currency', char: '€', name: 'Euro Sign', hex: '20AC', dec: 8364 },
      { cat: 'currency', char: '£', name: 'Pound Sign', hex: '00A3', dec: 163 },
      { cat: 'currency', char: '¥', name: 'Yen / Yuan Sign', hex: '00A5', dec: 165 },
      { cat: 'currency', char: '₹', name: 'Indian Rupee Sign', hex: '20B9', dec: 8377 },
      { cat: 'currency', char: '₨', name: 'Rupee Sign', hex: '20A8', dec: 8360 },
      { cat: 'currency', char: '₩', name: 'Won Sign', hex: '20A9', dec: 8361 },
      { cat: 'currency', char: '₿', name: 'Bitcoin Sign', hex: '20BF', dec: 8383 },
      { cat: 'currency', char: '¢', name: 'Cent Sign', hex: '00A2', dec: 162 },
      { cat: 'currency', char: '₽', name: 'Ruble Sign', hex: '20BD', dec: 8381 },
      { cat: 'currency', char: '₺', name: 'Turkish Lira', hex: '20BA', dec: 8378 },
      { cat: 'currency', char: '₸', name: 'Tenge Sign', hex: '20B8', dec: 8376 },
      { cat: 'currency', char: '₣', name: 'French Franc', hex: '20A3', dec: 8355 },
      { cat: 'currency', char: '₱', name: 'Peso Sign', hex: '20B1', dec: 8369 },

      // Arrows
      { cat: 'arrows', char: '←', name: 'Leftwards Arrow', hex: '2190', dec: 8592 },
      { cat: 'arrows', char: '→', name: 'Rightwards Arrow', hex: '2192', dec: 8594 },
      { cat: 'arrows', char: '↑', name: 'Upwards Arrow', hex: '2191', dec: 8593 },
      { cat: 'arrows', char: '↓', name: 'Downwards Arrow', hex: '2193', dec: 8595 },
      { cat: 'arrows', char: '↔', name: 'Left Right Arrow', hex: '2194', dec: 8596 },
      { cat: 'arrows', char: '↕', name: 'Up Down Arrow', hex: '2195', dec: 8597 },
      { cat: 'arrows', char: '⇄', name: 'Rightwards Arrow Over Leftwards', hex: '21C4', dec: 8644 },
      { cat: 'arrows', char: '⇅', name: 'Upwards Arrow Left Of Downwards', hex: '21C5', dec: 8645 },
      { cat: 'arrows', char: '⇒', name: 'Rightwards Double Arrow', hex: '21D2', dec: 8658 },
      { cat: 'arrows', char: '⇐', name: 'Leftwards Double Arrow', hex: '21D0', dec: 8656 },
      { cat: 'arrows', char: '⇔', name: 'Left Right Double Arrow', hex: '21D4', dec: 8660 },
      { cat: 'arrows', char: '➔', name: 'Heavy Rightwards Arrow', hex: '2794', dec: 10132 },
      { cat: 'arrows', char: '➜', name: 'Heavy Round-Tipped Right Arrow', hex: '279C', dec: 10140 },
      { cat: 'arrows', char: '↵', name: 'Downwards Arrow With Corner Left', hex: '21B5', dec: 8629 },

      // Math
      { cat: 'math', char: '±', name: 'Plus-Minus Sign', hex: '00B1', dec: 177 },
      { cat: 'math', char: '×', name: 'Multiplication Sign', hex: '00D7', dec: 215 },
      { cat: 'math', char: '÷', name: 'Division Sign', hex: '00F7', dec: 247 },
      { cat: 'math', char: '≠', name: 'Not Equal To', hex: '2260', dec: 8800 },
      { cat: 'math', char: '≈', name: 'Almost Equal To', hex: '2248', dec: 8776 },
      { cat: 'math', char: '≤', name: 'Less-Than or Equal To', hex: '2264', dec: 8804 },
      { cat: 'math', char: '≥', name: 'Greater-Than or Equal To', hex: '2265', dec: 8805 },
      { cat: 'math', char: '∑', name: 'N-Ary Summation', hex: '2211', dec: 8721 },
      { cat: 'math', char: '√', name: 'Square Root', hex: '221A', dec: 8730 },
      { cat: 'math', char: '∞', name: 'Infinity', hex: '221E', dec: 8734 },
      { cat: 'math', char: 'π', name: 'Greek Small Letter Pi', hex: '03C0', dec: 960 },
      { cat: 'math', char: '∆', name: 'Increment / Delta', hex: '2206', dec: 8710 },
      { cat: 'math', char: '∫', name: 'Integral', hex: '222B', dec: 8747 },
      { cat: 'math', char: '∂', name: 'Partial Differential', hex: '2202', dec: 8706 },
      { cat: 'math', char: '‰', name: 'Per Mille Sign', hex: '2030', dec: 8240 },
      { cat: 'math', char: 'µ', name: 'Micro Sign', hex: '00B5', dec: 181 },

      // Symbols & Badges
      { cat: 'symbols', char: '★', name: 'Black Star', hex: '2605', dec: 9733 },
      { cat: 'symbols', char: '☆', name: 'White Star', hex: '2606', dec: 9734 },
      { cat: 'symbols', char: '✦', name: 'Black Four Pointed Star', hex: '2726', dec: 10022 },
      { cat: 'symbols', char: '✓', name: 'Check Mark', hex: '2713', dec: 10003 },
      { cat: 'symbols', char: '✔', name: 'Heavy Check Mark', hex: '2714', dec: 10004 },
      { cat: 'symbols', char: '✕', name: 'Multiplication X / Cross', hex: '2715', dec: 10005 },
      { cat: 'symbols', char: '✖', name: 'Heavy Multiplication X', hex: '2716', dec: 10006 },
      { cat: 'symbols', char: '©', name: 'Copyright Sign', hex: '00A9', dec: 169 },
      { cat: 'symbols', char: '®', name: 'Registered Sign', hex: '00AE', dec: 174 },
      { cat: 'symbols', char: '™', name: 'Trade Mark Sign', hex: '2122', dec: 8482 },
      { cat: 'symbols', char: '♥', name: 'Black Heart Suit', hex: '2665', dec: 9829 },
      { cat: 'symbols', char: '♦', name: 'Black Diamond Suit', hex: '2666', dec: 9830 },
      { cat: 'symbols', char: '♣', name: 'Black Club Suit', hex: '2663', dec: 9827 },
      { cat: 'symbols', char: '♠', name: 'Black Spade Suit', hex: '2660', dec: 9824 },
      { cat: 'symbols', char: '⚠', name: 'Warning Sign', hex: '26A0', dec: 9888 },
      { cat: 'symbols', char: '⚡', name: 'High Voltage Sign', hex: '26A1', dec: 9889 },
      { cat: 'symbols', char: '♻', name: 'Black Universal Recycling Symbol', hex: '267B', dec: 9851 },

      // Punctuation
      { cat: 'punctuation', char: '“', name: 'Left Double Quotation Mark', hex: '201C', dec: 8220 },
      { cat: 'punctuation', char: '”', name: 'Right Double Quotation Mark', hex: '201D', dec: 8221 },
      { cat: 'punctuation', char: '‘', name: 'Left Single Quotation Mark', hex: '2018', dec: 8216 },
      { cat: 'punctuation', char: '’', name: 'Right Single Quotation Mark', hex: '2019', dec: 8217 },
      { cat: 'punctuation', char: '«', name: 'Left-Pointing Double Angle Quotation', hex: '00AB', dec: 171 },
      { cat: 'punctuation', char: '»', name: 'Right-Pointing Double Angle Quotation', hex: '00BB', dec: 187 },
      { cat: 'punctuation', char: '—', name: 'Em Dash', hex: '2014', dec: 8212 },
      { cat: 'punctuation', char: '–', name: 'En Dash', hex: '2013', dec: 8211 },
      { cat: 'punctuation', char: '…', name: 'Horizontal Ellipsis', hex: '2026', dec: 8230 },
      { cat: 'punctuation', char: '¿', name: 'Inverted Question Mark', hex: '00BF', dec: 191 },
      { cat: 'punctuation', char: '¡', name: 'Inverted Exclamation Mark', hex: '00A1', dec: 161 },
      { cat: 'punctuation', char: '§', name: 'Section Sign', hex: '00A7', dec: 167 },
      { cat: 'punctuation', char: '¶', name: 'Pilcrow / Paragraph Sign', hex: '00B6', dec: 182 },
      { cat: 'punctuation', char: '•', name: 'Bullet', hex: '2022', dec: 8226 },
      { cat: 'punctuation', char: '°', name: 'Degree Sign', hex: '00B0', dec: 176 }
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return charDatabase.filter((c) => c.cat === activeCategory);
    }
    return charDatabase.filter(
      (c) =>
        c.char.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.hex.toLowerCase().includes(q) ||
        String(c.dec).includes(q)
    );
  }, [search, activeCategory, charDatabase]);

  return (
    <div className="space-y-6">
      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, code (e.g. 20AC), or name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {!search && (
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'currency', label: 'Currency' },
              { id: 'arrows', label: 'Arrows' },
              { id: 'math', label: 'Math' },
              { id: 'symbols', label: 'Symbols' },
              { id: 'punctuation', label: 'Punctuation' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Characters */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {filtered.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedChar(item);
              onCopy(item.char);
            }}
            className="h-14 flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500/60 hover:shadow-sm transition-all cursor-pointer group"
            title={`${item.name} (Click to copy)`}
          >
            <span className="text-xl leading-none text-slate-900 dark:text-white group-hover:scale-125 transition-transform">
              {item.char}
            </span>
            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 mt-1 truncate max-w-full">
              U+{item.hex}
            </span>
          </button>
        ))}
      </div>

      {/* Selected character inspector */}
      {selectedChar && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-3xl text-slate-900 dark:text-white shadow-xs">
              {selectedChar.char}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedChar.name}
              </h4>
              <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                Unicode: U+{selectedChar.hex} &bull; Dec: {selectedChar.dec} &bull; HTML: &amp;#{selectedChar.dec};
              </p>
            </div>
          </div>

          <button
            onClick={() => onCopy(selectedChar.char)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copied to Clipboard!</span>
          </button>
        </div>
      )}
    </div>
  );
}
