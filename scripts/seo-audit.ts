import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_ROUTES } from '../src/config/routes.config.ts';
import { CONVERTER_TOOLS } from '../src/config/converters.config.ts';
import { CONVERSION_PAGES } from '../src/config/conversions.config.ts';
import { GUIDES_DATA } from '../src/config/guides.config.ts';
import { MASTER_UNIQUE_CONTENT } from '../src/config/unique-tool-content.ts';
import { NO_TOOL_CONTENT } from '../src/config/page-content.ts';
import { SITE_LAST_UPDATED, SITE_URL } from '../src/config/site.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const normalize = (value: string) => {
  if (!value || value === '/') return '/';
  const clean = value.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/` : '/';
};

const errors: string[] = [];
const warnings: string[] = [];

const routesByPath = new Map<string, (typeof PUBLIC_ROUTES)[number]>();
const titles = new Map<string, string>();
const descriptions = new Map<string, string>();

for (const route of PUBLIC_ROUTES) {
  const canonical = normalize(route.path);
  if (routesByPath.has(canonical)) errors.push(`Duplicate canonical route: ${canonical}`);
  routesByPath.set(canonical, route);

  if (!route.title?.trim()) errors.push(`Missing title: ${route.path}`);
  if (!route.description?.trim()) errors.push(`Missing description: ${route.path}`);
  if (titles.has(route.title)) errors.push(`Duplicate title: "${route.title}" on ${titles.get(route.title)} and ${route.path}`);
  else titles.set(route.title, route.path);
  if (descriptions.has(route.description)) warnings.push(`Duplicate description: ${route.path} and ${descriptions.get(route.description)}`);
  else descriptions.set(route.description, route.path);

  if (route.title.length < 25 || route.title.length > 75) warnings.push(`Title length ${route.title.length} chars: ${route.path}`);
  if (route.description.length < 60 || route.description.length > 180) warnings.push(`Description length ${route.description.length} chars: ${route.path}`);
}

for (const [id, tool] of Object.entries(CONVERTER_TOOLS)) {
  const route = normalize(tool.route);
  const canonicalRoute = id === 'image-converter' ? '/' : route;
  if (!routesByPath.has(canonicalRoute)) errors.push(`Converter missing from PUBLIC_ROUTES: ${id} -> ${tool.route} (canonical: ${canonicalRoute})`);
  for (const related of tool.relatedToolIds ?? []) {
    if (!CONVERTER_TOOLS[related]) errors.push(`Broken relatedToolId: ${id} -> ${related}`);
  }
}

for (const route of PUBLIC_ROUTES.filter(r => r.includeInSitemap !== false)) {
  const clean = normalize(route.path).replace(/^\//, '').replace(/\/$/, '');
  if (!clean) continue;
  // Tools, landing pages, guides, hubs (MASTER_UNIQUE_CONTENT) and info pages with their own components.
  const hasSpecificContent = Boolean(CONVERTER_TOOLS[clean] || CONVERSION_PAGES[clean] || MASTER_UNIQUE_CONTENT[clean] || NO_TOOL_CONTENT.has(clean) || (clean.startsWith('guides/') && GUIDES_DATA[clean.replace('guides/', '')]));
  if (!hasSpecificContent) warnings.push(`No dedicated config/content entry for ${route.path}; review for thin-content/indexability risk.`);
}

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const seoHead = fs.readFileSync(path.join(root, 'src/components/SEOHead.tsx'), 'utf8');
const prerender = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');

if (/aggregateRating/i.test(indexHtml) || /aggregateRating/i.test(seoHead) || /aggregateRating/i.test(prerender)) {
  errors.push('Fabricated/unsupported AggregateRating schema is still present.');
}
if (/(?:@type['\"]\s*:\s*['\"]SearchAction|['\"]@type['\"]\s*:\s*['\"]SearchAction)/i.test(indexHtml + seoHead + prerender)) {
  warnings.push('SearchAction schema exists; verify a real site-search endpoint before keeping it.');
}
if (/meta name=["']keywords["']/i.test(indexHtml)) warnings.push('Legacy meta keywords remain in index.html.');
if (!/rel=["']canonical["']/i.test(indexHtml)) errors.push('index.html is missing a canonical link.');
if (!/meta name=["']description["']/i.test(indexHtml)) errors.push('index.html is missing a meta description.');
if (!fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8').includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  warnings.push('robots.txt does not advertise the canonical sitemap URL.');
}

// Hand-maintained files that cannot import SITE_URL (static HTML, plain text, plain-JS scripts)
// carry their own copy of the domain. If SITE_URL changes and one of these is missed, a page
// ends up declaring a canonical on the wrong host, which search engines treat as a conflicting
// signal. Flag any URL on this site's apex or www origin that is not SITE_URL itself. Email
// addresses and social handles are not matched because they have no `http(s)://` prefix.
{
  const handMaintained = [
    'index.html',
    'public/robots.txt',
    'public/.well-known/security.txt',
    'scripts/generate-agent-skills.cjs',
    'scripts/generate-sitemap.js',
    'README.md',
  ];
  for (const rel of handMaintained) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    const stray = [...new Set([...text.matchAll(/https?:\/\/(?:www\.)?nexvert\.online/g)].map((m) => m[0]))].filter((o) => o !== SITE_URL);
    if (stray.length) errors.push(`${rel} references ${stray.join(', ')} but SITE_URL is ${SITE_URL}.`);
  }
}

// Content Signals (https://contentsignals.org/). Checked per group, not once: under RFC 9309 a
// crawler obeys only the most specific group matching its name, so a signal that appears only
// under "User-agent: *" is invisible to any agent that has its own group.
{
  const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
  const groups = robots
    .split(/\n(?=User-agent:)/i)
    .filter((block) => /^User-agent:/i.test(block.trim()));
  const missing = groups
    .filter((block) => !/^Content-Signal:/im.test(block))
    .map((block) => (block.match(/^User-agent:\s*(\S+)/i) || [, '?'])[1]);

  if (!groups.length) {
    errors.push('robots.txt declares no User-agent groups.');
  } else if (missing.length) {
    warnings.push(`robots.txt groups without a Content-Signal directive: ${missing.join(', ')}`);
  }
  // ai-input governs whether answer engines may use the site for generative answers, which is
  // the whole point of the GEO work. Flag it loudly if it is ever switched off.
  if (/ai-input\s*=\s*no/i.test(robots)) {
    warnings.push('robots.txt sets ai-input=no, which asks AI answer engines not to cite this site.');
  }
}

// Every sitemap entry shares one <lastmod>: SITE_LAST_UPDATED, bumped by hand. That is honest
// while it is true, and a lie the moment content changes without it being bumped — and Google
// ignores lastmod entirely once it stops trusting it. Rather than invent per-page dates (which
// would claim every page changed on every deploy, which is worse), fingerprint the files that
// actually hold page copy and warn when they move but the date does not.
{
  const contentFiles = fs
    .readdirSync(path.join(root, 'src/config'))
    .filter((f) => /^(routes\.config|converters\.config|conversions\.config|guides\.config|home-content|unique-.*)\.ts$/.test(f))
    .sort();

  const hash = crypto
    .createHash('sha256')
    .update(contentFiles.map((f) => fs.readFileSync(path.join(root, 'src/config', f), 'utf8')).join('\u0000'))
    .digest('hex')
    .slice(0, 16);

  const stampPath = path.join(root, 'scripts/.content-stamp.json');
  let previous: { hash?: string; lastUpdated?: string } = {};
  try {
    previous = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
  } catch {
    previous = {};
  }

  // Only warn when the date is actually stale. Content edited today while SITE_LAST_UPDATED
  // already reads today is correct, not a problem — warning there would fire on every
  // subsequent build of the same day and teach everyone to ignore the warning.
  const today = new Date().toISOString().slice(0, 10);
  if (
    previous.hash &&
    previous.hash !== hash &&
    previous.lastUpdated === SITE_LAST_UPDATED &&
    SITE_LAST_UPDATED < today
  ) {
    warnings.push(
      `Page content changed since the last build but SITE_LAST_UPDATED is still ${SITE_LAST_UPDATED} ` +
        `(today is ${today}). Bump it in src/config/site.config.ts so <lastmod> stays truthful.`
    );
  }

  fs.writeFileSync(stampPath, JSON.stringify({ hash, lastUpdated: SITE_LAST_UPDATED }, null, 2) + '\n', 'utf8');
}

const navbar = fs.readFileSync(path.join(root, 'src/components/Navbar.tsx'), 'utf8');
const navbarModes = [...navbar.matchAll(/mode:\s*[\"']([^\"']+)[\"']/g)].map(m => m[1]);
const publicRouteModes = new Set(PUBLIC_ROUTES.map((route) => normalize(route.path).replace(/^\//, '').replace(/\/$/, '')).filter(Boolean));
for (const mode of [...new Set(navbarModes)]) {
  if (mode !== 'developer-tools' && mode !== 'utilities' && !CONVERTER_TOOLS[mode] && !publicRouteModes.has(mode)) {
    errors.push(`Navbar contains unknown tool mode: ${mode}`);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const sitemapSet = new Set(sitemapLocs);
const expectedSitemap = PUBLIC_ROUTES.filter(r => r.includeInSitemap !== false).map(r => `${SITE_URL}${normalize(r.path)}`);
for (const url of expectedSitemap) if (!sitemapSet.has(url)) warnings.push(`Current public sitemap is missing ${url}; regenerate during build.`);

console.log('SEO AUDIT');
console.log(`Routes: ${PUBLIC_ROUTES.length}`);
console.log(`Converter configs: ${Object.keys(CONVERTER_TOOLS).length}`);
console.log(`Indexable sitemap routes: ${expectedSitemap.length}`);
console.log(`SEO errors: ${errors.length}`);
console.log(`SEO warnings: ${warnings.length}`);
for (const warning of warnings.slice(0, 80)) console.warn(`⚠️ ${warning}`);
if (warnings.length > 80) console.warn(`⚠️ ...and ${warnings.length - 80} more warnings.`);
if (errors.length) {
  for (const error of errors) console.error(`❌ ${error}`);
  process.exit(1);
}
console.log('✅ SEO source audit passed.');
