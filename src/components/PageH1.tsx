/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, type ReactNode } from 'react';

/** H1 text for the current URL (see config/page-heading.ts); null = use the component's own text. */
export const PageH1Context = createContext<string | null>(null);

export default function PageH1({ className, children }: { className?: string; children?: ReactNode }) {
  const routeH1 = useContext(PageH1Context);
  return <h1 className={className}>{routeH1 ?? children}</h1>;
}
