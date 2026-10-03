import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLIC_ROUTES, SITE_CANONICAL_DOMAIN } from '../src/config/routes.config.ts';
import { CONVERTER_TOOLS } from '../src/config/converters.config.ts';
import { SITE_LAST_UPDATED, INDEXNOW_KEY } from '../src/config/site.config.ts';
import { getPageContent } from '../src/config/page-content.ts';
import { GUIDES_DATA } from '../src/config/guides.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

function normalizeSitemapUrl(routePath) {
  if (!routePath || routePath === '/') return `${SITE_CANONICAL_DOMAIN}/`;
  const clean = routePath.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return `${SITE_CANONICAL_DOMAIN}/${clean}/`;
}

export function generateSitemap() {
  console.log('🗺️ Generating clean, single XML sitemap (direct <urlset> architecture)...');

  // Filter only legitimate public indexable routes
  const sitemapRoutes = PUBLIC_ROUTES.filter((r) => r.includeInSitemap !== false);

  // Sort routes deterministically: homepage first, then alphabetically by path
  const sortedRoutes = [...sitemapRoutes].sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });

  // Deduplicate URLs to guarantee 100% uniqueness
  const seenUrls = new Set();
  const uniqueUrls = [];

  for (const r of sortedRoutes) {
    const loc = normalizeSitemapUrl(r.path);
    if (!seenUrls.has(loc)) {
      seenUrls.add(loc);
      uniqueUrls.push(loc);
    }
  }

  // Canonical URLs only. <lastmod> is the date of the last significant content update
  // (SITE_LAST_UPDATED); changefreq/priority are ignored by Google and omitted.
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const loc of uniqueUrls) {
    xml += `  <url>
`;
    xml += `    <loc>${loc}</loc>
`;
    xml += `    <lastmod>${SITE_LAST_UPDATED}</lastmod>
`;
    xml += `  </url>
`;
  }

  xml += `</urlset>
`;

  // Write directly to public/sitemap.xml
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xml, 'utf8');
  console.log(`✅ public/sitemap.xml created successfully with ${uniqueUrls.length} canonical URLs.`);

  // If dist/ directory exists during build, sync directly to dist/sitemap.xml
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, xml, 'utf8');
    console.log(`✅ dist/sitemap.xml synchronized.`);
  }

  // Clean up any stale child sitemaps if they exist
  const staleChildSitemaps = ['sitemap-pages.xml', 'sitemap-converters.xml', 'sitemap-tools.xml'];
  for (const childFile of staleChildSitemaps) {
    const pubChild = path.join(publicDir, childFile);
    if (fs.existsSync(pubChild)) {
      fs.unlinkSync(pubChild);
      console.log(`🧹 Removed obsolete ${childFile} from public/`);
    }
    if (fs.existsSync(distDir)) {
      const distChild = path.join(distDir, childFile);
      if (fs.existsSync(distChild)) {
        fs.unlinkSync(distChild);
        console.log(`🧹 Removed obsolete ${childFile} from dist/`);
      }
    }
  }
}

/**
 * public/llms.txt — plain-text site summary for AI assistants and answer engines (GEO).
 * Generated from the tool registry so it always lists every live tool with its real URL.
 */
export function generateLlmsTxt() {
  const groups = [
    ['PDF & document tools', (t) => t.category === 'PDF & Document'],
    ['Image & photo tools', (t) => t.category === 'Image' || t.category === 'GIF' || t.category === 'Tools'],
    ['Audio tools', (t) => t.category === 'Audio'],
    ['Video tools', (t) => t.category === 'Video'],
    ['Archive & ZIP tools', (t) => t.category === 'Archive'],
    ['Compression tools', (t) => t.category === 'Compression'],
    ['Developer tools', (t) => t.category === 'Developer'],
    ['Utilities & calculators', (t) => t.category === 'Utilities'],
  ];
  const duplicates = new Set(PUBLIC_ROUTES.filter((r) => r.canonicalPath).map((r) => normalizeSitemapUrl(r.path)));
  const hubs = new Set(['pdf-tools', 'developer-tools']);
  const tools = Object.values(CONVERTER_TOOLS).filter((t) => !hubs.has(t.id) && !duplicates.has(normalizeSitemapUrl(t.route)));
  const name = (t) => t.title.replace(/\b(Free|Online)\b/g, '').replace(/\s{2,}/g, ' ').trim();

  let txt = `# Nexvert

> Nexvert (${SITE_CANONICAL_DOMAIN}) is a free online file converter with ${tools.length}+ browser-based tools for PDF, images, audio, video, archives and developer data. Files are processed on the user's own device with browser APIs and WebAssembly (ffmpeg.wasm, Tesseract OCR, pdf-lib, pdf.js) instead of being uploaded to a server. No account, no watermark, no installation.

## Key facts
- Price: free, no sign-up, no watermarks.
- Privacy: conversions run locally in the browser; file contents are not uploaded. Anonymous page-view analytics (Google Analytics) is used on the website itself.
- Platforms: any modern browser on Windows, macOS, Linux, Android and iOS.
- Limits: per-tool file size limits (typically up to 100 MB for images and PDFs, 200 MB for audio, 500 MB–1 GB for video) set by device memory, not by a paid plan.
- Formats: 50+ including PDF, DOCX, EPUB, Markdown, HTML, CSV, JSON, XML, YAML, JPG, PNG, WEBP, HEIC, GIF, BMP, SVG, MP3, WAV, OGG, M4A, MP4, WEBM, MOV, ZIP, TAR.

## Main sections
- Homepage: ${SITE_CANONICAL_DOMAIN}/
- All tools: ${SITE_CANONICAL_DOMAIN}/tools/
- PDF tools: ${SITE_CANONICAL_DOMAIN}/pdf-tools/
- Image tools: ${SITE_CANONICAL_DOMAIN}/image-tools/
- Audio tools: ${SITE_CANONICAL_DOMAIN}/audio-tools/
- Video tools: ${SITE_CANONICAL_DOMAIN}/video-tools/
- Archive tools: ${SITE_CANONICAL_DOMAIN}/archive-tools/
- Compression tools: ${SITE_CANONICAL_DOMAIN}/compression-tools/
- Developer tools: ${SITE_CANONICAL_DOMAIN}/developer-tools/
- Utilities: ${SITE_CANONICAL_DOMAIN}/utilities/
- Guides: ${SITE_CANONICAL_DOMAIN}/guides/
- Supported formats: ${SITE_CANONICAL_DOMAIN}/supported-formats/
- How files are handled: ${SITE_CANONICAL_DOMAIN}/file-security/
`;
  for (const [label, filter] of groups) {
    const list = tools.filter(filter);
    if (!list.length) continue;
    txt += `\n## ${label}\n`;
    for (const t of list) txt += `- [${name(t)}](${normalizeSitemapUrl(t.route)}): ${t.description}\n`;
  }
  txt += `\n## Discovery\n`;
  txt += `- Sitemap: ${SITE_CANONICAL_DOMAIN}/sitemap.xml\n`;
  txt += `- Full content export: ${SITE_CANONICAL_DOMAIN}/llms-full.txt\n`;
  txt += `- Markdown: every page also exists as plain Markdown at its URL + "index.md" `;
  txt += `(for example ${SITE_CANONICAL_DOMAIN}/pdf-merge/index.md). Each HTML page announces it `;
  txt += `with <link rel="alternate" type="text/markdown">.\n`;
  txt += `- Contact: support@nexvert.online\n`;

  fs.writeFileSync(path.join(publicDir, 'llms.txt'), txt, 'utf8');
  console.log(`✅ public/llms.txt generated (${tools.length} tools).`);
}

/**
 * public/llms-full.txt — the llmstxt.org "full" variant: every page's actual answer content
 * (definition, steps and FAQs) in one plain-text file.
 *
 * Why this exists alongside llms.txt: llms.txt is only a link index, so an answer engine still
 * has to crawl 200+ URLs to answer "how do I merge a PDF without uploading it". This file puts
 * the answers themselves one fetch away, which is what actually gets a site quoted.
 */
export function generateLlmsFullTxt() {
  const duplicates = new Set(PUBLIC_ROUTES.filter((r) => r.canonicalPath).map((r) => r.path));
  const routes = PUBLIC_ROUTES.filter((r) => r.includeInSitemap !== false && !duplicates.has(r.path));

  let txt = `# Nexvert — full content export\n\n`;
  txt += `> Complete text of every tool page on ${SITE_CANONICAL_DOMAIN}, for answer engines and\n`;
  txt += `> AI assistants. Nexvert is a free file converter whose tools run entirely in the\n`;
  txt += `> visitor's own browser using WebAssembly — files are never uploaded to a server.\n`;
  txt += `> No account, no watermark, no installation. Last updated: ${SITE_LAST_UPDATED}.\n\n`;
  txt += `> Canonical index: ${SITE_CANONICAL_DOMAIN}/llms.txt\n\n`;
  txt += `---\n`;

  let pages = 0;
  for (const route of routes) {
    const slug = route.path.replace(/^\/+|\/+$/g, '');

    // Guides are the long-form, most quotable content on the site, and getPageContent returns
    // null for them by design (they render their own components), so they have to be read from
    // GUIDES_DATA directly. Without this the export silently omitted every guide.
    if (slug.startsWith('guides/')) {
      const guide = GUIDES_DATA[slug.replace('guides/', '')];
      if (!guide) continue;
      txt += `\n## ${guide.h1 || guide.title}\n`;
      txt += `URL: ${normalizeSitemapUrl(route.path)}\n`;
      if (guide.date) txt += `Published: ${guide.date}\n`;
      txt += `\n`;
      if (guide.excerpt) txt += `${guide.excerpt}\n`;
      for (const section of guide.sections || []) {
        if (section.heading) txt += `\n### ${section.heading}\n`;
        for (const t of section.text || []) txt += `${t}\n`;
        for (const b of section.bullets || []) txt += `- ${b}\n`;
      }
      if (guide.faqs?.length) {
        txt += `\n### Questions\n`;
        for (const f of guide.faqs) txt += `Q: ${f.question}\nA: ${f.answer}\n\n`;
      }
      txt += `---\n`;
      pages++;
      continue;
    }

    let content;
    try {
      content = getPageContent(route.path, route.title, route.description);
    } catch {
      content = null;
    }
    if (!content) continue;

    txt += `\n## ${content.h1 || route.title}\n`;
    txt += `URL: ${normalizeSitemapUrl(route.path)}\n\n`;
    if (content.intro) txt += `${content.intro}\n`;

    if (content.steps && content.steps.length) {
      txt += `\n### Steps\n`;
      content.steps.forEach((s, i) => {
        txt += s.title ? `${i + 1}. ${s.title}: ${s.text}\n` : `${i + 1}. ${s.text}\n`;
      });
    }

    if (content.faqs && content.faqs.length) {
      txt += `\n### Questions\n`;
      for (const f of content.faqs) txt += `Q: ${f.question}\nA: ${f.answer}\n\n`;
    }

    txt += `---\n`;
    pages++;
  }

  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), txt, 'utf8');
  const kb = Math.round(Buffer.byteLength(txt, 'utf8') / 1024);
  console.log(`✅ public/llms-full.txt generated (${pages} pages, ${kb} KB).`);
}

/** IndexNow key file: https://<host>/<key>.txt must contain the key itself. */
export function writeIndexNowKey() {
  fs.writeFileSync(path.join(publicDir, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');
}

generateSitemap();
generateLlmsTxt();
generateLlmsFullTxt();
writeIndexNowKey();
