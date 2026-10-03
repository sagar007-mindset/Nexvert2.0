import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [react(), tailwindcss()],
    // The SSR bundle (dist-server/) is only used at build time to pre-render pages.
    publicDir: isSsrBuild ? false : 'public',
    build: {
      // Needed by scripts/prerender.js to map components to their built chunk files.
      manifest: !isSsrBuild,
      // The only large chunks are engines loaded on demand by a single tool (HEIC decoder,
      // pdf.js worker), never on page load, so the default 500 kB warning is noise here.
      chunkSizeWarningLimit: 3500,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'lamejs': '@breezystack/lamejs',
      },
    },
    server: {
      // HMR can be turned off via the DISABLE_HMR env var.
      // File watching can be disabled with DISABLE_HMR=true.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
