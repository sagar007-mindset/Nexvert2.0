import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
// Self-hosted fonts (no third-party requests; each subset downloads only when used).
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './index.css';

// After a new deploy, a tab opened earlier may request lazy-loaded chunks that no longer
// exist. Reload once to pick up the new build instead of showing a broken tool.
window.addEventListener('vite:preloadError', (event) => {
  try {
    // At most one automatic reload per 30 s, so a genuinely missing file can't cause a reload loop.
    const last = Number(sessionStorage.getItem('nexvert_chunk_reload') || 0);
    if (Date.now() - last < 30000) return;
    sessionStorage.setItem('nexvert_chunk_reload', String(Date.now()));
  } catch {
    /* storage unavailable: still reload once */
  }
  event.preventDefault();
  window.location.reload();
});

// Global Google Analytics 4 setup (loaded only when VITE_GA_MEASUREMENT_ID is present)
const gaMeasurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId && typeof gaMeasurementId === 'string' && gaMeasurementId.startsWith('G-')) {
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(..._args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaMeasurementId, { send_page_view: true });
  }
}

const rootEl = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Pages are pre-rendered from this same React tree at build time, so hydrate the existing
// markup instead of replacing it (no flash, faster first paint). Fall back to a fresh render
// if the page has no pre-rendered content.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}

// WebMCP tool registration, after hydration so it cannot interfere with it. Loaded lazily and
// only when the browser actually implements the API, so the ~190-tool catalogue it reads is kept
// out of the critical path for the ordinary visitor who will never use it.
if (typeof document !== 'undefined') {
  const hasModelContext =
    (document as unknown as { modelContext?: unknown }).modelContext ||
    (navigator as unknown as { modelContext?: unknown }).modelContext;
  if (hasModelContext) {
    import('./webmcp')
      .then((m) => m.registerWebMcpTools())
      .catch(() => {
        /* Never let an optional capability break the page. */
      });
  }
}
