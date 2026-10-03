/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Binary,
  Image as ImageIcon,
  Link,
  Code2,
  Key,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  FileCode
} from 'lucide-react';

interface EncodingToolsProps {
  toolId: string;
}

// Robust UTF-8 Base64 Helpers
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(base64: string): string {
  // Clean whitespace / line breaks
  const cleaned = base64.replace(/\s+/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Base64URL decoder for JWT
function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return base64ToUtf8(output);
}

export default function EncodingTools({ toolId }: EncodingToolsProps) {
  // Shared States
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyType, setCopyType] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlOption, setUrlOption] = useState<'component' | 'full'>('component');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File states for Base64 tools
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // JWT States
  const [jwtHeader, setJwtHeader] = useState<any>(null);
  const [jwtPayload, setJwtPayload] = useState<any>(null);
  const [jwtSignature, setJwtSignature] = useState<string>('');

  // Sample Loaders
  const loadSample = () => {
    setErrorMsg(null);
    if (toolId === 'base64-encode') {
      if (mode === 'encode') {
        setInputText('Hello World! 🚀 Nexvert client-side developer tools.');
      } else {
        setInputText('SGVsbG8gV29ybGQhIPCfmoAgTmV4dmVydCBjbGllbnQtc2lkZSBkZXZlbG9wZXIgdG9vbHMu');
      }
    } else if (toolId === 'base64-to-image') {
      // 1x1 red png dot
      setInputText('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    } else if (toolId === 'url-encode') {
      if (mode === 'encode') {
        setInputText('https://example.com/search?q=developer tools & privacy=100%');
      } else {
        setInputText('https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Ddeveloper%20tools%20%26%20privacy%3D100%25');
      }
    } else if (toolId === 'html-entity-encode') {
      if (mode === 'encode') {
        setInputText('<div class="header">Hello & Welcome "Developers" \'2026\'!</div>');
      } else {
        setInputText('&lt;div class=&quot;header&quot;&gt;Hello &amp; Welcome &quot;Developers&quot; &#39;2026&#39;!&lt;/div&gt;');
      }
    } else if (toolId === 'jwt-decoder') {
      // Sample test JWT with valid header and payload
      setInputText(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImFkbWluIjp0cnVlfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
    }
  };

  // Convert on input / mode change
  useEffect(() => {
    setErrorMsg(null);
    if (!inputText.trim() && !selectedFile) {
      setOutputText('');
      setJwtHeader(null);
      setJwtPayload(null);
      setJwtSignature('');
      return;
    }

    try {
      if (toolId === 'base64-encode') {
        if (mode === 'encode') {
          setOutputText(utf8ToBase64(inputText));
        } else {
          setOutputText(base64ToUtf8(inputText));
        }
      } else if (toolId === 'url-encode') {
        if (mode === 'encode') {
          setOutputText(urlOption === 'component' ? encodeURIComponent(inputText) : encodeURI(inputText));
        } else {
          setOutputText(urlOption === 'component' ? decodeURIComponent(inputText) : decodeURI(inputText));
        }
      } else if (toolId === 'html-entity-encode') {
        if (mode === 'encode') {
          const escaped = inputText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          setOutputText(escaped);
        } else {
          const doc = new DOMParser().parseFromString(inputText, 'text/html');
          setOutputText(doc.documentElement.textContent || '');
        }
      } else if (toolId === 'base64-to-image') {
        let src = inputText.trim();
        if (!src.startsWith('data:image/')) {
          src = `data:image/png;base64,${src}`;
        }
        setImagePreviewUrl(src);
      } else if (toolId === 'jwt-decoder') {
        const parts = inputText.trim().split('.');
        if (parts.length !== 3) {
          throw new Error('A valid JSON Web Token must have exactly 3 parts separated by dots.');
        }
        const headerJson = JSON.parse(base64UrlDecode(parts[0]));
        const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
        setJwtHeader(headerJson);
        setJwtPayload(payloadJson);
        setJwtSignature(parts[2]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid input for conversion.');
      setOutputText('');
    }
  }, [inputText, mode, toolId, urlOption, selectedFile]);

  // Handle File Upload for Base64 Encode & Image to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (toolId === 'image-to-base64') {
        setImagePreviewUrl(result);
        setOutputText(result);
      } else if (toolId === 'base64-encode') {
        const base64Data = result.split(',')[1] || result;
        setOutputText(base64Data);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read selected file.');
    };
    reader.readAsDataURL(file);
  };

  // Copy helper
  const handleCopy = (text: string, typeName = '') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopyType(typeName);
    setTimeout(() => {
      setCopied(false);
      setCopyType('');
    }, 2000);
  };

  // Download decoded file / image
  const handleDownloadDecoded = () => {
    if (toolId === 'base64-to-image' && imagePreviewUrl) {
      const a = document.createElement('a');
      a.href = imagePreviewUrl;
      a.download = 'decoded-image.png';
      a.click();
    } else if (toolId === 'base64-encode' && mode === 'decode' && outputText) {
      const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-file.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Mode Switch for two-way tools */}
          {(toolId === 'base64-encode' || toolId === 'url-encode' || toolId === 'html-entity-encode') && (
            <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
              <button
                onClick={() => setMode('encode')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  mode === 'encode' ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                {toolId === 'html-entity-encode' ? 'Escape' : 'Encode'}
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  mode === 'decode' ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                {toolId === 'html-entity-encode' ? 'Unescape' : 'Decode'}
              </button>
            </div>
          )}

          {/* URL Encode Options */}
          {toolId === 'url-encode' && (
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-zinc-800 text-xs">
              <span className="text-slate-500">Method:</span>
              <button
                onClick={() => setUrlOption('component')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  urlOption === 'component' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                Component
              </button>
              <button
                onClick={() => setUrlOption('full')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  urlOption === 'full' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                Full URL
              </button>
            </div>
          )}

          <button
            onClick={loadSample}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Load Sample
          </button>

          <button
            onClick={() => {
              setInputText('');
              setOutputText('');
              setSelectedFile(null);
              setImagePreviewUrl(null);
              setImageDimensions(null);
              setErrorMsg(null);
              setJwtHeader(null);
              setJwtPayload(null);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Action Copy/Download */}
        <div className="flex items-center space-x-2">
          {outputText && (
            <button
              onClick={() => handleCopy(outputText)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              {copied && !copyType ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied && !copyType ? 'Copied!' : 'Copy Result'}</span>
            </button>
          )}

          {(toolId === 'base64-to-image' || (toolId === 'base64-encode' && mode === 'decode')) && (imagePreviewUrl || outputText) && (
            <button
              onClick={handleDownloadDecoded}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Decoded</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TOOL 1: JWT Decoder View */}
      {toolId === 'jwt-decoder' ? (
        <div className="space-y-4">
          {/* Security Banner */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Security Note:</strong> Signature verification is not performed. Verifying a JWT signature requires a private or shared secret, which should never be entered into any browser. This tool inspects the Base64URL-encoded Header and Payload entirely in client-side memory.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Input Token */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Encoded Token</span>
                {inputText && <span className="text-[10px] text-slate-400">{inputText.length} chars</span>}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste encoded JWT here (e.g. eyJhbGciOi...)"
                rows={14}
                className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
              />
            </div>

            {/* Decoded Output */}
            <div className="lg:col-span-7 space-y-3">
              {/* Header Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Header &bull; Algorithm &amp; Token Type
                  </span>
                  {jwtHeader && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(jwtHeader, null, 2), 'header')}
                      className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {copied && copyType === 'header' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-mono text-xs overflow-x-auto">
                  {jwtHeader ? JSON.stringify(jwtHeader, null, 2) : 'Awaiting valid token...'}
                </pre>
              </div>

              {/* Payload Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Payload &bull; Claims &amp; Data
                  </span>
                  {jwtPayload && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(jwtPayload, null, 2), 'payload')}
                      className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {copied && copyType === 'payload' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-mono text-xs overflow-x-auto">
                  {jwtPayload ? JSON.stringify(jwtPayload, null, 2) : 'Awaiting valid token...'}
                </pre>

                {/* Standard Claim Timestamps */}
                {jwtPayload && (jwtPayload.exp || jwtPayload.iat || jwtPayload.nbf) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
                    {jwtPayload.iat && (
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">Issued At (iat):</span>
                        <span className="font-mono">{new Date(jwtPayload.iat * 1000).toUTCString()}</span>
                      </div>
                    )}
                    {jwtPayload.exp && (
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">Expires At (exp):</span>
                        <span className="font-mono">{new Date(jwtPayload.exp * 1000).toUTCString()}</span>
                        {jwtPayload.exp * 1000 < Date.now() ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                            Expired
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Signature Info */}
              {jwtSignature && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                    Signature
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 font-mono text-[11px] text-slate-600 dark:text-zinc-400 break-all">
                    {jwtSignature}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : toolId === 'image-to-base64' ? (
        /* TOOL 2: Image to Base64 */
        <div className="space-y-4">
          <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <ImageIcon className="w-10 h-10 text-slate-400 dark:text-zinc-500 mb-3" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs cursor-pointer mb-2"
              >
                Choose Image File
              </button>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Supports PNG, JPG, WebP, SVG, GIF, BMP (Converts to Data URI locally)
              </p>
            </div>
          </div>

          {imagePreviewUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preview Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3 self-start">
                  Image Preview
                </span>
                <img
                  src={imagePreviewUrl}
                  alt="Converted base64 preview"
                  className="max-h-60 max-w-full object-contain rounded-lg border border-slate-100 dark:border-zinc-800"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                />
                {selectedFile && imageDimensions && (
                  <div className="mt-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {imageDimensions.width} &times; {imageDimensions.height} px &bull; {selectedFile.size.toLocaleString()} bytes
                  </div>
                )}
              </div>

              {/* Code Snippets Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Export Options
                </span>
                <textarea
                  readOnly
                  value={outputText}
                  aria-label="Base64 data URI output"
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full h-24 p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-600 dark:text-zinc-400 resize-y break-all"
                />
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopy(outputText, 'datauri')}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Full Data URI</div>
                      <div className="text-[11px] text-slate-400 font-mono">data:image/...;base64,...</div>
                    </div>
                    <span className="text-red-600 font-bold">{copied && copyType === 'datauri' ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(outputText.split(',')[1] || outputText, 'raw')}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Raw Base64 Only</div>
                      <div className="text-[11px] text-slate-400 font-mono">Stripped prefix</div>
                    </div>
                    <span className="text-red-600 font-bold">{copied && copyType === 'raw' ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(`<img src="${outputText}" alt="Embedded Image" />`, 'html')}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">HTML &lt;img&gt; Tag</div>
                      <div className="text-[11px] text-slate-400 font-mono">&lt;img src=&quot;data:...&quot; /&gt;</div>
                    </div>
                    <span className="text-red-600 font-bold">{copied && copyType === 'html' ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(`background-image: url("${outputText}");`, 'css')}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">CSS Background</div>
                      <div className="text-[11px] text-slate-400 font-mono">background-image: url(&quot;...&quot;)</div>
                    </div>
                    <span className="text-red-600 font-bold">{copied && copyType === 'css' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : toolId === 'base64-to-image' ? (
        /* TOOL 3: Base64 to Image */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Base64 String or Data URI</span>
              {inputText && <span className="text-[10px] text-slate-400">{inputText.length} chars</span>}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste Base64 string or data:image/png;base64,... here"
              rows={14}
              className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
            />
          </div>

          {/* Image Preview & Download */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center min-h-[300px]">
            {imagePreviewUrl ? (
              <div className="text-center space-y-3">
                <img
                  src={imagePreviewUrl}
                  alt="Decoded output"
                  className="max-h-64 max-w-full object-contain rounded-lg border border-slate-100 dark:border-zinc-800 shadow-xs mx-auto"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                />
                {imageDimensions && (
                  <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {imageDimensions.width} &times; {imageDimensions.height} px
                  </div>
                )}
                <button
                  onClick={handleDownloadDecoded}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image File</span>
                </button>
              </div>
            ) : (
              <div className="text-slate-400 text-center text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                <span>Paste a Base64 string on the left to render the decoded image.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Dual Panel for Base64 Text / URL / HTML Entities */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>{mode === 'encode' ? 'Input Text' : 'Input Encoded'}</span>
              {inputText && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new TextEncoder().encode(inputText).length} bytes
                </span>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to convert..."
              rows={14}
              className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>{mode === 'encode' ? 'Encoded Result' : 'Decoded Text'}</span>
              {outputText && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new TextEncoder().encode(outputText).length} bytes
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Converted output..."
              rows={14}
              className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 font-mono text-xs text-slate-900 dark:text-white focus:outline-none resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}
