/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Home, ShieldCheck, ArrowLeft, Wrench } from 'lucide-react';
import { getConverterConfig } from '../../config/converters.config';
import { resolveRelatedTools, toolHref } from '../../config/tool-links';

interface UtilityToolWrapperProps {
  toolId: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export default function UtilityToolWrapper({
  toolId,
  onNavigate,
  children
}: UtilityToolWrapperProps) {
  const config = getConverterConfig(toolId);

  // Resolved through tool-links so alias tools point at their canonical page, and rendered as
  // real <a href> links: buttons and divs with onClick are invisible to search crawlers.
  const relatedTools = config ? resolveRelatedTools(config.relatedToolIds, config) : [];

  return (
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-2 py-2 sm:py-6">
      {/* Main Tool Interactive Surface */}
      <div className="w-full">{children}</div>

      {/* Related Utilities Section */}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-1.5">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Related Utilities</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {relatedTools.map((rel) => {
              if (!rel) return null;
              return (
                <a
                  key={rel.id}
                  href={toolHref(rel)}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(toolHref(rel));
                  }}
                  className="block p-3 text-left rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {rel.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {rel.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
