/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  GitCompare,
  Clock,
  Calendar,
  Binary,
  Link,
  Type,
  ListFilter,
  Plus,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import cronstrue from 'cronstrue';
import * as Diff from 'diff';

interface TextDevToolsProps {
  toolId: string;
}

export default function TextDevTools({ toolId }: TextDevToolsProps) {
  // Shared States
  const [inputText, setInputText] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Regex Tester States
  const [regexPattern, setRegexPattern] = useState('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: true
  });
  const [regexReplacePattern, setRegexReplacePattern] = useState('$1@[MASKED]');
  const [regexError, setRegexError] = useState<string | null>(null);

  // Text Diff States
  const [diffOriginal, setDiffOriginal] = useState(
    `function calculate(a, b) {\n  const result = a + b;\n  console.log("Adding:", a, b);\n  return result;\n}`
  );
  const [diffModified, setDiffModified] = useState(
    `function calculate(a, b, multiplier = 1) {\n  const result = (a + b) * multiplier;\n  console.log("Result:", result);\n  return result;\n}`
  );
  const [diffMode, setDiffMode] = useState<'lines' | 'words' | 'chars'>('lines');
  const [diffLayout, setDiffLayout] = useState<'unified' | 'split'>('unified');

  // Timestamp Converter States
  const [epochSeconds, setEpochSeconds] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [targetTimezone, setTargetTimezone] = useState<string>('UTC');

  // Cron Parser States
  const [cronExpr, setCronExpr] = useState('*/15 * * * *');

  // Base Converter States
  const [baseInput, setBaseInput] = useState('255');
  const [baseInputType, setBaseInputType] = useState<'10' | '16' | '2' | '8'>('10');

  // Slugify States
  const [slugSeparator, setSlugSeparator] = useState<'-' | '_'>('-');
  const [slugLowercase, setSlugLowercase] = useState<boolean>(true);

  // Query String Parser States
  const [rawQueryInput, setRawQueryInput] = useState('https://api.example.com/v1/search?category=software&sort=desc&limit=25&active=true');
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([]);

  // Sample Loader
  const loadSample = () => {
    if (toolId === 'regex-tester') {
      setRegexPattern('([A-Z]{2,3})-(\\d{3,4})');
      setInputText(
        'Flight status: NY-104 is on time, LA-889 is boarding, and SFO-4022 was delayed. Reference PR-901.'
      );
    } else if (toolId === 'cron-parser') {
      setCronExpr('0 9 * * 1-5'); // 9 AM on weekdays
    } else if (toolId === 'timestamp-converter') {
      setEpochSeconds(Math.floor(Date.now() / 1000).toString());
    } else if (toolId === 'slugify') {
      setInputText('Modern Web Development in 2026: 10 Best Practices & Insights!');
    } else if (toolId === 'case-converter') {
      setInputText('nexvert developer toolkit');
    }
  };

  // Copy helper
  const handleCopy = (text: string, key = 'default') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // REGEX MATCHES COMPUTATION
  const regexResults = useMemo(() => {
    if (toolId !== 'regex-tester') return null;
    setRegexError(null);
    if (!regexPattern) return null;

    try {
      let flagsStr = '';
      if (regexFlags.g) flagsStr += 'g';
      if (regexFlags.i) flagsStr += 'i';
      if (regexFlags.m) flagsStr += 'm';
      if (regexFlags.s) flagsStr += 's';
      if (regexFlags.u) flagsStr += 'u';

      const re = new RegExp(regexPattern, flagsStr);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (regexFlags.g) {
        let m;
        let count = 0;
        while ((m = re.exec(inputText)) !== null && count < 500) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1)
          });
          if (m.index === re.lastIndex) re.lastIndex++;
          count++;
        }
      } else {
        const m = re.exec(inputText);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1)
          });
        }
      }

      // Compute replaced preview
      let replaced = '';
      try {
        replaced = inputText.replace(re, regexReplacePattern);
      } catch {
        replaced = inputText;
      }

      return { matches, replaced };
    } catch (err: any) {
      setRegexError(err.message);
      return null;
    }
  }, [regexPattern, regexFlags, inputText, regexReplacePattern, toolId]);

  // DIFF COMPUTATION
  const diffResult = useMemo(() => {
    if (toolId !== 'text-diff') return null;
    let parts: Diff.Change[] = [];
    if (diffMode === 'lines') {
      parts = Diff.diffLines(diffOriginal, diffModified);
    } else if (diffMode === 'words') {
      parts = Diff.diffWords(diffOriginal, diffModified);
    } else {
      parts = Diff.diffChars(diffOriginal, diffModified);
    }

    const added = parts.filter((p) => p.added).length;
    const removed = parts.filter((p) => p.removed).length;
    return { parts, added, removed };
  }, [diffOriginal, diffModified, diffMode, toolId]);

  // TIMESTAMP CALCULATIONS
  const timestampData = useMemo(() => {
    if (toolId !== 'timestamp-converter') return null;
    let sec = parseInt(epochSeconds.trim(), 10);
    if (isNaN(sec)) return null;

    // Auto-detect milliseconds if > 1e11 (e.g. 13-digit)
    if (sec > 1e11) {
      sec = Math.floor(sec / 1000);
    }

    const date = new Date(sec * 1000);
    if (isNaN(date.getTime())) return null;

    const iso = date.toISOString();
    const utc = date.toUTCString();
    let localized = '';
    try {
      localized = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTimezone === 'Local' ? undefined : targetTimezone,
        dateStyle: 'full',
        timeStyle: 'long'
      }).format(date);
    } catch {
      localized = date.toString();
    }

    // Relative time
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    let relative = '';
    if (Math.abs(diffSec) < 60) relative = rtf.format(-diffSec, 'second');
    else if (Math.abs(diffSec) < 3600) relative = rtf.format(-Math.round(diffSec / 60), 'minute');
    else if (Math.abs(diffSec) < 86400) relative = rtf.format(-Math.round(diffSec / 3600), 'hour');
    else relative = rtf.format(-Math.round(diffSec / 86400), 'day');

    return { sec, date, iso, utc, localized, relative };
  }, [epochSeconds, targetTimezone, toolId]);

  // CRON CALCULATION
  const cronInfo = useMemo(() => {
    if (toolId !== 'cron-parser') return null;
    try {
      const description = cronstrue.toString(cronExpr.trim(), { throwExceptionOnParseError: true });
      const parts = cronExpr.trim().split(/\s+/);
      return { description, parts, valid: true };
    } catch (e: any) {
      return { description: e.message || 'Invalid cron expression', valid: false };
    }
  }, [cronExpr, toolId]);

  // BASE CONVERTER COMPUTATION (using BigInt for arbitrary precision)
  const baseData = useMemo(() => {
    if (toolId !== 'number-base-converter' || !baseInput.trim()) return null;
    try {
      let bigNum: bigint;
      const clean = baseInput.trim().replace(/_/g, '');
      if (baseInputType === '10') {
        bigNum = BigInt(clean);
      } else if (baseInputType === '16') {
        bigNum = BigInt(`0x${clean}`);
      } else if (baseInputType === '2') {
        bigNum = BigInt(`0b${clean}`);
      } else {
        bigNum = BigInt(`0o${clean}`);
      }

      const bin = bigNum.toString(2);
      const oct = bigNum.toString(8);
      const dec = bigNum.toString(10);
      const hex = bigNum.toString(16).toUpperCase();

      return {
        bin,
        oct,
        dec,
        hex,
        bitLength: bin.length,
        byteCount: Math.ceil(bin.length / 8)
      };
    } catch {
      return null;
    }
  }, [baseInput, baseInputType, toolId]);

  // SLUGIFY COMPUTATION
  const slugifiedText = useMemo(() => {
    if (toolId !== 'slugify' || !inputText.trim()) return '';
    let s = inputText
      // Normalize accented chars (diacritics)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace non-alphanumeric with separator
      .replace(/[^a-zA-Z0-9]+/g, slugSeparator)
      // Remove leading / trailing separator
      .replace(new RegExp(`^\\${slugSeparator}+|\\${slugSeparator}+$`, 'g'), '');

    if (slugLowercase) s = s.toLowerCase();
    return s;
  }, [inputText, slugSeparator, slugLowercase, toolId]);

  // CASE CONVERTER COMPUTATION
  const caseData = useMemo(() => {
    if (toolId !== 'case-converter' || !inputText.trim()) return null;

    // Split words by transitions, underscores, hyphens, spaces
    const words = inputText
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-.]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return null;

    const lowerWords = words.map((w) => w.toLowerCase());

    const camelCase =
      lowerWords[0] +
      lowerWords
        .slice(1)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

    const pascalCase = lowerWords
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    const snakeCase = lowerWords.join('_');
    const kebabCase = lowerWords.join('-');
    const constantCase = lowerWords.join('_').toUpperCase();
    const titleCase = lowerWords
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const sentenceCase =
      lowerWords[0].charAt(0).toUpperCase() +
      lowerWords[0].slice(1) +
      (lowerWords.length > 1 ? ' ' + lowerWords.slice(1).join(' ') : '');
    const dotCase = lowerWords.join('.');
    const pathCase = lowerWords.join('/');

    return {
      camelCase,
      pascalCase,
      snakeCase,
      kebabCase,
      constantCase,
      titleCase,
      sentenceCase,
      dotCase,
      pathCase,
      wordsCount: words.length,
      charsCount: inputText.length
    };
  }, [inputText, toolId]);

  // QUERY STRING INITIALIZER
  useEffect(() => {
    if (toolId === 'query-string-parser') {
      try {
        let q = rawQueryInput.trim();
        if (q.includes('?')) {
          q = q.split('?')[1];
        }
        const searchParams = new URLSearchParams(q);
        const pairs: { key: string; value: string }[] = [];
        searchParams.forEach((value, key) => {
          pairs.push({ key, value });
        });
        setQueryParams(pairs);
      } catch {
        // keep old
      }
    }
  }, [rawQueryInput, toolId]);

  // Re-generate URL when queryParams change
  const regeneratedQuery = useMemo(() => {
    if (toolId !== 'query-string-parser') return '';
    const sp = new URLSearchParams();
    queryParams.forEach((p) => {
      if (p.key.trim()) sp.append(p.key.trim(), p.value);
    });
    return sp.toString();
  }, [queryParams, toolId]);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={loadSample}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load Sample</span>
          </button>

          <button
            onClick={() => {
              setInputText('');
              setRegexPattern('');
              setRegexError(null);
              setBaseInput('');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Timestamp 'Now' Button */}
        {toolId === 'timestamp-converter' && (
          <button
            onClick={() => setEpochSeconds(Math.floor(Date.now() / 1000).toString())}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Set Current Time (Now)</span>
          </button>
        )}
      </div>

      {/* TOOL 1: REGEX TESTER */}
      {toolId === 'regex-tester' && (
        <div className="space-y-4">
          {/* Pattern & Flags */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Regular Expression Pattern
              </label>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-400 text-sm font-bold">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="e.g. ([a-z]+)@([a-z]+)\.([a-z]{2,})"
                  className="flex-1 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <span className="font-mono text-slate-400 text-sm font-bold">/</span>
              </div>
            </div>

            {/* Flags Checkboxes */}
            <div className="flex items-center space-x-3 text-xs flex-wrap">
              <span className="font-semibold text-slate-500">Flags:</span>
              {(['g', 'i', 'm', 's', 'u'] as const).map((flag) => (
                <label key={flag} className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regexFlags[flag]}
                    onChange={(e) => setRegexFlags({ ...regexFlags, [flag]: e.target.checked })}
                    className="accent-red-600 rounded"
                  />
                  <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{flag}</span>
                </label>
              ))}
            </div>

            {regexError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-mono">
                {regexError}
              </div>
            )}
          </div>

          {/* Test Text */}
          <div className="flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Test String</span>
              {regexResults && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {regexResults.matches.length} matches found
                </span>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text here to evaluate regular expression matches..."
              rows={6}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
            />
          </div>

          {/* Matches Inspector Table */}
          {regexResults && regexResults.matches.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Capture Groups &amp; Match Table
              </h3>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-100 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 font-mono text-xs">
                {regexResults.matches.map((m, idx) => (
                  <div key={idx} className="p-2.5 flex items-start justify-between gap-3 bg-white dark:bg-zinc-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{m.match}</span>
                      <span className="text-[10px] text-slate-400">pos: {m.index}</span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-zinc-400">
                        {m.groups.map((g, gIdx) => (
                          <span key={gIdx} className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                            ${gIdx + 1}: {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replace / Substitution Panel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Substitution &amp; Replacement
            </h3>
            <input
              type="text"
              value={regexReplacePattern}
              onChange={(e) => setRegexReplacePattern(e.target.value)}
              placeholder="Replacement pattern (e.g. $1 or [REDACTED])"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
            />
            {regexResults && (
              <textarea
                readOnly
                value={regexResults.replaced}
                rows={4}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-800 dark:text-zinc-200 resize-y"
              />
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: TEXT DIFF */}
      {toolId === 'text-diff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs">
              {(['lines', 'words', 'chars'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDiffMode(m)}
                  className={`px-3 py-1 rounded-md font-bold capitalize cursor-pointer ${
                    diffMode === m ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {m} Diff
                </button>
              ))}
            </div>

            {diffResult && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                  +{diffResult.added} added
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold">
                  -{diffResult.removed} removed
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Original Text
              </span>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white resize-y"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Modified Text
              </span>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white resize-y"
              />
            </div>
          </div>

          {/* Unified Visual Output */}
          {diffResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2 uppercase tracking-wider">
                Diff Result View
              </span>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {diffResult.parts.map((part, index) => {
                  let color = 'text-slate-700 dark:text-zinc-300';
                  let bg = 'bg-transparent';
                  if (part.added) {
                    color = 'text-emerald-800 dark:text-emerald-300 font-bold';
                    bg = 'bg-emerald-100/80 dark:bg-emerald-950/60 px-0.5 rounded';
                  } else if (part.removed) {
                    color = 'text-rose-800 dark:text-rose-300 line-through';
                    bg = 'bg-rose-100/80 dark:bg-rose-950/60 px-0.5 rounded';
                  }
                  return (
                    <span key={index} className={`${color} ${bg}`}>
                      {part.value}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: TIMESTAMP CONVERTER */}
      {toolId === 'timestamp-converter' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Unix Epoch (Seconds or Milliseconds)
              </label>
              <input
                type="text"
                value={epochSeconds}
                onChange={(e) => setEpochSeconds(e.target.value)}
                placeholder="e.g. 1773489200"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Timezone Formatting
              </label>
              <select
                value={targetTimezone}
                onChange={(e) => setTargetTimezone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Local">Local Device Time</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>
          </div>

          {timestampData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'ISO 8601', value: timestampData.iso },
                { label: 'UTC String', value: timestampData.utc },
                { label: 'Formatted Local Time', value: timestampData.localized },
                { label: 'Relative Offset', value: timestampData.relative },
                { label: 'Unix Timestamp (Seconds)', value: timestampData.sec.toString() },
                { label: 'Unix Timestamp (Milliseconds)', value: (timestampData.sec * 1000).toString() }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.label)}
                    className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {copiedKey === item.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: CRON PARSER */}
      {toolId === 'cron-parser' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Cron Expression (5-part format)
            </label>
            <input
              type="text"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              placeholder="* * * * *"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />

            {/* Quick Presets */}
            <div className="flex items-center space-x-2 text-xs flex-wrap">
              <span className="text-slate-400">Presets:</span>
              {[
                { label: 'Every 15 min', expr: '*/15 * * * *' },
                { label: 'Every hour', expr: '0 * * * *' },
                { label: 'Daily midnight', expr: '0 0 * * *' },
                { label: 'Weekdays 9 AM', expr: '0 9 * * 1-5' },
                { label: 'Weekly Sunday', expr: '0 0 * * 0' }
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setCronExpr(p.expr)}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description Output */}
          {cronInfo && (
            <div className={`p-4 rounded-xl border ${cronInfo.valid ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'}`}>
              <div className="flex items-center space-x-2">
                {cronInfo.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block uppercase">Schedule Meaning</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{cronInfo.description}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cron Fields Breakdown */}
          {cronInfo?.parts && cronInfo.parts.length === 5 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
              {[
                { name: 'Minute', val: cronInfo.parts[0] },
                { name: 'Hour', val: cronInfo.parts[1] },
                { name: 'Day of Month', val: cronInfo.parts[2] },
                { name: 'Month', val: cronInfo.parts[3] },
                { name: 'Day of Week', val: cronInfo.parts[4] }
              ].map((f) => (
                <div key={f.name} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{f.name}</span>
                  <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">{f.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 5: NUMBER BASE CONVERTER */}
      {toolId === 'number-base-converter' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Input Value
              </label>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs">
                {(['10', '16', '2', '8'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBaseInputType(b)}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                      baseInputType === b ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {b === '10' ? 'Dec (10)' : b === '16' ? 'Hex (16)' : b === '2' ? 'Bin (2)' : 'Oct (8)'}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              placeholder="Enter number..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          {baseData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Decimal (Base 10)', value: baseData.dec },
                { label: 'Hexadecimal (Base 16)', value: baseData.hex },
                { label: 'Binary (Base 2)', value: baseData.bin },
                { label: 'Octal (Base 8)', value: baseData.oct }
              ].map((b) => (
                <div
                  key={b.label}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
                >
                  <div className="overflow-hidden mr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{b.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all">{b.value}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(b.value, b.label)}
                    className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
                  >
                    {copiedKey === b.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 6: SLUGIFY */}
      {toolId === 'slugify' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Input Text
              </label>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-semibold">Separator:</span>
                <button
                  onClick={() => setSlugSeparator('-')}
                  className={`px-2 py-0.5 rounded font-bold ${slugSeparator === '-' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'}`}
                >
                  Hyphen (-)
                </button>
                <button
                  onClick={() => setSlugSeparator('_')}
                  className={`px-2 py-0.5 rounded font-bold ${slugSeparator === '_' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'}`}
                >
                  Underscore (_)
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste article title or headline..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {slugifiedText && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Generated URL Slug</span>
                <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400 break-all">{slugifiedText}</span>
              </div>
              <button
                onClick={() => handleCopy(slugifiedText, 'slug')}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey === 'slug' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'slug' ? 'Copied' : 'Copy Slug'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOOL 7: CASE CONVERTER */}
      {toolId === 'case-converter' && (
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text to convert across all programming and text cases..."
            rows={4}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
          />

          {caseData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'camelCase', value: caseData.camelCase },
                { label: 'PascalCase', value: caseData.pascalCase },
                { label: 'snake_case', value: caseData.snakeCase },
                { label: 'kebab-case', value: caseData.kebabCase },
                { label: 'CONSTANT_CASE', value: caseData.constantCase },
                { label: 'Title Case', value: caseData.titleCase },
                { label: 'Sentence case', value: caseData.sentenceCase },
                { label: 'dot.case', value: caseData.dotCase },
                { label: 'path/case', value: caseData.pathCase }
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
                >
                  <div className="overflow-hidden mr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{c.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">{c.value}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(c.value, c.label)}
                    className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
                  >
                    {copiedKey === c.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 8: QUERY STRING PARSER */}
      {toolId === 'query-string-parser' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Input URL or Query String
            </label>
            <input
              type="text"
              value={rawQueryInput}
              onChange={(e) => setRawQueryInput(e.target.value)}
              placeholder="Paste URL (https://example.com?param=val) or query (?a=1&b=2)..."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          {/* Editable Parameters Grid */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Parsed Parameters ({queryParams.length})
              </span>
              <button
                onClick={() => setQueryParams([...queryParams, { key: '', value: '' }])}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 inline-flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Param</span>
              </button>
            </div>

            <div className="space-y-2">
              {queryParams.map((param, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => {
                      const copy = [...queryParams];
                      copy[index].key = e.target.value;
                      setQueryParams(copy);
                    }}
                    placeholder="Key"
                    className="w-1/3 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => {
                      const copy = [...queryParams];
                      copy[index].value = e.target.value;
                      setQueryParams(copy);
                    }}
                    placeholder="Value"
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
                  />
                  <button
                    onClick={() => setQueryParams(queryParams.filter((_, i) => i !== index))}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {regeneratedQuery && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="overflow-hidden mr-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Regenerated Query String</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">?{regeneratedQuery}</span>
                </div>
                <button
                  onClick={() => handleCopy(`?${regeneratedQuery}`, 'regen-query')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'regen-query' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
