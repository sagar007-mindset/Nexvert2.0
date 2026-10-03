import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { CONVERTER_TOOLS, ConverterToolConfig } from '../config/converters.config';

interface RelatedToolsSectionProps {
  config: ConverterToolConfig;
  onNavigate: (route: string) => void;
}

export default function RelatedToolsSection({
  config,
  onNavigate,
}: RelatedToolsSectionProps) {
  if (!config) {
    return null;
  }

  // 1. Get explicit related tool objects that exist
  let relatedTools = (config.relatedToolIds || [])
    .map((id) => CONVERTER_TOOLS[id])
    .filter((t): t is ConverterToolConfig => !!t && t.id !== config.id);

  // 2. If fewer than 3, draw additional tools from the same category
  if (relatedTools.length < 3) {
    const existingIds = new Set(relatedTools.map((t) => t.id));
    existingIds.add(config.id);

    const sameCategoryTools = Object.values(CONVERTER_TOOLS)
      .filter((t) => t.category === config.category && !existingIds.has(t.id))
      .slice(0, 4 - relatedTools.length);

    relatedTools = [...relatedTools, ...sameCategoryTools];
  }

  // 3. Fallback to any general tools if category was too small
  if (relatedTools.length < 3) {
    const existingIds = new Set(relatedTools.map((t) => t.id));
    existingIds.add(config.id);

    const otherTools = Object.values(CONVERTER_TOOLS)
      .filter((t) => !existingIds.has(t.id))
      .slice(0, 4 - relatedTools.length);

    relatedTools = [...relatedTools, ...otherTools];
  }

  if (relatedTools.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pt-6 border-t border-slate-200/80 dark:border-zinc-800 text-left">
      <div className="flex items-center space-x-2">
        <Wrench className="w-4 h-4 text-red-600 dark:text-red-400" />
        <h3 className="text-base font-black text-slate-800 dark:text-white font-display uppercase tracking-wider">
          Related Conversion Utilities
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {relatedTools.map((tool) => (
          <a
            key={tool.id}
            href={tool.route}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(tool.route);
            }}
            className="group cursor-pointer bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 hover:border-red-500 dark:border-zinc-800 dark:hover:border-red-900 p-3.5 rounded-2xl flex items-center justify-between transition-all shadow-sm"
          >
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase font-mono block">
                {tool.category} Tool
              </span>
              <p className="text-xs font-black text-slate-700 dark:text-zinc-200 truncate mt-0.5">
                {tool.title.replace('Free Online ', '').replace(' Online Free', '').replace(' Free', '')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
