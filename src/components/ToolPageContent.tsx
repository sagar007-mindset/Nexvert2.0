/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, ListOrdered, Info } from 'lucide-react';
import type { PageContent } from '../config/page-content';
import { SITE_LAST_UPDATED } from '../config/site.config';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Fixed formatting (not toLocaleDateString) so server and browser render identical text.
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

interface ToolPageContentProps {
  content: PageContent;
  toolName: string;
}

/**
 * Explanatory copy rendered under a tool: a direct answer ("What is X?"), numbered steps and
 * FAQs. The same text is written into the pre-rendered HTML by scripts/prerender.js.
 */
export default function ToolPageContent({ content, toolName }: ToolPageContentProps) {
  return (
    <section className="w-full max-w-3xl mx-auto space-y-8 text-left pt-8 border-t border-slate-200 dark:border-zinc-800" aria-label={`About ${toolName}`}>
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">
          <Info className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
          What is {toolName}?
        </h2>
        <p className="text-sm md:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">{content.intro}</p>
      </div>

      {content.steps.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">
            <ListOrdered className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
            How to use {toolName}
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.steps.map((step, idx) => (
              <li key={idx} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 font-bold flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {content.faqs.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">
            <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {content.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{faq.question}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-zinc-500">
        Last updated: <time dateTime={SITE_LAST_UPDATED}>{formatDate(SITE_LAST_UPDATED)}</time>
      </p>
    </section>
  );
}
