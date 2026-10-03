/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// One H1 per URL, shared by the React app (PageH1) and scripts/prerender.js. Tool components
// are reused across several URLs (e.g. /mov-to-mp4/ and /video-converter/), so their H1 must
// come from the route, not from the component, to match each page's own keyword.

import { CONVERSION_PAGES, isImageLandingPage } from './conversions.config';
import { CONVERTER_TOOLS } from './converters.config';
import { GUIDES_DATA } from './guides.config';
import { findRouteConfig } from './routes.config';
import { HOME_H1 } from './home-content';

const HUB_TOOL_IDS = new Set(['pdf-tools', 'developer-tools']);

export function getPageH1(path: string): string | null {
  const slug = String(path || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  if (!slug) return HOME_H1;

  if (slug.startsWith('guides/')) {
    const guide = GUIDES_DATA[slug.replace('guides/', '')];
    if (guide) return guide.h1;
  }

  const landing = CONVERSION_PAGES[slug];
  if (landing && isImageLandingPage(landing)) return landing.h1;

  const tool = CONVERTER_TOOLS[slug];
  if (tool && !HUB_TOOL_IDS.has(slug)) return tool.title;

  const route = findRouteConfig(slug);
  return route ? route.title.split(/\s[—–|]\s/)[0].trim() : null;
}
