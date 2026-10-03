/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nexvert_consent';

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Analytics consent bar (Google Consent Mode v2). Defaults are set in index.html:
 * denied in the EEA/UK/CH until the visitor accepts, granted elsewhere.
 */
export default function ConsentBanner({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readChoice() === null);
  }, []);

  const choose = (choice: 'granted' | 'denied') => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* storage unavailable: choice applies to this page view only */
    }
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') gtag('consent', 'update', { analytics_storage: choice });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookie consent" className="fixed bottom-3 inset-x-3 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-left">
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed flex-1">
          We use Google Analytics cookies to count visits and improve the tools. Your files are never uploaded.{' '}
          <a
            href="/cookie-policy/"
            onClick={(e) => { e.preventDefault(); onNavigate('/cookie-policy'); }}
            className="font-semibold text-red-600 dark:text-red-400 hover:underline"
          >
            Cookie policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="px-4 h-9 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="px-4 h-9 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
