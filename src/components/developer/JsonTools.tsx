/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  GitCompare,
  Upload,
  RefreshCw
} from 'lucide-react';

interface JsonToolsProps {
  toolId: string;
}

// Helper to calculate exact line & column from JSON.parse error or position
function getJsonErrorInfo(jsonString: string, error: Error): { line: number; column: number; snippet: string; message: string } {
  let line = 1;
  let column = 1;
  let position = -1;

  // Modern V8 error messages: "at position 42" or "in JSON at position 42"
  const posMatch = error.message.match(/at position (\d+)/i) || error.message.match(/position (\d+)/i);
  if (posMatch) {
    position = parseInt(posMatch[1], 10);
  } else {
    // Safari / Firefox: "line 4 column 5"
    const lineColMatch = error.message.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    }
  }

  if (position >= 0) {
    const lines = jsonString.slice(0, position).split('\n');
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  const allLines = jsonString.split('\n');
  const targetLineIdx = line - 1;
  const errorLine = allLines[targetLineIdx] ?? '';
  const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';
  const snippet = `${errorLine}\n${pointer}`;

  return { line, column, snippet, message: error.message };
}

// Collapsible JSON Tree Node
function JsonTreeNode({ data, name, isLast = true, depth = 0 }: { key?: React.Key; data: any; name?: string; isLast?: boolean; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  const isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;

  if (!isExpandable) {
    let valStr = JSON.stringify(data);
    let valColor = 'text-amber-600 dark:text-amber-400';
    if (typeof data === 'string') valColor = 'text-emerald-600 dark:text-emerald-400';
    else if (typeof data === 'number') valColor = 'text-blue-600 dark:text-blue-400';
    else if (typeof data === 'boolean') valColor = 'text-purple-600 dark:text-purple-400';
    else if (data === null) valColor = 'text-rose-600 dark:text-rose-400';

    return (
      <div className="font-mono text-xs leading-5 pl-4 flex items-center space-x-1">
        {name !== undefined && (
          <span className="text-slate-800 dark:text-zinc-200 font-semibold">&quot;{name}&quot;:</span>
        )}
        <span className={valColor}>{valStr}</span>
        {!isLast && <span className="text-slate-400">,</span>}
      </div>
    );
  }

  const keys = isObject ? Object.keys(data) : [];
  const itemCount = isArray ? data.length : keys.length;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="font-mono text-xs leading-5 select-text">
      <div
        className="flex items-center space-x-1 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 rounded px-1 py-0.5 w-fit"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-slate-400">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
        {name !== undefined && (
          <span className="text-slate-800 dark:text-zinc-200 font-semibold">&quot;{name}&quot;: </span>
        )}
        <span className="text-slate-500 dark:text-zinc-400 font-bold">{openBracket}</span>
        {collapsed ? (
          <span className="text-[11px] px-1.5 py-0.2 bg-slate-200 dark:bg-zinc-800 rounded text-slate-600 dark:text-zinc-400 font-sans">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        ) : null}
        {collapsed && <span className="text-slate-500 dark:text-zinc-400 font-bold">{closeBracket}</span>}
        {!isLast && collapsed && <span className="text-slate-400">,</span>}
      </div>

      {!collapsed && (
        <div className="pl-4 border-l border-slate-200 dark:border-zinc-800 ml-2">
          {isArray
            ? data.map((item: any, idx: number) => (
                <JsonTreeNode key={idx} data={item} isLast={idx === data.length - 1} depth={depth + 1} />
              ))
            : keys.map((key: string, idx: number) => (
                <JsonTreeNode key={key} name={key} data={data[key]} isLast={idx === keys.length - 1} depth={depth + 1} />
              ))}
          <div className="text-slate-500 dark:text-zinc-400 font-bold">
            {closeBracket}
            {!isLast && <span className="text-slate-400">,</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Dot notation flattener for JSON to CSV
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  if (obj === null || typeof obj !== 'object') {
    result[prefix || 'value'] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    obj.forEach((val, idx) => {
      const nested = flattenObject(val, prefix ? `${prefix}.${idx}` : `${idx}`);
      Object.assign(result, nested);
    });
    return result;
  }

  for (const [key, val] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object') {
      Object.assign(result, flattenObject(val, newKey));
    } else {
      result[newKey] = val;
    }
  }
  return result;
}

// RFC 4180 CSV parser
function parseCsv(csvText: string, delimiter = ','): any[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];
  const headers = rows[0];
  const results: Record<string, any>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, any> = {};
    headers.forEach((hdr, idx) => {
      let val: any = row[idx] ?? '';
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val === 'null') val = null;
      else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
      obj[hdr] = val;
    });
    results.push(obj);
  }
  return results;
}

// JSON to XML builder
function jsonToXml(data: any, rootTag = 'root', indent = 2): string {
  function toXml(obj: any, tag: string, depth: number): string {
    const pad = ' '.repeat(depth * indent);
    if (obj === null || obj === undefined) {
      return `${pad}<${tag} />\n`;
    }
    if (typeof obj !== 'object') {
      const escaped = String(obj)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `${pad}<${tag}>${escaped}</${tag}>\n`;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => toXml(item, tag, depth)).join('');
    }

    let xml = `${pad}<${tag}>\n`;
    for (const [key, val] of Object.entries(obj)) {
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      xml += toXml(val, safeKey, depth + 1);
    }
    xml += `${pad}</${tag}>\n`;
    return xml;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n` + toXml(data, rootTag, 0);
}

// XML to JSON parser using browser DOMParser
function xmlToJson(xmlDoc: Node): any {
  if (xmlDoc.nodeType === Node.TEXT_NODE) {
    return xmlDoc.nodeValue?.trim() || null;
  }
  if (xmlDoc.nodeType === Node.ELEMENT_NODE) {
    const element = xmlDoc as Element;
    const obj: Record<string, any> = {};

    // Attributes
    if (element.attributes.length > 0) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        obj[`@${attr.name}`] = attr.value;
      }
    }

    // Children
    const children = Array.from(element.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim())
    );

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      const text = children[0].nodeValue?.trim();
      if (Object.keys(obj).length === 0) return text;
      obj['#text'] = text;
      return obj;
    }

    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        const name = childEl.tagName;
        const val = xmlToJson(childEl);
        if (obj[name] !== undefined) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(val);
        } else {
          obj[name] = val;
        }
      }
    }
    return obj;
  }
  return null;
}

export default function JsonTools({ toolId }: JsonToolsProps) {
  // Common states
  const [inputText, setInputText] = useState('');
  const [inputB, setInputB] = useState(''); // for diff
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState<number | string>(2);
  const [activeView, setActiveView] = useState<'text' | 'tree'>('text');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ line: number; column: number; snippet: string; message: string } | null>(null);

  // Tool specific results
  const [outputText, setOutputText] = useState('');

  // Sample data loader
  const loadSample = () => {
    if (toolId === 'csv-to-json') {
      setInputText(`id,name,role,salary,active\n1,"Doe, John",Engineering,125000,true\n2,"Smith, Alice",Design,118000,true\n3,"Brown, Bob",Product,132000,false`);
    } else if (toolId === 'xml-to-json') {
      setInputText(`<?xml version="1.0" encoding="UTF-8"?>\n<project name="StudioApp" version="2.4.0">\n  <developer id="101">\n    <name>Elena Rostova</name>\n    <role>Lead Architect</role>\n    <skills>\n      <skill level="expert">TypeScript</skill>\n      <skill level="advanced">React</skill>\n    </skills>\n  </developer>\n</project>`);
    } else if (toolId === 'yaml-to-json') {
      setInputText(`version: "3.8"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n    environment:\n      NODE_ENV: production\n    restart: always`);
    } else if (toolId === 'json-diff') {
      setInputText(`{\n  "title": "Document v1",\n  "status": "draft",\n  "views": 42,\n  "tags": ["alpha", "beta"]\n}`);
      setInputB(`{\n  "title": "Document v2",\n  "status": "published",\n  "views": 156,\n  "tags": ["alpha", "beta", "production"],\n  "author": "Alice"\n}`);
    } else {
      setInputText(`{\n  "appName": "Nexvert",\n  "version": "2.0.0",\n  "isPrivate": true,\n  "features": ["json", "encoding", "hashing"],\n  "stats": {\n    "activeTools": 43,\n    "serverCalls": 0\n  }\n}`);
    }
  };

  // Run conversion based on active toolId
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setErrorInfo(null);
      return;
    }

    try {
      setErrorInfo(null);

      if (toolId === 'json-formatter') {
        const parsed = JSON.parse(inputText);
        const indent = indentSize === 'tab' ? '\t' : Number(indentSize);
        setOutputText(JSON.stringify(parsed, null, indent));
      } else if (toolId === 'json-validator') {
        const parsed = JSON.parse(inputText);
        setOutputText(JSON.stringify(parsed, null, 2));
      } else if (toolId === 'json-minifier') {
        const parsed = JSON.parse(inputText);
        setOutputText(JSON.stringify(parsed));
      } else if (toolId === 'json-to-csv') {
        const parsed = JSON.parse(inputText);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        const flatItems = arrayData.map((item) => flattenObject(item));
        const allKeys = Array.from(new Set(flatItems.flatMap((item) => Object.keys(item))));

        let csv = allKeys.map((k) => `"${k.replace(/"/g, '""')}"`).join(',') + '\n';
        for (const item of flatItems) {
          const row = allKeys.map((k) => {
            const val = item[k];
            if (val === undefined || val === null) return '""';
            const strVal = String(val).replace(/"/g, '""');
            return `"${strVal}"`;
          });
          csv += row.join(',') + '\n';
        }
        setOutputText(csv.trim());
      } else if (toolId === 'csv-to-json') {
        const jsonResult = parseCsv(inputText);
        setOutputText(JSON.stringify(jsonResult, null, 2));
      } else if (toolId === 'json-to-xml') {
        const parsed = JSON.parse(inputText);
        setOutputText(jsonToXml(parsed, 'root', 2));
      } else if (toolId === 'xml-to-json') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(inputText, 'text/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          throw new Error(parseError.textContent || 'XML Parsing Error');
        }
        const jsonResult = xmlToJson(doc.documentElement);
        setOutputText(JSON.stringify({ [doc.documentElement.tagName]: jsonResult }, null, 2));
      } else if (toolId === 'json-to-yaml') {
        setLoading(true);
        import('js-yaml')
          .then((yaml) => {
            const parsed = JSON.parse(inputText);
            setOutputText(yaml.dump(parsed, { indent: Number(indentSize) || 2 }));
            setLoading(false);
          })
          .catch((err) => {
            setErrorInfo({ line: 1, column: 1, snippet: '', message: err.message });
            setLoading(false);
          });
      } else if (toolId === 'yaml-to-json') {
        setLoading(true);
        import('js-yaml')
          .then((yaml) => {
            const loaded = yaml.load(inputText);
            setOutputText(JSON.stringify(loaded, null, 2));
            setLoading(false);
          })
          .catch((err: any) => {
            const line = err.mark ? err.mark.line + 1 : 1;
            const column = err.mark ? err.mark.column + 1 : 1;
            const allLines = inputText.split('\n');
            const snippet = allLines[line - 1] ?? '';
            setErrorInfo({ line, column, snippet: `${snippet}\n${' '.repeat(Math.max(0, column - 1))}^`, message: err.message });
            setLoading(false);
          });
      }
    } catch (err: any) {
      const errDetail = getJsonErrorInfo(inputText, err);
      setErrorInfo(errDetail);
      setOutputText('');
    }
  }, [inputText, indentSize, toolId]);

  // Real byte stats (no fabricated numbers)
  const byteStats = useMemo(() => {
    if (!inputText) return null;
    const encoder = new TextEncoder();
    const beforeBytes = encoder.encode(inputText).length;
    const afterBytes = outputText ? encoder.encode(outputText).length : 0;
    const savedBytes = beforeBytes - afterBytes;
    const savedPercent = beforeBytes > 0 ? ((savedBytes / beforeBytes) * 100).toFixed(1) : '0';
    return { beforeBytes, afterBytes, savedBytes, savedPercent };
  }, [inputText, outputText]);

  // Handle Copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle File Download
  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parsed JSON for tree view
  const parsedJsonForTree = useMemo(() => {
    if (!inputText.trim()) return null;
    try {
      return JSON.parse(inputText);
    } catch {
      return null;
    }
  }, [inputText]);

  // JSON Diff calculation
  const diffResults = useMemo(() => {
    if (toolId !== 'json-diff' || !inputText.trim() || !inputB.trim()) return null;
    try {
      const objA = JSON.parse(inputText);
      const objB = JSON.parse(inputB);

      const flatA = flattenObject(objA);
      const flatB = flattenObject(objB);

      const allKeys = Array.from(new Set([...Object.keys(flatA), ...Object.keys(flatB)])).sort();

      const diffList = allKeys.map((key) => {
        const hasA = key in flatA;
        const hasB = key in flatB;
        const valA = flatA[key];
        const valB = flatB[key];

        if (!hasA && hasB) {
          return { key, type: 'added', valA: undefined, valB };
        } else if (hasA && !hasB) {
          return { key, type: 'removed', valA, valB: undefined };
        } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
          return { key, type: 'modified', valA, valB };
        } else {
          return { key, type: 'unchanged', valA, valB };
        }
      });

      const addedCount = diffList.filter((d) => d.type === 'added').length;
      const removedCount = diffList.filter((d) => d.type === 'removed').length;
      const modifiedCount = diffList.filter((d) => d.type === 'modified').length;

      return { diffList, addedCount, removedCount, modifiedCount };
    } catch (e: any) {
      return { error: e.message };
    }
  }, [inputText, inputB, toolId]);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
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
              setInputB('');
              setOutputText('');
              setErrorInfo(null);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>

          {/* Indent Selector for Formatter */}
          {(toolId === 'json-formatter' || toolId === 'json-to-yaml') && (
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

          {/* View Toggle for Formatter */}
          {toolId === 'json-formatter' && (
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveView('text')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeView === 'text' ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Code View
              </button>
              <button
                onClick={() => setActiveView('tree')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeView === 'tree' ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Tree View
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {outputText && (
            <>
              <button
                onClick={() => handleCopy(outputText)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={() => {
                  const extMap: Record<string, { ext: string; mime: string }> = {
                    'json-formatter': { ext: 'json', mime: 'application/json' },
                    'json-validator': { ext: 'json', mime: 'application/json' },
                    'json-minifier': { ext: 'json', mime: 'application/json' },
                    'json-to-csv': { ext: 'csv', mime: 'text/csv' },
                    'csv-to-json': { ext: 'json', mime: 'application/json' },
                    'json-to-xml': { ext: 'xml', mime: 'application/xml' },
                    'xml-to-json': { ext: 'json', mime: 'application/json' },
                    'json-to-yaml': { ext: 'yaml', mime: 'text/yaml' },
                    'yaml-to-json': { ext: 'json', mime: 'application/json' }
                  };
                  const meta = extMap[toolId] || { ext: 'txt', mime: 'text/plain' };
                  handleDownload(outputText, `output.${meta.ext}`, meta.mime);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* JSON Validator Special Banner */}
      {toolId === 'json-validator' && inputText.trim() && (
        <div>
          {errorInfo ? (
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Invalid JSON Syntax &bull; Line {errorInfo.line}, Column {errorInfo.column}</span>
              </div>
              <p className="text-xs mt-1 font-mono text-rose-700 dark:text-rose-400">{errorInfo.message}</p>
              {errorInfo.snippet && (
                <pre className="mt-3 p-3 rounded bg-black/90 text-rose-400 font-mono text-xs overflow-x-auto">
                  {errorInfo.snippet}
                </pre>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Valid JSON Document</span>
              </div>
              {byteStats && (
                <div className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
                  {byteStats.beforeBytes.toLocaleString()} bytes &bull; {inputText.split('\n').length} lines
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON Minifier Real Metrics Card */}
      {toolId === 'json-minifier' && byteStats && outputText && (
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
            <span className="text-[10px] font-bold text-slate-400 uppercase">Saved</span>
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

      {/* JSON Diff Layout */}
      {toolId === 'json-diff' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span>Original JSON (Document A)</span>
                <span className="text-[10px] text-slate-400">{inputText.split('\n').length} lines</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste original JSON..."
                rows={12}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span>Modified JSON (Document B)</span>
                <span className="text-[10px] text-slate-400">{inputB.split('\n').length} lines</span>
              </div>
              <textarea
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder="Paste modified JSON..."
                rows={12}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
              />
            </div>
          </div>

          {/* Diff Result Table */}
          {diffResults && !diffResults.error && (
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <GitCompare className="w-4 h-4 text-red-500" />
                  <span>Structural Diff Results</span>
                </h3>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                    +{diffResults.addedCount} added
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold">
                    -{diffResults.removedCount} removed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold">
                    ~{diffResults.modifiedCount} modified
                  </span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono text-xs">
                {diffResults.diffList.map((d: any, idx: number) => {
                  let bg = 'bg-white dark:bg-zinc-900';
                  let badgeColor = 'text-slate-400';
                  if (d.type === 'added') {
                    bg = 'bg-emerald-50/70 dark:bg-emerald-950/20';
                    badgeColor = 'text-emerald-600 font-bold';
                  } else if (d.type === 'removed') {
                    bg = 'bg-rose-50/70 dark:bg-rose-950/20';
                    badgeColor = 'text-rose-600 font-bold';
                  } else if (d.type === 'modified') {
                    bg = 'bg-amber-50/70 dark:bg-amber-950/20';
                    badgeColor = 'text-amber-600 font-bold';
                  }

                  return (
                    <div key={idx} className={`p-2.5 flex items-start justify-between gap-4 ${bg}`}>
                      <div className="flex items-center space-x-2 min-w-40">
                        <span className={`text-[10px] uppercase w-16 ${badgeColor}`}>[{d.type}]</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{d.key}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2 text-right">
                        <span className="text-slate-500 truncate" title={String(d.valA)}>
                          {d.valA !== undefined ? JSON.stringify(d.valA) : '—'}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate" title={String(d.valB)}>
                          {d.valB !== undefined ? JSON.stringify(d.valB) : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {diffResults?.error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 text-xs font-mono">
              Error parsing diff JSON: {diffResults.error}
            </div>
          )}
        </div>
      ) : (
        /* Standard Dual Editor Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              <span>
                {toolId === 'csv-to-json'
                  ? 'Input CSV Text'
                  : toolId === 'xml-to-json'
                  ? 'Input XML Markup'
                  : toolId === 'yaml-to-json'
                  ? 'Input YAML Configuration'
                  : 'Input JSON'}
              </span>
              {inputText && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new TextEncoder().encode(inputText).length} bytes
                </span>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste or type ${toolId.replace('-', ' ')} content here...`}
              rows={16}
              className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              <span>
                {toolId === 'json-to-csv'
                  ? 'Generated CSV'
                  : toolId === 'json-to-xml'
                  ? 'Generated XML'
                  : toolId === 'json-to-yaml'
                  ? 'Generated YAML'
                  : toolId === 'json-minifier'
                  ? 'Minified JSON'
                  : toolId === 'json-validator'
                  ? 'Validated JSON'
                  : 'Formatted Output'}
              </span>
              {outputText && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new TextEncoder().encode(outputText).length} bytes
                </span>
              )}
            </div>

            {toolId === 'json-formatter' && activeView === 'tree' ? (
              <div className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[384px] max-h-[500px] overflow-auto">
                {parsedJsonForTree ? (
                  <JsonTreeNode data={parsedJsonForTree} />
                ) : (
                  <div className="text-xs text-slate-400 py-12 text-center">
                    Enter valid JSON on the left to view the interactive tree.
                  </div>
                )}
              </div>
            ) : (
              <textarea
                readOnly
                value={outputText}
                placeholder="Output will appear automatically..."
                rows={16}
                className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 font-mono text-xs text-slate-900 dark:text-white focus:outline-none resize-y"
              />
            )}
          </div>
        </div>
      )}

      {/* Error display if not on validator page */}
      {errorInfo && toolId !== 'json-validator' && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs font-mono text-rose-700 dark:text-rose-300">
          <span className="font-bold">Parse Error (Line {errorInfo.line}, Col {errorInfo.column}): </span>
          <span>{errorInfo.message}</span>
        </div>
      )}
    </div>
  );
}
