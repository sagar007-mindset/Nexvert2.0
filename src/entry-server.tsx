/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Build-time renderer used by scripts/prerender.js. prerenderToNodeStream waits for every
// lazy() tool component to load, so the HTML contains the complete page. The browser then
// hydrates this exact markup, so there is no flash of different content on first load.

import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import App from './App';
import { getUsedModules, clearUsedModules } from './utils/lazyTracked';

export interface RenderResult {
  html: string;
  /** Lazy module ids used by this route, e.g. './components/pdf/PdfMergeTool'. */
  modules: string[];
}

export async function render(url: string): Promise<RenderResult> {
  // First pass loads every lazy() component this route needs. React caches resolved lazy
  // modules, so the second pass renders without suspending and all content is inline —
  // not streamed into hidden <div>s, which crawlers that don't run JavaScript would miss.
  clearUsedModules();
  await renderOnce(url); // warm-up: resolves this route’s lazy modules and records them
  const modules = getUsedModules();
  const html = await renderOnce(url);
  if (html.includes('<!--$?-->')) throw new Error(`Route ${url} still suspended after warm-up render`);
  return { html, modules };
}

async function renderOnce(url: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App initialPath={url} />
    </StrictMode>,
    // Never outline Suspense boundaries into hidden streamed segments: this is a static page.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER }
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}
