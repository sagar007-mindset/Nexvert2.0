/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Upload,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import SparkMD5 from 'spark-md5';

interface HashingToolsProps {
  toolId: string;
}

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function HashingTools({ toolId }: HashingToolsProps) {
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  // Hash outputs
  const [hashes, setHashes] = useState<{
    sha256?: string;
    sha1?: string;
    sha512?: string;
    md5?: string;
  }>({});

  // Checksum comparison
  const [expectedHash, setExpectedHash] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample Text
  const loadSample = () => {
    setInputMode('text');
    setSelectedFile(null);
    setInputText('The quick brown fox jumps over the lazy dog');
  };

  // Compute Hashes
  const computeHashes = async (data: ArrayBuffer) => {
    setLoading(true);
    const start = performance.now();

    try {
      const results: { sha256?: string; sha1?: string; sha512?: string; md5?: string } = {};

      if (toolId === 'file-checksum' || toolId === 'sha256-generator') {
        const buf = await crypto.subtle.digest('SHA-256', data);
        results.sha256 = bufferToHex(buf);
      }
      if (toolId === 'file-checksum' || toolId === 'sha1-generator') {
        const buf = await crypto.subtle.digest('SHA-1', data);
        results.sha1 = bufferToHex(buf);
      }
      if (toolId === 'file-checksum' || toolId === 'sha512-generator') {
        const buf = await crypto.subtle.digest('SHA-512', data);
        results.sha512 = bufferToHex(buf);
      }
      if (toolId === 'file-checksum' || toolId === 'md5-generator') {
        results.md5 = SparkMD5.ArrayBuffer.hash(data);
      }

      const end = performance.now();
      setDurationMs(Math.round(end - start));
      setHashes(results);
    } catch (e: any) {
      console.error('Hashing error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger on text change
  useEffect(() => {
    if (inputMode === 'text') {
      if (!inputText) {
        setHashes({});
        setDurationMs(null);
        return;
      }
      const encoder = new TextEncoder();
      const buffer = encoder.encode(inputText).buffer;
      computeHashes(buffer);
    }
  }, [inputText, inputMode, toolId]);

  // Handle File change
  const handleFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        computeHashes(reader.result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Copy helper
  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Checksum match check
  const verificationMatch = (() => {
    if (!expectedHash.trim() || Object.keys(hashes).length === 0) return null;
    const cleanExpected = expectedHash.trim().toLowerCase();
    for (const [algo, hashVal] of Object.entries(hashes)) {
      if (typeof hashVal === 'string' && hashVal.toLowerCase() === cleanExpected) {
        return { matched: true, algo: algo.toUpperCase() };
      }
    }
    return { matched: false };
  })();

  const currentAlgorithm =
    toolId === 'sha256-generator'
      ? 'SHA-256'
      : toolId === 'sha1-generator'
      ? 'SHA-1'
      : toolId === 'sha512-generator'
      ? 'SHA-512'
      : toolId === 'md5-generator'
      ? 'MD5'
      : 'All Hashes';

  const singleHashVal =
    toolId === 'sha256-generator'
      ? hashes.sha256
      : toolId === 'sha1-generator'
      ? hashes.sha1
      : toolId === 'sha512-generator'
      ? hashes.sha512
      : hashes.md5;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
            <button
              onClick={() => {
                setInputMode('text');
                setSelectedFile(null);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Text Input
            </button>
            <button
              onClick={() => {
                setInputMode('file');
                setInputText('');
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'file'
                  ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              File Input
            </button>
          </div>

          {inputMode === 'text' && (
            <button
              onClick={loadSample}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Load Sample
            </button>
          )}

          <button
            onClick={() => {
              setInputText('');
              setSelectedFile(null);
              setHashes({});
              setExpectedHash('');
              setDurationMs(null);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {durationMs !== null && (
          <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Computed in {durationMs}ms</span>
          </div>
        )}
      </div>

      {/* Input Section */}
      {inputMode === 'text' ? (
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Input Plaintext</span>
            {inputText && (
              <span className="text-[10px] text-slate-400 font-mono">
                {new TextEncoder().encode(inputText).length} bytes
              </span>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text to compute cryptographic digest..."
            rows={5}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
          />
        </div>
      ) : (
        <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <FileCheck className="w-10 h-10 text-slate-400 dark:text-zinc-500 mb-2" />
            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</div>
                <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  {selectedFile.size.toLocaleString()} bytes &bull; {selectedFile.type || 'Unknown MIME'}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs cursor-pointer mb-1.5"
                >
                  Select File to Checksum
                </button>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Any file format &bull; Processed 100% locally via Web Crypto API
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checksum Verifier Match Tool Box */}
      {toolId === 'file-checksum' && (
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Verify Against Expected Checksum (Optional)
          </label>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste expected SHA-256, SHA-1, SHA-512, or MD5 checksum here..."
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />

          {verificationMatch && (
            <div>
              {verificationMatch.matched ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Match! Input matches computed {verificationMatch.algo} digest.</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>No match! The expected checksum does not match any computed algorithm.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {toolId === 'file-checksum' ? (
        /* Multi-Hash Display */
        <div className="space-y-3">
          {[
            { key: 'sha256', title: 'SHA-256 (Secure Hash Algorithm 256-bit)', val: hashes.sha256 },
            { key: 'sha1', title: 'SHA-1 (160-bit Checksum)', val: hashes.sha1 },
            { key: 'sha512', title: 'SHA-512 (512-bit High Security)', val: hashes.sha512 },
            { key: 'md5', title: 'MD5 (128-bit Legacy Checksum)', val: hashes.md5 },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                  {item.title}
                </span>
                {item.val && (
                  <button
                    onClick={() => handleCopy(item.val!, item.key)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedKey === item.key ? (
                      <span className="text-emerald-500 font-bold">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white break-all select-all">
                {item.val || 'Awaiting input...'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single Hash Detailed Display */
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                {currentAlgorithm} Hex (Lowercase)
              </span>
              {singleHashVal && (
                <button
                  onClick={() => handleCopy(singleHashVal, 'hex-lower')}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'hex-lower' ? (
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white break-all select-all">
              {singleHashVal || 'Awaiting input...'}
            </div>
          </div>

          {singleHashVal && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  {currentAlgorithm} Hex (Uppercase)
                </span>
                <button
                  onClick={() => handleCopy(singleHashVal.toUpperCase(), 'hex-upper')}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'hex-upper' ? (
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white break-all select-all">
                {singleHashVal.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
