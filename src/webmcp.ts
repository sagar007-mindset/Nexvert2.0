/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * WebMCP (https://webmachinelearning.github.io/webmcp/) — exposes a tool-discovery capability to
 * an AI agent running inside the browser.
 *
 * Why this is implementable here when an MCP Server Card is not: WebMCP is a *browser* API. The
 * tool runs in the page, which is exactly where Nexvert's work already happens. No server, no
 * endpoint, nothing advertised that does not exist.
 *
 * Scope is deliberately narrow. Only discovery is exposed — "which Nexvert tool does X, and
 * where is it" — because that is something this page can genuinely answer for the whole catalogue.
 * The conversions themselves are not registered: they need a real file chosen by a human in a
 * file input, and a tool that accepted a path or a URL would fail in ways an agent could not see.
 *
 * Status: the spec is a W3C Community Group Draft and ships behind a Chrome origin trial, so
 * `modelContext` is absent in virtually every browser today. Every path here is feature-detected
 * and wrapped, and the module is a no-op when the API is missing — it must never affect a page.
 */

import { CONVERTER_TOOLS } from './config/converters.config';
import { SITE_URL } from './config/site.config';

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface ModelContextLike {
  registerTool(tool: ModelContextTool, options?: { signal?: AbortSignal }): unknown;
}

/**
 * The spec puts `modelContext` on Document. Chrome's early preview exposed it on Navigator, so
 * both are probed rather than assuming the one the current draft happens to name.
 */
function getModelContext(): ModelContextLike | null {
  try {
    const fromDocument = (document as unknown as { modelContext?: ModelContextLike }).modelContext;
    if (fromDocument && typeof fromDocument.registerTool === 'function') return fromDocument;
    const fromNavigator = (navigator as unknown as { modelContext?: ModelContextLike }).modelContext;
    if (fromNavigator && typeof fromNavigator.registerTool === 'function') return fromNavigator;
  } catch {
    /* Accessing an unknown property can throw under strict embedder policies. */
  }
  return null;
}

/** Words that carry no signal about which tool is wanted. */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'from', 'into', 'my', 'me', 'i', 'want', 'need', 'how', 'do', 'can',
  'please', 'file', 'files', 'online', 'free', 'tool', 'convert', 'make', 'get', 'with', 'and',
  'for', 'of', 'in', 'on', 'is', 'it', 'this', 'that',
]);

/**
 * Intent synonyms. A naive word match ranks "Audio Joiner" above "PDF Merger" for "merge PDFs",
 * because both descriptions contain "merge" — so the user's vocabulary is mapped onto the words
 * the catalogue actually uses before scoring.
 */
const SYNONYMS: Record<string, string[]> = {
  smaller: ['compress', 'reduce', 'shrink'],
  reduce: ['compress'],
  shrink: ['compress'],
  compress: ['compress', 'smaller'],
  gps: ['exif', 'metadata', 'location'],
  metadata: ['exif'],
  exif: ['exif', 'metadata'],
  location: ['exif', 'gps'],
  join: ['merge', 'combine'],
  combine: ['merge'],
  merge: ['merge', 'combine'],
  split: ['split', 'separate'],
  cut: ['trim', 'cut'],
  trim: ['trim', 'cut'],
  rotate: ['rotate'],
  resize: ['resize', 'scale'],
  photo: ['image', 'photo'],
  picture: ['image'],
  image: ['image', 'photo'],
  movie: ['video'],
  clip: ['video'],
  sound: ['audio'],
  music: ['audio'],
  transparent: ['transparency', 'png'],
  watermark: ['watermark'],
};

/**
 * People name formats by the application, not the extension — "pdf to word", not "pdf to docx".
 * Without this the direction check silently does nothing for exactly the queries it exists for.
 */
const FORMAT_ALIASES: Record<string, string> = {
  word: 'docx', doc: 'docx', msword: 'docx',
  excel: 'xlsx', xls: 'xlsx', spreadsheet: 'xlsx',
  powerpoint: 'pptx', ppt: 'pptx', slides: 'pptx',
  jpeg: 'jpg', jpe: 'jpg', tif: 'tiff',
  markdown: 'md', text: 'txt', plaintext: 'txt',
  yml: 'yaml', htm: 'html', mpeg: 'mp4', mpg: 'mp4', quicktime: 'mov', jfif: 'jpg',
};

function canonicalFormat(token: string): string {
  const t = token.toLowerCase().replace(/^\./, '');
  return FORMAT_ALIASES[t] || t;
}

interface Candidate {
  title: string;
  description: string;
  category: string;
  formats: string[];
  inputFormats: string[];
  outputFormats: string[];
}

/**
 * Ranks a tool against a free-text query.
 *
 * Weighting reflects how reliable each field is as a signal: a format token ("heic", "mp4") is
 * nearly decisive, the title is strong, the description is weak and matches there alone are
 * usually coincidental. The final score is multiplied by how much of the query was matched, so a
 * tool hitting one word out of four cannot outrank one hitting three.
 */
function score(query: string, c: Candidate): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const title = c.title.toLowerCase();
  const desc = c.description.toLowerCase();
  const formats = new Set(c.formats.map((f) => f.toLowerCase().replace(/^\./, '')));
  const category = c.category.toLowerCase();

  // A whole-phrase hit in the title is as certain as this gets.
  if (title.includes(q)) return 1000;

  const tokens = q
    .split(/[^a-z0-9]+/i)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  if (!tokens.length) return 0;

  let total = 0;
  let matched = 0;

  for (const token of tokens) {
    // "merge PDFs" must reach the PDF Merger, so a trailing plural is tried too.
    const literals = token.endsWith('s') && token.length > 3 ? [token, token.slice(0, -1)] : [token];
    const synonyms = SYNONYMS[token] || [];

    let best = 0;
    for (const v of literals) {
      if (formats.has(v)) best = Math.max(best, 60);
      else if (title.includes(v)) best = Math.max(best, 45);
      else if (category.includes(v)) best = Math.max(best, 15);
      else if (desc.includes(v)) best = Math.max(best, 8);
    }
    // A synonym hit is real but weaker evidence than the user's own word, so it scores below
    // the literal. Without this, "EXIF Metadata Viewer" ties with "Remove EXIF" for
    // "remove gps from photo" — the verb the user actually typed has to carry more weight.
    for (const v of synonyms) {
      if (formats.has(v)) best = Math.max(best, 50);
      else if (title.includes(v)) best = Math.max(best, 35);
      else if (category.includes(v)) best = Math.max(best, 12);
      else if (desc.includes(v)) best = Math.max(best, 5);
    }

    if (best > 0) matched++;
    total += best;
  }

  if (!matched) return 0;

  // Direction matters: "pdf to word" must not return a Word-to-PDF converter. When the query
  // names a source and target format, reward tools that actually run that way and penalise the
  // reverse, rather than treating both formats as a bag of words.
  const direction = /\b([a-z0-9]+)\s+to\s+([a-z0-9]+)\b/.exec(q);
  if (direction) {
    const from = canonicalFormat(direction[1]);
    const to = canonicalFormat(direction[2]);
    const inputs = c.inputFormats.map((f) => canonicalFormat(f));
    const outputs = c.outputFormats.map((f) => canonicalFormat(f));
    if (inputs.includes(from) && outputs.includes(to)) total += 300;
    else if (inputs.includes(to) && outputs.includes(from)) {
      total *= 0.3; // the reverse converter — related, but not what was asked for
    }
  }

  // Penalise partial coverage: matching 1 of 4 query words is usually a coincidence.
  return total * (matched / tokens.length);
}

let controller: AbortController | null = null;

export function registerWebMcpTools(): void {
  const ctx = getModelContext();
  if (!ctx) return;

  // Abort any previous registration so a re-run (HMR, re-entry) cannot duplicate tools.
  controller?.abort();
  controller = new AbortController();

  try {
    ctx.registerTool(
      {
        name: 'find_nexvert_tool',
        title: 'Find a Nexvert file tool',
        description:
          'Search Nexvert\'s catalogue of free browser-based file tools and return the ones that match a task, with their URLs. Use when a user needs to convert, compress, merge, split or edit a file and you need the right page. Nexvert processes files in the browser, so results are page URLs for a person to open — not an API.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What the user wants to do, e.g. "convert HEIC to JPG" or "merge PDFs".',
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of tools to return (1-20).',
              minimum: 1,
              maximum: 20,
              default: 5,
            },
          },
          required: ['query'],
        },
        execute: (input) => {
          const query = String(input?.query ?? '');
          const limit = Math.min(Math.max(Number(input?.limit) || 5, 1), 20);

          const matches = Object.values(CONVERTER_TOOLS)
            .map((tool) => ({
              tool,
              rank: score(query, {
                title: tool.title,
                description: tool.description,
                category: tool.category,
                formats: [...(tool.inputFormats || []), ...(tool.outputFormats || []), ...(tool.fileExtensions || [])],
                inputFormats: tool.inputFormats || [],
                outputFormats: tool.outputFormats || [],
              }),
            }))
            .filter((m) => m.rank >= 30)
            .sort((a, b) => b.rank - a.rank)
            .slice(0, limit)
            .map(({ tool }) => ({
              name: tool.title,
              url: `${SITE_URL}${tool.route === '/' ? '/' : tool.route}`,
              description: tool.description,
              category: tool.category,
              inputFormats: tool.inputFormats,
              outputFormats: tool.outputFormats,
              maxFileSizeMB: tool.maxFileSizeMB,
            }));

          // When the query names a conversion Nexvert cannot actually perform, say so. Otherwise
          // the nearest-looking tool gets presented as the answer and the user follows a link
          // that cannot do what they asked.
          const direction = /\b([a-z0-9]+)\s+to\s+([a-z0-9]+)\b/.exec(query.toLowerCase());
          let directionNote: string | undefined;
          if (direction) {
            const from = canonicalFormat(direction[1]);
            const to = canonicalFormat(direction[2]);
            const supported = Object.values(CONVERTER_TOOLS).some(
              (t) =>
                (t.inputFormats || []).map(canonicalFormat).includes(from) &&
                (t.outputFormats || []).map(canonicalFormat).includes(to)
            );
            if (!supported) {
              directionNote = `No Nexvert tool converts ${from.toUpperCase()} to ${to.toUpperCase()} directly. The tools listed are related but do NOT perform that conversion — do not present them as if they do.`;
            }
          }

          return JSON.stringify(
            {
              query,
              matchCount: matches.length,
              ...(directionNote ? { warning: directionNote } : {}),
              tools: matches,
              note:
                'Nexvert tools run entirely in the visitor\'s browser; files are never uploaded. These are interactive pages, not API endpoints — open the URL, or drive it with browser automation. Each page also has a plain-Markdown version at its URL + "index.md".',
            },
            null,
            2
          );
        },
      },
      { signal: controller.signal }
    );
  } catch {
    /* A spec change or a revoked origin trial must not take the page down with it. */
  }
}
