import { useLayoutEffect } from 'react';
import { SITE_NAME, SITE_URL } from '../config/site.config';
import { buildPageSchemas, canonicalUrl } from '../config/structured-data';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  faqs?: { question: string; answer: string }[];
  steps?: (string | { title?: string; text: string })[];
  breadcrumbName?: string;
  toolCategory?: string;
  h1?: string;
}

export function getCanonicalUrl(rawPath: string): string {
  return canonicalUrl(rawPath);
}

export const SCHEMA_SCRIPT_ID = 'nexvert-seo-jsonld';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/**
 * Keeps <head> in sync on client-side navigation. The pre-rendered HTML already contains the
 * same tags for the first load (see scripts/prerender.js), so crawlers without JS see them too.
 */
export default function SEOHead({ title, description, path, faqs, steps, breadcrumbName, toolCategory, h1 }: SEOHeadProps) {
  // Arrays are rebuilt on every render; depend on their serialized form instead.
  const contentKey = JSON.stringify([faqs || [], steps || []]);

  useLayoutEffect(() => {
    const url = canonicalUrl(path);
    document.title = title;
    setMeta('name', 'description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', /\/guides\/.+/.test(url) ? 'article' : 'website');
    setMeta('property', 'og:image', OG_IMAGE);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', `${SITE_NAME} — free online file converter`);
    setMeta('property', 'og:locale', 'en_US');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', OG_IMAGE);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    const schemas = buildPageSchemas({
      path,
      title,
      description,
      h1,
      toolName: breadcrumbName,
      category: toolCategory,
      faqs,
      steps,
      isTool: Boolean(toolCategory),
    });

    // Replace any JSON-LD from the pre-rendered HTML so there is exactly one graph per page.
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
    const script = document.createElement('script');
    script.id = SCHEMA_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, breadcrumbName, toolCategory, h1, contentKey]);

  return null;
}
