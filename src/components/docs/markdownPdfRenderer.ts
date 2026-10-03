/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getPdfLib } from '../pdf/pdfCommon';
import { getMarked } from './docCommon';

export interface RenderPdfOptions {
  pageSize?: 'letter' | 'a4';
  baseFontSize?: number;
  lineSpacing?: number;
  documentTitle?: string;
  author?: string;
}

/**
 * Render Markdown or structured text into a clean vector PDF using pdf-lib.
 * Honest note: This produces basic typography layout (headings, paragraphs, code blocks, lists, page numbers).
 * It does not emulate complex graphical desktop publishing layouts.
 */
export async function renderMarkdownToPdfBytes(
  markdownText: string,
  options: RenderPdfOptions = {}
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
  const marked = await getMarked();

  const doc = await PDFDocument.create();

  // Set document metadata
  if (options.documentTitle) doc.setTitle(options.documentTitle);
  if (options.author) doc.setAuthor(options.author);
  doc.setCreator('Nexvert - Client-Side Typography Engine');

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const courier = await doc.embedFont(StandardFonts.Courier);

  // Dimensions
  const isA4 = options.pageSize === 'a4';
  const pageWidth = isA4 ? 595.28 : 612.0;
  const pageHeight = isA4 ? 841.89 : 792.0;
  const margin = 54; // 0.75 in
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = margin + 20;

  const baseSize = options.baseFontSize || 10.5;
  const lineGap = options.lineSpacing || 4;

  const tokens = marked.lexer(markdownText);

  const pages: any[] = [];
  let currentPage = doc.addPage([pageWidth, pageHeight]);
  pages.push(currentPage);
  let cursorY = pageHeight - margin;

  function ensureSpace(requiredHeight: number) {
    if (cursorY - requiredHeight < bottomMargin) {
      currentPage = doc.addPage([pageWidth, pageHeight]);
      pages.push(currentPage);
      cursorY = pageHeight - margin;
    }
  }

  function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
    const clean = text.replace(/[\r\n]+/g, ' ').trim();
    if (!clean) return [];

    const words = clean.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      let width = 0;
      try {
        width = font.widthOfTextAtSize(candidate, size);
      } catch {
        // Handle unprintable or non-ASCII characters gracefully
        width = candidate.length * (size * 0.55);
      }

      if (width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Draw each token
  for (const token of tokens) {
    if (token.type === 'space') {
      cursorY -= 6;
      continue;
    }

    if (token.type === 'hr') {
      ensureSpace(16);
      cursorY -= 8;
      currentPage.drawLine({
        start: { x: margin, y: cursorY },
        end: { x: margin + contentWidth, y: cursorY },
        thickness: 0.75,
        color: rgb(0.75, 0.8, 0.85)
      });
      cursorY -= 12;
      continue;
    }

    if (token.type === 'heading') {
      const depth = token.depth || 1;
      let headSize = baseSize + 6;
      let font = helveticaBold;
      let spaceBefore = 14;
      let spaceAfter = 6;

      if (depth === 1) {
        headSize = baseSize + 11;
        spaceBefore = 20;
        spaceAfter = 10;
      } else if (depth === 2) {
        headSize = baseSize + 7;
        spaceBefore = 16;
        spaceAfter = 8;
      } else if (depth === 3) {
        headSize = baseSize + 4;
        spaceBefore = 12;
        spaceAfter = 6;
      }

      const lines = wrapText(token.text, font, headSize, contentWidth);
      const needed = spaceBefore + lines.length * (headSize + lineGap) + spaceAfter;
      ensureSpace(needed);

      cursorY -= spaceBefore;
      for (const line of lines) {
        currentPage.drawText(line, {
          x: margin,
          y: cursorY,
          size: headSize,
          font,
          color: rgb(0.08, 0.12, 0.2)
        });
        cursorY -= headSize + lineGap;
      }
      cursorY -= spaceAfter;
      continue;
    }

    if (token.type === 'paragraph') {
      const lines = wrapText(token.text, helvetica, baseSize, contentWidth);
      const lineHeight = baseSize + lineGap;
      for (const line of lines) {
        ensureSpace(lineHeight);
        currentPage.drawText(line, {
          x: margin,
          y: cursorY,
          size: baseSize,
          font: helvetica,
          color: rgb(0.15, 0.2, 0.25)
        });
        cursorY -= lineHeight;
      }
      cursorY -= 6; // paragraph spacing
      continue;
    }

    if (token.type === 'list') {
      const items = token.items || [];
      let itemNum = 1;
      for (const item of items) {
        const bullet = token.ordered ? `${itemNum++}. ` : '• ';
        const bulletFont = token.ordered ? helvetica : helveticaBold;
        const bulletWidth = bulletFont.widthOfTextAtSize(bullet, baseSize);

        const lines = wrapText(item.text, helvetica, baseSize, contentWidth - bulletWidth - 8);
        const lineHeight = baseSize + lineGap;

        if (lines.length > 0) {
          ensureSpace(lineHeight);
          currentPage.drawText(bullet, {
            x: margin + 8,
            y: cursorY,
            size: baseSize,
            font: bulletFont,
            color: rgb(0.2, 0.25, 0.3)
          });

          currentPage.drawText(lines[0], {
            x: margin + 8 + bulletWidth + 4,
            y: cursorY,
            size: baseSize,
            font: helvetica,
            color: rgb(0.15, 0.2, 0.25)
          });
          cursorY -= lineHeight;

          for (let i = 1; i < lines.length; i++) {
            ensureSpace(lineHeight);
            currentPage.drawText(lines[i], {
              x: margin + 8 + bulletWidth + 4,
              y: cursorY,
              size: baseSize,
              font: helvetica,
              color: rgb(0.15, 0.2, 0.25)
            });
            cursorY -= lineHeight;
          }
        }
      }
      cursorY -= 6;
      continue;
    }

    if (token.type === 'code') {
      const codeSize = baseSize - 1.5;
      const codeLineHeight = codeSize + 3;
      const rawLines = token.text.split('\n');
      const boxPadding = 8;
      const neededHeight = rawLines.length * codeLineHeight + boxPadding * 2;

      ensureSpace(Math.min(neededHeight, 80));

      const boxYStart = cursorY;
      let drawnLinesHeight = 0;

      for (const codeLine of rawLines) {
        ensureSpace(codeLineHeight);
        // Truncate line if it exceeds width to avoid overlapping page margins
        let safeLine = codeLine;
        try {
          while (safeLine.length > 0 && courier.widthOfTextAtSize(safeLine, codeSize) > contentWidth - 16) {
            safeLine = safeLine.slice(0, -1);
          }
        } catch {
          safeLine = safeLine.slice(0, 80);
        }

        currentPage.drawText(safeLine, {
          x: margin + 8,
          y: cursorY - 4,
          size: codeSize,
          font: courier,
          color: rgb(0.1, 0.15, 0.2)
        });
        cursorY -= codeLineHeight;
        drawnLinesHeight += codeLineHeight;
      }
      cursorY -= 10;
      continue;
    }

    if (token.type === 'blockquote') {
      const lines = wrapText(token.text, helveticaOblique, baseSize, contentWidth - 20);
      const lineHeight = baseSize + lineGap;
      const totalH = lines.length * lineHeight;
      ensureSpace(totalH + 10);

      const topY = cursorY;
      for (const line of lines) {
        currentPage.drawText(line, {
          x: margin + 16,
          y: cursorY,
          size: baseSize,
          font: helveticaOblique,
          color: rgb(0.3, 0.35, 0.4)
        });
        cursorY -= lineHeight;
      }

      currentPage.drawLine({
        start: { x: margin + 4, y: topY + 2 },
        end: { x: margin + 4, y: cursorY + 4 },
        thickness: 2.5,
        color: rgb(0.3, 0.45, 0.8)
      });
      cursorY -= 8;
      continue;
    }

    if (token.type === 'table') {
      // Basic table support
      const headerCells = token.header ? token.header.map((c: any) => c.text || '') : [];
      const rows = token.rows ? token.rows.map((r: any) => r.map((c: any) => c.text || '')) : [];
      const allRows = [headerCells, ...rows];

      const colCount = Math.max(...allRows.map((r) => r.length), 1);
      const colWidth = contentWidth / colCount;
      const cellHeight = baseSize + 8;

      for (let rIdx = 0; rIdx < allRows.length; rIdx++) {
        const row = allRows[rIdx];
        const isHeader = rIdx === 0;
        ensureSpace(cellHeight);

        for (let cIdx = 0; cIdx < row.length; cIdx++) {
          const text = row[cIdx];
          const font = isHeader ? helveticaBold : helvetica;
          let safeText = text;
          try {
            while (safeText.length > 0 && font.widthOfTextAtSize(safeText, baseSize - 1) > colWidth - 8) {
              safeText = safeText.slice(0, -1);
            }
          } catch {
            safeText = safeText.slice(0, 15);
          }

          currentPage.drawText(safeText, {
            x: margin + cIdx * colWidth + 4,
            y: cursorY - 2,
            size: baseSize - 1,
            font,
            color: isHeader ? rgb(0.1, 0.15, 0.2) : rgb(0.2, 0.25, 0.3)
          });
        }

        // Draw horizontal line below row
        currentPage.drawLine({
          start: { x: margin, y: cursorY - cellHeight + 4 },
          end: { x: margin + contentWidth, y: cursorY - cellHeight + 4 },
          thickness: isHeader ? 1 : 0.5,
          color: rgb(0.7, 0.75, 0.8)
        });

        cursorY -= cellHeight;
      }
      cursorY -= 10;
      continue;
    }
  }

  // Stamp clean page numbers at bottom of each page
  const totalPageCount = pages.length;
  for (let i = 0; i < totalPageCount; i++) {
    const page = pages[i];
    const pageNumStr = `Page ${i + 1} of ${totalPageCount}`;
    const numWidth = helvetica.widthOfTextAtSize(pageNumStr, 9);
    page.drawText(pageNumStr, {
      x: (pageWidth - numWidth) / 2,
      y: margin / 2,
      size: 9,
      font: helvetica,
      color: rgb(0.55, 0.6, 0.65)
    });
  }

  return await doc.save();
}
