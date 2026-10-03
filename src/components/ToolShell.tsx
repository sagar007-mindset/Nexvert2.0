/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { ChevronRight, Home, ShieldCheck, Sparkles, BadgeCheck } from 'lucide-react';

export interface ToolShellProps {
  h1: string;
  description: string;
  hub?: { name: string; path: string };
  onNavigate: (path: string) => void;
  children: ReactNode;
}

/**
 * Shared frame for every tool page: breadcrumb, category badge, H1, one-line description and
 * trust notes. Tools render only their working UI inside it, so every page looks the same.
 */
export default function ToolShell({ h1, description, hub, onNavigate, children }: ToolShellProps) {
  const link = (path: string, label: ReactNode, className: string) => (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(path);
      }}
      className={className}
    >
      {label}
    </a>
  );

  return (
    <div className="w-full">
      <nav aria-label="Breadcrumb" className="w-full max-w-5xl mx-auto mb-4 sm:mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
          <li>{link('/', <><Home className="w-3.5 h-3.5" aria-hidden="true" /><span>Home</span></>, 'inline-flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400')}</li>
          {hub && (
            <>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
              <li>{link(hub.path, hub.name, 'hover:text-red-600 dark:hover:text-red-400')}</li>
            </>
          )}
          <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
          <li aria-current="page" className="font-semibold text-slate-700 dark:text-zinc-200 truncate max-w-[60vw]">{h1}</li>
        </ol>
      </nav>

      <header className="w-full max-w-3xl mx-auto text-center space-y-3 mb-6 sm:mb-8">
        {hub && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {hub.name}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-tight">
          {h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">{description}</p>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <li className="inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />100% free</li>
          <li className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />Files stay on your device</li>
          <li className="inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />No sign-up, no watermark</li>
        </ul>
      </header>

      <div className="w-full">{children}</div>
    </div>
  );
}
