/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getJSZip, htmlToStructuredText } from './docCommon';

export interface EpubMetadata {
  title: string;
  author: string;
  language: string;
  description?: string;
  publisher?: string;
}

export interface EpubChapter {
  id: string;
  href: string;
  title: string;
  htmlContent: string;
  textContent: string;
  wordCount: number;
}

export interface ParsedEpub {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  totalWordCount: number;
  totalCharCount: number;
  combinedText: string;
  combinedHtml: string;
}

/**
 * Resolve relative path inside zip archive
 */
function resolveZipPath(basePath: string, relativePath: string): string {
  // Decode URL components in case href is URI-encoded
  const decoded = decodeURIComponent(relativePath);
  if (decoded.startsWith('/')) {
    return decoded.slice(1);
  }
  const baseDir = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/')) : '';
  const parts = (baseDir ? baseDir + '/' + decoded : decoded).split('/');
  const resolvedParts: string[] = [];

  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      resolvedParts.pop();
    } else {
      resolvedParts.push(part);
    }
  }

  return resolvedParts.join('/');
}

/**
 * Parse an EPUB file into chapters, plain text, and standalone HTML with embedded images
 */
export async function parseEpubFile(fileOrBuffer: File | ArrayBuffer): Promise<ParsedEpub> {
  const JSZip = await getJSZip();
  let zip: any;

  try {
    zip = await JSZip.loadAsync(fileOrBuffer);
  } catch (err: any) {
    throw new Error('Could not open file as a valid ZIP/EPUB archive: ' + (err.message || String(err)));
  }

  // 1. Read META-INF/container.xml
  const containerFile = zip.file('META-INF/container.xml') || zip.file('meta-inf/container.xml');
  if (!containerFile) {
    throw new Error('Invalid EPUB: Missing META-INF/container.xml file.');
  }

  const containerXmlStr = await containerFile.async('string');
  const domParser = new DOMParser();
  const containerDoc = domParser.parseFromString(containerXmlStr, 'application/xml');
  const rootfileEl = containerDoc.querySelector('rootfile');
  const opfPath = rootfileEl?.getAttribute('full-path');

  if (!opfPath) {
    throw new Error('Invalid EPUB: Unable to locate rootfile entry in container.xml.');
  }

  // 2. Read OPF file
  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error(`Invalid EPUB: Specified package file "${opfPath}" was not found in archive.`);
  }

  const opfXmlStr = await opfFile.async('string');
  const opfDoc = domParser.parseFromString(opfXmlStr, 'application/xml');

  // Parse metadata
  const title = opfDoc.querySelector('title, dc\\:title')?.textContent?.trim() || 'Untitled Book';
  const author = opfDoc.querySelector('creator, dc\\:creator')?.textContent?.trim() || 'Unknown Author';
  const language = opfDoc.querySelector('language, dc\\:language')?.textContent?.trim() || 'en';
  const description = opfDoc.querySelector('description, dc\\:description')?.textContent?.trim() || '';
  const publisher = opfDoc.querySelector('publisher, dc\\:publisher')?.textContent?.trim() || '';

  const metadata: EpubMetadata = {
    title,
    author,
    language,
    description,
    publisher
  };

  // 3. Parse manifest
  const manifestMap = new Map<string, { href: string; mediaType: string }>();
  const itemEls = Array.from(opfDoc.querySelectorAll('manifest > item'));
  for (const el of itemEls) {
    const id = el.getAttribute('id');
    const href = el.getAttribute('href');
    const mediaType = el.getAttribute('media-type') || '';
    if (id && href) {
      const resolved = resolveZipPath(opfPath, href);
      manifestMap.set(id, { href: resolved, mediaType });
    }
  }

  // 4. Parse spine order
  const itemrefEls = Array.from(opfDoc.querySelectorAll('spine > itemref'));
  const spineIds: string[] = [];
  for (const el of itemrefEls) {
    const idref = el.getAttribute('idref');
    if (idref) {
      spineIds.push(idref);
    }
  }

  if (spineIds.length === 0) {
    throw new Error('Invalid EPUB: No reading order (<spine>) found in package file.');
  }

  // 5. Pre-cache images as base64 data URIs for embedded HTML
  const imageMap = new Map<string, string>();
  for (const [_, item] of manifestMap.entries()) {
    if (item.mediaType.startsWith('image/')) {
      const imgFile = zip.file(item.href);
      if (imgFile) {
        try {
          const base64 = await imgFile.async('base64');
          imageMap.set(item.href, `data:${item.mediaType};base64,${base64}`);
        } catch {
          // ignore failed image decode
        }
      }
    }
  }

  // 6. Read and process each chapter in spine order
  const chapters: EpubChapter[] = [];
  let fullTextAccumulator = '';
  const bodyHtmlSnippets: string[] = [];

  let chapterIdx = 1;
  for (const idref of spineIds) {
    const item = manifestMap.get(idref);
    if (!item) continue;

    const chapterFile = zip.file(item.href);
    if (!chapterFile) continue;

    const rawHtml = await chapterFile.async('string');
    const chapterDoc = domParser.parseFromString(rawHtml, 'text/html');

    // Extract chapter title from h1, h2, or <title>
    const headerEl = chapterDoc.querySelector('h1, h2, h3, title');
    const detectedTitle = headerEl?.textContent?.trim() || `Chapter ${chapterIdx}`;

    // Resolve images inside this chapter to base64 data URIs
    const imgTags = Array.from(chapterDoc.querySelectorAll('img'));
    for (const img of imgTags) {
      const originalSrc = img.getAttribute('src');
      if (originalSrc && !originalSrc.startsWith('data:') && !originalSrc.startsWith('http')) {
        const resolvedImgPath = resolveZipPath(item.href, originalSrc);
        const dataUri = imageMap.get(resolvedImgPath);
        if (dataUri) {
          img.setAttribute('src', dataUri);
        }
      }
    }

    // Extract body content or whole document
    const bodyContent = chapterDoc.body ? chapterDoc.body.innerHTML : rawHtml;
    const cleanText = htmlToStructuredText(bodyContent);

    // Calculate real word count from extracted text
    const words = cleanText ? cleanText.trim().split(/\s+/).filter(Boolean).length : 0;

    chapters.push({
      id: idref,
      href: item.href,
      title: detectedTitle,
      htmlContent: bodyContent,
      textContent: cleanText,
      wordCount: words
    });

    if (cleanText) {
      fullTextAccumulator += `\n\n========================================\n${detectedTitle.toUpperCase()}\n========================================\n\n${cleanText}\n`;
    }

    bodyHtmlSnippets.push(`
      <section class="epub-chapter" id="chapter-${chapterIdx}">
        <div class="chapter-header">
          <span class="chapter-number">Section ${chapterIdx}</span>
          <h2 class="chapter-title">${escapeHtml(detectedTitle)}</h2>
        </div>
        <div class="chapter-body">
          ${bodyContent}
        </div>
      </section>
      <hr class="chapter-divider" />
    `);

    chapterIdx++;
  }

  const combinedText = fullTextAccumulator.trim();
  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);
  const totalChars = combinedText.length;

  // Build a complete, beautifully styled standalone HTML document
  const combinedHtml = `<!DOCTYPE html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --accent: #2563eb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --text: #f1f5f9;
        --text-muted: #94a3b8;
        --border: #334155;
        --accent: #3b82f6;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.8;
      font-size: 18px;
      margin: 0;
      padding: 0;
    }
    .epub-container {
      max-width: 760px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }
    .book-cover-header {
      text-align: center;
      padding: 60px 0 40px;
      border-bottom: 2px solid var(--border);
      margin-bottom: 40px;
    }
    .book-title {
      font-size: 2.5rem;
      line-height: 1.2;
      margin: 0 0 16px;
      font-weight: 700;
    }
    .book-author {
      font-size: 1.25rem;
      color: var(--text-muted);
      margin: 0;
      font-style: italic;
    }
    .toc {
      background: rgba(0,0,0,0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      margin: 40px 0;
    }
    .toc h3 { margin-top: 0; font-family: system-ui, sans-serif; }
    .toc ul { list-style: none; padding-left: 0; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: var(--accent); text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .epub-chapter {
      margin: 60px 0;
    }
    .chapter-header {
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    .chapter-number {
      display: block;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .chapter-title {
      font-size: 1.75rem;
      margin: 0;
    }
    .chapter-body p {
      margin: 1.25em 0;
      text-indent: 1.5em;
    }
    .chapter-body p:first-of-type {
      text-indent: 0;
    }
    .chapter-body img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 24px auto;
      border-radius: 4px;
    }
    .chapter-divider {
      border: 0;
      height: 1px;
      background: var(--border);
      margin: 60px 0;
    }
  </style>
</head>
<body>
  <div class="epub-container">
    <header class="book-cover-header">
      <h1 class="book-title">${escapeHtml(title)}</h1>
      <p class="book-author">by ${escapeHtml(author)}</p>
    </header>

    <nav class="toc">
      <h3>Table of Contents</h3>
      <ul>
        ${chapters
          .map(
            (c, i) =>
              `<li><a href="#chapter-${i + 1}">${escapeHtml(c.title)}</a></li>`
          )
          .join('\n        ')}
      </ul>
    </nav>

    ${bodyHtmlSnippets.join('\n')}
  </div>
</body>
</html>`;

  return {
    metadata,
    chapters,
    totalWordCount: totalWords,
    totalCharCount: totalChars,
    combinedText,
    combinedHtml
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
