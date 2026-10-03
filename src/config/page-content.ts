/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Single source for the explanatory copy shown under each tool (intro, how-to steps, FAQs).
// Used by the React app (ToolPageContent) AND by scripts/prerender.js, so crawlers that read
// the static HTML and users/Googlebot that run JavaScript see the same content.

import { CONVERSION_PAGES } from './conversions.config';
import { MASTER_UNIQUE_CONTENT, getUniqueToolContent } from './unique-tool-content';

export interface PageStep {
  title: string;
  text: string;
}

export interface PageFaq {
  question: string;
  answer: string;
}

export interface PageContent {
  h1: string;
  intro: string;
  steps: PageStep[];
  faqs: PageFaq[];
  source: 'landing' | 'unique' | 'generic';
}

export const DEFAULT_STEPS: PageStep[] = [
  { title: 'Add your file or input', text: 'Choose a supported file, drag it onto the upload area, or type/paste the data this tool works with.' },
  { title: 'Adjust the options', text: 'Pick the output format, quality, size or other settings the tool offers. Defaults work well for most files.' },
  { title: 'Process and download', text: 'Run the tool and save the result. Processing happens in your browser, so nothing is uploaded to a server.' },
];

/** Pages that carry their own long-form content (dedicated components) and must not get tool FAQs appended. */
export const NO_TOOL_CONTENT = new Set([
  '', 'about', 'contact', 'privacy', 'terms', 'disclaimer', 'cookie-policy', 'changelog',
  'supported-formats', 'file-security', 'guides',
]);

export function cleanSlug(path: string): string {
  return String(path || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
}

export function getPageContent(path: string, routeTitle: string, routeDescription: string): PageContent | null {
  const slug = cleanSlug(path);
  if (NO_TOOL_CONTENT.has(slug) || slug.startsWith('guides/')) return null;

  const landing = CONVERSION_PAGES[slug];
  if (landing) {
    return {
      h1: landing.h1,
      intro: landing.introParagraph,
      steps: landing.steps.map((text, i) => ({ title: `Step ${i + 1}`, text })),
      faqs: landing.faqs,
      source: 'landing',
    };
  }

  const unique = MASTER_UNIQUE_CONTENT[slug];
  const data = unique || getUniqueToolContent(slug, routeTitle, routeDescription);
  return {
    h1: data.h1,
    intro: data.introParagraph,
    steps: data.steps && data.steps.length ? data.steps : DEFAULT_STEPS,
    faqs: data.faqs || [],
    source: unique ? 'unique' : 'generic',
  };
}

export { toolNameFromTitle } from './tool-name';
