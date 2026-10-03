/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Minimize2,
  Maximize2,
  Code,
  Database,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface FormatterToolsProps {
  toolId: string;
}

// Real CSS Minifier function (pure client-side)
function minifyCss(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove newlines and tabs
    .replace(/[\r\n\t]+/g, ' ')
    // Remove spaces around symbols { } : ; ,
    .replace(/\s*([\{\}:;,>~+])\s*/g, '$1')
    // Remove trailing semicolons before closing brace
    .replace(/;}/g, '}')
    // Remove redundant multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Trim leading / trailing
    .trim();
}

// Format XML helper using DOMParser
function formatXml(xmlString: string, indentSize = 2): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent || 'XML syntax error');
  }

  function serializeNode(node: Node, depth: number): string {
    const pad = ' '.repeat(depth * indentSize);
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.nodeValue?.trim();
      return txt ? `${txt}` : '';
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      let attrs = '';
      for (let i = 0; i < el.attributes.length; i++) {
        attrs += ` ${el.attributes[i].name}="${el.attributes[i].value}"`;
      }

      const children = Array.from(el.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim())
      );

      if (children.length === 0) {
        return `${pad}<${el.tagName}${attrs} />\n`;
      }
      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        return `${pad}<${el.tagName}${attrs}>${children[0].nodeValue?.trim()}</${el.tagName}>\n`;
      }

      let inner = '';
      for (const ch of children) {
        inner += serializeNode(ch, depth + 1);
      }
      return `${pad}<${el.tagName}${attrs}>\n${inner}${pad}</${el.tagName}>\n`;
    }
    return '';
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n` + serializeNode(xmlDoc.documentElement, 0).trim();
}

export default function FormatterTools({ toolId }: FormatterToolsProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [indentSize, setIndentSize] = useState<number | string>(2);
  const [sqlDialect, setSqlDialect] = useState<string>('sql');
  const [sqlUppercase, setSqlUppercase] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sample Loaders
  const loadSample = () => {
    setErrorMsg(null);
    if (toolId === 'html-formatter') {
      setInputText(
        `<div class="card"><header><h1>Welcome to Nexvert</h1><p>Client-side developer tools</p></header><main><ul><li>Fast</li><li>Private</li><li>Reliable</li></ul><button type="button" class="btn btn-primary">Get Started</button></main></div>`
      );
    } else if (toolId === 'css-formatter' || toolId === 'css-minifier') {
      setInputText(
        `/* Base Stylesheet */\nbody {\n  font-family: system-ui, sans-serif;\n  line-height: 1.5;\n  color: #1e293b;\n  background-color: #f8fafc;\n}\n\n.btn-primary {\n  background-color: #dc2626;\n  color: #ffffff;\n  padding: 8px 16px;\n  border-radius: 8px;\n  transition: all 0.2s ease;\n}\n\n.btn-primary:hover {\n  background-color: #b91c1c;\n}`
      );
    } else if (toolId === 'js-formatter') {
      setInputText(
        `function calculateStats(items,factor=1.5){const filtered=items.filter(x=>x.active).map(x=>({id:x.id,score:x.score*factor}));return{count:filtered.length,total:filtered.reduce((a,b)=>a+b.score,0)}}const sample=[{id:1,score:10,active:true},{id:2,score:20,active:false},{id:3,score:35,active:true}];console.log(calculateStats(sample));`
      );
    } else if (toolId === 'sql-formatter') {
      setInputText(
        `select u.id,u.name,u.email,count(o.id) as total_orders,sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.active = true and o.created_at >= '2025-01-01' group by u.id,u.name,u.email having count(o.id) > 5 order by total_spent desc limit 50;`
      );
    } else if (toolId === 'xml-formatter') {
      setInputText(
        `<project version="2.0"><config><database host="localhost" port="5432" ssl="true"/><logging level="info"><destination>stdout</destination></logging></config><dependencies><package name="react" version="18.3.1"/><package name="tailwindcss" version="4.0.0"/></dependencies></project>`
      );
    }
  };

  // Run formatting
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setErrorMsg(null);
      return;
    }

    const runFormat = async () => {
      setErrorMsg(null);
      setLoading(true);

      try {
        if (toolId === 'css-minifier') {
          setOutputText(minifyCss(inputText));
        } else if (toolId === 'html-formatter') {
          const beautify = await import('js-beautify');
          const indentChar = indentSize === 'tab' ? '\t' : ' ';
          const indentVal = indentSize === 'tab' ? 1 : Number(indentSize);
          const formatted = beautify.html(inputText, {
            indent_size: indentVal,
            indent_char: indentChar,
            max_preserve_newlines: 1,
            preserve_newlines: true
          });
          setOutputText(formatted);
        } else if (toolId === 'css-formatter') {
          const beautify = await import('js-beautify');
          const indentChar = indentSize === 'tab' ? '\t' : ' ';
          const indentVal = indentSize === 'tab' ? 1 : Number(indentSize);
          const formatted = beautify.css(inputText, {
            indent_size: indentVal,
            indent_char: indentChar
          });
          setOutputText(formatted);
        } else if (toolId === 'js-formatter') {
          const beautify = await import('js-beautify');
          const indentChar = indentSize === 'tab' ? '\t' : ' ';
          const indentVal = indentSize === 'tab' ? 1 : Number(indentSize);
          const formatted = beautify.js(inputText, {
            indent_size: indentVal,
            indent_char: indentChar,
            space_after_anon_function: true,
            brace_style: 'collapse'
          });
          setOutputText(formatted);
        } else if (toolId === 'sql-formatter') {
          const { format } = await import('sql-formatter');
          const indent = indentSize === 'tab' ? '\t' : ' '.repeat(Number(indentSize) || 2);
          const formatted = format(inputText, {
            language: sqlDialect as any,
            tabWidth: Number(indentSize) || 2,
            useTabs: indentSize === 'tab',
            keywordCase: sqlUppercase ? 'upper' : 'preserve'
          });
          setOutputText(formatted);
        } else if (toolId === 'xml-formatter') {
          const formatted = formatXml(inputText, Number(indentSize) || 2);
          setOutputText(formatted);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Formatting failed.');
        setOutputText('');
      } finally {
        setLoading(false);
      }
    };

    runFormat();
  }, [inputText, indentSize, sqlDialect, sqlUppercase, toolId]);

  // Real Byte calculation (no fake numbers)
  const byteStats = useMemo(() => {
    if (!inputText) return null;
    const encoder = new TextEncoder();
    const beforeBytes = encoder.encode(inputText).length;
    const afterBytes = outputText ? encoder.encode(outputText).length : 0;
    const savedBytes = beforeBytes - afterBytes;
    const savedPercent = beforeBytes > 0 ? ((savedBytes / beforeBytes) * 100).toFixed(1) : '0';
    return { beforeBytes, afterBytes, savedBytes, savedPercent };
  }, [inputText, outputText]);

  // Copy helper
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download helper
  const handleDownload = () => {
    const extMap: Record<string, { ext: string; mime: string }> = {
      'html-formatter': { ext: 'html', mime: 'text/html' },
      'css-formatter': { ext: 'css', mime: 'text/css' },
      'css-minifier': { ext: 'min.css', mime: 'text/css' },
      'js-formatter': { ext: 'js', mime: 'application/javascript' },
      'sql-formatter': { ext: 'sql', mime: 'text/plain' },
      'xml-formatter': { ext: 'xml', mime: 'application/xml' }
    };
    const meta = extMap[toolId] || { ext: 'txt', mime: 'text/plain' };
    const blob = new Blob([outputText], { type: meta.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${meta.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              setOutputText('');
              setErrorMsg(null);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>

          {/* Indent selector */}
          {toolId !== 'css-minifier' && (
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-zinc-800 text-xs">
              <span className="text-slate-500">Indent:</span>
              {[2, 4, 'tab'].map((size) => (
                <button
                  key={size}
                  onClick={() => setIndentSize(size)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                    indentSize === size
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {size === 'tab' ? 'Tab' : `${size} sp`}
                </button>
              ))}
            </div>
          )}

          {/* SQL Specific Options */}
          {toolId === 'sql-formatter' && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-zinc-800 text-xs">
              <select
                value={sqlDialect}
                onChange={(e) => setSqlDialect(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-200"
              >
                <option value="sql">Standard SQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
                <option value="tsql">Transact-SQL</option>
                <option value="plsql">PL/SQL</option>
                <option value="mariadb">MariaDB</option>
              </select>

              <button
                onClick={() => setSqlUppercase(!sqlUppercase)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  sqlUppercase ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold' : 'text-slate-500'
                }`}
              >
                UPPERCASE Keywords
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {outputText && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS Minifier Real Stats Card */}
      {toolId === 'css-minifier' && byteStats && outputText && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Original Size</span>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
              {byteStats.beforeBytes.toLocaleString()} B
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Minified Size</span>
            <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {byteStats.afterBytes.toLocaleString()} B
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Bytes Saved</span>
            <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
              {byteStats.savedBytes.toLocaleString()} B
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reduction</span>
            <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
              {byteStats.savedPercent}%
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dual Panel Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Input Code</span>
            {inputText && (
              <span className="text-[10px] text-slate-400 font-mono">
                {new TextEncoder().encode(inputText).length} bytes
              </span>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste raw ${toolId.replace('-', ' ')} code here...`}
            rows={16}
            className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>{toolId === 'css-minifier' ? 'Minified CSS' : 'Formatted Code'}</span>
            {outputText && (
              <span className="text-[10px] text-slate-400 font-mono">
                {new TextEncoder().encode(outputText).length} bytes
              </span>
            )}
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder={loading ? 'Formatting...' : 'Formatted code will appear automatically...'}
            rows={16}
            className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 font-mono text-xs text-slate-900 dark:text-white focus:outline-none resize-y"
          />
        </div>
      </div>
    </div>
  );
}
