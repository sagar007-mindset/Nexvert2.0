/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single source of truth for site-wide branding, canonical domain, and contact emails.
 */
export const SITE_NAME = 'Nexvert';
export const SITE_URL = 'https://nexvert.online';
export const SITE_CANONICAL_DOMAIN = SITE_URL;
export const SUPPORT_EMAIL = 'support@nexvert.online';
export const MEDIA_EMAIL = 'media@nexvert.online';
export const BLOG_URL = 'https://nexvert.online/guides/';

/**
 * Date of the last significant content update, used as <lastmod> in sitemap.xml and as
 * dateModified in structured data. Bump it when page content changes meaningfully.
 */
export const SITE_LAST_UPDATED = '2026-10-01';

/** IndexNow key (Bing, Yandex, Seznam…). The key file public/<key>.txt is written at build time. */
export const INDEXNOW_KEY = '7cab152dd365f43ef1e7a4608cab0eab';

/**
 * Real-world identity for the Organization entity in JSON-LD.
 *
 * Why this matters: answer engines (ChatGPT, Perplexity, Gemini, Claude) resolve a site to a
 * real-world *entity* before they are willing to cite it. A site with no verifiable profiles,
 * no named operator and no corroborating pages elsewhere on the web reads as anonymous, and
 * anonymous sources lose to named ones when the model picks whom to cite.
 *
 * Fill these in with URLs you actually control. `sameAs` entries are omitted from the schema
 * when the list is empty, so leaving it blank is safe but forfeits the entity signal.
 */
export const SOCIAL_PROFILES: string[] = [
  // Owner account; display name is "Nexvert". Verified public 2026-10-01.
  'https://github.com/sagar007-mindset',
  // Switched 2026-10-03 from the older sagar007-mindset/Nexvert repo, which holds only a zip
  // and a stub README. Nexvert2.0 is the repo that actually carries the source and deploys to
  // Vercel, so it is the one worth corroborating the entity against.
  'https://github.com/sagar007-mindset/Nexvert2.0',
  // Added 2026-10-02 per the site owner. Both reachable (HTTP 200) as of that date.
  // Threads uses threads.com (the canonical domain threads.net now redirects to), not .net.
  'https://x.com/NexvertOnline',
  'https://www.threads.com/@nexvert.online',
  // Add as they are created — each one is an independent corroboration of the same entity:
  // 'https://www.producthunt.com/products/<handle>',
  // 'https://www.linkedin.com/company/<handle>/',
];

/**
 * Endpoint the contact form POSTs to.
 *
 * On Netlify this was handled by Netlify Forms (`data-netlify="true"`), which intercepted a POST
 * to "/" and stored the submission. Vercel has no equivalent, and a static host answering that
 * POST with a 200 would make the form report success while discarding the message — so when this
 * is empty the form falls back to opening the visitor's email client instead of pretending to
 * send. Silent loss of a contact message is far worse than an obvious fallback.
 *
 * To restore a real submit flow, set this to a form backend endpoint, for example a Formspree or
 * Web3Forms URL, or your own serverless function at '/api/contact'. It must accept a POST and
 * return a 2xx on success.
 */
export const CONTACT_FORM_ENDPOINT = '';

/** Canonical URLs for the visible social links rendered in the footer and About page. */
export const SOCIAL_LINKS = {
  x: { url: 'https://x.com/NexvertOnline', label: 'X (Twitter)' },
  threads: { url: 'https://www.threads.com/@nexvert.online', label: 'Threads' },
  github: { url: 'https://github.com/sagar007-mindset/Nexvert2.0', label: 'GitHub' },
};

/** Person or company publicly accountable for the site (E-E-A-T). Leave name blank to omit. */
export const SITE_OPERATOR = {
  /**
   * The person publicly accountable for the site. The Organization is Nexvert (SITE_NAME); this
   * is the human behind it, emitted as `founder` on the Organization node.
   *
   * A surname would make this a stronger entity signal — "Ayaan" alone is hard for an engine to
   * resolve to one person — so add one here if you are willing to publish it.
   */
  name: 'Ayaan',
  /** 'Organization' for a company/brand, 'Person' for a solo maintainer. */
  type: 'Person' as 'Organization' | 'Person',
  /** ISO 3166-1 alpha-2 country code of the operator, e.g. 'PK', 'US', 'GB'. */
  country: '',
  /** Year the site went live. */
  foundingYear: '2025',
};

/** Topics the site is authoritative about — grounds the entity for AI answer engines. */
export const KNOWS_ABOUT = [
  'File conversion',
  'PDF editing',
  'Image compression',
  'Audio conversion',
  'Video conversion',
  'WebAssembly',
  'Client-side file processing',
  'Data privacy',
];
