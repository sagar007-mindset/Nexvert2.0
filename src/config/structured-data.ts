/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// JSON-LD builder shared by SEOHead (runtime) and scripts/prerender.js (static HTML), so both
// emit identical structured data. Only describes content that is visible on the page.

import { GUIDES_DATA } from './guides.config';
import {
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  SITE_LAST_UPDATED,
  SOCIAL_PROFILES,
  SITE_OPERATOR,
  KNOWS_ABOUT,
} from './site.config';

export interface SchemaInput {
  path: string;
  title: string;
  description: string;
  h1?: string;
  toolName?: string;
  category?: string;
  faqs?: { question: string; answer: string }[];
  /** A step is either plain text or a titled step; titles become HowToStep.name. */
  steps?: (string | { title?: string; text: string })[];
  isTool?: boolean;
}

export const CATEGORY_HUBS: Record<string, { name: string; path: string; appCategory: string }> = {
  'PDF & Document': { name: 'PDF & Document Tools', path: '/pdf-tools/', appCategory: 'BusinessApplication' },
  Image: { name: 'Image Tools', path: '/image-tools/', appCategory: 'MultimediaApplication' },
  GIF: { name: 'Image Tools', path: '/image-tools/', appCategory: 'MultimediaApplication' },
  Audio: { name: 'Audio Tools', path: '/audio-tools/', appCategory: 'MultimediaApplication' },
  Video: { name: 'Video Tools', path: '/video-tools/', appCategory: 'MultimediaApplication' },
  Archive: { name: 'Archive Tools', path: '/archive-tools/', appCategory: 'UtilitiesApplication' },
  Compression: { name: 'Compression Tools', path: '/compression-tools/', appCategory: 'UtilitiesApplication' },
  Developer: { name: 'Developer Tools', path: '/developer-tools/', appCategory: 'DeveloperApplication' },
  Utilities: { name: 'Utilities', path: '/utilities/', appCategory: 'UtilitiesApplication' },
  Tools: { name: 'All Tools', path: '/tools/', appCategory: 'UtilitiesApplication' },
};

/**
 * Real publication date for a guide, taken from GUIDES_DATA (e.g. 'July 18, 2026') and returned
 * as ISO. Resolved here rather than passed in by callers so the pre-rendered HTML and the
 * hydrated client produce byte-identical JSON-LD without every call site having to remember it.
 */
function guideDatePublished(path: string): string | undefined {
  const slug = String(path || '').replace(/^\/+|\/+$/g, '');
  if (!slug.startsWith('guides/')) return undefined;
  const guide = GUIDES_DATA[slug.replace('guides/', '')];
  if (!guide?.date) return undefined;
  // Parsed by hand rather than via Date/toISOString: 'July 18, 2026' parses as LOCAL midnight,
  // and converting that to UTC shifts the date back a day in any timezone east of UTC.
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(guide.date.trim());
  if (!m) return undefined;
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'];
  const mi = months.indexOf(m[1].toLowerCase());
  if (mi < 0) return undefined;
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

/**
 * A guide's FAQs, resolved here for the same reason as its publication date: guides render
 * through a generic SEOHead that carries no per-guide data, so without this the FAQs written in
 * GUIDES_DATA never reach the schema on either the server or the client. Resolving centrally
 * also keeps the pre-rendered and hydrated JSON-LD byte-identical.
 */
function guideFaqs(path: string): { question: string; answer: string }[] | undefined {
  const slug = String(path || '').replace(/^\/+|\/+$/g, '');
  if (!slug.startsWith('guides/')) return undefined;
  const faqs = GUIDES_DATA[slug.replace('guides/', '')]?.faqs;
  return faqs?.length ? faqs : undefined;
}

export function canonicalUrl(path: string): string {
  const clean = String(path || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  return clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`;
}

// Answer engines resolve a site to a real-world entity before citing it, so the Organization
// node carries every verifiable identity signal that is actually configured. Empty values are
// omitted rather than emitted blank, because an empty sameAs/founder is worse than none.
const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: 'Nexvert File Converter',
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
  image: `${SITE_URL}/og-image.png`,
  description: 'Nexvert makes free, browser-based file converters and utilities for PDF, image, audio, video, archive and developer data.',
  slogan: 'Convert files in your browser — nothing is uploaded.',
  email: SUPPORT_EMAIL,
  foundingDate: SITE_OPERATOR.foundingYear,
  knowsAbout: KNOWS_ABOUT,
  areaServed: 'Worldwide',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SUPPORT_EMAIL,
    availableLanguage: ['en'],
  },
  ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  ...(SITE_OPERATOR.name
    ? { founder: { '@type': SITE_OPERATOR.type, name: SITE_OPERATOR.name } }
    : {}),
  ...(SITE_OPERATOR.country
    ? { address: { '@type': 'PostalAddress', addressCountry: SITE_OPERATOR.country } }
    : {}),
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ['Nexvert File Converter', 'nexvert.online'],
  url: `${SITE_URL}/`,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export function buildPageSchemas(input: SchemaInput): Record<string, unknown> {
  const url = canonicalUrl(input.path);
  const isHome = url === `${SITE_URL}/`;
  const isGuide = /\/guides\/.+/.test(url);
  const hub = input.category ? CATEGORY_HUBS[input.category] : undefined;
  const graph: Record<string, unknown>[] = [ORGANIZATION, WEBSITE];

  graph.push({
    '@type': isGuide ? 'Article' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.title,
    headline: input.h1 || input.title,
    description: input.description,
    inLanguage: 'en',
    dateModified: SITE_LAST_UPDATED,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    ...(isGuide
      ? {
          author: { '@id': `${SITE_URL}/#organization` },
          publisher: { '@id': `${SITE_URL}/#organization` },
          ...(guideDatePublished(input.path) ? { datePublished: guideDatePublished(input.path) } : {}),
        }
      : {}),
    ...(!isHome ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
  });

  if (isHome || input.isTool) {
    graph.push({
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: isHome ? `${SITE_NAME} File Converter` : input.toolName || input.title,
      url,
      description: input.description,
      applicationCategory: hub?.appCategory || 'UtilitiesApplication',
      operatingSystem: 'Any (runs in a web browser)',
      browserRequirements: 'Requires a modern browser with JavaScript and WebAssembly enabled.',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    });
  }

  if (!isHome) {
    const crumbs: { name: string; item: string }[] = [{ name: 'Home', item: `${SITE_URL}/` }];
    if (isGuide) crumbs.push({ name: 'Guides', item: `${SITE_URL}/guides/` });
    else if (hub && canonicalUrl(hub.path) !== url) crumbs.push({ name: hub.name, item: canonicalUrl(hub.path) });
    crumbs.push({ name: input.toolName || input.h1 || input.title, item: url });
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
    });
  }

  if (input.steps && input.steps.length >= 2) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: `How to use ${input.toolName || input.title}`,
      description: `Step-by-step instructions for ${input.toolName || input.title} on ${SITE_NAME}.`,
      // No totalTime: it genuinely varies from milliseconds (text tools) to minutes (video
      // re-encoding), and a single invented figure applied to every tool would be a false claim.
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
      // A named step extracts far more cleanly into an AI answer than a bare sentence.
      step: input.steps.map((s, i) => {
        const text = typeof s === 'string' ? s : s.text;
        const title = typeof s === 'string' ? undefined : s.title;
        return {
          '@type': 'HowToStep',
          position: i + 1,
          // A generic "Step 3" name is noise: omit it so the text is what gets extracted.
          ...(title && !/^step\s*\d+$/i.test(title.trim()) ? { name: title } : {}),
          text,
          // No per-step `url`: the page renders no id="step-N" anchors, so such a URL would
          // point at a fragment that does not exist. Add the anchors first if deep links are wanted.
        };
      }),
    });
  }

  // Tool pages pass their FAQs in; guides have theirs resolved from GUIDES_DATA.
  const faqs = input.faqs?.length ? input.faqs : guideFaqs(input.path);
  if (faqs && faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
