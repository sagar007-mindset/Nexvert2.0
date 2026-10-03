/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dynamic singletons for lazy-loading libraries > 100KB on demand only
let mammothPromise: Promise<any> | null = null;
let markedPromise: Promise<any> | null = null;
let turndownPromise: Promise<any> | null = null;
let jszipPromise: Promise<any> | null = null;

export async function getMammoth() {
  if (!mammothPromise) {
    mammothPromise = (async () => {
      const mod = await import('mammoth');
      return mod.default || mod;
    })();
  }
  return mammothPromise;
}

export async function getMarked() {
  if (!markedPromise) {
    markedPromise = (async () => {
      const mod = await import('marked');
      return mod.marked || mod;
    })();
  }
  return markedPromise;
}

export async function getTurndown() {
  if (!turndownPromise) {
    turndownPromise = (async () => {
      const mod = await import('turndown');
      const TurndownService = ((mod as any).default || mod) as typeof import('turndown');
      const service = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
        emDelimiter: '*',
        strongDelimiter: '**'
      });

      // Add robust GFM table support to Turndown
      service.addRule('table', {
        filter: 'table',
        replacement: function (_content: string, node: any) {
          const table = node as HTMLTableElement;
          const rows = Array.from(table.querySelectorAll('tr'));
          if (rows.length === 0) return '';

          const matrix: string[][] = [];
          for (const row of rows) {
            const cells = Array.from(row.querySelectorAll('th, td'));
            matrix.push(
              cells.map((cell) =>
                (cell.textContent || '')
                  .replace(/\|/g, '\\|')
                  .replace(/\r?\n/g, ' ')
                  .trim()
              )
            );
          }

          if (matrix.length === 0) return '';
          const maxCols = Math.max(...matrix.map((r) => r.length));
          if (maxCols === 0) return '';

          // Pad rows to maxCols
          const normalized = matrix.map((row) => {
            const copy = [...row];
            while (copy.length < maxCols) copy.push('');
            return copy;
          });

          // Calculate column widths
          const colWidths = Array(maxCols).fill(3);
          for (const row of normalized) {
            row.forEach((cell, idx) => {
              colWidths[idx] = Math.max(colWidths[idx], cell.length);
            });
          }

          const headerRow = normalized[0];
          const hasTh = Boolean(rows[0]?.querySelector('th'));
          const headerPadded = headerRow
            .map((cell, idx) => cell.padEnd(colWidths[idx], ' '))
            .join(' | ');

          const separator = colWidths
            .map((w) => '-'.repeat(Math.max(w, 3)))
            .join(' | ');

          const dataRows = (hasTh ? normalized.slice(1) : normalized.slice(1)).map((row) =>
            row.map((cell, idx) => cell.padEnd(colWidths[idx], ' ')).join(' | ')
          );

          const lines = [
            `| ${headerPadded} |`,
            `| ${separator} |`,
            ...dataRows.map((r) => `| ${r} |`)
          ];

          return '\n\n' + lines.join('\n') + '\n\n';
        }
      });

      return service;
    })();
  }
  return turndownPromise;
}

export async function getJSZip() {
  if (!jszipPromise) {
    jszipPromise = (async () => {
      const mod = await import('jszip');
      return mod.default || mod;
    })();
  }
  return jszipPromise;
}

/**
 * Trigger genuine client-side file download from Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Trigger genuine text file download
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Strip HTML tags while preserving real document structure:
 * Headings, paragraphs, bullet/numbered lists, line breaks, blockquotes, tables, and entity decoding.
 */
export function htmlToStructuredText(html: string): string {
  if (!html || typeof html !== 'string') return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove elements that should not produce text
  const removeTags = ['script', 'style', 'noscript', 'svg', 'canvas', 'template'];
  for (const tag of removeTags) {
    const elems = doc.querySelectorAll(tag);
    elems.forEach((el) => el.remove());
  }

  function traverse(node: Node, listIndex = { current: 0, isOrdered: false }): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'br') {
      return '\n';
    }

    if (tagName === 'hr') {
      return '\n\n----------------------------------------\n\n';
    }

    let childText = '';
    const isOrdered = tagName === 'ol';
    const isUnordered = tagName === 'ul';

    let itemIdx = 1;
    for (const child of Array.from(el.childNodes)) {
      if (isOrdered) {
        childText += traverse(child, { current: itemIdx++, isOrdered: true });
      } else if (isUnordered) {
        childText += traverse(child, { current: 0, isOrdered: false });
      } else {
        childText += traverse(child, listIndex);
      }
    }

    switch (tagName) {
      case 'h1':
        return `\n\n# ${childText.trim()}\n========================================\n\n`;
      case 'h2':
        return `\n\n## ${childText.trim()}\n----------------------------------------\n\n`;
      case 'h3':
        return `\n\n### ${childText.trim()}\n\n`;
      case 'h4':
      case 'h5':
      case 'h6':
        return `\n\n${childText.trim()}\n\n`;
      case 'p':
        return `\n\n${childText.trim()}\n\n`;
      case 'blockquote':
        return `\n\n> ${childText.trim().replace(/\n/g, '\n> ')}\n\n`;
      case 'li': {
        const prefix = listIndex.isOrdered ? `${listIndex.current}. ` : '- ';
        return `\n${prefix}${childText.trim()}`;
      }
      case 'pre':
      case 'code':
        return `\n\n${childText.trim()}\n\n`;
      case 'tr': {
        const cells = Array.from(el.querySelectorAll('th, td')).map((c) =>
          (c.textContent || '').trim()
        );
        return cells.join('\t') + '\n';
      }
      case 'table':
        return `\n\n${childText.trim()}\n\n`;
      case 'div':
      case 'section':
      case 'article':
        return `\n${childText}\n`;
      default:
        return childText;
    }
  }

  const raw = traverse(doc.body || doc);
  // Clean up excessive blank lines (max 2 newlines in a row) and trim
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}
