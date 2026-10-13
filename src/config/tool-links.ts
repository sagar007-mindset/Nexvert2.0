/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Link helpers for tool cards and "related tools" lists.
//
// A few tools are registered twice: an alias route (e.g. /color-picker/) whose page declares a
// canonical pointing at the real tool (/image-color-picker/). Linking to the alias wastes crawl
// budget on a page Google is told not to index, and showing both in one list renders two cards
// for the same tool. Every list that links tools should go through these helpers.

import { CONVERTER_TOOLS, type ConverterToolConfig } from './converters.config';
import { PUBLIC_ROUTES } from './routes.config';

const norm = (route: string): string => {
  const clean = String(route || '').replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}/` : '/';
};

/** Alias route -> canonical route, from the routes registry (entries with `canonicalPath`). */
const ALIAS_TO_CANONICAL = new Map(
  PUBLIC_ROUTES.filter((r) => r.canonicalPath).map((r) => [norm(r.path), norm(r.canonicalPath as string)])
);

const TOOL_BY_ROUTE = new Map(Object.values(CONVERTER_TOOLS).map((t) => [norm(t.route), t]));

/** True when this tool's own route is only an alias of another tool's page. */
export function isAliasTool(tool: ConverterToolConfig): boolean {
  return ALIAS_TO_CANONICAL.has(norm(tool.route));
}

/** The tool whose page is canonical for this one (itself, unless it is an alias). */
export function canonicalTool(tool: ConverterToolConfig): ConverterToolConfig {
  const target = ALIAS_TO_CANONICAL.get(norm(tool.route));
  return (target && TOOL_BY_ROUTE.get(target)) || tool;
}

/** Canonical href for a tool, always with a trailing slash so it needs no redirect hop. */
export function toolHref(tool: ConverterToolConfig): string {
  return norm(canonicalTool(tool).route);
}

/**
 * Resolves related-tool ids to canonical tools: aliases become the real tool, duplicates are
 * dropped, and the current tool (or its canonical twin) is excluded.
 */
export function resolveRelatedTools(ids: string[] | undefined, self: ConverterToolConfig): ConverterToolConfig[] {
  const selfRoute = toolHref(self);
  const seen = new Set<string>([selfRoute]);
  const out: ConverterToolConfig[] = [];
  for (const id of ids || []) {
    const t = CONVERTER_TOOLS[id];
    if (!t) continue;
    const c = canonicalTool(t);
    const href = norm(c.route);
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(c);
  }
  return out;
}
