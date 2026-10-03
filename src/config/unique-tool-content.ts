/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UNIQUE_IMAGES_CONTENT, ToolSEOData } from './unique-content-images';
import { UNIQUE_MEDIA_CONTENT } from './unique-content-media';
import { UNIQUE_DOCS_CONTENT } from './unique-content-docs';
import { UNIQUE_DEV_CONTENT } from './unique-content-dev';
import { UNIQUE_UTILS_CONTENT } from './unique-content-utils';
import { UNIQUE_BATCH1_CONTENT } from './unique-content-batch1';
import { UNIQUE_BATCH2_CONTENT } from './unique-content-batch2';
import { UNIQUE_BATCH3_CONTENT } from './unique-content-batch3';
import { UNIQUE_HUBS_CONTENT } from './unique-content-hubs';
import { UNIQUE_EXTRA_DEV_CONTENT } from './unique-content-extra-dev';
import { UNIQUE_EXTRA_UTILS_CONTENT } from './unique-content-extra-utils';

export type { ToolSEOData };

export const MASTER_UNIQUE_CONTENT: Record<string, ToolSEOData> = {
  ...UNIQUE_IMAGES_CONTENT,
  ...UNIQUE_MEDIA_CONTENT,
  ...UNIQUE_DOCS_CONTENT,
  ...UNIQUE_DEV_CONTENT,
  ...UNIQUE_UTILS_CONTENT,
  ...UNIQUE_BATCH1_CONTENT,
  ...UNIQUE_BATCH2_CONTENT,
  ...UNIQUE_BATCH3_CONTENT,
  ...UNIQUE_HUBS_CONTENT,
  ...UNIQUE_EXTRA_DEV_CONTENT,
  ...UNIQUE_EXTRA_UTILS_CONTENT
};

/**
 * Retrieves or generates genuinely unique, format-specific SEO content for any tool route.
 * Eliminates duplicate templates and provides specific technical context.
 */
export function getUniqueToolContent(routeSlug: string, routeTitle: string, routeDescription: string): ToolSEOData {
  const clean = routeSlug.replace(/^\/+|\/+$/g, '');

  if (MASTER_UNIQUE_CONTENT[clean]) {
    return MASTER_UNIQUE_CONTENT[clean];
  }

  // Format pair detection (e.g., pdf-to-excel, flac-to-mp3, bmp-to-png, etc.)
  const pairMatch = clean.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  if (pairMatch) {
    const from = pairMatch[1].toUpperCase();
    const to = pairMatch[2].toUpperCase();

    return {
      h1: `Convert ${from} to ${to} Online (Fast & In-Browser)`,
      description: `Transform ${from} files into ${to} format directly in a modern browser. The tool page explains its supported inputs, outputs, and processing behavior.`,
      introParagraph: `Convert ${from} to ${to} on desktop or mobile using the controls on this page. Supported files and processing behavior depend on the specific converter implementation.`,
      faqs: [
        {
          question: `How does in-browser ${from} to ${to} conversion protect my privacy?`,
          answer: `For converters that are labeled as in-browser, file parsing and conversion are performed locally using browser APIs or WebAssembly. Check the tool interface and File Security page for the current processing model.`
        },
        {
          question: `What are the key technical differences between ${from} and ${to}?`,
          answer: `The conversion adapts the container syntax, compression algorithms, and metadata chunks of ${from} into the exact binary specification expected by ${to} viewers and editors.`
        },
        {
          question: `Do I need to install plugins or software to convert ${from} to ${to}?`,
          answer: `The converter is designed to run in a modern web browser without a separate desktop application. Exact browser requirements depend on the specific tool.`
        }
      ]
    };
  }

  // Fallback for named standalone tools (e.g. calculators, generators)
  const cleanTitle = routeTitle.split('–')[0].split('|')[0].trim();
  return {
    h1: cleanTitle,
    description: routeDescription,
    introParagraph: `${cleanTitle} is a browser-based utility from Nexvert. Use the controls on the page to work with supported inputs and outputs without installing a separate desktop application.`,
    faqs: [
      {
        question: `How does ${cleanTitle} operate entirely in my web browser?`,
        answer: `This tool utilizes client-side web standards, including the Web Audio API, HTML5 Canvas, and modern ECMAScript engines, executing all logic directly on your local device CPU.`
      },
      {
        question: `Does ${cleanTitle} require an account or separate software?`,
        answer: `Nexvert tools are designed for direct browser use. Account requirements, file limits, and browser requirements can vary by tool and are shown on the relevant page.`
      },
      {
        question: `Does ${cleanTitle} save or track any of my files or submitted data?`,
        answer: `Check the tool's privacy notice and the File Security page for the current processing model. Tools labeled as client-side process supported inputs locally in the browser.`
      }
    ]
  };
}
