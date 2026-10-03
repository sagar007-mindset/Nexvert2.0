/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Home, ArrowRight, FileQuestion } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  useEffect(() => {
    document.title = '404 - Page Not Found | Nexvert';

    let metaRobots = document.querySelector('meta[name="robots"]');
    const previousContent = metaRobots?.getAttribute('content') || 'index, follow';

    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, follow');

    return () => {
      metaRobots?.setAttribute('content', previousContent);
    };
  }, []);

  const popularTools = [
    { label: 'PDF Merge', path: '/pdf-merge/' },
    { label: 'JPG to PNG', path: '/jpg-to-png/' },
    { label: 'MP4 to MP3', path: '/mp4-to-mp3/' },
    { label: 'Image Compressor', path: '/image-compressor/' },
    { label: 'All Tools Directory', path: '/tools/' },
  ];

  return (
    <main
      id="not-found-page"
      className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-fadeIn"
    >
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200/60 dark:border-red-900/40 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>
        <span className="inline-block text-xs font-mono font-bold tracking-widest text-red-600 dark:text-red-400 uppercase">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          The file conversion tool or page you are looking for does not exist or may have been moved.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>Go to Homepage</span>
        </button>
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 text-left space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Or explore popular conversion tools:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {popularTools.map((tool, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(tool.path)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all text-left cursor-pointer group min-h-[44px]"
            >
              <span>{tool.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
