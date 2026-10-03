/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Home, ShieldCheck, Cpu, ArrowLeft, ArrowRight } from 'lucide-react';
import { getConverterConfig } from '../../config/converters.config';

interface DeveloperToolWrapperProps {
  toolId: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export default function DeveloperToolWrapper({
  toolId,
  onNavigate,
  children
}: DeveloperToolWrapperProps) {
  const config = getConverterConfig(toolId);

  const relatedTools = (config?.relatedToolIds || [])
    .map((id) => getConverterConfig(id))
    .filter(Boolean);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Main Tool Interactive Surface */}
      <div className="w-full">{children}</div>

      {/* Related Developer Tools */}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-red-500" />
              <span>Related Developer Utilities</span>
            </h2>
            <button
              onClick={() => onNavigate('/developer-tools/')}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedTools.slice(0, 4).map((rel) => (
              <div
                key={rel!.id}
                onClick={() => onNavigate(rel!.route)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-red-500/40 dark:hover:border-red-500/40 cursor-pointer transition-all hover:shadow-xs group"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                  {rel!.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {rel!.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
