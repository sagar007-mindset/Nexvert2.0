/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Check, Clipboard, Download, FileCode2, Trash2, Sparkles } from 'lucide-react';
import { load as parseYaml } from 'js-yaml';

interface DeveloperConversionToolsProps {
  toolId: string;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (quoted && next === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(field);
      field = '';
      if (row.some(cell => cell.length > 0)) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some(cell => cell.length > 0)) rows.push(row);

  if (rows.length < 2) return [];
  const headers = rows[0].map((h, i) => h.trim() || `column_${i + 1}`);
  return rows.slice(1).map(values => {
    const obj: Record<string, unknown> = {};
    headers.forEach((key, i) => {
      const value = (values[i] ?? '').trim();
      if (value === '') obj[key] = '';
      else if (value === 'true') obj[key] = true;
      else if (value === 'false') obj[key] = false;
      else if (/^-?\d+(\.\d+)?$/.test(value)) obj[key] = Number(value);
      else obj[key] = value;
    });
    return obj;
  });
}

function xmlNodeToJson(node: Element): unknown {
  const children = Array.from(node.children);
  const hasElementChildren = children.length > 0;
  const attrs = Array.from(node.attributes);
  const text = Array.from(node.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent || '')
    .join('')
    .trim();

  if (!hasElementChildren && attrs.length === 0) return text;

  const result: Record<string, unknown> = {};
  attrs.forEach(attr => {
    result[`@${attr.name}`] = attr.value;
  });

  children.forEach(child => {
    const key = child.tagName;
    const value = xmlNodeToJson(child);
    if (key in result) {
      result[key] = Array.isArray(result[key]) ? [...(result[key] as unknown[]), value] : [result[key], value];
    } else {
      result[key] = value;
    }
  });

  if (text) result['#text'] = text;
  return result;
}

function convertInput(toolId: string, input: string): string {
  if (!input.trim()) return '';

  if (toolId === 'csv-to-json') {
    return JSON.stringify(parseCsv(input), null, 2);
  }

  if (toolId === 'xml-to-json') {
    const doc = new DOMParser().parseFromString(input, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError || !doc.documentElement) throw new Error('The XML document could not be parsed.');
    return JSON.stringify({ [doc.documentElement.tagName]: xmlNodeToJson(doc.documentElement) }, null, 2);
  }

  const value = parseYaml(input);
  return JSON.stringify(value ?? null, null, 2);
}

export default function DeveloperConversionTools({ toolId }: DeveloperConversionToolsProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const labels = useMemo(() => ({
    'csv-to-json': { name: 'CSV to JSON Converter', input: 'CSV', sample: 'name,age,active\nAman,20,true\nSara,22,false' },
    'xml-to-json': { name: 'XML to JSON Converter', input: 'XML', sample: '<users><user id="1"><name>Aman</name><role>Developer</role></user></users>' },
    'yaml-to-json': { name: 'YAML to JSON Converter', input: 'YAML', sample: 'name: Aman\nrole: Software Engineer\nskills:\n  - C++\n  - AI' }
  } as const), []);

  const meta = labels[toolId as keyof typeof labels] ?? labels['csv-to-json'];

  const run = () => {
    try {
      setError(null);
      setOutput(convertInput(toolId, input));
    } catch (err) {
      setOutput('');
      setError(err instanceof Error ? err.message : 'Conversion failed. Check the input and try again.');
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${toolId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 p-4 sm:p-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <FileCode2 className="w-3.5 h-3.5" /> Developer conversion
            </div>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">{meta.name}</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">Parse {meta.input} locally and produce formatted JSON.</p>
          </div>
          <button
            type="button"
            onClick={() => setInput(meta.sample)}
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Load sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Input</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full min-h-72 sm:min-h-80 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3.5 font-mono text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-y"
              placeholder={`Paste your ${meta.input} here...`}
              spellCheck={false}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">JSON output</label>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={copy} disabled={!output} aria-label="Copy JSON" className="inline-flex min-h-10 items-center gap-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold disabled:opacity-40 hover:border-red-500/40">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button type="button" onClick={download} disabled={!output} aria-label="Download JSON" className="inline-flex min-h-10 items-center gap-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold disabled:opacity-40 hover:border-red-500/40">
                  <Download className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
            <pre className="min-h-72 sm:min-h-80 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-950 text-slate-100 p-3.5 font-mono text-xs leading-5">{output || '// Your converted JSON will appear here.'}</pre>
          </div>
        </div>

        {error && <div role="alert" className="mx-4 sm:mx-5 mb-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-200 dark:border-zinc-800 p-4 sm:p-5">
          <button type="button" onClick={run} className="inline-flex flex-1 min-h-12 items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">Convert to JSON</button>
          <button type="button" onClick={() => { setInput(''); setOutput(''); setError(null); }} className="inline-flex min-h-12 items-center justify-center gap-1.5 px-5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Runs in your browser</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">The conversion UI uses browser APIs and does not require a developer account or server-side API.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Readable JSON</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">Output is formatted with two-space indentation so it is easier to inspect and edit.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No fake promises</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">Supported syntax and edge cases depend on the parser used by each conversion tool.</p>
        </div>
      </div>
    </section>
  );
}
