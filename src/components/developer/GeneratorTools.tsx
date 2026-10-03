/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  Shield,
  Key,
  Hash,
  AlignLeft,
  Lock,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface GeneratorToolsProps {
  toolId: string;
}

// Classical Lorem Ipsum lexicon
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'in',
  'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum'
];

function getRandomCryptoInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export default function GeneratorTools({ toolId }: GeneratorToolsProps) {
  // UUID Generator States
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidWrap, setUuidWrap] = useState<'none' | 'quotes' | 'braces'>('none');

  // Password Generator States
  const [pwLength, setPwLength] = useState<number>(18);
  const [pwQuantity, setPwQuantity] = useState<number>(5);
  const [pwUpper, setPwUpper] = useState<boolean>(true);
  const [pwLower, setPwLower] = useState<boolean>(true);
  const [pwNumbers, setPwNumbers] = useState<boolean>(true);
  const [pwSymbols, setPwSymbols] = useState<boolean>(true);
  const [pwExcludeAmbiguous, setPwExcludeAmbiguous] = useState<boolean>(false);

  // Random String States
  const [strLength, setStrLength] = useState<number>(32);
  const [strQuantity, setStrQuantity] = useState<number>(5);
  const [strCharsetPreset, setStrCharsetPreset] = useState<'alphanumeric' | 'hex' | 'numeric' | 'base64' | 'custom'>('alphanumeric');
  const [strCustomCharset, setStrCustomCharset] = useState<string>('abcdefghijklmnopqrstuvwxyz0123456789');

  // Lorem Ipsum States
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [loremCount, setLoremCount] = useState<number>(3);
  const [loremStartClassic, setLoremStartClassic] = useState<boolean>(true);

  // Generated Outputs
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Shannon Entropy for Passwords
  const passwordPoolSize = useMemo(() => {
    let pool = 0;
    if (pwUpper) pool += pwExcludeAmbiguous ? 24 : 26; // minus I, O
    if (pwLower) pool += pwExcludeAmbiguous ? 24 : 26; // minus l
    if (pwNumbers) pool += pwExcludeAmbiguous ? 8 : 10; // minus 0, 1
    if (pwSymbols) pool += 28;
    return Math.max(pool, 1);
  }, [pwUpper, pwLower, pwNumbers, pwSymbols, pwExcludeAmbiguous]);

  const passwordEntropyBits = useMemo(() => {
    if (passwordPoolSize <= 1 || pwLength <= 0) return 0;
    return Math.round(pwLength * Math.log2(passwordPoolSize) * 10) / 10;
  }, [pwLength, passwordPoolSize]);

  const passwordStrengthRating = useMemo(() => {
    if (passwordEntropyBits < 36) return { label: 'Very Weak', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' };
    if (passwordEntropyBits < 50) return { label: 'Weak', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' };
    if (passwordEntropyBits < 65) return { label: 'Moderate', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' };
    if (passwordEntropyBits < 80) return { label: 'Strong', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' };
    return { label: 'Very Strong (Military Grade)', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900' };
  }, [passwordEntropyBits]);

  // Generation Handler
  const generate = () => {
    if (toolId === 'uuid-generator') {
      const list: string[] = [];
      for (let i = 0; i < uuidCount; i++) {
        let u = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = getRandomCryptoInt(16);
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        if (!uuidHyphens) u = u.replace(/-/g, '');
        if (uuidUppercase) u = u.toUpperCase();
        if (uuidWrap === 'quotes') u = `"${u}"`;
        if (uuidWrap === 'braces') u = `{${u}}`;
        list.push(u);
      }
      setGeneratedList(list);
    } else if (toolId === 'password-generator') {
      let chars = '';
      if (pwUpper) chars += pwExcludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (pwLower) chars += pwExcludeAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      if (pwNumbers) chars += pwExcludeAmbiguous ? '23456789' : '0123456789';
      if (pwSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

      const list: string[] = [];
      for (let q = 0; q < pwQuantity; q++) {
        let pw = '';
        for (let i = 0; i < pwLength; i++) {
          pw += chars[getRandomCryptoInt(chars.length)];
        }
        list.push(pw);
      }
      setGeneratedList(list);
    } else if (toolId === 'random-string') {
      let pool = '';
      if (strCharsetPreset === 'alphanumeric') pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      else if (strCharsetPreset === 'hex') pool = '0123456789abcdef';
      else if (strCharsetPreset === 'numeric') pool = '0123456789';
      else if (strCharsetPreset === 'base64') pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      else pool = strCustomCharset || 'abc';

      const list: string[] = [];
      for (let q = 0; q < strQuantity; q++) {
        let res = '';
        for (let i = 0; i < strLength; i++) {
          res += pool[getRandomCryptoInt(pool.length)];
        }
        list.push(res);
      }
      setGeneratedList(list);
    } else if (toolId === 'lorem-ipsum') {
      if (loremType === 'words') {
        const words: string[] = [];
        for (let i = 0; i < loremCount; i++) {
          words.push(LOREM_WORDS[getRandomCryptoInt(LOREM_WORDS.length)]);
        }
        if (loremStartClassic && words.length >= 2) {
          words[0] = 'lorem';
          words[1] = 'ipsum';
        }
        setGeneratedList([words.join(' ')]);
      } else if (loremType === 'sentences') {
        const sentences: string[] = [];
        for (let s = 0; s < loremCount; s++) {
          const len = 8 + getRandomCryptoInt(10);
          const words: string[] = [];
          for (let w = 0; w < len; w++) {
            words.push(LOREM_WORDS[getRandomCryptoInt(LOREM_WORDS.length)]);
          }
          if (s === 0 && loremStartClassic) {
            words[0] = 'lorem';
            words[1] = 'ipsum';
            words[2] = 'dolor';
            words[3] = 'sit';
            words[4] = 'amet';
          }
          const cap = words[0].charAt(0).toUpperCase() + words[0].slice(1);
          words[0] = cap;
          sentences.push(words.join(' ') + '.');
        }
        setGeneratedList(sentences);
      } else {
        // Paragraphs
        const paragraphs: string[] = [];
        for (let p = 0; p < loremCount; p++) {
          const sentenceCount = 4 + getRandomCryptoInt(4);
          const pSentences: string[] = [];
          for (let s = 0; s < sentenceCount; s++) {
            const len = 7 + getRandomCryptoInt(9);
            const words: string[] = [];
            for (let w = 0; w < len; w++) {
              words.push(LOREM_WORDS[getRandomCryptoInt(LOREM_WORDS.length)]);
            }
            if (p === 0 && s === 0 && loremStartClassic) {
              words[0] = 'lorem';
              words[1] = 'ipsum';
              words[2] = 'dolor';
              words[3] = 'sit';
              words[4] = 'amet';
            }
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            pSentences.push(words.join(' ') + '.');
          }
          paragraphs.push(pSentences.join(' '));
        }
        setGeneratedList(paragraphs);
      }
    }
  };

  // Run on mount or configuration change
  useEffect(() => {
    generate();
  }, [
    toolId,
    uuidCount,
    uuidHyphens,
    uuidUppercase,
    uuidWrap,
    pwLength,
    pwQuantity,
    pwUpper,
    pwLower,
    pwNumbers,
    pwSymbols,
    pwExcludeAmbiguous,
    strLength,
    strQuantity,
    strCharsetPreset,
    strCustomCharset,
    loremType,
    loremCount,
    loremStartClassic
  ]);

  // Copy helper
  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    const separator = toolId === 'lorem-ipsum' && loremType === 'paragraphs' ? '\n\n' : '\n';
    navigator.clipboard.writeText(generatedList.join(separator));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    const separator = toolId === 'lorem-ipsum' && loremType === 'paragraphs' ? '\n\n' : '\n';
    const blob = new Blob([generatedList.join(separator)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Configuration Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        {/* UUID Controls */}
        {toolId === 'uuid-generator' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Quantity: <span className="text-red-600">{uuidCount}</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={uuidCount}
                onChange={(e) => setUuidCount(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Hyphens
              </label>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <button
                  onClick={() => setUuidHyphens(true)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    uuidHyphens ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  With (-)
                </button>
                <button
                  onClick={() => setUuidHyphens(false)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    !uuidHyphens ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Letter Case
              </label>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <button
                  onClick={() => setUuidUppercase(false)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    !uuidUppercase ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  lowercase
                </button>
                <button
                  onClick={() => setUuidUppercase(true)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    uuidUppercase ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  UPPERCASE
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Brackets / Quotes
              </label>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                <button
                  onClick={() => setUuidWrap('none')}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    uuidWrap === 'none' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => setUuidWrap('quotes')}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    uuidWrap === 'quotes' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  &quot;&quot;
                </button>
                <button
                  onClick={() => setUuidWrap('braces')}
                  className={`flex-1 py-1 rounded-md text-xs font-bold ${
                    uuidWrap === 'braces' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  &#123;&#125;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Controls */}
        {toolId === 'password-generator' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  <span>Password Length: <strong className="text-red-600">{pwLength}</strong> chars</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${passwordStrengthRating.color}`}>
                    {passwordEntropyBits} bits &bull; {passwordStrengthRating.label}
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={64}
                  value={pwLength}
                  onChange={(e) => setPwLength(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Quantity: <strong className="text-red-600">{pwQuantity}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={pwQuantity}
                  onChange={(e) => setPwQuantity(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            {/* Character Set Toggles */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <label className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwUpper}
                  onChange={(e) => setPwUpper(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Uppercase (A-Z)</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwLower}
                  onChange={(e) => setPwLower(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Lowercase (a-z)</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwNumbers}
                  onChange={(e) => setPwNumbers(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Numbers (0-9)</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwSymbols}
                  onChange={(e) => setPwSymbols(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Symbols (!@#$...)</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwExcludeAmbiguous}
                  onChange={(e) => setPwExcludeAmbiguous(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Exclude Ambiguous (l, 1, I, O, 0)</span>
              </label>
            </div>
          </div>
        )}

        {/* Random String Controls */}
        {toolId === 'random-string' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  String Length: <span className="text-red-600">{strLength}</span>
                </label>
                <input
                  type="range"
                  min={4}
                  max={256}
                  value={strLength}
                  onChange={(e) => setStrLength(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Quantity: <span className="text-red-600">{strQuantity}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={strQuantity}
                  onChange={(e) => setStrQuantity(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs flex-wrap">
              <span className="text-slate-500 font-semibold">Charset:</span>
              {(['alphanumeric', 'hex', 'numeric', 'base64', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStrCharsetPreset(preset)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold cursor-pointer ${
                    strCharsetPreset === preset
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {strCharsetPreset === 'custom' && (
              <input
                type="text"
                value={strCustomCharset}
                onChange={(e) => setStrCustomCharset(e.target.value)}
                placeholder="Enter custom characters pool..."
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs"
              />
            )}
          </div>
        )}

        {/* Lorem Ipsum Controls */}
        {toolId === 'lorem-ipsum' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Generate By
                </label>
                <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                  {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setLoremType(t)}
                      className={`flex-1 py-1 rounded-md text-xs font-bold capitalize cursor-pointer ${
                        loremType === t ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Count: <span className="text-red-600">{loremCount}</span> {loremType}
                </label>
                <input
                  type="range"
                  min={1}
                  max={loremType === 'words' ? 100 : 20}
                  value={loremCount}
                  onChange={(e) => setLoremCount(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            <label className="inline-flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={loremStartClassic}
                onChange={(e) => setLoremStartClassic(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                Start with &ldquo;Lorem ipsum dolor sit amet...&rdquo;
              </span>
            </label>
          </div>
        )}

        {/* Global Regenerate / Copy Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={generate}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Outputs Display */}
      <div className="space-y-2">
        {generatedList.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="font-mono text-xs text-slate-900 dark:text-white break-all flex-1 select-all">
              {item}
            </div>

            <button
              onClick={() => handleCopySingle(item, idx)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              {copiedIndex === idx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
