import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { PUBLIC_ROUTES } from '../src/config/routes.config.ts';
import { CONVERSION_PAGES } from '../src/config/conversions.config.ts';
import { GUIDES_DATA } from '../src/config/guides.config.ts';
import { CONVERTER_TOOLS } from '../src/config/converters.config.ts';
import { MASTER_UNIQUE_CONTENT, getUniqueToolContent } from '../src/config/unique-tool-content.ts';
import { PRIMARY_NAV_CATEGORIES, FOOTER_LINKS } from '../src/config/navigation.config.ts';
import { isImageLandingPage } from '../src/config/conversions.config.ts';
import { getPageContent, toolNameFromTitle, cleanSlug, NO_TOOL_CONTENT } from '../src/config/page-content.ts';
import { buildPageSchemas, canonicalUrl } from '../src/config/structured-data.ts';
import { getPageH1 } from '../src/config/page-heading.ts';
import { HOME_TITLE, HOME_DESCRIPTION, HOME_H1, HOME_INTRO, HOME_ANSWER, HOME_FAQS } from '../src/config/home-content.ts';
import { SOCIAL_LINKS } from '../src/config/site.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const sitemapPublicPath = path.join(rootDir, 'public', 'sitemap.xml');
const robotsPublicPath = path.join(rootDir, 'public', 'robots.txt');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that all links in the shared navigation and footer configs
 * resolve to actual registered routes in PUBLIC_ROUTES.
 */
function normalizeRouteKey(rawPath) {
  if (!rawPath || rawPath === '/') return '/';
  const clean = String(rawPath).split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/` : '/';
}

function validateNavigationLinks() {
  console.log('🔍 Validating navigation, tool registry, related links, and footer...');
  const publicPathSet = new Set(PUBLIC_ROUTES.map((r) => normalizeRouteKey(r.path)));
  const converterRouteSet = new Set(Object.values(CONVERTER_TOOLS).map((t) => normalizeRouteKey(t.id === 'image-converter' ? '/' : t.route)));
  const issues = [];

  for (const cat of PRIMARY_NAV_CATEGORIES) {
    const hub = normalizeRouteKey(cat.hubRoute);
    if (!publicPathSet.has(hub)) issues.push(`Navbar category "${cat.label}" hubRoute "${cat.hubRoute}" is missing from PUBLIC_ROUTES.`);
    if (cat.sections) {
      for (const sec of cat.sections) {
        for (const item of sec.items) {
          const route = normalizeRouteKey(item.route);
          if (!publicPathSet.has(route)) issues.push(`Navbar item "${item.label}" route "${item.route}" is missing from PUBLIC_ROUTES.`);
        }
      }
    }
  }

  for (const link of FOOTER_LINKS) {
    if (!publicPathSet.has(normalizeRouteKey(link.route))) {
      issues.push(`Footer link "${link.label}" route "${link.route}" is missing from PUBLIC_ROUTES.`);
    }
  }

  for (const tool of Object.values(CONVERTER_TOOLS)) {
    const route = normalizeRouteKey(tool.id === 'image-converter' ? '/' : tool.route);
    if (!publicPathSet.has(route)) issues.push(`Converter "${tool.id}" route "${tool.route}" is missing from PUBLIC_ROUTES.`);
    for (const relatedId of tool.relatedToolIds || []) {
      if (!CONVERTER_TOOLS[relatedId]) issues.push(`Converter "${tool.id}" has invalid relatedToolId "${relatedId}".`);
    }
  }

  // Navbar.tsx historically held its own mode list. Audit that real UI source too,
  // so stale dropdown entries cannot bypass the central route validation.
  const navbarSource = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Navbar.tsx'), 'utf8');
  const navbarModes = [...navbarSource.matchAll(/mode:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const publicRouteKeys = new Set([...publicPathSet].map((value) => value.replace(/^\//, '').replace(/\/$/, '')));
  for (const mode of [...new Set(navbarModes)]) {
    if (!CONVERTER_TOOLS[mode] && !publicRouteKeys.has(mode)) {
      issues.push(`Navbar.tsx contains stale/unknown mode "${mode}".`);
    }
    const config = CONVERTER_TOOLS[mode];
    if (config && !converterRouteSet.has(normalizeRouteKey(config.route))) {
      issues.push(`Navbar mode "${mode}" does not resolve to a converter route.`);
    }
  }

  if (issues.length) {
    console.error(`❌ Navigation/registry validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`   - ${issue}`);
    throw new Error('Build stopped because navigation or tool registry contains broken links.');
  }

  console.log('✅ Navigation, tool registry, related links, and footer verified.');
}

function validateRouteMetadata() {
  console.log('🔍 Validating canonical URL, title, description, and route uniqueness...');
  const titleMap = new Map();
  const canonicalMap = new Map();
  const issues = [];

  for (const route of PUBLIC_ROUTES) {
    const canonical = normalizeRouteKey(route.path);
    if (!route.title?.trim()) issues.push(`Missing title for ${route.path}`);
    if (!route.description?.trim()) issues.push(`Missing description for ${route.path}`);
    if (titleMap.has(route.title)) issues.push(`Duplicate title "${route.title}" on ${titleMap.get(route.title)} and ${route.path}`);
    else titleMap.set(route.title, route.path);
    if (canonicalMap.has(canonical)) issues.push(`Duplicate canonical route for ${route.path} and ${canonicalMap.get(canonical)}`);
    else canonicalMap.set(canonical, route.path);

    if (route.title && (route.title.length < 25 || route.title.length > 75)) {
      console.warn(`⚠️ Title length advisory (${route.title.length} chars): ${route.path}`);
    }
    if (route.description && (route.description.length < 60 || route.description.length > 180)) {
      console.warn(`⚠️ Description length advisory (${route.description.length} chars): ${route.path}`);
    }
  }

  if (issues.length) {
    console.error(`❌ Route metadata validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`   - ${issue}`);
    throw new Error('Build stopped because route metadata contains critical errors.');
  }
  console.log(`✅ ${PUBLIC_ROUTES.length} public routes have unique titles and canonical paths.`);
}

/**
 * Audits which pages have dedicated unique content vs. lacking unique content.
 * Generates build-report.md and prints warnings without failing the build.
 */
function auditUniqueContent() {
  const missing = [];
  const existing = [];

  for (const route of PUBLIC_ROUTES) {
    const clean = route.path.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    if (route.canonicalPath) continue; // duplicate URL that canonicalizes to another page
    if (!clean) {
      existing.push({ path: route.path, title: route.title, source: 'homepage' });
      continue;
    }
    if (MASTER_UNIQUE_CONTENT[clean]) {
      existing.push({ path: route.path, title: route.title, source: 'MASTER_UNIQUE_CONTENT' });
    } else if (CONVERSION_PAGES[clean]) {
      existing.push({ path: route.path, title: route.title, source: 'CONVERSION_PAGES' });
    } else if (clean.startsWith('guides/') && GUIDES_DATA[clean.replace('guides/', '')]) {
      existing.push({ path: route.path, title: route.title, source: 'GUIDES_DATA' });
    } else if (NO_TOOL_CONTENT.has(clean)) {
      existing.push({ path: route.path, title: route.title, source: 'dedicated page component' });
    } else {
      missing.push({ path: route.path, title: route.title, category: route.category, sitemapGroup: route.sitemapGroup });
    }
  }

  console.log('\n==================================================');
  console.log('📊 CONTENT AUDIT REPORT');
  console.log(`Total Routes: ${PUBLIC_ROUTES.length}`);
  console.log(`Routes with dedicated unique content: ${existing.length}`);
  console.log(`Routes lacking unique content: ${missing.length}`);
  console.log('==================================================\n');

  if (missing.length > 0) {
    console.warn(`⚠️ WARNING: The following ${missing.length} routes have no matching entry in unique-tool-content.ts:`);
    for (const m of missing) {
      console.warn(`   - [${m.category}] ${m.path} (${m.title})`);
    }
    console.warn(`\n⚠️ Total routes lacking unique content: ${missing.length} / ${PUBLIC_ROUTES.length}\n`);
  }

  // Generate build-report.md
  let reportMd = `# Nexvert Build & Content Audit Report\n\n`;
  reportMd += `**Generated:** ${new Date().toISOString()}\n\n`;
  reportMd += `## Summary\n\n`;
  reportMd += `| Metric | Count | Percentage |\n`;
  reportMd += `| :--- | :--- | :--- |\n`;
  reportMd += `| **Total Public Routes** | ${PUBLIC_ROUTES.length} | 100% |\n`;
  reportMd += `| **Routes with Dedicated Unique Content** | ${existing.length} | ${((existing.length / PUBLIC_ROUTES.length) * 100).toFixed(1)}% |\n`;
  reportMd += `| **Routes Lacking Unique Content (Warning)** | ${missing.length} | ${((missing.length / PUBLIC_ROUTES.length) * 100).toFixed(1)}% |\n\n`;

  // Category breakdown
  const catBreakdown = {};
  for (const m of missing) {
    catBreakdown[m.category] = (catBreakdown[m.category] || 0) + 1;
  }

  reportMd += `## Breakdown of Missing Content by Category\n\n`;
  reportMd += `| Category | Routes Lacking Unique Content |\n`;
  reportMd += `| :--- | :--- |\n`;
  for (const [cat, count] of Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])) {
    reportMd += `| \`${cat}\` | ${count} |\n`;
  }
  reportMd += `\n`;

  reportMd += `## Full List of Routes Lacking Unique Content (${missing.length})\n\n`;
  reportMd += `| # | Path | Category | Page Title |\n`;
  reportMd += `| :--- | :--- | :--- | :--- |\n`;
  missing.forEach((m, idx) => {
    reportMd += `| ${idx + 1} | \`${m.path}\` | \`${m.category}\` | ${m.title} |\n`;
  });
  reportMd += `\n`;

  const reportPath = path.join(rootDir, 'build-report.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`📝 Content audit report saved to build-report.md\n`);
}

// ---------------------------------------------------------------------------
// Static HTML generation. Uses the same content + JSON-LD modules as the React app
// (src/config/page-content.ts, structured-data.ts, home-content.ts) so the first HTML
// response matches what users and Googlebot see after JavaScript runs.
// ---------------------------------------------------------------------------

const CATEGORY_GROUPS = [
  { name: 'PDF & Document Tools', hub: '/pdf-tools/', filter: (t) => t.category === 'PDF & Document' },
  { name: 'Image & Photo Tools', hub: '/image-tools/', filter: (t) => t.category === 'Image' || t.category === 'GIF' || t.category === 'Tools' },
  { name: 'Audio Tools', hub: '/audio-tools/', filter: (t) => t.category === 'Audio' },
  { name: 'Video Tools', hub: '/video-tools/', filter: (t) => t.category === 'Video' },
  { name: 'Archive & ZIP Tools', hub: '/archive-tools/', filter: (t) => t.category === 'Archive' },
  { name: 'Compression Tools', hub: '/compression-tools/', filter: (t) => t.category === 'Compression' },
  { name: 'Developer Tools', hub: '/developer-tools/', filter: (t) => t.category === 'Developer' },
  { name: 'Utilities & Calculators', hub: '/utilities/', filter: (t) => t.category === 'Utilities' },
];
const HUB_FILTERS = {
  'pdf-tools': CATEGORY_GROUPS[0], 'image-tools': CATEGORY_GROUPS[1], 'audio-tools': CATEGORY_GROUPS[2],
  'video-tools': CATEGORY_GROUPS[3], 'archive-tools': CATEGORY_GROUPS[4], 'compression-tools': CATEGORY_GROUPS[5],
  'developer-tools': CATEGORY_GROUPS[6], utilities: CATEGORY_GROUPS[7],
};
const HUB_IDS = new Set(['pdf-tools', 'developer-tools']); // hubs that are also registered as "tools"

const shortTitle = (title) => String(title).split(/\s[—–|]\s/)[0].trim();
const publicTools = () => Object.values(CONVERTER_TOOLS).filter((t) => t.route !== '/' && !HUB_IDS.has(t.id));

function toolCard(tool) {
  return `<a href="${tool.route}" class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500 transition-colors block space-y-1.5 group">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600">${escapeHtml(shortTitle(tool.title))}</h3>
              <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">${escapeHtml(tool.description)}</p>
            </a>`;
}

function toolGrid(tools) {
  return `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">${tools.map(toolCard).join('')}</div>`;
}

function sectionH2(text) {
  return `<h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">${escapeHtml(text)}</h2>`;
}

function faqSection(faqs) {
  if (!faqs || !faqs.length) return '';
  const items = faqs.map((f) => `<div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <h3 class="font-bold text-slate-900 dark:text-white text-sm md:text-base">${escapeHtml(f.question)}</h3>
              <p class="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">${escapeHtml(f.answer)}</p>
            </div>`).join('');
  return `
        <section class="space-y-4">
          ${sectionH2('Frequently asked questions')}
          <div class="space-y-3">${items}</div>
        </section>`;
}

function contentSections(content, toolName) {
  if (!content) return '';
  const steps = content.steps.length ? `
        <section class="space-y-4">
          ${sectionH2(`How to use ${toolName}`)}
          <ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${content.steps.map((step, i) => `<li class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <span class="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm">${i + 1}</span>
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">${escapeHtml(step.title)}</h3>
              <p class="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">${escapeHtml(step.text)}</p>
            </li>`).join('')}
          </ol>
        </section>` : '';
  return `
        <section class="space-y-2">
          ${sectionH2(`What is ${toolName}?`)}
          <p class="text-sm md:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(content.intro)}</p>
        </section>
        ${steps}
        ${faqSection(content.faqs)}`;
}

/**
 * Plain-Markdown twin of a page, written to dist/<route>/index.md.
 *
 * Why static files rather than `Accept: text/markdown` content negotiation: measured server-log
 * studies (dri.es, GoodBarber, Checkly) agree that the Accept header is sent almost exclusively
 * by *coding* agents (Claude Code, Cursor, OpenCode), while GPTBot and ClaudeBot ignore the
 * header entirely but *do* follow .md links — GPTBot took .md for ~35% of its fetches in one
 * study. Netlify cannot branch on Accept in a redirect, so negotiation would need an edge
 * function running in front of every request, for the audience least likely to use it.
 * Static files cost nothing at runtime and reach the crawlers that actually fetch Markdown.
 */
function markdownForRoute(route) {
  const clean = cleanSlug(route.path);
  const url = canonicalUrl(route.path);
  const info = describeRoute(route);
  const guide = info.guide;
  const content = info.content;

  const lines = [];
  lines.push('---');
  lines.push(`title: ${JSON.stringify(route.title)}`);
  lines.push(`description: ${JSON.stringify(route.description)}`);
  lines.push(`url: ${url}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${info.h1 || route.title}`);
  lines.push('');
  if (info.lead) lines.push(info.lead, '');

  if (guide) {
    for (const section of guide.sections || []) {
      if (section.heading) lines.push(`## ${section.heading}`, '');
      for (const t of section.text || []) lines.push(t, '');
      for (const b of section.bullets || []) lines.push(`- ${b}`);
      if (section.bullets?.length) lines.push('');
    }
    for (const f of guide.faqs || []) lines.push(`### ${f.question}`, '', f.answer, '');
  } else if (content) {
    if (content.intro) lines.push(`## What is ${info.toolName}?`, '', content.intro, '');
    if (content.steps?.length) {
      lines.push(`## How to use ${info.toolName}`, '');
      content.steps.forEach((s, i) => {
        // A generic "Step 2" title is noise next to the list number that already says 2.
        const title = s.title && !/^step\s*\d+$/i.test(s.title.trim()) ? s.title : null;
        lines.push(title ? `${i + 1}. **${title}** — ${s.text}` : `${i + 1}. ${s.text}`);
      });
      lines.push('');
    }
    if (content.faqs?.length) {
      lines.push('## Frequently asked questions', '');
      for (const f of content.faqs) lines.push(`### ${f.question}`, '', f.answer, '');
    }
  }

  lines.push('---', '', `Source: ${url}`, `HTML version: ${url}`, '');
  return lines.join('\n');
}

/** Everything needed to render one route, mirroring what App.tsx passes to SEOHead. */
function describeRoute(route) {
  const clean = cleanSlug(route.path);
  const tool = CONVERTER_TOOLS[clean];
  const landing = CONVERSION_PAGES[clean];
  const guide = clean.startsWith('guides/') ? GUIDES_DATA[clean.replace('guides/', '')] : null;

  if (!clean) {
    return {
      kind: 'home', h1: HOME_H1, lead: HOME_INTRO,
      schema: { path: '/', title: HOME_TITLE, description: HOME_DESCRIPTION, faqs: HOME_FAQS },
    };
  }
  if (landing && isImageLandingPage(landing)) {
    const from = landing.fromFormat.toUpperCase();
    const to = landing.toFormat.toUpperCase();
    const content = getPageContent(route.path, route.title, route.description);
    return {
      kind: 'tool', h1: landing.h1, lead: route.description, content,
      toolName: toolNameFromTitle(tool?.title || route.title), tool,
      schema: {
        path: route.path, title: landing.title, description: landing.metaDescription, h1: landing.h1,
        faqs: landing.faqs, steps: landing.steps, toolName: `${from} to ${to} converter`,
        category: tool?.category || 'Image', isTool: true,
      },
    };
  }
  const content = getPageContent(route.path, route.title, route.description);
  const isHub = Boolean(HUB_FILTERS[clean]) || clean === 'tools';
  let kind = 'page';
  if (guide) kind = 'guide';
  else if (isHub) kind = 'hub';
  else if (tool) kind = 'tool';
  return {
    kind,
    h1: guide ? guide.h1 : tool && !HUB_IDS.has(clean) ? tool.title : shortTitle(route.title),
    lead: guide ? guide.excerpt : route.description,
    guide, tool, content,
    toolName: toolNameFromTitle(tool?.title || route.title),
    schema: {
      path: route.path, title: route.title, description: route.description,
      faqs: content?.faqs, steps: content?.steps, // titled steps -> HowToStep.name
      toolName: toolNameFromTitle(route.title), category: tool?.category, isTool: Boolean(tool),
    },
  };
}

function bodyFor(route, info) {
  const clean = cleanSlug(route.path);
  let main = '';

  if (info.kind === 'home') {
    const popular = Object.values(CONVERSION_PAGES).map((p) => `<a href="/${p.slug}/" class="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-red-500">${escapeHtml(p.h1.replace(/^(Free|Convert)\s+/i, '').replace(/\s+Free$/i, ''))}</a>`).join('');
    const groups = CATEGORY_GROUPS.map((g) => `
        <section class="space-y-3">
          <h2 class="text-xl font-black text-slate-900 dark:text-white font-display"><a href="${g.hub}" class="hover:text-red-600">${escapeHtml(g.name)}</a></h2>
          ${toolGrid(publicTools().filter(g.filter))}
        </section>`).join('');
    main = `
        <section class="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-2">
          ${sectionH2('What is Nexvert?')}
          <p class="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(HOME_ANSWER)}</p>
        </section>
        <section class="space-y-3">
          ${sectionH2('Popular conversions')}
          <div class="flex flex-wrap gap-2">${popular}</div>
        </section>
        ${groups}
        ${faqSection(HOME_FAQS)}`;
  } else if (info.kind === 'hub') {
    const groups = clean === 'tools' ? CATEGORY_GROUPS : [HUB_FILTERS[clean]];
    main = groups.map((g) => `
        <section class="space-y-3">
          ${sectionH2(`${g.name} (${publicTools().filter(g.filter).length})`)}
          ${toolGrid(publicTools().filter(g.filter))}
        </section>`).join('') + contentSections(info.content, info.toolName);
  } else if (info.kind === 'guide') {
    main = (info.guide.sections || []).map((section) => `
        <section class="space-y-3">
          ${section.heading ? sectionH2(section.heading) : ''}
          ${section.text.map((t) => `<p class="text-sm md:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(t)}</p>`).join('')}
          ${section.bullets?.length ? `<ul class="list-disc pl-5 space-y-2 text-sm md:text-base text-slate-700 dark:text-zinc-300">${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
        </section>`).join('') + faqSection(info.guide.faqs);
  } else if (info.kind === 'tool') {
    main = `
        <noscript><p class="p-4 rounded-xl bg-amber-50 text-amber-900 text-sm">This tool runs in your browser and needs JavaScript enabled.</p></noscript>
        ${contentSections(info.content, info.toolName)}`;
    const tool = info.tool;
    if (tool) {
      let related = (tool.relatedToolIds || []).map((id) => CONVERTER_TOOLS[id]).filter((t) => t && t.route !== tool.route);
      if (related.length < 4) {
        related = [...related, ...publicTools().filter((t) => t.category === tool.category && t.id !== tool.id && !related.includes(t))].slice(0, 6);
      }
      main += `
        <section class="space-y-3 pt-6 border-t border-slate-200 dark:border-zinc-800">
          ${sectionH2('Related tools')}
          ${toolGrid(related)}
        </section>`;
    }
  }

  const nav = PRIMARY_NAV_CATEGORIES.map((c) => `<a href="${c.hubRoute}" class="hover:text-red-600">${escapeHtml(c.label)}</a>`).join('\n            ');
  const footer = FOOTER_LINKS.map((l) => `<a href="${l.route}" class="hover:underline">${escapeHtml(l.label)}</a>`).join(' <span>&bull;</span> ');

  return `
    <div class="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 font-sans flex flex-col antialiased">
      <header class="w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-black text-lg tracking-tight text-slate-900 dark:text-white">
            <img src="/favicon-48x48.png" alt="" width="32" height="32" />
            <span>Nexvert</span>
          </a>
          <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-zinc-300" aria-label="Main">
            ${nav}
          </nav>
        </div>
      </header>
      <main class="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        <div class="text-center space-y-4 max-w-3xl mx-auto">
          <h1 class="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-display">${escapeHtml(info.h1)}</h1>
          <p class="text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed">${escapeHtml(info.lead)}</p>
        </div>
        ${main}
      </main>
      <footer class="w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-zinc-500 space-y-3">
        <div class="flex flex-wrap justify-center gap-3 font-semibold">${footer}</div>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="${SOCIAL_LINKS.x.url}" rel="me noopener">${SOCIAL_LINKS.x.label}</a>
          <a href="${SOCIAL_LINKS.threads.url}" rel="me noopener">${SOCIAL_LINKS.threads.label}</a>
          <a href="${SOCIAL_LINKS.github.url}" rel="me noopener">${SOCIAL_LINKS.github.label}</a>
        </div>
        <p>&copy; ${new Date().getFullYear()} Nexvert. All rights reserved.</p>
      </footer>
    </div>`;
}

function replaceMeta(html, selector, attrs) {
  const re = new RegExp(`<meta\\s+${selector}[^>]*>`, 'i');
  return html.replace(re, `<meta ${attrs} />`);
}

function withHead(baseTemplate, { title, description, canonical, robots, schemas, ogType }) {
  let html = baseTemplate;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name="description"', `name="description" content="${escapeHtml(description)}"`);
  html = replaceMeta(html, 'name="robots"', `name="robots" content="${robots}"`);
  html = replaceMeta(html, 'property="og:title"', `property="og:title" content="${escapeHtml(title)}"`);
  html = replaceMeta(html, 'property="og:description"', `property="og:description" content="${escapeHtml(description)}"`);
  html = replaceMeta(html, 'property="og:type"', `property="og:type" content="${ogType || 'website'}"`);
  html = replaceMeta(html, 'name="twitter:title"', `name="twitter:title" content="${escapeHtml(title)}"`);
  html = replaceMeta(html, 'name="twitter:description"', `name="twitter:description" content="${escapeHtml(description)}"`);
  if (canonical) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${canonical}" />\n` +
        // How agents discover the Markdown twin written beside this file; the same mechanism
        // browsers use for RSS. Crawlers that fetch .md follow links, not Accept headers.
        `    <link rel="alternate" type="text/markdown" href="${canonical}index.md" />`
    );
    html = replaceMeta(html, 'property="og:url"', `property="og:url" content="${canonical}"`);
  } else {
    html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/i, '');
    html = html.replace(/\s*<meta\s+property="og:url"[^>]*>/i, '');
  }
  html = html.replace(/\s*<script type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');
  if (schemas) {
    // Escape "<" so JSON text can never close the script element early.
    const json = JSON.stringify(schemas).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script type="application/ld+json" id="nexvert-seo-jsonld">${json}</script>\n  </head>`);
  }
  return html;
}

/**
 * Maps lazy module ids (e.g. './components/pdf/PdfMergeTool') to the built chunk files, so the
 * browser can download them before hydration instead of flashing a spinner.
 */
function loadClientManifest() {
  const file = path.join(distDir, '.vite', 'manifest.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

function modulePreloadTags(manifest, modules) {
  if (!manifest || !modules?.length) return '';
  const files = new Set();
  const addEntry = (key, depth = 0) => {
    const entry = manifest[key];
    if (!entry || depth > 3) return;
    files.add(entry.file);
    for (const imp of entry.imports || []) addEntry(imp, depth + 1);
  };
  for (const id of modules) {
    const base = id.replace(/^\.\//, 'src/');
    const key = Object.keys(manifest).find((k) => k === `${base}.tsx` || k === `${base}.ts` || k === base);
    if (key) addEntry(key);
  }
  return [...files]
    .map((f) => `    <link rel="modulepreload" data-hydrate href="/${f}" crossorigin />`)
    .join('\n');
}

async function generateStaticHtmlForRoute(baseTemplate, route, renderApp, manifest) {
  const info = describeRoute(route);
  info.h1 = getPageH1(route.path) || info.h1; // same H1 source as the React PageH1 component
  const html = withHead(baseTemplate, {
    title: info.schema.title,
    description: info.schema.description,
    canonical: canonicalUrl(route.canonicalPath || route.path),
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemas: buildPageSchemas({ ...info.schema, path: route.canonicalPath || info.schema.path }),
    ogType: info.kind === 'guide' ? 'article' : 'website',
  });
  // Prefer the real React markup (hydrated in the browser, so nothing changes on load). The
  // hand-built layout is only a fallback if a route ever fails to server-render.
  let body;
  let modules = [];
  try {
    const rendered = await renderApp(route.path);
    body = rendered.html;
    modules = rendered.modules || [];
  } catch (err) {
    console.warn(`⚠️ SSR failed for ${route.path}, using static fallback: ${err.message}`);
    body = bodyFor(route, info);
  }
  const preloads = modulePreloadTags(manifest, modules);
  const withPreloads = preloads ? html.replace('</head>', `${preloads}
  </head>`) : html;
  return withPreloads.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

async function generateNotFoundHtml(baseTemplate, renderApp) {
  const html = withHead(baseTemplate, {
    title: 'Page Not Found — Nexvert',
    description: 'The page you were looking for does not exist. Browse all free Nexvert file conversion tools.',
    canonical: null,
    robots: 'noindex, follow',
    schemas: null,
  });
  const rendered = await renderApp('/404-page-not-found/').catch(() => null);
  return rendered ? html.replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`) : html;
}

async function runPrerender() {
  console.log('🚀 Starting Build-Time Pre-Rendering Pipeline...');

  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Run `vite build` before prerendering.');
    process.exit(1);
  }

  validateNavigationLinks();
  validateRouteMetadata();
  auditUniqueContent();

  for (const [src, name] of [[sitemapPublicPath, 'sitemap.xml'], [robotsPublicPath, 'robots.txt']]) {
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distDir, name));
  }

  const baseHtmlPath = path.join(distDir, 'index.html');
  let baseTemplate = fs.readFileSync(baseHtmlPath, 'utf8');

  // Preload the two Latin fonts used above the fold so they are ready at first paint; otherwise
  // the swap from the fallback font re-wraps text and causes layout shift (CLS).
  const fontFiles = fs.readdirSync(path.join(distDir, 'assets')).filter((f) => /^(inter|space-grotesk)-latin-wght-normal-.*.woff2$/.test(f));
  const fontPreloads = fontFiles
    .map((f) => `    <link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
    .join('\n');
  if (fontPreloads && !baseTemplate.includes('as="font"')) {
    baseTemplate = baseTemplate.replace('</title>', `</title>\n${fontPreloads}`);
  }

  // Real 404 page (Netlify serves dist/404.html with a 404 status for unknown URLs).
  const serverEntry = path.join(rootDir, 'dist-server', 'entry-server.js');
  if (!fs.existsSync(serverEntry)) throw new Error('dist-server/entry-server.js missing — run the SSR build before prerendering.');
  const { render: renderApp } = await import(pathToFileURL(serverEntry).href);

  const manifest = loadClientManifest();
  if (!manifest) console.warn('⚠️ dist/.vite/manifest.json not found — hydration preloads skipped.');

  fs.writeFileSync(path.join(distDir, '404.html'), await generateNotFoundHtml(baseTemplate, renderApp), 'utf8');

  console.log(`📋 Generating static pre-rendered HTML for all ${PUBLIC_ROUTES.length} routes...`);
  const seenTitles = new Map();
  let mdCount = 0;
  for (const route of PUBLIC_ROUTES) {
    const clean = cleanSlug(route.path);
    const html = await generateStaticHtmlForRoute(baseTemplate, route, renderApp, manifest);
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
    if (!title) throw new Error(`Route ${route.path} generated an empty <title>`);
    if (seenTitles.has(title)) throw new Error(`Duplicate <title> "${title}" on ${seenTitles.get(title)} and ${route.path}`);
    seenTitles.set(title, route.path);
    const target = clean ? path.join(distDir, clean, 'index.html') : baseHtmlPath;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html, 'utf8');

    // Markdown twin next to the HTML, announced in <head> by an alternate link. Skipped for
    // duplicate URLs that canonicalize elsewhere, so the .md set has no duplicates either.
    if (!route.canonicalPath) {
      fs.writeFileSync(path.join(path.dirname(target), 'index.md'), markdownForRoute(route), 'utf8');
      mdCount++;
    }
  }

  console.log(`✅ ${PUBLIC_ROUTES.length} pages pre-rendered (including the homepage) with unique titles, plus 404.html.`);
  console.log(`✅ ${mdCount} Markdown twins written (dist/<route>/index.md).`);
  process.exit(0);
}

runPrerender().catch((err) => {
  console.error('Fatal pre-rendering error:', err);
  process.exit(1);
});
