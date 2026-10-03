/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, createElement, type ComponentType } from 'react';

/**
 * React.lazy that records which modules a page actually renders. During the build the
 * pre-renderer reads this list and adds <link rel="modulepreload" data-hydrate> tags for the
 * matching chunks, and main.tsx waits for them before hydrating. Without that, React throws
 * away the pre-rendered HTML while a lazy chunk loads, which makes the page flash.
 *
 * The id is recorded on render (not when the module loads), because React caches a loaded
 * lazy module and would not call the factory again for later routes.
 */
const usedModules = new Set<string>();

export function getUsedModules(): string[] {
  return [...usedModules];
}

export function clearUsedModules(): void {
  usedModules.clear();
}

export function lazyTracked<T extends ComponentType<any>>(id: string, factory: () => Promise<{ default: T }>) {
  const Lazy = lazy(factory);
  return function TrackedLazy(props: any) {
    usedModules.add(id);
    return createElement(Lazy, props);
  } as unknown as T;
}
